import type { Express } from "express";
import { validateBody, validateParams } from "../middleware/validation";
import { validatePlayerAccess, validateUsername } from "../middleware/auth";
import { NotFoundError, InsufficientResourcesError, InvalidOperationError } from "../middleware/error-handler";
import { successResponse, errorResponse } from "../utils/response-helpers";
import { gameCache, CACHE_KEYS, CACHE_TTL, cacheGetOrSet, invalidatePlayerCache, invalidateStorageCache, invalidateInventoryCache } from "../cache/memory-cache";
import {
  updatePlayerSettingsSchema,
  consumeItemSchema,
  startExpeditionSchema,
  craftItemSchema,
  transferItemSchema,
  equipItemSchema,
  paginationQuerySchema,
  resourceFilterSchema
} from "../schemas/game-schemas";
import { usernameParamSchema, playerIdParamSchema, idParamSchema } from "../middleware/validation";
import type { IStorage } from "../storage";
import { GameService } from "../services/game-service";
import { ExpeditionService } from "../services/expedition-service";
import { RESOURCE_IDS, EQUIPMENT_IDS, BIOME_IDS, RECIPE_IDS } from "@shared/constants/game-ids";

export function registerEnhancedGameRoutes(
  app: Express, 
  storage: IStorage,
  gameService: GameService,
  expeditionService: ExpeditionService
) {

  // Enhanced player routes with validation and caching
  app.get("/api/v2/player/:username", 
    validateParams(usernameParamSchema),
    validateUsername,
    async (req, res, next) => {
      try {
        const { username } = req.params;

        const player = await cacheGetOrSet(
          `player:username:${username}`,
          () => storage.getPlayerByUsername(username),
          CACHE_TTL.PLAYER_DATA
        );

        if (!player) {
          throw new NotFoundError("Player");
        }

        successResponse(res, player);
      } catch (error) {
        next(error);
      }
    }
  );

  // Enhanced player settings update
  app.patch("/api/v2/player/:playerId/settings",
    validateParams(playerIdParamSchema),
    validateBody(updatePlayerSettingsSchema),
    validatePlayerAccess,
    async (req, res, next) => {
      try {
        const { playerId } = req.params;
        const updates = req.body;

        const player = await storage.getPlayer(playerId);
        if (!player) {
          throw new NotFoundError("Player");
        }

        const updatedPlayer = await storage.updatePlayer(playerId, updates);

        // Invalidate player cache
        invalidatePlayerCache(playerId);

        successResponse(res, updatedPlayer, "Settings updated successfully");
      } catch (error) {
        next(error);
      }
    }
  );

  // Enhanced resource listing with filtering and caching
  app.get("/api/v2/resources",
    async (req, res, next) => {
      try {
        // Parse query filters
        const filters = resourceFilterSchema.safeParse(req.query);
        const cacheKey = filters.success 
          ? `${CACHE_KEYS.ALL_RESOURCES}:${JSON.stringify(filters.data)}`
          : CACHE_KEYS.ALL_RESOURCES;

        const resources = await cacheGetOrSet(
          cacheKey,
          async () => {
            const allResources = await storage.getAllResources();

            if (!filters.success) return allResources;

            // Apply filters
            return allResources.filter(resource => {
              const { type, rarity, category } = filters.data;

              if (type && resource.type !== type) return false;
              if (rarity && resource.rarity !== rarity) return false;
              // Add category filtering logic if needed

              return true;
            });
          },
          CACHE_TTL.STATIC_DATA
        );

        successResponse(res, resources);
      } catch (error) {
        next(error);
      }
    }
  );

  // Enhanced crafting with comprehensive validation
  app.post("/api/v2/craft",
    validateBody(craftItemSchema),
    async (req, res, next) => {
      try {
        const { playerId, recipeId, quantity } = req.body;

        // Validate player exists
        const player = await storage.getPlayer(playerId);
        if (!player) {
          throw new NotFoundError("Player");
        }

        // Get recipe with caching
        const recipe = await cacheGetOrSet(
          CACHE_KEYS.RECIPE_BY_ID(recipeId),
          () => storage.getRecipe(recipeId),
          CACHE_TTL.STATIC_DATA
        );

        if (!recipe) {
          throw new NotFoundError("Recipe");
        }

        // Check level requirement
        if (player.level < recipe.requiredLevel) {
          throw new InvalidOperationError(
            `Level ${recipe.requiredLevel} required to craft ${recipe.name}`
          );
        }

        // Check and consume ingredients from storage
        const playerStorage = await storage.getPlayerStorage(playerId);

        // Handle recipe ingredients - check if it's array or object format
        let ingredients: Record<string, number> = {};

        if (Array.isArray(recipe.ingredients)) {
          // Convert array format to object format
          for (const ingredient of recipe.ingredients) {
            ingredients[ingredient.itemId] = ingredient.quantity;
          }
        } else if (typeof recipe.ingredients === 'object' && recipe.ingredients.ingredients !== null) {
          ingredients = recipe.ingredients as Record<string, number>;
        } else {
          throw new InvalidOperationError(`Recipe ${recipe.name} has no valid ingredients defined`);
        }

        for (const [ingredientId, requiredAmount] of Object.entries(ingredients)) {
          const totalRequired = requiredAmount * quantity;
          const available = playerStorage.find(item => item.resourceId === ingredientId)?.quantity || 0;

          if (available < totalRequired) {
            const resource = await storage.getResource(ingredientId);
            throw new InsufficientResourcesError(
              `${resource?.name || 'Resource'} (need ${totalRequired}, have ${available})`
            );
          }
        }

        // Perform crafting (consume ingredients)
        for (const [ingredientId, requiredAmount] of Object.entries(ingredients)) {
          const totalRequired = requiredAmount * quantity;
          const storageItem = playerStorage.find(item => item.resourceId === ingredientId);

          if (storageItem) {
            await storage.updateStorageItem(storageItem.id, {
              quantity: storageItem.quantity - totalRequired
            });
          }
        }

        // Handle special crafting: Water Tank Unlock
        const isBarrelCrafting = recipe.id === RECIPE_IDS.BARRIL_IMPROVISADO;

        if (isBarrelCrafting) {
          // Instead of adding barrel to inventory/storage, unlock a water tank
          const updatedPlayer = await storage.updatePlayer(playerId, {
            waterTanks: player.waterTanks + quantity, // Each barrel crafted unlocks one tank
            maxWaterStorage: player.maxWaterStorage + (50 * quantity) // Each barrel adds 50 capacity
          });

          return res.json({
            message: `${quantity} Barril(s) criado(s) com sucesso! ${quantity} novo(s) tanque(s) de água desbloqueado(s). Capacidade total: ${updatedPlayer.maxWaterStorage} unidades.`,
            player: updatedPlayer,
            tanksUnlocked: updatedPlayer.waterTanks,
            barrelsCrafted: quantity
          });
        }

        // Add crafted items to storage (always storage as per requirement)
        let outputs: Record<string, number> = {};
        const items = [];

        if (!isBarrelCrafting) {
          // Handle recipe outputs - check if it's array or object format
          if (Array.isArray(recipe.outputs)) {
            // Convert array format to object format
            for (const output of recipe.outputs) {
              outputs[output.itemId] = output.quantity;
            }
          } else if (typeof recipe.outputs === 'object' && recipe.outputs !== null) {
            outputs = recipe.outputs as Record<string, number>;
          } else {
            throw new InvalidOperationError(`Recipe ${recipe.name} has no valid outputs defined`);
          }

          for (const [itemId, baseAmount] of Object.entries(outputs)) {
            const totalAmount = baseAmount * quantity;

            // Always add to storage (items craftados sempre vão para o armazém)
            // Check if this is equipment or resource
            const allResources = await storage.getAllResources();
            const allEquipment = await storage.getAllEquipment();

            const isResource = allResources.some(r => r.id === itemId);
            const isEquipment = allEquipment.some(eq => eq.id === itemId);
            const itemType = isEquipment ? 'equipment' : 'resource';

            // Refresh player storage to get current state
            const currentStorage = await storage.getPlayerStorage(playerId);
            const existingItem = currentStorage.find(item => 
              item.resourceId === itemId && item.itemType === itemType
            );

            if (existingItem) {
              await storage.updateStorageItem(existingItem.id, {
                quantity: existingItem.quantity + totalAmount
              });
            } else {
              // Create new storage item to avoid foreign key issues
              await storage.addStorageItem({
                playerId,
                resourceId: itemId,
                quantity: totalAmount,
                itemType
              });
            }

            // Log for debugging
            const itemName = isResource 
              ? allResources.find(r => r.id === itemId)?.name 
              : allEquipment.find(e => e.id === itemId)?.name;
            console.log(`DEBUG: Crafted ${totalAmount}x ${itemName} (${itemType}) with ID ${itemId} added to storage for player ${playerId}`);

            items.push({ itemId, quantity: totalAmount });
          }
        }

        // Update quest progress for crafting (only for active quests)
        // CRITICAL FIX: Multiply quest progress by quantity to count all crafted items
        const activeQuests = await storage.getPlayerQuests(playerId);
        const activePlayerQuests = activeQuests.filter(pq => pq.status === 'active');

        for (const [craftedItemId, craftedAmount] of Object.entries(outputs || {})) {
          const totalCraftedAmount = (craftedAmount as number) * quantity; // This is the total amount crafted

          for (const playerQuest of activePlayerQuests) {
            const quest = await storage.getQuest(playerQuest.questId);
            if (quest) {
              const objectives = quest.objectives as any[];

              for (const objective of objectives) {
                if (objective.type === 'craft' && (objective.itemId === craftedItemId || objective.resourceId === craftedItemId)) {
                  // Use the same progress key format as quest-service.ts
                  const progressKey = objective.type + '_' + (objective.resourceId || objective.itemId || objective.target);
                  const currentProgressObj = (playerQuest.progress as any)?.[progressKey] || { current: 0 };
                  const currentProgress = currentProgressObj.current || 0;
                  const required = objective.quantity || objective.amount || 1;
                  const newProgress = Math.min(currentProgress + totalCraftedAmount, required);

                  console.log(`[CRAFT QUEST] Quest ${quest.name} progress update: ${progressKey} from ${currentProgress} to ${newProgress} (added ${totalCraftedAmount})`);

                  await storage.updatePlayerQuest(playerQuest.id, {
                    progress: {
                      ...(playerQuest.progress as any || {}),
                      [progressKey]: {
                        current: newProgress,
                        required: required,
                        completed: newProgress >= required
                      }
                    }
                  });
                }
              }
            }
          }
        }

        // CRITICAL: Invalidate ALL caches to ensure frontend sees updated data immediately
        invalidatePlayerCache(playerId);
        invalidateStorageCache(playerId);
        invalidateInventoryCache(playerId);

        successResponse(res, {
          recipe: {
            id: recipe.id,
            name: recipe.name
          },
          quantity,
          items: items || [],
          destination: 'storage'
        }, `Successfully crafted ${quantity}x ${recipe.name}`);

      } catch (error) {
        next(error);
      }
    }
  );

  // Enhanced offline resources endpoint for offline activity configuration
  app.get("/api/player/:playerId/offline-resources",
    validateParams(playerIdParamSchema),
    async (req, res, next) => {
      try {
        const { playerId } = req.params;

        const player = await storage.getPlayer(playerId);
        if (!player) {
          throw new NotFoundError("Player");
        }

        // Get all resources that can be collected
        const allResources = await storage.getAllResources();
        const playerLevel = player.level;

        // Filter resources based on player level and collection requirements
        const availableResources = [];

        for (const resource of allResources) {
          // Check level requirement
          if (resource.requiredLevel && resource.requiredLevel > playerLevel) {
            continue;
          }

          // Check if player has required tools
          const hasTools = await gameService.hasRequiredTool(playerId, resource.id);
          if (!hasTools) {
            continue;
          }

          // Check if resource can be collected (has collection requirements or is basic)
          if (resource.collectionRequirements && resource.collectionRequirements.length > 0) {
            availableResources.push({
              id: resource.id,
              name: resource.name,
              requiredLevel: resource.requiredLevel || 1,
              collectionRequirements: resource.collectionRequirements
            });
          }
        }

        successResponse(res, availableResources);
      } catch (error) {
        next(error);
      }
    }
  );

  // Enhanced expedition start with validation
  app.post("/api/v2/expeditions",
    validateBody(startExpeditionSchema),
    async (req, res, next) => {
      try {
        const { playerId, biomeId, selectedResources, selectedEquipment } = req.body;

        // Validate player exists and has sufficient stats
        const player = await storage.getPlayer(playerId);
        if (!player) {
          throw new NotFoundError("Player");
        }

        if (player.hunger < 30 || player.thirst < 30) {
          throw new InvalidOperationError("Need at least 30 hunger and thirst to start expedition");
        }

        // Validate biome exists and level requirement
        const biome = await storage.getBiome(biomeId);
        if (!biome) {
          throw new NotFoundError("Biome");
        }

        if (player.level < biome.requiredLevel) {
          throw new InvalidOperationError(
            `Level ${biome.requiredLevel} required for ${biome.name}`
          );
        }

        // Check for active expedition
        const expeditions = await storage.getPlayerExpeditions(playerId);
        const activeExpedition = expeditions.find(exp => exp.status === 'in_progress');
        if (activeExpedition) {
          throw new InvalidOperationError("Already have an active expedition");
        }

        const expedition = await expeditionService.startExpedition(
          playerId,
          biomeId,
          selectedResources,
          selectedEquipment
        );

        // Invalidate player cache
        invalidatePlayerCache(playerId);

        successResponse(res, expedition, "Expedition started successfully");
      } catch (error) {
        next(error);
      }
    }
  );

  // Enhanced item consumption with validation
  app.post("/api/v2/player/:playerId/consume",
    validateParams(playerIdParamSchema),
    validateBody(consumeItemSchema),
    validatePlayerAccess,
    async (req, res, next) => {
      try {
        const { playerId } = req.params;
        const { itemId, quantity } = req.body;

        const player = await storage.getPlayer(playerId);
        if (!player) {
          throw new NotFoundError("Player");
        }

        // Check item availability in inventory or storage
        const inventoryItems = await storage.getPlayerInventory(playerId);
        const storageItems = await storage.getPlayerStorage(playerId);

        const inventoryItem = inventoryItems.find(item => item.resourceId === itemId);
        const storageItem = storageItems.find(item => item.resourceId === itemId);

        const totalAvailable = (inventoryItem?.quantity || 0) + (storageItem?.quantity || 0);

        if (totalAvailable < quantity) {
          throw new InsufficientResourcesError("item");
        }

        // Get item details to validate it's consumable
        const resource = await storage.getResource(itemId);
        if (!resource) {
          throw new NotFoundError("Item");
        }

        // Use modern consumable validation system
        const { isConsumable: checkConsumable } = await import("../../shared/utils/consumable-utils");
        const isConsumable = checkConsumable(resource);

        if (!isConsumable) {
          throw new InvalidOperationError(`${resource.name} is not consumable`);
        }

        // Consume items (priority: inventory first, then storage)
        let remainingToConsume = quantity;

        if (inventoryItem && remainingToConsume > 0) {
          const fromInventory = Math.min(inventoryItem.quantity, remainingToConsume);
          await storage.updateInventoryItem(inventoryItem.id, {
            quantity: inventoryItem.quantity - fromInventory
          });
          remainingToConsume -= fromInventory;
        }

        if (storageItem && remainingToConsume > 0) {
          await storage.updateStorageItem(storageItem.id, {
            quantity: storageItem.quantity - remainingToConsume
          });
        }

        // Apply consumption effects (simplified)
        const updates: any = {};
        const itemName = resource.name.toLowerCase();

        if (itemName.includes('água') || itemName.includes('suco')) {
          updates.thirst = Math.min(player.maxThirst, player.thirst + (10 * quantity));
        }

        if (itemName.includes('carne') || itemName.includes('peixe') || itemName.includes('cogumelo')) {
          updates.hunger = Math.min(player.maxHunger, player.hunger + (15 * quantity));
        }

        if (Object.keys(updates).length > 0) {
          await storage.updatePlayer(playerId, updates);
        }

        // Invalidate player cache
        invalidatePlayerCache(playerId);

        successResponse(res, {
          consumed: quantity,
          item: resource.name,
          effects: updates
        }, `Consumed ${quantity}x ${resource.name}`);

      } catch (error) {
        next(error);
      }
    }
  );
    // Update player settings
  app.patch("/api/player/:playerId/settings", async (req, res) => {
    try {
      const { playerId } = req.params;
      const { autoStorage, autoCompleteQuests } = req.body;

      const updateData: any = {};
      if (autoStorage !== undefined) updateData.autoStorage = autoStorage;
      if (autoCompleteQuests !== undefined) updateData.autoCompleteQuests = autoCompleteQuests;

      const updatedPlayer = await storage.updatePlayer(playerId, updateData);

      res.json(updatedPlayer);
    } catch (error) {
      console.error("Update player settings error:", error);
      res.status(500).json({ message: "Failed to update player settings" });
    }
  });

  // Get offline activity config
  app.get('/api/player/:playerId/offline-config', (req, res) => {
    try {
      const { playerId } = req.params;
      const player = gameStorage.getPlayer(playerId);

      if (!player) {
        return res.status(404).json({ error: 'Player not found' });
      }

      res.json(player.offlineActivityConfig || {
        enabled: false,
        maxDuration: 12,
        stopOnLowResources: true,
        minHunger: 20,
        minThirst: 20,
        preferredResources: []
      });
    } catch (error) {
      console.error('Error fetching offline config:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Get available resources for offline activities
  app.get('/api/player/:playerId/offline-resources', (req, res) => {
    try {
      const { playerId } = req.params;
      const player = gameStorage.getPlayer(playerId);

      if (!player) {
        return res.status(404).json({ error: 'Player not found' });
      }

      const allResources = gameData.resources;
      const allBiomes = gameData.biomes;
      const playerInventory = gameStorage.getInventory(playerId);

      // Biomas acessíveis pelo jogador
      const accessibleBiomes = allBiomes.filter(biome => 
        biome.requiredLevel <= player.level
      );

      // Função para verificar se o jogador pode coletar um recurso
      const canCollectResource = (resource: any) => {
        if (!resource.requirements) return true;

        // Verifica requisito de nível
        if (resource.requirements.level && player.level < resource.requirements.level) {
          return false;
        }

        // Verifica requisito de ferramenta
        if (resource.requirements.tool) {
          const hasTool = playerInventory.some((item: any) => 
            item.itemId === resource.requirements.tool && item.quantity > 0
          ) || player.equippedTool === resource.requirements.tool;

          if (!hasTool) return false;
        }

        // Verifica requisito de bioma - pelo menos um bioma acessível deve estar disponível
        if (resource.requirements.biomes && resource.requirements.biomes.length > 0) {
          const hasAccessibleBiome = resource.requirements.biomes.some((biomeId: string) => 
            accessibleBiomes.some((biome: any) => biome.id === biomeId)
          );
          if (!hasAccessibleBiome) return false;
        }

        return true;
      };

      // Filtra recursos disponíveis
      const availableResources = allResources
        .filter((resource: any) => {
          // Filtra apenas recursos (não equipamentos)
          if (resource.type !== 'resource') return false;

          // Verifica se pode coletar baseado nos requisitos
          return canCollectResource(resource);
        })
        .sort((a: any, b: any) => (a.requirements?.level || 0) - (b.requirements?.level || 0));

      res.json(availableResources);
    } catch (error) {
      console.error('Error fetching offline resources:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
}
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertExpeditionSchema, updatePlayerSchema } from "@shared/types";
import { z } from "zod";
import type { Player } from "@shared/types";
import { GameService } from "./services/game-service";
import { ExpeditionService } from "./services/expedition-service";
import { QuestService } from "./services/quest-service";
import { randomUUID } from "crypto";
import { registerHealthRoutes } from "./routes/health";
import { registerEnhancedGameRoutes } from "./routes/enhanced-game-routes";
import { registerAdminRoutes } from "./routes/admin";
import { registerStorageRoutes } from "./routes/storage-routes";
import { createConsumptionRoutes } from "./routes/consumption";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize game data
  await storage.initializeGameData();

  // Initialize services
  const gameService = new GameService(storage);
  const expeditionService = new ExpeditionService(storage);
  const questService = new QuestService(storage);

  // Register health and monitoring routes
  registerHealthRoutes(app);

  // Register enhanced game routes with full validation and caching
  registerEnhancedGameRoutes(app, storage, gameService, expeditionService);

  // Register admin routes for development
  registerAdminRoutes(app);

  // Register enhanced storage routes
  registerStorageRoutes(app, storage);

  // Register consumption routes
  app.use('/api', createConsumptionRoutes(storage));

  // Create new player
  app.post("/api/player", async (req, res) => {
    try {
      const { username } = req.body;

      if (!username || typeof username !== 'string' || username.trim().length < 2) {
        return res.status(400).json({ 
          message: "Nome de usuário deve ter pelo menos 2 caracteres" 
        });
      }

      if (username.length > 20) {
        return res.status(400).json({ 
          message: "Nome de usuário não pode ter mais de 20 caracteres" 
        });
      }

      // Check if player already exists
      const existingPlayer = await storage.getPlayerByUsername(username.trim());
      if (existingPlayer) {
        return res.status(409).json({ 
          message: "Nome de usuário já existe",
          playerId: existingPlayer.id 
        });
      }

      const newPlayer = await storage.createPlayer({
        username: username.trim(),
        level: 1,
        experience: 0,
        hunger: 100,
        maxHunger: 100,
        thirst: 100,
        maxThirst: 100,
        coins: 100, // Starting coins for new players
        inventoryWeight: 0,
        maxInventoryWeight: 50000,
        autoStorage: false,
        craftedItemsDestination: "storage",
        waterStorage: 0,
        maxWaterStorage: 500,
        waterTanks: 0,
        equippedHelmet: null,
        equippedChestplate: null,
        equippedLeggings: null,
        equippedBoots: null,
        equippedWeapon: null,
        equippedTool: null,
        autoCompleteQuests: true
      });

      console.log(`👤 New player created: ${newPlayer.username} (${newPlayer.id})`);
      res.status(201).json(newPlayer);
    } catch (error) {
      console.error("Create player error:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Falha ao criar jogador" 
      });
    }
  });

  // Get player by ID or username
  app.get("/api/player/:identifier", async (req, res) => {
    try {
      const { identifier } = req.params;

      // Try to get by ID first, then by username
      let player = await storage.getPlayer(identifier);
      if (!player) {
        player = await storage.getPlayerByUsername(identifier);
      }

      if (!player) {
        return res.status(404).json({ message: "Player not found" });
      }

      res.json(player);
    } catch (error) {
      console.error("Get player error:", error);
      res.status(500).json({ message: "Failed to get player" });
    }
  });

  // Update player settings
  app.patch("/api/player/:playerId/settings", async (req, res) => {
    try {
      const { playerId } = req.params;
      const { autoStorage, craftedItemsDestination } = req.body;

      const player = await storage.getPlayer(playerId);
      if (!player) {
        return res.status(404).json({ message: "Player not found" });
      }

      const updates: Partial<Player> = {};
      if (typeof autoStorage === 'boolean') {
        updates.autoStorage = autoStorage;
      }

      const updatedPlayer = await storage.updatePlayer(playerId, updates);
      res.json(updatedPlayer);
    } catch (error) {
      res.status(500).json({ message: "Failed to update player settings" });
    }
  });

  // Get all resources with caching
  app.get("/api/resources", async (req, res) => {
    try {
      const { cacheGetOrSet, CACHE_KEYS, CACHE_TTL } = await import("./cache/memory-cache");
      const resources = await cacheGetOrSet(
        CACHE_KEYS.ALL_RESOURCES,
        () => storage.getAllResources(),
        CACHE_TTL.STATIC_DATA
      );
      res.json(resources);
    } catch (error) {
      res.status(500).json({ message: "Failed to get resources" });
    }
  });

  // Get all biomes with caching
  app.get("/api/biomes", async (req, res) => {
    try {
      const { cacheGetOrSet, CACHE_KEYS, CACHE_TTL } = await import("./cache/memory-cache");
      const biomes = await cacheGetOrSet(
        CACHE_KEYS.ALL_BIOMES,
        () => storage.getAllBiomes(),
        CACHE_TTL.STATIC_DATA
      );
      res.json(biomes);
    } catch (error) {
      res.status(500).json({ message: "Failed to get biomes" });
    }
  });

  // Get player inventory with caching
  app.get("/api/inventory/:playerId", async (req, res) => {
    try {
      const { playerId } = req.params;
      const { cacheGetOrSet, CACHE_KEYS, CACHE_TTL } = await import("./cache/memory-cache");
      const inventory = await cacheGetOrSet(
        CACHE_KEYS.PLAYER_INVENTORY(playerId),
        () => storage.getPlayerInventory(playerId),
        CACHE_TTL.INVENTORY
      );
      res.json(inventory);
    } catch (error) {
      res.status(500).json({ message: "Failed to get inventory" });
    }
  });

  // Get player storage with caching
  app.get("/api/storage/:playerId", async (req, res) => {
    try {
      const { playerId } = req.params;
      const { cacheGetOrSet, CACHE_KEYS, CACHE_TTL } = await import("./cache/memory-cache");
      const storageItems = await cacheGetOrSet(
        CACHE_KEYS.PLAYER_STORAGE(playerId),
        () => storage.getPlayerStorage(playerId),
        CACHE_TTL.INVENTORY
      );
      res.json(storageItems);
    } catch (error) {
      console.error("Get storage error:", error);
      res.status(500).json({ message: "Failed to get storage" });
    }
  });

  // Get all equipment with caching
  app.get("/api/equipment", async (req, res) => {
    try {
      const { cacheGetOrSet, CACHE_KEYS, CACHE_TTL } = await import("./cache/memory-cache");
      const equipment = await cacheGetOrSet(
        CACHE_KEYS.ALL_EQUIPMENT,
        () => storage.getAllEquipment(),
        CACHE_TTL.STATIC_DATA
      );
      res.json(equipment);
    } catch (error) {
      res.status(500).json({ message: "Failed to get equipment" });
    }
  });

  // Get all recipes with caching
  app.get("/api/recipes", async (req, res) => {
    try {
      const { cacheGetOrSet, CACHE_KEYS, CACHE_TTL } = await import("./cache/memory-cache");
      const recipes = await cacheGetOrSet(
        CACHE_KEYS.ALL_RECIPES,
        () => storage.getAllRecipes(),
        CACHE_TTL.STATIC_DATA
      );
      res.json(recipes);
    } catch (error) {
      res.status(500).json({ message: "Failed to get recipes" });
    }
  });

  // Equip item endpoint
  app.post("/api/player/equip", async (req, res) => {
    try {
      const { playerId, slot, equipmentId } = req.body;

      if (!playerId || !slot) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const player = await storage.getPlayer(playerId);
      if (!player) {
        return res.status(404).json({ error: "Player not found" });
      }

      // Get current equipped item for this slot
      let currentEquippedId: string | null = null;
      switch (slot) {
        case "helmet":
          currentEquippedId = player.equippedHelmet;
          break;
        case "chestplate":
          currentEquippedId = player.equippedChestplate;
          break;
        case "leggings":
          currentEquippedId = player.equippedLeggings;
          break;
        case "boots":
          currentEquippedId = player.equippedBoots;
          break;
        case "weapon":
          currentEquippedId = player.equippedWeapon;
          break;
        case "tool":
          currentEquippedId = player.equippedTool;
          break;
        default:
          return res.status(400).json({ error: "Invalid slot" });
      }

      // If unequipping (equipmentId is null)
      if (!equipmentId) {
        // Return currently equipped item to storage
        if (currentEquippedId) {
          const storageItems = await storage.getPlayerStorage(playerId);
          const existingStorageItem = storageItems.find(item => item.resourceId === currentEquippedId);

          if (existingStorageItem) {
            await storage.updateStorageItem(existingStorageItem.id, {
              quantity: existingStorageItem.quantity + 1
            });
          } else {
            await storage.addStorageItem({
              playerId,
              resourceId: currentEquippedId,
              quantity: 1,
              itemType: 'equipment'
            });
          }
        }
      } else {
        // If equipping a new item
        // Check if item is available in storage
        const storageItems = await storage.getPlayerStorage(playerId);
        const storageItem = storageItems.find(item => item.resourceId === equipmentId);

        if (!storageItem || storageItem.quantity < 1) {
          return res.status(400).json({ error: "Item not available in storage" });
        }

        // Return currently equipped item to storage (if any)
        if (currentEquippedId) {
          const existingCurrentItem = storageItems.find(item => item.resourceId === currentEquippedId);
          if (existingCurrentItem) {
            await storage.updateStorageItem(existingCurrentItem.id, {
              quantity: existingCurrentItem.quantity + 1
            });
          } else {
            await storage.addStorageItem({
              playerId,
              resourceId: currentEquippedId,
              quantity: 1,
              itemType: 'equipment'
            });
          }
        }

        // Consume 1 item from storage
        if (storageItem.quantity === 1) {
          await storage.removeStorageItem(storageItem.id);
        } else {
          await storage.updateStorageItem(storageItem.id, {
            quantity: storageItem.quantity - 1
          });
        }
      }

      // Update the player's equipped item for the specific slot
      const updates: Partial<Player> = {};

      switch (slot) {
        case "helmet":
          updates.equippedHelmet = equipmentId;
          break;
        case "chestplate":
          updates.equippedChestplate = equipmentId;
          break;
        case "leggings":
          updates.equippedLeggings = equipmentId;
          break;
        case "boots":
          updates.equippedBoots = equipmentId;
          break;
        case "weapon":
          updates.equippedWeapon = equipmentId;
          break;
        case "tool":
          updates.equippedTool = equipmentId;
          break;
      }

      const updatedPlayer = await storage.updatePlayer(playerId, updates);
      res.json(updatedPlayer);
    } catch (error) {
      console.error("Error equipping item:", error);
      res.status(500).json({ error: "Failed to equip item" });
    }
  });

  // REMOVED: Legacy craft API - use /api/v2/craft instead for modern attribute-based crafting

  // Start expedition using service
  app.post("/api/expeditions", async (req, res) => {
    try {
      const { playerId, biomeId, selectedResources, selectedEquipment } = req.body;

      const expedition = await expeditionService.startExpedition(
        playerId, 
        biomeId, 
        selectedResources || [], 
        selectedEquipment || []
      );

      // CRITICAL: Invalidate cache to ensure frontend sees updated data immediately (hunger/thirst change)
      const { invalidatePlayerCache } = await import("./cache/memory-cache");
      invalidatePlayerCache(playerId);

      res.json(expedition);
    } catch (error) {
      console.error('Expedition creation error:', error);
      res.status(400).json({ message: error instanceof Error ? error.message : "Failed to create expedition" });
    }
  });

  // Update expedition progress using service
  app.patch("/api/expeditions/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const expedition = await expeditionService.updateExpeditionProgress(id);
      res.json(expedition);
    } catch (error) {
      res.status(500).json({ message: "Failed to update expedition" });
    }
  });

  // Complete expedition using service
  app.post("/api/expeditions/:id/complete", async (req, res) => {
    try {
      const { id } = req.params;
      const expedition = await expeditionService.completeExpedition(id);

      // Update quest progress for expedition completion and resources collected
      if (expedition && expedition.playerId) {
        await questService.updateQuestProgress(expedition.playerId, 'expedition', { biomeId: expedition.biomeId });

        // Update quest progress for resources collected during expedition
        if (expedition.collectedResources) {
          const collected = expedition.collectedResources as Record<string, any>;
          for (const [resourceId, quantity] of Object.entries(collected)) {
            await questService.updateQuestProgress(expedition.playerId, 'collect', { 
              resourceId, 
              quantity: Number(quantity) 
            });
          }
        }
      }

      // CRITICAL: Invalidate cache to ensure frontend sees updated data immediately
      const { invalidateStorageCache, invalidateInventoryCache, invalidatePlayerCache } = await import("./cache/memory-cache");
      invalidateStorageCache(expedition.playerId);
      invalidateInventoryCache(expedition.playerId);
      invalidatePlayerCache(expedition.playerId);

      res.json(expedition);
    } catch (error) {
      console.error("Complete expedition error:", error);
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to complete expedition" });
    }
  });

  // Consume food or drink
  app.post("/api/player/:playerId/consume", async (req, res) => {
    try {
      const { playerId } = req.params;
      const { itemId, quantity = 1 } = req.body;

      const player = await storage.getPlayer(playerId);
      if (!player) {
        return res.status(404).json({ error: "Player not found" });
      }

      // Get item from inventory or storage
      const inventoryItems = await storage.getPlayerInventory(playerId);
      const storageItems = await storage.getPlayerStorage(playerId);

      let itemSource: 'inventory' | 'storage' | null = null;
      let itemToConsume: any = null;

      // Check inventory first
      const inventoryItem = inventoryItems.find(item => item.id === itemId);
      if (inventoryItem && inventoryItem.quantity >= quantity) {
        itemSource = 'inventory';
        itemToConsume = inventoryItem;
      } else {
        // Check storage
        const storageItem = storageItems.find(item => item.id === itemId);
        if (storageItem && storageItem.quantity >= quantity) {
          itemSource = 'storage';
          itemToConsume = storageItem;
        }
      }

      if (!itemToConsume || !itemSource) {
        return res.status(400).json({ error: "Item not found or insufficient quantity" });
      }

      // Get resource details to determine food effects
      const resource = await storage.getResource(itemToConsume.resourceId);
      if (!resource) {
        return res.status(404).json({ error: "Resource not found" });
      }

      // Use dynamic consumption system for effects calculation
      const { validateConsumption, getConsumableEffects } = await import("../shared/utils/consumable-utils");

      // Validate that item is consumable
      const validation = validateConsumption(resource, quantity);
      if (!validation.valid) {
        return res.status(400).json({ error: validation.error });
      }

      // Get consumption effects dynamically from item attributes
      const effects = getConsumableEffects(resource);
      const hungerRestore = effects.hungerRestore;
      const thirstRestore = effects.thirstRestore;

      // Update player stats
      const newHunger = Math.min(player.maxHunger, player.hunger + (hungerRestore * quantity));
      const newThirst = Math.min(player.maxThirst, player.thirst + (thirstRestore * quantity));

      await storage.updatePlayer(playerId, {
        hunger: newHunger,
        thirst: newThirst
      });

      // Remove consumed items
      if (itemToConsume.quantity === quantity) {
        if (itemSource === 'inventory') {
          await storage.removeInventoryItem(itemToConsume.id);
        } else {
          await storage.removeStorageItem(itemToConsume.id);
        }
      } else {
        if (itemSource === 'inventory') {
          await storage.updateInventoryItem(itemToConsume.id, {
            quantity: itemToConsume.quantity - quantity
          });
        } else {
          await storage.updateStorageItem(itemToConsume.id, {
            quantity: itemToConsume.quantity - quantity
          });
        }
      }

      // Update inventory weight if consumed from inventory
      if (itemSource === 'inventory') {
        const newWeight = await gameService.calculateInventoryWeight(playerId);
        await storage.updatePlayer(playerId, { inventoryWeight: newWeight });
      }

      // CRITICAL: Invalidate cache to ensure frontend sees updated data immediately
      const { invalidateStorageCache, invalidateInventoryCache, invalidatePlayerCache } = await import("./cache/memory-cache");
      invalidateStorageCache(playerId);
      invalidateInventoryCache(playerId);
      invalidatePlayerCache(playerId);

      res.json({ 
        success: true, 
        hungerRestored: hungerRestore * quantity,
        thirstRestored: thirstRestore * quantity,
        newHunger,
        newThirst
      });
    } catch (error) {
      console.error('Consume item error:', error);
      res.status(500).json({ error: "Failed to consume item" });
    }
  });

  // Consume water from player's water compartment
  app.post("/api/player/:playerId/consume-water", async (req, res) => {
    try {
      const { playerId } = req.params;
      const { quantity = 1 } = req.body;

      const player = await storage.getPlayer(playerId);
      if (!player) {
        return res.status(404).json({ error: "Player not found" });
      }

      if (player.waterStorage < quantity) {
        return res.status(400).json({ error: "Not enough water available" });
      }

      // Water restores thirst
      const thirstRestore = 15; // Water restores 15 thirst per unit
      const newThirst = Math.min(player.thirst + (thirstRestore * quantity), player.maxThirst);
      const newWaterStorage = player.waterStorage - quantity;

      await storage.updatePlayer(playerId, {
        thirst: newThirst,
        waterStorage: newWaterStorage
      });

      // CRITICAL: Invalidate cache to ensure frontend sees updated data immediately
      const { invalidateStorageCache, invalidateInventoryCache, invalidatePlayerCache } = await import("./cache/memory-cache");
      invalidateStorageCache(playerId);
      invalidateInventoryCache(playerId);
      invalidatePlayerCache(playerId);

      res.json({ 
        success: true, 
        thirstRestored: thirstRestore * quantity,
        newThirst,
        newWaterStorage,
        hungerRestored: 0
      });
    } catch (error) {
      console.error('Consume water error:', error);
      res.status(500).json({ error: "Failed to consume water" });
    }
  });

  // Store individual inventory item using service
  app.post("/api/storage/store/:inventoryItemId", async (req, res) => {
    try {
      const { inventoryItemId } = req.params;
      const { playerId, quantity } = req.body;

      await gameService.moveToStorage(playerId, inventoryItemId, quantity);

      // CRITICAL: Invalidate cache to ensure frontend sees updated data immediately
      const { invalidateStorageCache, invalidateInventoryCache, invalidatePlayerCache } = await import("./cache/memory-cache");
      invalidateStorageCache(playerId);
      invalidateInventoryCache(playerId);
      invalidatePlayerCache(playerId);

      res.json({ message: "Item stored successfully" });
    } catch (error) {
      console.error('Storage error:', error);
      res.status(400).json({ message: error instanceof Error ? error.message : "Failed to store item" });
    }
  });

  // Store all inventory items
  app.post("/api/storage/store-all/:playerId", async (req, res) => {
    try {
      const { playerId } = req.params;
      const inventory = await storage.getPlayerInventory(playerId);
      const storageItems = await storage.getPlayerStorage(playerId);

      for (const invItem of inventory) {
        const existingStorageItem = storageItems.find(
          (s) => s.resourceId === invItem.resourceId,
        );

        if (existingStorageItem) {
          await storage.updateStorageItem(existingStorageItem.id, {
            quantity: existingStorageItem.quantity + invItem.quantity,
          });
        } else {
          await storage.addStorageItem({
            playerId,
            resourceId: invItem.resourceId,
            quantity: invItem.quantity,
            itemType: 'resource' // Default to resource for now
          });
        }

        await storage.removeInventoryItem(invItem.id);
      }

      // Update player inventory weight
      await storage.updatePlayer(playerId, { inventoryWeight: 0 });

      // CRITICAL: Invalidate cache to ensure frontend sees updated data immediately
      const { invalidateStorageCache, invalidateInventoryCache, invalidatePlayerCache } = await import("./cache/memory-cache");
      invalidateStorageCache(playerId);
      invalidateInventoryCache(playerId);
      invalidatePlayerCache(playerId);

      res.json({ message: "All items stored successfully" });
    } catch (error) {
      console.error("Store all items error:", error);
      res.status(500).json({ message: "Failed to store items" });
    }
  });

  // Transfer from storage to inventory using service
  app.post("/api/storage/withdraw", async (req, res) => {
    try {
      const { playerId, storageItemId, quantity } = req.body;

      // Get storage item to check resource ID
      const storageItems = await storage.getPlayerStorage(playerId);
      const storageItem = storageItems.find(item => item.id === storageItemId);

      if (!storageItem) {
        return res.status(404).json({ message: "Item not found in storage" });
      }

      // Check if the item is equipment (tools, weapons, armor)
      const equipment = await storage.getAllEquipment();
      const isEquipment = equipment.some(eq => eq.id === storageItem.resourceId);

      if (isEquipment) {
        return res.status(400).json({ 
          message: "Equipamentos, ferramentas e armas só podem ser equipados, não retirados para o inventário." 
        });
      }

      await gameService.moveToInventory(playerId, storageItemId, quantity);

      // CRITICAL: Invalidate cache to ensure frontend sees updated data immediately
      const { invalidateStorageCache, invalidateInventoryCache, invalidatePlayerCache } = await import("./cache/memory-cache");
      invalidateStorageCache(playerId);
      invalidateInventoryCache(playerId);
      invalidatePlayerCache(playerId);

      res.json({ message: "Items withdrawn successfully" });
    } catch (error) {
      console.error('Withdraw error:', error);
      res.status(400).json({ message: error instanceof Error ? error.message : "Failed to withdraw items" });
    }
  });

  // Update player auto storage setting
  app.patch("/api/player/:id/auto-storage", async (req, res) => {
    try {
      const { id } = req.params;
      const { autoStorage } = req.body;
      const player = await storage.updatePlayer(id, { autoStorage });
      res.json(player);
    } catch (error) {
      res.status(500).json({ message: "Failed to update auto storage setting" });
    }
  });

  // Get resources by category (hunting, fishing, etc.)
  app.get("/api/resources/category/:category", async (req, res) => {
    try {
      const { category } = req.params;
      const resources = await storage.getAllResources();

      let filteredResources = resources;

      switch (category) {
        case "animals":
          filteredResources = resources.filter(r => 
            ["Coelho", "Veado", "Javali"].includes(r.name)
          );
          break;
        case "fish":
          filteredResources = resources.filter(r => 
            ["Peixe Pequeno", "Peixe Grande", "Salmão"].includes(r.name)
          );
          break;
        case "plants":
          filteredResources = resources.filter(r => 
            ["Cogumelos", "Frutas Silvestres", "Fibra"].includes(r.name)
          );
          break;
        case "basic":
          filteredResources = resources.filter(r => r.type === "basic");
          break;
        case "unique":
          filteredResources = resources.filter(r => r.type === "unique");
          break;
        default:
          filteredResources = resources;
      }

      res.json(filteredResources);
    } catch (error) {
      res.status(500).json({ message: "Failed to get resources by category" });
    }
  });

  // Get biome details with enhanced information
  app.get("/api/biomes/:id/details", async (req, res) => {
    try {
      const { id } = req.params;
      const biome = await storage.getBiome(id);

      if (!biome) {
        return res.status(404).json({ message: "Biome not found" });
      }

      const resources = await storage.getAllResources();
      const availableResources = Array.isArray(biome.availableResources) 
        ? biome.availableResources : [];

      const biomeResources = resources.filter(r => 
        availableResources.includes(r.id)
      );

      // Categorize resources for better UI display
      const categorizedResources = {
        basic: biomeResources.filter(r => r.type === "basic"),
        animals: biomeResources.filter(r => 
          ["Coelho", "Veado", "Javali"].includes(r.name)
        ),
        fish: biomeResources.filter(r => 
          ["Peixe Pequeno", "Peixe Grande", "Salmão"].includes(r.name)
        ),
        plants: biomeResources.filter(r => 
          ["Cogumelos", "Frutas Silvestres"].includes(r.name)
        ),
        unique: biomeResources.filter(r => 
          r.type === "unique" && !["Coelho", "Veado", "Javali", "Peixe Pequeno", "Peixe Grande", "Salmão", "Cogumelos", "Frutas Silvestres"].includes(r.name)
        )
      };

      res.json({
        ...biome,
        resources: categorizedResources,
        totalResources: biomeResources.length
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to get biome details" });
    }
  });

  // Check player equipment and ability to collect specific resources
  app.get("/api/player/:playerId/can-collect/:resourceId", async (req, res) => {
    try {
      const { playerId, resourceId } = req.params;

      // Get resource to check if it's a fish
      const resource = await storage.getResource(resourceId);
      if (!resource) {
        return res.status(404).json({ message: "Resource not found" });
      }

      let canCollect = false;

      // Special check for fishing resources
      if (resource.requiredTool === "fishing_rod") {
        canCollect = await gameService.hasFishingRequirements(playerId);
      } else {
        // Regular tool check for other resources
        canCollect = await gameService.hasRequiredTool(playerId, resourceId);
      }

      res.json({
        canCollect,
        resource: {
          name: resource.name,
          emoji: resource.emoji,
          requiredTool: resource.requiredTool
        }
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to check collection ability" });
    }
  });

  // Get player's active expedition
  app.get("/api/player/:playerId/active-expedition", async (req, res) => {
    try {
      const { playerId } = req.params;
      const activeExpedition = await expeditionService.getActiveExpedition(playerId);
      res.json(activeExpedition);
    } catch (error) {
      res.status(500).json({ message: "Failed to get active expedition" });
    }
  });

  // Cancel expedition
  app.post("/api/expeditions/:id/cancel", async (req, res) => {
    try {
      const { id } = req.params;
      await expeditionService.cancelExpedition(id);
      res.json({ message: "Expedition cancelled successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to cancel expedition" });
    }
  });

  // Import and setup quest routes
  const { setupQuestRoutes } = await import("./routes/quest-routes");
  setupQuestRoutes(app, storage, questService, gameService);

  const httpServer = createServer(app);
  return httpServer;
}
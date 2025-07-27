import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertExpeditionSchema } from "@shared/schema";
import { z } from "zod";
import type { Player } from "@shared/schema";
import { GameService } from "./services/game-service";
import { ExpeditionService } from "./services/expedition-service";
import { QuestService } from "./services/quest-service";
import { registerHealthRoutes } from "./routes/health";
import { registerEnhancedGameRoutes } from "./routes/enhanced-game-routes";
import { registerAdminRoutes } from "./routes/admin";

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

  // Get player data - create default player if not found
  app.get("/api/player/:username", async (req, res) => {
    try {
      const { username } = req.params;
      let player = await storage.getPlayerByUsername(username);
      
      // Create default player if not found
      if (!player) {
        const newPlayer = {
          username,
          level: 1,
          experience: 0,
          hunger: 100,
          maxHunger: 100,
          thirst: 100,
          maxThirst: 100,
          coins: 0,
          inventoryWeight: 0,
          maxInventoryWeight: 50,
          autoStorage: false,
          craftedItemsDestination: "inventory" as const,
          waterStorage: 0,
          maxWaterStorage: 100,
          equippedHelmet: "",
          equippedChestplate: "",
          equippedLeggings: "",
          equippedBoots: "",
          equippedWeapon: "",
          equippedTool: ""
        };
        
        player = await storage.createPlayer(newPlayer);
        // Created new player successfully
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
      if (craftedItemsDestination === 'inventory' || craftedItemsDestination === 'storage') {
        updates.craftedItemsDestination = craftedItemsDestination;
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
              quantity: 1
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
              quantity: 1
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

  // Craft item
  app.post("/api/craft", async (req, res) => {
    try {
      const { playerId, recipeId } = req.body;

      const player = await storage.getPlayer(playerId);
      if (!player) {
        return res.status(404).json({ message: "Player not found" });
      }

      const recipe = await storage.getRecipe(recipeId);
      if (!recipe) {
        return res.status(404).json({ message: "Recipe not found" });
      }

      if (player.level < recipe.requiredLevel) {
        return res.status(400).json({ message: "Level too low for this recipe" });
      }

      // Get player's storage items
      const storageItems = await storage.getPlayerStorage(playerId);

      // Check if player has enough ingredients in storage
      const ingredientEntries = Object.entries(recipe.ingredients as Record<string, number>);
      for (const [resourceId, requiredQuantity] of ingredientEntries) {
        const storageItem = storageItems.find(item => item.resourceId === resourceId);
        const availableQuantity = storageItem?.quantity || 0;

        if (availableQuantity < requiredQuantity) {
          const resource = await storage.getResource(resourceId);
          return res.status(400).json({ 
            message: `Insufficient ${resource?.name || 'resource'} in storage. Need ${requiredQuantity}, have ${availableQuantity}` 
          });
        }
      }

      // Consume ingredients from storage
      for (const [resourceId, requiredQuantity] of ingredientEntries) {
        const storageItem = storageItems.find(item => item.resourceId === resourceId);
        if (storageItem) {
          const newQuantity = storageItem.quantity - requiredQuantity;
          if (newQuantity <= 0) {
            await storage.removeStorageItem(storageItem.id);
          } else {
            await storage.updateStorageItem(storageItem.id, { quantity: newQuantity });
          }
        }
      }

      // Add crafted items to player's preferred destination (inventory or storage)
      const destination = player.craftedItemsDestination || 'storage';
      const outputEntries = Object.entries(recipe.output as Record<string, number>);

      for (const [itemType, quantity] of outputEntries) {
        // First check if it's a resource (like Barbante)
        const allResources = await storage.getAllResources();
        const resourceItem = allResources.find(r => r.id === itemType);

        if (resourceItem) {
          // Add resource to storage
          const existingStorageItem = storageItems.find(item => item.resourceId === resourceItem.id);

          if (existingStorageItem) {
            await storage.updateStorageItem(existingStorageItem.id, {
              quantity: existingStorageItem.quantity + quantity
            });
          } else {
            await storage.addStorageItem({
              playerId,
              resourceId: resourceItem.id,
              quantity
            });
          }

          console.log(`Added ${quantity}x ${resourceItem.name} to storage for player ${playerId}`);
        } else {
          // Check if itemType is actually an equipment ID
          const allEquipment = await storage.getAllEquipment();
          const equipmentItem = allEquipment.find(eq => eq.id === itemType);

          if (equipmentItem) {
              if (destination === 'inventory') {
                // Add to inventory
                const inventoryItems = await storage.getPlayerInventory(playerId);
                const existingInventoryItem = inventoryItems.find(item => item.resourceId === equipmentItem.id);

                if (existingInventoryItem) {
                  await storage.updateInventoryItem(existingInventoryItem.id, {
                    quantity: existingInventoryItem.quantity + quantity
                  });
                } else {
                  await storage.addInventoryItem({
                    playerId,
                    resourceId: equipmentItem.id,
                    quantity
                  });
                }

                // Update player inventory weight
                const newWeight = player.inventoryWeight + (equipmentItem.weight * quantity);
                await storage.updatePlayer(playerId, { inventoryWeight: newWeight });

                console.log(`Added ${quantity}x ${equipmentItem.name} to inventory for player ${playerId}`);
              } else {
                // Add to storage (default behavior)
                const existingStorageItem = storageItems.find(item => item.resourceId === equipmentItem.id);

                if (existingStorageItem) {
                  await storage.updateStorageItem(existingStorageItem.id, {
                    quantity: existingStorageItem.quantity + quantity
                  });
                } else {
                  await storage.addStorageItem({
                    playerId,
                    resourceId: equipmentItem.id,
                    quantity
                  });
                }

                // Added crafted equipment to storage
              }
          } else {
            // Equipment not found for the given ID
          }
        }
      }

      // Update quest progress for crafted items - using the item IDs from recipe outputs
      const outputs = recipe.output as Record<string, any>;
      for (const [itemId, quantity] of Object.entries(outputs)) {
        // Updating quest progress for crafted item
        await questService.updateQuestProgress(playerId, 'craft', { itemId, quantity });
      }
      
      res.json({ message: "Item crafted successfully!", recipe });
    } catch (error) {
      console.error("Craft error:", error);
      res.status(500).json({ message: "Failed to craft item" });
    }
  });

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

      // Calculate hunger and thirst restoration based on food type
      let hungerRestore = 0;
      let thirstRestore = 0;

      switch (resource.name) {
        case "Frutas Silvestres":
          hungerRestore = 10;
          thirstRestore = 5;
          break;
        case "Cogumelos":
          hungerRestore = 8;
          break;
        case "Suco de Frutas":
          thirstRestore = 20;
          hungerRestore = 5;
          break;
        case "Cogumelos Assados":
          hungerRestore = 15;
          break;
        case "Peixe Grelhado":
          hungerRestore = 25;
          break;
        case "Carne Assada":
          hungerRestore = 30;
          break;
        case "Ensopado de Carne":
          hungerRestore = 40;
          thirstRestore = 10;
          break;
        case "Água Fresca":
          thirstRestore = 30;
          break;
        default:
          return res.status(400).json({ error: "Item is not consumable" });
      }

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
          });
        }

        await storage.removeInventoryItem(invItem.id);
      }

      // Update player inventory weight
      await storage.updatePlayer(playerId, { inventoryWeight: 0 });

      res.json({ message: "All items stored successfully" });
    } catch (error) {
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

      const canCollect = await gameService.hasRequiredTool(playerId, resourceId);
      const resource = await storage.getResource(resourceId);

      res.json({
        canCollect,
        resource: resource ? {
          name: resource.name,
          emoji: resource.emoji,
          requiredTool: resource.requiredTool
        } : null
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

  // Quest endpoints
  // Get all quests
  app.get("/api/quests", async (req, res) => {
    try {
      const quests = await storage.getAllQuests();
      res.json(quests);
    } catch (error) {
      res.status(500).json({ message: "Failed to get quests" });
    }
  });

  // Get player's quests with progress
  app.get("/api/player/:playerId/quests", async (req, res) => {
    try {
      const { playerId } = req.params;
      const allQuests = await storage.getAllQuests();
      const playerQuests = await storage.getPlayerQuests(playerId);
      
      // Get player for level checking
      const player = await storage.getPlayer(playerId);
      if (!player) {
        return res.status(404).json({ message: "Player not found" });
      }

      // Combine quest data with player progress and check objectives
      // Parallel loading of quest progress for better performance
      const questsWithProgress = await Promise.all(
        allQuests
          .filter(quest => quest.isActive && quest.requiredLevel <= player.level)
          .map(async (quest) => {
            const playerQuest = playerQuests.find(pq => pq.questId === quest.id);
            let questProgress = { completed: false, progress: {} };
            
            // Check quest objectives if quest is active
            if (playerQuest && playerQuest.status === 'active') {
              questProgress = await questService.checkQuestObjectives(playerId, quest.id);
            }
            
            return {
              ...quest,
              playerQuest: playerQuest || null,
              status: playerQuest?.status || 'available',
              progress: questProgress.progress,
              canComplete: questProgress.completed && playerQuest?.status === 'active'
            };
          })
      );

      res.json(questsWithProgress);
    } catch (error) {
      res.status(500).json({ message: "Failed to get player quests" });
    }
  });

  // Start a quest
  app.post("/api/player/:playerId/quests/:questId/start", async (req, res) => {
    try {
      const { playerId, questId } = req.params;
      
      // Check if player already has this quest
      const existingPlayerQuest = await storage.getPlayerQuest(playerId, questId);
      if (existingPlayerQuest) {
        return res.status(400).json({ message: "Quest already started or completed" });
      }

      // Get quest to validate
      const quest = await storage.getQuest(questId);
      if (!quest) {
        return res.status(404).json({ message: "Quest not found" });
      }

      // Check player level requirement
      const player = await storage.getPlayer(playerId);
      if (!player) {
        return res.status(404).json({ message: "Player not found" });
      }
      
      if (player.level < quest.requiredLevel) {
        return res.status(400).json({ message: "Player level too low" });
      }

      // Create player quest
      const playerQuest = await storage.createPlayerQuest({
        playerId,
        questId,
        status: "active",
        progress: {}
      });

      // Update with timestamp
      const updatedPlayerQuest = await storage.updatePlayerQuest(playerQuest.id, {
        startedAt: Math.floor(Date.now() / 1000)
      });

      res.json({ message: "Quest started successfully", playerQuest: updatedPlayerQuest });
    } catch (error) {
      console.error("Start quest error:", error);
      res.status(500).json({ message: "Failed to start quest" });
    }
  });

  // Complete a quest
  app.post("/api/player/:playerId/quests/:questId/complete", async (req, res) => {
    try {
      const { playerId, questId } = req.params;
      
      // Get player quest
      const playerQuest = await storage.getPlayerQuest(playerId, questId);
      if (!playerQuest || playerQuest.status !== 'active') {
        return res.status(400).json({ message: "Quest not active" });
      }

      // Get quest to get rewards
      const quest = await storage.getQuest(questId);
      if (!quest) {
        return res.status(404).json({ message: "Quest not found" });
      }

      // Get player to update with rewards
      const player = await storage.getPlayer(playerId);
      if (!player) {
        return res.status(404).json({ message: "Player not found" });
      }

      // Apply rewards
      const rewards = quest.rewards as any;
      const newCoins = player.coins + (rewards.coins || 0);
      const newExperience = player.experience + (rewards.experience || 0);
      
      // Calculate new level if needed
      let newLevel = player.level;
      let experienceForLevel = newExperience;
      while (experienceForLevel >= (newLevel * 100)) {
        experienceForLevel -= (newLevel * 100);
        newLevel++;
      }

      // Update player
      await storage.updatePlayer(playerId, {
        coins: newCoins,
        experience: newExperience,
        level: newLevel
      });

      // Add item rewards to storage if any
      if (rewards.items) {
        const storageItems = await storage.getPlayerStorage(playerId);
        
        for (const [resourceId, quantity] of Object.entries(rewards.items)) {
          const existingItem = storageItems.find(item => item.resourceId === resourceId);
          
          if (existingItem) {
            await storage.updateStorageItem(existingItem.id, {
              quantity: existingItem.quantity + (quantity as number)
            });
          } else {
            await storage.addStorageItem({
              playerId,
              resourceId,
              quantity: quantity as number
            });
          }
        }
      }

      // Mark quest as completed with timestamp in seconds
      const completedPlayerQuest = await storage.updatePlayerQuest(playerQuest.id, {
        status: 'completed',
        completedAt: Math.floor(Date.now() / 1000)
      });

      res.json({
        quest: completedPlayerQuest,
        rewards: rewards,
        newLevel: newLevel !== player.level ? newLevel : undefined
      });
    } catch (error) {
      console.error("Complete quest error:", error);
      res.status(500).json({ message: "Failed to complete quest", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
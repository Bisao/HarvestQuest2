import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

import { insertExpeditionSchema, updatePlayerSchema } from "@shared/types";
import { z } from "zod";
import type { Player, HungerDegradationMode } from "@shared/types";
import { validateParams, playerIdParamSchema } from "./middleware/validation";
import { GameService } from "./services/game-service";
import { createNewExpeditionRoutes } from './routes/expedition-routes';
import { QuestService } from "./services/quest-service";
import { OfflineActivityService } from "./services/offline-activity-service";
import { NewExpeditionService as ExpeditionService } from "./services/expedition-service";
import { ErrorHandler } from "@shared/utils/error-handler";
import { globalMemoryOptimizer, startAutoMemoryManagement } from "@shared/utils/memory-optimizer";
import { randomUUID } from "crypto";
import { registerHealthRoutes } from "./routes/health";
import { registerEnhancedGameRoutes } from "./routes/enhanced-game-routes";
import { registerAdminRoutes } from "./routes/admin";
import { registerEnhancedStorageRoutes as registerStorageRoutes } from "./routes/enhanced-storage-routes";
import { createConsumptionRoutes } from "./routes/consumption";
import { createSkillRoutes } from "./routes/skill-routes";
import savesRouter from "./routes/saves";
import animalRegistryRoutes from './routes/animal-registry-routes';
import animalRoutes from './routes/animal-routes';
import developerRoutes from './routes/developer-routes';
import equipmentRoutes from './routes/equipment-routes';
import { createAIAssistantRoutes } from './routes/ai-assistant-routes';

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize game data first
  await storage.initializeGameData();
  
  // Initialize enhanced error handling (after routes)
  
  // Start auto memory management
  startAutoMemoryManagement();

  // Initialize services
  const gameService = new GameService(storage);
  const questService = new QuestService(storage);
  const offlineActivityService = new OfflineActivityService(storage);
  const expeditionService = new ExpeditionService(storage);

  // Register health and monitoring routes
  registerHealthRoutes(app);

  // Register enhanced game routes with full validation and caching
  registerEnhancedGameRoutes(app, storage, gameService);

  // Register new expedition routes
  app.use('/api/expeditions', createNewExpeditionRoutes(storage));

  // Register admin routes for development
  registerAdminRoutes(app);

  // Register enhanced storage routes
  registerStorageRoutes(app, storage);

  // Register consumption routes
  app.use('/api', createConsumptionRoutes(storage));

  // Register skill routes
  app.use('/api/skills', createSkillRoutes(storage));

  // Register time routes
  const { createTimeRoutes } = await import('./routes/time-routes');
  app.use('/api/time', createTimeRoutes(storage));

  // Register time speed routes
  const timeSpeedRoutes = await import('./routes/time-speed');
  app.use('/api/time/speed', timeSpeedRoutes.default);

  // Register saves routes  
  app.use('/api/saves', savesRouter);

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
      const { autoStorage, autoCompleteQuests, craftedItemsDestination, hungerDegradationMode } = req.body;

      const player = await storage.getPlayer(playerId);
      if (!player) {
        return res.status(404).json({ message: "Player not found" });
      }

      const updates: Partial<Player> = {};
      if (typeof autoStorage === 'boolean') {
        updates.autoStorage = autoStorage;
      }
      if (typeof autoCompleteQuests === 'boolean') {
        updates.autoCompleteQuests = autoCompleteQuests;
      }
      if (typeof craftedItemsDestination === 'string') {
        updates.craftedItemsDestination = craftedItemsDestination as 'inventory' | 'storage';
      }
      if (typeof hungerDegradationMode === 'string') {
        updates.hungerDegradationMode = hungerDegradationMode as HungerDegradationMode;
      }

      const updatedPlayer = await storage.updatePlayer(playerId, updates);

      // Invalidate cache to ensure frontend gets updated data
      try {
        const { invalidatePlayerCache } = await import("./cache/memory-cache");
        invalidatePlayerCache(playerId);
      } catch (error) {
        console.warn('Cache invalidation failed:', error);
      }

      res.json(updatedPlayer);
    } catch (error) {
      console.error('Update player settings error:', error);
      res.status(500).json({ message: "Failed to update player settings" });
    }
  });

  // Sistema de Notificações/Resumos Offline
  // Verifica atividade offline quando jogador faz login
  app.get("/api/player/:playerId/offline-activity", async (req, res) => {
    try {
      const { playerId } = req.params;

      const result = await offlineActivityService.calculateOfflineActivity(playerId);

      if (!result) {
        return res.json({ hasOfflineActivity: false });
      }

      // Aplica as recompensas e atualizações
      const { report, playerUpdates, inventoryUpdates, storageUpdates } = result;

      // Atualiza o jogador
      if (Object.keys(playerUpdates).length > 0) {
        await storage.updatePlayer(playerId, playerUpdates);
      }

      // Atualiza inventário
      for (const update of inventoryUpdates) {
        const existingItem = await storage.getPlayerInventory(playerId);
        const existing = existingItem.find(item => item.resourceId === update.resourceId);

        if (existing) {
          await storage.updateInventoryItem(existing.id, {
            quantity: existing.quantity + update.quantity
          });
        } else {
          await storage.addInventoryItem({
            playerId,
            resourceId: update.resourceId,
            quantity: update.quantity
          });
        }
      }

      // Atualiza storage
      for (const update of storageUpdates) {
        const existingStorage = await storage.getPlayerStorage(playerId);
        const existing = existingStorage.find(item => item.resourceId === update.resourceId);

        if (existing) {
          await storage.updateStorageItem(existing.id, {
            quantity: existing.quantity + update.quantity
          });
        } else {
          await storage.addStorageItem({
            playerId,
            resourceId: update.resourceId,
            quantity: update.quantity
          });
        }
      }

      // Invalida cache para garantir dados atualizados no frontend
      try {
        const { invalidatePlayerCache } = await import("./cache/memory-cache");
        invalidatePlayerCache(playerId);
      } catch (error) {
        console.warn('Cache invalidation failed:', error);
      }

      res.json({
        hasOfflineActivity: true,
        report
      });

    } catch (error) {
      console.error("Offline activity error:", error);
      res.status(500).json({ message: "Failed to process offline activity" });
    }
  });

  // Marca jogador como online
  app.post("/api/player/:playerId/mark-online", async (req, res) => {
    try {
      const { playerId } = req.params;
      await offlineActivityService.markPlayerOnline(playerId);
      res.json({ success: true });
    } catch (error) {
      console.error("Mark online error:", error);
      res.status(500).json({ message: "Failed to mark player online" });
    }
  });

  // Configura atividades offline
  app.patch("/api/player/:playerId/offline-config", async (req, res) => {
    try {
      const { playerId } = req.params;
      const config = req.body;

      await offlineActivityService.updateOfflineConfig(playerId, config);

      res.json({ success: true });
    } catch (error) {
      console.error("Update offline config error:", error);
      res.status(500).json({ message: "Failed to update offline config" });
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

  // Equipment routes
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

      // If equipmentId is null, we're unequipping
      if (equipmentId === null) {
        const updateData: any = {};
        updateData[`equipped${slot.charAt(0).toUpperCase() + slot.slice(1)}`] = null;

        await storage.updatePlayer(playerId, updateData);

        // Invalidate cache for real-time update
        const { invalidatePlayerCache } = await import("./cache/memory-cache");
        invalidatePlayerCache(playerId);

        res.json({ success: true, message: "Item unequipped" });
        return;
      }

      // For food and drink slots, check if it's a consumable in storage
      if (slot === 'food' || slot === 'drink') {
        const storage_items = await storage.getPlayerStorage(playerId);
        const storageItem = storage_items.find(item => 
          item.resourceId === equipmentId && 
          item.quantity > 0 && 
          item.itemType === 'resource'
        );

        if (!storageItem) {
          return res.status(400).json({ error: "Consumable not found in storage" });
        }

        // Check if it's actually a consumable
        const resources = await storage.getAllResources();
        const resourceData = resources.find(r => r.id === equipmentId);

        if (!resourceData) {
          return res.status(400).json({ error: "Item is not a consumable" });
        }

        console.log(`Equipping consumable: ${resourceData.name} (${resourceData.id})`);
        console.log(`Resource data:`, {
          category: resourceData.category,
          subcategory: resourceData.subcategory,
          type: resourceData.type,
          slot: slot
        });

        // Check if it's a consumable item
        const isConsumable = resourceData.category === 'consumables' || resourceData.type === 'consumable';
        if (!isConsumable) {
          console.log(`Item ${resourceData.name} is not consumable: category=${resourceData.category}, type=${resourceData.type}`);
          return res.status(400).json({ error: "Item is not a consumable" });
        }

        // Verify consumable type matches slot - flexible matching
        const isValidConsumable = (slot === 'food' && resourceData.subcategory === 'food') || 
                                 (slot === 'drink' && resourceData.subcategory === 'drink');

        if (!isValidConsumable) {
          console.log(`Validation failed for ${resourceData.name}: subcategory '${resourceData.subcategory}' doesn't match slot '${slot}'`);
          return res.status(400).json({ error: `Item is not a ${slot} consumable` });
        }

        // Update player equipment
        const updateData: any = {};
        updateData[`equipped${slot.charAt(0).toUpperCase() + slot.slice(1)}`] = equipmentId;

        await storage.updatePlayer(playerId, updateData);

        // Invalidate cache for real-time update
        const { invalidatePlayerCache } = await import("./cache/memory-cache");
        invalidatePlayerCache(playerId);

        res.json({ success: true, message: "Consumable equipped successfully" });
        return;
      }

      // For regular equipment slots
      const equipment = await storage.getAllEquipment();
      const equipmentItem = equipment.find(eq => eq.id === equipmentId);

      if (!equipmentItem) {
        return res.status(404).json({ error: "Equipment not found" });
      }

      // Check if player has the equipment in storage or inventory
      const inventory = await storage.getPlayerInventory(playerId);
      const storage_items = await storage.getPlayerStorage(playerId);

      const hasInInventory = inventory.some(item => item.resourceId === equipmentId);
      const hasInStorage = storage_items.some(item => 
        item.resourceId === equipmentId && 
        item.quantity > 0 && 
        item.itemType === 'equipment'
      );

      if (!hasInInventory && !hasInStorage) {
        return res.status(400).json({ error: "You don't have this equipment" });
      }

      // Update player equipment
      const updateData: any = {};
      updateData[`equipped${slot.charAt(0).toUpperCase() + slot.slice(1)}`] = equipmentId;

      await storage.updatePlayer(playerId, updateData);

      // Invalidate cache for real-time update
      const { invalidatePlayerCache } = await import("./cache/memory-cache");
      invalidatePlayerCache(playerId);

      res.json({ success: true, message: "Equipment equipped successfully" });
    } catch (error) {
      console.error("Equip equipment error:", error);
      res.status(500).json({ error: "Failed to equip equipment" });
    }
  });

  // REMOVED: Legacy craft API - use /api/v2/craft instead for modern attribute-based crafting

  // Create expedition using service
  app.post("/api/expeditions", async (req, res) => {
    try {
      const { playerId, biomeId, selectedResources, selectedEquipment } = req.body;

      // Validações detalhadas
      if (!playerId || typeof playerId !== 'string') {
        return res.status(400).json({ message: "ID do jogador inválido" });
      }

      if (!biomeId || typeof biomeId !== 'string') {
        return res.status(400).json({ message: "ID do bioma inválido" });
      }

      if (!selectedResources || !Array.isArray(selectedResources) || selectedResources.length === 0) {
        return res.status(400).json({ message: "Recursos selecionados inválidos" });
      }

      // Verificar se todos os recursos são strings válidas
      const invalidResources = selectedResources.filter(id => !id || typeof id !== 'string');
      if (invalidResources.length > 0) {
        return res.status(400).json({ message: "IDs de recursos inválidos" });
      }
       const validResources = selectedResources.filter(id => id && typeof id === 'string');

      console.log('Creating expedition with data:', {
        playerId,
        biomeId,
        selectedResources,
        selectedEquipment: selectedEquipment || []
      });

      const expedition = await expeditionService.startExpedition(playerId, biomeId);

      if (!expedition || !expedition.id) {
        throw new Error('Falha ao criar expedição');
      }

      console.log('Expedition created successfully:', expedition.id);
      res.json(expedition);
    } catch (error) {
      console.error("Create expedition error:", error);

      let errorMessage = "Erro interno ao criar expedição";
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      res.status(500).json({ message: errorMessage });
    }
  });

  // Get player expeditions
  app.get("/api/player/:playerId/expeditions", async (req, res) => {
    try {
      const { playerId } = req.params;
      const expeditions = await storage.getPlayerExpeditions(playerId);
      res.json(expeditions);
    } catch (error) {
      console.error("Get player expeditions error:", error);
      res.status(500).json({ message: "Failed to get expeditions" });
    }
  });

  // Get active expedition for player
  app.get("/api/player/:playerId/expeditions/active", async (req, res) => {
    try {
      const { playerId } = req.params;
      const activeExpeditions = await expeditionService.getPlayerActiveExpeditions(playerId);
      const activeExpedition = activeExpeditions[0] || null;

      if (!activeExpedition) {
        return res.status(404).json({ message: "No active expedition found" });
      }

      res.json(activeExpedition);
    } catch (error) {
      console.error("Get active expedition error:", error);
      res.status(500).json({ message: "Failed to get active expedition" });
    }
  });

  // Delete/cancel player expedition
  app.delete("/api/player/:playerId/expeditions", async (req, res) => {
    try {
      const { playerId } = req.params;
      const activeExpeditions = await expeditionService.getPlayerActiveExpeditions(playerId);
      const activeExpedition = activeExpeditions[0] || null;

      if (activeExpedition) {
        // For now, directly update storage to cancel expedition
        await storage.updateExpedition(activeExpedition.id, { status: 'cancelled' });
      }

      res.json({ success: true, message: "Expedition cancelled" });
    } catch (error) {
      console.error("Cancel expedition error:", error);
      res.status(500).json({ message: "Failed to cancel expedition" });
    }
  });

  // Legacy expedition endpoints removed - using new expedition system

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

  // Move item to storage endpoint
  app.post("/api/inventory/move-to-storage", async (req, res) => {
    try {
      const { playerId, itemId, quantity } = req.body;

      if (!playerId || !itemId || !quantity) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const player = await storage.getPlayer(playerId);
      if (!player) {
        return res.status(404).json({ error: "Player not found" });
      }

      // Get inventory item
      const inventory = await storage.getPlayerInventory(playerId);
      const inventoryItem = inventory.find(item => item.resourceId === itemId);

      if (!inventoryItem || inventoryItem.quantity < quantity) {
        return res.status(400).json({ error: "Insufficient items in inventory" });
      }

      // Get or create storage item
      const storageItems = await storage.getPlayerStorage(playerId);
      let storageItem = storageItems.find(item => item.resourceId === itemId);

      if (storageItem) {
        // Update existing storage item
        await storage.updateStorageItem(storageItem.id, {
          quantity: storageItem.quantity + quantity
        });
      } else {
        // Create new storage item
        await storage.addStorageItem({
          playerId,
          resourceId: itemId,
          quantity,
          itemType: inventoryItem.itemType || 'resource'
        });
      }

      // Update or remove inventory item
      if (inventoryItem.quantity === quantity) {
        await storage.removeInventoryItem(inventoryItem.id);
      } else {
        await storage.updateInventoryItem(inventoryItem.id, {
          quantity: inventoryItem.quantity - quantity
        });
      }

      // Invalidate caches
      const { invalidatePlayerCache, invalidateCache, CACHE_KEYS } = await import("./cache/memory-cache");
      invalidatePlayerCache(playerId);
      invalidateCache(CACHE_KEYS.PLAYER_INVENTORY(playerId));
      invalidateCache(CACHE_KEYS.PLAYER_STORAGE(playerId));

      res.json({ success: true, message: "Item moved to storage successfully" });
    } catch (error) {
      console.error("Move to storage error:", error);
      res.status(500).json({ error: "Failed to move item to storage" });
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

  // Get biome resources - simple route for frontend
  app.get("/api/biomes/:biomeId/resources", async (req, res) => {
    try {
      const { biomeId } = req.params;
      const biome = await storage.getBiome(biomeId);

      if (!biome) {
        return res.status(404).json({ message: "Biome not found" });
      }

      const resources = await storage.getAllResources();
      const availableResources = Array.isArray(biome.availableResources) 
        ? biome.availableResources : [];

      const biomeResources = resources.filter(r => 
        availableResources.includes(r.id)
      );

      res.json(biomeResources);
    } catch (error) {
      console.error("Error getting biome resources:", error);
      res.status(500).json({ message: "Failed to get biome resources" });
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
      const activeExpeditions = await expeditionService.getPlayerActiveExpeditions(playerId);
      const activeExpedition = activeExpeditions[0] || null;
      res.json(activeExpedition);
    } catch (error) {
      res.status(500).json({ message: "Failed to get active expedition" });
    }
  });

  // Cancel expedition
  app.post("/api/expeditions/:id/cancel", async (req, res) => {
    try {
      const { id } = req.params;
      // For now, directly update storage to cancel expedition
      await storage.updateExpedition(id, { status: 'cancelled' });
      res.json({ message: "Expedition cancelled successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to cancel expedition" });
    }
  });

  // Import and setup quest routes
  const { setupQuestRoutes } = await import("./routes/quest-routes");
  setupQuestRoutes(app, storage, questService, gameService);

  // Player settings routes
  app.patch("/api/player/:id/settings", async (req, res) => {
    try {
      const playerId = req.params.id;
      const { autoStorage, autoCompleteQuests } = req.body;

      const player = await storage.getPlayer(playerId);
      if (!player) {
        return res.status(404).json({ message: "Player not found" });
      }

      const updates: Partial<Player> = {};
      if (typeof autoStorage === 'boolean') {
        updates.autoStorage = autoStorage;
      }
          if (typeof autoCompleteQuests === 'boolean') {
        updates.autoCompleteQuests = autoCompleteQuests;
      }

      const updatedPlayer = await storage.updatePlayer(playerId, updates);

      res.json({ 
        message: "Settings updated successfully",
        player: updatedPlayer
      });
    } catch (error) {
      console.error("Error updating player settings:", error);
      res.status(500).json({ message: "Failed to update settings" });
    }
  });

  // Save game endpoint
  app.post("/api/player/:id/save", async (req, res) => {
    try {
      const playerId = req.params.id;

      const player = await storage.getPlayer(playerId);
      if (!player) {
        return res.status(404).json({ message: "Player not found" });
      }

      res.json({ 
        message: "Game saved successfully"
      });
    } catch (error) {
      console.error("Error saving game:", error);
      res.status(500).json({ message: "Failed to save game" });
    }
  });

  // Get player quests with proper error handling
  app.get("/api/player/:playerId/quests", validateParams(playerIdParamSchema), async (req, res) => {
    try {
      const { playerId } = req.params;
      const quests = await storage.getPlayerQuests(playerId);
      res.json(quests);
    } catch (error) {
      console.error("Error fetching player quests:", error);
      res.status(500).json({ message: "Failed to fetch quests" });
    }
  });

  // Crafting endpoint
  app.post("/api/craft", async (req, res) => {
    try {
      const { playerId, recipeId, quantity = 1 } = req.body;

      if (!playerId || !recipeId) {
        return res.status(400).json({ message: "playerId e recipeId são obrigatórios" });
      }

      // Get player
      const player = await storage.getPlayer(playerId);
      if (!player) {
        return res.status(404).json({ message: "Jogador não encontrado" });
      }

      // Get recipe
      const recipes = await storage.getAllRecipes();
      const recipe = recipes.find(r => r.id === recipeId);
      if (!recipe) {
        return res.status(404).json({ message: "Receita não encontrada" });
      }

      // Check level requirement
      if (player.level < recipe.requiredLevel) {
        return res.status(400).json({ 
          message: `Nível ${recipe.requiredLevel} necessário para craftar ${recipe.name}` 
        });
      }

      // Get player storage
      const storageItems = await storage.getPlayerStorage(playerId);

      // Check ingredients
      if (!recipe.ingredients || !Array.isArray(recipe.ingredients)) {
        return res.status(400).json({ message: "Receita sem ingredientes válidos" });
      }

      for (const ingredient of recipe.ingredients) {
        const required = ingredient.quantity * quantity;
        const available = storageItems.find(item => item.resourceId === ingredient.itemId)?.quantity || 0;

        if (available < required) {
          return res.status(400).json({ 
            message: `Ingredientes insuficientes: ${ingredient.itemId} (precisa ${required}, tem ${available})` 
          });
        }
      }

      // Consume ingredients
      for (const ingredient of recipe.ingredients) {
        const required = ingredient.quantity * quantity;
        const storageItem = storageItems.find(item => item.resourceId === ingredient.itemId);

        if (storageItem) {
          await storage.updateStorageItem(storageItem.id, {
            quantity: storageItem.quantity - required
          });
        }
      }

      // Add crafted items to storage
      if (recipe.outputs && Array.isArray(recipe.outputs)) {
        for (const output of recipe.outputs) {
          const totalAmount = output.quantity * quantity;
          const existingItem = storageItems.find(item => item.resourceId === output.itemId);

          if (existingItem) {
            await storage.updateStorageItem(existingItem.id, {
              quantity: existingItem.quantity + totalAmount
            });
          } else {
            await storage.addStorageItem({
              playerId,
              resourceId: output.itemId,
              quantity: totalAmount,
              itemType: 'resource'
            });
          }
        }
      }

      res.json({
        success: true,
        message: `${quantity}x ${recipe.name} criado com sucesso!`,
        recipe: { id: recipe.id, name: recipe.name },
        quantity
      });

    } catch (error) {
      console.error("Crafting error:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Erro interno do servidor" 
      });
    }
  });

  const httpServer = createServer(app);

  // Store reference in app for use in other routes  
  // WebSocket service will be initialized in index.ts

  // Collect resource
  app.post("/api/collect", async (req, res) => {
    try {
      const { playerId, biomeId, resourceType } = req.body;
      console.log(`🎯 COLLECT: Player ${playerId} collecting ${resourceType} from ${biomeId}`);

      const result = await gameService.collectResource(playerId, biomeId, resourceType);

      console.log(`🎯 COLLECT: Result:`, result);

      // Invalidate cache to ensure frontend sees updated data
      const { invalidateInventoryCache, invalidatePlayerCache } = await import("./cache/memory-cache");
      invalidateInventoryCache(playerId);
      invalidatePlayerCache(playerId);

      res.json(result);
    } catch (error) {
      console.error("Collection error:", error);
      res.status(400).json({ message: error instanceof Error ? error.message : "Collection failed" });
    }
  });

  app.use('/api/equipment', equipmentRoutes);
  // WebSocket service will be initialized in index.ts
  app.use('/api/animal-registry', animalRegistryRoutes);
  app.use('/api/animals', animalRoutes);

  // Developer routes
  app.use('/api/developer', developerRoutes);

  // AI Assistant routes
  app.use('/api/ai', createAIAssistantRoutes(storage));

  // Apply error handling middleware last
  app.use(ErrorHandler.createExpressHandler());

  return httpServer;
}
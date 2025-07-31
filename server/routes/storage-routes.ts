// Enhanced Storage Routes - Clean API endpoints with real-time synchronization
// Unified storage management with proper error handling and validation

import type { Express } from "express";
import type { IStorage } from "../storage";
import { StorageService } from "../services/storage-service";

export function registerStorageRoutes(app: Express, storage: IStorage) {
  const storageService = new StorageService(storage);

  // Get player storage with enhanced data
  app.get("/api/storage/:playerId", async (req, res) => {
    try {
      const { playerId } = req.params;
      
      // Use cache for performance
      const { cacheGetOrSet, CACHE_KEYS, CACHE_TTL } = await import("../cache/memory-cache");
      const storageData = await cacheGetOrSet(
        CACHE_KEYS.PLAYER_STORAGE(playerId),
        () => storageService.getEnhancedStorageData(playerId),
        CACHE_TTL.INVENTORY
      );

      res.json(storageData.items.map(item => ({
        id: item.id,
        playerId: item.playerId,
        resourceId: item.resourceId,
        quantity: item.quantity,
        itemType: item.itemType
      })));
    } catch (error) {
      console.error("Get storage error:", error);
      res.status(500).json({ 
        error: "Failed to get storage", 
        message: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  // Get enhanced storage data with statistics
  app.get("/api/storage/:playerId/enhanced", async (req, res) => {
    try {
      const { playerId } = req.params;
      const enhancedData = await storageService.getEnhancedStorageData(playerId);
      
      res.json(enhancedData);
    } catch (error) {
      console.error("Get enhanced storage error:", error);
      res.status(500).json({ 
        error: "Failed to get enhanced storage data", 
        message: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  // Withdraw items from storage to inventory
  app.post("/api/storage/withdraw", async (req, res) => {
    try {
      const { playerId, storageItemId, quantity } = req.body;

      if (!playerId || !storageItemId || !quantity || quantity <= 0) {
        return res.status(400).json({ 
          error: "Invalid request", 
          message: "Missing required fields or invalid quantity" 
        });
      }

      const result = await storageService.transferToInventory(playerId, storageItemId, quantity);
      
      if (!result.success) {
        return res.status(400).json({ 
          error: "Transfer failed", 
          message: result.message 
        });
      }

      // Invalidate caches for real-time updates
      const { invalidatePlayerCache, CACHE_KEYS } = await import("../cache/memory-cache");
      invalidatePlayerCache(playerId);

      res.json({ 
        success: true, 
        message: result.message 
      });
    } catch (error) {
      console.error("Withdraw from storage error:", error);
      res.status(500).json({ 
        error: "Failed to withdraw from storage", 
        message: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  // Add items to storage (batch operation)
  app.post("/api/storage/add-batch", async (req, res) => {
    try {
      const { playerId, items } = req.body;

      if (!playerId || !items || !Array.isArray(items)) {
        return res.status(400).json({ 
          error: "Invalid request", 
          message: "Missing playerId or items array" 
        });
      }

      const results = await storageService.batchAddItems(playerId, items);

      // Invalidate caches
      const { invalidatePlayerCache } = await import("../cache/memory-cache");
      invalidatePlayerCache(playerId);

      res.json({ 
        success: true, 
        message: `Added ${results.length} item types to storage`,
        results 
      });
    } catch (error) {
      console.error("Batch add to storage error:", error);
      res.status(500).json({ 
        error: "Failed to add items to storage", 
        message: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  // Remove items from storage (batch operation)
  app.post("/api/storage/remove-batch", async (req, res) => {
    try {
      const { playerId, items } = req.body;

      if (!playerId || !items || !Array.isArray(items)) {
        return res.status(400).json({ 
          error: "Invalid request", 
          message: "Missing playerId or items array" 
        });
      }

      for (const item of items) {
        await storageService.removeItemFromStorage(
          playerId, 
          item.resourceId, 
          item.quantity, 
          item.itemType || 'resource'
        );
      }

      // Invalidate caches
      const { invalidatePlayerCache } = await import("../cache/memory-cache");
      invalidatePlayerCache(playerId);

      res.json({ 
        success: true, 
        message: `Removed ${items.length} item types from storage`
      });
    } catch (error) {
      console.error("Batch remove from storage error:", error);
      res.status(500).json({ 
        error: "Failed to remove items from storage", 
        message: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  // Water storage operations
  app.post("/api/storage/water/add", async (req, res) => {
    try {
      const { playerId, quantity } = req.body;

      if (!playerId || !quantity || quantity <= 0) {
        return res.status(400).json({ 
          error: "Invalid request", 
          message: "Missing playerId or invalid quantity" 
        });
      }

      const updatedPlayer = await storageService.addWaterToPlayer(playerId, quantity);

      // Invalidate caches
      const { invalidatePlayerCache } = await import("../cache/memory-cache");
      invalidatePlayerCache(playerId);

      res.json({ 
        success: true, 
        message: `Added ${quantity} units of water`,
        waterStorage: updatedPlayer.waterStorage,
        maxWaterStorage: updatedPlayer.maxWaterStorage
      });
    } catch (error) {
      console.error("Add water error:", error);
      res.status(500).json({ 
        error: "Failed to add water", 
        message: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  app.post("/api/storage/water/consume", async (req, res) => {
    try {
      const { playerId, quantity } = req.body;

      if (!playerId || !quantity || quantity <= 0) {
        return res.status(400).json({ 
          error: "Invalid request", 
          message: "Missing playerId or invalid quantity" 
        });
      }

      const updatedPlayer = await storageService.consumeWaterFromPlayer(playerId, quantity);

      // Invalidate caches
      const { invalidatePlayerCache } = await import("../cache/memory-cache");
      invalidatePlayerCache(playerId);

      res.json({ 
        success: true, 
        message: `Consumed ${quantity} units of water`,
        waterStorage: updatedPlayer.waterStorage,
        thirstRestored: quantity * 2 // Assuming water restores 2 thirst per unit
      });
    } catch (error) {
      console.error("Consume water error:", error);
      res.status(500).json({ 
        error: "Failed to consume water", 
        message: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  // Storage validation and maintenance
  app.post("/api/storage/:playerId/validate", async (req, res) => {
    try {
      const { playerId } = req.params;
      const validation = await storageService.validateStorage(playerId);

      if (validation.fixed) {
        // Invalidate caches if fixes were made
        const { invalidatePlayerCache } = await import("../cache/memory-cache");
        invalidatePlayerCache(playerId);
      }

      res.json(validation);
    } catch (error) {
      console.error("Storage validation error:", error);
      res.status(500).json({ 
        error: "Failed to validate storage", 
        message: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  // Storage statistics
  app.get("/api/storage/:playerId/stats", async (req, res) => {
    try {
      const { playerId } = req.params;
      const enhancedData = await storageService.getEnhancedStorageData(playerId);
      
      res.json(enhancedData.stats);
    } catch (error) {
      console.error("Get storage stats error:", error);
      res.status(500).json({ 
        error: "Failed to get storage statistics", 
        message: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });
}
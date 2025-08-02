
/**
 * ENHANCED STORAGE API ROUTES
 * Modern storage endpoints with improved validation and performance
 */

import type { Express } from "express";
import type { IStorage } from "../storage";
import { EnhancedStorageService } from "../services/enhanced-storage-service";
import type { BatchStorageOperation } from "@shared/types/storage-types";

export function registerEnhancedStorageRoutes(app: Express, storage: IStorage) {
  const storageService = new EnhancedStorageService(storage);

  // Initialize the service
  storageService.initialize();

  // Get enhanced storage data
  app.get("/api/storage/:playerId/enhanced", async (req, res) => {
    try {
      const { playerId } = req.params;
      
      const data = await storageService.getEnhancedStorageData(playerId);
      
      res.json(data);
    } catch (error) {
      console.error("Get enhanced storage error:", error);
      res.status(500).json({ 
        error: "Failed to get enhanced storage data", 
        message: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  // Add item to storage with validation
  app.post("/api/storage/add", async (req, res) => {
    try {
      const { playerId, resourceId, quantity, itemType = 'resource' } = req.body;

      if (!playerId || !resourceId || !quantity || quantity <= 0) {
        return res.status(400).json({ 
          error: "Invalid request", 
          message: "Missing required fields or invalid quantity" 
        });
      }

      const result = await storageService.addItemToStorage(playerId, resourceId, quantity, itemType);
      
      if (!result.success) {
        return res.status(400).json(result);
      }

      // Invalidate caches
      const { invalidatePlayerCache } = await import("../cache/memory-cache");
      invalidatePlayerCache(playerId);

      res.json(result);
    } catch (error) {
      console.error("Add to storage error:", error);
      res.status(500).json({ 
        error: "Failed to add item to storage", 
        message: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  // Remove item from storage with validation
  app.post("/api/storage/remove", async (req, res) => {
    try {
      const { playerId, resourceId, quantity, itemType = 'resource' } = req.body;

      if (!playerId || !resourceId || !quantity || quantity <= 0) {
        return res.status(400).json({ 
          error: "Invalid request", 
          message: "Missing required fields or invalid quantity" 
        });
      }

      const result = await storageService.removeItemFromStorage(playerId, resourceId, quantity, itemType);
      
      if (!result.success) {
        return res.status(400).json(result);
      }

      // Invalidate caches
      const { invalidatePlayerCache } = await import("../cache/memory-cache");
      invalidatePlayerCache(playerId);

      res.json(result);
    } catch (error) {
      console.error("Remove from storage error:", error);
      res.status(500).json({ 
        error: "Failed to remove item from storage", 
        message: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  // Enhanced withdraw with validation
  app.post("/api/storage/withdraw-enhanced", async (req, res) => {
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
        return res.status(400).json(result);
      }

      // Invalidate caches
      const { invalidatePlayerCache } = await import("../cache/memory-cache");
      invalidatePlayerCache(playerId);

      res.json(result);
    } catch (error) {
      console.error("Enhanced withdraw error:", error);
      res.status(500).json({ 
        error: "Failed to withdraw from storage", 
        message: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  // Batch operations
  app.post("/api/storage/batch", async (req, res) => {
    try {
      const batchOperation: BatchStorageOperation = req.body;

      if (!batchOperation.playerId || !batchOperation.operations || !Array.isArray(batchOperation.operations)) {
        return res.status(400).json({ 
          error: "Invalid request", 
          message: "Missing playerId or operations array" 
        });
      }

      const result = await storageService.processBatchOperation(batchOperation);
      
      if (!result.success && result.totalFailed === batchOperation.operations.length) {
        return res.status(400).json(result);
      }

      // Invalidate caches if any operations succeeded
      if (result.totalProcessed > 0) {
        const { invalidatePlayerCache } = await import("../cache/memory-cache");
        invalidatePlayerCache(batchOperation.playerId);
      }

      res.json(result);
    } catch (error) {
      console.error("Batch storage operation error:", error);
      res.status(500).json({ 
        error: "Failed to process batch operation", 
        message: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  // Storage analytics
  app.get("/api/storage/:playerId/analytics", async (req, res) => {
    try {
      const { playerId } = req.params;
      
      const analytics = await storageService.getStorageAnalytics(playerId);
      
      res.json(analytics);
    } catch (error) {
      console.error("Storage analytics error:", error);
      res.status(500).json({ 
        error: "Failed to get storage analytics", 
        message: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  // Storage cleanup
  app.post("/api/storage/:playerId/cleanup", async (req, res) => {
    try {
      const { playerId } = req.params;
      
      const result = await storageService.cleanupStorage(playerId);
      
      if (result.success && result.data?.itemsRemoved > 0) {
        // Invalidate caches if items were removed
        const { invalidatePlayerCache } = await import("../cache/memory-cache");
        invalidatePlayerCache(playerId);
      }
      
      res.json(result);
    } catch (error) {
      console.error("Storage cleanup error:", error);
      res.status(500).json({ 
        error: "Failed to cleanup storage", 
        message: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  // Storage validation
  app.post("/api/storage/:playerId/validate", async (req, res) => {
    try {
      const { playerId } = req.params;
      const { operations } = req.body;

      if (!operations || !Array.isArray(operations)) {
        return res.status(400).json({ 
          error: "Invalid request", 
          message: "Missing operations array" 
        });
      }

      const batchOperation: BatchStorageOperation = {
        playerId,
        operations,
        validateOnly: true
      };

      const result = await storageService.processBatchOperation(batchOperation);
      
      res.json(result);
    } catch (error) {
      console.error("Storage validation error:", error);
      res.status(500).json({ 
        error: "Failed to validate storage operations", 
        message: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });
}

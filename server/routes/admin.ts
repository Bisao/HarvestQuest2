import type { Express } from "express";
import { storage } from "../storage-memory";
import { gameCache } from "../cache/memory-cache";
import { successResponse, errorResponse } from "../utils/response-helpers";

// Admin routes for development and monitoring
export function registerAdminRoutes(app: Express) {
  // Only enable admin routes in development
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  // System statistics
  app.get("/api/admin/stats", async (req, res) => {
    try {
      // Get basic stats without requiring getAllPlayers method
      const playerCount = 0; // Would need to implement this method or query directly
      const resources = await storage.getAllResources();
      const biomes = await storage.getAllBiomes();
      const equipment = await storage.getAllEquipment();
      const recipes = await storage.getAllRecipes();

      const stats = {
        system: {
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          nodeVersion: process.version,
          environment: process.env.NODE_ENV
        },
        database: {
          players: playerCount,
          resources: resources.length,
          biomes: biomes.length,
          equipment: equipment.length,
          recipes: recipes.length
        },
        cache: gameCache.getStats()
      };

      successResponse(res, stats);
    } catch (error) {
      errorResponse(res, 500, "Failed to get system stats");
    }
  });

  // Reset player data (for testing)
  app.post("/api/admin/player/:playerId/reset", async (req, res) => {
    try {
      const { playerId } = req.params;
      
      const player = await storage.getPlayer(playerId);
      if (!player) {
        return errorResponse(res, 404, "Player not found");
      }

      // Reset player stats
      await storage.updatePlayer(playerId, {
        level: 1,
        experience: 0,
        hunger: 100,
        thirst: 100,
        coins: 0,
        inventoryWeight: 0
      });

      // Clear inventory and storage
      const inventory = await storage.getPlayerInventory(playerId);
      const storageItems = await storage.getPlayerStorage(playerId);

      for (const item of inventory) {
        await storage.removeInventoryItem(item.id);
      }

      for (const item of storageItems) {
        await storage.removeStorageItem(item.id);
      }

      successResponse(res, null, "Player reset successfully");
    } catch (error) {
      errorResponse(res, 500, "Failed to reset player");
    }
  });

  // Database health check
  app.get("/api/admin/db/health", async (req, res) => {
    try {
      const start = Date.now();
      await storage.getAllResources();
      const duration = Date.now() - start;

      successResponse(res, {
        status: "healthy",
        responseTime: `${duration}ms`,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      errorResponse(res, 500, "Database unhealthy", "DB_ERROR");
    }
  });

  // Manual cache operations
  app.delete("/api/admin/cache/clear", (req, res) => {
    gameCache.clear();
    successResponse(res, null, "Cache cleared successfully");
  });

  app.get("/api/admin/cache/stats", (req, res) => {
    successResponse(res, gameCache.getStats());
  });
}
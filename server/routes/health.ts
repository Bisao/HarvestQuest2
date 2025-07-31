import type { Express } from "express";
import { gameCache } from "../cache/memory-cache";
import { storage } from "../storage-memory";

export function registerHealthRoutes(app: Express) {
  // Health check endpoint
  app.get("/health", async (req, res) => {
    try {
      const healthStatus: any = {
        status: "healthy",
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || "1.0.0",
        environment: process.env.NODE_ENV || "development",
        uptime: process.uptime(),
        memory: {
          used: process.memoryUsage().heapUsed / 1024 / 1024,
          total: process.memoryUsage().heapTotal / 1024 / 1024,
          rss: process.memoryUsage().rss / 1024 / 1024
        },
        cache: gameCache.getStats()
      };

      // Test database connection
      try {
        await storage.getAllResources();
        healthStatus.database = "connected";
      } catch (error) {
        healthStatus.database = "disconnected";
        healthStatus.status = "degraded";
      }

      const statusCode = healthStatus.status === "healthy" ? 200 : 503;
      res.status(statusCode).json(healthStatus);
    } catch (error) {
      res.status(503).json({
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: "Health check failed"
      });
    }
  });

  // API status endpoint
  app.get("/api/status", (req, res) => {
    res.json({
      api: "Coletor Adventures API",
      status: "operational",
      version: "1.0.0",
      timestamp: new Date().toISOString()
    });
  });

  // Cache management endpoints (for development)
  if (process.env.NODE_ENV === 'development') {
    app.get("/api/dev/cache/stats", (req, res) => {
      res.json(gameCache.getStats());
    });

    app.delete("/api/dev/cache/clear", (req, res) => {
      gameCache.clear();
      res.json({ message: "Cache cleared successfully" });
    });
  }
}
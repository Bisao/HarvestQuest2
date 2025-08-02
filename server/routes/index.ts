// Server Routes Barrel Export - Organized by Feature
// This file centralizes all route registration for clean imports

import type { Express } from "express";
import type { IStorage } from "../storage";
import { GameService } from "../services/game-service";
import { ExpeditionService } from "../services/expedition-service";

// Route registrations
export { registerHealthRoutes } from "./health";
export { registerEnhancedGameRoutes } from "./enhanced-game-routes";
export { registerAdminRoutes } from "./admin";
export { registerStorageRoutes } from "./storage-routes";
export { createConsumptionRoutes } from "./consumption";

// Default route exports
export { default as savesRouter } from "./saves";
export { default as workshopRouter } from "./workshop-routes";
export { default as itemRoutes } from "./items-routes";

/**
 * Master route registration function
 * Registers all routes in the correct order with proper dependencies
 */
export async function registerAllRoutes(
  app: Express, 
  storage: IStorage,
  gameService: GameService,
  expeditionService: ExpeditionService
): Promise<void> {
  const { 
    registerHealthRoutes,
    registerEnhancedGameRoutes,
    registerAdminRoutes,
    registerStorageRoutes,
    createConsumptionRoutes,
    savesRouter,
    workshopRouter,
    itemRoutes
  } = await import("./index");

  // Register routes in order of dependency
  registerHealthRoutes(app);
  registerEnhancedGameRoutes(app, storage, gameService, expeditionService);
  registerAdminRoutes(app);
  registerStorageRoutes(app, storage);
  
  // Mount router-based routes
  app.use('/api', createConsumptionRoutes(storage));
  app.use('/api/saves', savesRouter);
  app.use('/api/v2/workshop', workshopRouter);
  app.use('/api', itemRoutes);
}
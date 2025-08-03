
import { Router, Request, Response } from 'express';
import { z } from 'zod';
import type { IStorage } from '../storage';
import { GameService } from '../services/game-service';
import { ExpeditionService } from '../services/expedition-service';
import { validateRequest } from '../middleware/validation';
import { authenticatePlayer } from '../middleware/auth';
import { successResponse, errorResponse } from '../utils/response-helpers';

// Schemas de validação
const playerParamSchema = z.object({
  playerId: z.string().uuid()
});

const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20)
});

export function createGameRoutes(
  storage: IStorage,
  gameService: GameService,
  expeditionService: ExpeditionService
): Router {
  const router = Router();

  // === PLAYER ROUTES ===
  router.get('/player/:playerId', 
    validateRequest({ params: playerParamSchema }),
    async (req: Request, res: Response) => {
      try {
        const { playerId } = req.params;
        const player = await storage.getPlayer(playerId);
        
        if (!player) {
          return errorResponse(res, 'Player not found', 404);
        }

        return successResponse(res, player);
      } catch (error) {
        return errorResponse(res, 'Failed to fetch player', 500);
      }
    }
  );

  router.patch('/player/:playerId',
    validateRequest({ params: playerParamSchema }),
    async (req: Request, res: Response) => {
      try {
        const { playerId } = req.params;
        const updates = req.body;
        
        const updatedPlayer = await storage.updatePlayer(playerId, updates);
        return successResponse(res, updatedPlayer);
      } catch (error) {
        return errorResponse(res, 'Failed to update player', 500);
      }
    }
  );

  // === INVENTORY ROUTES ===
  router.get('/player/:playerId/inventory',
    validateRequest({ params: playerParamSchema, query: paginationSchema }),
    async (req: Request, res: Response) => {
      try {
        const { playerId } = req.params;
        const inventory = await storage.getPlayerInventory(playerId);
        return successResponse(res, inventory);
      } catch (error) {
        return errorResponse(res, 'Failed to fetch inventory', 500);
      }
    }
  );

  // === STORAGE ROUTES ===
  router.get('/player/:playerId/storage',
    validateRequest({ params: playerParamSchema }),
    async (req: Request, res: Response) => {
      try {
        const { playerId } = req.params;
        const storage_items = await storage.getPlayerStorage(playerId);
        return successResponse(res, storage_items);
      } catch (error) {
        return errorResponse(res, 'Failed to fetch storage', 500);
      }
    }
  );

  // === GAME DATA ROUTES ===
  router.get('/resources', async (req: Request, res: Response) => {
    try {
      const resources = await storage.getAllResources();
      return successResponse(res, resources);
    } catch (error) {
      return errorResponse(res, 'Failed to fetch resources', 500);
    }
  });

  router.get('/equipment', async (req: Request, res: Response) => {
    try {
      const equipment = await storage.getAllEquipment();
      return successResponse(res, equipment);
    } catch (error) {
      return errorResponse(res, 'Failed to fetch equipment', 500);
    }
  });

  router.get('/biomes', async (req: Request, res: Response) => {
    try {
      const biomes = await storage.getAllBiomes();
      return successResponse(res, biomes);
    } catch (error) {
      return errorResponse(res, 'Failed to fetch biomes', 500);
    }
  });

  return router;
}

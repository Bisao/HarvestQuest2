import { Router, Request, Response } from 'express';
import { z } from 'zod';
import type { IStorage } from '../storage';
import { ExpeditionService } from '../services/expedition-service';
import { GameService } from '../services/game-service';
import { validateParams, validateBody } from '../middleware/validation';
import { successResponse, errorResponse } from '../utils/response-helpers';
import { invalidatePlayerCache, invalidateStorageCache } from '../cache/memory-cache';

// Validation schemas for expedition routes
const startExpeditionSchema = z.object({
  playerId: z.string().min(1, "Player ID is required"),
  biomeId: z.string().min(1, "Biome ID is required"),
  selectedResources: z.array(z.string()).min(1, "At least one resource must be selected"),
  selectedEquipment: z.array(z.string()).optional().default([]),
  duration: z.number().optional().default(60000)
});

const expeditionParamSchema = z.object({
  expeditionId: z.string().min(1, "Expedition ID is required")
});

const playerIdParamSchema = z.object({
  playerId: z.string().min(1, "Player ID is required")
});

export function createExpeditionRoutes(
  storage: IStorage,
  expeditionService: ExpeditionService,
  gameService: GameService
): Router {
  const router = Router();

  // Start new expedition
  router.post('/start', 
    validateBody(startExpeditionSchema),
    async (req: Request, res: Response) => {
      try {
        console.log('🚀 EXPEDITION-START: Request received:', req.body);
        const { playerId, biomeId, selectedResources, selectedEquipment, duration } = req.body;

        // Validate player exists
        const player = await storage.getPlayer(playerId);
        if (!player) {
          console.error('❌ EXPEDITION-START: Player not found:', playerId);
          return errorResponse(res, 404, 'Player not found');
        }

        // Start expedition
        const expedition = await expeditionService.startExpedition(
          playerId,
          biomeId,
          selectedResources,
          selectedEquipment,
          duration
        );

        console.log('✅ EXPEDITION-START: Success:', expedition.id);
        
        // Invalidate caches
        invalidatePlayerCache(playerId);
        
        return successResponse(res, expedition, 'Expedition started successfully');
      } catch (error: any) {
        console.error('❌ EXPEDITION-START: Error:', error.message);
        return errorResponse(res, 400, error.message);
      }
    }
  );

  // Get player's active expedition
  router.get('/player/:playerId/active',
    validateParams(playerIdParamSchema),
    async (req: Request, res: Response) => {
      try {
        const { playerId } = req.params;
        console.log('🔍 EXPEDITION-ACTIVE: Fetching for player:', playerId);

        const expeditions = await storage.getPlayerExpeditions(playerId);
        const activeExpedition = expeditions.find(exp => exp.status === 'in_progress');

        if (!activeExpedition) {
          console.log('ℹ️ EXPEDITION-ACTIVE: No active expedition found');
          return successResponse(res, null);
        }

        console.log('✅ EXPEDITION-ACTIVE: Found:', activeExpedition.id);
        return successResponse(res, activeExpedition);
      } catch (error: any) {
        console.error('❌ EXPEDITION-ACTIVE: Error:', error.message);
        return errorResponse(res, 500, error.message);
      }
    }
  );

  // Get all player expeditions
  router.get('/player/:playerId',
    validateParams(playerIdParamSchema),
    async (req: Request, res: Response) => {
      try {
        const { playerId } = req.params;
        console.log('📋 EXPEDITION-LIST: Fetching for player:', playerId);

        const expeditions = await storage.getPlayerExpeditions(playerId);
        
        console.log(`✅ EXPEDITION-LIST: Found ${expeditions.length} expeditions`);
        return successResponse(res, expeditions);
      } catch (error: any) {
        console.error('❌ EXPEDITION-LIST: Error:', error.message);
        return errorResponse(res, 500, error.message);
      }
    }
  );

  // Complete expedition
  router.post('/:expeditionId/complete',
    validateParams(expeditionParamSchema),
    async (req: Request, res: Response) => {
      try {
        const { expeditionId } = req.params;
        console.log('🏁 EXPEDITION-COMPLETE: Processing:', expeditionId);

        const result = await expeditionService.completeExpedition(expeditionId);
        
        // Invalidate caches for the player
        if (result.playerId) {
          invalidatePlayerCache(result.playerId);
          invalidateStorageCache(result.playerId);
        }

        console.log('✅ EXPEDITION-COMPLETE: Success:', expeditionId);
        return successResponse(res, result, 'Expedition completed successfully');
      } catch (error: any) {
        console.error('❌ EXPEDITION-COMPLETE: Error:', error.message);
        return errorResponse(res, 400, error.message);
      }
    }
  );

  // Cancel expedition
  router.post('/:expeditionId/cancel',
    validateParams(expeditionParamSchema),
    async (req: Request, res: Response) => {
      try {
        const { expeditionId } = req.params;
        console.log('🛑 EXPEDITION-CANCEL: Processing:', expeditionId);

        const result = await expeditionService.cancelExpedition(expeditionId);
        
        // Invalidate caches for the player
        if (result.playerId) {
          invalidatePlayerCache(result.playerId);
        }

        console.log('✅ EXPEDITION-CANCEL: Success:', expeditionId);
        return successResponse(res, result, 'Expedition cancelled successfully');
      } catch (error: any) {
        console.error('❌ EXPEDITION-CANCEL: Error:', error.message);
        return errorResponse(res, 400, error.message);
      }
    }
  );

  // Update expedition progress (for real-time progress tracking)
  router.patch('/:expeditionId/progress',
    validateParams(expeditionParamSchema),
    async (req: Request, res: Response) => {
      try {
        const { expeditionId } = req.params;
        console.log('📈 EXPEDITION-PROGRESS: Updating:', expeditionId);

        const expedition = await expeditionService.updateExpeditionProgress(expeditionId);
        
        console.log('✅ EXPEDITION-PROGRESS: Success:', expedition.progress);
        return successResponse(res, expedition);
      } catch (error: any) {
        console.error('❌ EXPEDITION-PROGRESS: Error:', error.message);
        return errorResponse(res, 400, error.message);
      }
    }
  );

  // Get expedition details by ID
  router.get('/:expeditionId',
    validateParams(expeditionParamSchema),
    async (req: Request, res: Response) => {
      try {
        const { expeditionId } = req.params;
        console.log('🔍 EXPEDITION-DETAILS: Fetching:', expeditionId);

        const expedition = await storage.getExpedition(expeditionId);
        
        if (!expedition) {
          console.log('❌ EXPEDITION-DETAILS: Not found:', expeditionId);
          return errorResponse(res, 404, 'Expedition not found');
        }

        console.log('✅ EXPEDITION-DETAILS: Success:', expedition.id);
        return successResponse(res, expedition);
      } catch (error: any) {
        console.error('❌ EXPEDITION-DETAILS: Error:', error.message);
        return errorResponse(res, 500, error.message);
      }
    }
  );

  return router;
}
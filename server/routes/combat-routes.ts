import { Router, Request, Response } from 'express';
import { CombatService } from '../services/combat-service';
import type { IStorage } from '../storage';
import { successResponse, errorResponse } from '../utils/response-helpers';
import { z } from 'zod';

const executeActionSchema = z.object({
  encounterId: z.string().uuid(),
  action: z.enum(['attack', 'defend', 'analyze', 'flee'])
});

const generateEncounterSchema = z.object({
  playerId: z.string().uuid(),
  biomeId: z.string()
});

export function createCombatRoutes(storage: IStorage): Router {
  const router = Router();
  const combatService = new CombatService(storage);

  // Generate random encounter during exploration
  router.post('/encounter/generate', async (req: Request, res: Response) => {
    try {
      const { playerId, biomeId } = generateEncounterSchema.parse(req.body);

      console.log(`🎲 COMBAT: Attempting to generate encounter for player ${playerId} in biome ${biomeId}`);

      const encounter = await combatService.tryGenerateEncounter(playerId, biomeId);

      if (!encounter) {
        return successResponse(res, null, 'Nenhum animal encontrado desta vez');
      }

      // Store encounter (implement proper storage later)
      await combatService.createEncounter(encounter);

      return successResponse(res, encounter, 'Encontro de combate gerado!');
    } catch (error: any) {
      console.error('❌ COMBAT-ENCOUNTER: Error:', error.message);
      return errorResponse(res, 500, error.message);
    }
  });

  // Execute player combat action
  router.post('/action', async (req: Request, res: Response) => {
    try {
      const { encounterId, action } = executeActionSchema.parse(req.body);

      console.log(`⚔️ COMBAT: Player executing action ${action} in encounter ${encounterId}`);

      const result = await combatService.executePlayerAction(encounterId, action);

      return successResponse(res, result, `Ação ${action} executada com sucesso`);
    } catch (error: any) {
      console.error('❌ COMBAT-ACTION: Error:', error.message);
      return errorResponse(res, 400, error.message);
    }
  });

  // Get encounter details
  router.get('/:encounterId', async (req: Request, res: Response) => {
    try {
      const { encounterId } = req.params;

      const encounter = await combatService.getEncounter(encounterId);

      if (!encounter) {
        return errorResponse(res, 404, 'Encontro de combate não encontrado');
      }

      return successResponse(res, encounter, 'Detalhes do encontro recuperados');
    } catch (error: any) {
      console.error('❌ COMBAT-GET: Error:', error.message);
      return errorResponse(res, 500, error.message);
    }
  });

  return router;
}
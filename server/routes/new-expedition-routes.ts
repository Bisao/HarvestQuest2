import { Router, Request, Response } from 'express';
import { z } from 'zod';
import type { IStorage } from '../storage';
import { NewExpeditionService } from '../services/new-expedition-service';
import { validateParams, validateBody } from '../middleware/validation';
import { successResponse, errorResponse } from '../utils/response-helpers';
import { migrateLegacyCreatureId } from '../../shared/constants/creature-ids';

// Schemas de validação
const startExpeditionSchema = z.object({
  playerId: z.string().min(1, "Player ID é obrigatório"),
  templateId: z.string().min(1, "Template ID é obrigatório")
});

const expeditionParamSchema = z.object({
  expeditionId: z.string().min(1, "Expedition ID é obrigatório")
});

const playerParamSchema = z.object({
  playerId: z.string().min(1, "Player ID é obrigatório")
});

export function createNewExpeditionRoutes(storage: IStorage): Router {
  const router = Router();
  const expeditionService = new NewExpeditionService(storage);

  // ===================== TEMPLATES =====================

  // Listar todos os templates de expedição
  router.get('/templates', async (req: Request, res: Response) => {
    try {
      const templates = expeditionService.getExpeditionTemplates();
      return successResponse(res, templates, 'Templates de expedição obtidos com sucesso');
    } catch (error: any) {
      console.error('❌ EXPEDITION-TEMPLATES: Error:', error.message);
      return errorResponse(res, 500, error.message);
    }
  });

  // Obter templates por bioma
  router.get('/templates/biome/:biomeId', async (req: Request, res: Response) => {
    try {
      const { biomeId } = req.params;
      const templates = expeditionService.getTemplatesForBiome(biomeId);
      return successResponse(res, templates, `Templates para bioma ${biomeId} obtidos com sucesso`);
    } catch (error: any) {
      console.error('❌ EXPEDITION-TEMPLATES-BIOME: Error:', error.message);
      return errorResponse(res, 500, error.message);
    }
  });

  // Obter template específico
  router.get('/templates/:templateId', async (req: Request, res: Response) => {
    try {
      const { templateId } = req.params;
      const template = expeditionService.getTemplateById(templateId);

      if (!template) {
        return errorResponse(res, 404, 'Template não encontrado');
      }

      return successResponse(res, template, 'Template obtido com sucesso');
    } catch (error: any) {
      console.error('❌ EXPEDITION-TEMPLATE: Error:', error.message);
      return errorResponse(res, 500, error.message);
    }
  });

  // ===================== VALIDAÇÃO =====================

  // Validar se jogador pode iniciar expedição
  router.post('/validate', 
    validateBody(startExpeditionSchema),
    async (req: Request, res: Response) => {
      try {
        const { playerId, templateId } = req.body;
        console.log(`🔍 EXPEDITION-VALIDATE: Checking requirements for player ${playerId}, template ${templateId}`);

        const validation = await expeditionService.validateExpeditionRequirements(playerId, templateId);

        return successResponse(res, validation, 'Validação concluída');
      } catch (error: any) {
        console.error('❌ EXPEDITION-VALIDATE: Error:', error.message);
        return errorResponse(res, 400, error.message);
      }
    }
  );

  // ===================== GESTÃO DE EXPEDIÇÕES =====================

  // Schema para expedições customizadas
  const customExpeditionSchema = z.object({
    playerId: z.string().min(1, "Player ID é obrigatório"),
    biomeId: z.string().min(1, "Biome ID é obrigatório"),
    selectedResources: z.array(z.object({
      resourceId: z.string(),
      targetQuantity: z.number().min(1).max(100)
    })).min(1, "Pelo menos um recurso deve ser selecionado"),
    duration: z.number().min(5 * 60 * 1000).max(120 * 60 * 1000), // 5min - 120min in milliseconds
    selectedEquipment: z.array(z.string()).optional().default([])
  });

  // Iniciar expedição customizada
  router.post('/custom/start',
    validateBody(customExpeditionSchema),
    async (req: Request, res: Response) => {
      try {
        const { playerId, biomeId, selectedResources, duration, selectedEquipment } = req.body;

        // Get player
        const player = await storage.getPlayer(playerId);
        if (!player) {
          return errorResponse(res, 404, 'Jogador não encontrado');
        }

        // Basic validation
        const hungerCost = Math.floor((duration / (60 * 1000)) * 0.8); // Duration in minutes * 0.8
        const thirstCost = Math.floor((duration / (60 * 1000)) * 0.6); // Duration in minutes * 0.6

        if (player.hunger < hungerCost) {
          return errorResponse(res, 400, `Fome insuficiente. Necessário: ${hungerCost}%, atual: ${player.hunger}%`);
        }

        if (player.thirst < thirstCost) {
          return errorResponse(res, 400, `Sede insuficiente. Necessário: ${thirstCost}%, atual: ${player.thirst}%`);
        }

        // Apply costs before creating expedition
        await storage.updatePlayer(playerId, {
          hunger: Math.max(0, player.hunger - hungerCost),
          thirst: Math.max(0, player.thirst - thirstCost),
          fatigue: Math.min(100, player.fatigue + Math.floor((duration / (60 * 1000)) * 0.3))
        });

        // Create expedition with custom parameters including duration
        const expedition = await storage.createExpedition({
          playerId,
          biomeId,
          selectedResources: selectedResources.map((r: any) => r.resourceId),
          selectedEquipment: selectedEquipment || [],
          duration: duration // Pass the custom duration in milliseconds
        });

        console.log(`🚀 CUSTOM-EXPEDITION: Started custom expedition ${expedition.id} for player ${playerId}`);

        return successResponse(res, expedition, 'Expedição customizada iniciada com sucesso');
      } catch (error: any) {
        console.error('❌ CUSTOM-EXPEDITION-START: Error:', error.message);
        return errorResponse(res, 500, error.message);
      }
    }
  );

  // Iniciar nova expedição
  router.post('/start',
    validateBody(startExpeditionSchema),
    async (req: Request, res: Response) => {
      try {
        const { playerId, templateId } = req.body;
        console.log(`🚀 EXPEDITION-START: Starting expedition for player ${playerId}, template ${templateId}`);

        // Validar requisitos incluindo recursos selecionados
        const validation = await expeditionService.validateExpeditionRequirements(
          playerId,
          templateId
        );

        if (!validation.valid) {
          return errorResponse(res, 400, 'Requisitos não atendidos');
        }

        const expedition = await expeditionService.startExpedition(playerId, templateId);

        return successResponse(res, expedition, 'Expedição iniciada com sucesso');
      } catch (error: any) {
        console.error('❌ EXPEDITION-START: Error:', error.message);
        return errorResponse(res, 400, error.message);
      }
    }
  );

  // Atualizar progresso de expedição
  router.patch('/:expeditionId/progress',
    validateParams(expeditionParamSchema),
    async (req: Request, res: Response) => {
      try {
        const { expeditionId } = req.params;
        console.log(`📈 EXPEDITION-PROGRESS: Updating expedition ${expeditionId}`);

        const expedition = await expeditionService.updateExpeditionProgress(expeditionId);

        if (!expedition) {
          return errorResponse(res, 404, 'Expedição não encontrada ou já finalizada');
        }

        return successResponse(res, expedition, 'Progresso atualizado');
      } catch (error: any) {
        console.error('❌ EXPEDITION-PROGRESS: Error:', error.message);
        return errorResponse(res, 400, error.message);
      }
    }
  );

  // Completar expedição manualmente
  router.post('/:expeditionId/complete',
    validateParams(expeditionParamSchema),
    async (req: Request, res: Response) => {
      try {
        const { expeditionId } = req.params;
        console.log(`🏁 EXPEDITION-COMPLETE: Completing expedition ${expeditionId}`);

        const expedition = await expeditionService.completeExpedition(expeditionId);

        // Update quest progress for expedition completion and resources collected
        if (expedition && expedition.playerId) {
          const { QuestService } = await import('../services/quest-service');
          const questService = new QuestService(storage);

          // Get the expedition template to access biomeId
          const template = expeditionService.getTemplateById(expedition.planId);
          if (template) {
            await questService.updateQuestProgress(expedition.playerId, 'expedition', { biomeId: template.biomeId });

            // Update quest progress for resources collected
            for (const [resourceId, quantity] of Object.entries(expedition.collectedResources)) {
              await questService.updateQuestProgress(expedition.playerId, 'collect', {
                resourceId,
                quantity
              });
            }
          } else {
            console.warn(`⚠️ EXPEDITION-COMPLETE: Template not found for planId: ${expedition.planId}`);
          }
        }

        return successResponse(res, expedition, 'Expedição completada com sucesso');
      } catch (error: any) {
        console.error('❌ EXPEDITION-COMPLETE: Error:', error.message);
        return errorResponse(res, 400, error.message);
      }
    }
  );

  // ===================== CONSULTAS =====================

  // Obter expedições ativas do jogador (rota principal)
  router.get('/active/:playerId',
    validateParams(playerParamSchema),
    async (req: Request, res: Response) => {
      try {
        const { playerId } = req.params;
        console.log(`🔍 EXPEDITION-ACTIVE: Fetching active expeditions for player ${playerId}`);

        const expeditions = await expeditionService.getPlayerActiveExpeditions(playerId);

        return successResponse(res, expeditions, 'Expedições ativas obtidas com sucesso');
      } catch (error: any) {
        console.error('❌ EXPEDITION-ACTIVE: Error:', error.message);
        return errorResponse(res, 500, error.message);
      }
    }
  );

  // Obter expedições ativas do jogador (rota alternativa)
  router.get('/player/:playerId/active',
    validateParams(playerParamSchema),
    async (req: Request, res: Response) => {
      try {
        const { playerId } = req.params;
        console.log(`🔍 EXPEDITION-ACTIVE: Fetching active expeditions for player ${playerId}`);

        const expeditions = await expeditionService.getPlayerActiveExpeditions(playerId);

        return successResponse(res, expeditions, 'Expedições ativas obtidas com sucesso');
      } catch (error: any) {
        console.error('❌ EXPEDITION-ACTIVE: Error:', error.message);
        return errorResponse(res, 500, error.message);
      }
    }
  );

  // Obter histórico de expedições do jogador
  router.get('/player/:playerId/history',
    validateParams(playerParamSchema),
    async (req: Request, res: Response) => {
      try {
        const { playerId } = req.params;
        console.log(`📚 EXPEDITION-HISTORY: Fetching expedition history for player ${playerId}`);

        const expeditions = await expeditionService.getExpeditionHistory(playerId);

        return successResponse(res, expeditions, 'Histórico de expedições obtido com sucesso');
      } catch (error: any) {
        console.error('❌ EXPEDITION-HISTORY: Error:', error.message);
        return errorResponse(res, 500, error.message);
      }
    }
  );

  // Check for combat encounter during expedition
  router.post('/:expeditionId/check-encounter', async (req: Request, res: Response) => {
    try {
      const { expeditionId } = req.params;
      const { playerId, biomeId } = req.body;

      if (!playerId || !biomeId) {
        return errorResponse(res, 400, 'Player ID and Biome ID are required');
      }

      const encounterId = await expeditionService.checkForCombatEncounter(expeditionId, playerId, biomeId);

      if (encounterId) {
        return successResponse(res, { 
          hasEncounter: true, 
          encounterId 
        }, 'Combat encounter generated');
      } else {
        return successResponse(res, { 
          hasEncounter: false 
        }, 'No encounter this time');
      }
    } catch (error: any) {
      console.error('❌ EXPEDITION-ENCOUNTER: Error checking for combat encounter:', error.message);
      return errorResponse(res, 500, error.message);
    }
  });

  // Reset/Fix problematic expeditions
  router.post('/player/:playerId/reset',
    validateParams(playerParamSchema),
    async (req: Request, res: Response) => {
      try {
        const { playerId } = req.params;
        console.log(`🔧 EXPEDITION-RESET: Resetting expeditions for player ${playerId}`);

        // Get all player expeditions
        const expeditions = await storage.getPlayerExpeditions(playerId);

        // Cancel all problematic expeditions (those with invalid timestamps)
        let resetCount = 0;
        for (const exp of expeditions) {
          if (exp.status === 'in_progress') {
            // Check if startTime is problematic (too far in the future)
            const currentTime = Date.now();
            const startTimeMs = exp.startTime && exp.startTime < 2000000000 ? exp.startTime * 1000 : exp.startTime;

            if (!startTimeMs || startTimeMs > currentTime + (24 * 60 * 60 * 1000)) {
              // Cancel this expedition as it has invalid timestamp
              await storage.updateExpedition(exp.id, { 
                status: 'failed',
                progress: 0 
              });
              resetCount++;
              console.log(`🔧 EXPEDITION-RESET: Cancelled problematic expedition ${exp.id}`);
            }
          }
        }

        return successResponse(res, { resetCount }, `Reset ${resetCount} problematic expeditions`);
      } catch (error: any) {
        console.error('❌ EXPEDITION-RESET: Error:', error.message);
        return errorResponse(res, 500, error.message);
      }
    }
  );

  // Complete expedition
  router.post('/complete/:expeditionId', async (req, res) => {
    try {
      const { expeditionId } = req.params;

      console.log(`🏁 ROUTE: Completing expedition ${expeditionId}`);

      const completedExpedition = await expeditionService.completeExpedition(expeditionId);

      console.log(`✅ ROUTE: Expedition ${expeditionId} completed successfully`);
      console.log(`🎁 ROUTE: Final rewards applied:`, completedExpedition.collectedResources);

      res.json({ 
        success: true, 
        message: 'Expedition completed successfully',
        data: completedExpedition
      });

    } catch (error) {
      console.error('❌ ROUTE: Complete expedition error:', error);
      res.status(500).json({ 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to complete expedition' 
      });
    }
  });

  return router;
}
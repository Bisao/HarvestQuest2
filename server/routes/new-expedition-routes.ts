import { Router, Request, Response } from 'express';
import { z } from 'zod';
import type { IStorage } from '../storage';
import { NewExpeditionService } from '../services/new-expedition-service';
import { validateParams, validateBody } from '../middleware/validation';
import { successResponse, errorResponse } from '../utils/response-helpers';
import { migrateLegacyCreatureId } from '../../shared/constants/creature-ids';

// Schemas de validação  
const startExpeditionTemplateSchema = z.object({
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
    validateBody(startExpeditionTemplateSchema),
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

  // Iniciar expedição customizada - rota corrigida
  router.post('/start-custom',
    validateBody(customExpeditionSchema),
    async (req: Request, res: Response) => {
      try {
        const { playerId, biomeId, selectedResources, duration, selectedEquipment } = req.body;
        console.log(`🚀 CUSTOM-EXPEDITION-START: Starting for player ${playerId}, biome ${biomeId}`);
        console.log(`📋 CUSTOM-EXPEDITION-START: Request data:`, { 
          playerId, 
          biomeId, 
          selectedResourcesCount: selectedResources?.length,
          duration,
          selectedEquipmentCount: selectedEquipment?.length
        });

        // Validar se playerId está presente
        if (!playerId) {
          console.error(`❌ CUSTOM-EXPEDITION-START: Missing playerId`);
          return errorResponse(res, 400, 'Player ID é obrigatório');
        }

        // Validar se selectedResources está presente e é um array válido
        if (!selectedResources || !Array.isArray(selectedResources) || selectedResources.length === 0) {
          console.error(`❌ CUSTOM-EXPEDITION-START: Invalid selectedResources:`, selectedResources);
          return errorResponse(res, 400, 'Recursos selecionados são obrigatórios');
        }

        // Get player using ID directly 
        const player = await storage.getPlayer(playerId);
        if (!player) {
          console.error(`❌ CUSTOM-EXPEDITION-START: Player not found: ${playerId}`);
          return errorResponse(res, 404, 'Jogador não encontrado');
        }

        console.log(`✅ CUSTOM-EXPEDITION-START: Player found: ${player.username} (Level ${player.level})`);
        console.log(`📊 CUSTOM-EXPEDITION-START: Player status - Hunger: ${player.hunger}%, Thirst: ${player.thirst}%, Health: ${player.health}%`);

        // Verificar se já tem expedição ativa
        const activeExpeditions = await storage.getPlayerExpeditions(playerId);
        const hasActive = activeExpeditions.some(exp => exp.status === 'in_progress');
        if (hasActive) {
          return errorResponse(res, 400, 'Você já tem uma expedição ativa');
        }

        // Validate biome exists
        const biomes = await storage.getAllBiomes();
        const biome = biomes.find(b => b.id === biomeId);
        if (!biome) {
          console.error(`❌ CUSTOM-EXPEDITION-START: Biome not found: ${biomeId}`);
          return errorResponse(res, 404, 'Bioma não encontrado');
        }

        // Validate selected resources exist
        const allResources = await storage.getAllResources();
        for (const resource of selectedResources) {
          const resourceExists = allResources.find(r => r.id === resource.resourceId);
          if (!resourceExists) {
            console.error(`❌ CUSTOM-EXPEDITION-START: Resource not found: ${resource.resourceId}`);
            return errorResponse(res, 400, `Recurso não encontrado: ${resource.resourceId}`);
          }
        }

        // Basic validation
        const durationMinutes = duration / (60 * 1000);
        const hungerCost = Math.floor(durationMinutes * 0.8);
        const thirstCost = Math.floor(durationMinutes * 0.6);

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
          fatigue: Math.min(100, player.fatigue + Math.floor(durationMinutes * 0.3))
        });

        // Create expedition with custom parameters
        const expeditionData = {
          id: `exp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          playerId: player.id, // Use player.id to ensure consistency
          biomeId,
          selectedResources: selectedResources.map((r: any) => r.resourceId),
          selectedEquipment: selectedEquipment || [],
          duration: duration,
          startTime: Math.floor(Date.now() / 1000), // Store as seconds
          status: 'in_progress' as const,
          progress: 0,
          collectedResources: {}
        };

        console.log(`🔧 CUSTOM-EXPEDITION: Creating expedition with data:`, expeditionData);

        const expedition = await storage.createExpedition(expeditionData);

        if (!expedition || !expedition.id) {
          console.error(`❌ CUSTOM-EXPEDITION: Failed to create expedition`);
          return errorResponse(res, 500, 'Falha ao criar expedição');
        }

        console.log(`✅ CUSTOM-EXPEDITION: Started expedition ${expedition.id} for player ${player.username}`);

        // Return expedition data in the expected format
        const responseData = {
          id: expedition.id,
          playerId: expedition.playerId,
          biomeId: expedition.biomeId,
          startTime: expedition.startTime,
          duration: expedition.duration,
          status: expedition.status,
          progress: expedition.progress || 0,
          collectedResources: expedition.collectedResources || {}
        };

        return successResponse(res, responseData, 'Expedição customizada iniciada com sucesso');
      } catch (error: any) {
        console.error('❌ CUSTOM-EXPEDITION-START: Error:', error.message);
        console.error('❌ CUSTOM-EXPEDITION-START: Stack:', error.stack);
        return errorResponse(res, 500, error.message);
      }
    }
  );

  // Iniciar nova expedição
  router.post('/start',
    validateBody(startExpeditionTemplateSchema),
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

  // Debug route to check expedition status
  router.get('/debug/:expeditionId', async (req, res) => {
    try {
      const { expeditionId } = req.params;
      
      const expedition = await storage.getExpedition(expeditionId);
      
      if (!expedition) {
        return res.status(404).json({
          success: false,
          message: 'Expedition not found'
        });
      }

      const currentTime = Date.now();
      const startTimeMs = expedition.startTime < 2000000000 ? expedition.startTime * 1000 : expedition.startTime;
      const duration = expedition.duration || (30 * 60 * 1000);
      const elapsed = currentTime - startTimeMs;
      const progress = Math.min(100, Math.max(0, (elapsed / duration) * 100));

      res.json({
        success: true,
        data: {
          expedition,
          debug: {
            currentTime,
            startTimeMs,
            duration,
            elapsed,
            progress: Math.round(progress),
            isComplete: progress >= 100,
            timeUntilComplete: duration - elapsed,
            combatChecked: expedition.combatEncounterChecked || false
          }
        }
      });

    } catch (error) {
      console.error('❌ ROUTE: Debug expedition error:', error);
      res.status(500).json({ 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to debug expedition' 
      });
    }
  });

  return router;
}
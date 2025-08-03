import { Router, Request, Response } from 'express';
import { z } from 'zod';
import type { IStorage } from '../storage';
import { NewExpeditionService } from '../services/new-expedition-service';
import { validateParams, validateBody } from '../middleware/validation';
import { successResponse, errorResponse } from '../utils/response-helpers';

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

        // Create expedition with custom parameters
        const expedition = await storage.createExpedition({
          playerId,
          biomeId,
          selectedResources: selectedResources.map(r => r.resourceId),
          selectedEquipment: selectedEquipment || [],
          duration,
          autoRepeat: false,
          maxRepeats: 1
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
        
        return successResponse(res, expedition, 'Expedição completada com sucesso');
      } catch (error: any) {
        console.error('❌ EXPEDITION-COMPLETE: Error:', error.message);
        return errorResponse(res, 400, error.message);
      }
    }
  );

  // ===================== CONSULTAS =====================

  // Obter expedições ativas do jogador
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

  return router;
}
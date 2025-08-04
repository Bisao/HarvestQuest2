
import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { equipmentService } from '../services/equipment-service';
import { validateBody } from '../middleware/validation';
import { successResponse, errorResponse } from '../utils/response-helpers';

const router = Router();

// Schema para equipar item
const equipItemSchema = z.object({
  playerId: z.string().uuid(),
  equipmentId: z.string().uuid(),
  slot: z.enum(['helmet', 'chestplate', 'leggings', 'boots', 'weapon', 'tool'])
});

// Schema para desequipar item
const unequipItemSchema = z.object({
  playerId: z.string().uuid(),
  slot: z.enum(['helmet', 'chestplate', 'leggings', 'boots', 'weapon', 'tool'])
});

// Equipar item
router.post('/equip', validateBody(equipItemSchema), async (req: Request, res: Response) => {
  try {
    const { playerId, equipmentId, slot } = req.body;

    const canEquip = await equipmentService.canEquipItem(playerId, equipmentId);
    if (!canEquip) {
      return errorResponse(res, 400, 'Não é possível equipar este item');
    }

    const success = await equipmentService.equipItem(playerId, equipmentId, slot);
    if (!success) {
      return errorResponse(res, 400, 'Falha ao equipar item');
    }

    return successResponse(res, null, 'Item equipado com sucesso');
  } catch (error: any) {
    console.error('❌ EQUIPMENT-ROUTE: Error equipping item:', error);
    return errorResponse(res, 500, 'Erro interno do servidor');
  }
});

// Desequipar item
router.post('/unequip', validateBody(unequipItemSchema), async (req: Request, res: Response) => {
  try {
    const { playerId, slot } = req.body;

    const success = await equipmentService.unequipItem(playerId, slot);
    if (!success) {
      return errorResponse(res, 400, 'Falha ao desequipar item');
    }

    return successResponse(res, null, 'Item desequipado com sucesso');
  } catch (error: any) {
    console.error('❌ EQUIPMENT-ROUTE: Error unequipping item:', error);
    return errorResponse(res, 500, 'Erro interno do servidor');
  }
});

// Obter equipamentos do jogador
router.get('/player/:playerId', async (req: Request, res: Response) => {
  try {
    const { playerId } = req.params;
    
    if (!playerId) {
      return errorResponse(res, 400, 'Player ID é obrigatório');
    }

    const equipment = await equipmentService.getPlayerEquipment(playerId);
    const bonuses = await equipmentService.calculateEquipmentBonuses(playerId);

    return successResponse(res, { equipment, bonuses });
  } catch (error: any) {
    console.error('❌ EQUIPMENT-ROUTE: Error getting player equipment:', error);
    return errorResponse(res, 500, 'Erro interno do servidor');
  }
});

export default router;

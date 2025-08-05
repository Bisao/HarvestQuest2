
import { Router } from 'express';
import { successResponse, errorResponse } from '../utils/response-helpers';
import { ALL_MODERN_ITEMS, getItemById } from '../data/equipment';

const router = Router();

// GET /api/items - Listar todos os itens
router.get('/', (req, res) => {
  successResponse(res, ALL_MODERN_ITEMS, "Itens carregados com sucesso");
});

// GET /api/items/:id - Buscar item específico
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const item = getItemById(id);
  
  if (!item) {
    return errorResponse(res, "Item não encontrado", 404);
  }
  
  successResponse(res, item, "Item encontrado");
});

export default router;

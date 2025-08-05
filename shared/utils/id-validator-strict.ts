/**
 * STRICT ID VALIDATOR
 * 
 * Validação rigorosa de IDs do sistema de jogo.
 * Garante que todos os IDs estejam em conformidade com os padrões UUID.
 */

import { getAllMasterIds } from './id-resolver';
import { RESOURCE_IDS, EQUIPMENT_IDS, RECIPE_IDS } from '../constants/game-ids';

/**
 * Verifica se um ID é válido no sistema
 */
export function isValidGameId(id: string): boolean {
  const masterIds = getAllMasterIds();
  return masterIds.includes(id);
}

/**
 * Valida todos os dados do jogo
 */
export function validateAllGameData(gameData: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!gameData) {
    errors.push('Dados do jogo não fornecidos');
    return { isValid: false, errors };
  }

  // Validar inventário se existir
  if (gameData.players) {
    for (const player of gameData.players) {
      if (player.inventory) {
        for (const item of player.inventory) {
          if (item.resourceId && !isValidGameId(item.resourceId)) {
            errors.push(`ID de recurso inválido no inventário: ${item.resourceId}`);
          }
        }
      }

      // Validar equipamentos equipados
      const equippedItems = [
        player.equippedWeapon,
        player.equippedTool,
        player.equippedHelmet,
        player.equippedChestplate,
        player.equippedLeggings,
        player.equippedBoots
      ].filter(Boolean);

      for (const equipmentId of equippedItems) {
        if (!isValidGameId(equipmentId)) {
          errors.push(`ID de equipamento equipado inválido: ${equipmentId}`);
        }
      }
    }
  }

  // Validar receitas se existirem
  if (gameData.recipes) {
    for (const recipe of gameData.recipes) {
      if (recipe.id && !isValidGameId(recipe.id)) {
        errors.push(`ID de receita inválido: ${recipe.id}`);
      }

      if (recipe.requirements) {
        for (const req of recipe.requirements) {
          if (req.resourceId && !isValidGameId(req.resourceId)) {
            errors.push(`ID de recurso em receita inválido: ${req.resourceId}`);
          }
        }
      }

      if (recipe.results) {
        for (const result of recipe.results) {
          if (result.resourceId && !isValidGameId(result.resourceId)) {
            errors.push(`ID de resultado de receita inválido: ${result.resourceId}`);
          }
        }
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Valida formato UUID específico por categoria
 */
export function validateIdByCategory(id: string, category: 'resource' | 'equipment' | 'recipe' | 'biome' | 'quest' | 'skill'): boolean {
  const patterns = {
    resource: /^res-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    equipment: /^eq-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    recipe: /^rec-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    biome: /^biome-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    quest: /^quest-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    skill: /^skill-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  };

  return patterns[category]?.test(id) || false;
}

/**
 * Busca IDs inválidos em uma estrutura de dados
 */
export function findInvalidIds(data: any, path = ''): Array<{ path: string; id: string; reason: string }> {
  const invalid: Array<{ path: string; id: string; reason: string }> = [];

  function traverse(obj: any, currentPath: string) {
    if (typeof obj === 'string' && obj.includes('-') && obj.length > 10) {
      // Possível ID, validar
      if (!isValidGameId(obj)) {
        invalid.push({
          path: currentPath,
          id: obj,
          reason: 'ID não encontrado no sistema mestre'
        });
      }
    } else if (typeof obj === 'object' && obj !== null) {
      if (Array.isArray(obj)) {
        obj.forEach((item, index) => {
          traverse(item, `${currentPath}[${index}]`);
        });
      } else {
        Object.entries(obj).forEach(([key, value]) => {
          traverse(value, currentPath ? `${currentPath}.${key}` : key);
        });
      }
    }
  }

  traverse(data, path);
  return invalid;
}

/**
 * Relatório completo de validação
 */
export function generateValidationReport(gameData: any) {
  const startTime = Date.now();
  
  const masterIds = getAllMasterIds();
  const validation = validateAllGameData(gameData);
  const invalidIds = findInvalidIds(gameData);
  
  const report = {
    timestamp: new Date().toISOString(),
    validationTimeMs: Date.now() - startTime,
    summary: {
      totalMasterIds: masterIds.length,
      isValid: validation.isValid,
      totalErrors: validation.errors.length,
      invalidIdsFound: invalidIds.length
    },
    errors: validation.errors,
    invalidIds: invalidIds.slice(0, 20), // Limita para não sobrecarregar
    idStatistics: {
      resources: Object.keys(RESOURCE_IDS).length,
      equipment: Object.keys(EQUIPMENT_IDS).length,
      recipes: Object.keys(RECIPE_IDS).length
    }
  };

  return report;
}
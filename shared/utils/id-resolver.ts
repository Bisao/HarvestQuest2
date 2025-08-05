/**
 * ID RESOLVER UTILITIES
 * 
 * Utilitários para resolução e validação de IDs do sistema de jogo.
 * Centraliza a lógica de validação e resolução de IDs entre diferentes módulos.
 */

import { RESOURCE_IDS, EQUIPMENT_IDS, RECIPE_IDS, BIOME_IDS, QUEST_IDS, SKILL_IDS } from '../constants/game-ids';

/**
 * Interface para resultado de validação
 */
export interface ValidationResult {
  isValid: boolean;
  message: string;
  errors?: string[];
}

/**
 * Valida se o sistema de IDs está consistente na inicialização
 */
export function validateGameStartup(): ValidationResult {
  const errors: string[] = [];

  // Verifica se todas as constantes existem
  if (!RESOURCE_IDS || Object.keys(RESOURCE_IDS).length === 0) {
    errors.push('RESOURCE_IDS não encontrado ou vazio');
  }

  if (!EQUIPMENT_IDS || Object.keys(EQUIPMENT_IDS).length === 0) {
    errors.push('EQUIPMENT_IDS não encontrado ou vazio');
  }

  if (!RECIPE_IDS || Object.keys(RECIPE_IDS).length === 0) {
    errors.push('RECIPE_IDS não encontrado ou vazio');
  }

  // Verifica formato UUID básico
  const allIds = getAllMasterIds();
  const invalidIds = allIds.filter(id => !isValidUUIDFormat(id));
  
  if (invalidIds.length > 0) {
    errors.push(`IDs com formato inválido: ${invalidIds.slice(0, 5).join(', ')}${invalidIds.length > 5 ? '...' : ''}`);
  }

  return {
    isValid: errors.length === 0,
    message: errors.length === 0 ? 'Sistema de IDs válido' : `${errors.length} erro(s) encontrado(s)`,
    errors: errors.length > 0 ? errors : undefined
  };
}

/**
 * Retorna todos os IDs mestres do sistema
 */
export function getAllMasterIds(): string[] {
  return [
    ...Object.values(RESOURCE_IDS),
    ...Object.values(EQUIPMENT_IDS),
    ...Object.values(RECIPE_IDS),
    ...(BIOME_IDS ? Object.values(BIOME_IDS) : []),
    ...(QUEST_IDS ? Object.values(QUEST_IDS) : []),
    ...(SKILL_IDS ? Object.values(SKILL_IDS) : [])
  ];
}

/**
 * Atualiza IDs para usar a versão mestre (placeholder para migração futura)
 */
export function updateToMasterIds(data: any): any {
  // Implementação futura para sincronização com IDs mestres
  console.warn('updateToMasterIds: Função placeholder - implementação futura');
  return data;
}

/**
 * Verifica se um ID tem formato UUID válido
 */
function isValidUUIDFormat(id: string): boolean {
  // Aceita formatos: prefix-uuid ou uuid simples
  const uuidPattern = /^[a-z]+-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const simpleUuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  
  return uuidPattern.test(id) || simpleUuidPattern.test(id);
}

/**
 * Obtém estatísticas dos IDs do sistema
 */
export function getIdStatistics() {
  return {
    resources: Object.keys(RESOURCE_IDS).length,
    equipment: Object.keys(EQUIPMENT_IDS).length,
    recipes: Object.keys(RECIPE_IDS).length,
    biomes: BIOME_IDS ? Object.keys(BIOME_IDS).length : 0,
    quests: QUEST_IDS ? Object.keys(QUEST_IDS).length : 0,
    skills: SKILL_IDS ? Object.keys(SKILL_IDS).length : 0,
    total: getAllMasterIds().length
  };
}
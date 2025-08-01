
/**
 * UUID GENERATION SYSTEM
 * 
 * Sistema centralizado para geração de UUIDs para todos os elementos do jogo.
 * REGRA: Todos os novos IDs DEVEM ser UUIDs v4 gerados por este sistema.
 */

import { randomUUID } from 'crypto';

// Prefixos para diferentes tipos de IDs
export const ID_PREFIXES = {
  RESOURCE: 'res',
  EQUIPMENT: 'eq', 
  RECIPE: 'rec',
  BIOME: 'biome',
  QUEST: 'quest'
} as const;

/**
 * Gera um UUID v4 válido
 */
export function generateUUID(): string {
  return randomUUID();
}

/**
 * Gera um ID com prefixo e UUID
 * @param prefix - Prefixo do tipo de ID
 * @returns ID no formato: prefix-uuid
 */
export function generateGameId(prefix: keyof typeof ID_PREFIXES): string {
  const prefixValue = ID_PREFIXES[prefix];
  const uuid = generateUUID();
  return `${prefixValue}-${uuid}`;
}

/**
 * Valida se um ID é um UUID válido
 */
export function isValidUUID(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

/**
 * Valida se um game ID tem formato correto (prefix-uuid)
 */
export function isValidGameIdFormat(id: string): boolean {
  const parts = id.split('-');
  if (parts.length !== 6) return false; // prefix + 5 UUID parts
  
  const prefix = parts[0];
  const uuidPart = parts.slice(1).join('-');
  
  const validPrefixes = Object.values(ID_PREFIXES);
  return validPrefixes.includes(prefix as any) && isValidUUID(uuidPart);
}

/**
 * Extrai o tipo de um game ID
 */
export function getIdType(id: string): string | null {
  const prefix = id.split('-')[0];
  const prefixEntry = Object.entries(ID_PREFIXES).find(([, value]) => value === prefix);
  return prefixEntry ? prefixEntry[0] : null;
}

/**
 * Helper functions para gerar IDs específicos
 */
export const generateResourceId = () => generateGameId('RESOURCE');
export const generateEquipmentId = () => generateGameId('EQUIPMENT');
export const generateRecipeId = () => generateGameId('RECIPE');
export const generateBiomeId = () => generateGameId('BIOME');
export const generateQuestId = () => generateGameId('QUEST');

/**
 * Converte IDs antigos para UUIDs
 * Mantém um mapeamento para compatibilidade
 */
export function convertLegacyIdToUUID(legacyId: string): string {
  // Se já é um UUID válido, retorna como está
  if (isValidGameIdFormat(legacyId)) {
    return legacyId;
  }
  
  // Gera novo UUID baseado no tipo
  if (legacyId.startsWith('res-')) return generateResourceId();
  if (legacyId.startsWith('eq-')) return generateEquipmentId();
  if (legacyId.startsWith('rec-')) return generateRecipeId();
  if (legacyId.startsWith('biome-')) return generateBiomeId();
  if (legacyId.startsWith('quest-')) return generateQuestId();
  
  // Fallback: gera um resource ID
  console.warn(`Converting unknown legacy ID to resource UUID: ${legacyId}`);
  return generateResourceId();
}

/**
 * Sistema de validação strict para UUIDs
 */
export function enforceUUIDOnly(id: string): boolean {
  if (!isValidGameIdFormat(id)) {
    throw new Error(`INVALID ID FORMAT: ${id}. All IDs must be UUIDs in format: prefix-uuid`);
  }
  return true;
}

/**
 * Middleware para garantir que apenas UUIDs sejam aceitos
 */
export function validateUUIDMiddleware(ids: string[]): void {
  const invalidIds = ids.filter(id => !isValidGameIdFormat(id));
  
  if (invalidIds.length > 0) {
    throw new Error(`INVALID UUID IDs DETECTED: ${invalidIds.join(', ')}. All IDs must be UUIDs.`);
  }
}

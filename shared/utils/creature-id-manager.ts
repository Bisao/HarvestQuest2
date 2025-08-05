
/**
 * CREATURE ID MANAGEMENT SYSTEM
 * 
 * Sistema centralizado para gerenciar IDs de criaturas separadamente dos recursos.
 * Oferece utilitários para validação, migração e resolução de IDs de criaturas.
 */

import { CREATURE_IDS } from '../constants/creature-ids';

import { generateUUID } from './uuid-generator';

// ===================== CREATURE ID GENERATION =====================

/**
 * Gera um novo ID de criatura com formato padronizado
 */
export function generateCreatureId(): string {
  return `creature-${generateUUID()}`;
}

/**
 * Gera múltiplos IDs de criatura
 */
export function generateMultipleCreatureIds(count: number): string[] {
  return Array.from({ length: count }, () => generateCreatureId());
}

// ===================== VALIDATION & VERIFICATION =====================

/**
 * Valida se um ID segue o padrão de criatura
 */
export function validateCreatureIdFormat(id: string): boolean {
  const creatureUuidRegex = /^creature-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return creatureUuidRegex.test(id);
}

/**
 * Verifica se um ID de criatura existe no sistema
 */
export function creatureExists(creatureId: string): boolean {
  return Object.values(CREATURE_IDS).includes(creatureId as any);
}

/**
 * Valida uma lista de IDs de criatura
 */
export function validateCreatureIds(ids: string[]): {
  valid: string[];
  invalid: string[];
  errors: string[];
} {
  const valid: string[] = [];
  const invalid: string[] = [];
  const errors: string[] = [];

  for (const id of ids) {
    if (!validateCreatureIdFormat(id)) {
      invalid.push(id);
      errors.push(`Invalid format: ${id}`);
    } else if (!creatureExists(id)) {
      invalid.push(id);
      errors.push(`Creature not found: ${id}`);
    } else {
      valid.push(id);
    }
  }

  return { valid, invalid, errors };
}

// ===================== CREATURE LOOKUP & SEARCH =====================

/**
 * Busca criaturas por categoria
 */
export function findCreaturesByCategory(category: keyof typeof CREATURE_CATEGORIES): string[] {
  return Array.from(getCreaturesByCategory(category));
}

/**
 * Busca criaturas por padrão de nome
 */
export function findCreaturesByPattern(pattern: string): string[] {
  const regex = new RegExp(pattern, 'i');
  return Object.entries(CREATURE_IDS)
    .filter(([name]) => regex.test(name))
    .map(([, id]) => id);
}

/**
 * Obtém informações detalhadas de uma criatura
 */
export function getCreatureInfo(creatureId: string): {
  id: string;
  name: string;
  category: string | null;
  isValid: boolean;
} | null {
  if (!creatureExists(creatureId)) {
    return null;
  }

  // Encontra o nome da criatura
  const name = Object.entries(CREATURE_IDS)
    .find(([, id]) => id === creatureId)?.[0] || 'UNKNOWN';

  return {
    id: creatureId,
    name,
    category: getCreatureCategory(creatureId),
    isValid: true
  };
}

// ===================== MIGRATION & COMPATIBILITY =====================

/**
 * Migra IDs antigos de recursos que eram criaturas
 */
export function migrateResourceToCreature(resourceId: string): string {
  return migrateLegacyCreatureId(resourceId);
}

/**
 * Migra uma lista de IDs mistos (recursos/criaturas)
 */
export function migrateMixedIds(ids: string[]): {
  resources: string[];
  creatures: string[];
  migrated: Array<{ old: string; new: string }>;
} {
  const resources: string[] = [];
  const creatures: string[] = [];
  const migrated: Array<{ old: string; new: string }> = [];

  for (const id of ids) {
    if (isCreatureId(id)) {
      creatures.push(id);
    } else if (id in LEGACY_CREATURE_MAPPING) {
      const newId = migrateLegacyCreatureId(id);
      creatures.push(newId);
      migrated.push({ old: id, new: newId });
    } else {
      resources.push(id);
    }
  }

  return { resources, creatures, migrated };
}

// ===================== STATISTICS & ANALYTICS =====================

/**
 * Obtém estatísticas do sistema de criaturas
 */
export function getCreatureSystemStats(): {
  totalCreatures: number;
  categoriesCount: number;
  categories: Record<string, number>;
  validationStatus: ReturnType<typeof validateCreatureData>;
} {
  const categories: Record<string, number> = {};
  
  for (const [category, creatures] of Object.entries(CREATURE_CATEGORIES)) {
    categories[category] = creatures.length;
  }

  return {
    totalCreatures: getAllCreatureIds().length,
    categoriesCount: Object.keys(CREATURE_CATEGORIES).length,
    categories,
    validationStatus: validateCreatureData()
  };
}

// ===================== UTILITY EXPORTS =====================

export {
  CREATURE_IDS,
  CREATURE_CATEGORIES,
  isCreatureId,
  isValidCreatureId,
  getCreatureCategory,
  getAllCreatureIds
};

// ===================== ENFORCEMENT & SAFETY =====================

/**
 * Força um ID a ser um ID de criatura válido ou gera um novo
 */
export function enforceCreatureId(id: string): string {
  if (isValidCreatureId(id)) {
    return id;
  }
  
  // Tenta migrar se for um ID legado
  const migrated = migrateLegacyCreatureId(id);
  if (migrated !== id && isValidCreatureId(migrated)) {
    console.log(`🔄 CREATURE-MIGRATION: ${id} -> ${migrated}`);
    return migrated;
  }
  
  // Gera novo ID
  const newId = generateCreatureId();
  console.warn(`🆕 CREATURE-NEW-ID: Generated ${newId} for invalid ${id}`);
  return newId;
}

/**
 * Middleware para garantir que apenas IDs de criatura válidos sejam aceitos
 */
export function validateCreatureMiddleware(ids: string[]): void {
  const { invalid, errors } = validateCreatureIds(ids);
  
  if (invalid.length > 0) {
    throw new Error(`INVALID CREATURE IDs: ${errors.join(', ')}`);
  }
}

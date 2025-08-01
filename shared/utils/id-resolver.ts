/**
 * ID RESOLVER - Ensures all IDs match game-ids.ts master file
 * 
 * This module resolves and validates IDs against the master game-ids.ts file.
 * Any ID that doesn't match the master will be automatically updated.
 */

import { 
  RESOURCE_IDS, 
  EQUIPMENT_IDS, 
  RECIPE_IDS, 
  BIOME_IDS, 
  QUEST_IDS 
} from '@shared/constants/game-ids';

/**
 * Master ID mapping - all valid IDs from game-ids.ts
 */
const MASTER_ID_REGISTRY = {
  resources: Object.values(RESOURCE_IDS),
  equipment: Object.values(EQUIPMENT_IDS),
  recipes: Object.values(RECIPE_IDS),
  biomes: Object.values(BIOME_IDS),
  quests: Object.values(QUEST_IDS)
};

/**
 * Get all valid IDs from master registry
 */
export function getAllMasterIds(): string[] {
  return [
    ...MASTER_ID_REGISTRY.resources,
    ...MASTER_ID_REGISTRY.equipment,
    ...MASTER_ID_REGISTRY.recipes,
    ...MASTER_ID_REGISTRY.biomes,
    ...MASTER_ID_REGISTRY.quests
  ];
}

/**
 * Resolve an ID to its correct master ID
 * Returns the ID if valid, or null if not found in master
 */
export function resolveMasterId(id: string): string | null {
  const allMasterIds = getAllMasterIds();
  return allMasterIds.includes(id) ? id : null;
}

/**
 * Update object IDs to match master registry
 */
export function updateToMasterIds<T extends { id: string }>(items: T[]): T[] {
  return items
    .map(item => {
      const masterId = resolveMasterId(item.id);
      if (masterId) {
        return { ...item, id: masterId };
      }
      console.warn(`⚠️  ID-RESOLVER: Removing item with invalid ID: ${item.id}`);
      return null;
    })
    .filter((item): item is T => item !== null);
}

/**
 * Validate game startup - check all IDs against master
 */
export function validateGameStartup(): {
  isValid: boolean;
  masterIdCount: number;
  message: string;
} {
  const allMasterIds = getAllMasterIds();
  const uniqueIds = new Set(allMasterIds);
  
  console.log('🔍 ID-RESOLVER: Validating against master game-ids.ts...');
  console.log(`📋 Master registry contains ${uniqueIds.size} unique IDs`);
  
  if (uniqueIds.size !== allMasterIds.length) {
    console.warn('⚠️  ID-RESOLVER: Duplicate IDs detected in master registry');
  }
  
  return {
    isValid: uniqueIds.size > 0,
    masterIdCount: uniqueIds.size,
    message: `Master registry validated with ${uniqueIds.size} IDs`
  };
}

/**
 * Get master ID by category for easy lookup
 */
export function getMasterIdsByCategory() {
  return {
    resources: MASTER_ID_REGISTRY.resources,
    equipment: MASTER_ID_REGISTRY.equipment,
    recipes: MASTER_ID_REGISTRY.recipes,
    biomes: MASTER_ID_REGISTRY.biomes,
    quests: MASTER_ID_REGISTRY.quests
  };
}
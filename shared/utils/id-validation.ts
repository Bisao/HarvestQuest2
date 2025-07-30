
import { RESOURCE_IDS, EQUIPMENT_IDS, RECIPE_IDS, BIOME_IDS, QUEST_IDS } from '../constants/game-ids';

/**
 * Centralized ID validation and conversion utilities
 * Ensures consistency across all game systems
 */

export interface StandardizedItemReference {
  itemId: string;          // The standardized game item ID
  recordId?: string;       // Database record ID (for inventory/storage entries)
  type: 'resource' | 'equipment' | 'consumable';
}

export function isValidResourceId(id: string): boolean {
  return Object.values(RESOURCE_IDS).includes(id as any);
}

export function isValidEquipmentId(id: string): boolean {
  return Object.values(EQUIPMENT_IDS).includes(id as any);
}

export function isValidRecipeId(id: string): boolean {
  return Object.values(RECIPE_IDS).includes(id as any);
}

export function isValidBiomeId(id: string): boolean {
  return Object.values(BIOME_IDS).includes(id as any);
}

export function isValidQuestId(id: string): boolean {
  return Object.values(QUEST_IDS).includes(id as any);
}

export function isValidGameId(id: string): boolean {
  return isValidResourceId(id) || 
         isValidEquipmentId(id) || 
         isValidRecipeId(id) || 
         isValidBiomeId(id) || 
         isValidQuestId(id);
}

export function getItemType(itemId: string): 'resource' | 'equipment' | 'unknown' {
  if (isValidResourceId(itemId)) return 'resource';
  if (isValidEquipmentId(itemId)) return 'equipment';
  return 'unknown';
}

/**
 * Standardizes item references across all systems
 */
export function standardizeItemReference(
  itemId: string, 
  recordId?: string
): StandardizedItemReference | null {
  const type = getItemType(itemId);
  
  if (type === 'unknown') {
    console.warn(`Invalid item ID: ${itemId}`);
    return null;
  }

  return {
    itemId,
    recordId,
    type: type as 'resource' | 'equipment'
  };
}

/**
 * Validates that an item reference is complete and valid
 */
export function validateItemReference(ref: any): ref is StandardizedItemReference {
  return ref && 
         typeof ref.itemId === 'string' && 
         isValidGameId(ref.itemId) &&
         ['resource', 'equipment', 'consumable'].includes(ref.type);
}

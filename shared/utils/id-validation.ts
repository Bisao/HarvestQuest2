
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
 * Validate that all recipe ingredients use valid game IDs
 * This ensures consistency with shared/constants/game-ids.ts
 */
export function validateRecipeIngredients(recipes: any[]): { 
  isValid: boolean; 
  errors: string[]; 
  invalidIds: string[] 
} {
  const errors: string[] = [];
  const invalidIds: string[] = [];
  
  for (const recipe of recipes) {
    // Validate recipe ID
    if (!isValidRecipeId(recipe.id)) {
      errors.push(`Invalid recipe ID: ${recipe.id}`);
      invalidIds.push(recipe.id);
    }
    
    // Validate output ID
    if (recipe.output?.itemId && !isValidGameId(recipe.output.itemId)) {
      errors.push(`Invalid output ID in recipe ${recipe.id}: ${recipe.output.itemId}`);
      invalidIds.push(recipe.output.itemId);
    }
    
    // Validate ingredient IDs
    if (recipe.ingredients) {
      for (const ingredient of recipe.ingredients) {
        if (!isValidGameId(ingredient.itemId)) {
          errors.push(`Invalid ingredient ID in recipe ${recipe.id}: ${ingredient.itemId}`);
          invalidIds.push(ingredient.itemId);
        }
      }
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    invalidIds: Array.from(new Set(invalidIds)) // Remove duplicates
  };
}

/**
 * Validate all game data consistency
 */
export function validateGameDataConsistency(): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check for duplicate IDs across categories
  const allIds = [
    ...Object.values(RESOURCE_IDS),
    ...Object.values(EQUIPMENT_IDS),
    ...Object.values(RECIPE_IDS),
    ...Object.values(BIOME_IDS),
    ...Object.values(QUEST_IDS)
  ];
  
  const duplicates = allIds.filter((id, index) => allIds.indexOf(id) !== index);
  if (duplicates.length > 0) {
    errors.push(`Duplicate IDs found: ${duplicates.join(', ')}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
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

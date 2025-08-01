/**
 * STRICT ID VALIDATION SYSTEM
 * 
 * This is the authoritative ID validation system that ensures ALL game data
 * uses ONLY IDs from the central game-ids.ts file. No exceptions.
 * 
 * RULES:
 * 1. game-ids.ts is the MASTER source of truth for ALL IDs
 * 2. Any ID not in game-ids.ts is INVALID and must be removed
 * 3. No hardcoded IDs allowed anywhere in the codebase
 * 4. All data files must import and use IDs from game-ids.ts
 */

import { 
  RESOURCE_IDS, 
  EQUIPMENT_IDS, 
  RECIPE_IDS, 
  BIOME_IDS, 
  QUEST_IDS 
} from '@shared/constants/game-ids';

// Create sets for fast lookup
const VALID_RESOURCE_IDS = new Set(Object.values(RESOURCE_IDS));
const VALID_EQUIPMENT_IDS = new Set(Object.values(EQUIPMENT_IDS));
const VALID_RECIPE_IDS = new Set(Object.values(RECIPE_IDS));
const VALID_BIOME_IDS = new Set(Object.values(BIOME_IDS));
const VALID_QUEST_IDS = new Set(Object.values(QUEST_IDS));
const ALL_VALID_IDS = new Set([
  ...Array.from(VALID_RESOURCE_IDS),
  ...Array.from(VALID_EQUIPMENT_IDS),
  ...Array.from(VALID_RECIPE_IDS),
  ...Array.from(VALID_BIOME_IDS),
  ...Array.from(VALID_QUEST_IDS)
]);

export interface ValidationResult {
  isValid: boolean;
  invalidIds: string[];
  missingIds: string[];
  errors: string[];
  warnings: string[];
}

/**
 * Validates that an ID exists in game-ids.ts
 */
export function isValidGameId(id: string): boolean {
  return ALL_VALID_IDS.has(id as any);
}

/**
 * Validates a resource ID specifically
 */
export function isValidResourceId(id: string): boolean {
  return VALID_RESOURCE_IDS.has(id as any);
}

/**
 * Validates an equipment ID specifically
 */
export function isValidEquipmentId(id: string): boolean {
  return VALID_EQUIPMENT_IDS.has(id as any);
}

/**
 * Validates a recipe ID specifically
 */
export function isValidRecipeId(id: string): boolean {
  return VALID_RECIPE_IDS.has(id as any);
}

/**
 * Validates a biome ID specifically
 */
export function isValidBiomeId(id: string): boolean {
  return VALID_BIOME_IDS.has(id as any);
}

/**
 * Validates a quest ID specifically
 */
export function isValidQuestId(id: string): boolean {
  return VALID_QUEST_IDS.has(id as any);
}

/**
 * Validates an array of items, checking all IDs against game-ids.ts
 */
export function validateItemIds(items: any[]): ValidationResult {
  const errors: string[] = [];
  const invalidIds: string[] = [];
  const warnings: string[] = [];

  for (const item of items) {
    if (!item.id) {
      errors.push(`Item missing ID: ${JSON.stringify(item)}`);
      continue;
    }

    if (!isValidGameId(item.id)) {
      errors.push(`Invalid ID found: ${item.id} (not in game-ids.ts)`);
      invalidIds.push(item.id);
    }

    // Check ingredient IDs for recipes
    if (item.ingredients) {
      for (const ingredient of item.ingredients) {
        if (!isValidGameId(ingredient.itemId)) {
          errors.push(`Invalid ingredient ID in ${item.id}: ${ingredient.itemId}`);
          invalidIds.push(ingredient.itemId);
        }
      }
    }

    // Check output IDs for recipes
    if (item.outputs) {
      for (const output of item.outputs) {
        if (!isValidGameId(output.itemId)) {
          errors.push(`Invalid output ID in ${item.id}: ${output.itemId}`);
          invalidIds.push(output.itemId);
        }
      }
    }
  }

  return {
    isValid: errors.length === 0,
    invalidIds: Array.from(new Set(invalidIds)),
    missingIds: [],
    errors,
    warnings
  };
}

/**
 * Validates recipe data specifically
 */
export function validateRecipeData(recipes: any[]): ValidationResult {
  const errors: string[] = [];
  const invalidIds: string[] = [];
  const warnings: string[] = [];

  for (const recipe of recipes) {
    // Validate recipe ID
    if (!isValidRecipeId(recipe.id)) {
      errors.push(`Invalid recipe ID: ${recipe.id} (not in RECIPE_IDS)`);
      invalidIds.push(recipe.id);
    }

    // Validate ingredient IDs
    if (recipe.ingredients) {
      for (const ingredient of recipe.ingredients) {
        if (!isValidResourceId(ingredient.itemId) && !isValidEquipmentId(ingredient.itemId)) {
          errors.push(`Invalid ingredient ID in recipe ${recipe.id}: ${ingredient.itemId}`);
          invalidIds.push(ingredient.itemId);
        }
      }
    }

    // Validate output IDs
    if (recipe.outputs) {
      for (const output of recipe.outputs) {
        if (!isValidResourceId(output.itemId) && !isValidEquipmentId(output.itemId)) {
          errors.push(`Invalid output ID in recipe ${recipe.id}: ${output.itemId}`);
          invalidIds.push(output.itemId);
        }
      }
    }
  }

  return {
    isValid: errors.length === 0,
    invalidIds: Array.from(new Set(invalidIds)),
    missingIds: [],
    errors,
    warnings
  };
}

/**
 * Validates storage/inventory data
 */
export function validateStorageData(items: any[]): ValidationResult {
  const errors: string[] = [];
  const invalidIds: string[] = [];
  const warnings: string[] = [];

  for (const item of items) {
    if (item.resourceId && !isValidResourceId(item.resourceId) && !isValidEquipmentId(item.resourceId)) {
      errors.push(`Invalid resource ID in storage: ${item.resourceId}`);
      invalidIds.push(item.resourceId);
    }
  }

  return {
    isValid: errors.length === 0,
    invalidIds: Array.from(new Set(invalidIds)),
    missingIds: [],
    errors,
    warnings
  };
}

/**
 * Comprehensive validation of all game data
 */
export function validateAllGameData(gameData: {
  resources?: any[];
  equipment?: any[];
  recipes?: any[];
  biomes?: any[];
  quests?: any[];
  storage?: any[];
  inventory?: any[];
}): ValidationResult {
  const allErrors: string[] = [];
  const allInvalidIds: string[] = [];
  const allWarnings: string[] = [];

  // Validate each data type
  if (gameData.resources) {
    const result = validateItemIds(gameData.resources);
    allErrors.push(...result.errors);
    allInvalidIds.push(...result.invalidIds);
    allWarnings.push(...result.warnings);
  }

  if (gameData.equipment) {
    const result = validateItemIds(gameData.equipment);
    allErrors.push(...result.errors);
    allInvalidIds.push(...result.invalidIds);
    allWarnings.push(...result.warnings);
  }

  if (gameData.recipes) {
    const result = validateRecipeData(gameData.recipes);
    allErrors.push(...result.errors);
    allInvalidIds.push(...result.invalidIds);
    allWarnings.push(...result.warnings);
  }

  if (gameData.biomes) {
    const result = validateItemIds(gameData.biomes);
    allErrors.push(...result.errors);
    allInvalidIds.push(...result.invalidIds);
    allWarnings.push(...result.warnings);
  }

  if (gameData.quests) {
    const result = validateItemIds(gameData.quests);
    allErrors.push(...result.errors);
    allInvalidIds.push(...result.invalidIds);
    allWarnings.push(...result.warnings);
  }

  if (gameData.storage) {
    const result = validateStorageData(gameData.storage);
    allErrors.push(...result.errors);
    allInvalidIds.push(...result.invalidIds);
    allWarnings.push(...result.warnings);
  }

  if (gameData.inventory) {
    const result = validateStorageData(gameData.inventory);
    allErrors.push(...result.errors);
    allInvalidIds.push(...result.invalidIds);
    allWarnings.push(...result.warnings);
  }

  return {
    isValid: allErrors.length === 0,
    invalidIds: Array.from(new Set(allInvalidIds)),
    missingIds: [],
    errors: allErrors,
    warnings: allWarnings
  };
}

/**
 * Get all valid IDs for reference
 */
export function getAllValidIds(): {
  resources: string[];
  equipment: string[];
  recipes: string[];
  biomes: string[];
  quests: string[];
  all: string[];
} {
  return {
    resources: Array.from(VALID_RESOURCE_IDS),
    equipment: Array.from(VALID_EQUIPMENT_IDS),
    recipes: Array.from(VALID_RECIPE_IDS),
    biomes: Array.from(VALID_BIOME_IDS),
    quests: Array.from(VALID_QUEST_IDS),
    all: Array.from(ALL_VALID_IDS)
  };
}

/**
 * Reports all invalid IDs found in the system
 */
export function generateIdReport(): string {
  const validIds = getAllValidIds();
  let report = "\n=== GAME ID VALIDATION REPORT ===\n\n";
  
  report += "VALID IDs FROM game-ids.ts:\n";
  report += `- Resources: ${validIds.resources.length} IDs\n`;
  report += `- Equipment: ${validIds.equipment.length} IDs\n`;
  report += `- Recipes: ${validIds.recipes.length} IDs\n`;
  report += `- Biomes: ${validIds.biomes.length} IDs\n`;
  report += `- Quests: ${validIds.quests.length} IDs\n`;
  report += `- TOTAL: ${validIds.all.length} valid IDs\n\n`;
  
  report += "RULE: Any ID not listed above is INVALID and must be removed.\n";
  report += "RULE: All data files must import IDs from @shared/constants/game-ids\n";
  
  return report;
}
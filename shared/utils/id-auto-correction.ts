/**
 * ID AUTO-CORRECTION SYSTEM
 * 
 * Automatically maps invalid/legacy IDs to correct game-ids.ts IDs
 * This ensures any old or invalid ID is corrected to match master registry
 */

import { RESOURCE_IDS, EQUIPMENT_IDS, RECIPE_IDS, BIOME_IDS, QUEST_IDS } from '@shared/constants/game-ids';

/**
 * Master ID mapping table - maps legacy/invalid IDs to correct game-ids.ts IDs
 */
const ID_CORRECTION_MAP: Record<string, string> = {
  // Legacy Barbante IDs -> Correct ID
  "res-9d5a1f3e-7b8c-4e16-9a27-8c6e2f9b5dd1": RESOURCE_IDS.BARBANTE,
  "string": RESOURCE_IDS.BARBANTE,
  
  // Legacy Fibra IDs -> Correct ID  
  "res-8bd33b18-a241-4859-ae9f-870fab5673d0": RESOURCE_IDS.FIBRA,
  
  // Legacy Couro IDs -> Correct ID
  "res-3e1a9f7b-8d5c-4e30-9a51-6c8e2f9b3d9d": RESOURCE_IDS.COURO,
  
  // Add more mappings as needed
  "res-9d5a13e-7b8c-4e16-9a27-8c6e2f9b5dd1": RESOURCE_IDS.BARBANTE, // Common typo
};

/**
 * Auto-correct an invalid ID to the proper game-ids.ts ID
 */
export function autoCorrectId(invalidId: string): string {
  // First check direct mapping
  if (ID_CORRECTION_MAP[invalidId]) {
    console.log(`🔧 ID-CORRECTION: ${invalidId} -> ${ID_CORRECTION_MAP[invalidId]}`);
    return ID_CORRECTION_MAP[invalidId];
  }
  
  // Check if it's already a valid ID
  const allValidIds = [
    ...Object.values(RESOURCE_IDS),
    ...Object.values(EQUIPMENT_IDS),
    ...Object.values(RECIPE_IDS),
    ...Object.values(BIOME_IDS),
    ...Object.values(QUEST_IDS)
  ];
  
  if (allValidIds.includes(invalidId as any)) {
    return invalidId; // Already valid
  }
  
  // Try to guess based on content
  if (invalidId.includes('barbante') || invalidId.includes('string')) {
    console.log(`🔧 ID-CORRECTION: Guessed ${invalidId} -> ${RESOURCE_IDS.BARBANTE}`);
    return RESOURCE_IDS.BARBANTE;
  }
  
  if (invalidId.includes('fibra') || invalidId.includes('fiber')) {
    console.log(`🔧 ID-CORRECTION: Guessed ${invalidId} -> ${RESOURCE_IDS.FIBRA}`);
    return RESOURCE_IDS.FIBRA;
  }
  
  if (invalidId.includes('couro') || invalidId.includes('leather')) {
    console.log(`🔧 ID-CORRECTION: Guessed ${invalidId} -> ${RESOURCE_IDS.COURO}`);
    return RESOURCE_IDS.COURO;
  }
  
  // If no correction found, return original but log warning
  console.warn(`⚠️  ID-CORRECTION: Could not auto-correct ID: ${invalidId}`);
  return invalidId;
}

/**
 * Auto-correct all IDs in a recipe object
 */
export function autoCorrectRecipeIds(recipe: any): any {
  const correctedRecipe = { ...recipe };
  
  // Correct ingredient IDs
  if (correctedRecipe.ingredients) {
    correctedRecipe.ingredients = correctedRecipe.ingredients.map((ingredient: any) => ({
      ...ingredient,
      itemId: autoCorrectId(ingredient.itemId)
    }));
  }
  
  // Correct output IDs
  if (correctedRecipe.outputs) {
    correctedRecipe.outputs = correctedRecipe.outputs.map((output: any) => ({
      ...output,
      itemId: autoCorrectId(output.itemId)
    }));
  }
  
  return correctedRecipe;
}

/**
 * Auto-correct all IDs in an array of recipes
 */
export function autoCorrectAllRecipeIds(recipes: any[]): any[] {
  console.log('🔧 ID-CORRECTION: Auto-correcting recipe IDs...');
  
  const correctedRecipes = recipes.map(recipe => autoCorrectRecipeIds(recipe));
  
  console.log('✅ ID-CORRECTION: Recipe ID auto-correction completed');
  return correctedRecipes;
}

import { RESOURCE_IDS, EQUIPMENT_IDS, RECIPE_IDS } from '../constants/game-ids';

/**
 * Central ID resolution system - Always use this instead of hardcoded IDs
 * This ensures all IDs reference shared/constants/game-ids.ts
 */

export class GameIdResolver {
  /**
   * Get resource ID by name - prevents hardcoded IDs
   */
  static getResourceId(resourceName: keyof typeof RESOURCE_IDS): string {
    const id = RESOURCE_IDS[resourceName];
    if (!id) {
      throw new Error(`Resource ID not found for: ${resourceName}. Check shared/constants/game-ids.ts`);
    }
    return id;
  }

  /**
   * Get equipment ID by name - prevents hardcoded IDs
   */
  static getEquipmentId(equipmentName: keyof typeof EQUIPMENT_IDS): string {
    const id = EQUIPMENT_IDS[equipmentName];
    if (!id) {
      throw new Error(`Equipment ID not found for: ${equipmentName}. Check shared/constants/game-ids.ts`);
    }
    return id;
  }

  /**
   * Get recipe ID by name - prevents hardcoded IDs
   */
  static getRecipeId(recipeName: keyof typeof RECIPE_IDS): string {
    const id = RECIPE_IDS[recipeName];
    if (!id) {
      throw new Error(`Recipe ID not found for: ${recipeName}. Check shared/constants/game-ids.ts`);
    }
    return id;
  }

  /**
   * Validate that an ID exists in game-ids.ts
   */
  static validateId(id: string): boolean {
    const allIds = [
      ...Object.values(RESOURCE_IDS),
      ...Object.values(EQUIPMENT_IDS),
      ...Object.values(RECIPE_IDS)
    ];
    return allIds.includes(id as any);
  }

  /**
   * Get ID type and name for debugging
   */
  static getIdInfo(id: string): { type: string; name: string } | null {
    // Check resources
    for (const [name, resourceId] of Object.entries(RESOURCE_IDS)) {
      if (resourceId === id) {
        return { type: 'resource', name };
      }
    }
    
    // Check equipment
    for (const [name, equipmentId] of Object.entries(EQUIPMENT_IDS)) {
      if (equipmentId === id) {
        return { type: 'equipment', name };
      }
    }
    
    // Check recipes
    for (const [name, recipeId] of Object.entries(RECIPE_IDS)) {
      if (recipeId === id) {
        return { type: 'recipe', name };
      }
    }
    
    return null;
  }
}

// Helper functions for common usage
export const getResourceId = GameIdResolver.getResourceId;
export const getEquipmentId = GameIdResolver.getEquipmentId; 
export const getRecipeId = GameIdResolver.getRecipeId;

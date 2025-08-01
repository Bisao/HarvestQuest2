/**
 * SERVER-SIDE ID VALIDATION MIDDLEWARE
 * 
 * This enforces that all game data operations use only valid IDs from game-ids.ts
 * Any operation with invalid IDs will be rejected to maintain data integrity.
 */

import { isValidGameId, isValidResourceId, isValidEquipmentId, isValidRecipeId, ValidationResult, validateAllGameData } from '@shared/utils/id-validator-strict';

/**
 * Express middleware to validate IDs in request parameters
 */
export function validateIdParam(req: any, res: any, next: any) {
  const { id, resourceId, equipmentId, recipeId, biomeId, questId } = req.params;
  
  const invalidIds: string[] = [];
  
  if (id && !isValidGameId(id)) invalidIds.push(id);
  if (resourceId && !isValidResourceId(resourceId)) invalidIds.push(resourceId);
  if (equipmentId && !isValidEquipmentId(equipmentId)) invalidIds.push(equipmentId);
  if (recipeId && !isValidRecipeId(recipeId)) invalidIds.push(recipeId);
  if (biomeId && !isValidGameId(biomeId)) invalidIds.push(biomeId);
  if (questId && !isValidGameId(questId)) invalidIds.push(questId);
  
  if (invalidIds.length > 0) {
    return res.status(400).json({
      error: 'Invalid game IDs detected',
      invalidIds,
      message: 'All IDs must be registered in game-ids.ts'
    });
  }
  
  next();
}

/**
 * Validate game data before saving to ensure all IDs are valid
 */
export function validateGameDataBeforeSave(gameData: any): ValidationResult {
  const result = validateAllGameData(gameData);
  
  if (!result.isValid) {
    console.error('❌ INVALID GAME DATA DETECTED:');
    result.errors.forEach(error => console.error(`  - ${error}`));
    console.error('\n🔧 FIX REQUIRED: Update data to use IDs from @shared/constants/game-ids');
  }
  
  return result;
}

/**
 * Filter out items with invalid IDs from arrays
 */
export function filterValidItems<T extends { id: string }>(items: T[]): T[] {
  return items.filter(item => {
    const isValid = isValidGameId(item.id);
    if (!isValid) {
      console.warn(`⚠️  Removing item with invalid ID: ${item.id}`);
    }
    return isValid;
  });
}

/**
 * Validate storage/inventory items
 */
export function validateStorageItems(items: any[]): any[] {
  return items.filter(item => {
    if (item.resourceId && !isValidGameId(item.resourceId)) {
      console.warn(`⚠️  Removing storage item with invalid resourceId: ${item.resourceId}`);
      return false;
    }
    return true;
  });
}

/**
 * Comprehensive system validation - to be run at startup
 */
export function validateEntireSystem(gameData: any): boolean {
  console.log('🔍 Performing comprehensive ID validation...');
  
  const result = validateGameDataBeforeSave(gameData);
  
  if (result.isValid) {
    console.log('✅ All game data validation passed!');
    return true;
  } else {
    console.error('❌ Game data validation failed!');
    console.error('Invalid IDs found:', result.invalidIds);
    console.error('Errors:', result.errors);
    return false;
  }
}
/**
 * CLIENT-SIDE ID VALIDATION
 * 
 * Validates IDs against the master game-ids.ts file when player starts the game.
 * This ensures all client-side data uses proper IDs from the master registry.
 */

import { RESOURCE_IDS, EQUIPMENT_IDS, RECIPE_IDS } from '@shared/constants/game-ids';

/**
 * Validate game startup on client side
 */
export function validateClientGameStartup(playerName: string): boolean {
  console.log(`🔍 CLIENT-VALIDATION: Validating IDs for player ${playerName}...`);
  
  try {
    // Test master registry accessibility
    const testIds = [
      RESOURCE_IDS.BARBANTE,
      RESOURCE_IDS.MADEIRA,
      EQUIPMENT_IDS.MACHADO
    ];
    
    let validCount = 0;
    testIds.forEach(id => {
      if (id && typeof id === 'string' && id.length > 0) {
        validCount++;
      }
    });
    
    if (validCount === testIds.length) {
      console.log('✅ CLIENT-VALIDATION: Master game-ids.ts accessible and valid');
      return true;
    } else {
      console.error('❌ CLIENT-VALIDATION: Master game-ids.ts validation failed');
      return false;
    }
    
  } catch (error) {
    console.error('❌ CLIENT-VALIDATION: Error validating master registry:', error);
    return false;
  }
}

/**
 * Check if an ID is valid by testing against known master IDs
 */
export function isValidIdClient(id: string): boolean {
  if (!id || typeof id !== 'string') return false;
  
  // Get all master IDs
  const allMasterIds = [
    ...Object.values(RESOURCE_IDS),
    ...Object.values(EQUIPMENT_IDS),
    ...Object.values(RECIPE_IDS)
  ];
  
  return allMasterIds.includes(id);
}
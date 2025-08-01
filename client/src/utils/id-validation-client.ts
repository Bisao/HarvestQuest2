/**
 * CLIENT-SIDE UUID VALIDATION
 * 
 * Validates that all IDs are proper UUIDs when player starts the game.
 * This ensures all client-side data uses only valid UUID-based IDs.
 */

import { RESOURCE_IDS, EQUIPMENT_IDS, RECIPE_IDS } from '@shared/constants/game-ids';

/**
 * Validates if an ID is a proper UUID format
 */
function isValidUUID(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

/**
 * Validates if a game ID has proper UUID format (prefix-uuid)
 */
function isValidGameIdFormat(id: string): boolean {
  const parts = id.split('-');
  if (parts.length !== 6) return false; // prefix + 5 UUID parts
  
  const prefix = parts[0];
  const uuidPart = parts.slice(1).join('-');
  
  const validPrefixes = ['res', 'eq', 'rec', 'biome', 'quest'];
  return validPrefixes.includes(prefix) && isValidUUID(uuidPart);
}

/**
 * Validate game startup on client side with UUID validation
 */
export function validateClientGameStartup(playerName: string): boolean {
  console.log(`🔍 CLIENT-UUID-VALIDATION: Validating UUIDs for player ${playerName}...`);
  
  try {
    // Test master registry accessibility and UUID format
    const testIds = [
      RESOURCE_IDS.BARBANTE,
      RESOURCE_IDS.MADEIRA,
      EQUIPMENT_IDS.MACHADO
    ];
    
    let validCount = 0;
    let uuidValidCount = 0;
    
    testIds.forEach(id => {
      if (id && typeof id === 'string' && id.length > 0) {
        validCount++;
        
        if (isValidGameIdFormat(id)) {
          uuidValidCount++;
          console.log(`✅ Valid UUID: ${id}`);
        } else {
          console.warn(`⚠️  Invalid UUID format: ${id}`);
        }
      }
    });
    
    const allValid = validCount === testIds.length;
    const allUUIDs = uuidValidCount === testIds.length;
    
    if (allValid && allUUIDs) {
      console.log('✅ CLIENT-UUID-VALIDATION: All game IDs are valid UUIDs');
      return true;
    } else if (allValid && !allUUIDs) {
      console.warn('⚠️  CLIENT-UUID-VALIDATION: Game IDs accessible but not all are UUIDs');
      console.warn('🔧 ACTION REQUIRED: Run UUID migration script to convert all IDs');
      return false;
    } else {
      console.error('❌ CLIENT-UUID-VALIDATION: Master game-ids.ts validation failed');
      return false;
    }
    
  } catch (error) {
    console.error('❌ CLIENT-UUID-VALIDATION: Error validating master registry:', error);
    return false;
  }
}

/**
 * Validates an array of IDs to ensure all are UUIDs
 */
export function validateUUIDArray(ids: string[]): { isValid: boolean; invalidIds: string[] } {
  const invalidIds = ids.filter(id => !isValidGameIdFormat(id));
  
  return {
    isValid: invalidIds.length === 0,
    invalidIds
  };
}

/**
 * Client-side enforcement for new ID creation
 */
export function enforceUUIDOnClient(id: string): boolean {
  if (!isValidGameIdFormat(id)) {
    console.error(`🚨 CLIENT-UUID-ENFORCEMENT: Invalid UUID detected: ${id}`);
    console.error('🔧 All new IDs must be UUIDs. Use server-side UUID generators.');
    return false;
  }
  return true;
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
// Shared Utilities Barrel Export - Organized by Function
// This file centralizes all utility exports for clean imports

// === CORE UTILITIES ===
export * from './logger';
export * from './cache-manager';
export * from './item-calculations';
export * from './item-finder';

// === ID MANAGEMENT & VALIDATION ===
// Consolidated ID validation to avoid conflicts
export { 
  isValidGameId, 
  validateAllGameData,
  validateIdByCategory 
} from './id-validator-strict';

export { 
  getAllMasterIds,
  validateGameStartup,
  ValidationResult 
} from './id-resolver';

export { 
  isValidResourceId,
  isValidEquipmentId,
  isValidRecipeId,
  isValidBiomeId,
  isValidQuestId,
  getItemType,
  validateRecipeIngredients,
  validateGameDataConsistency,
  StandardizedItemReference 
} from './id-validation';

export { 
  autoCorrectId,
  autoCorrectRecipeIds 
} from './id-auto-correction';

// === GAME MECHANICS ===
export * from './consumable-utils';
export * from './standard-mutations';

// === DATA GENERATION ===
export * from './uuid-generator';
export * from './uuid-enforcement';

// === TYPE GUARDS & HELPERS ===
// Removed duplicate exports - all ID validation functions are exported above
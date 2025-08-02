// Shared Utilities Barrel Export - Organized by Function
// This file centralizes all utility exports for clean imports

// === CORE UTILITIES ===
export * from './logger';
export * from './cache-manager';
export * from './item-calculations';
export * from './item-finder';

// === ID MANAGEMENT & VALIDATION ===
export * from './id-validator-strict';
export * from './id-resolver';
export * from './id-validation';
export * from './id-auto-correction';

// === GAME MECHANICS ===
export * from './consumable-utils';
export * from './standard-mutations';

// === DATA GENERATION ===
export * from './uuid-generator';
export * from './uuid-enforcement';

// === TYPE GUARDS & HELPERS ===
export {
  isValidResourceId,
  isValidEquipmentId,
  isValidRecipeId,
  isValidBiomeId,
  isValidQuestId,
  validateGameObject,
  sanitizeGameData
} from './id-validator-strict';
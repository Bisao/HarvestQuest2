// Shared Types Barrel Export - Clean Type Imports
// This centralizes all shared type exports for the entire application

// === CORE TYPES ===
export * from './types';
export * from './inventory-types';
export * from './skill-types';
export * from './time-types';
export * from './storage-types';

// === TYPE GUARDS & UTILITIES ===
export type { 
  TypedResponse,
  ApiError,
  PaginatedResponse,
  FilterOptions
} from './types';

// === GAME-SPECIFIC TYPES ===
export type {
  Player,
  Resource, 
  Equipment,
  Recipe,
  Expedition,
  Quest,
  Biome,
  Workshop,
  CraftingProcess
} from './types';

// Import specific types from their dedicated files
export type { StorageItem } from './storage-types';
export type { InventoryItem } from './inventory-types';

// === CONFIGURATION TYPES ===  
export type {
  GameConfig,
  ConsumptionConfig,
  HungerDegradationMode,
  OfflineActivityConfig
} from './types';

// === VALIDATION SCHEMAS ===
export {
  insertExpeditionSchema,
  updatePlayerSchema,
  playerIdParamSchema
} from './types';
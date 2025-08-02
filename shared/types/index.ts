// Shared Types Barrel Export - Clean Type Imports
// This centralizes all shared type exports for the entire application

// === CORE TYPES ===
export * from './types';
export * from './inventory-types';
export * from './skill-types';

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
  StorageItem,
  InventoryItem,
  Expedition,
  Quest,
  Biome,
  Workshop,
  CraftingProcess
} from './types';

// === CONFIGURATION TYPES ===  
export type {
  GameConfig,
  ConsumptionConfig,
  HungerDegradationMode,
  OfflineConfig
} from './types';

// === VALIDATION SCHEMAS ===
export {
  insertExpeditionSchema,
  updatePlayerSchema,
  playerIdParamSchema
} from './types';
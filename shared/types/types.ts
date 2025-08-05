// This file has been consolidated - all core types are now in shared/types.ts
// This file is kept for backward compatibility but should not be used for new imports

// Re-export from main types file
export * from '../types';

// InsertPlayer removed from here - this file is deprecated
// Use shared/types/index.ts for proper imports

// Rest of types from original types.ts...
export type HungerDegradationMode = 'fast' | 'normal' | 'slow' | 'disabled';

export interface OfflineActivityConfig {
  enabled: boolean;
  activity: string;
  duration: number;
}

// Fundamental Item Attributes System
export interface ItemAttributes {
  // Core Properties
  durability: number; // 0-100, items break when reaching 0
  efficiency: number; // 0-100, effectiveness rating
  rarity: RarityLevel; // rarity level
  baseValue?: number; // Optional base value for calculations
}

export interface ConsumableEffect {
  type: 'hunger' | 'thirst' | 'health' | 'experience' | 'temporary_buff';
  value: number;
  duration?: number; // in seconds, for temporary effects
}

export interface Resource {
  id: string;
  name: string;
  emoji: string;
  rarity: RarityLevel;
  experienceValue: number;

  // Fundamental Attributes
  attributes: ItemAttributes;

  // Resource Classification  
  category: ResourceCategory;
  subcategory: string;
  type?: string; // Legacy compatibility

  // Spawn Properties
  spawnRate: number;
  yieldAmount: number;
  requiredTool?: string;

  // Economy
  sellPrice: number;
  buyPrice: number;

  // Collection
  collectionRequirements?: CollectionRequirement[];

  // Consumable Properties
  consumableEffect?: ConsumableEffect;
  isConsumable?: boolean; // Derived from consumableEffect existence
}

export interface Equipment {
  id: string;
  name: string;
  emoji: string;
  rarity: RarityLevel;
  experienceValue: number;

  // Fundamental Attributes  
  attributes: ItemAttributes;

  // Equipment Classification
  category: EquipmentCategory;
  toolType?: ToolType;
  slot: EquipmentSlot;

  // Economy
  sellPrice: number;
  buyPrice: number;

  // Equipment Stats
  attack?: number;
  defense?: number;
  durability: number;
  efficiency?: number;

  // Consumable Properties (for tools like bait)
  consumableEffect?: ConsumableEffect;
  isConsumable?: boolean;
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  resultItemId: string;
  resultQuantity: number;
  ingredients: RecipeIngredient[];
  category: RecipeCategory;
  experienceReward: number;
  requiredLevel?: number;
  craftingTime?: number;
  unlockConditions?: string[];
}

export interface RecipeIngredient {
  itemId: string;
  quantity: number;
  type: 'resource' | 'equipment';
}

export interface Biome {
  id: string;
  name: string;
  description: string;
  emoji: string;
  difficulty: number;
  requiredLevel: number;
  resources: BiomeResource[];
  dangerLevel: number;
  explorationTime: number;
  discoverable: boolean;
  category: BiomeCategory;
}

export interface BiomeResource {
  resourceId: string;
  spawnRate: number;
  rarity: RarityLevel;
}

export interface Quest {
  id: string;
  name: string;
  description: string;
  objectives: QuestObjective[];
  rewards: QuestReward[];
  requiredLevel: number;
  category: QuestCategory;
  isCompleted: boolean;
  progress: { [objectiveId: string]: number };
  completedAt?: number;
}

export interface QuestObjective {
  id: string;
  type: 'collect' | 'craft' | 'explore' | 'level_up';
  target: string;
  quantity: number;
  description: string;
}

export interface QuestReward {
  type: 'experience' | 'coins' | 'item';
  value: number | string;
  quantity?: number;
}

export interface Expedition {
  id: string;
  playerId: string;
  biomeId: string;
  selectedResources: string[];
  selectedEquipment: string[];
  status: 'in_progress' | 'completed' | 'cancelled';
  startTime: number;
  endTime?: number;
  duration: number;
  progress: number;
  collectedResources?: Record<string, number>;
  experienceGained?: number;
  autoRepeat?: boolean;
  repeatCount?: number;
  maxRepeats?: number;
}

export interface InsertExpedition {
  playerId: string;
  biomeId: string;
  selectedResources: string[];
  selectedEquipment: string[];
  duration: number;
  autoRepeat?: boolean;
  maxRepeats?: number;
}

export interface ExpeditionResult {
  type: 'resource' | 'experience' | 'coins';
  itemId?: string;
  quantity: number;
  rarity?: RarityLevel;
}

export interface CollectionRequirement {
  type: 'tool' | 'level' | 'quest' | 'skill';
  requirement: string | number;
  description?: string;
}

// === TYPE ENUMS ===
export type RarityLevel = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
export type ResourceCategory = 'basic' | 'food' | 'material' | 'animal' | 'mineral';
export type EquipmentCategory = 'tool' | 'weapon' | 'armor' | 'container' | 'consumable';
export type EquipmentSlot = 'tool' | 'weapon' | 'helmet' | 'chestplate' | 'leggings' | 'boots' | 'container';
export type ToolType = 'pickaxe' | 'axe' | 'shovel' | 'fishing_rod' | 'sickle' | 'knife' | 'bucket' | 'bamboo_bottle' | 'rope' | 'pot' | 'bait';
export type RecipeCategory = 'tools' | 'weapons' | 'armor' | 'food' | 'materials' | 'containers';
export type BiomeCategory = 'forest' | 'desert' | 'mountain' | 'ocean' | 'cave' | 'special';
export type QuestCategory = 'exploration' | 'crafting' | 'collection' | 'combat' | 'progression';

// === UTILITY TYPES ===
export interface TypedResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface ApiError {
  message: string;
  code?: string;
  statusCode?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface FilterOptions {
  category?: string;
  rarity?: RarityLevel;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface GameConfig {
  hungerDegradationRate: number;
  thirstDegradationRate: number;
  maxInventoryWeight: number;
  expeditionBaseTime: number;
  experienceMultiplier: number;
}

export interface ConsumptionConfig {
  hungerPerSecond: number;
  thirstPerSecond: number;
  healthRegenRate: number;
}

// === VALIDATION SCHEMAS ===
import { z } from 'zod';

export const insertExpeditionSchema = z.object({
  biomeId: z.string(),
  duration: z.number().min(60).max(86400),
  autoRepeat: z.boolean().optional(),
  maxRepeats: z.number().min(1).max(100).optional()
});

export const updatePlayerSchema = z.object({
  hunger: z.number().min(0).max(100).optional(),
  thirst: z.number().min(0).max(100).optional(),
  health: z.number().min(0).max(100).optional(),
  coins: z.number().min(0).optional(),
  autoStorage: z.boolean().optional(),
  autoCompleteQuests: z.boolean().optional()
});

export const playerIdParamSchema = z.object({
  playerId: z.string().uuid()
});

// === WORKSHOP TYPES ===
export interface Workshop {
  id: string;
  name: string;
  description: string;
  level: number;
  capacity: number;
  efficiency: number;
  maintenanceRequired: boolean;
  energyConsumption: number;
}

export interface CraftingProcess {
  id: string;
  recipeId: string;
  playerId: string;
  workshopId: string;
  quantity: number;
  startTime: number;
  completionTime: number;
  status: 'queued' | 'in_progress' | 'completed' | 'failed';
  energyCost: number;
  skillBonuses: { [skillId: string]: number };
}
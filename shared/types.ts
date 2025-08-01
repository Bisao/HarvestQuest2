// Game types for Coletor Adventures - Pure TypeScript interfaces without database dependencies

export interface Player {
  id: string;
  username: string;
  level: number;
  experience: number;
  hunger: number;
  maxHunger: number;
  thirst: number;
  maxThirst: number;
  health?: number;
  coins: number;
  inventoryWeight: number;
  maxInventoryWeight: number;
  autoStorage: boolean;
  autoCompleteQuests?: boolean;
  craftedItemsDestination: 'inventory' | 'storage';
  hungerDegradationMode: HungerDegradationMode;
  onExpedition?: boolean;
  waterStorage: number;
  maxWaterStorage: number;
  waterTanks: number; // Number of unlocked water tanks
  equippedHelmet: string | null;
  equippedChestplate: string | null;
  equippedLeggings: string | null;
  equippedBoots: string | null;
  equippedWeapon: string | null;
  equippedTool: string | null;
  lastOnlineTime?: number; // Timestamp for offline calculations
  offlineActivityConfig?: OfflineActivityConfig; // Configuration for offline activities
}

export interface InsertPlayer {
  username: string;
  level?: number;
  experience?: number;
  hunger?: number;
  maxHunger?: number;
  thirst?: number;
  maxThirst?: number;
  health?: number;
  coins?: number;
  inventoryWeight?: number;
  maxInventoryWeight?: number;
  autoStorage?: boolean;
  autoCompleteQuests?: boolean;
  craftedItemsDestination?: 'inventory' | 'storage';
  hungerDegradationMode?: HungerDegradationMode;
  onExpedition?: boolean;
  waterStorage?: number;
  maxWaterStorage?: number;
  waterTanks?: number;
  equippedHelmet?: string | null;
  equippedChestplate?: string | null;
  equippedLeggings?: string | null;
  equippedBoots?: string | null;
  equippedWeapon?: string | null;
  equippedTool?: string | null;
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
  
  // Physical Properties
  weight: number;
  stackable: boolean;
  maxStackSize: number;
  
  // Effects & Tags
  effects: string[];
  tags: string[];
  
  // Derived Properties (calculated from attributes)
  value: number; // calculated from baseValue * rarityMultiplier
}

// Enums for better type safety
export type ResourceCategory = 
  | 'raw_materials'     // Fibra, Pedra, Madeira
  | 'processed_materials' // Barbante, Ferro Fundido
  | 'organic'           // Carne, Couro, Ossos
  | 'consumables'       // Food, Potions
  | 'liquids'           // Água, Suco
  | 'creatures'         // Live animals
  | 'treasures';        // Cristais, Conchas

export type RarityLevel = 
  | 'common'      // White - 1.0x value
  | 'uncommon'    // Green - 1.5x value  
  | 'rare'        // Blue - 2.0x value
  | 'epic'        // Purple - 3.0x value
  | 'legendary';  // Orange - 5.0x value

// Hunger degradation modes
export type HungerDegradationMode = 
  | 'automatic'   // Default - dynamic based on player activities
  | 'slow'        // 50% slower degradation
  | 'normal'      // Standard fixed rate
  | 'fast'        // 50% faster degradation
  | 'disabled';   // No degradation

// Equipment system types
export type EquipmentCategory = 
  | 'tools'       // Picareta, Machado, Vara de Pesca
  | 'weapons'     // Arco, Lança, Faca
  | 'armor'       // Capacete, Peitoral, Calças, Botas
  | 'accessories' // Mochila, Garrafa, Corda
  | 'containers'; // Balde, Panela

export type EquipmentSlot = 
  | 'tool' | 'weapon' | 'helmet' | 'chestplate' 
  | 'leggings' | 'boots' | 'accessory' | 'container';

export type ToolType = 
  | 'pickaxe' | 'axe' | 'shovel' | 'fishing_rod' 
  | 'knife' | 'sickle' | 'bucket' | 'bait' | 'bamboo_bottle'
  | 'pot' | 'rope' | 'clay_pot' | 'bow' | 'spear' | 'sword' 
  | 'backpack' | 'barrel' | 'container';

export interface EquipmentEffect {
  type: 'resource_boost' | 'skill_boost' | 'stat_boost' | 'special_ability';
  target?: string; // resource type, skill name, or stat name
  value: number; // multiplier or flat bonus
  description: string;
}

export interface EquipmentRequirement {
  type: 'level' | 'skill' | 'resource' | 'other_equipment';
  requirement: string | number;
  description: string;
}

export interface CollectionRequirement {
  type: 'tool' | 'skill_level' | 'equipment_combo' | 'biome_specific';
  requirement: string | string[]; // tool type, level number, or equipment IDs
  description: string;
}

export interface InsertResource {
  id?: string;
  name: string;
  emoji: string;
  rarity?: RarityLevel;
  experienceValue?: number;
  
  // Fundamental Attributes
  attributes?: ItemAttributes;
  
  // Resource Classification  
  category?: ResourceCategory;
  subcategory?: string;
  type?: string; // Legacy compatibility
  
  // Spawn Properties
  spawnRate?: number;
  yieldAmount?: number;
  requiredTool?: string;
  
  // Economy
  sellPrice?: number;
  buyPrice?: number;
  
  // Physical Properties
  weight?: number;
  stackable?: boolean;
  maxStackSize?: number;
  
  // Effects & Tags
  effects?: string[];
  tags?: string[];
}

export interface Biome {
  id: string;
  name: string;
  emoji: string;
  requiredLevel: number;
  availableResources: string[]; // array of resource IDs
}

export interface InsertBiome {
  id?: string;
  name: string;
  emoji: string;
  requiredLevel?: number;
  availableResources: string[];
}

export interface InventoryItem {
  id: string;
  playerId: string;
  resourceId: string;
  quantity: number;
}

export interface InsertInventoryItem {
  playerId: string;
  resourceId: string;
  quantity?: number;
}

export interface StorageItem {
  id: string;
  playerId: string;
  resourceId: string;
  quantity: number;
  itemType: string; // "resource" or "equipment"
}

export interface InsertStorageItem {
  playerId: string;
  resourceId: string;
  quantity?: number;
  itemType?: string;
}

export interface Expedition {
  id: string;
  playerId: string;
  biomeId: string;
  status: string; // 'planning', 'in_progress', 'completed', 'cancelled'
  selectedResources: string[]; // array of resource IDs
  selectedEquipment: string[]; // array of equipment IDs
  collectedResources: Record<string, number>; // object with resourceId: quantity
  startTime: number | null;
  endTime: number | null;
  progress: number;
}

export interface InsertExpedition {
  playerId: string;
  biomeId: string;
  selectedResources: string[];
  selectedEquipment: string[];
}

export interface Equipment {
  id: string;
  name: string;
  emoji: string;
  
  // Fundamental Attributes
  attributes: ItemAttributes;
  
  // Equipment Classification
  category: EquipmentCategory;
  slot: EquipmentSlot;
  toolType?: ToolType;
  
  // Equipment Effects
  effects: EquipmentEffect[];
  
  // Requirements to use
  requirements: EquipmentRequirement[];
  
  // Derived Properties
  weight: number; // calculated from attributes
  value: number; // calculated from attributes
}

export interface InsertEquipment {
  id?: string;
  name: string;
  emoji: string;
  
  attributes?: ItemAttributes;
  category: EquipmentCategory;
  slot?: EquipmentSlot;
  toolType?: ToolType;
  effects?: EquipmentEffect[];
  requirements?: EquipmentRequirement[];
  weight?: number;
  value?: number;
}

export interface Recipe {
  id: string;
  name: string;
  emoji: string;
  
  // Recipe Classification
  category: RecipeCategory;
  subcategory: string;
  difficulty: RecipeDifficulty;
  
  // Requirements
  requiredLevel: number;
  requiredSkills?: SkillRequirement[];
  requiredTools?: ToolRequirement[];
  
  // Recipe Data
  ingredients: RecipeIngredient[];
  outputs: RecipeOutput[];
  
  // Process Information
  craftingTime: number; // in seconds
  experienceGained: number;
  successRate: number; // 0-100, chance of success
}

// Recipe system types
export type RecipeCategory = 
  | 'basic_materials'   // Barbante, processed resources
  | 'tools'            // Picareta, Machado, Vara de Pesca
  | 'weapons'          // Arco, Lança, Faca
  | 'armor'            // Capacete, Peitoral, Calças, Botas
  | 'consumables'      // Food, Potions
  | 'containers'       // Balde, Panela, Garrafa
  | 'advanced';        // Complex recipes

export type RecipeDifficulty = 
  | 'trivial'    // Always succeeds, instant
  | 'easy'       // 95% success, 5 seconds
  | 'medium'     // 85% success, 15 seconds
  | 'hard'       // 70% success, 30 seconds
  | 'expert';    // 50% success, 60 seconds

export interface SkillRequirement {
  skill: string; // skill name
  level: number; // required level
}

export interface ToolRequirement {
  toolType: ToolType;
  description: string;
}

export interface RecipeIngredient {
  itemId: string; // resource or equipment ID
  quantity: number;
  consumed: boolean; // true if item is consumed, false if just required
}

export interface RecipeOutput {
  itemId: string; // resource or equipment ID
  quantity: number;
  chance: number; // 0-100, chance of getting this output
}

export interface InsertRecipe {
  id?: string;
  name: string;
  emoji: string;
  
  category: RecipeCategory;
  subcategory?: string;
  difficulty?: RecipeDifficulty;
  
  requiredLevel?: number;
  requiredSkills?: SkillRequirement[];
  requiredTools?: ToolRequirement[];
  
  ingredients: RecipeIngredient[];
  outputs: RecipeOutput[];
  
  craftingTime?: number;
  experienceGained?: number;
  successRate?: number;
}

export interface Quest {
  id: string;
  name: string;
  description: string;
  emoji: string;
  type: string; // 'collect', 'craft', 'explore', 'level'
  category: string | null; // optional category field
  requiredLevel: number;
  objectives: Array<{
    type: string;
    target: string;
    amount: number;
    biomeId?: string;
    resourceId?: string;
    itemId?: string;
    quantity?: number;
    description?: string;
  }>; // array of objectives with type, target, amount
  rewards: {
    coins?: number;
    experience?: number;
    items?: Record<string, number>; // resourceId: quantity
  }; // object with coins, experience, items
  isActive: boolean;
}

export interface InsertQuest {
  id?: string;
  name: string;
  description: string;
  emoji: string;
  type: string;
  category?: string | null;
  requiredLevel?: number;
  objectives: Array<{
    type: string;
    target: string;
    amount: number;
    biomeId?: string;
    resourceId?: string;
    itemId?: string;
    quantity?: number;
    description?: string;
  }>;
  rewards: {
    coins?: number;
    experience?: number;
    items?: Record<string, number>;
  };
  isActive?: boolean;
}

export interface PlayerQuest {
  id: string;
  playerId: string;
  questId: string;
  status: string; // 'available', 'active', 'completed', 'failed'
  progress: Record<string, number>; // object tracking progress for each objective
  startedAt: number | null;
  completedAt: number | null;
}

export interface InsertPlayerQuest {
  playerId: string;
  questId: string;
  status?: string;
  progress?: Record<string, number>;
}

// Validation schemas using Zod
import { z } from 'zod';

export const insertExpeditionSchema = z.object({
  playerId: z.string(),
  biomeId: z.string(),
  selectedResources: z.array(z.string()),
  selectedEquipment: z.array(z.string()),
});

export const updatePlayerSchema = z.object({
  hunger: z.number().optional(),
  thirst: z.number().optional(),
  coins: z.number().optional(),
  experience: z.number().optional(),
  level: z.number().optional(),
  inventoryWeight: z.number().optional(),
  autoStorage: z.boolean().optional(),
  craftedItemsDestination: z.enum(['inventory', 'storage']).optional(),
  waterStorage: z.number().optional(),
  equippedHelmet: z.string().nullable().optional(),
  equippedChestplate: z.string().nullable().optional(),
  equippedLeggings: z.string().nullable().optional(),
  equippedBoots: z.string().nullable().optional(),
  equippedWeapon: z.string().nullable().optional(),
  equippedTool: z.string().nullable().optional(),
});

// Sistema de Notificações/Resumos Offline
export interface OfflineActivityConfig {
  enabled: boolean;
  preferredBiome?: string;
  maxDuration?: number; // em horas
  stopOnLowResources?: boolean;
  minHunger?: number;
  minThirst?: number;
  preferredResources?: string[]; // IDs dos recursos que o jogador quer focar
}

export interface OfflineActivityReport {
  timeOffline: number; // em milissegundos
  hoursOffline: number; // calculado para display
  resourcesCollected: Record<string, number>;
  experienceGained: number;
  expeditionsCompleted: number;
  hungerConsumed: number;
  thirstConsumed: number;
  specialEvents: OfflineEvent[];
  efficiency: number; // 0-100, baseado em condições
}

export interface OfflineEvent {
  type: 'resource_bonus' | 'tool_break' | 'level_up' | 'quest_complete' | 'special_find';
  description: string;
  timestamp: number;
  data?: any;
}

export interface OfflineCalculationResult {
  report: OfflineActivityReport;
  playerUpdates: Partial<Player>;
  inventoryUpdates: { resourceId: string; quantity: number }[];
  storageUpdates: { resourceId: string; quantity: number }[];
}
// Modernized Game Item System - Based on comprehensive item structure
export type ItemCategory = 'resource' | 'weapon' | 'tool' | 'armor' | 'consumable' | 'material' | 'container';
export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

// Universal Item interface - combines resources, equipment, and consumables
export interface GameItem {
  id: string;
  name: string; // Internal name (programming key)
  displayName: string; // Localized display name
  description: string; // Tooltip/description text
  iconPath: string; // Icon reference (emoji for now)
  
  // Core categorization
  category: ItemCategory;
  subcategory: string; // e.g. "wood", "stone", "fish", "herb"
  
  // Physical properties
  weight: number; // In kg, affects inventory capacity
  stackable: boolean; // Can stack in inventory
  maxStackSize: number; // Maximum per stack
  
  // Rarity and rewards
  rarity: ItemRarity;
  xpReward: number; // XP gained when collecting/using
  yieldAmount: number; // Base quantity obtained
  
  // Durability (for tools/weapons)
  durability?: number; // Max durability before breaking
  currentDurability?: number; // Current condition
  
  // Collection requirements
  requiredTool?: string | null; // Tool needed to collect
  spawnRate: number; // Probability 0.0-1.0
  
  // Economy
  sellPrice: number; // Value when selling
  buyPrice: number; // Cost when buying
  
  // Special properties
  attributes: Record<string, any>; // Flexible properties (damage, defense, etc.)
  effects: string[]; // Status effects, buffs, debuffs
  tags: string[]; // Free-form tags for filtering
  
  // Metadata
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}

// Insert type for creating new items
export interface InsertGameItem {
  id?: string;
  name: string;
  displayName: string;
  description: string;
  iconPath: string;
  category: ItemCategory;
  subcategory: string;
  weight?: number;
  stackable?: boolean;
  maxStackSize?: number;
  rarity?: ItemRarity;
  xpReward?: number;
  yieldAmount?: number;
  durability?: number;
  requiredTool?: string | null;
  spawnRate?: number;
  sellPrice?: number;
  buyPrice?: number;
  attributes?: Record<string, any>;
  effects?: string[];
  tags?: string[];
}

// Legacy types for backward compatibility during migration
export interface Resource extends GameItem {
  category: 'resource';
  emoji: string; // Alias for iconPath
  value: number; // Alias for sellPrice
  type: string; // Alias for subcategory
  experienceValue: number; // Alias for xpReward
}

export interface Equipment extends GameItem {
  category: 'weapon' | 'tool' | 'armor';
  emoji: string; // Alias for iconPath
  effect: string; // Alias for description
  bonus: Record<string, any>; // Alias for attributes
  slot: string; // Equipment slot
  toolType?: string; // For tools
}

// Player interface remains mostly the same
export interface Player {
  id: string;
  username: string;
  level: number;
  experience: number;
  hunger: number;
  maxHunger: number;
  thirst: number;
  maxThirst: number;
  coins: number;
  inventoryWeight: number;
  maxInventoryWeight: number;
  autoStorage: boolean;
  craftedItemsDestination: 'inventory' | 'storage';
  waterStorage: number;
  maxWaterStorage: number;
  equippedHelmet: string | null;
  equippedChestplate: string | null;
  equippedLeggings: string | null;
  equippedBoots: string | null;
  equippedWeapon: string | null;
  equippedTool: string | null;
}

export interface InsertPlayer {
  username: string;
  level?: number;
  experience?: number;
  hunger?: number;
  maxHunger?: number;
  thirst?: number;
  maxThirst?: number;
  coins?: number;
  inventoryWeight?: number;
  maxInventoryWeight?: number;
  autoStorage?: boolean;
  craftedItemsDestination?: 'inventory' | 'storage';
  waterStorage?: number;
  maxWaterStorage?: number;
  equippedHelmet?: string | null;
  equippedChestplate?: string | null;
  equippedLeggings?: string | null;
  equippedBoots?: string | null;
  equippedWeapon?: string | null;
  equippedTool?: string | null;
}

// Inventory system now uses GameItem references
export interface InventoryItem {
  id: string;
  playerId: string;
  itemId: string; // References GameItem.id
  quantity: number;
  condition?: number; // For durability tracking
}

export interface InsertInventoryItem {
  playerId: string;
  itemId: string;
  quantity?: number;
  condition?: number;
}

export interface StorageItem {
  id: string;
  playerId: string;
  itemId: string; // References GameItem.id
  quantity: number;
  condition?: number; // For durability tracking
}

export interface InsertStorageItem {
  playerId: string;
  itemId: string;
  quantity?: number;
  condition?: number;
}

// Biome interface
export interface Biome {
  id: string;
  name: string;
  emoji: string;
  requiredLevel: number;
  availableResources: string[]; // array of GameItem IDs
}

export interface InsertBiome {
  id?: string;
  name: string;
  emoji: string;
  requiredLevel?: number;
  availableResources: string[];
}

// Expedition system
export interface Expedition {
  id: string;
  playerId: string;
  biomeId: string;
  status: string; // 'planning', 'in_progress', 'completed', 'cancelled'
  selectedResources: string[]; // array of GameItem IDs
  selectedEquipment: string[]; // array of GameItem IDs
  collectedResources: Record<string, number>; // object with itemId: quantity
  progress: number; // 0-100
  startTime?: number;
  endTime?: number;
}

export interface InsertExpedition {
  playerId: string;
  biomeId: string;
  selectedResources?: string[];
  selectedEquipment?: string[];
  status?: string;
}

// Recipe system
export interface Recipe {
  id: string;
  name: string;
  outputItemId: string; // References GameItem.id
  outputQuantity: number;
  ingredients: Array<{
    itemId: string; // References GameItem.id
    quantity: number;
  }>;
  requiredTool?: string;
  requiredLevel?: number;
  category: string;
}

export interface InsertRecipe {
  id?: string;
  name: string;
  outputItemId: string;
  outputQuantity?: number;
  ingredients: Array<{
    itemId: string;
    quantity: number;
  }>;
  requiredTool?: string;
  requiredLevel?: number;
  category?: string;
}

// Quest system
export interface Quest {
  id: string;
  title: string;
  description: string;
  objectives: Array<{
    type: string;
    target: string;
    current: number;
    required: number;
    completed: boolean;
  }>;
  rewards: {
    experience?: number;
    coins?: number;
    items?: Array<{
      itemId: string;
      quantity: number;
    }>;
  };
  requiredLevel?: number;
  isActive: boolean;
}

export interface InsertQuest {
  id?: string;
  title: string;
  description: string;
  objectives: Array<{
    type: string;
    target: string;
    current?: number;
    required: number;
    completed?: boolean;
  }>;
  rewards: {
    experience?: number;
    coins?: number;
    items?: Array<{
      itemId: string;
      quantity: number;
    }>;
  };
  requiredLevel?: number;
  isActive?: boolean;
}

export interface PlayerQuest {
  id: string;
  playerId: string;
  questId: string;
  status: 'available' | 'active' | 'completed';
  progress: Array<{
    objectiveIndex: number;
    current: number;
    completed: boolean;
  }>;
  canComplete: boolean;
  completedAt?: string;
}

export interface InsertPlayerQuest {
  playerId: string;
  questId: string;
  status?: 'available' | 'active' | 'completed';
  progress?: Array<{
    objectiveIndex: number;
    current: number;
    completed: boolean;
  }>;
  canComplete?: boolean;
  completedAt?: string;
}
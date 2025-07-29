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

export interface Resource {
  id: string;
  name: string;
  emoji: string;
  weight: number;
  value: number;
  type: string; // 'basic', 'animals', 'fish', 'plants', 'unique'
  rarity: string; // 'common', 'uncommon', 'rare', 'epic', 'legendary'
  requiredTool: string | null; // tool type needed to collect this resource
  experienceValue: number; // XP gained per item collected
}

export interface InsertResource {
  id?: string;
  name: string;
  emoji: string;
  weight?: number;
  value?: number;
  type: string;
  rarity?: string;
  requiredTool?: string | null;
  experienceValue?: number;
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
  effect: string; // description of the effect
  bonus: Record<string, any>; // object with bonus type and value
  slot: string; // helmet, chestplate, leggings, boots, weapon, tool
  toolType: string | null; // pickaxe, axe, shovel, etc. (for tools only)
  weight: number;
}

export interface InsertEquipment {
  id?: string;
  name: string;
  emoji: string;
  effect: string;
  bonus: Record<string, any>;
  slot: string;
  toolType?: string | null;
  weight?: number;
}

export interface Recipe {
  id: string;
  name: string;
  emoji: string;
  requiredLevel: number;
  ingredients: Record<string, number>; // object with resourceId: quantity
  output: Record<string, number>; // object with resourceId: quantity
}

export interface InsertRecipe {
  id?: string;
  name: string;
  emoji: string;
  requiredLevel?: number;
  ingredients: Record<string, number>;
  output: Record<string, number>;
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
import { z } from "zod";

// Player schemas
export const updatePlayerSettingsSchema = z.object({
  autoStorage: z.boolean().optional(),
  craftedItemsDestination: z.enum(['inventory', 'storage']).optional()
});

export const consumeItemSchema = z.object({
  itemId: z.string().uuid(),
  quantity: z.number().int().min(1).max(100).default(1)
});

// Expedition schemas
export const startExpeditionSchema = z.object({
  playerId: z.string().uuid(),
  biomeId: z.string().uuid(),
  selectedResources: z.array(z.string().uuid()).default([]),
  selectedEquipment: z.array(z.string().uuid()).default([])
});

// Crafting schemas
export const craftItemSchema = z.object({
  playerId: z.string().uuid(),
  recipeId: z.string().uuid(),
  quantity: z.number().int().min(1).max(100).default(1)
});

// Inventory management schemas
export const transferItemSchema = z.object({
  playerId: z.string().uuid(),
  itemId: z.string().uuid(),
  quantity: z.number().int().min(1),
  from: z.enum(['inventory', 'storage']),
  to: z.enum(['inventory', 'storage'])
});

export const equipItemSchema = z.object({
  playerId: z.string().uuid(),
  itemId: z.string().uuid(),
  slot: z.enum(['helmet', 'chestplate', 'leggings', 'boots', 'weapon', 'tool'])
});

// Quest schemas
export const updateQuestProgressSchema = z.object({
  playerId: z.string().uuid(),
  questId: z.string().uuid(),
  progress: z.record(z.string(), z.number())
});

// Water storage schemas
export const manageWaterSchema = z.object({
  playerId: z.string().uuid(),
  action: z.enum(['add', 'remove', 'use']),
  amount: z.number().int().min(1).max(1000)
});

// Pagination schema
export const paginationQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  sort: z.enum(['name', 'level', 'created_at']).optional(),
  order: z.enum(['asc', 'desc']).default('asc')
});

// Generic filters
export const resourceFilterSchema = z.object({
  type: z.enum(['basic', 'unique']).optional(),
  rarity: z.enum(['common', 'uncommon', 'rare']).optional(),
  category: z.string().optional()
});

export const biomeFilterSchema = z.object({
  minLevel: z.coerce.number().min(1).optional(),
  maxLevel: z.coerce.number().min(1).optional()
});

// Equipment filter schema
export const equipmentFilterSchema = z.object({
  slot: z.enum(['helmet', 'chestplate', 'leggings', 'boots', 'weapon', 'tool']).optional(),
  toolType: z.string().optional()
});
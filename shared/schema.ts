
import { pgTable, text, integer, boolean, timestamp, json, real, uuid } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// Players table
export const players = pgTable("players", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  level: integer("level").notNull().default(1),
  experience: integer("experience").notNull().default(0),
  hunger: integer("hunger").notNull().default(100),
  maxHunger: integer("max_hunger").notNull().default(100),
  thirst: integer("thirst").notNull().default(100),
  maxThirst: integer("max_thirst").notNull().default(100),
  coins: integer("coins").notNull().default(0),
  inventoryWeight: integer("inventory_weight").notNull().default(0),
  maxInventoryWeight: integer("max_inventory_weight").notNull().default(50000),
  autoStorage: boolean("auto_storage").notNull().default(false),
  craftedItemsDestination: text("crafted_items_destination").notNull().default('storage'),
  waterStorage: integer("water_storage").notNull().default(0),
  maxWaterStorage: integer("max_water_storage").notNull().default(500),
  waterTanks: json("water_tanks").$type<number[]>().notNull().default([]),
  equippedHelmet: text("equipped_helmet"),
  equippedChestplate: text("equipped_chestplate"),
  equippedLeggings: text("equipped_leggings"),
  equippedBoots: text("equipped_boots"),
  equippedWeapon: text("equipped_weapon"),
  equippedTool: text("equipped_tool"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Resources table
export const resources = pgTable("resources", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  emoji: text("emoji").notNull(),
  rarity: text("rarity").notNull().default('common'),
  experienceValue: integer("experience_value").notNull().default(1),
  attributes: json("attributes").$type<{
    durability?: number;
    efficiency?: number;
    rarity?: string;
    baseValue?: number;
  }>().notNull().default({}),
  category: text("category").notNull().default('raw_materials'),
  subcategory: text("subcategory").notNull().default('basic'),
  spawnRate: real("spawn_rate").notNull().default(0.5),
  yieldAmount: integer("yield_amount").notNull().default(1),
  requiredTool: text("required_tool"),
  sellPrice: integer("sell_price").notNull().default(1),
  buyPrice: integer("buy_price").notNull().default(2),
  weight: integer("weight").notNull().default(1),
  stackable: boolean("stackable").notNull().default(true),
  maxStackSize: integer("max_stack_size").notNull().default(99),
  effects: json("effects").$type<string[]>().notNull().default([]),
  tags: json("tags").$type<string[]>().notNull().default([]),
  value: integer("value").notNull().default(1),
});

// Biomes table
export const biomes = pgTable("biomes", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  emoji: text("emoji").notNull(),
  requiredLevel: integer("required_level").notNull().default(1),
  availableResources: json("available_resources").$type<string[]>().notNull(),
});

// Equipment table
export const equipment = pgTable("equipment", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  emoji: text("emoji").notNull(),
  attributes: json("attributes").$type<{
    durability?: number;
    efficiency?: number;
    rarity?: string;
  }>().notNull().default({}),
  category: text("category").notNull(),
  slot: text("slot").notNull().default('tool'),
  toolType: text("tool_type"),
  effects: json("effects").$type<string[]>().notNull().default([]),
  requirements: json("requirements").$type<string[]>().notNull().default([]),
  weight: integer("weight").notNull().default(1),
  value: integer("value").notNull().default(1),
});

// Recipes table
export const recipes = pgTable("recipes", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  emoji: text("emoji").notNull(),
  requiredLevel: integer("required_level").notNull().default(1),
  category: text("category").notNull().default('basic_materials'),
  subcategory: text("subcategory").notNull().default(''),
  difficulty: text("difficulty").notNull().default('trivial'),
  requiredSkills: json("required_skills").$type<string[]>().notNull().default([]),
  requiredTools: json("required_tools").$type<string[]>().notNull().default([]),
  ingredients: json("ingredients").$type<Array<{ id: string; quantity: number; type: 'resource' | 'equipment' }>>().notNull(),
  outputs: json("outputs").$type<Array<{ id: string; quantity: number; type: 'resource' | 'equipment' }>>().notNull(),
  craftingTime: integer("crafting_time").notNull().default(5),
  experienceGained: integer("experience_gained").notNull().default(10),
  successRate: integer("success_rate").notNull().default(100),
});

// Expeditions table
export const expeditions = pgTable("expeditions", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  playerId: text("player_id").notNull().references(() => players.id, { onDelete: "cascade" }),
  biomeId: text("biome_id").notNull().references(() => biomes.id, { onDelete: "cascade" }),
  status: text("status").notNull().default("in_progress"),
  selectedResources: json("selected_resources").$type<string[]>().notNull(),
  selectedEquipment: json("selected_equipment").$type<string[]>().notNull(),
  collectedResources: json("collected_resources").$type<Record<string, number>>().notNull().default({}),
  startTime: timestamp("start_time").notNull().defaultNow(),
  endTime: timestamp("end_time"),
  progress: integer("progress").notNull().default(0),
});

// Inventory items table
export const inventoryItems = pgTable("inventory_items", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  playerId: text("player_id").notNull().references(() => players.id, { onDelete: "cascade" }),
  resourceId: text("resource_id").notNull().references(() => resources.id, { onDelete: "cascade" }),
  quantity: integer("quantity").notNull().default(0),
});

// Storage items table
export const storageItems = pgTable("storage_items", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  playerId: text("player_id").notNull().references(() => players.id, { onDelete: "cascade" }),
  resourceId: text("resource_id").notNull(),
  quantity: integer("quantity").notNull().default(0),
  itemType: text("item_type").notNull().default('resource'),
});

// Quests table
export const quests = pgTable("quests", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  emoji: text("emoji").notNull(),
  type: text("type").notNull(),
  category: text("category"),
  requiredLevel: integer("required_level").notNull().default(1),
  objectives: json("objectives").$type<Array<{
    id: string;
    type: 'collect' | 'craft' | 'expedition' | 'level';
    target: string;
    quantity: number;
    description: string;
  }>>().notNull(),
  rewards: json("rewards").$type<{
    experience?: number;
    coins?: number;
    items?: Array<{ id: string; quantity: number; type: 'resource' | 'equipment' }>;
  }>().notNull(),
  isActive: boolean("is_active").notNull().default(true),
});

// Player quests table (junction table for quest progress)
export const playerQuests = pgTable("player_quests", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  playerId: text("player_id").notNull().references(() => players.id, { onDelete: "cascade" }),
  questId: text("quest_id").notNull().references(() => quests.id, { onDelete: "cascade" }),
  status: text("status").notNull().default('available'),
  progress: json("progress").$type<Record<string, number>>().notNull().default({}),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
});

// Export types
export type Player = typeof players.$inferSelect;
export type InsertPlayer = typeof players.$inferInsert;
export type Resource = typeof resources.$inferSelect;
export type InsertResource = typeof resources.$inferInsert;
export type Biome = typeof biomes.$inferSelect;
export type InsertBiome = typeof biomes.$inferInsert;
export type Equipment = typeof equipment.$inferSelect;
export type InsertEquipment = typeof equipment.$inferInsert;
export type Recipe = typeof recipes.$inferSelect;
export type InsertRecipe = typeof recipes.$inferInsert;
export type Expedition = typeof expeditions.$inferSelect;
export type InsertExpedition = typeof expeditions.$inferInsert;
export type InventoryItem = typeof inventoryItems.$inferSelect;
export type InsertInventoryItem = typeof inventoryItems.$inferInsert;
export type StorageItem = typeof storageItems.$inferSelect;
export type InsertStorageItem = typeof storageItems.$inferInsert;
export type Quest = typeof quests.$inferSelect;
export type InsertQuest = typeof quests.$inferInsert;
export type PlayerQuest = typeof playerQuests.$inferSelect;
export type InsertPlayerQuest = typeof playerQuests.$inferInsert;

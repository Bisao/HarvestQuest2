import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, blob } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const players = sqliteTable("players", {
  id: text("id").primaryKey().notNull(),
  username: text("username").notNull().unique(),
  level: integer("level").notNull().default(1),
  experience: integer("experience").notNull().default(0),
  hunger: integer("hunger").notNull().default(100),
  maxHunger: integer("max_hunger").notNull().default(100),
  thirst: integer("thirst").notNull().default(100),
  maxThirst: integer("max_thirst").notNull().default(100),
  coins: integer("coins").notNull().default(0),
  inventoryWeight: integer("inventory_weight").notNull().default(0),
  maxInventoryWeight: integer("max_inventory_weight").notNull().default(100),
  autoStorage: integer("auto_storage", { mode: 'boolean' }).notNull().default(true), // Changed default to true
  waterStorage: integer("water_storage").notNull().default(0),
  maxWaterStorage: integer("max_water_storage").notNull().default(500),
  equippedHelmet: text("equipped_helmet"),
  equippedChestplate: text("equipped_chestplate"),
  equippedLeggings: text("equipped_leggings"),
  equippedBoots: text("equipped_boots"),
  equippedWeapon: text("equipped_weapon"),
  equippedTool: text("equipped_tool"),
});

export const resources = sqliteTable("resources", {
  id: text("id").primaryKey().notNull(),
  name: text("name").notNull(),
  emoji: text("emoji").notNull(),
  weight: integer("weight").notNull().default(1),
  value: integer("value").notNull().default(1),
  type: text("type").notNull(), // 'basic' or 'unique'
  rarity: text("rarity").notNull().default('common'), // 'common', 'uncommon', 'rare'
  requiredTool: text("required_tool"), // tool type needed to collect this resource
  experienceValue: integer("experience_value").notNull().default(1), // XP gained per item collected
});

export const biomes = sqliteTable("biomes", {
  id: text("id").primaryKey().notNull(),
  name: text("name").notNull(),
  emoji: text("emoji").notNull(),
  requiredLevel: integer("required_level").notNull().default(1),
  availableResources: text("available_resources", { mode: 'json' }).notNull(), // array of resource IDs
});

export const inventoryItems = sqliteTable("inventory_items", {
  id: text("id").primaryKey().notNull(),
  playerId: text("player_id").notNull(),
  resourceId: text("resource_id").notNull(),
  quantity: integer("quantity").notNull().default(0),
});

export const storageItems = sqliteTable("storage_items", {
  id: text("id").primaryKey().notNull(),
  playerId: text("player_id").notNull(),
  resourceId: text("resource_id").notNull(),
  quantity: integer("quantity").notNull().default(0),
  itemType: text("item_type").notNull().default("resource"), // "resource" or "equipment"
});

export const expeditions = sqliteTable("expeditions", {
  id: text("id").primaryKey().notNull(),
  playerId: text("player_id").notNull(),
  biomeId: text("biome_id").notNull(),
  status: text("status").notNull(), // 'planning', 'in_progress', 'completed', 'cancelled'
  selectedResources: text("selected_resources", { mode: 'json' }).notNull(), // array of resource IDs
  selectedEquipment: text("selected_equipment", { mode: 'json' }).notNull(), // array of equipment IDs
  collectedResources: text("collected_resources", { mode: 'json' }).notNull().default('{}'), // object with resourceId: quantity
  startTime: integer("start_time"),
  endTime: integer("end_time"),
  progress: integer("progress").notNull().default(0),
});

export const equipment = sqliteTable("equipment", {
  id: text("id").primaryKey().notNull(),
  name: text("name").notNull(),
  emoji: text("emoji").notNull(),
  effect: text("effect").notNull(), // description of the effect
  bonus: text("bonus", { mode: 'json' }).notNull(), // object with bonus type and value
  slot: text("slot").notNull(), // helmet, chestplate, leggings, boots, weapon, tool
  toolType: text("tool_type"), // pickaxe, axe, shovel, etc. (for tools only)
  weight: integer("weight").default(2).notNull(),
});

export const recipes = sqliteTable("recipes", {
  id: text("id").primaryKey().notNull(),
  name: text("name").notNull(),
  emoji: text("emoji").notNull(),
  requiredLevel: integer("required_level").notNull().default(1),
  ingredients: text("ingredients", { mode: 'json' }).notNull(), // object with resourceId: quantity
  output: text("output", { mode: 'json' }).notNull(), // object with resourceId: quantity
});

export const quests = sqliteTable("quests", {
  id: text("id").primaryKey().notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  emoji: text("emoji").notNull(),
  type: text("type").notNull(), // 'collect', 'craft', 'explore', 'level'
  category: text("category"), // optional category field
  requiredLevel: integer("required_level").notNull().default(1),
  objectives: text("objectives", { mode: 'json' }).notNull(), // array of objectives with type, target, amount
  rewards: text("rewards", { mode: 'json' }).notNull(), // object with coins, experience, items (resourceId: quantity)
  isActive: integer("is_active", { mode: 'boolean' }).notNull().default(true),
});

export const playerQuests = sqliteTable("player_quests", {
  id: text("id").primaryKey().notNull(),
  playerId: text("player_id").notNull(),
  questId: text("quest_id").notNull(),
  status: text("status").notNull().default('available'), // 'available', 'active', 'completed', 'failed'
  progress: text("progress", { mode: 'json' }).notNull().default('{}'), // object tracking progress for each objective
  startedAt: integer("started_at"),
  completedAt: integer("completed_at"),
});

// Insert schemas
export const insertPlayerSchema = createInsertSchema(players).omit({
  id: true,
});

export const insertResourceSchema = createInsertSchema(resources);

export const insertBiomeSchema = createInsertSchema(biomes).omit({
  id: true,
});

export const insertInventoryItemSchema = createInsertSchema(inventoryItems).omit({
  id: true,
});

export const insertStorageItemSchema = createInsertSchema(storageItems).omit({
  id: true,
});

export const insertExpeditionSchema = createInsertSchema(expeditions).omit({
  id: true,
  startTime: true,
  endTime: true,
  progress: true,
  status: true,
  collectedResources: true,
});

export const insertEquipmentSchema = createInsertSchema(equipment);

export const insertRecipeSchema = createInsertSchema(recipes);

export const insertQuestSchema = createInsertSchema(quests).omit({
  id: true,
});

export const insertPlayerQuestSchema = createInsertSchema(playerQuests).omit({
  id: true,
  startedAt: true,
  completedAt: true,
});

// Types
export type Player = typeof players.$inferSelect;
export type InsertPlayer = z.infer<typeof insertPlayerSchema>;
export type Resource = typeof resources.$inferSelect;
export type InsertResource = z.infer<typeof insertResourceSchema>;
export type Biome = typeof biomes.$inferSelect;
export type InsertBiome = z.infer<typeof insertBiomeSchema>;
export type InventoryItem = typeof inventoryItems.$inferSelect;
export type InsertInventoryItem = z.infer<typeof insertInventoryItemSchema>;
export type StorageItem = typeof storageItems.$inferSelect;
export type InsertStorageItem = z.infer<typeof insertStorageItemSchema>;
export type Expedition = typeof expeditions.$inferSelect;
export type InsertExpedition = z.infer<typeof insertExpeditionSchema>;
export type Equipment = typeof equipment.$inferSelect;
export type InsertEquipment = z.infer<typeof insertEquipmentSchema>;
export type Recipe = typeof recipes.$inferSelect;
export type InsertRecipe = z.infer<typeof insertRecipeSchema>;
export type Quest = typeof quests.$inferSelect;
export type InsertQuest = z.infer<typeof insertQuestSchema>;
export type PlayerQuest = typeof playerQuests.$inferSelect;
export type InsertPlayerQuest = z.infer<typeof insertPlayerQuestSchema>;
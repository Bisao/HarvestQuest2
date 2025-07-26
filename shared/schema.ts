import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const players = pgTable("players", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  level: integer("level").notNull().default(1),
  experience: integer("experience").notNull().default(0),
  energy: integer("energy").notNull().default(100),
  maxEnergy: integer("max_energy").notNull().default(100),
  coins: integer("coins").notNull().default(0),
  inventoryWeight: integer("inventory_weight").notNull().default(0),
  maxInventoryWeight: integer("max_inventory_weight").notNull().default(100),
  autoStorage: boolean("auto_storage").notNull().default(false),
  equippedHelmet: text("equipped_helmet"),
  equippedChestplate: text("equipped_chestplate"),
  equippedLeggings: text("equipped_leggings"),
  equippedBoots: text("equipped_boots"),
  equippedWeapon: text("equipped_weapon"),
  equippedTool: text("equipped_tool"),
});

export const resources = pgTable("resources", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  emoji: text("emoji").notNull(),
  weight: integer("weight").notNull().default(1),
  value: integer("value").notNull().default(1),
  type: text("type").notNull(), // 'basic' or 'unique'
  rarity: text("rarity").notNull().default('common'), // 'common', 'uncommon', 'rare'
  requiredTool: text("required_tool"), // tool type needed to collect this resource
  experienceValue: integer("experience_value").notNull().default(1), // XP gained per item collected
});

export const biomes = pgTable("biomes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  emoji: text("emoji").notNull(),
  requiredLevel: integer("required_level").notNull().default(1),
  availableResources: jsonb("available_resources").notNull(), // array of resource IDs
});

export const inventoryItems = pgTable("inventory_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  playerId: varchar("player_id").notNull(),
  resourceId: varchar("resource_id").notNull(),
  quantity: integer("quantity").notNull().default(0),
});

export const storageItems = pgTable("storage_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  playerId: varchar("player_id").notNull(),
  resourceId: varchar("resource_id").notNull(),
  quantity: integer("quantity").notNull().default(0),
});

export const expeditions = pgTable("expeditions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  playerId: varchar("player_id").notNull(),
  biomeId: varchar("biome_id").notNull(),
  status: text("status").notNull(), // 'planning', 'in_progress', 'completed', 'cancelled'
  selectedResources: jsonb("selected_resources").notNull(), // array of resource IDs
  selectedEquipment: jsonb("selected_equipment").notNull(), // array of equipment IDs
  collectedResources: jsonb("collected_resources").notNull().default('{}'), // object with resourceId: quantity
  startTime: integer("start_time"),
  endTime: integer("end_time"),
  progress: integer("progress").notNull().default(0),
});

export const equipment = pgTable("equipment", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  emoji: text("emoji").notNull(),
  effect: text("effect").notNull(), // description of the effect
  bonus: jsonb("bonus").notNull(), // object with bonus type and value
  slot: text("slot").notNull(), // helmet, chestplate, leggings, boots, weapon, tool
  toolType: text("tool_type"), // pickaxe, axe, shovel, etc. (for tools only)
  weight: integer("weight").default(2).notNull(),
});

export const recipes = pgTable("recipes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  emoji: text("emoji").notNull(),
  requiredLevel: integer("required_level").notNull().default(1),
  ingredients: jsonb("ingredients").notNull(), // object with resourceId: quantity
  output: jsonb("output").notNull(), // object with resourceId: quantity
});

// Insert schemas
export const insertPlayerSchema = createInsertSchema(players).omit({
  id: true,
});

export const insertResourceSchema = createInsertSchema(resources).omit({
  id: true,
});

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

export const insertEquipmentSchema = createInsertSchema(equipment).omit({
  id: true,
});

export const insertRecipeSchema = createInsertSchema(recipes).omit({
  id: true,
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

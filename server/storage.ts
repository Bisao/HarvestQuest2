import { 
  type Player, 
  type InsertPlayer,
  type Resource,
  type InsertResource,
  type Biome,
  type InsertBiome,
  type InventoryItem,
  type InsertInventoryItem,
  type StorageItem,
  type InsertStorageItem,
  type Expedition,
  type InsertExpedition,
  type Equipment,
  type InsertEquipment,
  type Recipe,
  type InsertRecipe,
  type Quest,
  type InsertQuest,
  type PlayerQuest,
  type InsertPlayerQuest
} from "@shared/schema";
import { db, initializeDatabase } from "./db";
import * as schema from "@shared/schema";
import { eq, and } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  // Player methods
  getPlayer(id: string): Promise<Player | undefined>;
  getPlayerByUsername(username: string): Promise<Player | undefined>;
  createPlayer(player: InsertPlayer): Promise<Player>;
  updatePlayer(id: string, updates: Partial<Player>): Promise<Player>;

  // Resource methods
  getAllResources(): Promise<Resource[]>;
  getResource(id: string): Promise<Resource | undefined>;
  createResource(resource: InsertResource): Promise<Resource>;

  // Biome methods
  getAllBiomes(): Promise<Biome[]>;
  getBiome(id: string): Promise<Biome | undefined>;
  createBiome(biome: InsertBiome): Promise<Biome>;

  // Inventory methods
  getPlayerInventory(playerId: string): Promise<InventoryItem[]>;
  addInventoryItem(item: InsertInventoryItem): Promise<InventoryItem>;
  updateInventoryItem(id: string, updates: Partial<InventoryItem>): Promise<InventoryItem>;
  removeInventoryItem(id: string): Promise<void>;

  // Storage methods
  getPlayerStorage(playerId: string): Promise<StorageItem[]>;
  addStorageItem(item: InsertStorageItem): Promise<StorageItem>;
  updateStorageItem(id: string, updates: Partial<StorageItem>): Promise<StorageItem>;
  removeStorageItem(id: string): Promise<void>;
  
  // Water storage methods
  addWaterToPlayer(playerId: string, quantity: number): Promise<Player>;
  consumeWaterFromPlayer(playerId: string, quantity: number): Promise<Player>;

  // Expedition methods
  getPlayerExpeditions(playerId: string): Promise<Expedition[]>;
  getExpedition(id: string): Promise<Expedition | undefined>;
  createExpedition(expedition: InsertExpedition): Promise<Expedition>;
  updateExpedition(id: string, updates: Partial<Expedition>): Promise<Expedition>;

  // Equipment methods
  getAllEquipment(): Promise<Equipment[]>;

  // Recipe methods
  getAllRecipes(): Promise<Recipe[]>;
  getRecipe(id: string): Promise<Recipe | undefined>;

  // Quest methods
  getAllQuests(): Promise<Quest[]>;
  getQuest(id: string): Promise<Quest | undefined>;
  getPlayerQuests(playerId: string): Promise<PlayerQuest[]>;
  getPlayerQuest(playerId: string, questId: string): Promise<PlayerQuest | undefined>;
  createPlayerQuest(playerQuest: InsertPlayerQuest): Promise<PlayerQuest>;
  updatePlayerQuest(id: string, updates: Partial<PlayerQuest>): Promise<PlayerQuest>;

  // Game initialization
  initializeGameData(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async initializeGameData(): Promise<void> {
    await initializeDatabase();
  }

  // Player methods
  async getPlayer(id: string): Promise<Player | undefined> {
    const result = await db.select().from(schema.players).where(eq(schema.players.id, id));
    return result[0];
  }

  async getPlayerByUsername(username: string): Promise<Player | undefined> {
    const result = await db.select().from(schema.players).where(eq(schema.players.username, username));
    return result[0];
  }

  async createPlayer(insertPlayer: InsertPlayer): Promise<Player> {
    const result = await db.insert(schema.players).values(insertPlayer).returning();
    return result[0];
  }

  async updatePlayer(id: string, updates: Partial<Player>): Promise<Player> {
    const result = await db.update(schema.players)
      .set(updates)
      .where(eq(schema.players.id, id))
      .returning();
    
    if (!result[0]) throw new Error("Player not found");
    return result[0];
  }

  // Resource methods
  async getAllResources(): Promise<Resource[]> {
    return await db.select().from(schema.resources);
  }

  async getResource(id: string): Promise<Resource | undefined> {
    const result = await db.select().from(schema.resources).where(eq(schema.resources.id, id));
    return result[0];
  }

  async createResource(insertResource: InsertResource): Promise<Resource> {
    const result = await db.insert(schema.resources).values(insertResource).returning();
    return result[0];
  }

  // Biome methods
  async getAllBiomes(): Promise<Biome[]> {
    return await db.select().from(schema.biomes);
  }

  async getBiome(id: string): Promise<Biome | undefined> {
    const result = await db.select().from(schema.biomes).where(eq(schema.biomes.id, id));
    return result[0];
  }

  async createBiome(insertBiome: InsertBiome): Promise<Biome> {
    const result = await db.insert(schema.biomes).values(insertBiome).returning();
    return result[0];
  }

  // Inventory methods
  async getPlayerInventory(playerId: string): Promise<InventoryItem[]> {
    return await db.select().from(schema.inventoryItems).where(eq(schema.inventoryItems.playerId, playerId));
  }

  async addInventoryItem(insertItem: InsertInventoryItem): Promise<InventoryItem> {
    const result = await db.insert(schema.inventoryItems).values(insertItem).returning();
    return result[0];
  }

  async updateInventoryItem(id: string, updates: Partial<InventoryItem>): Promise<InventoryItem> {
    const result = await db.update(schema.inventoryItems)
      .set(updates)
      .where(eq(schema.inventoryItems.id, id))
      .returning();
    
    if (!result[0]) throw new Error("Inventory item not found");
    return result[0];
  }

  async removeInventoryItem(id: string): Promise<void> {
    await db.delete(schema.inventoryItems).where(eq(schema.inventoryItems.id, id));
  }

  // Storage methods
  async getPlayerStorage(playerId: string): Promise<StorageItem[]> {
    return await db.select().from(schema.storageItems).where(eq(schema.storageItems.playerId, playerId));
  }

  async addStorageItem(insertItem: InsertStorageItem): Promise<StorageItem> {
    const result = await db.insert(schema.storageItems).values(insertItem).returning();
    return result[0];
  }

  async updateStorageItem(id: string, updates: Partial<StorageItem>): Promise<StorageItem> {
    const result = await db.update(schema.storageItems)
      .set(updates)
      .where(eq(schema.storageItems.id, id))
      .returning();
    
    if (!result[0]) throw new Error("Storage item not found");
    return result[0];
  }

  async removeStorageItem(id: string): Promise<void> {
    await db.delete(schema.storageItems).where(eq(schema.storageItems.id, id));
  }

  // Special method for handling water storage (goes to player's water compartment)
  async addWaterToPlayer(playerId: string, quantity: number): Promise<Player> {
    const player = await this.getPlayer(playerId);
    if (!player) throw new Error("Player not found");

    const newWaterAmount = Math.min(player.waterStorage + quantity, player.maxWaterStorage);
    const actualAdded = newWaterAmount - player.waterStorage;

    if (actualAdded < quantity) {
      throw new Error(`Water storage is full! Can only add ${actualAdded} units.`);
    }

    return await this.updatePlayer(playerId, { 
      waterStorage: newWaterAmount 
    });
  }

  async consumeWaterFromPlayer(playerId: string, quantity: number): Promise<Player> {
    const player = await this.getPlayer(playerId);
    if (!player) throw new Error("Player not found");

    if (player.waterStorage < quantity) {
      throw new Error("Not enough water in storage!");
    }

    return await this.updatePlayer(playerId, { 
      waterStorage: player.waterStorage - quantity 
    });
  }

  // Expedition methods
  async getPlayerExpeditions(playerId: string): Promise<Expedition[]> {
    return await db.select().from(schema.expeditions).where(eq(schema.expeditions.playerId, playerId));
  }

  async getExpedition(id: string): Promise<Expedition | undefined> {
    const result = await db.select().from(schema.expeditions).where(eq(schema.expeditions.id, id));
    return result[0];
  }

  async createExpedition(insertExpedition: InsertExpedition): Promise<Expedition> {
    const result = await db.insert(schema.expeditions).values({
      ...insertExpedition,
      status: "in_progress",
      collectedResources: {},
      progress: 0,
    }).returning();
    return result[0];
  }

  async updateExpedition(id: string, updates: Partial<Expedition>): Promise<Expedition> {
    const result = await db.update(schema.expeditions)
      .set(updates)
      .where(eq(schema.expeditions.id, id))
      .returning();
    
    if (!result[0]) throw new Error("Expedition not found");
    return result[0];
  }

  // Equipment methods
  async getAllEquipment(): Promise<Equipment[]> {
    return await db.select().from(schema.equipment);
  }

  // Recipe methods
  async getAllRecipes(): Promise<Recipe[]> {
    return await db.select().from(schema.recipes);
  }

  async getRecipe(id: string): Promise<Recipe | undefined> {
    const result = await db.select().from(schema.recipes).where(eq(schema.recipes.id, id));
    return result[0];
  }

  // Quest methods
  async getAllQuests(): Promise<Quest[]> {
    return await db.select().from(schema.quests);
  }

  async getQuest(id: string): Promise<Quest | undefined> {
    const result = await db.select().from(schema.quests).where(eq(schema.quests.id, id));
    return result[0];
  }

  async getPlayerQuests(playerId: string): Promise<PlayerQuest[]> {
    return await db.select().from(schema.playerQuests).where(eq(schema.playerQuests.playerId, playerId));
  }

  async getPlayerQuest(playerId: string, questId: string): Promise<PlayerQuest | undefined> {
    const result = await db.select().from(schema.playerQuests)
      .where(and(
        eq(schema.playerQuests.playerId, playerId),
        eq(schema.playerQuests.questId, questId)
      ));
    return result[0];
  }

  async createPlayerQuest(insertPlayerQuest: InsertPlayerQuest): Promise<PlayerQuest> {
    const result = await db.insert(schema.playerQuests).values(insertPlayerQuest).returning();
    return result[0];
  }

  async updatePlayerQuest(id: string, updates: Partial<PlayerQuest>): Promise<PlayerQuest> {
    const result = await db.update(schema.playerQuests)
      .set(updates)
      .where(eq(schema.playerQuests.id, id))
      .returning();
    
    if (!result[0]) throw new Error("Player quest not found");
    return result[0];
  }
}

// Use database storage
export const storage = new DatabaseStorage();
console.log("🚀 Coletor Adventures using PostgreSQL Database Storage");
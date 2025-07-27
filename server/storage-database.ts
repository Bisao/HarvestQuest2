import { eq, sql } from "drizzle-orm";
import { db } from "./db";
import { 
  players, 
  resources, 
  biomes, 
  inventoryItems, 
  storageItems, 
  expeditions, 
  equipment, 
  recipes,
  quests,
  playerQuests,
  type Player,
  type Resource,
  type Biome,
  type InventoryItem,
  type StorageItem,
  type Expedition,
  type Equipment,
  type Recipe,
  type Quest,
  type PlayerQuest,
  type InsertPlayer,
  type InsertResource,
  type InsertBiome,
  type InsertInventoryItem,
  type InsertStorageItem,
  type InsertExpedition,
  type InsertEquipment,
  type InsertRecipe,
  type InsertQuest,
  type InsertPlayerQuest
} from "@shared/schema";
import type { IStorage } from "./storage";
import { BASIC_RESOURCES, UNIQUE_RESOURCES, ANIMAL_RESOURCES, FOOD_RESOURCES } from "./data/resources";
import { createBiomeData } from "./data/biomes";
import { ALL_EQUIPMENT } from "./data/equipment";
import { createRecipeData } from "./data/recipes";

export class DatabaseStorage implements IStorage {
  async createResource(resource: InsertResource): Promise<Resource> {
    const [newResource] = await db.insert(resources).values(resource).returning();
    return newResource;
  }

  async createBiome(biome: InsertBiome): Promise<Biome> {
    const [newBiome] = await db.insert(biomes).values(biome).returning();
    return newBiome;
  }
  async getPlayer(id: string): Promise<Player | undefined> {
    const [player] = await db.select().from(players).where(eq(players.id, id));
    return player || undefined;
  }

  async getPlayerByUsername(username: string): Promise<Player | undefined> {
    const [player] = await db.select().from(players).where(eq(players.username, username));
    return player || undefined;
  }

  async createPlayer(insertPlayer: InsertPlayer): Promise<Player> {
    const [player] = await db
      .insert(players)
      .values(insertPlayer)
      .returning();
    return player;
  }

  async updatePlayer(id: string, updates: Partial<Player>): Promise<Player> {
    const [player] = await db
      .update(players)
      .set(updates)
      .where(eq(players.id, id))
      .returning();
    return player;
  }

  async deletePlayer(id: string): Promise<void> {
    await db.delete(players).where(eq(players.id, id));
  }

  async getAllPlayers(): Promise<Player[]> {
    return await db.select().from(players);
  }

  // Resource methods
  async getAllResources(): Promise<Resource[]> {
    return await db.select().from(resources);
  }

  async getResource(id: string): Promise<Resource | undefined> {
    const [resource] = await db.select().from(resources).where(eq(resources.id, id));
    return resource || undefined;
  }

  // Biome methods
  async getAllBiomes(): Promise<Biome[]> {
    return await db.select().from(biomes);
  }

  async getBiome(id: string): Promise<Biome | undefined> {
    const [biome] = await db.select().from(biomes).where(eq(biomes.id, id));
    return biome || undefined;
  }

  // Inventory methods
  async getPlayerInventory(playerId: string): Promise<InventoryItem[]> {
    return await db.select().from(inventoryItems).where(eq(inventoryItems.playerId, playerId));
  }

  async addInventoryItem(item: InsertInventoryItem): Promise<InventoryItem> {
    const existingItems = await db
      .select()
      .from(inventoryItems)
      .where(eq(inventoryItems.playerId, item.playerId));
    
    const existingItem = existingItems.find(existing => existing.resourceId === item.resourceId);

    if (existingItem) {
      const [updatedItem] = await db
        .update(inventoryItems)
        .set({ quantity: (existingItem.quantity || 0) + (item.quantity || 0) })
        .where(eq(inventoryItems.id, existingItem.id))
        .returning();
      return updatedItem;
    } else {
      const [newItem] = await db
        .insert(inventoryItems)
        .values(item)
        .returning();
      return newItem;
    }
  }

  async updateInventoryItem(id: string, updates: Partial<InventoryItem>): Promise<InventoryItem> {
    const [item] = await db
      .update(inventoryItems)
      .set(updates)
      .where(eq(inventoryItems.id, id))
      .returning();
    return item;
  }

  async removeInventoryItem(id: string): Promise<void> {
    await db.delete(inventoryItems).where(eq(inventoryItems.id, id));
  }

  // Storage methods
  async getPlayerStorage(playerId: string): Promise<StorageItem[]> {
    return await db.select().from(storageItems).where(eq(storageItems.playerId, playerId));
  }

  async addStorageItem(item: InsertStorageItem): Promise<StorageItem> {
    const existingItems = await db
      .select()
      .from(storageItems)
      .where(eq(storageItems.playerId, item.playerId));
    
    const existingItem = existingItems.find(existing => existing.resourceId === item.resourceId);

    if (existingItem) {
      const [updatedItem] = await db
        .update(storageItems)
        .set({ quantity: (existingItem.quantity || 0) + (item.quantity || 0) })
        .where(eq(storageItems.id, existingItem.id))
        .returning();
      return updatedItem;
    } else {
      const [newItem] = await db
        .insert(storageItems)
        .values(item)
        .returning();
      return newItem;
    }
  }

  async updateStorageItem(id: string, updates: Partial<StorageItem>): Promise<StorageItem> {
    const [item] = await db
      .update(storageItems)
      .set(updates)
      .where(eq(storageItems.id, id))
      .returning();
    return item;
  }

  async removeStorageItem(id: string): Promise<void> {
    await db.delete(storageItems).where(eq(storageItems.id, id));
  }

  // Water storage methods
  async addWaterToPlayer(playerId: string, quantity: number): Promise<Player> {
    const player = await this.getPlayer(playerId);
    if (!player) throw new Error("Player not found");

    const newWaterStorage = Math.min(player.waterStorage + quantity, player.maxWaterStorage);
    return await this.updatePlayer(playerId, { waterStorage: newWaterStorage });
  }

  async consumeWaterFromPlayer(playerId: string, quantity: number): Promise<Player> {
    const player = await this.getPlayer(playerId);
    if (!player) throw new Error("Player not found");

    const newWaterStorage = Math.max(player.waterStorage - quantity, 0);
    const thirstRestored = Math.min(quantity, player.maxThirst - player.thirst);
    const newThirst = Math.min(player.thirst + thirstRestored, player.maxThirst);

    return await this.updatePlayer(playerId, { 
      waterStorage: newWaterStorage,
      thirst: newThirst
    });
  }

  // Expedition methods
  async getPlayerExpeditions(playerId: string): Promise<Expedition[]> {
    return await db.select().from(expeditions).where(eq(expeditions.playerId, playerId));
  }

  async getExpedition(id: string): Promise<Expedition | undefined> {
    const [expedition] = await db.select().from(expeditions).where(eq(expeditions.id, id));
    return expedition || undefined;
  }

  async createExpedition(expedition: InsertExpedition): Promise<Expedition> {
    const [newExpedition] = await db
      .insert(expeditions)
      .values({
        ...expedition,
        status: "in_progress",
        startTime: Date.now(),
        endTime: Date.now() + 60000, // 1 minute expedition
        progress: 0,
        collectedResources: {}
      })
      .returning();
    return newExpedition;
  }

  async updateExpedition(id: string, updates: Partial<Expedition>): Promise<Expedition> {
    const [expedition] = await db
      .update(expeditions)
      .set(updates)
      .where(eq(expeditions.id, id))
      .returning();
    return expedition;
  }

  // Equipment methods
  async getAllEquipment(): Promise<Equipment[]> {
    return await db.select().from(equipment);
  }

  // Recipe methods
  async getAllRecipes(): Promise<Recipe[]> {
    return await db.select().from(recipes);
  }

  async getRecipe(id: string): Promise<Recipe | undefined> {
    const [recipe] = await db.select().from(recipes).where(eq(recipes.id, id));
    return recipe || undefined;
  }

  // Quest methods 
  async getAllQuests(): Promise<Quest[]> {
    return await db.select().from(quests);
  }

  async getQuest(id: string): Promise<Quest | undefined> {
    const [quest] = await db.select().from(quests).where(eq(quests.id, id));
    return quest || undefined;
  }

  async getPlayerQuests(playerId: string): Promise<PlayerQuest[]> {
    return await db.select().from(playerQuests).where(eq(playerQuests.playerId, playerId));
  }

  async getPlayerQuest(playerId: string, questId: string): Promise<PlayerQuest | undefined> {
    const [playerQuest] = await db
      .select()
      .from(playerQuests)
      .where(
        sql`${playerQuests.playerId} = ${playerId} AND ${playerQuests.questId} = ${questId}`
      );
    return playerQuest || undefined;
  }

  async createPlayerQuest(insertPlayerQuest: InsertPlayerQuest): Promise<PlayerQuest> {
    const [newPlayerQuest] = await db
      .insert(playerQuests)
      .values(insertPlayerQuest)
      .returning();
    return newPlayerQuest;
  }

  async updatePlayerQuest(id: string, updates: Partial<PlayerQuest>): Promise<PlayerQuest> {
    const [playerQuest] = await db
      .update(playerQuests)
      .set(updates)
      .where(eq(playerQuests.id, id))
      .returning();
    return playerQuest;
  }

  // Game initialization
  async initializeGameData(): Promise<void> {
    // Check if data already exists
    const existingResources = await db.select().from(resources).limit(1);
    if (existingResources.length > 0) {
      return; // Data already initialized
    }

    // Insert resources
    const allResources = [...BASIC_RESOURCES, ...UNIQUE_RESOURCES, ...ANIMAL_RESOURCES, ...FOOD_RESOURCES];
    const insertedResources = await db.insert(resources).values(allResources).returning();
    const resourceIds = insertedResources.map(r => r.id);

    // Insert biomes with resource IDs
    const biomeData = createBiomeData(resourceIds);
    await db.insert(biomes).values(biomeData);

    // Insert equipment
    await db.insert(equipment).values(ALL_EQUIPMENT);

    // Insert recipes
    const recipeData = createRecipeData(resourceIds);
    await db.insert(recipes).values(recipeData);

    console.log("✅ PostgreSQL database initialized with game data successfully!");
  }
}
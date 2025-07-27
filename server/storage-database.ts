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
import { ALL_QUESTS } from "./data/quests";

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
    // Convert JavaScript timestamps to PostgreSQL compatible integers
    const now = Math.floor(Date.now() / 1000); // Convert to seconds for PostgreSQL integer storage
    const endTime = now + 60; // 1 minute expedition in seconds
    
    const [newExpedition] = await db
      .insert(expeditions)
      .values({
        ...expedition,
        status: "in_progress",
        startTime: now,
        endTime: endTime,
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
    console.log("🔄 Initializing game data...");
    
    // Check and initialize resources
    const existingResources = await db.select().from(resources).limit(1);
    if (existingResources.length === 0) {
      const allResources = [...BASIC_RESOURCES, ...UNIQUE_RESOURCES, ...ANIMAL_RESOURCES, ...FOOD_RESOURCES];
      await db.insert(resources).values(allResources);
      console.log("✅ Resources initialized");
    }

    // Check and initialize biomes
    const existingBiomes = await db.select().from(biomes).limit(1);
    if (existingBiomes.length === 0) {
      const allResources = await db.select().from(resources);
      const resourceIds = allResources.map(r => r.id);
      const biomeData = createBiomeData(resourceIds);
      await db.insert(biomes).values(biomeData);
      console.log("✅ Biomes initialized");
    }

    // Check and initialize equipment
    const existingEquipment = await db.select().from(equipment).limit(1);
    if (existingEquipment.length === 0) {
      await db.insert(equipment).values(ALL_EQUIPMENT);
      console.log("✅ Equipment initialized");
    }

    // Check and initialize recipes
    const existingRecipes = await db.select().from(recipes).limit(1);
    if (existingRecipes.length === 0) {
      const allResources = await db.select().from(resources);
      const resourceIds = allResources.map(r => r.id);
      const recipeData = createRecipeData(resourceIds);
      await db.insert(recipes).values(recipeData);
      console.log("✅ Recipes initialized");
    }

    // Check and initialize quests
    const existingQuests = await db.select().from(quests).limit(1);
    if (existingQuests.length === 0) {
      // Get current biome IDs to use in quest objectives
      const allBiomes = await db.select().from(biomes);
      const florestaBiome = allBiomes.find(b => b.name === "Floresta");
      const deserToBiome = allBiomes.find(b => b.name === "Deserto");
      
      if (florestaBiome) {
        // Create basic quests with correct biome IDs
        const basicQuests = [
          {
            name: "Primeiro Explorador",
            description: "Complete sua primeira expedição na Floresta",
            emoji: "🏕️",
            type: "explore" as const,
            category: "exploracao",
            requiredLevel: 1,
            objectives: [
              {
                type: "expedition" as const,
                biomeId: florestaBiome.id,
                quantity: 1,
                description: "Complete 1 expedição na Floresta"
              }
            ],
            rewards: {
              coins: 50,
              experience: 25,
              items: {}
            },
            isActive: true
          },
          {
            name: "Coletor Iniciante", 
            description: "Colete 10 Fibras para começar sua jornada",
            emoji: "🌾",
            type: "collect" as const,
            category: "coleta",
            requiredLevel: 1,
            objectives: [
              {
                type: "collect" as const,
                resourceId: "fibra",
                quantity: 10,
                description: "Colete 10 Fibras"
              }
            ],
            rewards: {
              coins: 25,
              experience: 15,
              items: {}
            },
            isActive: true
          },
          {
            name: "Artesão Novato",
            description: "Crafie seu primeiro Barbante",
            emoji: "🧵", 
            type: "craft" as const,
            category: "crafting",
            requiredLevel: 1,
            objectives: [
              {
                type: "craft" as const,
                recipeId: "barbante",
                quantity: 1,
                description: "Crafie 1 Barbante"
              }
            ],
            rewards: {
              coins: 30,
              experience: 20,
              items: {}
            },
            isActive: true
          }
        ];

        await db.insert(quests).values(basicQuests);
        console.log("✅ Quests initialized");
      }
    }

    console.log("🚀 PostgreSQL database initialization completed!");
  }
}
import { eq, sql } from "drizzle-orm";
import { randomUUID } from "crypto";
import { db, sqlite } from "./db-sqlite";
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
import { ALL_RESOURCES } from "./data/resources";
import { createBiomeData } from "./data/biomes";
import { ALL_EQUIPMENT } from "./data/equipment";
import { createRecipeData } from "./data/recipes";
import { ALL_QUESTS } from "./data/quests";
import { MigrationHelper, type PlayerBackup } from "./migration-helper";

export class SQLiteStorage implements IStorage {
  
  async initializeGameData(): Promise<void> {
    // Create tables if they don't exist
    await this.createTables();
    
    // Check if game data is already initialized
    const existingResources = await db.select().from(resources).limit(1);
    if (existingResources.length > 0) {
      console.log("Game data already exists, skipping initialization");
      return;
    }

    console.log("Initializing game data in SQLite database...");
    
    // Check if this is a migration and load player backups
    const playerBackups = MigrationHelper.isMigration() ? MigrationHelper.loadPlayerData() : [];
    
    // Initialize all resources using modular data with fixed IDs
    const resourceIds: string[] = [];
    for (const resource of ALL_RESOURCES) {
      const created = await this.createResource(resource);
      resourceIds.push(created.id);
    }

    // Initialize biomes using modular data (no need to pass resourceIds since biomes use fixed IDs)
    const biomesData = createBiomeData();
    for (const biome of biomesData) {
      await this.createBiome(biome);
    }

    // Initialize equipment using modular data
    for (const equip of ALL_EQUIPMENT) {
      await this.createEquipment(equip);
    }

    // Initialize recipes using modular data (no need to pass resourceIds since recipes use fixed IDs)
    const recipesData = createRecipeData();
    for (const recipe of recipesData) {
      await this.createRecipe(recipe);
    }

    // Initialize quests using modular data
    for (const quest of ALL_QUESTS) {
      await this.createQuest({ ...quest, category: quest.category || null });
    }

    console.log("SQLite game data initialized successfully!");
    
    // Restore player data if we had backups
    if (playerBackups.length > 0) {
      console.log("Restoring player data from backup...");
      for (const playerBackup of playerBackups) {
        try {
          // Check if player already exists in new system
          const existingPlayer = await db.select().from(players).where(eq(players.username, playerBackup.username)).limit(1);
          
          if (existingPlayer.length === 0) {
            // Create player in new system
            const newPlayer = await this.createPlayer({
              username: playerBackup.username,
              level: playerBackup.level,
              experience: playerBackup.experience,
              hunger: playerBackup.hunger,
              maxHunger: playerBackup.maxHunger,
              thirst: playerBackup.thirst,
              maxThirst: playerBackup.maxThirst,
              coins: playerBackup.coins,
              inventoryWeight: playerBackup.inventoryWeight,
              maxInventoryWeight: playerBackup.maxInventoryWeight,
              autoStorage: playerBackup.autoStorage,
              craftedItemsDestination: playerBackup.craftedItemsDestination,
              equippedHelmet: playerBackup.equippedHelmet,
              equippedChestplate: playerBackup.equippedChestplate,
              equippedLeggings: playerBackup.equippedLeggings,
              equippedBoots: playerBackup.equippedBoots,
              equippedWeapon: playerBackup.equippedWeapon,
              equippedTool: playerBackup.equippedTool
            });
            
            // Restore inventory items (only if they exist in new resource system)
            for (const invItem of playerBackup.inventory) {
              try {
                const resourceExists = await this.getResource(invItem.resourceId);
                if (resourceExists) {
                  await this.addInventoryItem({
                    playerId: newPlayer.id,
                    resourceId: invItem.resourceId,
                    quantity: invItem.quantity
                  });
                }
              } catch (err) {
                console.log(`Could not restore inventory item ${invItem.resourceId} for ${playerBackup.username}`);
              }
            }
            
            // Restore storage items (only if they exist in new resource system)
            for (const storageItem of playerBackup.storage) {
              try {
                const resourceExists = await this.getResource(storageItem.resourceId);
                if (resourceExists) {
                  await this.addStorageItem({
                    playerId: newPlayer.id,
                    resourceId: storageItem.resourceId,
                    quantity: storageItem.quantity
                  });
                }
              } catch (err) {
                console.log(`Could not restore storage item ${storageItem.resourceId} for ${playerBackup.username}`);
              }
            }
            
            console.log(`✓ Successfully restored player data for ${playerBackup.username}`);
          }
        } catch (err) {
          console.log(`✗ Failed to restore player ${playerBackup.username}:`, err);
        }
      }
      
      // Clean up backup file after successful restoration
      MigrationHelper.cleanupBackup();
      console.log("✓ Player data migration completed successfully!");
    }
  }

  private async createTables(): Promise<void> {
    // Create tables manually since we can't use Drizzle migrations easily
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS players (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        level INTEGER DEFAULT 1,
        experience INTEGER DEFAULT 0,
        hunger INTEGER DEFAULT 100,
        max_hunger INTEGER DEFAULT 100,
        thirst INTEGER DEFAULT 100,
        max_thirst INTEGER DEFAULT 100,
        coins INTEGER DEFAULT 0,
        inventory_weight INTEGER DEFAULT 0,
        max_inventory_weight INTEGER DEFAULT 100,
        auto_storage INTEGER DEFAULT 0,
        crafted_items_destination TEXT DEFAULT 'storage',
        water_storage INTEGER DEFAULT 0,
        max_water_storage INTEGER DEFAULT 500,
        equipped_helmet TEXT,
        equipped_chestplate TEXT,
        equipped_leggings TEXT,
        equipped_boots TEXT,
        equipped_weapon TEXT,
        equipped_tool TEXT
      );

      CREATE TABLE IF NOT EXISTS resources (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        emoji TEXT NOT NULL,
        weight INTEGER DEFAULT 1,
        value INTEGER DEFAULT 1,
        type TEXT NOT NULL,
        rarity TEXT DEFAULT 'common',
        required_tool TEXT,
        experience_value INTEGER DEFAULT 1
      );

      CREATE TABLE IF NOT EXISTS biomes (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        emoji TEXT NOT NULL,
        required_level INTEGER DEFAULT 1,
        available_resources TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS inventory_items (
        id TEXT PRIMARY KEY,
        player_id TEXT NOT NULL,
        resource_id TEXT NOT NULL,
        quantity INTEGER DEFAULT 0,
        FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
        FOREIGN KEY (resource_id) REFERENCES resources(id)
      );

      CREATE TABLE IF NOT EXISTS storage_items (
        id TEXT PRIMARY KEY,
        player_id TEXT NOT NULL,
        resource_id TEXT NOT NULL,
        quantity INTEGER DEFAULT 0,
        FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
        FOREIGN KEY (resource_id) REFERENCES resources(id)
      );

      CREATE TABLE IF NOT EXISTS expeditions (
        id TEXT PRIMARY KEY,
        player_id TEXT NOT NULL,
        biome_id TEXT NOT NULL,
        status TEXT DEFAULT 'in_progress',
        selected_resources TEXT NOT NULL,
        selected_equipment TEXT,
        collected_resources TEXT,
        start_time INTEGER,
        end_time INTEGER,
        progress INTEGER DEFAULT 0,
        FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
        FOREIGN KEY (biome_id) REFERENCES biomes(id)
      );

      CREATE TABLE IF NOT EXISTS equipment (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        emoji TEXT NOT NULL,
        effect TEXT NOT NULL,
        bonus INTEGER,
        slot TEXT NOT NULL,
        tool_type TEXT,
        weight INTEGER DEFAULT 2
      );

      CREATE TABLE IF NOT EXISTS recipes (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        emoji TEXT NOT NULL,
        required_level INTEGER DEFAULT 1,
        ingredients TEXT NOT NULL,
        output TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS quests (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        emoji TEXT NOT NULL,
        type TEXT NOT NULL,
        category TEXT,
        required_level INTEGER DEFAULT 1,
        objectives TEXT NOT NULL,
        rewards TEXT NOT NULL,
        is_active INTEGER DEFAULT 1
      );

      CREATE TABLE IF NOT EXISTS player_quests (
        id TEXT PRIMARY KEY,
        player_id TEXT NOT NULL,
        quest_id TEXT NOT NULL,
        status TEXT DEFAULT 'available',
        progress TEXT DEFAULT '{}',
        started_at INTEGER,
        completed_at INTEGER,
        FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
        FOREIGN KEY (quest_id) REFERENCES quests(id)
      );
    `);
  }

  // Player methods
  async getPlayer(id: string): Promise<Player | undefined> {
    const [player] = await db.select().from(players).where(eq(players.id, id));
    return player || undefined;
  }

  async getPlayerByUsername(username: string): Promise<Player | undefined> {
    const [player] = await db.select().from(players).where(eq(players.username, username));
    return player || undefined;
  }

  async createPlayer(insertPlayer: InsertPlayer): Promise<Player> {
    const id = randomUUID();
    const [player] = await db
      .insert(players)
      .values({ 
        ...insertPlayer, 
        id
      })
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

  async createResource(resource: InsertResource): Promise<Resource> {
    const id = resource.id || randomUUID(); // Use provided ID if available
    const [newResource] = await db.insert(resources).values({ ...resource, id }).returning();
    return newResource;
  }

  // Biome methods
  async getAllBiomes(): Promise<Biome[]> {
    return await db.select().from(biomes);
  }

  async getBiome(id: string): Promise<Biome | undefined> {
    const [biome] = await db.select().from(biomes).where(eq(biomes.id, id));
    return biome || undefined;
  }

  async createBiome(biome: InsertBiome): Promise<Biome> {
    const id = randomUUID();
    const [newBiome] = await db.insert(biomes).values({ ...biome, id }).returning();
    return newBiome;
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
        .set({ quantity: existingItem.quantity + (item.quantity || 0) })
        .where(eq(inventoryItems.id, existingItem.id))
        .returning();
      return updatedItem;
    } else {
      const id = randomUUID();
      const [newItem] = await db
        .insert(inventoryItems)
        .values({ ...item, id })
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
    // Get all storage items for the player
    const rawStorage = await db.select().from(storageItems).where(eq(storageItems.playerId, playerId));
    
    // Transform storage items to include proper resource/equipment information
    const result = await Promise.all(rawStorage.map(async (item) => {
      if (item.itemType === 'equipment') {
        // Equipment item
        const equipment = await this.getEquipment(item.resourceId);
        return {
          ...item,
          name: equipment?.name || 'Unknown Equipment',
          emoji: equipment?.emoji || '❓',
          type: 'equipment' as const
        };
      } else {
        // Resource item (default)
        const resource = await this.getResource(item.resourceId);
        return {
          ...item,
          name: resource?.name || 'Unknown Resource',
          emoji: resource?.emoji || '❓',
          type: 'resource' as const
        };
      }
    }));
    
    return result;
  }

  async addStorageItem(item: InsertStorageItem): Promise<StorageItem> {
    const existingItems = await db
      .select()
      .from(storageItems)
      .where(eq(storageItems.playerId, item.playerId));
    
    const existingItem = existingItems.find(existing => 
      existing.resourceId === item.resourceId && 
      existing.itemType === (item.itemType || 'resource')
    );

    if (existingItem) {
      const [updatedItem] = await db
        .update(storageItems)
        .set({ quantity: existingItem.quantity + (item.quantity || 0) })
        .where(eq(storageItems.id, existingItem.id))
        .returning();
      return updatedItem;
    } else {
      const id = randomUUID();
      const [newItem] = await db
        .insert(storageItems)
        .values({ ...item, id, itemType: item.itemType || 'resource' })
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
    return await db.select().from(expeditions).where(eq(expeditions.playerId, playerId));
  }

  async getExpedition(id: string): Promise<Expedition | undefined> {
    const [expedition] = await db.select().from(expeditions).where(eq(expeditions.id, id));
    return expedition || undefined;
  }

  async createExpedition(insertExpedition: InsertExpedition): Promise<Expedition> {
    const id = randomUUID();
    const [newExpedition] = await db.insert(expeditions).values({
      ...insertExpedition,
      id
    }).returning();
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

  async createEquipment(insertEquipment: InsertEquipment): Promise<Equipment> {
    const id = randomUUID();
    const [newEquipment] = await db.insert(equipment).values({ ...insertEquipment, id }).returning();
    return newEquipment;
  }

  // Recipe methods
  async getAllRecipes(): Promise<Recipe[]> {
    return await db.select().from(recipes);
  }

  async getRecipe(id: string): Promise<Recipe | undefined> {
    const [recipe] = await db.select().from(recipes).where(eq(recipes.id, id));
    return recipe || undefined;
  }

  async createRecipe(recipe: InsertRecipe): Promise<Recipe> {
    const id = randomUUID();
    const [newRecipe] = await db.insert(recipes).values({ ...recipe, id }).returning();
    return newRecipe;
  }

  // Quest methods
  async getAllQuests(): Promise<Quest[]> {
    return await db.select().from(quests);
  }

  async getQuest(id: string): Promise<Quest | undefined> {
    const [quest] = await db.select().from(quests).where(eq(quests.id, id));
    return quest || undefined;
  }

  async createQuest(quest: InsertQuest): Promise<Quest> {
    const id = randomUUID();
    const [newQuest] = await db.insert(quests).values({ ...quest, id }).returning();
    return newQuest;
  }

  // Player Quest methods
  async getPlayerQuests(playerId: string): Promise<PlayerQuest[]> {
    return await db.select().from(playerQuests).where(eq(playerQuests.playerId, playerId));
  }

  async getPlayerQuest(playerId: string, questId: string): Promise<PlayerQuest | undefined> {
    const [playerQuest] = await db.select().from(playerQuests)
      .where(eq(playerQuests.playerId, playerId));
    return playerQuest || undefined;
  }

  async createPlayerQuest(playerQuest: InsertPlayerQuest): Promise<PlayerQuest> {
    const id = randomUUID();
    const [newPlayerQuest] = await db.insert(playerQuests).values({ ...playerQuest, id }).returning();
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
}
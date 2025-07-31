// In-Memory Storage Implementation for Coletor Adventures
// Pure TypeScript implementation without database dependencies

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
} from "@shared/types";
import { randomUUID } from "crypto";

// Import game data
import { createResourcesWithIds } from "./data/resources";
import { createBiomeData } from "./data/biomes";
import { createEquipmentWithIds } from "./data/equipment";
import { createRecipeData } from "./data/recipes";
import { ALL_QUESTS } from "./data/quests";

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
  getEquipment(id: string): Promise<Equipment | undefined>;

  // Recipe methods
  getAllRecipes(): Promise<Recipe[]>;
  getRecipe(id: string): Promise<Recipe | undefined>;

  // Quest methods
  getAllQuests(): Promise<Quest[]>;
  getQuest(id: string): Promise<Quest | undefined>;
  getPlayerQuests(playerId: string): Promise<PlayerQuest[]>;
  createPlayerQuest(playerQuest: InsertPlayerQuest): Promise<PlayerQuest>;
  updatePlayerQuest(id: string, updates: Partial<PlayerQuest>): Promise<PlayerQuest>;

  // Initialization
  initializeGameData(): Promise<void>;
}

// In-Memory Storage Implementation
export class MemStorage implements IStorage {
  private players: Map<string, Player> = new Map();
  private playersByUsername: Map<string, Player> = new Map();
  private resources: Map<string, Resource> = new Map();
  private biomes: Map<string, Biome> = new Map();
  private inventoryItems: Map<string, InventoryItem> = new Map();
  private storageItems: Map<string, StorageItem> = new Map();
  private expeditions: Map<string, Expedition> = new Map();
  private equipment: Map<string, Equipment> = new Map();
  private recipes: Map<string, Recipe> = new Map();
  private quests: Map<string, Quest> = new Map();
  private playerQuests: Map<string, PlayerQuest> = new Map();

  async initializeGameData(): Promise<void> {
    // Initialize resources
    const resourceData = createResourcesWithIds();
    for (const resource of resourceData) {
      const fullResource: Resource = {
        id: resource.id,
        name: resource.name,
        emoji: resource.emoji,
        weight: resource.weight,
        sellPrice: resource.sellPrice,
        buyPrice: resource.buyPrice,
        type: resource.type || 'basic',
        rarity: resource.rarity,
        experienceValue: resource.experienceValue,
        requiredTool: resource.requiredTool,
        hunger_restore: resource.hunger_restore || null,
        thirst_restore: resource.thirst_restore || null,
        attributes: {
          durability: 100,
          efficiency: 1,
          rarity: resource.rarity,
          baseValue: resource.sellPrice
        }
      };
      this.resources.set(resource.id, fullResource);
    }

    // Initialize biomes
    const biomeData = createBiomeData();
    for (const biome of biomeData) {
      this.biomes.set(biome.id, biome);
    }

    // Initialize equipment
    const equipmentData = createEquipmentWithIds();
    for (const equip of equipmentData) {
      this.equipment.set(equip.id, equip);
    }

    // Initialize recipes
    const recipeData = createRecipeData();
    for (const recipe of recipeData) {
      this.recipes.set(recipe.id, recipe);
    }

    // Initialize quests
    for (const quest of ALL_QUESTS) {
      const questWithId: Quest = {
        id: randomUUID(),
        ...quest
      };
      this.quests.set(questWithId.id, questWithId);
    }

    console.log("✅ In-memory game data initialized successfully");
    console.log(`📊 Loaded: ${this.resources.size} resources, ${this.biomes.size} biomes, ${this.equipment.size} equipment, ${this.recipes.size} recipes, ${this.quests.size} quests`);
  }

  // Player methods
  async getPlayer(id: string): Promise<Player | undefined> {
    return this.players.get(id);
  }

  async getPlayerByUsername(username: string): Promise<Player | undefined> {
    return this.playersByUsername.get(username);
  }

  async createPlayer(player: InsertPlayer): Promise<Player> {
    const newPlayer: Player = {
      id: randomUUID(),
      username: player.username,
      level: player.level || 1,
      experience: player.experience || 0,
      hunger: player.hunger || 100,
      maxHunger: player.maxHunger || 100,
      thirst: player.thirst || 100,
      maxThirst: player.maxThirst || 100,
      coins: player.coins || 0,
      inventoryWeight: player.inventoryWeight || 0,
      maxInventoryWeight: player.maxInventoryWeight || 50000,
      autoStorage: player.autoStorage || false,
      craftedItemsDestination: player.craftedItemsDestination || 'inventory',
      waterStorage: player.waterStorage || 0,
      maxWaterStorage: player.maxWaterStorage || 100,
      waterTanks: player.waterTanks || 1,
      equippedHelmet: player.equippedHelmet || null,
      equippedChestplate: player.equippedChestplate || null,
      equippedLeggings: player.equippedLeggings || null,
      equippedBoots: player.equippedBoots || null,
      equippedWeapon: player.equippedWeapon || null,
      equippedTool: player.equippedTool || null
    };

    this.players.set(newPlayer.id, newPlayer);
    this.playersByUsername.set(newPlayer.username, newPlayer);
    return newPlayer;
  }

  async updatePlayer(id: string, updates: Partial<Player>): Promise<Player> {
    const player = this.players.get(id);
    if (!player) throw new Error("Player not found");

    const updatedPlayer = { ...player, ...updates };
    this.players.set(id, updatedPlayer);
    this.playersByUsername.set(updatedPlayer.username, updatedPlayer);
    return updatedPlayer;
  }

  // Resource methods
  async getAllResources(): Promise<Resource[]> {
    return Array.from(this.resources.values());
  }

  async getResource(id: string): Promise<Resource | undefined> {
    return this.resources.get(id);
  }

  async createResource(resource: InsertResource): Promise<Resource> {
    const newResource: Resource = {
      id: resource.id || randomUUID(),
      name: resource.name,
      emoji: resource.emoji,
      weight: resource.weight,
      sellPrice: resource.sellPrice,
      buyPrice: resource.buyPrice,
      type: resource.type || 'basic',
      rarity: resource.rarity,
      experienceValue: resource.experienceValue,
      requiredTool: resource.requiredTool,
      hunger_restore: resource.hunger_restore || null,
      thirst_restore: resource.thirst_restore || null,
      attributes: {
        durability: 100,
        efficiency: 1,
        rarity: resource.rarity,
        baseValue: resource.sellPrice
      }
    };

    this.resources.set(newResource.id, newResource);
    return newResource;
  }

  // Biome methods
  async getAllBiomes(): Promise<Biome[]> {
    return Array.from(this.biomes.values());
  }

  async getBiome(id: string): Promise<Biome | undefined> {
    return this.biomes.get(id);
  }

  async createBiome(biome: InsertBiome): Promise<Biome> {
    const newBiome: Biome = {
      id: biome.id || randomUUID(),
      ...biome
    };
    this.biomes.set(newBiome.id, newBiome);
    return newBiome;
  }

  // Inventory methods
  async getPlayerInventory(playerId: string): Promise<InventoryItem[]> {
    return Array.from(this.inventoryItems.values())
      .filter(item => item.playerId === playerId);
  }

  async addInventoryItem(item: InsertInventoryItem): Promise<InventoryItem> {
    const newItem: InventoryItem = {
      id: randomUUID(),
      playerId: item.playerId,
      resourceId: item.resourceId,
      quantity: item.quantity,
      itemType: item.itemType || 'resource'
    };

    this.inventoryItems.set(newItem.id, newItem);
    return newItem;
  }

  async updateInventoryItem(id: string, updates: Partial<InventoryItem>): Promise<InventoryItem> {
    const item = this.inventoryItems.get(id);
    if (!item) throw new Error("Inventory item not found");

    const updatedItem = { ...item, ...updates };
    this.inventoryItems.set(id, updatedItem);
    return updatedItem;
  }

  async removeInventoryItem(id: string): Promise<void> {
    this.inventoryItems.delete(id);
  }

  // Storage methods
  async getPlayerStorage(playerId: string): Promise<StorageItem[]> {
    return Array.from(this.storageItems.values())
      .filter(item => item.playerId === playerId);
  }

  async addStorageItem(item: InsertStorageItem): Promise<StorageItem> {
    const newItem: StorageItem = {
      id: randomUUID(),
      playerId: item.playerId,
      resourceId: item.resourceId,
      quantity: item.quantity,
      itemType: item.itemType || 'resource'
    };

    this.storageItems.set(newItem.id, newItem);
    return newItem;
  }

  async updateStorageItem(id: string, updates: Partial<StorageItem>): Promise<StorageItem> {
    const item = this.storageItems.get(id);
    if (!item) throw new Error("Storage item not found");

    const updatedItem = { ...item, ...updates };
    this.storageItems.set(id, updatedItem);
    return updatedItem;
  }

  async removeStorageItem(id: string): Promise<void> {
    this.storageItems.delete(id);
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
    return Array.from(this.expeditions.values())
      .filter(expedition => expedition.playerId === playerId);
  }

  async getExpedition(id: string): Promise<Expedition | undefined> {
    return this.expeditions.get(id);
  }

  async createExpedition(expedition: InsertExpedition): Promise<Expedition> {
    const newExpedition: Expedition = {
      id: randomUUID(),
      playerId: expedition.playerId,
      biomeId: expedition.biomeId,
      selectedResources: expedition.selectedResources,
      duration: expedition.duration,
      status: "in_progress",
      collectedResources: {},
      progress: 0,
      startTime: Date.now(),
      endTime: expedition.endTime || (Date.now() + expedition.duration * 1000)
    };

    this.expeditions.set(newExpedition.id, newExpedition);
    return newExpedition;
  }

  async updateExpedition(id: string, updates: Partial<Expedition>): Promise<Expedition> {
    const expedition = this.expeditions.get(id);
    if (!expedition) throw new Error("Expedition not found");

    const updatedExpedition = { ...expedition, ...updates };
    this.expeditions.set(id, updatedExpedition);
    return updatedExpedition;
  }

  // Equipment methods
  async getAllEquipment(): Promise<Equipment[]> {
    return Array.from(this.equipment.values());
  }

  async getEquipment(id: string): Promise<Equipment | undefined> {
    return this.equipment.get(id);
  }

  // Recipe methods
  async getAllRecipes(): Promise<Recipe[]> {
    return Array.from(this.recipes.values());
  }

  async getRecipe(id: string): Promise<Recipe | undefined> {
    return this.recipes.get(id);
  }

  // Quest methods
  async getAllQuests(): Promise<Quest[]> {
    return Array.from(this.quests.values());
  }

  async getQuest(id: string): Promise<Quest | undefined> {
    return this.quests.get(id);
  }

  async getPlayerQuests(playerId: string): Promise<PlayerQuest[]> {
    return Array.from(this.playerQuests.values())
      .filter(quest => quest.playerId === playerId);
  }

  async createPlayerQuest(playerQuest: InsertPlayerQuest): Promise<PlayerQuest> {
    const newPlayerQuest: PlayerQuest = {
      id: randomUUID(),
      playerId: playerQuest.playerId,
      questId: playerQuest.questId,
      status: playerQuest.status || 'active',
      progress: playerQuest.progress || {},
      startedAt: Date.now(),
      completedAt: playerQuest.completedAt || null
    };

    this.playerQuests.set(newPlayerQuest.id, newPlayerQuest);
    return newPlayerQuest;
  }

  async updatePlayerQuest(id: string, updates: Partial<PlayerQuest>): Promise<PlayerQuest> {
    const quest = this.playerQuests.get(id);
    if (!quest) throw new Error("Player quest not found");

    const updatedQuest = { ...quest, ...updates };
    this.playerQuests.set(id, updatedQuest);
    return updatedQuest;
  }
}

// Export singleton instance
export const storage = new MemStorage();
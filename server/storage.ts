
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
import { readFileSync, writeFileSync, existsSync } from "fs";
import { ALL_RESOURCES } from "./data/resources";
import { ALL_EQUIPMENT } from "./data/equipment";
import { createBiomeData } from "./data/biomes";
import { createRecipeData } from "./data/recipes";
import { ALL_QUESTS } from "./data/quests";

export interface IStorage {
  // Player methods
  getPlayer(id: string): Promise<Player | undefined>;
  getPlayerByUsername(username: string): Promise<Player | undefined>;
  getAllPlayers(): Promise<Player[]>;
  createPlayer(player: InsertPlayer): Promise<Player>;
  updatePlayer(id: string, updates: Partial<Player>): Promise<Player>;
  deletePlayer(id: string): Promise<void>;

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
  
  // Persistence methods
  saveData(): Promise<void>;
  loadData(): Promise<void>;
}

interface StorageData {
  players: Array<[string, Player]>;
  inventoryItems: Array<[string, InventoryItem]>;
  storageItems: Array<[string, StorageItem]>;
  expeditions: Array<[string, Expedition]>;
  playerQuests: Array<[string, PlayerQuest]>;
}

export class MemStorage implements IStorage {
  private players: Map<string, Player>;
  private resources: Map<string, Resource>;
  private biomes: Map<string, Biome>;
  private inventoryItems: Map<string, InventoryItem>;
  private storageItems: Map<string, StorageItem>;
  private expeditions: Map<string, Expedition>;
  private equipment: Map<string, Equipment>;
  private recipes: Map<string, Recipe>;
  private quests: Map<string, Quest>;
  private playerQuests: Map<string, PlayerQuest>;
  private saveFile = 'data.json';
  private isInitialized = false;
  private hungerThirstService: any = null;

  constructor() {
    this.players = new Map();
    this.resources = new Map();
    this.biomes = new Map();
    this.inventoryItems = new Map();
    this.storageItems = new Map();
    this.expeditions = new Map();
    this.equipment = new Map();
    this.recipes = new Map();
    this.quests = new Map();
    this.playerQuests = new Map();
  }

  async saveData(): Promise<void> {
    if (!this.isInitialized) return;
    
    try {
      const data: StorageData = {
        players: Array.from(this.players.entries()),
        inventoryItems: Array.from(this.inventoryItems.entries()),
        storageItems: Array.from(this.storageItems.entries()),
        expeditions: Array.from(this.expeditions.entries()),
        playerQuests: Array.from(this.playerQuests.entries())
      };

      writeFileSync(this.saveFile, JSON.stringify(data, null, 2));
      console.log(`💾 Game data saved to ${this.saveFile}`);
    } catch (error) {
      console.error('Failed to save game data:', error);
    }
  }

  async loadData(): Promise<void> {
    try {
      if (existsSync(this.saveFile)) {
        const fileContent = readFileSync(this.saveFile, 'utf-8');
        const data: StorageData = JSON.parse(fileContent);

        // Load player data
        if (data.players) {
          for (const [id, player] of data.players) {
            this.players.set(id, player);
          }
        }

        // Load inventory items
        if (data.inventoryItems) {
          for (const [id, item] of data.inventoryItems) {
            this.inventoryItems.set(id, item);
          }
        }

        // Load storage items
        if (data.storageItems) {
          for (const [id, item] of data.storageItems) {
            this.storageItems.set(id, item);
          }
        }

        // Load expeditions
        if (data.expeditions) {
          for (const [id, expedition] of data.expeditions) {
            this.expeditions.set(id, expedition);
          }
        }

        // Load player quests
        if (data.playerQuests) {
          for (const [id, playerQuest] of data.playerQuests) {
            this.playerQuests.set(id, playerQuest);
          }
        }

        console.log(`📂 Game data loaded from ${this.saveFile}`);
        console.log(`👥 Players loaded: ${this.players.size}`);
      } else {
        console.log(`📂 No save file found, starting fresh`);
      }
    } catch (error) {
      console.error('Failed to load game data:', error);
    }
  }

  async initializeGameData(): Promise<void> {
    // Load persisted data first
    await this.loadData();

    // Initialize all resources using modular data
    const resourceIds: string[] = [];

    for (const resource of ALL_RESOURCES) {
      const created = await this.createResource(resource);
      resourceIds.push(created.id);
    }

    // Initialize biomes using modular data
    const biomesData = createBiomeData();
    for (const biome of biomesData) {
      await this.createBiome(biome);
    }

    // Initialize equipment using modular data
    for (const equip of ALL_EQUIPMENT) {
      await this.createEquipment(equip);
    }

    // Initialize recipes using modular data
    const recipesData = createRecipeData();
    for (const recipe of recipesData) {
      await this.createRecipe(recipe);
    }

    // Initialize quests using modular data
    for (const quest of ALL_QUESTS) {
      await this.createQuest({ ...quest, category: quest.category || null });
    }

    // No default player creation - players must be created via the main menu

    this.isInitialized = true;
    
    // Setup auto-save every 30 seconds
    setInterval(async () => {
      await this.saveData();
    }, 30000);

    // Initialize hunger/thirst degradation system
    this.initializeHungerThirstSystem();

    console.log("🎮 Game initialized successfully");
  }

  private async initializeHungerThirstSystem(): Promise<void> {
    try {
      const { HungerThirstService } = await import("./services/hunger-thirst-service");
      this.hungerThirstService = new HungerThirstService(this);
      this.hungerThirstService.startPassiveDegradation();
    } catch (error) {
      console.error('Failed to initialize hunger/thirst system:', error);
    }
  }

  // Player methods
  async getPlayer(id: string): Promise<Player | undefined> {
    return this.players.get(id);
  }

  async getPlayerByUsername(username: string): Promise<Player | undefined> {
    return Array.from(this.players.values()).find(
      (player) => player.username === username,
    );
  }

  async getAllPlayers(): Promise<Player[]> {
    return Array.from(this.players.values());
  }

  async createPlayer(insertPlayer: InsertPlayer): Promise<Player> {
    // Check if username already exists
    const existingPlayer = await this.getPlayerByUsername(insertPlayer.username);
    if (existingPlayer) {
      throw new Error("Nome de usuário já existe");
    }

    // Validate username
    if (!insertPlayer.username || insertPlayer.username.trim().length < 2) {
      throw new Error("Nome de usuário deve ter pelo menos 2 caracteres");
    }

    if (insertPlayer.username.length > 20) {
      throw new Error("Nome de usuário não pode ter mais de 20 caracteres");
    }

    const id = randomUUID();
    const player: Player = { 
      id,
      username: insertPlayer.username.trim(),
      level: insertPlayer.level ?? 1,
      experience: insertPlayer.experience ?? 0,
      hunger: insertPlayer.hunger ?? 100,
      maxHunger: insertPlayer.maxHunger ?? 100,
      thirst: insertPlayer.thirst ?? 100,
      maxThirst: insertPlayer.maxThirst ?? 100,
      coins: insertPlayer.coins ?? 0,
      inventoryWeight: insertPlayer.inventoryWeight ?? 0,
      maxInventoryWeight: insertPlayer.maxInventoryWeight ?? 50000,
      autoStorage: insertPlayer.autoStorage ?? false,
      craftedItemsDestination: insertPlayer.craftedItemsDestination ?? 'storage',
      waterStorage: insertPlayer.waterStorage ?? 0,
      maxWaterStorage: insertPlayer.maxWaterStorage ?? 500,
      waterTanks: insertPlayer.waterTanks ?? 0,
      equippedHelmet: insertPlayer.equippedHelmet || null,
      equippedChestplate: insertPlayer.equippedChestplate || null,
      equippedLeggings: insertPlayer.equippedLeggings || null,
      equippedBoots: insertPlayer.equippedBoots || null,
      equippedWeapon: insertPlayer.equippedWeapon || null,
      equippedTool: insertPlayer.equippedTool || null,
      autoCompleteQuests: insertPlayer.autoCompleteQuests ?? true,
    };
    
    this.players.set(id, player);
    
    // Auto-save after creating player
    await this.saveData();
    
    return player;
  }

  async updatePlayer(id: string, updates: Partial<Player>): Promise<Player> {
    const player = this.players.get(id);
    if (!player) throw new Error("Player not found");

    const updated = { ...player, ...updates };
    this.players.set(id, updated);
    
    // Auto-save after updating player
    await this.saveData();
    
    return updated;
  }

  async deletePlayer(id: string): Promise<void> {
    const player = this.players.get(id);
    if (!player) throw new Error("Player not found");

    // Delete player data
    this.players.delete(id);

    // Delete related data
    const playerInventory = await this.getPlayerInventory(id);
    for (const item of playerInventory) {
      await this.removeInventoryItem(item.id);
    }

    const playerStorage = await this.getPlayerStorage(id);
    for (const item of playerStorage) {
      await this.removeStorageItem(item.id);
    }

    const playerExpeditions = await this.getPlayerExpeditions(id);
    for (const expedition of playerExpeditions) {
      this.expeditions.delete(expedition.id);
    }

    const playerQuests = await this.getPlayerQuests(id);
    for (const quest of playerQuests) {
      this.playerQuests.delete(quest.id);
    }

    // Auto-save after deleting player
    await this.saveData();
  }

  // Resource methods
  async getAllResources(): Promise<Resource[]> {
    return Array.from(this.resources.values());
  }

  async getResource(id: string): Promise<Resource | undefined> {
    return this.resources.get(id);
  }

  async createResource(insertResource: InsertResource): Promise<Resource> {
    // Use predefined ID if provided, otherwise generate random UUID
    const id = insertResource.id || randomUUID();
    const resource: Resource = {
      id,
      name: insertResource.name,
      emoji: insertResource.emoji,
      rarity: insertResource.rarity ?? 'common',
      experienceValue: insertResource.experienceValue ?? 1,

      // Fundamental Attributes
      attributes: insertResource.attributes ?? { durability: 100, efficiency: 1.0, rarity: 'common', baseValue: insertResource.sellPrice ?? 1 },

      // Resource Classification  
      category: insertResource.category ?? 'raw_materials',
      subcategory: insertResource.subcategory ?? 'basic',

      // Spawn Properties
      spawnRate: insertResource.spawnRate ?? 0.5,
      yieldAmount: insertResource.yieldAmount ?? 1,
      requiredTool: insertResource.requiredTool,

      // Economy
      sellPrice: insertResource.sellPrice ?? 1,
      buyPrice: insertResource.buyPrice ?? 2,

      // Physical Properties
      weight: insertResource.weight ?? 1,
      stackable: insertResource.stackable ?? true,
      maxStackSize: insertResource.maxStackSize ?? 99,

      // Effects & Tags
      effects: insertResource.effects ?? [],
      tags: insertResource.tags ?? [],

      // Derived Properties (calculated from attributes)
      value: insertResource.sellPrice ?? 1,
    };
    this.resources.set(id, resource);
    return resource;
  }

  // Biome methods
  async getAllBiomes(): Promise<Biome[]> {
    return Array.from(this.biomes.values());
  }

  async getBiome(id: string): Promise<Biome | undefined> {
    return this.biomes.get(id);
  }

  async createBiome(insertBiome: InsertBiome): Promise<Biome> {
    // Use predefined ID if provided, otherwise generate random UUID
    const id = insertBiome.id || randomUUID();
    const biome: Biome = {
      id,
      name: insertBiome.name,
      emoji: insertBiome.emoji,
      requiredLevel: insertBiome.requiredLevel ?? 1,
      availableResources: insertBiome.availableResources,
    };
    this.biomes.set(id, biome);
    return biome;
  }

  // Inventory methods
  async getPlayerInventory(playerId: string): Promise<InventoryItem[]> {
    return Array.from(this.inventoryItems.values()).filter(
      (item) => item.playerId === playerId,
    );
  }

  async addInventoryItem(insertItem: InsertInventoryItem): Promise<InventoryItem> {
    const id = randomUUID();
    const item: InventoryItem = {
      id,
      playerId: insertItem.playerId,
      resourceId: insertItem.resourceId,
      quantity: insertItem.quantity ?? 0,
    };
    this.inventoryItems.set(id, item);
    await this.saveData();
    return item;
  }

  async updateInventoryItem(id: string, updates: Partial<InventoryItem>): Promise<InventoryItem> {
    const item = this.inventoryItems.get(id);
    if (!item) throw new Error("Inventory item not found");

    const updated = { ...item, ...updates };
    this.inventoryItems.set(id, updated);
    await this.saveData();
    return updated;
  }

  async removeInventoryItem(id: string): Promise<void> {
    this.inventoryItems.delete(id);
    await this.saveData();
  }

  // Storage methods
  async getPlayerStorage(playerId: string): Promise<StorageItem[]> {
    return Array.from(this.storageItems.values()).filter(
      (item) => item.playerId === playerId,
    );
  }

  async addStorageItem(insertItem: InsertStorageItem): Promise<StorageItem> {
    const id = randomUUID();
    const item: StorageItem = {
      id,
      playerId: insertItem.playerId,
      resourceId: insertItem.resourceId,
      quantity: insertItem.quantity ?? 0,
      itemType: insertItem.itemType ?? 'resource',
    };
    this.storageItems.set(id, item);
    await this.saveData();
    return item;
  }

  async updateStorageItem(id: string, updates: Partial<StorageItem>): Promise<StorageItem> {
    const item = this.storageItems.get(id);
    if (!item) throw new Error("Storage item not found");

    const updated = { ...item, ...updates };
    this.storageItems.set(id, updated);
    await this.saveData();
    return updated;
  }

  async removeStorageItem(id: string): Promise<void> {
    this.storageItems.delete(id);
    await this.saveData();
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
    return Array.from(this.expeditions.values()).filter(
      (expedition) => expedition.playerId === playerId,
    );
  }

  async getExpedition(id: string): Promise<Expedition | undefined> {
    return this.expeditions.get(id);
  }

  async createExpedition(insertExpedition: InsertExpedition): Promise<Expedition> {
    const id = randomUUID();
    const expedition: Expedition = {
      id,
      playerId: insertExpedition.playerId,
      biomeId: insertExpedition.biomeId,
      status: "in_progress",
      selectedResources: insertExpedition.selectedResources,
      selectedEquipment: insertExpedition.selectedEquipment,
      collectedResources: {},
      startTime: Date.now(),
      endTime: null,
      progress: 0,
    };

    console.log('Storing expedition with ID:', id);
    this.expeditions.set(id, expedition);
    await this.saveData();
    return expedition;
  }

  async updateExpedition(id: string, updates: Partial<Expedition>): Promise<Expedition> {
    const expedition = this.expeditions.get(id);
    if (!expedition) throw new Error("Expedition not found");

    const updated = { ...expedition, ...updates };
    this.expeditions.set(id, updated);
    await this.saveData();
    return updated;
  }

  // Equipment methods
  async getAllEquipment(): Promise<Equipment[]> {
    return Array.from(this.equipment.values());
  }

  async createEquipment(insertEquipment: InsertEquipment): Promise<Equipment> {
    // Use predefined ID if provided, otherwise generate random UUID
    const id = insertEquipment.id || randomUUID();
    const equipment: Equipment = {
      id,
      name: insertEquipment.name,
      emoji: insertEquipment.emoji,

      // Fundamental Attributes
      attributes: insertEquipment.attributes ?? { durability: 100, efficiency: 1.0, rarity: 'common' },

      // Equipment Classification
      category: insertEquipment.category,
      slot: insertEquipment.slot ?? 'tool',
      toolType: insertEquipment.toolType,

      // Equipment Effects
      effects: insertEquipment.effects ?? [],

      // Requirements to use
      requirements: insertEquipment.requirements ?? [],

      // Derived Properties
      weight: insertEquipment.weight ?? 1,
      value: insertEquipment.value ?? 1,
    };
    this.equipment.set(id, equipment);
    return equipment;
  }

  // Recipe methods
  async getAllRecipes(): Promise<Recipe[]> {
    return Array.from(this.recipes.values());
  }

  async getRecipe(id: string): Promise<Recipe | undefined> {
    return this.recipes.get(id);
  }

  async createRecipe(insertRecipe: InsertRecipe): Promise<Recipe> {
    const id = randomUUID();
    const recipe: Recipe = {
      id,
      name: insertRecipe.name,
      emoji: insertRecipe.emoji,
      requiredLevel: insertRecipe.requiredLevel ?? 1,
      // Recipe Data - support both old and new formats
      category: insertRecipe.category ?? 'basic_materials',
      subcategory: insertRecipe.subcategory ?? '',
      difficulty: insertRecipe.difficulty ?? 'trivial',

      // Requirements
      requiredSkills: insertRecipe.requiredSkills ?? [],
      requiredTools: insertRecipe.requiredTools ?? [],

      // Recipe Data
      ingredients: insertRecipe.ingredients,
      outputs: insertRecipe.outputs,

      // Process Information
      craftingTime: insertRecipe.craftingTime ?? 5,
      experienceGained: insertRecipe.experienceGained ?? 10,
      successRate: insertRecipe.successRate ?? 100,
    };
    this.recipes.set(id, recipe);
    return recipe;
  }

  // Quest methods
  async getAllQuests(): Promise<Quest[]> {
    return Array.from(this.quests.values());
  }

  async getQuest(id: string): Promise<Quest | undefined> {
    return this.quests.get(id);
  }

  async createQuest(insertQuest: InsertQuest): Promise<Quest> {
    const id = randomUUID();
    const quest: Quest = {
      id,
      name: insertQuest.name,
      description: insertQuest.description,
      emoji: insertQuest.emoji,
      type: insertQuest.type,
      category: insertQuest.category || null,
      requiredLevel: insertQuest.requiredLevel ?? 1,
      objectives: insertQuest.objectives,
      rewards: insertQuest.rewards,
      isActive: insertQuest.isActive ?? true,
    };
    this.quests.set(id, quest);
    return quest;
  }

  async getPlayerQuests(playerId: string): Promise<PlayerQuest[]> {
    return Array.from(this.playerQuests.values()).filter(
      (playerQuest) => playerQuest.playerId === playerId,
    );
  }

  async getPlayerQuest(playerId: string, questId: string): Promise<PlayerQuest | undefined> {
    return Array.from(this.playerQuests.values()).find(
      (playerQuest) => playerQuest.playerId === playerId && playerQuest.questId === questId,
    );
  }

  async createPlayerQuest(insertPlayerQuest: InsertPlayerQuest): Promise<PlayerQuest> {
    const id = randomUUID();
    const playerQuest: PlayerQuest = {
      id,
      playerId: insertPlayerQuest.playerId,
      questId: insertPlayerQuest.questId,
      status: insertPlayerQuest.status ?? 'available',
      progress: insertPlayerQuest.progress ?? {},
      startedAt: null,
      completedAt: null,
    };
    this.playerQuests.set(id, playerQuest);
    await this.saveData();
    return playerQuest;
  }

  async updatePlayerQuest(id: string, updates: Partial<PlayerQuest>): Promise<PlayerQuest> {
    const playerQuest = this.playerQuests.get(id);
    if (!playerQuest) throw new Error("Player quest not found");

    const updated = { ...playerQuest, ...updates };
    this.playerQuests.set(id, updated);
    await this.saveData();
    return updated;
  }
}

// Use in-memory storage - no database dependencies
export const storage = new MemStorage();
console.log("🚀 Coletor Adventures using Enhanced In-Memory Storage with Persistence");

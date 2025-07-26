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
  type InsertRecipe
} from "@shared/schema";
import { randomUUID } from "crypto";
import { ALL_RESOURCES } from "./data/resources";
import { ALL_EQUIPMENT } from "./data/equipment";
import { createBiomeData } from "./data/biomes";
import { createRecipeData } from "./data/recipes";

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

  // Game initialization
  initializeGameData(): Promise<void>;
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

  constructor() {
    this.players = new Map();
    this.resources = new Map();
    this.biomes = new Map();
    this.inventoryItems = new Map();
    this.storageItems = new Map();
    this.expeditions = new Map();
    this.equipment = new Map();
    this.recipes = new Map();
  }

  async initializeGameData(): Promise<void> {
    // Initialize all resources using modular data
    const resourceIds: string[] = [];

    for (const resource of ALL_RESOURCES) {
      const created = await this.createResource(resource);
      resourceIds.push(created.id);
    }

    // Initialize biomes using modular data
    const biomesData = createBiomeData(resourceIds);
    for (const biome of biomesData) {
      await this.createBiome(biome);
    }

    // Initialize equipment using modular data
    for (const equip of ALL_EQUIPMENT) {
      await this.createEquipment(equip);
    }

    // Initialize recipes using modular data
    const recipesData = createRecipeData(resourceIds);
    for (const recipe of recipesData) {
      await this.createRecipe(recipe);
    }

    // Create default player
    const defaultPlayer = await this.createPlayer({
      username: "Player1",
      level: 1,
      experience: 0,
      energy: 100,
      maxEnergy: 100,
      coins: 0,
      inventoryWeight: 0,
      maxInventoryWeight: 50,
      autoStorage: false,
      equippedHelmet: null,
      equippedChestplate: null,
      equippedLeggings: null,
      equippedBoots: null,
      equippedWeapon: null,
      equippedTool: null,
    });

    // Add some initial resources to storage for testing crafting
    await this.addStorageItem({
      playerId: defaultPlayer.id,
      resourceId: resourceIds[3], // Madeira
      quantity: 5,
    });
    await this.addStorageItem({
      playerId: defaultPlayer.id,
      resourceId: resourceIds[1], // Pedra
      quantity: 10,
    });
    await this.addStorageItem({
      playerId: defaultPlayer.id,
      resourceId: resourceIds[0], // Fibra
      quantity: 8,
    });
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

  async createPlayer(insertPlayer: InsertPlayer): Promise<Player> {
    const id = randomUUID();
    const player: Player = { 
      id,
      username: insertPlayer.username,
      level: insertPlayer.level ?? 1,
      experience: insertPlayer.experience ?? 0,
      energy: insertPlayer.energy ?? 100,
      maxEnergy: insertPlayer.maxEnergy ?? 100,
      coins: insertPlayer.coins ?? 0,
      inventoryWeight: insertPlayer.inventoryWeight ?? 0,
      maxInventoryWeight: insertPlayer.maxInventoryWeight ?? 100,
      autoStorage: insertPlayer.autoStorage ?? false,
      equippedHelmet: insertPlayer.equippedHelmet || null,
      equippedChestplate: insertPlayer.equippedChestplate || null,
      equippedLeggings: insertPlayer.equippedLeggings || null,
      equippedBoots: insertPlayer.equippedBoots || null,
      equippedWeapon: insertPlayer.equippedWeapon || null,
      equippedTool: insertPlayer.equippedTool || null,
    };
    this.players.set(id, player);
    return player;
  }

  async updatePlayer(id: string, updates: Partial<Player>): Promise<Player> {
    const player = this.players.get(id);
    if (!player) throw new Error("Player not found");

    const updated = { ...player, ...updates };
    this.players.set(id, updated);
    return updated;
  }

  // Resource methods
  async getAllResources(): Promise<Resource[]> {
    return Array.from(this.resources.values());
  }

  async getResource(id: string): Promise<Resource | undefined> {
    return this.resources.get(id);
  }

  async createResource(insertResource: InsertResource): Promise<Resource> {
    const id = randomUUID();
    const resource: Resource = {
      id,
      name: insertResource.name,
      emoji: insertResource.emoji,
      weight: insertResource.weight ?? 1,
      value: insertResource.value ?? 1,
      type: insertResource.type,
      rarity: insertResource.rarity ?? 'common',
      requiredTool: insertResource.requiredTool || null,
      experienceValue: insertResource.experienceValue ?? 1,
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
    const id = randomUUID();
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
    return item;
  }

  async updateInventoryItem(id: string, updates: Partial<InventoryItem>): Promise<InventoryItem> {
    const item = this.inventoryItems.get(id);
    if (!item) throw new Error("Inventory item not found");

    const updated = { ...item, ...updates };
    this.inventoryItems.set(id, updated);
    return updated;
  }

  async removeInventoryItem(id: string): Promise<void> {
    this.inventoryItems.delete(id);
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
    };
    this.storageItems.set(id, item);
    return item;
  }

  async updateStorageItem(id: string, updates: Partial<StorageItem>): Promise<StorageItem> {
    const item = this.storageItems.get(id);
    if (!item) throw new Error("Storage item not found");

    const updated = { ...item, ...updates };
    this.storageItems.set(id, updated);
    return updated;
  }

  async removeStorageItem(id: string): Promise<void> {
    this.storageItems.delete(id);
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
    return expedition;
  }

  async updateExpedition(id: string, updates: Partial<Expedition>): Promise<Expedition> {
    const expedition = this.expeditions.get(id);
    if (!expedition) throw new Error("Expedition not found");

    const updated = { ...expedition, ...updates };
    this.expeditions.set(id, updated);
    return updated;
  }

  // Equipment methods
  async getAllEquipment(): Promise<Equipment[]> {
    return Array.from(this.equipment.values());
  }

  async createEquipment(insertEquipment: InsertEquipment): Promise<Equipment> {
    const id = randomUUID();
    const equipment: Equipment = {
      id,
      name: insertEquipment.name,
      emoji: insertEquipment.emoji,
      effect: insertEquipment.effect,
      bonus: insertEquipment.bonus,
      slot: insertEquipment.slot,
      toolType: insertEquipment.toolType || null,
      weight: insertEquipment.weight || 2,
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
      ingredients: insertRecipe.ingredients,
      output: insertRecipe.output,
    };
    this.recipes.set(id, recipe);
    return recipe;
  }
}

export const storage = new MemStorage();
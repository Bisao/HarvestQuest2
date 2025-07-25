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
  createExpedition(expedition: InsertExpedition): Promise<Expedition>;
  updateExpedition(id: string, updates: Partial<Expedition>): Promise<Expedition>;

  // Equipment methods
  getAllEquipment(): Promise<Equipment[]>;

  // Recipe methods
  getAllRecipes(): Promise<Recipe[]>;

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
    // Initialize basic resources
    const basicResources = [
      { name: "Fibra", emoji: "🌾", weight: 1, value: 2, type: "basic", rarity: "common" },
      { name: "Pedra", emoji: "🪨", weight: 3, value: 3, type: "basic", rarity: "common" },
      { name: "Gravetos", emoji: "🪵", weight: 2, value: 2, type: "basic", rarity: "common" },
    ];

    // Initialize unique resources
    const uniqueResources = [
      { name: "Madeira", emoji: "🌳", weight: 5, value: 8, type: "unique", rarity: "common" },
      { name: "Areia", emoji: "⏳", weight: 2, value: 5, type: "unique", rarity: "common" },
      { name: "Cristais", emoji: "💎", weight: 1, value: 20, type: "unique", rarity: "rare" },
      { name: "Conchas", emoji: "🐚", weight: 1, value: 12, type: "unique", rarity: "uncommon" },
    ];

    const allResources = [...basicResources, ...uniqueResources];
    const resourceIds: string[] = [];

    for (const resource of allResources) {
      const created = await this.createResource(resource);
      resourceIds.push(created.id);
    }

    // Initialize biomes
    const biomesData = [
      {
        name: "Floresta",
        emoji: "🌲",
        requiredLevel: 1,
        availableResources: [resourceIds[0], resourceIds[1], resourceIds[2], resourceIds[3]], // Fibra, Pedra, Gravetos, Madeira
      },
      {
        name: "Deserto",
        emoji: "🏜️",
        requiredLevel: 3,
        availableResources: [resourceIds[0], resourceIds[1], resourceIds[2], resourceIds[4]], // Fibra, Pedra, Gravetos, Areia
      },
      {
        name: "Montanha",
        emoji: "🏔️",
        requiredLevel: 8,
        availableResources: [resourceIds[0], resourceIds[1], resourceIds[2], resourceIds[5]], // Fibra, Pedra, Gravetos, Cristais
      },
      {
        name: "Oceano",
        emoji: "🌊",
        requiredLevel: 12,
        availableResources: [resourceIds[0], resourceIds[1], resourceIds[2], resourceIds[6]], // Fibra, Pedra, Gravetos, Conchas
      },
    ];

    for (const biome of biomesData) {
      await this.createBiome(biome);
    }

    // Initialize equipment
    const equipmentData = [
      {
        name: "Picareta",
        emoji: "⛏️",
        effect: "+20% pedra",
        bonus: { type: "resource_boost", resource: "pedra", multiplier: 1.2 },
      },
      {
        name: "Mochila",
        emoji: "🎒",
        effect: "+15 kg peso",
        bonus: { type: "weight_boost", value: 15 },
      },
      {
        name: "Bússola",
        emoji: "🧭",
        effect: "-20% tempo",
        bonus: { type: "time_reduction", multiplier: 0.8 },
      },
    ];

    for (const equip of equipmentData) {
      await this.createEquipment(equip);
    }

    // Initialize recipes
    const recipesData = [
      {
        name: "Corda",
        emoji: "🧵",
        requiredLevel: 1,
        ingredients: { [resourceIds[0]]: 3, [resourceIds[1]]: 1 }, // 3 Fibra + 1 Pedra
        output: { "rope": 1 },
      },
      {
        name: "Machado Básico",
        emoji: "🪓",
        requiredLevel: 1,
        ingredients: { [resourceIds[3]]: 2, [resourceIds[1]]: 3 }, // 2 Madeira + 3 Pedra
        output: { "basic_axe": 1 },
      },
      {
        name: "Vidro",
        emoji: "🔮",
        requiredLevel: 8,
        ingredients: { [resourceIds[4]]: 5 }, // 5 Areia
        output: { "glass": 1 },
      },
    ];

    for (const recipe of recipesData) {
      await this.createRecipe(recipe);
    }

    // Create default player
    await this.createPlayer({
      username: "Player1",
      level: 5,
      experience: 0,
      energy: 85,
      maxEnergy: 100,
      coins: 1245,
      inventoryWeight: 45,
      maxInventoryWeight: 100,
      autoStorage: false,
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
    const player: Player = { ...insertPlayer, id };
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
    const resource: Resource = { ...insertResource, id };
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
    const biome: Biome = { ...insertBiome, id };
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
    const item: InventoryItem = { ...insertItem, id };
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
    const item: StorageItem = { ...insertItem, id };
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

  async createExpedition(insertExpedition: InsertExpedition): Promise<Expedition> {
    const id = randomUUID();
    const expedition: Expedition = { ...insertExpedition, id };
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
    const equipment: Equipment = { ...insertEquipment, id };
    this.equipment.set(id, equipment);
    return equipment;
  }

  // Recipe methods
  async getAllRecipes(): Promise<Recipe[]> {
    return Array.from(this.recipes.values());
  }

  async createRecipe(insertRecipe: InsertRecipe): Promise<Recipe> {
    const id = randomUUID();
    const recipe: Recipe = { ...insertRecipe, id };
    this.recipes.set(id, recipe);
    return recipe;
  }
}

export const storage = new MemStorage();

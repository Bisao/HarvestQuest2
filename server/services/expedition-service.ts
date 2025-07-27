// Simplified expedition service that actually works
import type { IStorage } from "../storage";
import type { Player, Resource, Equipment, Biome } from "@shared/schema";
import { GameService } from "./game-service";

interface SimpleExpedition {
  id: string;
  playerId: string;
  biomeId: string;
  selectedResources: string[];
  maxDistance: number;
  currentDistance: number;
  collectedResources: Record<string, number>;
  status: 'active' | 'completed';
  startTime: number;
}

// In-memory store for active expeditions
const activeExpeditions = new Map<string, SimpleExpedition>();

export class ExpeditionService {
  private gameService: GameService;

  constructor(private storage: IStorage) {
    this.gameService = new GameService(storage);
  }

  // Start a new expedition
  async startExpedition(
    playerId: string,
    biomeId: string,
    maxDistance: number,
    selectedResources: string[]
  ): Promise<SimpleExpedition> {
    const player = await this.storage.getPlayer(playerId);
    if (!player) throw new Error("Player not found");

    const biome = await this.storage.getBiome(biomeId);
    if (!biome) throw new Error("Biome not found");

    // Check hunger and thirst
    if (player.hunger < 30) {
      throw new Error("Jogador com muita fome para expedição");
    }
    if (player.thirst < 30) {
      throw new Error("Jogador com muita sede para expedição");
    }

    // Create expedition
    const expeditionId = `exp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const expedition: SimpleExpedition = {
      id: expeditionId,
      playerId,
      biomeId,
      selectedResources,
      maxDistance,
      currentDistance: 0,
      collectedResources: {},
      status: 'active',
      startTime: Date.now()
    };

    activeExpeditions.set(expeditionId, expedition);
    console.log(`Storing expedition with ID: ${expeditionId}`);
    
    return expedition;
  }

  // Simulate collection at current distance
  async simulateCollection(expeditionId: string, currentDistance: number): Promise<{
    resourceCollected: string | null;
    shouldReturn: boolean;
    returnReason: string | null;
    collectionTime: number;
  }> {
    const expedition = activeExpeditions.get(expeditionId);
    if (!expedition) {
      throw new Error("Expedition not found");
    }

    const player = await this.storage.getPlayer(expedition.playerId);
    if (!player) throw new Error("Player not found");

    const allResources = await this.storage.getAllResources();

    // Check auto-return conditions - continue until hunger/thirst below 10% or inventory 90% full
    const currentWeight = await this.gameService.calculateInventoryWeight(expedition.playerId);
    const maxWeight = this.gameService.calculateMaxInventoryWeight(player);
    const inventoryFull = currentWeight >= maxWeight * 0.9;
    const hungerLow = player.hunger <= (player.maxHunger * 0.1); // 10% of max hunger
    const thirstLow = player.thirst <= (player.maxThirst * 0.1); // 10% of max thirst

    if (inventoryFull || hungerLow || thirstLow) {
      const returnReason = inventoryFull ? 'inventory_full' : hungerLow ? 'hunger_low' : 'thirst_low';
      return { resourceCollected: null, shouldReturn: true, returnReason, collectionTime: 0 };
    }

    // Get resources available at current distance
    const availableResources = expedition.selectedResources
      .map(id => allResources.find(r => r.id === id))
      .filter((r): r is Resource => r !== undefined && r.distanceFromCamp <= currentDistance);

    if (availableResources.length === 0) {
      return { resourceCollected: null, shouldReturn: false, returnReason: null, collectionTime: 0.5 };
    }

    // Try to collect a random resource
    const resourceToTry = availableResources[Math.floor(Math.random() * availableResources.length)];
    
    // Higher collection chance for better gameplay - 85% success rate
    const success = Math.random() < 0.85;
    
    if (success) {
      // Check if player can carry more
      const canCarry = await this.gameService.canCarryMore(expedition.playerId, resourceToTry.weight);
      if (!canCarry) {
        return { resourceCollected: null, shouldReturn: true, returnReason: 'inventory_full', collectionTime: 0 };
      }

      // Add to expedition collected resources
      expedition.collectedResources[resourceToTry.id] = (expedition.collectedResources[resourceToTry.id] || 0) + 1;
      expedition.currentDistance = currentDistance;

      // Add resource directly to player's inventory using existing methods
      const inventoryItems = await this.storage.getPlayerInventory(expedition.playerId);
      const existingItem = inventoryItems.find(item => item.resourceId === resourceToTry.id);
      
      if (existingItem) {
        await this.storage.updateInventoryItem(existingItem.id, {
          quantity: existingItem.quantity + 1
        });
      } else {
        await this.storage.addInventoryItem({
          playerId: expedition.playerId,
          resourceId: resourceToTry.id,
          quantity: 1
        });
      }

      // Reduce hunger and thirst slightly for each collection
      await this.storage.updatePlayer(expedition.playerId, {
        hunger: Math.max(0, player.hunger - 0.5), // Slower hunger reduction
        thirst: Math.max(0, player.thirst - 0.5), // Slower thirst reduction
      });

      return {
        resourceCollected: resourceToTry.id,
        shouldReturn: false,
        returnReason: null,
        collectionTime: resourceToTry.collectionTimeMinutes || 2
      };
    } else {
      // Failed to collect
      return {
        resourceCollected: null,
        shouldReturn: false,
        returnReason: null,
        collectionTime: 1 // Search time
      };
    }
  }

  // Complete expedition
  async completeExpedition(expeditionId: string, autoReturnTrigger: string): Promise<SimpleExpedition> {
    const expedition = activeExpeditions.get(expeditionId);
    if (!expedition) throw new Error("Expedition not found");

    const player = await this.storage.getPlayer(expedition.playerId);
    if (!player) throw new Error("Player not found");

    // Process collected resources (including animal processing)
    const processedResources = await this.processCollectedResources(expedition.collectedResources);

    // Resources were already added during collection, no need to add again
    // Just process any animal resources that need special handling
    const finalProcessedResources = await this.processCollectedResources(expedition.collectedResources);
    
    // Only add the difference (processed animal parts) if any
    const additionalResources: Record<string, number> = {};
    for (const [resourceId, quantity] of Object.entries(finalProcessedResources)) {
      const originalQuantity = expedition.collectedResources[resourceId] || 0;
      if (quantity > originalQuantity) {
        additionalResources[resourceId] = quantity - originalQuantity;
      }
    }
    
    if (Object.keys(additionalResources).length > 0) {
      await this.distributeRewards(expedition.playerId, additionalResources, player.autoStorage || false);
    }

    // Calculate experience and coins based on final processed resources
    const allResources = await this.storage.getAllResources();
    const finalResources = { ...expedition.collectedResources, ...additionalResources };
    const expGain = this.gameService.calculateExperienceGain(finalResources, allResources);
    const coinReward = this.calculateCoinReward(finalResources, allResources);
    
    // Update player stats
    const levelData = this.gameService.calculateLevelUp(player.experience, expGain);
    await this.storage.updatePlayer(expedition.playerId, {
      experience: levelData.newExp,
      level: levelData.newLevel,
      coins: player.coins + coinReward
    });

    // Update expedition status
    expedition.status = 'completed';
    expedition.collectedResources = { ...expedition.collectedResources, ...additionalResources };

    // Clean up after 1 minute
    setTimeout(() => {
      activeExpeditions.delete(expeditionId);
    }, 60000);

    return expedition;
  }

  // Process collected resources (animal processing)
  private async processCollectedResources(collectedResources: Record<string, number>): Promise<Record<string, number>> {
    const allResources = await this.storage.getAllResources();
    const processedResources: Record<string, number> = {};

    for (const [resourceId, quantity] of Object.entries(collectedResources)) {
      const resource = allResources.find(r => r.id === resourceId);
      if (!resource) continue;

      // Check if this is an animal that needs processing
      if (this.isAnimal(resource.name)) {
        // Process animal into component parts
        const animalParts = this.processAnimal(resource.name, allResources);
        for (const [partResourceId, partQuantity] of Object.entries(animalParts)) {
          processedResources[partResourceId] = (processedResources[partResourceId] || 0) + (partQuantity * quantity);
        }
      } else {
        // Regular resource - keep as is
        processedResources[resourceId] = quantity;
      }
    }

    return processedResources;
  }

  // Check if a resource is an animal
  private isAnimal(resourceName: string): boolean {
    return [
      "Coelho", "Esquilo", "Rato do Campo",
      "Veado", "Raposa", "Lobo",
      "Javali", "Urso",
      "Pato Selvagem", "Faisão",
      "Peixe Pequeno", "Peixe Grande", "Salmão", "Truta", "Enguia"
    ].includes(resourceName);
  }

  // Process animal into component resources
  private processAnimal(animalName: string, allResources: Resource[]): Record<string, number> {
    const parts: Record<string, number> = {};
    
    const carneResource = allResources.find(r => r.name === "Carne");
    const couroResource = allResources.find(r => r.name === "Couro");
    const ossosResource = allResources.find(r => r.name === "Ossos");
    const peloResource = allResources.find(r => r.name === "Pelo");
    const penasResource = allResources.find(r => r.name === "Penas");
    const banhaResource = allResources.find(r => r.name === "Banha");

    switch (animalName) {
      case "Coelho":
        if (carneResource) parts[carneResource.id] = 1;
        if (couroResource) parts[couroResource.id] = 1;
        if (ossosResource) parts[ossosResource.id] = 2;
        if (peloResource) parts[peloResource.id] = 2;
        break;
      case "Esquilo":
        if (carneResource) parts[carneResource.id] = 1;
        if (peloResource) parts[peloResource.id] = 1;
        if (ossosResource) parts[ossosResource.id] = 1;
        break;
      case "Rato do Campo":
        if (carneResource) parts[carneResource.id] = 1;
        if (peloResource) parts[peloResource.id] = 1;
        break;
      case "Veado":
        if (carneResource) parts[carneResource.id] = 3;
        if (couroResource) parts[couroResource.id] = 2;
        if (ossosResource) parts[ossosResource.id] = 4;
        if (peloResource) parts[peloResource.id] = 1;
        break;
      case "Raposa":
        if (carneResource) parts[carneResource.id] = 2;
        if (couroResource) parts[couroResource.id] = 1;
        if (ossosResource) parts[ossosResource.id] = 2;
        if (peloResource) parts[peloResource.id] = 2;
        break;
      case "Lobo":
        if (carneResource) parts[carneResource.id] = 3;
        if (couroResource) parts[couroResource.id] = 2;
        if (ossosResource) parts[ossosResource.id] = 3;
        if (peloResource) parts[peloResource.id] = 2;
        break;
      case "Javali":
        if (carneResource) parts[carneResource.id] = 4;
        if (couroResource) parts[couroResource.id] = 3;
        if (ossosResource) parts[ossosResource.id] = 6;
        if (peloResource) parts[peloResource.id] = 1;
        if (banhaResource) parts[banhaResource.id] = 2;
        break;
      case "Urso":
        if (carneResource) parts[carneResource.id] = 8;
        if (couroResource) parts[couroResource.id] = 4;
        if (ossosResource) parts[ossosResource.id] = 8;
        if (peloResource) parts[peloResource.id] = 3;
        if (banhaResource) parts[banhaResource.id] = 3;
        break;
      case "Pato Selvagem":
        if (carneResource) parts[carneResource.id] = 1;
        if (penasResource) parts[penasResource.id] = 3;
        if (ossosResource) parts[ossosResource.id] = 1;
        break;
      case "Faisão":
        if (carneResource) parts[carneResource.id] = 1;
        if (penasResource) parts[penasResource.id] = 2;
        if (ossosResource) parts[ossosResource.id] = 1;
        break;
      // Fish processing
      case "Peixe Pequeno":
        if (carneResource) parts[carneResource.id] = 1;
        if (ossosResource) parts[ossosResource.id] = 1;
        break;
      case "Peixe Grande":
        if (carneResource) parts[carneResource.id] = 2;
        if (ossosResource) parts[ossosResource.id] = 2;
        break;
      case "Salmão":
        if (carneResource) parts[carneResource.id] = 3;
        if (ossosResource) parts[ossosResource.id] = 2;
        break;
      case "Truta":
        if (carneResource) parts[carneResource.id] = 2;
        if (ossosResource) parts[ossosResource.id] = 1;
        break;
      case "Enguia":
        if (carneResource) parts[carneResource.id] = 1;
        if (ossosResource) parts[ossosResource.id] = 1;
        break;
    }

    return parts;
  }

  // Distribute rewards to inventory or storage
  private async distributeRewards(playerId: string, rewards: Record<string, number>, autoStorage: boolean): Promise<void> {
    for (const [resourceId, quantity] of Object.entries(rewards)) {
      if (autoStorage) {
        // Add to storage
        const storageItems = await this.storage.getPlayerStorage(playerId);
        const existingStorageItem = storageItems.find(item => item.resourceId === resourceId);
        
        if (existingStorageItem) {
          await this.storage.updateStorageItem(existingStorageItem.id, {
            quantity: existingStorageItem.quantity + quantity
          });
        } else {
          await this.storage.addStorageItem({
            playerId: playerId,
            resourceId: resourceId,
            quantity: quantity
          });
        }
      } else {
        // Add to inventory
        const inventoryItems = await this.storage.getPlayerInventory(playerId);
        const existingInventoryItem = inventoryItems.find(item => item.resourceId === resourceId);
        
        if (existingInventoryItem) {
          await this.storage.updateInventoryItem(existingInventoryItem.id, {
            quantity: existingInventoryItem.quantity + quantity
          });
        } else {
          await this.storage.addInventoryItem({
            playerId: playerId,
            resourceId: resourceId,
            quantity: quantity
          });
        }
      }
    }
  }

  // Calculate coin reward from collected resources
  private calculateCoinReward(rewards: Record<string, number>, resources: Resource[]): number {
    let totalValue = 0;
    
    for (const [resourceId, quantity] of Object.entries(rewards)) {
      const resource = resources.find(r => r.id === resourceId);
      if (resource) {
        totalValue += resource.value * quantity;
      }
    }
    
    return Math.floor(totalValue * 0.1); // 10% of resource value as coins
  }

  // Get active expedition for player
  getActiveExpedition(playerId: string): SimpleExpedition | null {
    for (const expedition of Array.from(activeExpeditions.values())) {
      if (expedition.playerId === playerId && expedition.status === 'active') {
        return expedition;
      }
    }
    return null;
  }

  // Get expedition by ID
  getExpedition(expeditionId: string): SimpleExpedition | null {
    return activeExpeditions.get(expeditionId) || null;
  }
}
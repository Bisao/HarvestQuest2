// Distance-based expedition service
import type { IStorage } from "../storage";
import type { Player, Expedition, Resource, Equipment, Biome } from "@shared/schema";
import { GameService } from "./game-service";

export class DistanceExpeditionService {
  private gameService: GameService;

  constructor(private storage: IStorage) {
    this.gameService = new GameService(storage);
  }

  // Start a new distance-based expedition
  async startDistanceExpedition(
    playerId: string, 
    biomeId: string, 
    maxDistanceFromCamp: number,
    selectedResources: string[]
  ): Promise<Expedition> {
    const player = await this.storage.getPlayer(playerId);
    if (!player) throw new Error("Player not found");

    const biome = await this.storage.getBiome(biomeId);
    if (!biome) throw new Error("Biome not found");

    // Check if player has enough hunger and thirst for expedition
    if (player.hunger < 30) {
      throw new Error("Jogador com muita fome para expedição");
    }
    if (player.thirst < 30) {
      throw new Error("Jogador com muita sede para expedição");
    }

    // Check if player has required level
    if (player.level < biome.requiredLevel) {
      throw new Error("Player level too low for this biome");
    }

    // Validate selected resources are available in biome and within distance
    const availableResources = Array.isArray(biome.availableResources) ? biome.availableResources : [];
    const allResources = await this.storage.getAllResources();
    
    const validResources = selectedResources.filter(resourceId => {
      const resource = allResources.find(r => r.id === resourceId);
      return availableResources.includes(resourceId) && 
             resource && 
             resource.distanceFromCamp <= maxDistanceFromCamp;
    });

    if (validResources.length === 0) {
      throw new Error("No valid resources selected for expedition");
    }

    // Check if player has required tools for selected resources (except basic resources)
    for (const resourceId of validResources) {
      const resource = allResources.find(r => r.id === resourceId);
      // Skip tool check for basic resources - they are always collectable
      if (resource && resource.type === "basic") {
        continue;
      }
      
      const hasRequiredTool = await this.gameService.hasRequiredTool(playerId, resourceId);
      if (!hasRequiredTool) {
        throw new Error(`Missing required tool for ${resource?.name || 'resource'}`);
      }
    }

    // Create expedition
    const expedition = {
      playerId,
      biomeId,
      selectedResources: validResources as any,
      selectedEquipment: [] as any,
      maxDistanceFromCamp,
      currentDistance: 0,
      autoReturnTrigger: null,
    };

    const createdExpedition = await this.storage.createExpedition(expedition);
    return createdExpedition;
  }

  // Simulate collection at current distance with chance-based system
  async simulateCollectionAtDistance(
    expeditionId: string, 
    currentDistance: number
  ): Promise<{ resourceCollected: string | null; shouldReturn: boolean; returnReason: string | null; collectionTime: number }> {
    const expedition = await this.storage.getExpedition(expeditionId);
    if (!expedition) throw new Error("Expedition not found");

    const player = await this.storage.getPlayer(expedition.playerId);
    if (!player) throw new Error("Player not found");

    const allResources = await this.storage.getAllResources();
    
    // Get resources available at current distance
    const selectedResources = expedition.selectedResources as string[];
    const availableAtDistance = selectedResources.filter((resourceId: string) => {
      const resource = allResources.find(r => r.id === resourceId);
      return resource && resource.distanceFromCamp <= currentDistance;
    });

    // Check auto-return conditions
    const currentWeight = await this.gameService.calculateInventoryWeight(expedition.playerId);
    const inventoryFull = currentWeight >= player.maxInventoryWeight * 0.9; // Return at 90% capacity
    const hungerLow = player.hunger <= 10;
    const thirstLow = player.thirst <= 10;

    if (inventoryFull || hungerLow || thirstLow) {
      const returnReason = inventoryFull ? 'inventory_full' : hungerLow ? 'hunger_low' : 'thirst_low';
      return { resourceCollected: null, shouldReturn: true, returnReason, collectionTime: 0 };
    }

    // Try to collect a resource with chance-based system
    if (availableAtDistance.length > 0) {
      const resourceToTry = availableAtDistance[Math.floor(Math.random() * availableAtDistance.length)];
      const resource = allResources.find(r => r.id === resourceToTry);
      
      if (resource) {
        // Check collection chance
        const randomChance = Math.random() * 100;
        const collectSuccess = randomChance <= resource.collectionChance;
        
        if (collectSuccess) {
          // Check if player can carry the resource
          const canCarry = await this.gameService.canCarryMore(expedition.playerId, resource.weight);
          if (!canCarry) {
            return { resourceCollected: null, shouldReturn: true, returnReason: 'inventory_full', collectionTime: 0 };
          }

          // Add resource to expedition collected resources
          const currentCollected = expedition.collectedResources as Record<string, number>;
          const newCollected = {
            ...currentCollected,
            [resourceToTry]: (currentCollected[resourceToTry] || 0) + 1,
          };

          await this.storage.updateExpedition(expeditionId, {
            collectedResources: newCollected,
            currentDistance,
          });

          // Reduce player hunger and thirst
          await this.storage.updatePlayer(expedition.playerId, {
            hunger: Math.max(0, player.hunger - 2),
            thirst: Math.max(0, player.thirst - 2),
          });

          return { 
            resourceCollected: resourceToTry, 
            shouldReturn: false, 
            returnReason: null, 
            collectionTime: resource.collectionTimeMinutes 
          };
        } else {
          // Failed to collect - return collection time to simulate search effort
          return { 
            resourceCollected: null, 
            shouldReturn: false, 
            returnReason: null, 
            collectionTime: Math.ceil(resource.collectionTimeMinutes / 2) // Half time for failed attempt
          };
        }
      }
    }

    return { resourceCollected: null, shouldReturn: false, returnReason: null, collectionTime: 1 };
  }

  // Complete distance-based expedition
  async completeDistanceExpedition(expeditionId: string, autoReturnTrigger: string): Promise<Expedition> {
    const expedition = await this.storage.getExpedition(expeditionId);
    if (!expedition) throw new Error("Expedition not found");

    const player = await this.storage.getPlayer(expedition.playerId);
    if (!player) throw new Error("Player not found");

    // Process collected resources (including animal processing)
    const processedResources = await this.processCollectedResources(
      expedition.collectedResources as Record<string, number>
    );

    // Add rewards to storage or inventory based on auto-storage setting
    await this.distributeRewards(expedition.playerId, processedResources, player.autoStorage);

    // Calculate experience gain
    const resources = await this.storage.getAllResources();
    const expGain = this.gameService.calculateExperienceGain(processedResources, resources);
    
    // Update player stats
    const levelData = this.gameService.calculateLevelUp(player.experience, expGain);
    await this.storage.updatePlayer(expedition.playerId, {
      experience: levelData.newExp,
      level: levelData.newLevel,
      coins: player.coins + this.calculateCoinReward(processedResources, resources)
    });

    // Mark expedition as completed
    return await this.storage.updateExpedition(expeditionId, {
      status: "completed",
      endTime: Date.now(),
      progress: 100,
      collectedResources: processedResources,
      autoReturnTrigger,
    });
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
    if (autoStorage) {
      // Add to storage
      for (const [resourceId, quantity] of Object.entries(rewards)) {
        await this.gameService.addToStorage(playerId, resourceId, quantity);
      }
    } else {
      // Add to inventory
      for (const [resourceId, quantity] of Object.entries(rewards)) {
        await this.gameService.addToInventory(playerId, resourceId, quantity);
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

  // Get active distance expedition for player
  async getActiveDistanceExpedition(playerId: string): Promise<Expedition | null> {
    const expeditions = await this.storage.getPlayerExpeditions(playerId);
    return expeditions.find(exp => exp.status === "in_progress") || null;
  }
}
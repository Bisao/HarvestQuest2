// Expedition service for expedition-related business logic
import type { IStorage } from "../storage";
import type { Player, Expedition, Resource, Equipment, Biome } from "@shared/schema";
import { GameService } from "./game-service";

export class ExpeditionService {
  private gameService: GameService;

  constructor(private storage: IStorage) {
    this.gameService = new GameService(storage);
  }

  // Start a new expedition
  async startExpedition(
    playerId: string, 
    biomeId: string, 
    selectedResources: string[], 
    selectedEquipment: string[]
  ): Promise<Expedition> {
    const player = await this.storage.getPlayer(playerId);
    if (!player) throw new Error("Player not found");

    const biome = await this.storage.getBiome(biomeId);
    if (!biome) throw new Error("Biome not found");

    // Check if player has enough energy
    if (player.energy < 20) {
      throw new Error("Not enough energy for expedition");
    }

    // Check if player has required level
    if (player.level < biome.requiredLevel) {
      throw new Error("Player level too low for this biome");
    }

    // Validate selected resources are available in biome
    const availableResources = Array.isArray(biome.availableResources) ? biome.availableResources : [];
    const validResources = selectedResources.filter(resourceId => 
      availableResources.includes(resourceId)
    );

    if (validResources.length === 0) {
      throw new Error("No valid resources selected for this biome");
    }

    // Create expedition
    const expedition = await this.storage.createExpedition({
      playerId,
      biomeId,
      selectedResources: validResources,
      selectedEquipment,
    });

    // Deduct energy
    await this.storage.updatePlayer(playerId, {
      energy: Math.max(0, player.energy - 20)
    });

    return expedition;
  }

  // Update expedition progress
  async updateExpeditionProgress(expeditionId: string): Promise<Expedition> {
    const expedition = await this.storage.getExpedition(expeditionId);
    if (!expedition) throw new Error("Expedition not found");

    if (expedition.status !== "in_progress") {
      return expedition;
    }

    const currentTime = Date.now();
    const elapsedTime = currentTime - (expedition.startTime || currentTime);
    const totalDuration = 30000; // 30 seconds for demo purposes
    
    const progress = Math.min(100, Math.floor((elapsedTime / totalDuration) * 100));

    // Update progress
    const updatedExpedition = await this.storage.updateExpedition(expeditionId, {
      progress
    });

    // Complete expedition if progress reaches 100%
    if (progress >= 100) {
      return await this.completeExpedition(expeditionId);
    }

    return updatedExpedition;
  }

  // Complete expedition and distribute rewards
  async completeExpedition(expeditionId: string): Promise<Expedition> {
    const expedition = await this.storage.getExpedition(expeditionId);
    if (!expedition) throw new Error("Expedition not found");

    const player = await this.storage.getPlayer(expedition.playerId);
    if (!player) throw new Error("Player not found");

    // Calculate rewards
    const rewards = await this.calculateExpeditionRewards(expedition);
    
    // Add rewards to storage or inventory based on auto-storage setting
    await this.distributeRewards(expedition.playerId, rewards, player.autoStorage);

    // Calculate experience gain
    const resources = await this.storage.getAllResources();
    const expGain = this.gameService.calculateExperienceGain(rewards, resources);
    
    // Update player stats
    const levelData = this.gameService.calculateLevelUp(player.experience, expGain);
    await this.storage.updatePlayer(expedition.playerId, {
      experience: levelData.newExp,
      level: levelData.newLevel,
      coins: player.coins + this.calculateCoinReward(rewards, resources)
    });

    // Mark expedition as completed
    return await this.storage.updateExpedition(expeditionId, {
      status: "completed",
      endTime: Date.now(),
      progress: 100,
      collectedResources: rewards
    });
  }

  // Calculate expedition rewards based on selected resources and equipment
  private async calculateExpeditionRewards(expedition: Expedition): Promise<Record<string, number>> {
    const rewards: Record<string, number> = {};
    const player = await this.storage.getPlayer(expedition.playerId);
    if (!player) return rewards;

    const allEquipment = await this.storage.getAllEquipment();
    const selectedEquipment = Array.isArray(expedition.selectedEquipment) ? expedition.selectedEquipment : [];
    const playerEquipment = allEquipment.filter(eq => 
      selectedEquipment.includes(eq.id) ||
      eq.id === player.equippedTool ||
      eq.id === player.equippedWeapon
    );

    // Base reward calculation for each selected resource
    const selectedResources = Array.isArray(expedition.selectedResources) ? expedition.selectedResources : [];
    for (const resourceId of selectedResources) {
      const baseQuantity = this.getBaseResourceQuantity(resourceId);
      rewards[resourceId] = baseQuantity;
    }

    // Apply equipment bonuses
    return this.gameService.calculateExpeditionRewards(rewards, player, playerEquipment);
  }

  // Get base quantity for a resource type
  private getBaseResourceQuantity(resourceId: string): number {
    // This could be made more sophisticated based on resource rarity
    return Math.floor(Math.random() * 5) + 1; // 1-5 items
  }

  // Distribute rewards to player storage or inventory
  private async distributeRewards(playerId: string, rewards: Record<string, number>, autoStorage: boolean): Promise<void> {
    for (const [resourceId, quantity] of Object.entries(rewards)) {
      if (quantity <= 0) continue;

      if (autoStorage) {
        // Add to storage
        const storageItems = await this.storage.getPlayerStorage(playerId);
        const existingItem = storageItems.find(item => item.resourceId === resourceId);
        
        if (existingItem) {
          await this.storage.updateStorageItem(existingItem.id, {
            quantity: existingItem.quantity + quantity
          });
        } else {
          await this.storage.addStorageItem({
            playerId,
            resourceId,
            quantity
          });
        }
      } else {
        // Add to inventory (check weight limits)
        const resource = await this.storage.getResource(resourceId);
        if (!resource) continue;

        const totalWeight = resource.weight * quantity;
        const canCarry = await this.gameService.canCarryMore(playerId, totalWeight);

        if (canCarry) {
          const inventoryItems = await this.storage.getPlayerInventory(playerId);
          const existingItem = inventoryItems.find(item => item.resourceId === resourceId);
          
          if (existingItem) {
            await this.storage.updateInventoryItem(existingItem.id, {
              quantity: existingItem.quantity + quantity
            });
          } else {
            await this.storage.addInventoryItem({
              playerId,
              resourceId,
              quantity
            });
          }

          // Update player weight
          const newWeight = await this.gameService.calculateInventoryWeight(playerId);
          await this.storage.updatePlayer(playerId, { inventoryWeight: newWeight });
        } else {
          // Auto-move to storage if inventory is full
          const storageItems = await this.storage.getPlayerStorage(playerId);
          const existingStorage = storageItems.find(item => item.resourceId === resourceId);
          
          if (existingStorage) {
            await this.storage.updateStorageItem(existingStorage.id, {
              quantity: existingStorage.quantity + quantity
            });
          } else {
            await this.storage.addStorageItem({
              playerId,
              resourceId,
              quantity
            });
          }
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

  // Cancel expedition
  async cancelExpedition(expeditionId: string): Promise<void> {
    await this.storage.updateExpedition(expeditionId, {
      status: "cancelled",
      endTime: Date.now()
    });
  }

  // Get active expedition for player
  async getActiveExpedition(playerId: string): Promise<Expedition | null> {
    const expeditions = await this.storage.getPlayerExpeditions(playerId);
    return expeditions.find(exp => exp.status === "in_progress") || null;
  }
}
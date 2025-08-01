// Refactored Expedition Service - Clean, modular and optimized
import type { IStorage } from "../storage";
import type { Player, Expedition, Resource, Equipment } from "@shared/types";
import { GameService } from "./game-service";
import { QuestService } from "./quest-service";
import { EQUIPMENT_IDS, RESOURCE_IDS } from "@shared/constants/game-ids";

export class ExpeditionService {
  private gameService: GameService;
  private questService: QuestService;

  constructor(private storage: IStorage) {
    this.gameService = new GameService(storage);
    this.questService = new QuestService(storage);
  }

  // EXPEDITION LIFECYCLE METHODS

  async startExpedition(
    playerId: string, 
    biomeId: string, 
    selectedResources: string[], 
    selectedEquipment: string[] = []
  ): Promise<Expedition> {
    console.log('ExpeditionService.startExpedition called with:', { playerId, biomeId, selectedResources, selectedEquipment });

    // Invalidate cache to get fresh player data
    try {
      const { invalidatePlayerCache } = await import("../cache/memory-cache");
      invalidatePlayerCache(playerId);
    } catch (error) {
      console.warn('Cache invalidation failed:', error);
    }

    const player = await this.storage.getPlayer(playerId);
    if (!player) {
      console.error('Player not found:', playerId);
      throw new Error("Player not found");
    }
    console.log('Player found:', { id: player.id, hunger: player.hunger, thirst: player.thirst, level: player.level });

    const biome = await this.storage.getBiome(biomeId);
    if (!biome) {
      console.error('Biome not found:', biomeId);
      throw new Error("Biome not found");
    }
    console.log('Biome found:', { id: biome.id, name: biome.name, requiredLevel: biome.requiredLevel });

    // Check if player has enough hunger and thirst for expedition with updated values
    if (player.hunger < 5) {
      throw new Error(`Jogador com muita fome para expedição (${player.hunger}/100). Consuma alimentos primeiro.`);
    }
    if (player.thirst < 5) {
      throw new Error(`Jogador com muita sede para expedição (${player.thirst}/100). Beba água primeiro.`);
    }

    // Check if player has required level
    if (player.level < biome.requiredLevel) {
      throw new Error("Player level too low for this biome");
    }

    // Validate selected resources are available in biome AND player has required tools
    const availableResources = Array.isArray(biome.availableResources) ? biome.availableResources : [];
    const biomeValidResources = selectedResources.filter(resourceId => 
      availableResources.includes(resourceId)
    );

    // Additional validation: check if player has required tools for each resource
    console.log('Validating tools for resources:', biomeValidResources);
    const validResources = [];
    for (const resourceId of biomeValidResources) {
      const resource = await this.storage.getResource(resourceId);
      console.log(`Checking tool requirements for resource: ${resource?.name} (${resourceId})`);

      const hasRequiredTool = await this.gameService.hasRequiredTool(playerId, resourceId);
      console.log(`Player has required tool for ${resource?.name}: ${hasRequiredTool}`);

      if (hasRequiredTool) {
        validResources.push(resourceId);
      } else {
        console.log(`Player lacks required tool/weapon for resource: ${resource?.name} (${resourceId})`);
      }
    }
    console.log('Final valid resources:', validResources);

    if (validResources.length === 0) {
      console.log('No valid resources found for player tools');
      throw new Error("Você não possui as ferramentas ou armas necessárias para coletar os recursos selecionados neste bioma.");
    }

    // Check for existing active expeditions
    const existingExpeditions = await this.storage.getPlayerExpeditions(playerId);
    const activeExpedition = existingExpeditions.find(exp => exp.status === 'in_progress');
    if (activeExpedition) {
      console.log('Player already has active expedition:', activeExpedition.id);
      throw new Error("Você já possui uma expedição ativa. Finalize-a antes de iniciar uma nova.");
    }

    console.log('Creating expedition with valid resources:', validResources);

    // Create expedition
    const expedition = await this.storage.createExpedition({
      playerId,
      biomeId,
      selectedResources: validResources,
      selectedEquipment,
    });

    console.log('Expedition created:', expedition);

    // No longer deduct hunger/thirst on expedition start - handled by configured degradation mode
    return expedition;
  }

  async updateExpeditionProgress(expeditionId: string): Promise<Expedition> {
    const expedition = await this.storage.getExpedition(expeditionId);
    if (!expedition) throw new Error("Expedition not found");

    if (expedition.status !== "in_progress") {
      return expedition;
    }

    const currentTime = Math.floor(Date.now() / 1000); // Convert to seconds
    const elapsedTime = currentTime - (expedition.startTime || currentTime);
    const totalDuration = 30; // 30 seconds for demo purposes

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
      coins: player.coins // Coin system removed as requested
    });

    // Update quest progress for expedition completion
    await this.questService.updateQuestProgress(expedition.playerId, 'expedition', {
      biomeId: expedition.biomeId
    });

    // Mark expedition as completed with timestamp in seconds
    return await this.storage.updateExpedition(expeditionId, {
      status: "completed",
      endTime: Math.floor(Date.now() / 1000),
      progress: 100,
      collectedResources: rewards
    });
  }

  // PRIVATE HELPER METHODS

  private async calculateExpeditionRewards(expedition: Expedition): Promise<Record<string, number>> {
    const rewards: Record<string, number> = {};
    const player = await this.storage.getPlayer(expedition.playerId);
    if (!player) return rewards;

    const allEquipment = await this.storage.getAllEquipment();
    const allResources = await this.storage.getAllResources();
    const selectedEquipment = Array.isArray(expedition.selectedEquipment) ? expedition.selectedEquipment : [];
    const playerEquipment = allEquipment.filter(eq => 
      selectedEquipment.includes(eq.id) ||
      eq.id === player.equippedTool ||
      eq.id === player.equippedWeapon
    );

    // Base reward calculation for each selected resource
    const selectedResources = Array.isArray(expedition.selectedResources) ? expedition.selectedResources : [];

    // Process each selected resource
    for (const resourceId of selectedResources) {
      const resource = allResources.find(r => r.id === resourceId);
      if (!resource) continue;

      // Special handling for fishing - consume bait
      if (this.isFish(resource.name)) {
        const baitConsumed = await this.consumeBaitForFishing(expedition.playerId);
        if (!baitConsumed) {
          console.log(`No bait available for fishing ${resource.name}`);
          continue; // Skip this fish if no bait
        }
      }

      // Check if this is an animal that needs processing
      if (this.isAnimal(resource.name)) {
        // Process animal into component parts
        const animalParts = this.processAnimal(resource.name, allResources);
        for (const [partResourceId, quantity] of Object.entries(animalParts)) {
          rewards[partResourceId] = (rewards[partResourceId] || 0) + quantity;
        }
      } else {
        // Regular resource collection
        let baseQuantity = await this.getBaseResourceQuantity(resourceId);
        rewards[resourceId] = (rewards[resourceId] || 0) + Math.max(1, baseQuantity);
      }
    }

    // Apply pickaxe bonus for stone mining
    this.addPickaxeBonus(rewards, playerEquipment, allResources);

    return rewards;
  }

  // Check if a resource is an animal or fish
  private isAnimal(resourceName: string): boolean {
    return ["Coelho", "Veado", "Javali", "Peixe Pequeno", "Peixe Grande", "Salmão"].includes(resourceName);
  }

  // Check if a resource is a fish
  private isFish(resourceName: string): boolean {
    return ["Peixe Pequeno", "Peixe Grande", "Salmão"].includes(resourceName);
  }

  // Consume bait from player inventory when fishing
  private async consumeBaitForFishing(playerId: string): Promise<boolean> {
    const inventoryItems = await this.storage.getPlayerInventory(playerId);

    // Find bait in inventory (now it's a resource, not equipment)
    const baitItem = inventoryItems.find(item => item.resourceId === RESOURCE_IDS.ISCA_PESCA);
    if (!baitItem || baitItem.quantity <= 0) return false;

    // Consume 1 bait
    if (baitItem.quantity === 1) {
      await this.storage.removeInventoryItem(baitItem.id);
    } else {
      await this.storage.updateInventoryItem(baitItem.id, {
        quantity: baitItem.quantity - 1
      });
    }

    console.log(`Consumed 1 bait for fishing. Remaining: ${baitItem.quantity - 1}`);
    return true;
  }

  // Process animal into component resources
  private processAnimal(animalName: string, allResources: Resource[]): Record<string, number> {
    const parts: Record<string, number> = {};

    // Find resource IDs for animal parts
    const carneResource = allResources.find(r => r.name === "Carne");
    const couroResource = allResources.find(r => r.id === RESOURCE_IDS.COURO);
    const ossoResource = allResources.find(r => r.id === RESOURCE_IDS.OSSOS);
    const peloResource = allResources.find(r => r.id === RESOURCE_IDS.PELO);

    // Different animals give different quantities
    switch (animalName) {
      case "Coelho":
        if (carneResource) parts[carneResource.id] = 1;
        if (couroResource) parts[RESOURCE_IDS.COURO] = 1;
        if (ossoResource) parts[RESOURCE_IDS.OSSOS] = 2;
        if (peloResource) parts[RESOURCE_IDS.PELO] = 2;
        break;

      case "Veado":
        if (carneResource) parts[carneResource.id] = 3;
        if (couroResource) parts[RESOURCE_IDS.COURO] = 2;
        if (ossoResource) parts[RESOURCE_IDS.OSSOS] = 4;
        if (peloResource) parts[RESOURCE_IDS.PELO] = 1;
        break;

      case "Javali":
        if (carneResource) parts[carneResource.id] = 4;
        if (couroResource) parts[RESOURCE_IDS.COURO] = 3;
        if (ossoResource) parts[RESOURCE_IDS.OSSOS] = 6;
        if (peloResource) parts[RESOURCE_IDS.PELO] = 1;
        break;

      // Fish processing - fish give meat and bones
      case "Peixe Pequeno":
        if (carneResource) parts[carneResource.id] = 1;
        if (ossoResource) parts[RESOURCE_IDS.OSSOS] = 1;
        break;

      case "Peixe Grande":
        if (carneResource) parts[carneResource.id] = 2;
        if (ossoResource) parts[RESOURCE_IDS.OSSOS] = 2;
        break;

      case "Salmão":
        if (carneResource) parts[carneResource.id] = 3;
        if (ossoResource) parts[RESOURCE_IDS.OSSOS] = 2;
        break;
    }

    return parts;
  }

  // Check for pickaxe + stone mining -> add loose stones
  private addPickaxeBonus(rewards: Record<string, number>, playerEquipment: Equipment[], allResources: Resource[]): void {
    const hasPickaxe = playerEquipment.some(eq => eq.toolType === "pickaxe");
    const stoneResource = allResources.find(r => r.name === "Pedra");
    const looseStoneResource = allResources.find(r => r.name === "Pedras Soltas");

    if (hasPickaxe && stoneResource && looseStoneResource && rewards[stoneResource.id]) {
      // Add loose stones equal to the amount of stone mined
      rewards[looseStoneResource.id] = (rewards[looseStoneResource.id] || 0) + rewards[stoneResource.id];
    }
  }

  // Get base quantity for a resource type
  private async getBaseResourceQuantity(resourceId: string): Promise<number> {
    const allResources = await this.storage.getAllResources();
    const resource = allResources.find(r => r.id === resourceId);

    // Special case for water - bucket collects 5 units
    if (resource && resource.name === "Água Fresca") {
      return 5;
    }

    // This could be made more sophisticated based on resource rarity
    return Math.floor(Math.random() * 5) + 1; // 1-5 items
  }

  // Distribute rewards to player storage or inventory
  private async distributeRewards(playerId: string, rewards: Record<string, number>, autoStorage: boolean): Promise<void> {
    for (const [resourceId, quantity] of Object.entries(rewards)) {
      if (quantity <= 0) continue;

      // Check if this is water - handle specially
      const resource = await this.storage.getResource(resourceId);
      if (resource && resource.name === "Água Fresca") {
        try {
          // Water goes directly to player's water storage compartment
          const player = await this.storage.getPlayer(playerId);
          if (player) {
            const newWaterAmount = Math.min(player.waterStorage + quantity, player.maxWaterStorage);
            await this.storage.updatePlayer(playerId, { waterStorage: newWaterAmount });
          }
          continue; // Skip normal storage/inventory logic for water
        } catch (error) {
          console.error(`Failed to add water to player: ${error}`);
          continue;
        }
      }

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

  // Note: Coin rewards removed - financial system to be implemented later

  async getActiveExpedition(playerId: string): Promise<Expedition | null> {
    const expeditions = await this.storage.getPlayerExpeditions(playerId);
    return expeditions.find(exp => exp.status === "in_progress") || null;
  }

  async cancelExpedition(expeditionId: string): Promise<void> {
    await this.storage.updateExpedition(expeditionId, {
      status: "cancelled",
      endTime: Math.floor(Date.now() / 1000)
    });
  }
}
// Refactored Expedition Service - Clean, modular and optimized
import type { IStorage } from "../storage";
import type { Player, Expedition, Resource, Equipment } from "@shared/types";
import { GameService } from "./game-service";
import { QuestService } from "./quest-service";
import { SkillService } from "./skill-service";
import { EQUIPMENT_IDS, RESOURCE_IDS, SKILL_IDS } from "@shared/constants/game-ids";
import { BiomeResourceCategorizer } from '../utils/biome-resource-categorizer';
import { AnimalDiscoveryService } from './animal-discovery-service';

export class ExpeditionService {
  private gameService: GameService;
  private questService: QuestService;
  private skillService: SkillService;

  constructor(private storage: IStorage) {
    this.gameService = new GameService(storage);
    this.questService = new QuestService(storage);
    this.skillService = new SkillService(storage);
  }

  // EXPEDITION LIFECYCLE METHODS

  async startExpedition(
    playerId: string, 
    biomeId: string, 
    selectedResources: string[], 
    selectedEquipment: string[] = [],
    duration: number = 60000
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

    // Check for existing active expeditions and auto-complete them
    const existingExpeditions = await this.storage.getPlayerExpeditions(playerId);
    const activeExpedition = existingExpeditions.find(exp => exp.status === 'in_progress');
    if (activeExpedition) {
      console.log('Player has active expedition, auto-completing:', activeExpedition.id);
      try {
        await this.completeExpedition(activeExpedition.id);
        console.log('Successfully auto-completed previous expedition');
      } catch (error) {
        console.error('Failed to auto-complete expedition:', error);
        throw new Error("Não foi possível finalizar a expedição anterior. Tente novamente.");
      }
    }

    console.log('Creating expedition with valid resources:', validResources);

    // Create expedition
    const expedition = await this.storage.createExpedition({
      playerId,
      biomeId,
      selectedResources: validResources,
      selectedEquipment,
      duration,
    });

    console.log('Expedition created:', expedition);

    // Apply expedition status effects
    await this.applyExpeditionStatusEffects(playerId, biome, validResources.length);

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

  // Award skill experience based on expedition rewards
  private async awardSkillExperienceForExpedition(playerId: string, rewards: Record<string, number>): Promise<void> {
    const resources = await this.storage.getAllResources();

    for (const [resourceId, quantity] of Object.entries(rewards)) {
      const resource = resources.find(r => r.id === resourceId);
      if (!resource) continue;

      // Determine skill based on resource type and category
      let skillId: string | null = null;
      let context = 'exploration';

      // Map resource categories to skills
      const categoryMatch = resource.category as string;

      if (this.isFish(resource.name)) {
        skillId = SKILL_IDS.PESCA;
        context = 'fishing';
      } else if (this.isAnimal(resource.name)) {
        skillId = SKILL_IDS.CACA;
        context = 'hunting';
      } else if (resource.name.includes('Cogumelo')) {
        skillId = SKILL_IDS.COLETA;
        context = 'gathering';
      } else if (resource.name.includes('Pedra') || resource.name.includes('Ferro') || resource.name.includes('Cristais')) {
        skillId = SKILL_IDS.MINERACAO;
        context = 'mining';
      } else if (resource.name.includes('Madeira')) {
        skillId = SKILL_IDS.LENHADOR;
        context = 'woodcutting';
      } else {
        // Default to gathering for basic resources
        skillId = SKILL_IDS.COLETA;
        context = 'gathering';
      }

      if (skillId) {
        // Award 2-5 experience per item based on rarity
        let expPerItem = 2;
        switch (resource.rarity) {
          case 'uncommon': expPerItem = 3; break;
          case 'rare': expPerItem = 4; break;
          case 'epic': expPerItem = 5; break;
          case 'legendary': expPerItem = 6; break;
        }

        const totalExp = expPerItem * quantity;
        await this.skillService.addSkillExperience(playerId, skillId, totalExp);
        console.log(`🎯 EXPEDITION: Player ${playerId} gained ${totalExp} ${skillId} experience from ${quantity}x ${resource.name}`);
      }
    }

    // Always award exploration experience
    await this.skillService.addSkillExperience(playerId, SKILL_IDS.EXPLORACAO, 10);
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

    // Update player stats with level up check
    const oldLevel = player.level;
    const levelData = this.gameService.calculateLevelUp(player.experience, expGain);
    await this.storage.updatePlayer(expedition.playerId, {
      experience: levelData.newExp,
      level: levelData.newLevel,
      coins: player.coins // Coin system removed as requested
    });

    // Handle skill points if player leveled up
    await this.gameService.handlePlayerLevelUp(expedition.playerId, oldLevel, levelData.newLevel);

    // Award skill experience based on expedition activities
    await this.awardSkillExperienceForExpedition(expedition.playerId, rewards);

    // Update quest progress for expedition completion
    await this.questService.updateQuestProgress(expedition.playerId, 'expedition', {
      biomeId: expedition.biomeId
    });

    // Apply completion status effects
    await this.applyExpeditionCompletionEffects(expedition.playerId, expedition);

    // Mark expedition as completed with timestamp in seconds
    return await this.storage.updateExpedition(expeditionId, {
      status: "completed",
      endTime: Date.now(),
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
    const couroResource = allResources.find(r => r.name === "Couro");
    const ossosResource = allResources.find(r => r.name === "Ossos");
    const peloResource = allResources.find(r => r.name === "Pelo");

    // Different animals give different quantities
    switch (animalName) {
      case "Coelho":
        if (carneResource) parts[carneResource.id] = 1;
        if (couroResource) parts[couroResource.id] = 1;
        if (ossosResource) parts[ossosResource.id] = 2;
        if (peloResource) parts[peloResource.id] = 2;
        break;

      case "Veado":
        if (carneResource) parts[carneResource.id] = 3;
        if (couroResource) parts[couroResource.id] = 2;
        if (ossosResource) parts[ossosResource.id] = 4;
        if (peloResource) parts[peloResource.id] = 1;
        break;

      case "Javali":
        if (carneResource) parts[carneResource.id] = 4;
        if (couroResource) parts[couroResource.id] = 3;
        if (ossosResource) parts[ossosResource.id] = 6;
        if (peloResource) parts[peloResource.id] = 1;
        break;

      // Fish processing - fish give meat and bones
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

  async cancelExpedition(expeditionId: string): Promise<{ expeditionId: string; playerId: string }> {
    const expedition = await this.storage.getExpedition(expeditionId);
    if (!expedition) {
      throw new Error("Expedition not found");
    }

    await this.storage.updateExpedition(expeditionId, {
      status: "cancelled",
      endTime: Date.now()
    });

    return { expeditionId, playerId: expedition.playerId };
  }

  async updateExpeditionProgress(expeditionId: string): Promise<Expedition> {
    const expedition = await this.storage.getExpedition(expeditionId);
    if (!expedition) {
      throw new Error("Expedition not found");
    }

    if (expedition.status !== 'in_progress') {
      throw new Error("Expedition is not in progress");
    }

    // Calculate progress based on elapsed time
    const currentTime = Date.now();
    const elapsedTime = currentTime - expedition.startTime;
    const progress = Math.min(100, (elapsedTime / expedition.duration) * 100);

    const updatedExpedition = await this.storage.updateExpedition(expeditionId, {
      progress
    });

    return updatedExpedition;
  }

  /**
   * Apply status effects when completing an expedition
   */
  private async applyExpeditionCompletionEffects(playerId: string, expedition: any): Promise<void> {
    const player = await this.storage.getPlayer(playerId);
    if (!player) return;

    const statusService = new (await import('./player-status-service')).PlayerStatusService(this.storage);

    // Completion effects - balance of positive and negative
    let moraleIncrease = 8; // Success boosts morale significantly
    let fatigueIncrease = 5; // Additional fatigue from completing work
    let hungerDecrease = 5; // More hungry after expedition
    let thirstDecrease = 3; // Slightly more thirsty
    let hygieneDecrease = 3; // A bit dirtier

    // Bonus effects for successful resource gathering
    const resourceCount = Object.keys(expedition.collectedResources || {}).length;
    if (resourceCount > 2) {
      moraleIncrease += 3; // Extra satisfaction from good haul
    }
    if (resourceCount > 4) {
      moraleIncrease += 2; // Even better haul
      fatigueIncrease += 2; // But more tiring
    }

    const updates: any = {
      hunger: Math.max(0, Math.min(player.maxHunger, player.hunger - hungerDecrease)),
      thirst: Math.max(0, Math.min(player.maxThirst, player.thirst - thirstDecrease)),
      morale: Math.min(100, (player.morale || 50) + moraleIncrease),
      fatigue: Math.min(100, (player.fatigue || 0) + fatigueIncrease),
      hygiene: Math.max(0, Math.min(100, (player.hygiene || 100) - hygieneDecrease))
    };

    await statusService.updatePlayerStatus(playerId, updates);
    console.log(`✅ Expedition completion effects applied to player ${playerId}:`, updates);
  }

  /**
   * Apply status effects when starting an expedition
   */
  private async applyExpeditionStatusEffects(playerId: string, biome: any, resourceCount: number): Promise<void> {
    const player = await this.storage.getPlayer(playerId);
    if (!player) return;

    const statusService = new (await import('./player-status-service')).PlayerStatusService(this.storage);

    // Base expedition effects - increase the impact
    let hungerDecrease = 8; // Expeditions consume energy
    let thirstDecrease = 10; // Physical activity increases thirst
    let fatigueIncrease = 12; // Base fatigue from expedition start
    let moraleChange = 3; // Adventure boosts morale
    let hygieneDecrease = 8; // Getting dirty from expedition
    let temperatureChange = 0;

    // Biome-specific effects
    switch (biome.name?.toLowerCase()) {
      case 'deserto árido':
        temperatureChange = 20; // Hot climate
        fatigueIncrease += 5; // More tiring in desert
        hygieneDecrease += 5; // Sand and dust
        thirstDecrease += 5; // Hot weather increases thirst
        break;
      case 'floresta gelada':
        temperatureChange = -15; // Cold climate  
        fatigueIncrease += 3; // Cold is tiring
        hungerDecrease += 3; // Body burns more calories to stay warm
        break;
      case 'pântano misterioso':
        hygieneDecrease += 8; // Very dirty environment
        moraleChange -= 2; // Unpleasant environment
        temperatureChange = -5; // Damp and cold
        break;
      case 'montanhas rochosas':
        fatigueIncrease += 6; // Climbing is exhausting
        moraleChange += 2; // Beautiful views boost morale
        hungerDecrease += 2; // Physical exertion
        break;
      case 'floresta':
      case 'floresta temperada':
        temperatureChange = 5; // Mild temperature increase
        moraleChange += 1; // Pleasant environment
        break;
    }

    // Resource gathering intensity effects
    if (resourceCount > 3) {
      fatigueIncrease += 3; // More resources = more work
      hygieneDecrease += 2;
      hungerDecrease += 2;
      thirstDecrease += 2;
    }

    // Equipment can reduce negative effects
    if (player.equippedChestplate) {
      fatigueIncrease = Math.max(1, fatigueIncrease - 2);
      temperatureChange *= 0.6; // Better armor protection
    }
    if (player.equippedHelmet) {
      hygieneDecrease = Math.max(1, hygieneDecrease - 2);
    }
    if (player.equippedBoots) {
      fatigueIncrease = Math.max(1, fatigueIncrease - 1);
    }

    // Apply the status changes - ensure all core stats are affected
    const updates: any = {
      hunger: Math.max(0, Math.min(player.maxHunger, player.hunger - hungerDecrease)),
      thirst: Math.max(0, Math.min(player.maxThirst, player.thirst - thirstDecrease)),
      fatigue: Math.min(100, (player.fatigue || 0) + fatigueIncrease),
      morale: Math.max(0, Math.min(100, (player.morale || 50) + moraleChange)),
      hygiene: Math.max(0, Math.min(100, (player.hygiene || 100) - hygieneDecrease))
    };

    if (temperatureChange !== 0) {
      updates.temperature = Math.max(-100, Math.min(100, (player.temperature || 20) + temperatureChange));
    }

    await statusService.updatePlayerStatus(playerId, updates);
    console.log(`🏃 Expedition status effects applied to player ${playerId}:`, updates);
  }
}
// Game service for business logic
import type { IStorage } from "../storage";
import type { Player, Resource, Equipment, InventoryItem, StorageItem } from "@shared/types";
import { EQUIPMENT_IDS, SKILL_IDS } from "@shared/constants/game-ids";
import { SkillService } from "./skill-service";
import { GameData, Player, Item, Recipe, Equipment, Quest, Biome, Resource, BiomeLocation, Storage as GameStorage, InventoryItem, StorageItem, BiomeResourceLocation } from '../types';
import { Storage } from '../storage';
import { v4 as uuidv4 } from 'uuid';
import { biomes } from '../data/biomes';
// Data consolidated in equipment.ts and quests.ts
import { equipment } from '../data/equipment';
import { quests } from '../data/quests';
import { resources } from '../data/resources';
import { timeService } from './time-service';
import { HungerThirstService } from './hunger-thirst-service';

export class GameService {
  private skillService: SkillService;
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  constructor(private storage: IStorage) {
    this.skillService = new SkillService(storage);
  }

  // Cache utilities
  private getCacheKey(type: string, id: string): string {
    return `${type}:${id}`;
  }

  private isExpired(timestamp: number, ttl: number): boolean {
    return Date.now() - timestamp > ttl;
  }

  private getFromCache<T>(type: string, id: string): T | null {
    const key = this.getCacheKey(type, id);
    const cached = this.cache.get(key);

    if (!cached || this.isExpired(cached.timestamp, cached.ttl)) {
      this.cache.delete(key);
      return null;
    }

    return cached.data as T;
  }

  private setCache<T>(type: string, id: string, data: T, ttl: number = 60000): void {
    const key = this.getCacheKey(type, id);
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  private invalidateCache(type: string, id?: string): void {
    if (id) {
      const key = this.getCacheKey(type, id);
      this.cache.delete(key);
    } else {
      // Clear all cache entries of this type
      for (const [key] of this.cache) {
        if (key.startsWith(`${type}:`)) {
          this.cache.delete(key);
        }
      }
    }
  }

  // Calculate total inventory weight in grams with caching
  async calculateInventoryWeight(playerId: string): Promise<number> {
    // Check cache first
    const cached = this.getFromCache<number>('weight', playerId);
    if (cached !== null) {
      return cached;
    }

    const [inventory, resources] = await Promise.all([
      this.storage.getPlayerInventory(playerId),
      this.storage.getAllResources()
    ]);

    let totalWeightInGrams = 0;

    // Create a resource map for O(1) lookups
    const resourceMap = new Map(resources.map(r => [r.id, r]));

    for (const item of inventory) {
      const resource = resourceMap.get(item.resourceId);
      if (resource) {
        totalWeightInGrams += resource.weight * item.quantity;
      }
    }

    // Cache result for 30 seconds
    this.setCache('weight', playerId, totalWeightInGrams, 30000);

    return totalWeightInGrams;
  }

  // Check if player can carry more items
  async canCarryMore(playerId: string, additionalWeight: number): Promise<boolean> {
    const player = await this.storage.getPlayer(playerId);
    if (!player) return false;

    const currentWeight = await this.calculateInventoryWeight(playerId);
    const maxWeight = this.calculateMaxInventoryWeight(player);

    return (currentWeight + additionalWeight) <= maxWeight;
  }

  // Calculate max inventory weight considering equipment bonuses
  calculateMaxInventoryWeight(player: Player): number {
    let maxWeight = player.maxInventoryWeight;

    // Add equipment bonuses (this would need equipment data)
    // For now, return base weight
    return maxWeight;
  }

  // Check if player has required tool for resource using new collectionRequirements system
  async hasRequiredTool(playerId: string, resourceId: string): Promise<boolean> {
    const resource = await this.storage.getResource(resourceId);
    if (!resource || !resource.collectionRequirements || resource.collectionRequirements.length === 0) return true;

    const player = await this.storage.getPlayer(playerId);
    if (!player) return false;

    const equipment = await this.storage.getAllEquipment();

    // Check each collection requirement
    for (const requirement of resource.collectionRequirements) {
      if (requirement.type === 'tool') {
        const requiredTool = requirement.requirement as string;

        switch (requiredTool) {
          case "fishing_rod":
            // Check if player has fishing rod equipped
            const equippedFishingRod = equipment.find(eq => 
              eq.id === player.equippedTool && eq.toolType === "fishing_rod"
            );

            if (!equippedFishingRod) return false;

            // Check if player has bait in inventory
            return await this.hasBaitInInventory(playerId);

          case "bucket":
            // For water collection: requires bucket OR bamboo bottle
            const hasBucket = equipment.find(eq => 
              eq.id === player.equippedTool && eq.toolType === "bucket"
            );

            const hasBambooBottle = equipment.find(eq => 
              eq.id === player.equippedTool && eq.toolType === "bamboo_bottle"
            );

            if (!(hasBucket || hasBambooBottle)) return false;
            break;

          case "weapon_and_knife":
            // For hunting large animals: requires weapon AND knife
            const equippedWeapon = equipment.find(eq => 
              eq.id === player.equippedWeapon && eq.slot === "weapon"
            );
            const hasNonKnifeWeapon = !!(equippedWeapon && equippedWeapon.toolType !== "knife");

            // Check for knife in both tool and weapon slots
            const hasKnife = equipment.some(eq => 
              (eq.id === player.equippedTool || eq.id === player.equippedWeapon) && 
              eq.toolType === "knife"
            );

            if (!(hasNonKnifeWeapon && hasKnife)) return false;
            break;

          case "knife":
            // Check for knife in both tool and weapon slots
            const knifeEquipped = equipment.some(eq => 
              (eq.id === player.equippedTool || eq.id === player.equippedWeapon) && 
              eq.toolType === "knife"
            );
            if (!knifeEquipped) return false;
            break;

          default:
            // Regular tool checks - check both tool and weapon slots
            const equippedTool = equipment.find(eq => 
              eq.id === player.equippedTool && eq.toolType === requiredTool
            );

            const equippedWeaponTool = equipment.find(eq => 
              eq.id === player.equippedWeapon && eq.toolType === requiredTool
            );

            if (!(equippedTool || equippedWeaponTool)) return false;
            break;
        }
      }
    }

    return true; // All requirements met
  }

  // Check if player has bait in inventory
  private async hasBaitInInventory(playerId: string): Promise<boolean> {
    const inventoryItems = await this.storage.getPlayerInventory(playerId);

    // Check if player has bait (now a resource, not equipment) in inventory
    const baitItem = inventoryItems.find(item => item.resourceId === EQUIPMENT_IDS.ISCA_PESCA);
    return !!(baitItem && baitItem.quantity > 0);
  }

  // Check if player has fishing requirements (rod equipped + bait in inventory)
  async hasFishingRequirements(playerId: string): Promise<boolean> {
    const player = await this.storage.getPlayer(playerId);
    if (!player) return false;

    const equipment = await this.storage.getAllEquipment();

    // Check if player has fishing rod equipped
    const equippedTool = equipment.find(eq => 
      eq.id === player.equippedTool && eq.toolType === "fishing_rod"
    );

    if (!equippedTool) return false;

    // Check if player has bait in inventory
    return await this.hasBaitInInventory(playerId);
  }

  // Add resource to player inventory (try inventory first, then storage if full)
  async addResourceToPlayer(playerId: string, resourceId: string, quantity: number): Promise<void> {
    console.log(`🎒 GAME-SERVICE: Adding ${quantity}x ${resourceId} to player ${playerId}`);

    try {
      // Check if player exists
      const player = await this.storage.getPlayer(playerId);
      if (!player) {
        throw new Error(`Player ${playerId} not found`);
      }

      // Check if resource exists
      const resource = await this.storage.getResource(resourceId);
      if (!resource) {
        console.warn(`❌ GAME-SERVICE: Resource ${resourceId} not found in database, skipping`);
        return;
      }

      console.log(`🔍 GAME-SERVICE: Resource found: ${resource.name} (weight: ${resource.weight}g each)`);

      // Calculate weight check
      const weightToAdd = resource.weight * quantity;
      const currentWeight = await this.calculateInventoryWeight(playerId);
      const maxWeight = this.calculateMaxInventoryWeight(player);
      const canCarry = await this.canCarryMore(playerId, weightToAdd);

      console.log(`⚖️ GAME-SERVICE: Weight check - Current: ${currentWeight}g, Adding: ${weightToAdd}g, Max: ${maxWeight}g, Can carry: ${canCarry}`);

      if (canCarry) {
        // Try to add to inventory first
        const inventoryItems = await this.storage.getPlayerInventory(playerId);
        const existingItem = inventoryItems.find(item => item.resourceId === resourceId);

        console.log(`📋 GAME-SERVICE: Current inventory has ${inventoryItems.length} items`);

        if (existingItem) {
          // Update existing inventory item
          const newQuantity = existingItem.quantity + quantity;
          await this.storage.updateInventoryItem(existingItem.id, {
            quantity: newQuantity
          });
          console.log(`📦 GAME-SERVICE: Updated existing inventory item ${existingItem.id} from ${existingItem.quantity} to ${newQuantity}`);
        } else {
          // Add new inventory item
          const newItem = await this.storage.addInventoryItem({
            playerId,
            resourceId,
            quantity
          });
          console.log(`📦 GAME-SERVICE: Added new inventory item with ID ${newItem.id} (${quantity}x ${resource.name})`);
        }

        // Update player inventory weight
        const newWeight = player.inventoryWeight + weightToAdd;
        await this.storage.updatePlayer(playerId, {
          inventoryWeight: newWeight
        });

        console.log(`✅ GAME-SERVICE: Successfully added ${quantity}x ${resource.name} to inventory, new weight: ${newWeight}g`);
      } else {
        console.log(`⚠️ GAME-SERVICE: Cannot fit in inventory (weight limit), adding to storage instead`);
        throw new Error("Cannot carry more weight - moving to storage");
      }

      // Invalidate cache
      this.invalidateCache('weight', playerId);
      
      // Also invalidate memory cache
      const { invalidatePlayerCache, invalidateInventoryCache, invalidateStorageCache } = await import('../cache/memory-cache');
      invalidatePlayerCache(playerId);
      invalidateInventoryCache(playerId);
      invalidateStorageCache(playerId);

    } catch (error) {
      console.log(`🏪 GAME-SERVICE: Adding to storage instead. Reason:`, error instanceof Error ? error.message : error);

      // Get resource info for storage
      const resource = await this.storage.getResource(resourceId);
      if (!resource) {
        console.error(`❌ GAME-SERVICE: Cannot add to storage - resource ${resourceId} not found`);
        return;
      }

      // If inventory fails, add to storage
      const storageItems = await this.storage.getPlayerStorage(playerId);
      const existingStorageItem = storageItems.find(item => 
        item.resourceId === resourceId && item.itemType === 'resource'
      );

      if (existingStorageItem) {
        const newQuantity = existingStorageItem.quantity + quantity;
        await this.storage.updateStorageItem(existingStorageItem.id, {
          quantity: newQuantity
        });
        console.log(`📦 GAME-SERVICE: Updated existing storage item ${existingStorageItem.id} from ${existingStorageItem.quantity} to ${newQuantity}`);
      } else {
        const newStorageItem = await this.storage.addStorageItem({
          playerId,
          resourceId,
          quantity,
          itemType: 'resource'
        });
        console.log(`📦 GAME-SERVICE: Added new storage item with ID ${newStorageItem.id} (${quantity}x ${resource.name})`);
      }
      
      // Invalidate cache for storage path too
      const { invalidatePlayerCache, invalidateInventoryCache, invalidateStorageCache } = await import('../cache/memory-cache');
      invalidatePlayerCache(playerId);
      invalidateInventoryCache(playerId);
      invalidateStorageCache(playerId);

      console.log(`✅ GAME-SERVICE: Successfully added ${quantity}x ${resource.name} to storage`);
    }
  }

  // Move item from inventory to storage
  async moveToStorage(playerId: string, inventoryItemId: string, quantity: number): Promise<void> {
    const inventoryItems = await this.storage.getPlayerInventory(playerId);
    const item = inventoryItems.find(i => i.id === inventoryItemId);

    if (!item || item.quantity < quantity) {
      throw new Error("Insufficient quantity in inventory");
    }

    // Add to storage
    const storageItems = await this.storage.getPlayerStorage(playerId);
    const existingStorage = storageItems.find(s => s.resourceId === item.resourceId);

    if (existingStorage) {
      await this.storage.updateStorageItem(existingStorage.id, {
        quantity: existingStorage.quantity + quantity
      });
    } else {
      await this.storage.addStorageItem({
        playerId,
        resourceId: item.resourceId,
        quantity,
        itemType: 'resource'
      });
    }

    // Remove from inventory
    if (item.quantity === quantity) {
      // Remove entire item if moving all quantity
      await this.storage.removeInventoryItem(inventoryItemId);
    } else {
      // Reduce quantity if moving partial amount
      await this.storage.updateInventoryItem(inventoryItemId, {
        quantity: item.quantity - quantity
      });
    }

    // Update player's inventory weight
    const newWeight = await this.calculateInventoryWeight(playerId);
    await this.storage.updatePlayer(playerId, { inventoryWeight: newWeight });
  }

  // Move item from storage to inventory
  async moveToInventory(playerId: string, storageItemId: string, quantity: number): Promise<void> {
    const storageItems = await this.storage.getPlayerStorage(playerId);
    const item = storageItems.find(i => i.id === storageItemId);

    if (!item || item.quantity < quantity) {
      throw new Error("Insufficient quantity in storage");
    }

    const resource = await this.storage.getResource(item.resourceId);
    if (!resource) throw new Error("Resource not found");

    // Check if player can carry the additional weight
    const additionalWeight = resource.weight * quantity;
    const canCarry = await this.canCarryMore(playerId, additionalWeight);

    if (!canCarry) {
      throw new Error("Cannot carry more weight");
    }

    // Add to inventory
    const inventoryItems = await this.storage.getPlayerInventory(playerId);
    const existingInventory = inventoryItems.find(i => i.resourceId === item.resourceId);

    if (existingInventory) {
      await this.storage.updateInventoryItem(existingInventory.id, {
        quantity: existingInventory.quantity + quantity
      });
    } else {
      await this.storage.addInventoryItem({
        playerId,
        resourceId: item.resourceId,
        quantity
      });
    }

    // Update storage
    if (item.quantity === quantity) {
      await this.storage.removeStorageItem(storageItemId);
    } else {
      await this.storage.updateStorageItem(storageItemId, {
        quantity: item.quantity - quantity
      });
    }

    // Update player weight and record skill usage
    const player = await this.storage.getPlayer(playerId);
    if (player) {
      const newWeight = await this.calculateInventoryWeight(playerId);
      await this.storage.updatePlayer(playerId, { inventoryWeight: newWeight });

      // Award skill experience for resource management
      await this.skillService.recordSkillUsage(playerId, SKILL_IDS.COLETA, 'gathering');
    }
  }

  // Calculate expedition rewards based on equipment and other factors
  calculateExpeditionRewards(baseRewards: Record<string, number>, player: Player, equipment: Equipment[]): Record<string, number> {
    const rewards = { ...baseRewards };

    // Apply equipment bonuses
    equipment.forEach(eq => {
      if (eq.bonus && typeof eq.bonus === 'object') {
        const bonus = eq.bonus as any;
        if (bonus.type === "resource_boost" && bonus.resource && rewards[bonus.resource]) {
          rewards[bonus.resource] = Math.floor(rewards[bonus.resource] * bonus.multiplier);
        }
      }
    });

    return rewards;
  }

  // Experience calculation using experienceValue field
  calculateExperienceGain(resourcesCollected: Record<string, number>, resources: Resource[]): number {
    let totalExp = 0;

    for (const [resourceId, quantity] of Object.entries(resourcesCollected)) {
      const resource = resources.find(r => r.id === resourceId);
      if (resource) {
        // Use experienceValue field if available, otherwise fallback to value / 2
        const expPerItem = resource.experienceValue || Math.floor(resource.value / 2);
        totalExp += expPerItem * quantity;
      }
    }

    return totalExp;
  }

  // Check if player levels up and return new level
  calculateLevelUp(currentExp: number, gainedExp: number): { newLevel: number; newExp: number } {
    const totalExp = currentExp + gainedExp;
    let level = 1;
    let requiredExp = 100; // Level 2 requires 100 exp

    while (totalExp >= requiredExp) {
      level++;
      requiredExp += level * 50; // Each level requires 50 * level more exp
    }

    return { newLevel: level, newExp: totalExp };
  }

  // Handle player level up with skill points
  async handlePlayerLevelUp(playerId: string, oldLevel: number, newLevel: number): Promise<void> {
    if (newLevel > oldLevel) {
      const levelsGained = newLevel - oldLevel;
      await this.skillService.handlePlayerLevelUp(playerId, newLevel);
      console.log(`🎯 LEVEL-UP: Player ${playerId} reached level ${newLevel}, gained ${levelsGained} skill point(s)`);
    }
  }

  async collectResource(playerId: string, resourceId: string, amount: number): Promise<void> {
    const player = await this.storage.getPlayer(playerId);
    if (!player) throw new Error("Player not found");

    const resource = await this.storage.getResource(resourceId);
    if (!resource) throw new Error("Resource not found");

    // Check if player can carry the additional weight
    const additionalWeight = resource.weight * amount;
    const canCarry = await this.canCarryMore(playerId, additionalWeight);
    if (!canCarry) throw new Error("Cannot carry more weight");

    // Get player storage
    const playerStorage = await this.storage.getPlayerStorage(playerId);

    // Add to storage
    const existingItem = playerStorage.find(item => item.resourceId === resourceId);

    if (existingItem) {
      await this.storage.updateStorageItem(existingItem.id, {
        quantity: existingItem.quantity + amount
      });
    } else {
      await this.storage.addStorageItem({
        playerId,
        resourceId: resourceId,
        quantity: amount,
        itemType: 'resource'
      });
    }

    // Update quest progress for collection
    const { QuestService } = await import('./quest-service');
    const questService = new QuestService(this.storage);
    await questService.updateQuestProgress(playerId, 'collect', {
      resourceId: resourceId,
      quantity: amount
    });

    // Update player weight
    const newWeight = await this.calculateInventoryWeight(playerId);
    await this.storage.updatePlayer(playerId, { inventoryWeight: newWeight });
  }

  async craftItem(playerId: string, craftedResourceId: string, craftQuantity: number): Promise<void> {
    const player = await this.storage.getPlayer(playerId);
    if (!player) throw new Error("Player not found");

    const resource = await this.storage.getResource(craftedResourceId);
    if (!resource) throw new Error("Resource not found");

    // Get player storage
    const playerStorage = await this.storage.getPlayerStorage(playerId);

    // Add to storage
    const existingItem = playerStorage.find(item => item.resourceId === craftedResourceId);
    if (existingItem) {
      await this.storage.updateStorageItem(existingItem.id, {
        quantity: existingItem.quantity + craftQuantity
      });
    } else {
      await this.storage.addStorageItem({
        playerId,
        resourceId: craftedResourceId,
        quantity: craftQuantity,
        itemType: 'resource'
      });
    }

    // Update quest progress for crafting
    const { QuestService } = await import('./quest-service');
    const questService = new QuestService(this.storage);
    await questService.updateQuestProgress(playerId, 'craft', {
      itemId: craftedResourceId,
      quantity: craftQuantity
    });
  }

  // Collect resource from biome
  async collectResource(playerId: string, biomeId: string, resourceType: string): Promise<any> {
    console.log(`🎯 COLLECT-SERVICE: Starting collection for player ${playerId}`);

    const player = await this.storage.getPlayer(playerId);
    if (!player) throw new Error("Player not found");

    const biomes = await this.storage.getAllBiomes();
    const biome = biomes.find(b => b.id === biomeId);
    if (!biome) throw new Error("Biome not found");

    console.log(`🎯 COLLECT-SERVICE: Found biome ${biome.name}`);

    // Check if player has required tool
    const hasRequiredTool = await this.hasRequiredTool(playerId, resourceType);
    if (!hasRequiredTool) {
      throw new Error("You don't have the required tool for this resource");
    }

    console.log(`🎯 COLLECT-SERVICE: Player has required tool`);

    // Get available resources for this biome and type
    const availableResources = biome.resources
      .filter(r => r.category === resourceType)
      .filter(r => r.spawnRate > 0);

    if (availableResources.length === 0) {
      throw new Error("No resources of this type available in this biome");
    }

    console.log(`🎯 COLLECT-SERVICE: Found ${availableResources.length} available resources`);

    // Select random resource based on spawn rates
    const selectedResource = this.selectRandomResource(availableResources);
    const quantity = Math.floor(Math.random() * 3) + 1; // 1-3 items

    console.log(`🎯 COLLECT-SERVICE: Selected ${selectedResource.name}, quantity: ${quantity}`);

    // Award experience
    const experienceGained = selectedResource.experienceValue * quantity;
    await this.storage.updatePlayer(playerId, {
      experience: player.experience + experienceGained
    });

    console.log(`🎯 COLLECT-SERVICE: Awarded ${experienceGained} experience`);

    // Add resource to inventory/storage
    await this.addResourceToPlayer(playerId, selectedResource.id, quantity);

    console.log(`🎯 COLLECT-SERVICE: Successfully added resource to player`);

    return {
      success: true,
      resource: selectedResource,
      quantity,
      experienceGained,
      message: `Collected ${quantity}x ${selectedResource.name}!`
    };
  }
}
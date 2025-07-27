// Game service for business logic
import type { IStorage } from "../storage";
import type { Player, Resource, Equipment, InventoryItem, StorageItem } from "@shared/schema";

export class GameService {
  constructor(private storage: IStorage) {}

  // Calculate total inventory weight
  async calculateInventoryWeight(playerId: string): Promise<number> {
    const inventory = await this.storage.getPlayerInventory(playerId);
    const resources = await this.storage.getAllResources();
    const equipment = await this.storage.getAllEquipment();
    
    let totalWeight = 0;
    
    for (const item of inventory) {
      const resource = resources.find(r => r.id === item.resourceId);
      if (resource) {
        totalWeight += resource.weight * item.quantity;
      }
    }
    
    return totalWeight;
  }

  // Check if player can carry more items
  async canCarryMore(playerId: string, additionalWeight: number): Promise<boolean> {
    const player = await this.storage.getPlayer(playerId);
    if (!player) return false;
    
    const currentWeight = await this.calculateInventoryWeight(playerId);
    const maxWeight = this.calculateMaxInventoryWeight(player);
    
    return (currentWeight + additionalWeight) <= maxWeight;
  }

  // Calculate max inventory weight based on level ranges and equipment bonuses
  calculateMaxInventoryWeight(player: Player): number {
    // Base weight capacity by level ranges
    let baseCapacity = this.getBaseWeightCapacityByLevel(player.level);
    
    // TODO: Add equipment bonuses (backpack, etc.)
    // For now, return base capacity
    return baseCapacity;
  }

  // Get base weight capacity based on player level
  private getBaseWeightCapacityByLevel(level: number): number {
    if (level >= 1 && level <= 5) return 20;
    if (level >= 6 && level <= 10) return 30;
    if (level >= 11 && level <= 15) return 40;
    if (level >= 16 && level <= 20) return 50;
    if (level >= 21 && level <= 25) return 60;
    if (level >= 26 && level <= 30) return 70;
    if (level >= 31 && level <= 35) return 80;
    if (level >= 36 && level <= 40) return 90;
    if (level >= 41) return 100;
    
    // Fallback for level 0 or negative (shouldn't happen)
    return 20;
  }

  // Get level range description for display purposes
  getLevelRange(level: number): string {
    if (level >= 1 && level <= 5) return "1-5";
    if (level >= 6 && level <= 10) return "6-10";
    if (level >= 11 && level <= 15) return "11-15";
    if (level >= 16 && level <= 20) return "16-20";
    if (level >= 21 && level <= 25) return "21-25";
    if (level >= 26 && level <= 30) return "26-30";
    if (level >= 31 && level <= 35) return "31-35";
    if (level >= 36 && level <= 40) return "36-40";
    if (level >= 41) return "41+";
    
    return "1-5"; // Fallback
  }

  // Check if player has required tool for resource
  async hasRequiredTool(playerId: string, resourceId: string): Promise<boolean> {
    const resource = await this.storage.getResource(resourceId);
    if (!resource) return false;
    
    // BASIC RESOURCES ARE ALWAYS COLLECTIBLE - they are known to all players
    if (resource.type === "basic") return true;
    
    // If resource doesn't require a tool, it's always collectable
    if (!resource.requiredTool) return true;
    
    const player = await this.storage.getPlayer(playerId);
    if (!player) return false;
    
    const equipment = await this.storage.getAllEquipment();
    
    // Special case for hunting large animals: requires weapon AND knife
    if (resource.requiredTool === "weapon_and_knife") {
      // Check if player has a weapon equipped (not a knife)
      const equippedWeapon = equipment.find(eq => 
        eq.id === player.equippedWeapon && eq.slot === "weapon"
      );
      const hasNonKnifeWeapon = !!(equippedWeapon && equippedWeapon.toolType !== "knife");
      
      // Check for knife in both tool and weapon slots
      const hasKnife = equipment.some(eq => 
        (eq.id === player.equippedTool || eq.id === player.equippedWeapon) && 
        eq.toolType === "knife"
      );
      
      return hasNonKnifeWeapon && hasKnife;
    }
    
    // Regular tool checks - check both tool and weapon slots
    const equippedTool = equipment.find(eq => 
      eq.id === player.equippedTool && eq.toolType === resource.requiredTool
    );
    
    const equippedWeapon = equipment.find(eq => 
      eq.id === player.equippedWeapon && eq.toolType === resource.requiredTool
    );
    
    return !!(equippedTool || equippedWeapon);
  }

  // Move item from inventory to storage
  async moveToStorage(playerId: string, inventoryItemId: string, quantity: number): Promise<void> {
    const inventoryItem = await this.storage.getPlayerInventory(playerId);
    const item = inventoryItem.find(i => i.id === inventoryItemId);
    
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
        quantity
      });
    }

    // Update inventory
    if (item.quantity === quantity) {
      await this.storage.removeInventoryItem(inventoryItemId);
    } else {
      await this.storage.updateInventoryItem(inventoryItemId, {
        quantity: item.quantity - quantity
      });
    }

    // Update player weight
    const player = await this.storage.getPlayer(playerId);
    if (player) {
      const newWeight = await this.calculateInventoryWeight(playerId);
      await this.storage.updatePlayer(playerId, { inventoryWeight: newWeight });
    }
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

    // Update player weight
    const player = await this.storage.getPlayer(playerId);
    if (player) {
      const newWeight = await this.calculateInventoryWeight(playerId);
      await this.storage.updatePlayer(playerId, { inventoryWeight: newWeight });
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
}
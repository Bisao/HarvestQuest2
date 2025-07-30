// Game service for business logic
import type { IStorage } from "../storage";
import type { Player, Resource, Equipment, InventoryItem, StorageItem } from "@shared/types";

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
    const equipment = await this.storage.getAllEquipment();
    
    // Find bait equipment ID
    const baitEquipment = equipment.find(eq => eq.toolType === "bait");
    if (!baitEquipment) return false;
    
    // Check if player has bait in inventory
    const baitItem = inventoryItems.find(item => item.resourceId === baitEquipment.id);
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
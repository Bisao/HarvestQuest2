// Enhanced Storage Service - Clean, unified storage management
// Handles all storage operations with real-time synchronization

import type { IStorage } from "../storage";
import type { StorageItem, Resource, Equipment, Player } from "@shared/types";

export class StorageService {
  constructor(private storage: IStorage) {}

  // Core Storage Operations
  async getPlayerStorage(playerId: string): Promise<StorageItem[]> {
    return this.storage.getPlayerStorage(playerId);
  }

  async addItemToStorage(
    playerId: string, 
    resourceId: string, 
    quantity: number, 
    itemType: 'resource' | 'equipment' = 'resource'
  ): Promise<StorageItem> {
    // Check if item already exists in storage
    const existingItems = await this.storage.getPlayerStorage(playerId);
    const existingItem = existingItems.find(item => 
      item.resourceId === resourceId && item.itemType === itemType
    );

    if (existingItem) {
      // Update existing item quantity
      return this.storage.updateStorageItem(existingItem.id, {
        quantity: existingItem.quantity + quantity
      });
    } else {
      // Add new item to storage
      return this.storage.addStorageItem({
        playerId,
        resourceId,
        quantity,
        itemType
      });
    }
  }

  async removeItemFromStorage(
    playerId: string, 
    resourceId: string, 
    quantity: number, 
    itemType: 'resource' | 'equipment' = 'resource'
  ): Promise<boolean> {
    const existingItems = await this.storage.getPlayerStorage(playerId);
    const existingItem = existingItems.find(item => 
      item.resourceId === resourceId && item.itemType === itemType
    );

    if (!existingItem || existingItem.quantity < quantity) {
      throw new Error("Not enough items in storage");
    }

    const newQuantity = existingItem.quantity - quantity;
    
    if (newQuantity <= 0) {
      // Remove item completely
      await this.storage.removeStorageItem(existingItem.id);
    } else {
      // Update quantity
      await this.storage.updateStorageItem(existingItem.id, {
        quantity: newQuantity
      });
    }

    return true;
  }

  async transferToInventory(
    playerId: string, 
    storageItemId: string, 
    quantity: number
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Get storage item
      const storageItems = await this.storage.getPlayerStorage(playerId);
      const storageItem = storageItems.find(item => item.id === storageItemId);
      
      if (!storageItem) {
        return { success: false, message: "Item not found in storage" };
      }

      if (storageItem.quantity < quantity) {
        return { success: false, message: "Not enough items in storage" };
      }

      // Check if it's equipment (can't be withdrawn to inventory)
      if (storageItem.itemType === 'equipment') {
        return { success: false, message: "Equipment can only be equipped, not withdrawn to inventory" };
      }

      // Get player to check inventory capacity
      const player = await this.storage.getPlayer(playerId);
      if (!player) {
        return { success: false, message: "Player not found" };
      }

      // Get resource data to calculate weight
      const resource = await this.storage.getResource(storageItem.resourceId);
      if (!resource) {
        return { success: false, message: "Resource data not found" };
      }

      const totalWeight = resource.weight * quantity;
      
      if (player.inventoryWeight + totalWeight > player.maxInventoryWeight) {
        return { success: false, message: "Not enough space in inventory" };
      }

      // Check if item already exists in inventory
      const inventoryItems = await this.storage.getPlayerInventory(playerId);
      const existingInventoryItem = inventoryItems.find(item => 
        item.resourceId === storageItem.resourceId
      );

      if (existingInventoryItem) {
        // Update existing inventory item
        await this.storage.updateInventoryItem(existingInventoryItem.id, {
          quantity: existingInventoryItem.quantity + quantity
        });
      } else {
        // Add new inventory item
        await this.storage.addInventoryItem({
          playerId,
          resourceId: storageItem.resourceId,
          quantity
        });
      }

      // Update storage item
      const newStorageQuantity = storageItem.quantity - quantity;
      if (newStorageQuantity <= 0) {
        await this.storage.removeStorageItem(storageItem.id);
      } else {
        await this.storage.updateStorageItem(storageItem.id, {
          quantity: newStorageQuantity
        });
      }

      // Update player inventory weight
      await this.storage.updatePlayer(playerId, {
        inventoryWeight: player.inventoryWeight + totalWeight
      });

      return { success: true, message: "Items transferred to inventory successfully" };
    } catch (error) {
      console.error("Transfer to inventory error:", error);
      return { success: false, message: error instanceof Error ? error.message : "Transfer failed" };
    }
  }

  // Enhanced item data retrieval with proper type handling
  async getEnhancedStorageData(playerId: string): Promise<{
    items: Array<StorageItem & { 
      itemData: (Resource | Equipment) & { type: 'resource' | 'equipment' };
      totalValue: number;
    }>;
    stats: {
      totalItems: number;
      totalValue: number;
      uniqueTypes: number;
      totalWeight: number;
    };
  }> {
    const storageItems = await this.storage.getPlayerStorage(playerId);
    const resources = await this.storage.getAllResources();
    const equipment = await this.storage.getAllEquipment();

    const enhancedItems = [];
    let totalItems = 0;
    let totalValue = 0;
    let totalWeight = 0;

    for (const item of storageItems) {
      let itemData: (Resource | Equipment) & { type: 'resource' | 'equipment' } | null = null;

      if (item.itemType === 'equipment') {
        const equipData = equipment.find(e => e.id === item.resourceId);
        if (equipData) {
          itemData = { ...equipData, type: 'equipment' as const };
        }
      } else {
        const resourceData = resources.find(r => r.id === item.resourceId);
        if (resourceData) {
          itemData = { ...resourceData, type: 'resource' as const };
        }
      }

      if (itemData) {
        const itemValue = itemData.value * item.quantity;
        const itemWeight = itemData.weight * item.quantity;
        
        enhancedItems.push({
          ...item,
          itemData,
          totalValue: itemValue
        });

        totalItems += item.quantity;
        totalValue += itemValue;
        totalWeight += itemWeight;
      }
    }

    return {
      items: enhancedItems,
      stats: {
        totalItems,
        totalValue,
        uniqueTypes: enhancedItems.length,
        totalWeight
      }
    };
  }

  // Batch operations for efficiency
  async batchAddItems(
    playerId: string, 
    items: Array<{ resourceId: string; quantity: number; itemType?: 'resource' | 'equipment' }>
  ): Promise<StorageItem[]> {
    const results: StorageItem[] = [];
    
    for (const item of items) {
      const result = await this.addItemToStorage(
        playerId, 
        item.resourceId, 
        item.quantity, 
        item.itemType || 'resource'
      );
      results.push(result);
    }
    
    return results;
  }

  // Water storage operations (special handling)
  async addWaterToPlayer(playerId: string, quantity: number): Promise<Player> {
    return this.storage.addWaterToPlayer(playerId, quantity);
  }

  async consumeWaterFromPlayer(playerId: string, quantity: number): Promise<Player> {
    return this.storage.consumeWaterFromPlayer(playerId, quantity);
  }

  // Storage validation and cleanup
  async validateStorage(playerId: string): Promise<{
    valid: boolean;
    issues: string[];
    fixed: boolean;
  }> {
    const issues: string[] = [];
    let fixed = false;

    try {
      const storageItems = await this.storage.getPlayerStorage(playerId);
      const resources = await this.storage.getAllResources();
      const equipment = await this.storage.getAllEquipment();

      for (const item of storageItems) {
        // Check if referenced item exists
        const resourceExists = resources.some(r => r.id === item.resourceId);
        const equipmentExists = equipment.some(e => e.id === item.resourceId);

        if (!resourceExists && !equipmentExists) {
          issues.push(`Invalid item reference: ${item.resourceId}`);
          // Remove invalid item
          await this.storage.removeStorageItem(item.id);
          fixed = true;
        }

        // Check quantity validity
        if (item.quantity <= 0) {
          issues.push(`Invalid quantity for item: ${item.resourceId}`);
          await this.storage.removeStorageItem(item.id);
          fixed = true;
        }

        // Check itemType consistency
        if (item.itemType === 'equipment' && !equipmentExists) {
          issues.push(`Equipment item type mismatch: ${item.resourceId}`);
        }
        if (item.itemType === 'resource' && !resourceExists) {
          issues.push(`Resource item type mismatch: ${item.resourceId}`);
        }
      }

      return {
        valid: issues.length === 0,
        issues,
        fixed
      };
    } catch (error) {
      return {
        valid: false,
        issues: [error instanceof Error ? error.message : "Validation failed"],
        fixed: false
      };
    }
  }
}
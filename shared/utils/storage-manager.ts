
/**
 * CENTRALIZED STORAGE MANAGER
 * Handles all storage operations with validation and optimization
 */

import type { 
  StorageItem, 
  EnhancedStorageItem, 
  StorageOperation,
  StorageOperationResult,
  StorageStats,
  StorageConstraints,
  StorageFilters,
  StorageSorting,
  BatchStorageOperation,
  BatchOperationResult
} from '../types/storage-types';
import type { Resource, Equipment, Player } from '../types';
import { ItemFinder } from './item-finder';
import { isConsumable } from './consumable-utils';

export class StorageManager {
  private static instance: StorageManager;
  private resources: Resource[] = [];
  private equipment: Equipment[] = [];

  private constructor() {}

  static getInstance(): StorageManager {
    if (!StorageManager.instance) {
      StorageManager.instance = new StorageManager();
    }
    return StorageManager.instance;
  }

  initialize(resources: Resource[], equipment: Equipment[]): void {
    this.resources = resources;
    this.equipment = equipment;
    ItemFinder.initialize(resources, equipment);
  }

  // Enhanced storage item creation
  createEnhancedStorageItem(item: StorageItem): EnhancedStorageItem | null {
    const itemData = ItemFinder.getItemById(item.resourceId);
    if (!itemData) return null;

    const type = 'slot' in itemData ? 'equipment' : 'resource';
    const totalValue = (itemData.value || 0) * item.quantity;
    const totalWeight = itemData.weight * item.quantity;
    const isEquipmentItem = type === 'equipment';
    const isConsumableItem = type === 'resource' && isConsumable(itemData);
    const canWithdraw = type === 'resource'; // Equipment can only be equipped

    return {
      ...item,
      itemData: { ...itemData, type },
      totalValue,
      totalWeight,
      canWithdraw,
      isConsumable: isConsumableItem,
      isEquipment: isEquipmentItem
    };
  }

  // Process storage items into enhanced format
  processStorageItems(items: StorageItem[]): EnhancedStorageItem[] {
    return items
      .map(item => this.createEnhancedStorageItem(item))
      .filter(Boolean) as EnhancedStorageItem[];
  }

  // Calculate storage statistics
  calculateStorageStats(items: EnhancedStorageItem[], maxCapacity: number = 1000): StorageStats {
    const stats: StorageStats = {
      totalItems: 0,
      totalValue: 0,
      totalWeight: 0,
      uniqueTypes: items.length,
      resourceItems: 0,
      equipmentItems: 0,
      storageCapacity: {
        used: items.length,
        max: maxCapacity,
        percentage: Math.round((items.length / maxCapacity) * 100)
      }
    };

    items.forEach(item => {
      stats.totalItems += item.quantity;
      stats.totalValue += item.totalValue;
      stats.totalWeight += item.totalWeight;

      if (item.isEquipment) {
        stats.equipmentItems++;
      } else {
        stats.resourceItems++;
      }
    });

    return stats;
  }

  // Check storage constraints
  checkStorageConstraints(
    items: EnhancedStorageItem[], 
    maxItems: number = 1000,
    maxWeight: number = 10000
  ): StorageConstraints {
    const stats = this.calculateStorageStats(items, maxItems);
    
    return {
      maxItems,
      maxWeight,
      currentItems: stats.storageCapacity.used,
      currentWeight: stats.totalWeight,
      canAddItems: stats.storageCapacity.used < maxItems && stats.totalWeight < maxWeight,
      availableSlots: maxItems - stats.storageCapacity.used
    };
  }

  // Validate storage operation
  validateStorageOperation(
    items: EnhancedStorageItem[],
    operation: StorageOperation,
    constraints: StorageConstraints
  ): StorageOperationResult {
    const itemData = ItemFinder.getItemById(operation.itemId);
    if (!itemData) {
      return { 
        success: false, 
        message: "Item não encontrado", 
        error: "ITEM_NOT_FOUND" 
      };
    }

    switch (operation.operation) {
      case 'add':
        return this.validateAddOperation(items, operation, constraints, itemData);
      case 'remove':
        return this.validateRemoveOperation(items, operation);
      case 'transfer':
        return this.validateTransferOperation(items, operation, constraints);
      default:
        return { 
          success: false, 
          message: "Operação inválida", 
          error: "INVALID_OPERATION" 
        };
    }
  }

  private validateAddOperation(
    items: EnhancedStorageItem[],
    operation: StorageOperation,
    constraints: StorageConstraints,
    itemData: Resource | Equipment
  ): StorageOperationResult {
    const additionalWeight = itemData.weight * operation.quantity;

    // Check weight limit
    if (constraints.currentWeight + additionalWeight > constraints.maxWeight) {
      return { 
        success: false, 
        message: "Limite de peso do armazém excedido", 
        error: "WEIGHT_LIMIT_EXCEEDED" 
      };
    }

    // Check if item exists and can stack
    const existingItem = items.find(item => item.resourceId === operation.itemId);
    if (!existingItem && constraints.availableSlots <= 0) {
      return { 
        success: false, 
        message: "Armazém cheio", 
        error: "STORAGE_FULL" 
      };
    }

    // Check stacking limits
    if (existingItem && 'maxStackSize' in itemData) {
      const newQuantity = existingItem.quantity + operation.quantity;
      if (newQuantity > (itemData.maxStackSize || 999)) {
        return { 
          success: false, 
          message: `Limite de empilhamento excedido (máx: ${itemData.maxStackSize})`, 
          error: "STACK_LIMIT_EXCEEDED" 
        };
      }
    }

    return { success: true, message: "Item pode ser adicionado ao armazém" };
  }

  private validateRemoveOperation(
    items: EnhancedStorageItem[],
    operation: StorageOperation
  ): StorageOperationResult {
    const existingItem = items.find(item => item.resourceId === operation.itemId);
    
    if (!existingItem) {
      return { 
        success: false, 
        message: "Item não encontrado no armazém", 
        error: "ITEM_NOT_FOUND" 
      };
    }

    if (existingItem.quantity < operation.quantity) {
      return { 
        success: false, 
        message: "Quantidade insuficiente no armazém", 
        error: "INSUFFICIENT_QUANTITY" 
      };
    }

    return { success: true, message: "Item pode ser removido do armazém" };
  }

  private validateTransferOperation(
    items: EnhancedStorageItem[],
    operation: StorageOperation,
    constraints: StorageConstraints
  ): StorageOperationResult {
    // Equipment can only be equipped, not transferred to inventory
    const existingItem = items.find(item => item.resourceId === operation.itemId);
    if (existingItem?.isEquipment && operation.targetLocation === 'inventory') {
      return { 
        success: false, 
        message: "Equipamentos só podem ser equipados, não transferidos para o inventário", 
        error: "EQUIPMENT_TRANSFER_DENIED" 
      };
    }

    return this.validateRemoveOperation(items, operation);
  }

  // Filter storage items
  filterStorageItems(
    items: EnhancedStorageItem[],
    filters: StorageFilters
  ): EnhancedStorageItem[] {
    let filtered = [...items];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(item => 
        item.itemData.name.toLowerCase().includes(searchLower)
      );
    }

    // Type filter
    if (filters.type !== 'all') {
      filtered = filtered.filter(item => 
        item.itemData.type === filters.type
      );
    }

    // Rarity filter
    if (filters.rarity !== 'all') {
      filtered = filtered.filter(item => {
        if ('rarity' in item.itemData) {
          return item.itemData.rarity === filters.rarity;
        }
        return false;
      });
    }

    // Consumable filter
    if (filters.consumableOnly) {
      filtered = filtered.filter(item => item.isConsumable);
    }

    // Equipment filter
    if (filters.equipmentOnly) {
      filtered = filtered.filter(item => item.isEquipment);
    }

    return filtered;
  }

  // Sort storage items
  sortStorageItems(
    items: EnhancedStorageItem[],
    sorting: StorageSorting
  ): EnhancedStorageItem[] {
    return [...items].sort((a, b) => {
      let comparison = 0;

      switch (sorting.field) {
        case 'name':
          comparison = a.itemData.name.localeCompare(b.itemData.name);
          break;
        case 'quantity':
          comparison = a.quantity - b.quantity;
          break;
        case 'weight':
          comparison = a.totalWeight - b.totalWeight;
          break;
        case 'value':
          comparison = a.totalValue - b.totalValue;
          break;
        case 'type':
          comparison = a.itemData.type.localeCompare(b.itemData.type);
          break;
        case 'createdAt':
          comparison = (a.createdAt || 0) - (b.createdAt || 0);
          break;
      }

      return sorting.order === 'asc' ? comparison : -comparison;
    });
  }

  // Batch operation validation
  validateBatchOperation(
    items: EnhancedStorageItem[],
    batchOperation: BatchStorageOperation,
    constraints: StorageConstraints
  ): BatchOperationResult {
    const results: StorageOperationResult[] = [];
    let totalProcessed = 0;
    let totalFailed = 0;

    // Simulate batch operation to check constraints
    let simulatedItems = [...items];
    let simulatedConstraints = { ...constraints };

    for (const operation of batchOperation.operations) {
      const result = this.validateStorageOperation(simulatedItems, operation, simulatedConstraints);
      results.push(result);

      if (result.success) {
        totalProcessed++;
        // Update simulated state for next validation
        this.updateSimulatedState(simulatedItems, simulatedConstraints, operation);
      } else {
        totalFailed++;
      }
    }

    return {
      success: totalFailed === 0,
      message: totalFailed === 0 ? 
        `Todas as ${totalProcessed} operações são válidas` : 
        `${totalFailed} operações falharam de ${batchOperation.operations.length}`,
      results,
      totalProcessed,
      totalFailed
    };
  }

  private updateSimulatedState(
    items: EnhancedStorageItem[],
    constraints: StorageConstraints,
    operation: StorageOperation
  ): void {
    const itemData = ItemFinder.getItemById(operation.itemId);
    if (!itemData) return;

    const weightChange = itemData.weight * operation.quantity;

    switch (operation.operation) {
      case 'add':
        constraints.currentWeight += weightChange;
        const existingItemIndex = items.findIndex(item => item.resourceId === operation.itemId);
        if (existingItemIndex >= 0) {
          items[existingItemIndex].quantity += operation.quantity;
        } else {
          constraints.currentItems += 1;
        }
        break;
      case 'remove':
        constraints.currentWeight -= weightChange;
        const removeItemIndex = items.findIndex(item => item.resourceId === operation.itemId);
        if (removeItemIndex >= 0) {
          items[removeItemIndex].quantity -= operation.quantity;
          if (items[removeItemIndex].quantity <= 0) {
            items.splice(removeItemIndex, 1);
            constraints.currentItems -= 1;
          }
        }
        break;
    }

    constraints.availableSlots = constraints.maxItems - constraints.currentItems;
    constraints.canAddItems = constraints.currentItems < constraints.maxItems && 
                             constraints.currentWeight < constraints.maxWeight;
  }

  // Utility functions
  findStorageItemById(items: EnhancedStorageItem[], itemId: string): EnhancedStorageItem | undefined {
    return items.find(item => item.id === itemId);
  }

  findStorageItemsByResourceId(items: EnhancedStorageItem[], resourceId: string): EnhancedStorageItem[] {
    return items.filter(item => item.resourceId === resourceId);
  }

  getWithdrawableItems(items: EnhancedStorageItem[]): EnhancedStorageItem[] {
    return items.filter(item => item.canWithdraw);
  }

  getEquipmentItems(items: EnhancedStorageItem[]): EnhancedStorageItem[] {
    return items.filter(item => item.isEquipment);
  }

  getConsumableItems(items: EnhancedStorageItem[]): EnhancedStorageItem[] {
    return items.filter(item => item.isConsumable);
  }
}

// Export singleton instance
export const storageManager = StorageManager.getInstance();

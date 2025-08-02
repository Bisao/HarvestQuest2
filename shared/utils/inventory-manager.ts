
/**
 * CENTRALIZED INVENTORY MANAGER
 * Handles all inventory operations with proper validation and state management
 */

import type { 
  InventoryItem, 
  StorageItem, 
  EnhancedInventoryItem, 
  InventoryOperationResult,
  InventoryConstraints,
  InventoryStats 
} from '../types/inventory-types';
import type { Resource, Equipment, Player } from '@shared/types';
import { ItemFinder } from './item-finder';
import { isConsumable } from './consumable-utils';

export class InventoryManager {
  private static instance: InventoryManager;
  private resources: Resource[] = [];
  private equipment: Equipment[] = [];

  private constructor() {}

  static getInstance(): InventoryManager {
    if (!InventoryManager.instance) {
      InventoryManager.instance = new InventoryManager();
    }
    return InventoryManager.instance;
  }

  initialize(resources: Resource[], equipment: Equipment[]): void {
    this.resources = resources;
    this.equipment = equipment;
    ItemFinder.initialize(resources, equipment);
  }

  // Enhanced item creation with all computed properties
  createEnhancedItem(item: InventoryItem): EnhancedInventoryItem | null {
    const itemData = ItemFinder.getItemById(item.resourceId);
    if (!itemData) return null;

    const type = 'slot' in itemData ? 'equipment' : 'resource';
    const totalWeight = itemData.weight * item.quantity;
    const totalValue = (itemData.value || 0) * item.quantity;
    const isEquipmentItem = type === 'equipment';
    const isConsumableItem = type === 'resource' && isConsumable(itemData);
    const canStack = 'stackable' in itemData ? itemData.stackable : true;
    const maxStackSize = 'maxStackSize' in itemData ? itemData.maxStackSize || 999 : 999;

    return {
      item,
      itemData,
      type,
      totalWeight,
      totalValue,
      isConsumable: isConsumableItem,
      isEquipment: isEquipmentItem,
      canStack,
      maxStackSize
    };
  }

  // Process inventory items into enhanced format
  processInventoryItems(items: InventoryItem[]): EnhancedInventoryItem[] {
    return items
      .map(item => this.createEnhancedItem(item))
      .filter(Boolean) as EnhancedInventoryItem[];
  }

  // Calculate inventory statistics
  calculateInventoryStats(items: EnhancedInventoryItem[]): InventoryStats {
    const stats: InventoryStats = {
      totalItems: 0,
      totalWeight: 0,
      totalValue: 0,
      uniqueItems: items.length,
      consumableItems: 0,
      equipmentItems: 0,
      resourceItems: 0
    };

    items.forEach(enhancedItem => {
      stats.totalItems += enhancedItem.item.quantity;
      stats.totalWeight += enhancedItem.totalWeight;
      stats.totalValue += enhancedItem.totalValue;

      if (enhancedItem.isConsumable) {
        stats.consumableItems++;
      } else if (enhancedItem.isEquipment) {
        stats.equipmentItems++;
      } else {
        stats.resourceItems++;
      }
    });

    return stats;
  }

  // Check inventory constraints
  checkInventoryConstraints(
    items: EnhancedInventoryItem[], 
    player: Player
  ): InventoryConstraints {
    const stats = this.calculateInventoryStats(items);
    
    return {
      maxWeight: player.maxInventoryWeight,
      maxSlots: 36, // Fixed inventory slots
      currentWeight: stats.totalWeight,
      currentSlots: stats.uniqueItems
    };
  }

  // Validate item addition to inventory
  canAddToInventory(
    currentItems: EnhancedInventoryItem[],
    newItemId: string,
    quantity: number,
    player: Player
  ): InventoryOperationResult {
    const itemData = ItemFinder.getItemById(newItemId);
    if (!itemData) {
      return { success: false, message: "Item não encontrado", error: "ITEM_NOT_FOUND" };
    }

    const newItemWeight = itemData.weight * quantity;
    const constraints = this.checkInventoryConstraints(currentItems, player);

    // Check weight limit
    if (constraints.currentWeight + newItemWeight > constraints.maxWeight) {
      return { 
        success: false, 
        message: "Peso máximo do inventário excedido", 
        error: "WEIGHT_LIMIT_EXCEEDED" 
      };
    }

    // Check if item can stack with existing items
    const existingItem = currentItems.find(item => 
      item.item.resourceId === newItemId && item.canStack
    );

    if (existingItem) {
      const newTotalQuantity = existingItem.item.quantity + quantity;
      if (newTotalQuantity > existingItem.maxStackSize) {
        return { 
          success: false, 
          message: `Limite de empilhamento excedido (máx: ${existingItem.maxStackSize})`, 
          error: "STACK_LIMIT_EXCEEDED" 
        };
      }
    } else {
      // Check slot limit for new items
      if (constraints.currentSlots >= constraints.maxSlots) {
        return { 
          success: false, 
          message: "Inventário cheio", 
          error: "INVENTORY_FULL" 
        };
      }
    }

    return { success: true, message: "Item pode ser adicionado" };
  }

  // Filter and search functionality
  filterItems(
    items: EnhancedInventoryItem[],
    filters: {
      search?: string;
      type?: 'all' | 'resource' | 'equipment';
      rarity?: 'all' | 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
      consumableOnly?: boolean;
    }
  ): EnhancedInventoryItem[] {
    let filtered = [...items];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(item => 
        item.itemData.name.toLowerCase().includes(searchLower)
      );
    }

    // Type filter
    if (filters.type && filters.type !== 'all') {
      filtered = filtered.filter(item => item.type === filters.type);
    }

    // Rarity filter
    if (filters.rarity && filters.rarity !== 'all') {
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

    return filtered;
  }

  // Sort functionality
  sortItems(
    items: EnhancedInventoryItem[],
    sortBy: 'name' | 'quantity' | 'weight' | 'value' | 'type',
    order: 'asc' | 'desc' = 'asc'
  ): EnhancedInventoryItem[] {
    const sorted = [...items].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'name':
          comparison = a.itemData.name.localeCompare(b.itemData.name);
          break;
        case 'quantity':
          comparison = a.item.quantity - b.item.quantity;
          break;
        case 'weight':
          comparison = a.totalWeight - b.totalWeight;
          break;
        case 'value':
          comparison = a.totalValue - b.totalValue;
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
      }

      return order === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }

  // Batch operations
  validateBatchOperation(
    items: EnhancedInventoryItem[],
    operations: Array<{ itemId: string; quantity: number; operation: 'add' | 'remove' }>,
    player: Player
  ): InventoryOperationResult {
    let weightDelta = 0;
    const itemChanges = new Map<string, number>();

    for (const op of operations) {
      const itemData = ItemFinder.getItemById(op.itemId);
      if (!itemData) {
        return { 
          success: false, 
          message: `Item não encontrado: ${op.itemId}`, 
          error: "ITEM_NOT_FOUND" 
        };
      }

      const weightChange = itemData.weight * op.quantity;
      weightDelta += op.operation === 'add' ? weightChange : -weightChange;

      const currentChange = itemChanges.get(op.itemId) || 0;
      itemChanges.set(op.itemId, currentChange + (op.operation === 'add' ? op.quantity : -op.quantity));
    }

    // Check final weight
    const constraints = this.checkInventoryConstraints(items, player);
    if (constraints.currentWeight + weightDelta > constraints.maxWeight) {
      return { 
        success: false, 
        message: "Operação excederia o limite de peso", 
        error: "WEIGHT_LIMIT_EXCEEDED" 
      };
    }

    // Check individual item constraints
    for (const [itemId, totalChange] of itemChanges) {
      const existingItem = items.find(item => item.item.resourceId === itemId);
      
      if (existingItem) {
        const newQuantity = existingItem.item.quantity + totalChange;
        if (newQuantity < 0) {
          return { 
            success: false, 
            message: `Quantidade insuficiente para: ${existingItem.itemData.name}`, 
            error: "INSUFFICIENT_QUANTITY" 
          };
        }
        if (newQuantity > existingItem.maxStackSize) {
          return { 
            success: false, 
            message: `Limite de empilhamento excedido para: ${existingItem.itemData.name}`, 
            error: "STACK_LIMIT_EXCEEDED" 
          };
        }
      } else if (totalChange > 0) {
        // New item being added
        if (constraints.currentSlots >= constraints.maxSlots) {
          return { 
            success: false, 
            message: "Inventário cheio", 
            error: "INVENTORY_FULL" 
          };
        }
      }
    }

    return { success: true, message: "Operação em lote válida" };
  }
}

// Export singleton instance
export const inventoryManager = InventoryManager.getInstance();

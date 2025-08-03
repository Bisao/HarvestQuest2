import type { Resource, Equipment, InventoryItem } from '../types';
import type { EnhancedInventoryItem, InventoryStats } from '../types/inventory-types';
import { ItemFinder } from './item-finder';
import { isConsumable } from './consumable-utils';

export class InventoryManager {
  private resources: Resource[];
  private equipment: Equipment[];

  constructor(resources: Resource[], equipment: Equipment[]) {
    this.resources = resources;
    this.equipment = equipment;
  }

  /**
   * Process raw inventory items into enhanced inventory items with additional metadata
   */
  processInventoryItems(inventoryItems: InventoryItem[]): EnhancedInventoryItem[] {
    return inventoryItems.map(item => this.enhanceInventoryItem(item)).filter(Boolean) as EnhancedInventoryItem[];
  }

  /**
   * Enhance a single inventory item with metadata
   */
  private enhanceInventoryItem(item: InventoryItem): EnhancedInventoryItem | null {
    const itemData = ItemFinder.getItemById(item.resourceId);
    
    if (!itemData) {
      console.warn(`Item not found for ID: ${item.resourceId}`);
      return null;
    }

    const type = this.equipment.some(eq => eq.id === item.resourceId) ? 'equipment' : 'resource';
    const weight = itemData.weight || 0;
    const value = itemData.value || 0;

    return {
      item,
      itemData,
      type,
      totalWeight: weight * item.quantity,
      totalValue: value * item.quantity,
      isConsumable: isConsumable(itemData),
      isEquipment: type === 'equipment',
      canStack: type === 'resource', // Resources can stack, equipment typically cannot
      maxStackSize: type === 'resource' ? 999 : 1,
      rarity: 'rarity' in itemData ? itemData.rarity : undefined
    };
  }

  /**
   * Calculate inventory statistics
   */
  calculateInventoryStats(enhancedItems: EnhancedInventoryItem[]): InventoryStats {
    return {
      totalItems: enhancedItems.reduce((sum, item) => sum + item.item.quantity, 0),
      totalWeight: enhancedItems.reduce((sum, item) => sum + item.totalWeight, 0),
      totalValue: enhancedItems.reduce((sum, item) => sum + item.totalValue, 0),
      uniqueItems: enhancedItems.length
    };
  }

  /**
   * Filter inventory items based on search and type filters
   */
  filterInventoryItems(
    enhancedItems: EnhancedInventoryItem[],
    searchTerm: string = '',
    typeFilter: 'all' | 'resources' | 'equipment' | 'consumables' = 'all'
  ): EnhancedInventoryItem[] {
    let filtered = enhancedItems;

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(item => {
        const nameMatch = item.itemData.name.toLowerCase().includes(searchLower);
        const descMatch = ('description' in item.itemData && typeof item.itemData.description === 'string') 
          ? item.itemData.description.toLowerCase().includes(searchLower) 
          : false;
        return nameMatch || descMatch;
      });
    }

    // Apply type filter
    switch (typeFilter) {
      case 'resources':
        filtered = filtered.filter(item => item.type === 'resource');
        break;
      case 'equipment':
        filtered = filtered.filter(item => item.type === 'equipment');
        break;
      case 'consumables':
        filtered = filtered.filter(item => item.isConsumable);
        break;
      // 'all' case - no additional filtering
    }

    return filtered;
  }

  /**
   * Sort inventory items by specified criteria
   */
  sortInventoryItems(
    enhancedItems: EnhancedInventoryItem[],
    sortBy: 'name' | 'quantity' | 'weight' | 'value' = 'name',
    sortOrder: 'asc' | 'desc' = 'asc'
  ): EnhancedInventoryItem[] {
    const sortedItems = [...enhancedItems];

    sortedItems.sort((a, b) => {
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
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return sortedItems;
  }

  /**
   * Find items that can be consumed (food/drink)
   */
  getConsumableItems(enhancedItems: EnhancedInventoryItem[]): EnhancedInventoryItem[] {
    return enhancedItems.filter(item => item.isConsumable);
  }

  /**
   * Find equipment items that can be equipped
   */
  getEquipmentItems(enhancedItems: EnhancedInventoryItem[]): EnhancedInventoryItem[] {
    return enhancedItems.filter(item => item.isEquipment);
  }

  /**
   * Get items suitable for a specific equipment slot
   */
  getItemsForSlot(enhancedItems: EnhancedInventoryItem[], slot: string): EnhancedInventoryItem[] {
    return enhancedItems.filter(item => {
      if (item.type !== 'equipment') return false;
      const equipment = item.itemData as Equipment;
      return equipment.slot === slot;
    });
  }

  /**
   * Check if inventory has sufficient space for new items
   */
  checkInventorySpace(
    enhancedItems: EnhancedInventoryItem[],
    maxWeight: number,
    newItemWeight: number
  ): boolean {
    const currentWeight = this.calculateInventoryStats(enhancedItems).totalWeight;
    return currentWeight + newItemWeight <= maxWeight;
  }

  /**
   * Get weight percentage used
   */
  getWeightPercentage(enhancedItems: EnhancedInventoryItem[], maxWeight: number): number {
    const currentWeight = this.calculateInventoryStats(enhancedItems).totalWeight;
    return maxWeight > 0 ? (currentWeight / maxWeight) * 100 : 0;
  }
}
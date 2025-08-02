
/**
 * INVENTORY MANAGEMENT HOOK
 * React hook for managing inventory state and operations
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { inventoryManager } from '@shared/utils/inventory-manager';
import { useGameData } from './useGamePolling';
import type { 
  InventoryItem, 
  EnhancedInventoryItem, 
  InventoryStats,
  InventoryConstraints 
} from '@shared/types/inventory-types';
import type { Resource, Equipment, Player } from '@shared/types';

interface InventoryFilters {
  search: string;
  type: 'all' | 'resource' | 'equipment';
  rarity: 'all' | 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  consumableOnly: boolean;
}

interface InventorySorting {
  field: 'name' | 'quantity' | 'weight' | 'value' | 'type';
  order: 'asc' | 'desc';
}

export function useInventoryManager(
  playerId: string,
  resources: Resource[],
  equipment: Equipment[],
  player: Player
) {
  // Initialize inventory manager
  useEffect(() => {
    inventoryManager.initialize(resources, equipment);
  }, [resources, equipment]);

  // Get raw inventory data
  const { inventory: rawInventory = [], isLoading } = useGameData({ playerId });

  // Filter and sorting state
  const [filters, setFilters] = useState<InventoryFilters>({
    search: '',
    type: 'all',
    rarity: 'all',
    consumableOnly: false
  });

  const [sorting, setSorting] = useState<InventorySorting>({
    field: 'name',
    order: 'asc'
  });

  // Process inventory items into enhanced format
  const enhancedInventory = useMemo(() => {
    return inventoryManager.processInventoryItems(rawInventory);
  }, [rawInventory]);

  // Apply filters and sorting
  const processedInventory = useMemo(() => {
    let filtered = inventoryManager.filterItems(enhancedInventory, filters);
    return inventoryManager.sortItems(filtered, sorting.field, sorting.order);
  }, [enhancedInventory, filters, sorting]);

  // Calculate statistics
  const inventoryStats = useMemo(() => {
    return inventoryManager.calculateInventoryStats(enhancedInventory);
  }, [enhancedInventory]);

  // Calculate constraints
  const inventoryConstraints = useMemo(() => {
    return inventoryManager.checkInventoryConstraints(enhancedInventory, player);
  }, [enhancedInventory, player]);

  // Filter functions
  const updateFilters = useCallback((newFilters: Partial<InventoryFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      search: '',
      type: 'all',
      rarity: 'all',
      consumableOnly: false
    });
  }, []);

  // Sorting functions
  const updateSorting = useCallback((field: InventorySorting['field']) => {
    setSorting(prev => ({
      field,
      order: prev.field === field && prev.order === 'asc' ? 'desc' : 'asc'
    }));
  }, []);

  // Utility functions
  const findItemById = useCallback((itemId: string) => {
    return enhancedInventory.find(item => item.item.id === itemId);
  }, [enhancedInventory]);

  const findItemsByResourceId = useCallback((resourceId: string) => {
    return enhancedInventory.filter(item => item.item.resourceId === resourceId);
  }, [enhancedInventory]);

  const getConsumableItems = useCallback(() => {
    return enhancedInventory.filter(item => item.isConsumable);
  }, [enhancedInventory]);

  const getEquipmentItems = useCallback(() => {
    return enhancedInventory.filter(item => item.isEquipment);
  }, [enhancedInventory]);

  // Validation functions
  const canAddItem = useCallback((itemId: string, quantity: number) => {
    return inventoryManager.canAddToInventory(enhancedInventory, itemId, quantity, player);
  }, [enhancedInventory, player]);

  // Quick stats
  const quickStats = useMemo(() => ({
    isEmpty: enhancedInventory.length === 0,
    isFull: inventoryConstraints.currentSlots >= inventoryConstraints.maxSlots,
    isOverweight: inventoryConstraints.currentWeight > inventoryConstraints.maxWeight,
    weightPercentage: Math.round((inventoryConstraints.currentWeight / inventoryConstraints.maxWeight) * 100),
    slotsUsed: inventoryConstraints.currentSlots,
    slotsTotal: inventoryConstraints.maxSlots,
    hasConsumables: inventoryStats.consumableItems > 0,
    hasEquipment: inventoryStats.equipmentItems > 0
  }), [inventoryConstraints, inventoryStats, enhancedInventory.length]);

  return {
    // Data
    inventory: processedInventory,
    rawInventory,
    enhancedInventory,
    isLoading,

    // Statistics
    stats: inventoryStats,
    constraints: inventoryConstraints,
    quickStats,

    // Filters and sorting
    filters,
    sorting,
    updateFilters,
    clearFilters,
    updateSorting,

    // Utility functions
    findItemById,
    findItemsByResourceId,
    getConsumableItems,
    getEquipmentItems,
    canAddItem,

    // State management
    hasActiveFilters: filters.search !== '' || filters.type !== 'all' || filters.rarity !== 'all' || filters.consumableOnly,
    filteredCount: processedInventory.length,
    totalCount: enhancedInventory.length
  };
}

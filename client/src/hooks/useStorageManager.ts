
/**
 * STORAGE MANAGEMENT HOOK
 * React hook for storage operations with real-time updates
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { storageManager } from '@shared/utils/storage-manager';
import { useGameData } from './useGamePolling';
import type { 
  EnhancedStorageItem,
  StorageStats,
  StorageConstraints,
  StorageFilters,
  StorageSorting
} from '@shared/types/storage-types';
import type { Resource, Equipment, Player } from '@shared/types';

interface UseStorageManagerProps {
  playerId: string;
  resources: Resource[];
  equipment: Equipment[];
  player: Player;
}

interface UseStorageManagerReturn {
  // Data
  storageItems: EnhancedStorageItem[];
  filteredItems: EnhancedStorageItem[];
  rawItems: any[];
  isLoading: boolean;

  // Statistics and constraints
  stats: StorageStats;
  constraints: StorageConstraints;

  // Filters and sorting
  filters: StorageFilters;
  sorting: StorageSorting;
  updateFilters: (filters: Partial<StorageFilters>) => void;
  clearFilters: () => void;
  updateSorting: (field: StorageSorting['field']) => void;

  // Utility functions
  findItemById: (itemId: string) => EnhancedStorageItem | undefined;
  findItemsByResourceId: (resourceId: string) => EnhancedStorageItem[];
  getWithdrawableItems: () => EnhancedStorageItem[];
  getEquipmentItems: () => EnhancedStorageItem[];
  getConsumableItems: () => EnhancedStorageItem[];

  // State information
  hasActiveFilters: boolean;
  filteredCount: number;
  totalCount: number;
  canAddItems: boolean;
  isNearCapacity: boolean;
}

export function useStorageManager({
  playerId,
  resources,
  equipment,
  player
}: UseStorageManagerProps): UseStorageManagerReturn {
  
  // Initialize storage manager
  useEffect(() => {
    storageManager.initialize(resources, equipment);
  }, [resources, equipment]);

  // Get raw storage data
  const { storage: rawItems = [], isLoading } = useGameData({ playerId });

  // Filter and sorting state
  const [filters, setFilters] = useState<StorageFilters>({
    search: '',
    type: 'all',
    rarity: 'all',
    consumableOnly: false,
    equipmentOnly: false
  });

  const [sorting, setSorting] = useState<StorageSorting>({
    field: 'name',
    order: 'asc'
  });

  // Process storage items into enhanced format
  const storageItems = useMemo(() => {
    return storageManager.processStorageItems(rawItems);
  }, [rawItems]);

  // Apply filters and sorting
  const filteredItems = useMemo(() => {
    let filtered = storageManager.filterStorageItems(storageItems, filters);
    return storageManager.sortStorageItems(filtered, sorting);
  }, [storageItems, filters, sorting]);

  // Calculate statistics
  const stats = useMemo(() => {
    return storageManager.calculateStorageStats(storageItems);
  }, [storageItems]);

  // Calculate constraints
  const constraints = useMemo(() => {
    return storageManager.checkStorageConstraints(storageItems);
  }, [storageItems]);

  // Filter functions
  const updateFilters = useCallback((newFilters: Partial<StorageFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      search: '',
      type: 'all',
      rarity: 'all',
      consumableOnly: false,
      equipmentOnly: false
    });
  }, []);

  // Sorting functions
  const updateSorting = useCallback((field: StorageSorting['field']) => {
    setSorting(prev => ({
      field,
      order: prev.field === field && prev.order === 'asc' ? 'desc' : 'asc'
    }));
  }, []);

  // Utility functions
  const findItemById = useCallback((itemId: string) => {
    return storageManager.findStorageItemById(storageItems, itemId);
  }, [storageItems]);

  const findItemsByResourceId = useCallback((resourceId: string) => {
    return storageManager.findStorageItemsByResourceId(storageItems, resourceId);
  }, [storageItems]);

  const getWithdrawableItems = useCallback(() => {
    return storageManager.getWithdrawableItems(storageItems);
  }, [storageItems]);

  const getEquipmentItems = useCallback(() => {
    return storageManager.getEquipmentItems(storageItems);
  }, [storageItems]);

  const getConsumableItems = useCallback(() => {
    return storageManager.getConsumableItems(storageItems);
  }, [storageItems]);

  // Computed state information
  const hasActiveFilters = useMemo(() => {
    return filters.search !== '' || 
           filters.type !== 'all' || 
           filters.rarity !== 'all' || 
           filters.consumableOnly || 
           filters.equipmentOnly;
  }, [filters]);

  const canAddItems = constraints.canAddItems;
  const isNearCapacity = stats.storageCapacity.percentage > 80;

  return {
    // Data
    storageItems,
    filteredItems,
    rawItems,
    isLoading,

    // Statistics and constraints
    stats,
    constraints,

    // Filters and sorting
    filters,
    sorting,
    updateFilters,
    clearFilters,
    updateSorting,

    // Utility functions
    findItemById,
    findItemsByResourceId,
    getWithdrawableItems,
    getEquipmentItems,
    getConsumableItems,

    // State information
    hasActiveFilters,
    filteredCount: filteredItems.length,
    totalCount: storageItems.length,
    canAddItems,
    isNearCapacity
  };
}

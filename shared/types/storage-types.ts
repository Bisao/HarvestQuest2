
/**
 * STORAGE SYSTEM TYPES
 * Unified type definitions for the storage system
 */

import type { Resource, Equipment, Player } from './index';

// Core storage item interface
export interface StorageItem {
  id: string;
  playerId: string;
  resourceId: string;
  quantity: number;
  itemType: 'resource' | 'equipment';
  storageSlot?: number;
  createdAt?: number;
  lastModified?: number;
}

// Enhanced storage item with computed properties
export interface EnhancedStorageItem extends StorageItem {
  itemData: (Resource | Equipment) & { type: 'resource' | 'equipment' };
  totalValue: number;
  totalWeight: number;
  canWithdraw: boolean;
  isConsumable: boolean;
  isEquipment: boolean;
}

// Storage operation interfaces
export interface StorageOperation {
  itemId: string;
  quantity: number;
  operation: 'add' | 'remove' | 'transfer';
  sourceLocation?: 'inventory' | 'storage';
  targetLocation?: 'inventory' | 'storage';
}

export interface StorageOperationResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
  affectedItems?: string[];
}

// Storage statistics
export interface StorageStats {
  totalItems: number;
  totalValue: number;
  totalWeight: number;
  uniqueTypes: number;
  resourceItems: number;
  equipmentItems: number;
  storageCapacity: {
    used: number;
    max: number;
    percentage: number;
  };
}

// Storage constraints
export interface StorageConstraints {
  maxItems: number;
  maxWeight: number;
  currentItems: number;
  currentWeight: number;
  canAddItems: boolean;
  availableSlots: number;
}

// Storage filters and sorting
export interface StorageFilters {
  search: string;
  type: 'all' | 'resource' | 'equipment';
  rarity: 'all' | 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  consumableOnly: boolean;
  equipmentOnly: boolean;
}

export interface StorageSorting {
  field: 'name' | 'quantity' | 'weight' | 'value' | 'type' | 'createdAt';
  order: 'asc' | 'desc';
}

// Batch operations
export interface BatchStorageOperation {
  playerId: string;
  operations: StorageOperation[];
  validateOnly?: boolean;
}

export interface BatchOperationResult {
  success: boolean;
  message: string;
  results: StorageOperationResult[];
  totalProcessed: number;
  totalFailed: number;
}

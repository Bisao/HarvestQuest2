
/**
 * REFACTORED INVENTORY TYPES
 * Clean, unified types with better separation of concerns
 */

import type { Resource, Equipment } from '@shared/types';

// Core inventory item interface
export interface InventoryItem {
  id: string;
  playerId: string;
  resourceId: string;
  quantity: number;
  itemType: 'resource' | 'equipment';
  createdAt?: number;
  lastModified?: number;
}

// Storage item interface
export interface StorageItem extends InventoryItem {
  storageSlot?: number;
}

// Enhanced item with computed properties
export interface EnhancedInventoryItem {
  item: InventoryItem;
  itemData: Resource | Equipment;
  type: 'resource' | 'equipment';
  totalWeight: number;
  totalValue: number;
  isConsumable: boolean;
  isEquipment: boolean;
  canStack: boolean;
  maxStackSize: number;
}

// Inventory operation results
export interface InventoryOperationResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

// Inventory constraints
export interface InventoryConstraints {
  maxWeight: number;
  maxSlots: number;
  currentWeight: number;
  currentSlots: number;
}

// Item movement operations
export interface ItemMoveOperation {
  itemId: string;
  sourceLocation: 'inventory' | 'storage' | 'equipment';
  targetLocation: 'inventory' | 'storage' | 'equipment';
  quantity: number;
  slotId?: string;
}

// Inventory statistics
export interface InventoryStats {
  totalItems: number;
  totalWeight: number;
  totalValue: number;
  uniqueItems: number;
  consumableItems: number;
  equipmentItems: number;
  resourceItems: number;
}

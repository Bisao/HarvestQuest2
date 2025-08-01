
/**
 * UNIFIED INVENTORY TYPES
 * Single source of truth for all inventory-related types
 */

import type { Resource, Equipment } from '@shared/types';

// Base item interface for consistency
export interface BaseInventoryItem {
  id: string;
  resourceId: string; // Always use resourceId for consistency
  quantity: number;
  itemType?: 'resource' | 'equipment';
}

// Unified inventory item (replaces all variants)
export interface InventoryItem extends BaseInventoryItem {
  itemType: 'resource' | 'equipment';
}

// Unified storage item (replaces all variants)
export interface StorageItem extends BaseInventoryItem {
  playerId: string;
  itemType: 'resource' | 'equipment';
}

// Enhanced item with data
export interface EnhancedItem<T extends Resource | Equipment = Resource | Equipment> {
  id: string;
  resourceId: string;
  quantity: number;
  itemType: 'resource' | 'equipment';
  itemData: T & { type: 'resource' | 'equipment' };
  totalValue: number;
  totalWeight: number;
}

// Standard item reference for all systems
export interface ItemReference {
  itemId: string;
  type: 'resource' | 'equipment';
  quantity?: number;
}

// Unified item operations interface
export interface ItemOperations {
  getById: (id: string) => (Resource | Equipment) | null;
  getWithType: (id: string) => { item: Resource | Equipment; type: 'resource' | 'equipment' } | null;
  isResource: (id: string) => boolean;
  isEquipment: (id: string) => boolean;
}

// Export all legacy interfaces for backward compatibility
export type { Resource, Equipment } from '@shared/types';

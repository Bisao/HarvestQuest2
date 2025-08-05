import type { Resource, Equipment, InventoryItem } from '../types';

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
  rarity?: string;
}

export interface InventoryStats {
  totalItems: number;
  totalWeight: number;
  totalValue: number;
  uniqueItems: number;
}

export interface InventoryFilters {
  search: string;
  type: 'all' | 'resources' | 'equipment' | 'consumables';
  sortBy: 'name' | 'quantity' | 'weight' | 'value';
  sortOrder: 'asc' | 'desc';
}

export interface EquipmentSlot {
  key: string;
  name: string;
  emoji: string;
  equippedItemId?: string | null;
}

export interface InventoryAction {
  type: 'move_to_storage' | 'consume' | 'equip' | 'unequip' | 'drop';
  itemId: string;
  quantity?: number;
  slot?: string;
}

export interface InventoryActionResult {
  success: boolean;
  message: string;
  error?: string;
}
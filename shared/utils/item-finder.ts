
/**
 * CENTRALIZED ITEM FINDER
 * Single source of truth for finding items by ID
 * Eliminates duplicate getItemById implementations
 */

import type { Resource, Equipment } from '@shared/types';

export class ItemFinder {
  private static resources: Resource[] = [];
  private static equipment: Equipment[] = [];

  static initialize(resources: Resource[], equipment: Equipment[]) {
    ItemFinder.resources = resources;
    ItemFinder.equipment = equipment;
  }

  static getResourceById(id: string): Resource | null {
    return ItemFinder.resources.find(r => r.id === id) || null;
  }

  static getEquipmentById(id: string): Equipment | null {
    return ItemFinder.equipment.find(e => e.id === id) || null;
  }

  static getItemById(id: string): (Resource | Equipment) | null {
    const resource = ItemFinder.getResourceById(id);
    if (resource) return resource;
    
    const equipmentItem = ItemFinder.getEquipmentById(id);
    if (equipmentItem) return equipmentItem;
    
    return null;
  }

  static getItemWithType(id: string): { 
    item: Resource | Equipment; 
    type: 'resource' | 'equipment' 
  } | null {
    const resource = ItemFinder.getResourceById(id);
    if (resource) return { item: resource, type: 'resource' };
    
    const equipmentItem = ItemFinder.getEquipmentById(id);
    if (equipmentItem) return { item: equipmentItem, type: 'equipment' };
    
    return null;
  }

  static isResource(id: string): boolean {
    return !!ItemFinder.getResourceById(id);
  }

  static isEquipment(id: string): boolean {
    return !!ItemFinder.getEquipmentById(id);
  }

  static getAllResources(): Resource[] {
    return [...ItemFinder.resources];
  }

  static getAllEquipment(): Equipment[] {
    return [...ItemFinder.equipment];
  }
}

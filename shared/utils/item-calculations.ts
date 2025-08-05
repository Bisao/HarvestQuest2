// Utility functions for calculating item properties from fundamental attributes
import type { ItemAttributes, RarityLevel } from '../types';

// Rarity multipliers for value calculation
export const RARITY_MULTIPLIERS: Record<RarityLevel, number> = {
  common: 1.0,
  uncommon: 1.5,
  rare: 2.0,
  epic: 3.0,
  legendary: 5.0
};

// Calculate actual weight from attributes
export function calculateWeight(attributes: ItemAttributes): number {
  // Use base weight if available, otherwise calculate from efficiency
  return attributes.baseValue ? Math.round(attributes.baseValue * 0.1) / 10 : 1.0;
}

// Calculate actual value from attributes and rarity
export function calculateValue(attributes: ItemAttributes, rarity: RarityLevel): number {
  const rarityMultiplier = RARITY_MULTIPLIERS[rarity];
  const baseValue = attributes.baseValue || 10;
  return Math.round(baseValue * rarityMultiplier);
}

// Calculate stack limit based on efficiency and durability
export function calculateMaxStack(attributes: ItemAttributes, stackable: boolean = true): number {
  if (!stackable) return 1;
  
  // Items with higher efficiency stack less (they're more valuable/complex)
  const efficiencyFactor = Math.max(1, Math.floor(100 / (attributes.efficiency + 1)));
  const baseFactor = 64;
  
  return Math.min(baseFactor, efficiencyFactor);
}

// Calculate durability loss per use for tools/weapons
export function calculateDurabilityLoss(attributes: ItemAttributes, useType: 'tool' | 'weapon'): number {
  if (attributes.durability <= 0) return 0;
  
  // Base durability loss is 1 point per use
  let baseLoss = 1;
  
  // Higher efficiency items wear out faster
  baseLoss *= (attributes.efficiency / 100 + 0.5);
  
  return Math.round(baseLoss * 10) / 10;
}

// Check if item is consumable (simplified version)
export function isConsumable(item: any): boolean {
  return !!(item.effects && item.effects.length > 0);
}

// Check if item is equipment (simplified version) 
export function isEquipment(item: any): boolean {
  return !!(item.category === 'equipment' || item.slot);
}

// Create default attributes for basic resources
export function createBasicResourceAttributes(baseValue: number = 10): ItemAttributes {
  return {
    durability: 100,
    efficiency: 50,
    rarity: 'common',
    baseValue,
  };
}

// Create default attributes for equipment  
export function createEquipmentAttributes(
  baseValue: number = 50, 
  durability: number = 100,
  efficiency: number = 75
): ItemAttributes {
  return {
    durability,
    efficiency,
    rarity: 'common',
    baseValue,
  };
}
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
  return Math.round(attributes.density * attributes.volume * 10) / 10;
}

// Calculate actual value from attributes and rarity
export function calculateValue(attributes: ItemAttributes, rarity: RarityLevel): number {
  const rarityMultiplier = RARITY_MULTIPLIERS[rarity];
  return Math.round(attributes.baseValue * rarityMultiplier);
}

// Calculate stack limit based on weight and size
export function calculateMaxStack(attributes: ItemAttributes): number {
  if (!attributes.stackable) return 1;
  
  // Heavier/larger items stack less
  const weightFactor = Math.max(1, Math.floor(10 / attributes.volume));
  const baseFactor = attributes.maxStack || 64;
  
  return Math.min(baseFactor, weightFactor);
}

// Calculate durability loss per use for tools/weapons
export function calculateDurabilityLoss(attributes: ItemAttributes, useType: 'tool' | 'weapon'): number {
  if (!attributes.durability) return 0;
  
  // Base durability loss is 1 point per use
  let baseLoss = 1;
  
  // Tools with higher efficiency wear out faster
  if (useType === 'tool' && attributes.toolEfficiency) {
    baseLoss *= (attributes.toolEfficiency / 100 + 0.5);
  }
  
  // Weapons with higher damage wear out faster  
  if (useType === 'weapon' && attributes.weaponDamage) {
    baseLoss *= (attributes.weaponDamage / 50 + 0.5);
  }
  
  return Math.round(baseLoss * 10) / 10;
}

// Check if item is consumable
export function isConsumable(attributes: ItemAttributes): boolean {
  return !!attributes.consumeEffect;
}

// Check if item is equipment
export function isEquipment(attributes: ItemAttributes): boolean {
  return !!(attributes.toolEfficiency || attributes.weaponDamage || attributes.armorProtection);
}

// Create default attributes for basic resources
export function createBasicResourceAttributes(baseValue: number, weight: number = 1): ItemAttributes {
  return {
    stackable: true,
    maxStack: 64,
    baseValue,
    rarityMultiplier: 1.0,
    density: weight,
    volume: 1,
  };
}

// Create default attributes for equipment  
export function createEquipmentAttributes(
  baseValue: number, 
  weight: number, 
  durability: number = 100,
  efficiency?: number
): ItemAttributes {
  return {
    stackable: false,
    baseValue,
    rarityMultiplier: 1.0,
    density: weight,
    volume: 1,
    durability,
    toolEfficiency: efficiency,
  };
}
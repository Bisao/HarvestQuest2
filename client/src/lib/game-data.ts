/**
 * DEPRECATED CLIENT-SIDE GAME DATA
 * 
 * This file contains hardcoded game data that should be removed.
 * All game data should come from the server APIs which use IDs from game-ids.ts
 * 
 * TODO: Remove this file completely once all components use server data
 */

import { RESOURCE_IDS } from '@shared/constants/game-ids';

// Use proper IDs from game-ids.ts
export const BASIC_RESOURCES = [
  { id: RESOURCE_IDS.FIBRA, name: "Fibra", emoji: "🌾", weight: 1, value: 2 },
  { id: RESOURCE_IDS.PEDRA, name: "Pedra", emoji: "🪨", weight: 3, value: 3 },
  { id: RESOURCE_IDS.GRAVETOS, name: "Gravetos", emoji: "🪵", weight: 2, value: 2 },
];

// DEPRECATED: Use server APIs instead
export const resources = [
  {
    id: RESOURCE_IDS.MADEIRA,
    name: "Madeira",
    emoji: "🪵",
    type: "basic",
    category: "material",
    weight: 500,
    value: 2,
    rarity: "common"
  },
  {
    id: RESOURCE_IDS.AGUA_FRESCA,
    name: "Água Fresca",
    emoji: "💧",
    type: "consumable",
    category: "consumable",
    subcategory: "drink",
    weight: 100,
    value: 5,
    rarity: "common",
    attributes: {
      hunger_restore: 0,
      thirst_restore: 10
    }
  },
  {
    id: RESOURCE_IDS.CARNE_ASSADA,
    name: "Carne Assada",
    emoji: "🍖",
    type: "consumable",
    category: "consumable",
    subcategory: "food",
    weight: 250,
    value: 15,
    rarity: "common",
    attributes: {
      hunger_restore: 15,
      thirst_restore: 3
    }
  },
  {
    id: RESOURCE_IDS.COGUMELOS,
    name: "Cogumelos",
    emoji: "🍄",
    type: "consumable",
    category: "consumable",
    subcategory: "food",
    weight: 80,
    value: 3,
    rarity: "common",
    attributes: {
      hunger_restore: 2,
      thirst_restore: 0
    }
  },
  {
    id: RESOURCE_IDS.FRUTAS_SILVESTRES,
    name: "Frutas Silvestres",
    emoji: "🫐",
    type: "consumable",
    category: "consumable",
    subcategory: "food",
    weight: 120,
    value: 4,
    rarity: "common",
    attributes: {
      hunger_restore: 1,
      thirst_restore: 2
    }
  },
  {
    id: RESOURCE_IDS.SUCO_FRUTAS,
    name: "Suco de Frutas",
    emoji: "🧃",
    type: "consumable",
    category: "consumable",
    subcategory: "drink",
    weight: 150,
    value: 8,
    rarity: "common",
    attributes: {
      hunger_restore: 5,
      thirst_restore: 1
    }
  },
];

export const UNIQUE_RESOURCES = {
  forest: { id: RESOURCE_IDS.MADEIRA, name: "Madeira", emoji: "🌳", weight: 5, value: 8 },
  desert: { id: RESOURCE_IDS.AREIA, name: "Areia", emoji: "⏳", weight: 2, value: 5 },
  mountain: { id: RESOURCE_IDS.CRISTAIS, name: "Cristais", emoji: "💎", weight: 1, value: 20 },
  ocean: { id: RESOURCE_IDS.CONCHAS, name: "Conchas", emoji: "🐚", weight: 1, value: 12 },
};

// DEPRECATED: Use server APIs instead
export const BIOMES = [
  {
    id: "forest",
    name: "Floresta",
    emoji: "🌲",
    requiredLevel: 1,
    resources: [...BASIC_RESOURCES, UNIQUE_RESOURCES.forest],
    // Note: Creatures are now managed separately via the creature system
  },
  {
    id: "desert",
    name: "Deserto",
    emoji: "🏜️",
    requiredLevel: 2,
    resources: [...BASIC_RESOURCES, UNIQUE_RESOURCES.desert],
  },
  {
    id: "mountain",
    name: "Montanha",
    emoji: "🏔️",
    requiredLevel: 5,
    resources: [...BASIC_RESOURCES, UNIQUE_RESOURCES.mountain],
  },
  {
    id: "ocean",
    name: "Oceano",
    emoji: "🌊",
    requiredLevel: 8,
    resources: [...BASIC_RESOURCES, UNIQUE_RESOURCES.ocean],
  },
];

// Import creature IDs for referencing creatures
import { CREATURE_IDS } from '@shared/constants/creature-ids';

export const EQUIPMENT = [
  {
    id: "pickaxe",
    name: "Picareta",
    emoji: "⛏️",
    effect: "+20% pedra",
    bonus: { type: "resource_boost", resource: "pedra", multiplier: 1.2 },
  },
  {
    id: "backpack",
    name: "Mochila",
    emoji: "🎒",
    effect: "+15 kg peso",
    bonus: { type: "weight_boost", value: 15 },
  },
  {
    id: "compass",
    name: "Bússola",
    emoji: "🧭",
    effect: "-20% tempo",
    bonus: { type: "time_reduction", multiplier: 0.8 },
  },
];

export const RECIPES = [
  {
    id: "rope",
    name: "Corda",
    emoji: "🧵",
    requiredLevel: 1,
    ingredients: { fibra: 3, pedra: 1 },
    output: { rope: 1 },
  },
  {
    id: "basic_axe",
    name: "Machado Básico",
    emoji: "🪓",
    requiredLevel: 1,
    ingredients: { madeira: 2, pedra: 3 },
    output: { basic_axe: 1 },
  },
  {
    id: "glass",
    name: "Vidro",
    emoji: "🔮",
    requiredLevel: 8,
    ingredients: { areia: 5 },
    output: { glass: 1 },
  },
];
// Game configuration and constants

export const BASIC_RESOURCES = [
  { id: "fibra", name: "Fibra", emoji: "🌾", weight: 1, value: 2 },
  { id: "pedra", name: "Pedra", emoji: "🪨", weight: 3, value: 3 },
  { id: "gravetos", name: "Gravetos", emoji: "🪵", weight: 2, value: 2 },
];

// Add the missing resources export for equipment-tab.tsx
export const resources = [
  {
    id: "res-madeira-001",
    name: "Madeira",
    emoji: "🪵",
    type: "basic",
    category: "material",
    weight: 500,
    value: 2,
    rarity: "common"
  },
  // Legacy consumable IDs for compatibility
  {
    id: "res-8bd33b18-a241-4859-ae9f-870fab5673d0",
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
    id: "res-5e9d8c7a-3f2b-4e61-8a90-1c4b7e5f9d23",
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
    id: "res-2a8f5c1e-9b7d-4a63-8e52-9c1a6f8e4b37",
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
    id: "res-a1f7c9e5-3b8d-4e09-9a20-2c8e6f9b5de8",
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
    id: "res-f7c9a1e5-8d3b-4e08-9a19-6c2e8f5b9df9",
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
  forest: { id: "madeira", name: "Madeira", emoji: "🌳", weight: 5, value: 8 },
  desert: { id: "areia", name: "Areia", emoji: "⏳", weight: 2, value: 5 },
  mountain: { id: "cristais", name: "Cristais", emoji: "💎", weight: 1, value: 20 },
  ocean: { id: "conchas", name: "Conchas", emoji: "🐚", weight: 1, value: 12 },
};

export const BIOMES = [
  {
    id: "forest",
    name: "Floresta",
    emoji: "🌲",
    requiredLevel: 1,
    resources: [...BASIC_RESOURCES, UNIQUE_RESOURCES.forest],
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
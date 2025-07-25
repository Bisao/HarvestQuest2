// Game configuration and constants

export const BASIC_RESOURCES = [
  { id: "fibra", name: "Fibra", emoji: "🌾", weight: 1, value: 2 },
  { id: "pedra", name: "Pedra", emoji: "🪨", weight: 3, value: 3 },
  { id: "gravetos", name: "Gravetos", emoji: "🪵", weight: 2, value: 2 },
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
    requiredLevel: 3,
    resources: [...BASIC_RESOURCES, UNIQUE_RESOURCES.desert],
  },
  {
    id: "mountain",
    name: "Montanha",
    emoji: "🏔️",
    requiredLevel: 8,
    resources: [...BASIC_RESOURCES, UNIQUE_RESOURCES.mountain],
  },
  {
    id: "ocean",
    name: "Oceano",
    emoji: "🌊",
    requiredLevel: 12,
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

// Resource data management module
import type { InsertResource } from "@shared/schema";

export const BASIC_RESOURCES: InsertResource[] = [
  { name: "Fibra", emoji: "🌾", weight: 1, value: 2, type: "basic", rarity: "common", requiredTool: null },
  { name: "Pedra", emoji: "🪨", weight: 3, value: 3, type: "basic", rarity: "common", requiredTool: "pickaxe" },
  { name: "Gravetos", emoji: "🪵", weight: 2, value: 2, type: "basic", rarity: "common", requiredTool: null },
];

export const UNIQUE_RESOURCES: InsertResource[] = [
  { name: "Madeira", emoji: "🌳", weight: 5, value: 8, type: "unique", rarity: "common", requiredTool: "axe" },
  { name: "Areia", emoji: "⏳", weight: 2, value: 5, type: "unique", rarity: "common", requiredTool: "shovel" },
  { name: "Cristais", emoji: "💎", weight: 1, value: 20, type: "unique", rarity: "rare", requiredTool: "pickaxe" },
  { name: "Conchas", emoji: "🐚", weight: 1, value: 12, type: "unique", rarity: "uncommon", requiredTool: null },
];

// Novos recursos para caça e pesca na floresta
export const ANIMAL_RESOURCES: InsertResource[] = [
  { name: "Coelho", emoji: "🐰", weight: 3, value: 15, type: "unique", rarity: "common", requiredTool: "weapon" },
  { name: "Veado", emoji: "🦌", weight: 8, value: 35, type: "unique", rarity: "uncommon", requiredTool: "weapon" },
  { name: "Javali", emoji: "🐗", weight: 12, value: 50, type: "unique", rarity: "rare", requiredTool: "weapon" },
  { name: "Peixe Pequeno", emoji: "🐟", weight: 1, value: 8, type: "unique", rarity: "common", requiredTool: "fishing_rod" },
  { name: "Peixe Grande", emoji: "🐠", weight: 3, value: 18, type: "unique", rarity: "uncommon", requiredTool: "fishing_rod" },
  { name: "Salmão", emoji: "🍣", weight: 4, value: 25, type: "unique", rarity: "rare", requiredTool: "fishing_rod" },
  { name: "Cogumelos", emoji: "🍄", weight: 1, value: 6, type: "unique", rarity: "common", requiredTool: null },
  { name: "Frutas Silvestres", emoji: "🫐", weight: 1, value: 4, type: "unique", rarity: "common", requiredTool: null },
];

export const ALL_RESOURCES = [...BASIC_RESOURCES, ...UNIQUE_RESOURCES, ...ANIMAL_RESOURCES];

// Resource categories for better organization
export const RESOURCE_CATEGORIES = {
  BASIC: "basic",
  FOREST_UNIQUE: "forest_unique",
  ANIMALS: "animals",
  FISH: "fish",
  PLANTS: "plants",
} as const;

export function getResourcesByCategory(category: string, resources: any[]): any[] {
  switch (category) {
    case RESOURCE_CATEGORIES.BASIC:
      return resources.filter(r => BASIC_RESOURCES.some(br => br.name === r.name));
    case RESOURCE_CATEGORIES.ANIMALS:
      return resources.filter(r => ["Coelho", "Veado", "Javali"].includes(r.name));
    case RESOURCE_CATEGORIES.FISH:
      return resources.filter(r => ["Peixe Pequeno", "Peixe Grande", "Salmão"].includes(r.name));
    case RESOURCE_CATEGORIES.PLANTS:
      return resources.filter(r => ["Cogumelos", "Frutas Silvestres", "Fibra"].includes(r.name));
    default:
      return resources;
  }
}
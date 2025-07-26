// Resource data management module
import type { InsertResource } from "@shared/schema";

export const BASIC_RESOURCES: InsertResource[] = [
  { name: "Fibra", emoji: "🌾", weight: 1, value: 2, type: "basic", rarity: "common", requiredTool: null, experienceValue: 1 },
  { name: "Pedra", emoji: "🪨", weight: 3, value: 3, type: "basic", rarity: "common", requiredTool: "pickaxe", experienceValue: 2 },
  { name: "Pedras Soltas", emoji: "🗿", weight: 1, value: 1, type: "basic", rarity: "common", requiredTool: null, experienceValue: 1 },
  { name: "Gravetos", emoji: "🪵", weight: 2, value: 2, type: "basic", rarity: "common", requiredTool: null, experienceValue: 1 },
  { name: "Água Fresca", emoji: "💧", weight: 1, value: 1, type: "basic", rarity: "common", requiredTool: "bucket", experienceValue: 1 },
  { name: "Bambu", emoji: "🎋", weight: 2, value: 4, type: "basic", rarity: "common", requiredTool: null, experienceValue: 2 },
  { name: "Madeira", emoji: "🪵", weight: 3, value: 5, type: "basic", rarity: "common", requiredTool: "axe", experienceValue: 6 },
  { name: "Argila", emoji: "🧱", weight: 2, value: 3, type: "basic", rarity: "common", requiredTool: null, experienceValue: 2 },
  { name: "Ferro Fundido", emoji: "🔩", weight: 4, value: 15, type: "basic", rarity: "uncommon", requiredTool: "pickaxe", experienceValue: 5 },
  { name: "Couro", emoji: "🦫", weight: 2, value: 8, type: "basic", rarity: "common", requiredTool: "knife", experienceValue: 3 },
  { name: "Carne", emoji: "🥩", weight: 2, value: 12, type: "basic", rarity: "common", requiredTool: null, experienceValue: 4 },
  { name: "Ossos", emoji: "🦴", weight: 1, value: 5, type: "basic", rarity: "common", requiredTool: null, experienceValue: 2 },
  { name: "Pelo", emoji: "🧶", weight: 1, value: 3, type: "basic", rarity: "common", requiredTool: null, experienceValue: 1 },
  { name: "Barbante", emoji: "🧵", weight: 0.1, value: 1, type: "basic", rarity: "common", requiredTool: null, experienceValue: 1 },
];

export const UNIQUE_RESOURCES: InsertResource[] = [
  { name: "Madeira", emoji: "🌳", weight: 5, value: 8, type: "unique", rarity: "common", requiredTool: "axe", experienceValue: 3 },
  { name: "Areia", emoji: "⏳", weight: 2, value: 5, type: "unique", rarity: "common", requiredTool: "shovel", experienceValue: 2 },
  { name: "Cristais", emoji: "💎", weight: 1, value: 20, type: "unique", rarity: "rare", requiredTool: "pickaxe", experienceValue: 10 },
  { name: "Conchas", emoji: "🐚", weight: 1, value: 12, type: "unique", rarity: "uncommon", requiredTool: null, experienceValue: 4 },
];

// Novos recursos de comida crafteados
export const FOOD_RESOURCES: InsertResource[] = [
  { name: "Suco de Frutas", emoji: "🧃", weight: 1, value: 5, type: "food", rarity: "common", requiredTool: null, experienceValue: 2 },
  { name: "Cogumelos Assados", emoji: "🍄‍🟫", weight: 1, value: 6, type: "food", rarity: "common", requiredTool: null, experienceValue: 3 },
  { name: "Peixe Grelhado", emoji: "🐟", weight: 2, value: 12, type: "food", rarity: "common", requiredTool: null, experienceValue: 4 },
  { name: "Carne Assada", emoji: "🍖", weight: 2, value: 15, type: "food", rarity: "common", requiredTool: null, experienceValue: 5 },
  { name: "Ensopado de Carne", emoji: "🍲", weight: 3, value: 25, type: "food", rarity: "uncommon", requiredTool: null, experienceValue: 8 },
];

// Novos recursos para caça e pesca na floresta
export const ANIMAL_RESOURCES: InsertResource[] = [
  { name: "Coelho", emoji: "🐰", weight: 3, value: 15, type: "unique", rarity: "common", requiredTool: "weapon_and_knife", experienceValue: 5 },
  { name: "Veado", emoji: "🦌", weight: 8, value: 35, type: "unique", rarity: "uncommon", requiredTool: "weapon_and_knife", experienceValue: 8 },
  { name: "Javali", emoji: "🐗", weight: 12, value: 50, type: "unique", rarity: "rare", requiredTool: "weapon_and_knife", experienceValue: 12 },
  { name: "Peixe Pequeno", emoji: "🐟", weight: 1, value: 8, type: "unique", rarity: "common", requiredTool: "fishing_rod", experienceValue: 2 },
  { name: "Peixe Grande", emoji: "🐠", weight: 3, value: 18, type: "unique", rarity: "uncommon", requiredTool: "fishing_rod", experienceValue: 4 },
  { name: "Salmão", emoji: "🍣", weight: 4, value: 25, type: "unique", rarity: "rare", requiredTool: "fishing_rod", experienceValue: 6 },
  { name: "Cogumelos", emoji: "🍄", weight: 1, value: 6, type: "unique", rarity: "common", requiredTool: null, experienceValue: 2 },
  { name: "Frutas Silvestres", emoji: "🫐", weight: 1, value: 4, type: "unique", rarity: "common", requiredTool: null, experienceValue: 1 },
];

export const ALL_RESOURCES = [...BASIC_RESOURCES, ...UNIQUE_RESOURCES, ...ANIMAL_RESOURCES, ...FOOD_RESOURCES];

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
      return resources.filter(r => 
        ["Fibra", "Pedra", "Pedras Soltas", "Gravetos", "Água Fresca", "Bambu", "Madeira", "Argila", "Ferro Fundido", "Couro", "Carne", "Ossos", "Pelo", "Barbante"].includes(r.name)
      );
    case RESOURCE_CATEGORIES.ANIMALS:
      return resources.filter(r => ["Coelho", "Veado", "Javali"].includes(r.name));
    case RESOURCE_CATEGORIES.FISH:
      return resources.filter(r => ["Peixe Pequeno", "Peixe Grande", "Salmão"].includes(r.name));
    case RESOURCE_CATEGORIES.PLANTS:
      return resources.filter(r => ["Cogumelos", "Frutas Silvestres"].includes(r.name));
    default:
      return resources;
  }
}
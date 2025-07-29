// Resource data management module
import type { InsertResource } from "@shared/types";
import { RESOURCE_IDS } from "@shared/constants/game-ids";

export function createResourcesWithIds(): InsertResource[] {
  return [
    // Basic resources
    { id: RESOURCE_IDS.FIBRA, name: "Fibra", emoji: "🌾", weight: 1, value: 2, type: "basic", rarity: "common", requiredTool: null, experienceValue: 1 },
    { id: RESOURCE_IDS.PEDRA, name: "Pedra", emoji: "🪨", weight: 3, value: 3, type: "basic", rarity: "common", requiredTool: "pickaxe", experienceValue: 2 },
    { id: RESOURCE_IDS.PEDRAS_SOLTAS, name: "Pedras Soltas", emoji: "🗿", weight: 1, value: 1, type: "basic", rarity: "common", requiredTool: null, experienceValue: 1 },
    { id: RESOURCE_IDS.GRAVETOS, name: "Gravetos", emoji: "🪵", weight: 2, value: 2, type: "basic", rarity: "common", requiredTool: null, experienceValue: 1 },
    { id: RESOURCE_IDS.AGUA_FRESCA, name: "Água Fresca", emoji: "💧", weight: 1, value: 1, type: "basic", rarity: "common", requiredTool: "bucket", experienceValue: 1 },
    { id: RESOURCE_IDS.BAMBU, name: "Bambu", emoji: "🎋", weight: 2, value: 4, type: "basic", rarity: "common", requiredTool: "axe", experienceValue: 2 },
    { id: RESOURCE_IDS.MADEIRA, name: "Madeira", emoji: "🪵", weight: 3, value: 5, type: "basic", rarity: "common", requiredTool: "axe", experienceValue: 6 },
    { id: RESOURCE_IDS.ARGILA, name: "Argila", emoji: "🧱", weight: 2, value: 3, type: "basic", rarity: "common", requiredTool: null, experienceValue: 2 },
    { id: RESOURCE_IDS.FERRO_FUNDIDO, name: "Ferro Fundido", emoji: "🔩", weight: 4, value: 15, type: "basic", rarity: "uncommon", requiredTool: "pickaxe", experienceValue: 5 },
    { id: RESOURCE_IDS.COURO, name: "Couro", emoji: "🦫", weight: 2, value: 8, type: "basic", rarity: "common", requiredTool: "knife", experienceValue: 3 },
    { id: RESOURCE_IDS.CARNE, name: "Carne", emoji: "🥩", weight: 2, value: 12, type: "basic", rarity: "common", requiredTool: null, experienceValue: 4 },
    { id: RESOURCE_IDS.OSSOS, name: "Ossos", emoji: "🦴", weight: 1, value: 5, type: "basic", rarity: "common", requiredTool: null, experienceValue: 2 },
    { id: RESOURCE_IDS.PELO, name: "Pelo", emoji: "🧶", weight: 1, value: 3, type: "basic", rarity: "common", requiredTool: null, experienceValue: 1 },
    { id: RESOURCE_IDS.BARBANTE, name: "Barbante", emoji: "🧵", weight: 1, value: 1, type: "basic", rarity: "common", requiredTool: null, experienceValue: 1 },
    
    // Animals
    { id: RESOURCE_IDS.COELHO, name: "Coelho", emoji: "🐰", weight: 3, value: 15, type: "unique", rarity: "common", requiredTool: "knife", experienceValue: 5 },
    { id: RESOURCE_IDS.VEADO, name: "Veado", emoji: "🦌", weight: 8, value: 35, type: "unique", rarity: "uncommon", requiredTool: "weapon_and_knife", experienceValue: 8 },
    { id: RESOURCE_IDS.JAVALI, name: "Javali", emoji: "🐗", weight: 12, value: 50, type: "unique", rarity: "rare", requiredTool: "weapon_and_knife", experienceValue: 12 },
    { id: RESOURCE_IDS.PEIXE_PEQUENO, name: "Peixe Pequeno", emoji: "🐟", weight: 1, value: 8, type: "unique", rarity: "common", requiredTool: "fishing_rod", experienceValue: 2 },
    { id: RESOURCE_IDS.PEIXE_GRANDE, name: "Peixe Grande", emoji: "🐠", weight: 3, value: 18, type: "unique", rarity: "uncommon", requiredTool: "fishing_rod", experienceValue: 4 },
    { id: RESOURCE_IDS.SALMAO, name: "Salmão", emoji: "🍣", weight: 4, value: 25, type: "unique", rarity: "rare", requiredTool: "fishing_rod", experienceValue: 6 },
    { id: RESOURCE_IDS.COGUMELOS, name: "Cogumelos", emoji: "🍄", weight: 1, value: 6, type: "unique", rarity: "common", requiredTool: null, experienceValue: 2 },
    { id: RESOURCE_IDS.FRUTAS_SILVESTRES, name: "Frutas Silvestres", emoji: "🫐", weight: 1, value: 4, type: "unique", rarity: "common", requiredTool: null, experienceValue: 1 },
    
    // Unique resources
    { id: RESOURCE_IDS.MADEIRA_FLORESTA, name: "Madeira", emoji: "🌳", weight: 5, value: 8, type: "unique", rarity: "common", requiredTool: "axe", experienceValue: 3 },
    { id: RESOURCE_IDS.AREIA, name: "Areia", emoji: "⏳", weight: 2, value: 5, type: "unique", rarity: "common", requiredTool: "shovel", experienceValue: 2 },
    { id: RESOURCE_IDS.CRISTAIS, name: "Cristais", emoji: "💎", weight: 1, value: 20, type: "unique", rarity: "rare", requiredTool: "pickaxe", experienceValue: 10 },
    { id: RESOURCE_IDS.CONCHAS, name: "Conchas", emoji: "🐚", weight: 1, value: 12, type: "unique", rarity: "uncommon", requiredTool: null, experienceValue: 4 },
    
    // Food resources
    { id: RESOURCE_IDS.SUCO_FRUTAS, name: "Suco de Frutas", emoji: "🧃", weight: 1, value: 5, type: "food", rarity: "common", requiredTool: null, experienceValue: 2 },
    { id: RESOURCE_IDS.COGUMELOS_ASSADOS, name: "Cogumelos Assados", emoji: "🍄‍🟫", weight: 1, value: 6, type: "food", rarity: "common", requiredTool: null, experienceValue: 3 },
    { id: RESOURCE_IDS.PEIXE_GRELHADO, name: "Peixe Grelhado", emoji: "🐟", weight: 2, value: 12, type: "food", rarity: "common", requiredTool: null, experienceValue: 4 },
    { id: RESOURCE_IDS.CARNE_ASSADA, name: "Carne Assada", emoji: "🍖", weight: 2, value: 15, type: "food", rarity: "common", requiredTool: null, experienceValue: 5 },
    { id: RESOURCE_IDS.ENSOPADO_CARNE, name: "Ensopado de Carne", emoji: "🍲", weight: 3, value: 25, type: "food", rarity: "uncommon", requiredTool: null, experienceValue: 8 },
  ];
}

// Legacy exports for backward compatibility (now deprecated)
export const BASIC_RESOURCES = createResourcesWithIds().filter(r => r.type === "basic");
export const UNIQUE_RESOURCES = createResourcesWithIds().filter(r => r.type === "unique");
export const ANIMAL_RESOURCES = createResourcesWithIds().filter(r => ["🐰", "🦌", "🐗", "🐟", "🐠", "🍣", "🍄", "🫐"].includes(r.emoji));
export const FOOD_RESOURCES = createResourcesWithIds().filter(r => r.type === "food");

export const ALL_RESOURCES = createResourcesWithIds();

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
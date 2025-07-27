// Resource data management module
import type { InsertResource } from "@shared/schema";
import { randomUUID } from "crypto";

// Pre-defined UUIDs for resources to ensure consistency across systems
export const RESOURCE_IDS = {
  // Basic resources
  FIBRA: "8bd33b18-a241-4859-ae9f-870fab5673d0",
  PEDRA: "7c2a1f95-b8e3-4d72-9a01-6f5d8e4c9b12",
  PEDRAS_SOLTAS: "5e9d8c7a-3f2b-4e61-8a90-1c4b7e5f9d23",
  GRAVETOS: "2a8f5c1e-9b7d-4a63-8e52-9c1a6f8e4b37",
  AGUA_FRESCA: "4b7e1a9c-5d8f-4e32-9a76-8c2e5f1b9d48",
  BAMBU: "6d3a8e5c-1f9b-4e72-8a05-4c7e9f2b1d59",
  MADEIRA: "8e5c2a9f-7b1d-4e63-9a84-6f1c8e5a2b6a",
  ARGILA: "1c9e5a7b-3f8d-4e52-9a73-8e2c6f9b1d7b",
  FERRO_FUNDIDO: "9f7b3e1a-5d8c-4e41-9a62-2c6e8f1b5d8c",
  COURO: "3e1a9f7b-8d5c-4e30-9a51-6c8e2f9b3d9d",
  CARNE: "7b5e3a1f-1d9c-4e29-9a40-8c2e6f7b5dae",
  OSSOS: "5a3f7b1e-9d8c-4e18-9a39-2c6e8f3b7dbf",
  PELO: "1f7b5a3e-8c9d-4e17-9a28-6c2e8f5b1dc0",
  BARBANTE: "9d5a1f3e-7b8c-4e16-9a27-8c6e2f9b5dd1",
  
  // Animals 
  COELHO: "a1e5c9f7-3b8d-4e15-9a26-2c8e6f1b9de2",
  VEADO: "c9f7a1e5-8d3b-4e14-9a25-6c2e8f7b1df3",
  JAVALI: "f7a1c9e5-3d8b-4e13-9a24-8c6e2f9b7de4",
  PEIXE_PEQUENO: "a1c9f7e5-8b3d-4e12-9a23-2c8e6f5b9df5",
  PEIXE_GRANDE: "c9e5a1f7-3d8b-4e11-9a22-6c2e8f9b5de6",
  SALMAO: "e5a1c9f7-8b3d-4e10-9a21-8c6e2f7b9df7",
  COGUMELOS: "a1f7c9e5-3b8d-4e09-9a20-2c8e6f9b5de8",
  FRUTAS_SILVESTRES: "f7c9a1e5-8d3b-4e08-9a19-6c2e8f5b9df9",
  
  // Unique resources
  MADEIRA_FLORESTA: "c9a1f7e5-3d8b-4e07-9a18-8c6e2f9b7dea",
  AREIA: "a1e5f7c9-8b3d-4e06-9a17-2c8e6f7b5deb",
  CRISTAIS: "e5f7a1c9-3d8b-4e05-9a16-6c2e8f9b7dec",
  CONCHAS: "f7a1e5c9-8b3d-4e04-9a15-8c6e2f5b9ded",
  
  // Food resources
  SUCO_FRUTAS: "a1c9e5f7-3b8d-4e03-9a14-2c8e6f9b7dee",
  COGUMELOS_ASSADOS: "c9e5a1f7-8d3b-4e02-9a13-6c2e8f7b5def",
  PEIXE_GRELHADO: "e5a1c9f7-3d8b-4e01-9a12-8c6e2f9b7de0",
  CARNE_ASSADA: "a1f7e5c9-8b3d-4e00-9a11-2c8e6f5b9df1",
  ENSOPADO_CARNE: "f7e5a1c9-3d8b-4e99-9a10-6c2e8f9b7df2"
};

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
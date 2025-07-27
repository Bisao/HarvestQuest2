// Resource data management module
import type { InsertResource } from "@shared/schema";

export const BASIC_RESOURCES: InsertResource[] = [
  // RECURSOS BÁSICOS - com distância, tempo e chance de coleta
  { name: "Fibra", emoji: "🌾", weight: 1, value: 2, type: "basic", rarity: "common", requiredTool: null, experienceValue: 1, distanceFromCamp: 10, collectionTimeMinutes: 2, collectionChance: 90 },
  { name: "Pedra", emoji: "🪨", weight: 3, value: 3, type: "basic", rarity: "common", requiredTool: "pickaxe", experienceValue: 2, distanceFromCamp: 15, collectionTimeMinutes: 4, collectionChance: 80 },
  { name: "Pedras Soltas", emoji: "🗿", weight: 1, value: 1, type: "basic", rarity: "common", requiredTool: null, experienceValue: 1, distanceFromCamp: 10, collectionTimeMinutes: 2, collectionChance: 85 },
  { name: "Gravetos", emoji: "🪵", weight: 2, value: 2, type: "basic", rarity: "common", requiredTool: null, experienceValue: 1, distanceFromCamp: 10, collectionTimeMinutes: 3, collectionChance: 80 },
  { name: "Água Fresca", emoji: "💧", weight: 1, value: 1, type: "basic", rarity: "common", requiredTool: "bucket", experienceValue: 1, distanceFromCamp: 20, collectionTimeMinutes: 3, collectionChance: 70 },
  { name: "Bambu", emoji: "🎋", weight: 2, value: 4, type: "basic", rarity: "common", requiredTool: "axe", experienceValue: 2, distanceFromCamp: 15, collectionTimeMinutes: 4, collectionChance: 60 },
  { name: "Madeira", emoji: "🪵", weight: 3, value: 5, type: "basic", rarity: "common", requiredTool: "axe", experienceValue: 6, distanceFromCamp: 15, collectionTimeMinutes: 5, collectionChance: 75 },
  { name: "Argila", emoji: "🧱", weight: 2, value: 3, type: "basic", rarity: "common", requiredTool: null, experienceValue: 2, distanceFromCamp: 20, collectionTimeMinutes: 4, collectionChance: 65 },
  { name: "Ferro Fundido", emoji: "🔩", weight: 4, value: 15, type: "basic", rarity: "uncommon", requiredTool: "pickaxe", experienceValue: 5, distanceFromCamp: 30, collectionTimeMinutes: 8, collectionChance: 40 },
  
  // MATERIAIS PROCESSADOS DE ANIMAIS (não coletáveis diretamente)
  { name: "Couro", emoji: "🦫", weight: 2.3, value: 8, type: "basic", rarity: "common", requiredTool: null, experienceValue: 3, distanceFromCamp: 0, collectionTimeMinutes: 0, collectionChance: 0 },
  { name: "Carne", emoji: "🥩", weight: 2.3, value: 12, type: "basic", rarity: "common", requiredTool: null, experienceValue: 4, distanceFromCamp: 0, collectionTimeMinutes: 0, collectionChance: 0 },
  { name: "Ossos", emoji: "🦴", weight: 2.3, value: 5, type: "basic", rarity: "common", requiredTool: null, experienceValue: 2, distanceFromCamp: 0, collectionTimeMinutes: 0, collectionChance: 0 },
  { name: "Pelo", emoji: "🧶", weight: 2.3, value: 3, type: "basic", rarity: "common", requiredTool: null, experienceValue: 1, distanceFromCamp: 0, collectionTimeMinutes: 0, collectionChance: 0 },
  { name: "Penas", emoji: "🪶", weight: 2.3, value: 4, type: "basic", rarity: "common", requiredTool: null, experienceValue: 2, distanceFromCamp: 0, collectionTimeMinutes: 0, collectionChance: 0 },
  { name: "Banha", emoji: "🟡", weight: 2.3, value: 6, type: "basic", rarity: "common", requiredTool: null, experienceValue: 2, distanceFromCamp: 0, collectionTimeMinutes: 0, collectionChance: 0 },
  
  // MATERIAIS CRAFTADOS (não coletáveis diretamente)
  { name: "Barbante", emoji: "🧵", weight: 0.1, value: 1, type: "basic", rarity: "common", requiredTool: null, experienceValue: 1, distanceFromCamp: 0, collectionTimeMinutes: 0, collectionChance: 0 },
  { name: "Corda", emoji: "🪢", weight: 0.5, value: 8, type: "basic", rarity: "common", requiredTool: null, experienceValue: 3, distanceFromCamp: 0, collectionTimeMinutes: 0, collectionChance: 0 },
  { name: "Cola Natural", emoji: "🧴", weight: 0.3, value: 10, type: "basic", rarity: "uncommon", requiredTool: null, experienceValue: 4, distanceFromCamp: 0, collectionTimeMinutes: 0, collectionChance: 0 },
];

export const UNIQUE_RESOURCES: InsertResource[] = [
  { name: "Madeira", emoji: "🌳", weight: 5, value: 8, type: "unique", rarity: "common", requiredTool: "axe", experienceValue: 3, distanceFromCamp: 25, collectionTimeMinutes: 6, collectionChance: 70 },
  { name: "Areia", emoji: "⏳", weight: 2, value: 5, type: "unique", rarity: "common", requiredTool: "shovel", experienceValue: 2, distanceFromCamp: 35, collectionTimeMinutes: 5, collectionChance: 80 },
  { name: "Cristais", emoji: "💎", weight: 1, value: 20, type: "unique", rarity: "rare", requiredTool: "pickaxe", experienceValue: 10, distanceFromCamp: 80, collectionTimeMinutes: 15, collectionChance: 30 },
  { name: "Conchas", emoji: "🐚", weight: 1, value: 12, type: "unique", rarity: "uncommon", requiredTool: null, experienceValue: 4, distanceFromCamp: 15, collectionTimeMinutes: 3, collectionChance: 60 },
];

// Recursos de comida aprimorados para a floresta
export const FOOD_RESOURCES: InsertResource[] = [
  // BEBIDAS
  { name: "Suco de Frutas", emoji: "🧃", weight: 1, value: 5, type: "food", rarity: "common", requiredTool: null, experienceValue: 2 },
  { name: "Chá de Ervas", emoji: "🍵", weight: 0.5, value: 8, type: "food", rarity: "uncommon", requiredTool: null, experienceValue: 3 },
  { name: "Hidromél", emoji: "🍺", weight: 1, value: 20, type: "food", rarity: "rare", requiredTool: null, experienceValue: 6 },
  
  // COMIDAS SIMPLES
  { name: "Cogumelos Assados", emoji: "🍄‍🟫", weight: 1, value: 6, type: "food", rarity: "common", requiredTool: null, experienceValue: 3 },
  { name: "Nozes Torradas", emoji: "🥜", weight: 0.8, value: 8, type: "food", rarity: "common", requiredTool: null, experienceValue: 3 },
  { name: "Raízes Cozidas", emoji: "🥔", weight: 1.5, value: 6, type: "food", rarity: "common", requiredTool: null, experienceValue: 2 },
  
  // CARNES E PEIXES
  { name: "Peixe Grelhado", emoji: "🐟", weight: 2, value: 12, type: "food", rarity: "common", requiredTool: null, experienceValue: 4 },
  { name: "Carne Assada", emoji: "🍖", weight: 2, value: 15, type: "food", rarity: "common", requiredTool: null, experienceValue: 5 },
  { name: "Carne Defumada", emoji: "🥓", weight: 1.5, value: 18, type: "food", rarity: "uncommon", requiredTool: null, experienceValue: 6 },
  
  // PRATOS ELABORADOS
  { name: "Ensopado de Carne", emoji: "🍲", weight: 3, value: 25, type: "food", rarity: "uncommon", requiredTool: null, experienceValue: 8 },
  { name: "Sopa de Cogumelos", emoji: "🥣", weight: 2, value: 15, type: "food", rarity: "common", requiredTool: null, experienceValue: 5 },
  { name: "Torta de Frutas", emoji: "🥧", weight: 2.5, value: 22, type: "food", rarity: "uncommon", requiredTool: null, experienceValue: 7 },
];

// Recursos aprimorados para a floresta com sistema de distância, tempo e chance
export const ANIMAL_RESOURCES: InsertResource[] = [
  // ANIMAIS PEQUENOS
  { name: "Coelho", emoji: "🐰", weight: 3, value: 15, type: "unique", rarity: "common", requiredTool: "knife", experienceValue: 5, distanceFromCamp: 25, collectionTimeMinutes: 6, collectionChance: 50 },
  { name: "Esquilo", emoji: "🐿️", weight: 1, value: 8, type: "unique", rarity: "common", requiredTool: "knife", experienceValue: 3, distanceFromCamp: 25, collectionTimeMinutes: 5, collectionChance: 45 },
  { name: "Rato do Campo", emoji: "🐭", weight: 0.5, value: 5, type: "unique", rarity: "common", requiredTool: "knife", experienceValue: 2, distanceFromCamp: 25, collectionTimeMinutes: 4, collectionChance: 60 },
  
  // ANIMAIS MÉDIOS
  { name: "Veado", emoji: "🦌", weight: 8, value: 35, type: "unique", rarity: "uncommon", requiredTool: "weapon_and_knife", experienceValue: 8, distanceFromCamp: 40, collectionTimeMinutes: 8, collectionChance: 35 },
  { name: "Raposa", emoji: "🦊", weight: 4, value: 25, type: "unique", rarity: "uncommon", requiredTool: "weapon_and_knife", experienceValue: 6, distanceFromCamp: 35, collectionTimeMinutes: 7, collectionChance: 30 },
  { name: "Lobo", emoji: "🐺", weight: 6, value: 40, type: "unique", rarity: "uncommon", requiredTool: "weapon_and_knife", experienceValue: 10, distanceFromCamp: 45, collectionTimeMinutes: 9, collectionChance: 20 },
  
  // ANIMAIS GRANDES
  { name: "Javali", emoji: "🐗", weight: 12, value: 50, type: "unique", rarity: "rare", requiredTool: "weapon_and_knife", experienceValue: 12, distanceFromCamp: 50, collectionTimeMinutes: 10, collectionChance: 15 },
  { name: "Urso", emoji: "🐻", weight: 20, value: 80, type: "unique", rarity: "rare", requiredTool: "weapon_and_knife", experienceValue: 15, distanceFromCamp: 60, collectionTimeMinutes: 12, collectionChance: 5 },
  
  // AVES
  { name: "Pato Selvagem", emoji: "🦆", weight: 2, value: 12, type: "unique", rarity: "common", requiredTool: "weapon_and_knife", experienceValue: 4, distanceFromCamp: 30, collectionTimeMinutes: 5, collectionChance: 40 },
  { name: "Faisão", emoji: "🐦", weight: 1.5, value: 18, type: "unique", rarity: "uncommon", requiredTool: "weapon_and_knife", experienceValue: 5, distanceFromCamp: 35, collectionTimeMinutes: 5, collectionChance: 25 },
  
  // PEIXES
  { name: "Peixe Pequeno", emoji: "🐟", weight: 1, value: 8, type: "unique", rarity: "common", requiredTool: "fishing_rod", experienceValue: 2, distanceFromCamp: 20, collectionTimeMinutes: 4, collectionChance: 50 },
  { name: "Peixe Grande", emoji: "🐠", weight: 3, value: 18, type: "unique", rarity: "uncommon", requiredTool: "fishing_rod", experienceValue: 4, distanceFromCamp: 25, collectionTimeMinutes: 6, collectionChance: 35 },
  { name: "Salmão", emoji: "🍣", weight: 4, value: 25, type: "unique", rarity: "rare", requiredTool: "fishing_rod", experienceValue: 6, distanceFromCamp: 30, collectionTimeMinutes: 7, collectionChance: 30 },
  { name: "Truta", emoji: "🐸", weight: 2, value: 15, type: "unique", rarity: "common", requiredTool: "fishing_rod", experienceValue: 3, distanceFromCamp: 25, collectionTimeMinutes: 5, collectionChance: 40 },
  { name: "Enguia", emoji: "🐍", weight: 1.5, value: 20, type: "unique", rarity: "uncommon", requiredTool: "fishing_rod", experienceValue: 5, distanceFromCamp: 30, collectionTimeMinutes: 6, collectionChance: 25 },
  
  // PLANTAS E COLETA
  { name: "Cogumelos", emoji: "🍄", weight: 1, value: 6, type: "unique", rarity: "common", requiredTool: null, experienceValue: 2, distanceFromCamp: 10, collectionTimeMinutes: 3, collectionChance: 60 },
  { name: "Frutas Silvestres", emoji: "🫐", weight: 1, value: 4, type: "unique", rarity: "common", requiredTool: null, experienceValue: 1, distanceFromCamp: 10, collectionTimeMinutes: 3, collectionChance: 70 },
  { name: "Ervas Medicinais", emoji: "🌿", weight: 0.5, value: 8, type: "unique", rarity: "uncommon", requiredTool: null, experienceValue: 3, distanceFromCamp: 15, collectionTimeMinutes: 4, collectionChance: 50 },
  { name: "Nozes", emoji: "🌰", weight: 0.8, value: 6, type: "unique", rarity: "common", requiredTool: null, experienceValue: 2, distanceFromCamp: 10, collectionTimeMinutes: 3, collectionChance: 55 },
  { name: "Flores Silvestres", emoji: "🌸", weight: 0.2, value: 3, type: "unique", rarity: "common", requiredTool: null, experienceValue: 1, distanceFromCamp: 10, collectionTimeMinutes: 2, collectionChance: 75 },
  { name: "Raízes", emoji: "🫚", weight: 1.5, value: 5, type: "unique", rarity: "common", requiredTool: "shovel", experienceValue: 2, distanceFromCamp: 15, collectionTimeMinutes: 4, collectionChance: 50 },
  { name: "Mel Selvagem", emoji: "🍯", weight: 2, value: 15, type: "unique", rarity: "rare", requiredTool: null, experienceValue: 6, distanceFromCamp: 20, collectionTimeMinutes: 6, collectionChance: 20 },
  { name: "Resina de Árvore", emoji: "🟠", weight: 0.5, value: 10, type: "unique", rarity: "uncommon", requiredTool: "axe", experienceValue: 4, distanceFromCamp: 15, collectionTimeMinutes: 3, collectionChance: 30 },
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
        ["Fibra", "Pedra", "Pedras Soltas", "Gravetos", "Água Fresca", "Bambu", "Madeira", "Argila", "Ferro Fundido", "Couro", "Carne", "Ossos", "Pelo", "Penas", "Banha", "Barbante", "Corda", "Cola Natural"].includes(r.name)
      );
    case RESOURCE_CATEGORIES.ANIMALS:
      return resources.filter(r => ["Coelho", "Esquilo", "Rato do Campo", "Veado", "Raposa", "Lobo", "Javali", "Urso", "Pato Selvagem", "Faisão"].includes(r.name));
    case RESOURCE_CATEGORIES.FISH:
      return resources.filter(r => ["Peixe Pequeno", "Peixe Grande", "Salmão", "Truta", "Enguia"].includes(r.name));
    case RESOURCE_CATEGORIES.PLANTS:
      return resources.filter(r => ["Cogumelos", "Frutas Silvestres", "Ervas Medicinais", "Nozes", "Flores Silvestres", "Raízes", "Mel Selvagem", "Resina de Árvore"].includes(r.name));
    default:
      return resources;
  }
}
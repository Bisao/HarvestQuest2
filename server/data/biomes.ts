// Biome data management module
import type { InsertBiome } from "@shared/schema";

export interface BiomeConfig {
  name: string;
  emoji: string;
  requiredLevel: number;
  description: string;
  resourceTypes: string[];
}

export const BIOME_CONFIGS: BiomeConfig[] = [
  {
    name: "Floresta",
    emoji: "🌲",
    requiredLevel: 1,
    description: "Uma floresta rica em recursos naturais, animais para caça e rios para pesca.",
    resourceTypes: ["basic", "wood", "animals", "fish", "plants"],
  },
  {
    name: "Deserto",
    emoji: "🏜️",
    requiredLevel: 20,
    description: "Um deserto árido com areia valiosa e pedras raras.",
    resourceTypes: ["basic", "sand", "rare_stones"],
  },
  {
    name: "Montanha",
    emoji: "🏔️",
    requiredLevel: 50,
    description: "Montanhas altas com cristais preciosos e minérios.",
    resourceTypes: ["basic", "crystals", "ores"],
  },
  {
    name: "Oceano",
    emoji: "🌊",
    requiredLevel: 75,
    description: "Oceano profundo com conchas raras e tesouros marinhos.",
    resourceTypes: ["basic", "shells", "sea_treasures"],
  },
];

export function createBiomeData(resourceIds: string[]): InsertBiome[] {
  return [
    {
      name: "Floresta",
      emoji: "🌲",
      requiredLevel: 1,
      // Inclui recursos básicos + madeira + todos os novos recursos de caça/pesca
      availableResources: [
        resourceIds[0], // Fibra
        resourceIds[1], // Pedra
        resourceIds[2], // Gravetos
        resourceIds[3], // Madeira
        resourceIds[7], // Coelho
        resourceIds[8], // Veado
        resourceIds[9], // Javali
        resourceIds[10], // Peixe Pequeno
        resourceIds[11], // Peixe Grande
        resourceIds[12], // Salmão
        resourceIds[13], // Cogumelos
        resourceIds[14], // Frutas Silvestres
      ],
    },
    {
      name: "Deserto",
      emoji: "🏜️",
      requiredLevel: 20,
      availableResources: [resourceIds[0], resourceIds[1], resourceIds[2], resourceIds[4]], // Fibra, Pedra, Gravetos, Areia
    },
    {
      name: "Montanha",
      emoji: "🏔️",
      requiredLevel: 50,
      availableResources: [resourceIds[0], resourceIds[1], resourceIds[2], resourceIds[5]], // Fibra, Pedra, Gravetos, Cristais
    },
    {
      name: "Oceano",
      emoji: "🌊",
      requiredLevel: 75,
      availableResources: [resourceIds[0], resourceIds[1], resourceIds[2], resourceIds[6]], // Fibra, Pedra, Gravetos, Conchas
    },
  ];
}

// Helper function to get biome by name
export function getBiomeConfig(name: string): BiomeConfig | undefined {
  return BIOME_CONFIGS.find(biome => biome.name === name);
}

// Helper function to check if player can access biome
export function canAccessBiome(playerLevel: number, biome: BiomeConfig): boolean {
  return playerLevel >= biome.requiredLevel;
}
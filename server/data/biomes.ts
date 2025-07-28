// Biome data management module
import type { InsertBiome } from "@shared/schema";
import { RESOURCE_IDS } from "./resources";

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

export function createBiomeData(): InsertBiome[] {
  return [
    {
      name: "Floresta",
      emoji: "🌲",
      requiredLevel: 1,
      // Inclui recursos básicos + madeira + todos os novos recursos de caça/pesca
      availableResources: [
        RESOURCE_IDS.FIBRA,
        RESOURCE_IDS.PEDRA,
        RESOURCE_IDS.PEDRAS_SOLTAS,
        RESOURCE_IDS.GRAVETOS,
        RESOURCE_IDS.AGUA_FRESCA,
        RESOURCE_IDS.BAMBU,
        RESOURCE_IDS.MADEIRA,
        RESOURCE_IDS.COELHO,
        RESOURCE_IDS.VEADO,
        RESOURCE_IDS.JAVALI,
        RESOURCE_IDS.PEIXE_PEQUENO,
        RESOURCE_IDS.PEIXE_GRANDE,
        RESOURCE_IDS.SALMAO,
        RESOURCE_IDS.COGUMELOS,
        RESOURCE_IDS.FRUTAS_SILVESTRES,
      ],
    },
    {
      name: "Deserto",
      emoji: "🏜️",
      requiredLevel: 20,
      availableResources: [
        RESOURCE_IDS.FIBRA,
        RESOURCE_IDS.PEDRA,
        RESOURCE_IDS.PEDRAS_SOLTAS,
        RESOURCE_IDS.GRAVETOS,
        RESOURCE_IDS.AREIA
      ],
    },
    {
      name: "Montanha",
      emoji: "🏔️",
      requiredLevel: 50,
      availableResources: [
        RESOURCE_IDS.FIBRA,
        RESOURCE_IDS.PEDRA,
        RESOURCE_IDS.PEDRAS_SOLTAS,
        RESOURCE_IDS.GRAVETOS,
        RESOURCE_IDS.CRISTAIS
      ],
    },
    {
      name: "Oceano",
      emoji: "🌊",
      requiredLevel: 75,
      availableResources: [
        RESOURCE_IDS.FIBRA,
        RESOURCE_IDS.PEDRA,
        RESOURCE_IDS.PEDRAS_SOLTAS,
        RESOURCE_IDS.GRAVETOS,
        RESOURCE_IDS.CONCHAS
      ],
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
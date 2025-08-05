// Biome data management module
import type { InsertBiome } from "@shared/types";
import { RESOURCE_IDS, BIOME_IDS } from "@shared/constants/game-ids";

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
      id: BIOME_IDS.FLORESTA,
      name: "Floresta",
      emoji: "🌲",
      requiredLevel: 1,
      // Recursos disponíveis no bioma (apenas recursos, não animais)
      availableResources: [
        RESOURCE_IDS.FIBRA,
        RESOURCE_IDS.PEDRA,
        RESOURCE_IDS.PEDRAS_SOLTAS,
        RESOURCE_IDS.GRAVETOS,
        RESOURCE_IDS.AGUA_FRESCA,
        RESOURCE_IDS.BAMBU,
        RESOURCE_IDS.MADEIRA,
        RESOURCE_IDS.COGUMELOS,
        RESOURCE_IDS.FRUTAS_SILVESTRES,
      ],
      // Criaturas disponíveis neste bioma
      availableCreatures: [
        CREATURE_IDS.COELHO,
        CREATURE_IDS.VEADO,
        CREATURE_IDS.JAVALI,
        CREATURE_IDS.PEIXE_PEQUENO,
        CREATURE_IDS.PEIXE_GRANDE,
        CREATURE_IDS.SALMAO,
      ],
    },
    {
      id: BIOME_IDS.DESERTO,
      name: "Deserto",
      emoji: "🏜️",
      requiredLevel: 20,
      availableResources: [
        'res-f1b2c3d4-e5f6-7890-abcd-ef1234567890', // Fibra
        'res-a2b3c4d5-e6f7-8901-bcde-f23456789012', // Pedra
        'res-c3d4e5f6-g7h8-9012-cdef-345678901234', // Pedras Soltas
        'res-d5e6f7g8-h9i0-1234-ef01-567890123456', // Gravetos
        'res-t0u1v2w3-x4y5-6789-def0-012345678901', // Areia
      ],
    },
    {
      id: BIOME_IDS.MONTANHA,
      name: "Montanha",
      emoji: "🏔️",
      requiredLevel: 50,
      availableResources: [
        'res-f1b2c3d4-e5f6-7890-abcd-ef1234567890', // Fibra
        'res-a2b3c4d5-e6f7-8901-bcde-f23456789012', // Pedra
        'res-c3d4e5f6-g7h8-9012-cdef-345678901234', // Pedras Soltas
        'res-d5e6f7g8-h9i0-1234-ef01-567890123456', // Gravetos
        'res-u1v2w3x4-y5z6-789a-ef01-123456789012', // Cristais
      ],
    },
    {
      id: BIOME_IDS.OCEANO,
      name: "Oceano",
      emoji: "🌊",
      requiredLevel: 75,
      availableResources: [
        'res-f1b2c3d4-e5f6-7890-abcd-ef1234567890', // Fibra
        'res-a2b3c4d5-e6f7-8901-bcde-f23456789012', // Pedra
        'res-c3d4e5f6-g7h8-9012-cdef-345678901234', // Pedras Soltas
        'res-d5e6f7g8-h9i0-1234-ef01-567890123456', // Gravetos
        'res-v2w3x4y5-z6a7-89bc-f012-234567890123', // Conchas
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
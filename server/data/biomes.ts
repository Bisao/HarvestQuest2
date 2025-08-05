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
      // Inclui recursos básicos + madeira + todos os novos recursos de caça/pesca
      availableResources: [
        'res-f1b2c3d4-e5f6-7890-abcd-ef1234567890', // Fibra
        'res-a2b3c4d5-e6f7-8901-bcde-f23456789012', // Pedra
        'res-c3d4e5f6-g7h8-9012-cdef-345678901234', // Pedras Soltas
        'res-d5e6f7g8-h9i0-1234-ef01-567890123456', // Gravetos
        'res-e6f7g8h9-i0j1-2345-f012-678901234567', // Água Fresca
        'res-g8h9i0j1-k2l3-4567-0123-890123456789', // Bambu
        'res-h9i0j1k2-l3m4-5678-1234-901234567890', // Madeira
        'res-l2m3n4o5-p6q7-8901-5678-234567890123', // Coelho
        'res-m3n4o5p6-q7r8-9012-6789-345678901234', // Veado
        'res-n4o5p6q7-r8s9-0123-789a-456789012345', // Javali
        'res-o5p6q7r8-s9t0-1234-89ab-567890123456', // Peixe Pequeno
        'res-p6q7r8s9-t0u1-2345-9abc-678901234567', // Peixe Grande
        'res-q7r8s9t0-u1v2-3456-abcd-789012345678', // Salmão
        'res-r8s9t0u1-v2w3-4567-bcde-890123456789', // Cogumelos
        'res-s9t0u1v2-w3x4-5678-cdef-901234567890', // Frutas Silvestres
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
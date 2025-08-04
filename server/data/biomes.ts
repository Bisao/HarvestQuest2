
import type { Biome, BiomeResource } from "@shared/types";
import { RESOURCE_IDS } from "@shared/constants/game-ids";

export interface BiomeResourceEntry {
  resourceId: string;
  spawnRate: number;
  rarity: "common" | "uncommon" | "rare" | "legendary";
  requiredLevel: number;
  requiredTool?: string;
  dailyLimit?: number;
}

export interface BiomeData {
  id: string;
  name: string;
  displayName: string;
  description: string;
  emoji: string;
  difficulty: number;
  requiredLevel: number;
  dangerLevel: number;
  explorationTime: number; // in minutes
  discoverable: boolean;
  category: "basic" | "advanced" | "special";
  resources: BiomeResourceEntry[];
  specialFeatures: string[];
  weatherEffects: string[];
  timeOfDayEffects: {
    day: { bonusMultiplier: number; description: string };
    night: { bonusMultiplier: number; description: string };
  };
}

// Floresta Temperada - Bioma inicial completo
export const TEMPERATE_FOREST: BiomeData = {
  id: "temperate_forest",
  name: "temperate_forest",
  displayName: "Floresta Temperada",
  description: "Uma floresta rica em recursos naturais, perfeita para iniciantes. Oferece uma variedade de materiais básicos e vida selvagem abundante.",
  emoji: "🌲",
  difficulty: 1,
  requiredLevel: 1,
  dangerLevel: 1,
  explorationTime: 30,
  discoverable: true,
  category: "basic",
  specialFeatures: [
    "Rica em recursos básicos",
    "Fauna diversificada",
    "Fontes de água limpa",
    "Madeira de qualidade"
  ],
  weatherEffects: [
    "Chuva aumenta spawn de água fresca",
    "Sol favorece coleta de frutas"
  ],
  timeOfDayEffects: {
    day: {
      bonusMultiplier: 1.2,
      description: "Melhor visibilidade e mais animais ativos"
    },
    night: {
      bonusMultiplier: 0.8,
      description: "Redução na coleta, mas alguns recursos noturnos aparecem"
    }
  },
  resources: [
    // RECURSOS BÁSICOS
    {
      resourceId: RESOURCE_IDS.FIBRA,
      spawnRate: 0.85,
      rarity: "common",
      requiredLevel: 1,
      dailyLimit: 50
    },
    {
      resourceId: RESOURCE_IDS.GRAVETOS,
      spawnRate: 0.90,
      rarity: "common", 
      requiredLevel: 1,
      dailyLimit: 40
    },
    {
      resourceId: RESOURCE_IDS.PEDRAS_SOLTAS,
      spawnRate: 0.75,
      rarity: "common",
      requiredLevel: 1,
      dailyLimit: 30
    },
    {
      resourceId: RESOURCE_IDS.AGUA_FRESCA,
      spawnRate: 0.70,
      rarity: "common",
      requiredLevel: 1,
      requiredTool: "bucket",
      dailyLimit: 20
    },

    // RECURSOS COM FERRAMENTAS
    {
      resourceId: RESOURCE_IDS.MADEIRA,
      spawnRate: 0.60,
      rarity: "common",
      requiredLevel: 2,
      requiredTool: "axe",
      dailyLimit: 15
    },
    {
      resourceId: RESOURCE_IDS.BAMBU,
      spawnRate: 0.50,
      rarity: "common",
      requiredLevel: 2,
      requiredTool: "axe",
      dailyLimit: 12
    },
    {
      resourceId: RESOURCE_IDS.PEDRA,
      spawnRate: 0.45,
      rarity: "common",
      requiredLevel: 3,
      requiredTool: "pickaxe",
      dailyLimit: 10
    },

    // PLANTAS E ALIMENTOS
    {
      resourceId: RESOURCE_IDS.COGUMELOS,
      spawnRate: 0.55,
      rarity: "common",
      requiredLevel: 1,
      dailyLimit: 25
    },
    {
      resourceId: RESOURCE_IDS.FRUTAS_SILVESTRES,
      spawnRate: 0.65,
      rarity: "common",
      requiredLevel: 1,
      dailyLimit: 30
    },

    // ANIMAIS PEQUENOS
    {
      resourceId: RESOURCE_IDS.COELHO,
      spawnRate: 0.35,
      rarity: "common",
      requiredLevel: 3,
      requiredTool: "knife",
      dailyLimit: 5
    },

    // ANIMAIS MÉDIOS
    {
      resourceId: RESOURCE_IDS.VEADO,
      spawnRate: 0.20,
      rarity: "uncommon",
      requiredLevel: 5,
      requiredTool: "weapon_and_knife",
      dailyLimit: 2
    },

    // ANIMAIS GRANDES (RAROS)
    {
      resourceId: RESOURCE_IDS.JAVALI,
      spawnRate: 0.10,
      rarity: "rare",
      requiredLevel: 8,
      requiredTool: "weapon_and_knife",
      dailyLimit: 1
    },

    // PEIXES (com vara de pesca)
    {
      resourceId: RESOURCE_IDS.PEIXE_PEQUENO,
      spawnRate: 0.60,
      rarity: "common",
      requiredLevel: 3,
      requiredTool: "fishing_rod",
      dailyLimit: 15
    },
    {
      resourceId: RESOURCE_IDS.PEIXE_GRANDE,
      spawnRate: 0.30,
      rarity: "uncommon",
      requiredLevel: 5,
      requiredTool: "fishing_rod",
      dailyLimit: 8
    },
    {
      resourceId: RESOURCE_IDS.SALMAO,
      spawnRate: 0.15,
      rarity: "rare",
      requiredLevel: 7,
      requiredTool: "fishing_rod",
      dailyLimit: 3
    },

    // MATERIAIS PROCESSADOS (raros)
    {
      resourceId: RESOURCE_IDS.FERRO_FUNDIDO,
      spawnRate: 0.08,
      rarity: "rare",
      requiredLevel: 10,
      requiredTool: "pickaxe",
      dailyLimit: 2
    },
    {
      resourceId: RESOURCE_IDS.COURO,
      spawnRate: 0.25,
      rarity: "uncommon",
      requiredLevel: 4,
      requiredTool: "knife",
      dailyLimit: 5
    }
  ]
};

// Sistema de gestão de biomas
export class BiomeManager {
  private static biomes: Map<string, BiomeData> = new Map();

  static {
    // Registrar biomas iniciais
    this.registerBiome(TEMPERATE_FOREST);
  }

  static registerBiome(biome: BiomeData): void {
    this.biomes.set(biome.id, biome);
  }

  static getBiome(id: string): BiomeData | undefined {
    return this.biomes.get(id);
  }

  static getAllBiomes(): BiomeData[] {
    return Array.from(this.biomes.values());
  }

  static getAvailableBiomes(playerLevel: number): BiomeData[] {
    return this.getAllBiomes().filter(biome => 
      biome.requiredLevel <= playerLevel && biome.discoverable
    );
  }

  static getBiomeResources(biomeId: string, playerLevel: number, hasTools: string[] = []): BiomeResourceEntry[] {
    const biome = this.getBiome(biomeId);
    if (!biome) return [];

    return biome.resources.filter(resource => {
      // Verificar nível do jogador
      if (resource.requiredLevel > playerLevel) return false;
      
      // Verificar se tem ferramenta necessária
      if (resource.requiredTool && !hasTools.includes(resource.requiredTool)) return false;
      
      return true;
    });
  }

  static getResourcesByCategory(biomeId: string): {
    basic: BiomeResourceEntry[];
    animals: BiomeResourceEntry[];
    fish: BiomeResourceEntry[];
    plants: BiomeResourceEntry[];
    minerals: BiomeResourceEntry[];
  } {
    const biome = this.getBiome(biomeId);
    if (!biome) return { basic: [], animals: [], fish: [], plants: [], minerals: [] };

    const categorized = {
      basic: [] as BiomeResourceEntry[],
      animals: [] as BiomeResourceEntry[],
      fish: [] as BiomeResourceEntry[],
      plants: [] as BiomeResourceEntry[],
      minerals: [] as BiomeResourceEntry[]
    };

    biome.resources.forEach(resource => {
      // Categorizar baseado no ID do recurso
      if ([RESOURCE_IDS.COELHO, RESOURCE_IDS.VEADO, RESOURCE_IDS.JAVALI].includes(resource.resourceId)) {
        categorized.animals.push(resource);
      } else if ([RESOURCE_IDS.PEIXE_PEQUENO, RESOURCE_IDS.PEIXE_GRANDE, RESOURCE_IDS.SALMAO].includes(resource.resourceId)) {
        categorized.fish.push(resource);
      } else if ([RESOURCE_IDS.COGUMELOS, RESOURCE_IDS.FRUTAS_SILVESTRES, RESOURCE_IDS.FIBRA].includes(resource.resourceId)) {
        categorized.plants.push(resource);
      } else if ([RESOURCE_IDS.PEDRA, RESOURCE_IDS.PEDRAS_SOLTAS, RESOURCE_IDS.FERRO_FUNDIDO].includes(resource.resourceId)) {
        categorized.minerals.push(resource);
      } else {
        categorized.basic.push(resource);
      }
    });

    return categorized;
  }
}

// Função para converter para formato legado (compatibilidade)
export function convertToLegacyBiome(biomeData: BiomeData): Biome {
  return {
    id: biomeData.id,
    name: biomeData.displayName,
    description: biomeData.description,
    emoji: biomeData.emoji,
    difficulty: biomeData.difficulty,
    requiredLevel: biomeData.requiredLevel,
    dangerLevel: biomeData.dangerLevel,
    explorationTime: biomeData.explorationTime,
    discoverable: biomeData.discoverable,
    category: biomeData.category as any,
    resources: biomeData.resources.map(r => ({
      resourceId: r.resourceId,
      spawnRate: r.spawnRate,
      rarity: r.rarity as any
    }))
  };
}

// Exportar biomas para uso
export const ALL_BIOMES = BiomeManager.getAllBiomes();
export const AVAILABLE_BIOMES = BiomeManager.getAllBiomes();

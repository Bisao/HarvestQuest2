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
      // Inclui todos os recursos básicos, animais, peixes, plantas e materiais processados disponíveis na floresta
      availableResources: [
        // Recursos básicos coletáveis à mão
        RESOURCE_IDS.FIBRA,
        RESOURCE_IDS.PEDRAS_SOLTAS,
        RESOURCE_IDS.GRAVETOS,
        RESOURCE_IDS.ARGILA,

        // Recursos que requerem ferramentas
        RESOURCE_IDS.PEDRA,
        RESOURCE_IDS.AGUA_FRESCA,
        RESOURCE_IDS.BAMBU,
        RESOURCE_IDS.MADEIRA,
        RESOURCE_IDS.FERRO_FUNDIDO,

        // Fibras especializadas
        RESOURCE_IDS.LINHO,
        RESOURCE_IDS.ALGODAO,
        RESOURCE_IDS.JUTA,
        RESOURCE_IDS.SISAL,
        RESOURCE_IDS.CANAMO,

        // Madeiras especiais
        RESOURCE_IDS.MADEIRA_CARVALHO,
        RESOURCE_IDS.MADEIRA_PINHO,
        RESOURCE_IDS.MADEIRA_CEDRO,
        RESOURCE_IDS.MADEIRA_EUCALIPTO,
        RESOURCE_IDS.MADEIRA_MOGNO,

        // Pedras e minerais (alguns disponíveis na floresta)
        RESOURCE_IDS.PEDRA_CALCARIA,
        RESOURCE_IDS.PEDRA_GRANITO,
        RESOURCE_IDS.QUARTZO,
        RESOURCE_IDS.MINERAL_FERRO,
        RESOURCE_IDS.MINERAL_COBRE,
        RESOURCE_IDS.CARVAO_VEGETAL,

        // Animais pequenos
        RESOURCE_IDS.COELHO,
        RESOURCE_IDS.LEBRE,
        RESOURCE_IDS.RAPOSA,
        RESOURCE_IDS.ESQUILO,
        RESOURCE_IDS.CASTOR,
        RESOURCE_IDS.LONTRA,

        // Animais médios
        RESOURCE_IDS.VEADO,
        RESOURCE_IDS.CERVO,
        RESOURCE_IDS.JAVALI,
        RESOURCE_IDS.PORCO_SELVAGEM,
        RESOURCE_IDS.CABRA_MONTANHA,
        RESOURCE_IDS.OVELHA_SELVAGEM,

        // Animais grandes
        RESOURCE_IDS.URSO,
        RESOURCE_IDS.ALCE,
        RESOURCE_IDS.RENA,
        RESOURCE_IDS.BISAO,
        RESOURCE_IDS.BOI_SELVAGEM,

        // Aves
        RESOURCE_IDS.PATO,
        RESOURCE_IDS.GANSO,
        RESOURCE_IDS.CISNE,
        RESOURCE_IDS.GALINHA_ANGOLA,
        RESOURCE_IDS.PERDIZ,
        RESOURCE_IDS.CODORNA,
        RESOURCE_IDS.FAISAO,
        RESOURCE_IDS.POMBO,
        RESOURCE_IDS.ROLINHA,
        RESOURCE_IDS.CORUJA,
        RESOURCE_IDS.FALCAO,
        RESOURCE_IDS.AGUIA,

        // Peixes de água doce
        RESOURCE_IDS.PEIXE_PEQUENO,
        RESOURCE_IDS.PEIXE_GRANDE,
        RESOURCE_IDS.SALMAO,
        RESOURCE_IDS.TRUTA,
        RESOURCE_IDS.CARPA,
        RESOURCE_IDS.BAGRE,
        RESOURCE_IDS.LUCIO,
        RESOURCE_IDS.PERCA,
        RESOURCE_IDS.DOURADO,
        RESOURCE_IDS.PINTADO,
        RESOURCE_IDS.SURUBIM,
        RESOURCE_IDS.TRAIRA,
        RESOURCE_IDS.TAMBAQUI,
        RESOURCE_IDS.PIRARUCU,

        // Plantas e fungos
        RESOURCE_IDS.COGUMELOS,
        RESOURCE_IDS.COGUMELOS_SHIITAKE,
        RESOURCE_IDS.COGUMELOS_OSTRA,
        RESOURCE_IDS.FRUTAS_SILVESTRES,
        RESOURCE_IDS.AMORAS,
        RESOURCE_IDS.FRAMBOESAS,
        RESOURCE_IDS.MIRTILOS,
        RESOURCE_IDS.MORANGOS_SELVAGENS,
        RESOURCE_IDS.MACAS_SELVAGENS,
        RESOURCE_IDS.NOZES,
        RESOURCE_IDS.AVELAS,
        RESOURCE_IDS.CASTANHAS,
        RESOURCE_IDS.PINHOES,
        RESOURCE_IDS.RAIZES_COMESTIVEIS,
        RESOURCE_IDS.ERVAS_MEDICINAIS,
        RESOURCE_IDS.FOLHAS_CHA,
        RESOURCE_IDS.FLORES_COMESTIVEIS,

        // Materiais processados de animais (obtidos automaticamente ao caçar/pescar)
        RESOURCE_IDS.CARNE,
        RESOURCE_IDS.COURO,
        RESOURCE_IDS.OSSOS,
        RESOURCE_IDS.PELO,

        // Consumíveis e materiais de crafting
        RESOURCE_IDS.ISCA_PESCA,
        RESOURCE_IDS.BARBANTE,
      ],
    },
    {
      id: BIOME_IDS.DESERTO,
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
      id: BIOME_IDS.MONTANHA,
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
      id: BIOME_IDS.OCEANO,
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
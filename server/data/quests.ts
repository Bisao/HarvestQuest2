// Quest data management module
import type { InsertQuest } from "@shared/types";
import { RESOURCE_IDS, EQUIPMENT_IDS, QUEST_IDS } from "@shared/constants/game-ids";

// Import centralized biome IDs from shared constants
import { BIOME_IDS } from "@shared/constants/game-ids";

export const ALL_QUESTS: InsertQuest[] = [
  // ===== CATEGORIA: EXPLORAÇÃO =====
  {
    name: "Primeiro Explorador",
    description: "Complete sua primeira expedição na Floresta",
    emoji: "🏕️",
    type: "explore",
    category: "exploracao",
    requiredLevel: 1,
    objectives: [
      {
        type: "expedition",
        target: BIOME_IDS.FLORESTA,
        amount: 1,
        biomeId: BIOME_IDS.FLORESTA,
        description: "Complete 1 expedição na Floresta"
      }
    ],
    rewards: {
      coins: 50,
      experience: 25,
      items: {
        [RESOURCE_IDS.AGUA_FRESCA]: 2
      }
    },
    isActive: true
  },
  {
    name: "Explorador da Floresta",
    description: "Torne-se experiente em expedições na Floresta",
    emoji: "🌲",
    type: "explore",
    category: "exploracao",
    requiredLevel: 3,
    objectives: [
      {
        type: "expedition",
        target: BIOME_IDS.FLORESTA,
        amount: 5,
        biomeId: BIOME_IDS.FLORESTA,
        description: "Complete 5 expedições na Floresta"
      }
    ],
    rewards: {
      coins: 200,
      experience: 100,
      items: {
        [RESOURCE_IDS.GRAVETOS]: 10
      }
    },
    isActive: true
  },
  {
    name: "Desbravador Experiente",
    description: "Domine completamente a exploração da Floresta",
    emoji: "🗺️",
    type: "explore",
    category: "exploracao",
    requiredLevel: 8,
    objectives: [
      {
        type: "expedition",
        target: BIOME_IDS.FLORESTA,
        biomeId: BIOME_IDS.FLORESTA,
        amount: 15,
        description: "Complete 15 expedições na Floresta"
      }
    ],
    rewards: {
      coins: 500,
      experience: 250,
      items: {
        [RESOURCE_IDS.FIBRA]: 20
      }
    },
    isActive: true
  },

  // ===== CATEGORIA: COLETA =====
  {
    name: "Primeiro Passo",
    description: "Colete seus primeiros recursos básicos",
    emoji: "🌿",
    type: "collect",
    category: "coleta",
    requiredLevel: 1,
    objectives: [
      {
        type: "collect",
        target: RESOURCE_IDS.FIBRA,
        amount: 5,
        description: "Colete 5 fibras"
      },
      {
        type: "collect",
        target: RESOURCE_IDS.GRAVETOS,
        amount: 3,
        description: "Colete 3 gravetos"
      }
    ],
    rewards: {
      coins: 30,
      experience: 15,
      items: {
        [RESOURCE_IDS.PEDRAS_SOLTAS]: 2
      }
    },
    isActive: true
  },
  {
    name: "Coletor de Recursos",
    description: "Colete uma variedade de recursos da floresta",
    emoji: "📦",
    type: "collect",
    category: "coleta",
    requiredLevel: 2,
    objectives: [
      {
        type: "collect",
        target: RESOURCE_IDS.MADEIRA,
        amount: 10,
        description: "Colete 10 madeiras"
      },
      {
        type: "collect",
        target: RESOURCE_IDS.PEDRAS_SOLTAS,
        amount: 15,
        description: "Colete 15 pedras soltas"
      }
    ],
    rewards: {
      coins: 100,
      experience: 50,
      items: {
        [RESOURCE_IDS.FIBRA]: 10
      }
    },
    isActive: true
  },
  {
    name: "Minerador Iniciante",
    description: "Aprenda a extrair minerais com ferramentas",
    emoji: "⛏️",
    type: "collect",
    category: "coleta",
    requiredLevel: 4,
    objectives: [
      {
        type: "collect",
        target: RESOURCE_IDS.PEDRA,
        amount: 20,
        description: "Colete 20 pedras (requer picareta)"
      }
    ],
    rewards: {
      coins: 150,
      experience: 75,
      items: {
        [RESOURCE_IDS.ARGILA]: 5
      }
    },
    isActive: true
  },
  {
    name: "Coletor Avançado",
    description: "Domine a coleta de recursos raros",
    emoji: "💎",
    type: "collect",
    category: "coleta",
    requiredLevel: 6,
    objectives: [
      {
        type: "collect",
        target: RESOURCE_IDS.FERRO_FUNDIDO,
        amount: 5,
        description: "Colete 5 ferro fundido"
      },
      {
        type: "collect",
        target: RESOURCE_IDS.ARGILA,
        amount: 25,
        description: "Colete 25 argilas"
      }
    ],
    rewards: {
      coins: 300,
      experience: 150,
      items: {
        [RESOURCE_IDS.CRISTAIS]: 1
      }
    },
    isActive: true
  },

  // ===== CATEGORIA: CAÇA E PESCA =====
  {
    name: "Introdução à Caça",
    description: "Aprenda os fundamentos da caça na floresta",
    emoji: "🏹",
    type: "hunt",
    category: "caca",
    requiredLevel: 2,
    objectives: [
      {
        type: "collect",
        target: RESOURCE_IDS.COGUMELOS,
        amount: 5,
        description: "Colete 5 cogumelos (prática para observação)"
      },
      {
        type: "collect",
        target: RESOURCE_IDS.FRUTAS_SILVESTRES,
        amount: 8,
        description: "Colete 8 frutas silvestres (desenvolva paciência)"
      }
    ],
    rewards: {
      coins: 80,
      experience: 40,
      items: {
        [RESOURCE_IDS.BARBANTE]: 3
      }
    },
    isActive: true
  },
  {
    name: "Primeiro Caçador",
    description: "Caçe seu primeiro animal pequeno",
    emoji: "🐰",
    type: "hunt",
    category: "caca",
    requiredLevel: 3,
    objectives: [
      {
        type: "collect",
        target: RESOURCE_IDS.COELHO,
        amount: 2,
        description: "Caçe 2 coelhos (requer faca equipada)"
      }
    ],
    rewards: {
      coins: 120,
      experience: 60,
      items: {
        [RESOURCE_IDS.CARNE]: 4,
        [RESOURCE_IDS.COURO]: 2
      }
    },
    isActive: true
  },
  {
    name: "Introdução à Pesca",
    description: "Aprenda os conceitos básicos da pesca",
    emoji: "🎣",
    type: "hunt",
    category: "caca",
    requiredLevel: 3,
    objectives: [
      {
        type: "craft",
        target: EQUIPMENT_IDS.VARA_PESCA,
        amount: 1,
        description: "Crie 1 vara de pesca"
      }
    ],
    rewards: {
      coins: 100,
      experience: 50,
      items: {
        [RESOURCE_IDS.AGUA_FRESCA]: 5
      }
    },
    isActive: true
  },
  {
    name: "Pescador Iniciante",
    description: "Pesque seus primeiros peixes",
    emoji: "🐟",
    type: "hunt",
    category: "caca",
    requiredLevel: 4,
    objectives: [
      {
        type: "collect",
        target: RESOURCE_IDS.PEIXE_PEQUENO,
        amount: 5,
        description: "Pesque 5 peixes pequenos (requer vara de pesca equipada)"
      }
    ],
    rewards: {
      coins: 150,
      experience: 75,
      items: {
        [RESOURCE_IDS.OSSOS]: 5,
        [RESOURCE_IDS.CARNE]: 3
      }
    },
    isActive: true
  },
  {
    name: "Caçador Avançado",
    description: "Caçe animais maiores na floresta",
    emoji: "🦌",
    type: "hunt",
    category: "caca",
    requiredLevel: 6,
    objectives: [
      {
        type: "collect",
        target: RESOURCE_IDS.VEADO,
        amount: 1,
        description: "Caçe 1 veado (requer arma + faca equipadas)"
      }
    ],
    rewards: {
      coins: 250,
      experience: 125,
      items: {
        [RESOURCE_IDS.COURO]: 4,
        [RESOURCE_IDS.CARNE]: 6
      }
    },
    isActive: true
  },
  {
    name: "Pescador Experiente",
    description: "Domine a pesca de peixes maiores",
    emoji: "🐠",
    type: "hunt",
    category: "caca",
    requiredLevel: 7,
    objectives: [
      {
        type: "collect",
        target: RESOURCE_IDS.PEIXE_GRANDE,
        amount: 3,
        description: "Pesque 3 peixes grandes"
      },
      {
        type: "collect",
        target: RESOURCE_IDS.SALMAO,
        amount: 1,
        description: "Pesque 1 salmão (mais raro)"
      }
    ],
    rewards: {
      coins: 350,
      experience: 175,
      items: {
        [RESOURCE_IDS.OSSOS]: 8,
        [RESOURCE_IDS.CARNE]: 10
      }
    },
    isActive: true
  },

  // ===== CATEGORIA: CRAFTING =====
  {
    name: "Primeiro Artesão",
    description: "Crie seu primeiro material básico",
    emoji: "🧵",
    type: "craft",
    category: "crafting",
    requiredLevel: 1,
    objectives: [
      {
        type: "craft",
        target: RESOURCE_IDS.BARBANTE,
        amount: 3,
        description: "Crie 3 barbantes"
      }
    ],
    rewards: {
      coins: 60,
      experience: 30,
      items: {
        [RESOURCE_IDS.GRAVETOS]: 5
      }
    },
    isActive: true
  },
  {
    name: "Construtor de Ferramentas",
    description: "Crie suas primeiras ferramentas básicas",
    emoji: "🔨",
    type: "craft",
    category: "crafting",
    requiredLevel: 2,
    objectives: [
      {
        type: "craft",
        target: EQUIPMENT_IDS.FACA,
        amount: 1,
        description: "Crie 1 faca"
      },
      {
        type: "craft",
        target: EQUIPMENT_IDS.MACHADO,
        amount: 1,
        description: "Crie 1 machado"
      }
    ],
    rewards: {
      coins: 200,
      experience: 100,
      items: {
        [RESOURCE_IDS.PEDRAS_SOLTAS]: 10
      }
    },
    isActive: true
  },
  {
    name: "Artesão de Ferramentas",
    description: "Expanda seu arsenal com ferramentas avançadas",
    emoji: "🛠️",
    type: "craft",
    category: "crafting",
    requiredLevel: 4,
    objectives: [
      {
        type: "craft",
        target: EQUIPMENT_IDS.PICARETA,
        amount: 1,
        description: "Crie 1 picareta"
      },
      {
        type: "craft",
        target: EQUIPMENT_IDS.VARA_PESCA,
        amount: 1,
        description: "Crie 1 vara de pesca"
      }
    ],
    rewards: {
      coins: 300,
      experience: 150,
      items: {
        [RESOURCE_IDS.BARBANTE]: 15
      }
    },
    isActive: true
  },
  {
    name: "Chef Iniciante",
    description: "Prepare suas primeiras refeições",
    emoji: "👨‍🍳",
    type: "craft",
    category: "crafting",
    requiredLevel: 5,
    objectives: [
      {
        type: "craft",
        target: RESOURCE_IDS.COGUMELOS_ASSADOS,
        amount: 5,
        description: "Cozinhe 5 cogumelos assados"
      },
      {
        type: "craft",
        target: RESOURCE_IDS.CARNE_ASSADA,
        amount: 3,
        description: "Cozinhe 3 carnes assadas"
      }
    ],
    rewards: {
      coins: 250,
      experience: 125,
      items: {
        [RESOURCE_IDS.AGUA_FRESCA]: 10
      }
    },
    isActive: true
  },
  {
    name: "Mestre Cozinheiro",
    description: "Domine receitas avançadas de culinária",
    emoji: "🍲",
    type: "craft",
    category: "crafting",
    requiredLevel: 8,
    objectives: [
      {
        type: "craft",
        target: RESOURCE_IDS.ENSOPADO_CARNE,
        amount: 2,
        description: "Cozinhe 2 ensopados de carne"
      },
      {
        type: "craft",
        target: RESOURCE_IDS.SUCO_FRUTAS,
        amount: 5,
        description: "Prepare 5 sucos de frutas"
      }
    ],
    rewards: {
      coins: 450,
      experience: 225,
      items: {
        [RESOURCE_IDS.FERRO_FUNDIDO]: 3
      }
    },
    isActive: true
  },
  {
    name: "Artesão Avançado",
    description: "Crie equipamentos especializados",
    emoji: "⚒️",
    type: "craft",
    category: "crafting",
    requiredLevel: 10,
    objectives: [
      {
        type: "craft",
        target: EQUIPMENT_IDS.MOCHILA,
        amount: 1,
        description: "Crie 1 mochila"
      },
      {
        type: "craft",
        target: EQUIPMENT_IDS.ARCO_FLECHA,
        amount: 1,
        description: "Crie 1 arco e flecha"
      }
    ],
    rewards: {
      coins: 600,
      experience: 300,
      items: {
        [RESOURCE_IDS.CRISTAIS]: 2
      }
    },
    isActive: true
  }
];
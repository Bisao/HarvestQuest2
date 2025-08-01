// Quest data management module - Completely redesigned with 50 progressive quests
import type { InsertQuest } from "@shared/types";
import { RESOURCE_IDS, EQUIPMENT_IDS, QUEST_IDS } from "@shared/constants/game-ids";
import { BIOME_IDS } from "@shared/constants/game-ids";

export const ALL_QUESTS: InsertQuest[] = [
  // ===== INICIANTE (Nível 1-3) - 10 quests =====
  {
    name: "Despertar na Floresta",
    description: "Você acordou perdido na floresta. Explore os arredores e colete seus primeiros recursos para sobreviver.",
    emoji: "🌱",
    type: "collect",
    category: "iniciante",
    requiredLevel: 1,
    objectives: [
      {
        type: "collect",
        resourceId: RESOURCE_IDS.FIBRA,
        quantity: 3,
        description: "Colete 3 fibras das plantas ao redor"
      },
      {
        type: "collect",
        resourceId: RESOURCE_IDS.GRAVETOS,
        quantity: 2,
        description: "Colete 2 gravetos do chão"
      }
    ],
    rewards: {
      coins: 25,
      experience: 15,
      items: {
        [RESOURCE_IDS.AGUA_FRESCA]: 1
      }
    },
    isActive: true
  },
  {
    name: "Primeiro Abrigo",
    description: "A noite se aproxima. Crie suas primeiras ferramentas básicas para se preparar para os desafios à frente.",
    emoji: "🏠",
    type: "craft",
    category: "iniciante",
    requiredLevel: 1,
    objectives: [
      {
        type: "craft",
        resourceId: RESOURCE_IDS.BARBANTE,
        quantity: 2,
        description: "Crie 2 barbantes para começar a construir"
      }
    ],
    rewards: {
      coins: 30,
      experience: 20,
      items: {
        [RESOURCE_IDS.PEDRAS_SOLTAS]: 3
      }
    },
    isActive: true
  },
  {
    name: "Sede de Aventura",
    description: "Explore a floresta pela primeira vez. Complete sua primeira expedição para descobrir o que há além.",
    emoji: "🗺️",
    type: "explore",
    category: "iniciante",
    requiredLevel: 1,
    objectives: [
      {
        type: "expedition",
        biomeId: BIOME_IDS.FLORESTA,
        amount: 1,
        description: "Complete 1 expedição na Floresta"
      }
    ],
    rewards: {
      coins: 40,
      experience: 25,
      items: {
        [RESOURCE_IDS.AGUA_FRESCA]: 2,
        [RESOURCE_IDS.FRUTAS_SILVESTRES]: 1
      }
    },
    isActive: true
  },
  {
    name: "Forjando o Destino",
    description: "Todo aventureiro precisa de ferramentas adequadas. Crie sua primeira picareta para extrair recursos minerais.",
    emoji: "⛏️",
    type: "craft",
    category: "iniciante",
    requiredLevel: 2,
    objectives: [
      {
        type: "craft",
        itemId: EQUIPMENT_IDS.PICARETA,
        quantity: 1,
        description: "Crie 1 picareta"
      }
    ],
    rewards: {
      coins: 60,
      experience: 40,
      items: {
        [RESOURCE_IDS.PEDRA]: 5
      }
    },
    isActive: true
  },
  {
    name: "Minerador Novato",
    description: "Agora que tem uma picareta, é hora de extrair pedras. Este será o início de sua jornada como minerador.",
    emoji: "⛰️",
    type: "collect",
    category: "iniciante",
    requiredLevel: 2,
    objectives: [
      {
        type: "collect",
        resourceId: RESOURCE_IDS.PEDRA,
        quantity: 10,
        description: "Colete 10 pedras (requer picareta equipada)"
      }
    ],
    rewards: {
      coins: 80,
      experience: 50,
      items: {
        [RESOURCE_IDS.ARGILA]: 3,
        [RESOURCE_IDS.CRISTAIS]: 1
      }
    },
    isActive: true
  },
  {
    name: "Lenhador Iniciante",
    description: "A madeira é essencial para muitas criações. Fabrique um machado e comece a colher madeira de qualidade.",
    emoji: "🪓",
    type: "craft",
    category: "iniciante",
    requiredLevel: 2,
    objectives: [
      {
        type: "craft",
        itemId: EQUIPMENT_IDS.MACHADO,
        quantity: 1,
        description: "Crie 1 machado"
      },
      {
        type: "collect",
        resourceId: RESOURCE_IDS.MADEIRA,
        quantity: 8,
        description: "Colete 8 madeiras (requer machado equipado)"
      }
    ],
    rewards: {
      coins: 100,
      experience: 65,
      items: {
        [RESOURCE_IDS.MADEIRA]: 5,
        [RESOURCE_IDS.BARBANTE]: 4
      }
    },
    isActive: true
  },
  {
    name: "Explorador Persistente",
    description: "A floresta guarda muitos segredos. Continue explorando para desvendar seus mistérios.",
    emoji: "🌲",
    type: "explore",
    category: "iniciante",
    requiredLevel: 2,
    objectives: [
      {
        type: "expedition",
        biomeId: BIOME_IDS.FLORESTA,
        amount: 3,
        description: "Complete 3 expedições na Floresta"
      }
    ],
    rewards: {
      coins: 120,
      experience: 75,
      items: {
        [RESOURCE_IDS.COGUMELOS]: 4,
        [RESOURCE_IDS.FRUTAS_SILVESTRES]: 3
      }
    },
    isActive: true
  },
  {
    name: "Caçador de Oportunidades",
    description: "Aprenda a arte da caça. Crie uma faca e capture seu primeiro coelho para sustento.",
    emoji: "🔪",
    type: "hunt",
    category: "iniciante",
    requiredLevel: 3,
    objectives: [
      {
        type: "craft",
        itemId: EQUIPMENT_IDS.FACA,
        quantity: 1,
        description: "Crie 1 faca"
      },
      {
        type: "collect",
        resourceId: RESOURCE_IDS.COELHO,
        quantity: 1,
        description: "Caçe 1 coelho (requer faca equipada)"
      }
    ],
    rewards: {
      coins: 150,
      experience: 90,
      items: {
        [RESOURCE_IDS.CARNE]: 3,
        [RESOURCE_IDS.COURO]: 2
      }
    },
    isActive: true
  },
  {
    name: "Cozinheiro Amador",
    description: "Carne crua não é nutritiva. Aprenda a cozinhar e prepare sua primeira refeição quente.",
    emoji: "🍖",
    type: "craft",
    category: "iniciante",
    requiredLevel: 3,
    objectives: [
      {
        type: "craft",
        resourceId: RESOURCE_IDS.CARNE_ASSADA,
        quantity: 2,
        description: "Cozinhe 2 carnes assadas"
      }
    ],
    rewards: {
      coins: 80,
      experience: 60,
      items: {
        [RESOURCE_IDS.AGUA_FRESCA]: 3,
        [RESOURCE_IDS.COGUMELOS_ASSADOS]: 1
      }
    },
    isActive: true
  },
  {
    name: "Sobrevivente Resiliente",
    description: "Você provou que pode sobreviver na floresta. Colete recursos variados para se preparar para maiores desafios.",
    emoji: "💪",
    type: "collect",
    category: "iniciante",
    requiredLevel: 3,
    objectives: [
      {
        type: "collect",
        resourceId: RESOURCE_IDS.FIBRA,
        quantity: 15,
        description: "Colete 15 fibras"
      },
      {
        type: "collect",
        resourceId: RESOURCE_IDS.PEDRAS_SOLTAS,
        quantity: 10,
        description: "Colete 10 pedras soltas"
      },
      {
        type: "collect",
        resourceId: RESOURCE_IDS.AGUA_FRESCA,
        quantity: 5,
        description: "Colete 5 águas frescas"
      }
    ],
    rewards: {
      coins: 200,
      experience: 120,
      items: {
        [RESOURCE_IDS.FERRO_FUNDIDO]: 2,
        [RESOURCE_IDS.CRISTAIS]: 1
      }
    },
    isActive: true
  },

  // ===== AVENTUREIRO (Nível 4-7) - 15 quests =====
  {
    name: "Pescador das Águas Calmas",
    description: "As águas da floresta escondem deliciosos peixes. Crie uma vara de pesca e tente sua sorte.",
    emoji: "🎣",
    type: "craft",
    category: "aventureiro",
    requiredLevel: 4,
    objectives: [
      {
        type: "craft",
        itemId: EQUIPMENT_IDS.VARA_PESCA,
        quantity: 1,
        description: "Crie 1 vara de pesca"
      },
      {
        type: "collect",
        resourceId: RESOURCE_IDS.PEIXE_PEQUENO,
        quantity: 3,
        description: "Pesque 3 peixes pequenos (requer vara equipada)"
      }
    ],
    rewards: {
      coins: 180,
      experience: 100,
      items: {
        [RESOURCE_IDS.OSSOS]: 4,
        [RESOURCE_IDS.CARNE]: 3
      }
    },
    isActive: true
  },
  {
    name: "Artesão de Cordas",
    description: "Cordas são fundamentais para equipamentos avançados. Domine a arte de criar cordas resistentes.",
    emoji: "🪢",
    type: "craft",
    category: "aventureiro",
    requiredLevel: 4,
    objectives: [
      {
        type: "craft",
        resourceId: RESOURCE_IDS.CORDA,
        quantity: 5,
        description: "Crie 5 cordas"
      }
    ],
    rewards: {
      coins: 160,
      experience: 85,
      items: {
        [RESOURCE_IDS.BARBANTE]: 8,
        [RESOURCE_IDS.FIBRA]: 10
      }
    },
    isActive: true
  },
  {
    name: "Minerador Experiente",
    description: "Aprofunde seus conhecimentos em mineração. Extraia argila e ferro fundido para criações avançadas.",
    emoji: "💎",
    type: "collect",
    category: "aventureiro",
    requiredLevel: 4,
    objectives: [
      {
        type: "collect",
        resourceId: RESOURCE_IDS.ARGILA,
        quantity: 15,
        description: "Colete 15 argilas"
      },
      {
        type: "collect",
        resourceId: RESOURCE_IDS.FERRO_FUNDIDO,
        quantity: 3,
        description: "Colete 3 ferro fundido"
      }
    ],
    rewards: {
      coins: 250,
      experience: 140,
      items: {
        [RESOURCE_IDS.CRISTAIS]: 2,
        [RESOURCE_IDS.PEDRA]: 15
      }
    },
    isActive: true
  },
  {
    name: "Caçador de Cogumelos",
    description: "Os cogumelos da floresta possuem propriedades especiais. Colete uma variedade deles.",
    emoji: "🍄",
    type: "collect",
    category: "aventureiro",
    requiredLevel: 4,
    objectives: [
      {
        type: "collect",
        resourceId: RESOURCE_IDS.COGUMELOS,
        quantity: 12,
        description: "Colete 12 cogumelos"
      },
      {
        type: "craft",
        resourceId: RESOURCE_IDS.COGUMELOS_ASSADOS,
        quantity: 6,
        description: "Cozinhe 6 cogumelos assados"
      }
    ],
    rewards: {
      coins: 140,
      experience: 95,
      items: {
        [RESOURCE_IDS.AGUA_FRESCA]: 5,
        [RESOURCE_IDS.FRUTAS_SILVESTRES]: 4
      }
    },
    isActive: true
  },
  {
    name: "Explorador das Profundezas",
    description: "Torne-se um explorador experiente. A floresta ainda tem muito a mostrar para aqueles que perseveram.",
    emoji: "🏕️",
    type: "explore",
    category: "aventureiro",
    requiredLevel: 5,
    objectives: [
      {
        type: "expedition",
        biomeId: BIOME_IDS.FLORESTA,
        amount: 8,
        description: "Complete 8 expedições na Floresta"
      }
    ],
    rewards: {
      coins: 300,
      experience: 180,
      items: {
        [RESOURCE_IDS.CRISTAIS]: 3,
        [RESOURCE_IDS.FERRO_FUNDIDO]: 2
      }
    },
    isActive: true
  },
  {
    name: "Caçador de Veados",
    description: "Animais maiores requerem mais habilidade. Prove sua destreza caçando um veado majestoso.",
    emoji: "🦌",
    type: "hunt",
    category: "aventureiro",
    requiredLevel: 5,
    objectives: [
      {
        type: "collect",
        resourceId: RESOURCE_IDS.VEADO,
        quantity: 1,
        description: "Caçe 1 veado (requer arma + faca equipadas)"
      }
    ],
    rewards: {
      coins: 400,
      experience: 200,
      items: {
        [RESOURCE_IDS.COURO]: 6,
        [RESOURCE_IDS.CARNE]: 8,
        [RESOURCE_IDS.OSSOS]: 4
      }
    },
    isActive: true
  },
  {
    name: "Mestre da Pesca",
    description: "Desenvolva suas habilidades de pesca. Capture peixes maiores e mais nutritivos.",
    emoji: "🐠",
    type: "collect",
    category: "aventureiro",
    requiredLevel: 5,
    objectives: [
      {
        type: "collect",
        resourceId: RESOURCE_IDS.PEIXE_GRANDE,
        quantity: 2,
        description: "Pesque 2 peixes grandes"
      },
      {
        type: "collect",
        resourceId: RESOURCE_IDS.SALMAO,
        quantity: 1,
        description: "Pesque 1 salmão (raro)"
      }
    ],
    rewards: {
      coins: 350,
      experience: 190,
      items: {
        [RESOURCE_IDS.OSSOS]: 8,
        [RESOURCE_IDS.CARNE]: 12
      }
    },
    isActive: true
  },
  {
    name: "Chef Intermediário",
    description: "Expanda seu repertório culinário. Prepare pratos mais elaborados e nutritivos.",
    emoji: "👨‍🍳",
    type: "craft",
    category: "aventureiro",
    requiredLevel: 5,
    objectives: [
      {
        type: "craft",
        resourceId: RESOURCE_IDS.ENSOPADO_CARNE,
        quantity: 2,
        description: "Cozinhe 2 ensopados de carne"
      },
      {
        type: "craft",
        resourceId: RESOURCE_IDS.SUCO_FRUTAS,
        quantity: 3,
        description: "Prepare 3 sucos de frutas"
      }
    ],
    rewards: {
      coins: 280,
      experience: 150,
      items: {
        [RESOURCE_IDS.AGUA_FRESCA]: 8,
        [RESOURCE_IDS.COGUMELOS]: 6
      }
    },
    isActive: true
  },
  {
    name: "Arqueiro Novato",
    description: "A caça à distância requer precisão. Crie um arco e flecha para expandir suas capacidades.",
    emoji: "🏹",
    type: "craft",
    category: "aventureiro",
    requiredLevel: 6,
    objectives: [
      {
        type: "craft",
        itemId: EQUIPMENT_IDS.ARCO_FLECHA,
        quantity: 1,
        description: "Crie 1 arco e flecha"
      }
    ],
    rewards: {
      coins: 320,
      experience: 170,
      items: {
        [RESOURCE_IDS.MADEIRA]: 10,
        [RESOURCE_IDS.CORDA]: 5
      }
    },
    isActive: true
  },
  {
    name: "Coletor de Cristais",
    description: "Os cristais são recursos preciosos com propriedades místicas. Colete-os para equipamentos especiais.",
    emoji: "💎",
    type: "collect",
    category: "aventureiro",
    requiredLevel: 6,
    objectives: [
      {
        type: "collect",
        resourceId: RESOURCE_IDS.CRISTAIS,
        quantity: 5,
        description: "Colete 5 cristais"
      }
    ],
    rewards: {
      coins: 500,
      experience: 250,
      items: {
        [RESOURCE_IDS.FERRO_FUNDIDO]: 4,
        [RESOURCE_IDS.ARGILA]: 10
      }
    },
    isActive: true
  },
  {
    name: "Sobrevivente Veterano",
    description: "Prove sua resistência completando uma maratona de coleta de recursos essenciais.",
    emoji: "🎯",
    type: "collect",
    category: "aventureiro",
    requiredLevel: 6,
    objectives: [
      {
        type: "collect",
        resourceId: RESOURCE_IDS.MADEIRA,
        quantity: 25,
        description: "Colete 25 madeiras"
      },
      {
        type: "collect",
        resourceId: RESOURCE_IDS.PEDRA,
        quantity: 30,
        description: "Colete 30 pedras"
      },
      {
        type: "collect",
        resourceId: RESOURCE_IDS.FIBRA,
        quantity: 35,
        description: "Colete 35 fibras"
      }
    ],
    rewards: {
      coins: 600,
      experience: 300,
      items: {
        [RESOURCE_IDS.CRISTAIS]: 4,
        [RESOURCE_IDS.FERRO_FUNDIDO]: 5
      }
    },
    isActive: true
  },
  {
    name: "Artesão de Equipamentos",
    description: "Crie uma mochila para aumentar sua capacidade de transporte em expedições.",
    emoji: "🎒",
    type: "craft",
    category: "aventureiro",
    requiredLevel: 7,
    objectives: [
      {
        type: "craft",
        itemId: EQUIPMENT_IDS.MOCHILA,
        quantity: 1,
        description: "Crie 1 mochila"
      }
    ],
    rewards: {
      coins: 450,
      experience: 220,
      items: {
        [RESOURCE_IDS.COURO]: 8,
        [RESOURCE_IDS.BARBANTE]: 12
      }
    },
    isActive: true
  },
  {
    name: "Explorador Incansável",
    description: "Sua sede de exploração não tem limites. Continue desbravando a floresta.",
    emoji: "🗺️",
    type: "explore",
    category: "aventureiro",
    requiredLevel: 7,
    objectives: [
      {
        type: "expedition",
        biomeId: BIOME_IDS.FLORESTA,
        amount: 15,
        description: "Complete 15 expedições na Floresta"
      }
    ],
    rewards: {
      coins: 550,
      experience: 280,
      items: {
        [RESOURCE_IDS.CRISTAIS]: 5,
        [RESOURCE_IDS.FERRO_FUNDIDO]: 6
      }
    },
    isActive: true
  },
  {
    name: "Caçador Múltiplo",
    description: "Demonstre versatilidade caçando diferentes tipos de animais em uma única quest.",
    emoji: "🏹",
    type: "hunt",
    category: "aventureiro",
    requiredLevel: 7,
    objectives: [
      {
        type: "collect",
        resourceId: RESOURCE_IDS.COELHO,
        quantity: 3,
        description: "Caçe 3 coelhos"
      },
      {
        type: "collect",
        resourceId: RESOURCE_IDS.PEIXE_PEQUENO,
        quantity: 4,
        description: "Pesque 4 peixes pequenos"
      },
      {
        type: "collect",
        resourceId: RESOURCE_IDS.PEIXE_GRANDE,
        quantity: 1,
        description: "Pesque 1 peixe grande"
      }
    ],
    rewards: {
      coins: 480,
      experience: 240,
      items: {
        [RESOURCE_IDS.CARNE]: 15,
        [RESOURCE_IDS.COURO]: 6,
        [RESOURCE_IDS.OSSOS]: 10
      }
    },
    isActive: true
  },
  {
    name: "Construtor de Ferramentas",
    description: "Domine a criação de todas as ferramentas básicas essenciais para um aventureiro completo.",
    emoji: "🛠️",
    type: "craft",
    category: "aventureiro",
    requiredLevel: 7,
    objectives: [
      {
        type: "craft",
        itemId: EQUIPMENT_IDS.PICARETA,
        quantity: 1,
        description: "Crie 1 picareta adicional"
      },
      {
        type: "craft",
        itemId: EQUIPMENT_IDS.MACHADO,
        quantity: 1,
        description: "Crie 1 machado adicional"
      },
      {
        type: "craft",
        itemId: EQUIPMENT_IDS.FACA,
        quantity: 1,
        description: "Crie 1 faca adicional"
      }
    ],
    rewards: {
      coins: 420,
      experience: 210,
      items: {
        [RESOURCE_IDS.FERRO_FUNDIDO]: 8,
        [RESOURCE_IDS.MADEIRA]: 15
      }
    },
    isActive: true
  },

  // ===== ESPECIALISTA (Nível 8-12) - 15 quests =====
  {
    name: "Mestre Cozinheiro",
    description: "Torne-se um especialista em culinária. Prepare uma variedade de pratos complexos e nutritivos.",
    emoji: "🍲",
    type: "craft",
    category: "especialista",
    requiredLevel: 8,
    objectives: [
      {
        type: "craft",
        resourceId: RESOURCE_IDS.ENSOPADO_CARNE,
        quantity: 5,
        description: "Cozinhe 5 ensopados de carne"
      },
      {
        type: "craft",
        resourceId: RESOURCE_IDS.SUCO_FRUTAS,
        quantity: 8,
        description: "Prepare 8 sucos de frutas"
      },
      {
        type: "craft",
        resourceId: RESOURCE_IDS.COGUMELOS_ASSADOS,
        quantity: 10,
        description: "Cozinhe 10 cogumelos assados"
      }
    ],
    rewards: {
      coins: 700,
      experience: 350,
      items: {
        [RESOURCE_IDS.CRISTAIS]: 3,
        [RESOURCE_IDS.FERRO_FUNDIDO]: 4
      }
    },
    isActive: true
  },
  {
    name: "Explorador Lendário",
    description: "Apenas os mais determinados chegam a este nível de exploração. Prove sua dedicação.",
    emoji: "🏆",
    type: "explore",
    category: "especialista",
    requiredLevel: 8,
    objectives: [
      {
        type: "expedition",
        biomeId: BIOME_IDS.FLORESTA,
        amount: 25,
        description: "Complete 25 expedições na Floresta"
      }
    ],
    rewards: {
      coins: 800,
      experience: 400,
      items: {
        [RESOURCE_IDS.CRISTAIS]: 8,
        [RESOURCE_IDS.FERRO_FUNDIDO]: 10
      }
    },
    isActive: true
  },
  {
    name: "Caçador de Elite",
    description: "Apenas os caçadores mais habilidosos conseguem capturar múltiplos veados. Aceite este desafio.",
    emoji: "🦌",
    type: "hunt",
    category: "especialista",
    requiredLevel: 8,
    objectives: [
      {
        type: "collect",
        resourceId: RESOURCE_IDS.VEADO,
        quantity: 3,
        description: "Caçe 3 veados (requer arma + faca equipadas)"
      }
    ],
    rewards: {
      coins: 900,
      experience: 450,
      items: {
        [RESOURCE_IDS.COURO]: 15,
        [RESOURCE_IDS.CARNE]: 20,
        [RESOURCE_IDS.OSSOS]: 12
      }
    },
    isActive: true
  },
  {
    name: "Pescador Lendário",
    description: "Os salmões são os peixes mais raros e valiosos. Capture vários para provar sua maestria.",
    emoji: "🐟",
    type: "collect",
    category: "especialista",
    requiredLevel: 9,
    objectives: [
      {
        type: "collect",
        resourceId: RESOURCE_IDS.SALMAO,
        quantity: 3,
        description: "Pesque 3 salmões (muito raros)"
      },
      {
        type: "collect",
        resourceId: RESOURCE_IDS.PEIXE_GRANDE,
        quantity: 8,
        description: "Pesque 8 peixes grandes"
      }
    ],
    rewards: {
      coins: 1000,
      experience: 500,
      items: {
        [RESOURCE_IDS.OSSOS]: 20,
        [RESOURCE_IDS.CARNE]: 25,
        [RESOURCE_IDS.CRISTAIS]: 4
      }
    },
    isActive: true
  },
  {
    name: "Minerador de Cristais",
    description: "Os cristais são extremamente raros. Colete uma quantidade substancial para pesquisas avançadas.",
    emoji: "💎",
    type: "collect",
    category: "especialista",
    requiredLevel: 9,
    objectives: [
      {
        type: "collect",
        resourceId: RESOURCE_IDS.CRISTAIS,
        quantity: 15,
        description: "Colete 15 cristais"
      }
    ],
    rewards: {
      coins: 1200,
      experience: 600,
      items: {
        [RESOURCE_IDS.FERRO_FUNDIDO]: 12,
        [RESOURCE_IDS.ARGILA]: 20
      }
    },
    isActive: true
  },
  {
    name: "Artesão Mestre",
    description: "Crie equipamentos avançados demonstrando total domínio das técnicas de crafting.",
    emoji: "⚒️",
    type: "craft",
    category: "especialista",
    requiredLevel: 9,
    objectives: [
      {
        type: "craft",
        itemId: EQUIPMENT_IDS.MOCHILA,
        quantity: 2,
        description: "Crie 2 mochilas"
      },
      {
        type: "craft",
        itemId: EQUIPMENT_IDS.ARCO_FLECHA,
        quantity: 2,
        description: "Crie 2 arcos e flechas"
      }
    ],
    rewards: {
      coins: 850,
      experience: 425,
      items: {
        [RESOURCE_IDS.COURO]: 20,
        [RESOURCE_IDS.MADEIRA]: 30,
        [RESOURCE_IDS.CORDA]: 15
      }
    },
    isActive: true
  },
  {
    name: "Coletor Supremo",
    description: "Uma quest épica de coleta que testará sua resistência e dedicação aos limites.",
    emoji: "🎯",
    type: "collect",
    category: "especialista",
    requiredLevel: 10,
    objectives: [
      {
        type: "collect",
        resourceId: RESOURCE_IDS.MADEIRA,
        quantity: 50,
        description: "Colete 50 madeiras"
      },
      {
        type: "collect",
        resourceId: RESOURCE_IDS.PEDRA,
        quantity: 60,
        description: "Colete 60 pedras"
      },
      {
        type: "collect",
        resourceId: RESOURCE_IDS.FERRO_FUNDIDO,
        quantity: 20,
        description: "Colete 20 ferro fundido"
      },
      {
        type: "collect",
        resourceId: RESOURCE_IDS.ARGILA,
        quantity: 40,
        description: "Colete 40 argilas"
      }
    ],
    rewards: {
      coins: 1500,
      experience: 750,
      items: {
        [RESOURCE_IDS.CRISTAIS]: 10,
        [RESOURCE_IDS.FERRO_FUNDIDO]: 15
      }
    },
    isActive: true
  },
  {
    name: "Banqueteiro Real",
    description: "Prepare um banquete digno de um rei com os melhores pratos que você pode criar.",
    emoji: "🍽️",
    type: "craft",
    category: "especialista",
    requiredLevel: 10,
    objectives: [
      {
        type: "craft",
        resourceId: RESOURCE_IDS.ENSOPADO_CARNE,
        quantity: 10,
        description: "Cozinhe 10 ensopados de carne"
      },
      {
        type: "craft",
        resourceId: RESOURCE_IDS.CARNE_ASSADA,
        quantity: 15,
        description: "Cozinhe 15 carnes assadas"
      },
      {
        type: "craft",
        resourceId: RESOURCE_IDS.SUCO_FRUTAS,
        quantity: 12,
        description: "Prepare 12 sucos de frutas"
      }
    ],
    rewards: {
      coins: 1100,
      experience: 550,
      items: {
        [RESOURCE_IDS.AGUA_FRESCA]: 20,
        [RESOURCE_IDS.CRISTAIS]: 5
      }
    },
    isActive: true
  },
  {
    name: "Explorador dos 100 Caminhos",
    description: "Apenas os mais dedicados exploradores completam 50 expedições. Este é seu teste final.",
    emoji: "🌟",
    type: "explore",
    category: "especialista",
    requiredLevel: 10,
    objectives: [
      {
        type: "expedition",
        biomeId: BIOME_IDS.FLORESTA,
        amount: 50,
        description: "Complete 50 expedições na Floresta"
      }
    ],
    rewards: {
      coins: 2000,
      experience: 1000,
      items: {
        [RESOURCE_IDS.CRISTAIS]: 15,
        [RESOURCE_IDS.FERRO_FUNDIDO]: 20
      }
    },
    isActive: true
  },
  {
    name: "Guardião da Floresta",
    description: "Proteja a floresta mantendo o equilíbrio através da caça responsável e sustentável.",
    emoji: "🛡️",
    type: "hunt",
    category: "especialista",
    requiredLevel: 11,
    objectives: [
      {
        type: "collect",
        resourceId: RESOURCE_IDS.COELHO,
        quantity: 10,
        description: "Caçe 10 coelhos"
      },
      {
        type: "collect",
        resourceId: RESOURCE_IDS.VEADO,
        quantity: 2,
        description: "Caçe 2 veados"
      },
      {
        type: "collect",
        resourceId: RESOURCE_IDS.PEIXE_GRANDE,
        quantity: 5,
        description: "Pesque 5 peixes grandes"
      }
    ],
    rewards: {
      coins: 1300,
      experience: 650,
      items: {
        [RESOURCE_IDS.CARNE]: 35,
        [RESOURCE_IDS.COURO]: 20,
        [RESOURCE_IDS.OSSOS]: 25
      }
    },
    isActive: true
  },
  {
    name: "Armeiro Especialista",
    description: "Demonstre maestria na criação de armas e ferramentas avançadas.",
    emoji: "⚔️",
    type: "craft",
    category: "especialista",
    requiredLevel: 11,
    objectives: [
      {
        type: "craft",
        itemId: EQUIPMENT_IDS.PICARETA,
        quantity: 3,
        description: "Crie 3 picaretas"
      },
      {
        type: "craft",
        itemId: EQUIPMENT_IDS.MACHADO,
        quantity: 3,
        description: "Crie 3 machados"
      },
      {
        type: "craft",
        itemId: EQUIPMENT_IDS.FACA,
        quantity: 3,
        description: "Crie 3 facas"
      },
      {
        type: "craft",
        itemId: EQUIPMENT_IDS.ARCO_FLECHA,
        quantity: 2,
        description: "Crie 2 arcos e flechas"
      }
    ],
    rewards: {
      coins: 1400,
      experience: 700,
      items: {
        [RESOURCE_IDS.FERRO_FUNDIDO]: 25,
        [RESOURCE_IDS.MADEIRA]: 40,
        [RESOURCE_IDS.CRISTAIS]: 8
      }
    },
    isActive: true
  },
  {
    name: "Especialista em Recursos",
    description: "Colete uma quantidade massiva de todos os recursos básicos para se tornar autossuficiente.",
    emoji: "📦",
    type: "collect",
    category: "especialista",
    requiredLevel: 11,
    objectives: [
      {
        type: "collect",
        resourceId: RESOURCE_IDS.FIBRA,
        quantity: 100,
        description: "Colete 100 fibras"
      },
      {
        type: "collect",
        resourceId: RESOURCE_IDS.GRAVETOS,
        quantity: 50,
        description: "Colete 50 gravetos"
      },
      {
        type: "collect",
        resourceId: RESOURCE_IDS.PEDRAS_SOLTAS,
        quantity: 75,
        description: "Colete 75 pedras soltas"
      }
    ],
    rewards: {
      coins: 1600,
      experience: 800,
      items: {
        [RESOURCE_IDS.CRISTAIS]: 12,
        [RESOURCE_IDS.FERRO_FUNDIDO]: 18
      }
    },
    isActive: true
  },
  {
    name: "Mestre dos Materiais",
    description: "Crie uma quantidade impressionante de materiais básicos para estabelecer sua dominância.",
    emoji: "🏭",
    type: "craft",
    category: "especialista",
    requiredLevel: 12,
    objectives: [
      {
        type: "craft",
        resourceId: RESOURCE_IDS.BARBANTE,
        quantity: 50,
        description: "Crie 50 barbantes"
      },
      {
        type: "craft",
        resourceId: RESOURCE_IDS.CORDA,
        quantity: 25,
        description: "Crie 25 cordas"
      }
    ],
    rewards: {
      coins: 1200,
      experience: 600,
      items: {
        [RESOURCE_IDS.FIBRA]: 60,
        [RESOURCE_IDS.CRISTAIS]: 8
      }
    },
    isActive: true
  },
  {
    name: "Lenda Viva",
    description: "A quest final para especialistas. Prove que você domina todos os aspectos da sobrevivência.",
    emoji: "👑",
    type: "collect",
    category: "especialista",
    requiredLevel: 12,
    objectives: [
      {
        type: "collect",
        resourceId: RESOURCE_IDS.CRISTAIS,
        quantity: 25,
        description: "Colete 25 cristais"
      },
      {
        type: "collect",
        resourceId: RESOURCE_IDS.FERRO_FUNDIDO,
        quantity: 30,
        description: "Colete 30 ferro fundido"
      },
      {
        type: "expedition",
        biomeId: BIOME_IDS.FLORESTA,
        amount: 75,
        description: "Complete 75 expedições na Floresta"
      }
    ],
    rewards: {
      coins: 3000,
      experience: 1500,
      items: {
        [RESOURCE_IDS.CRISTAIS]: 20,
        [RESOURCE_IDS.FERRO_FUNDIDO]: 25
      }
    },
    isActive: true
  },

  // ===== LENDÁRIO (Nível 13+) - 10 quests =====
  {
    name: "Conquistador dos Elementos",
    description: "Domine todos os elementos da natureza coletando quantidades épicas de cada recurso fundamental.",
    emoji: "🌍",
    type: "collect",
    category: "lendario",
    requiredLevel: 13,
    objectives: [
      {
        type: "collect",
        resourceId: RESOURCE_IDS.MADEIRA,
        quantity: 100,
        description: "Colete 100 madeiras"
      },
      {
        type: "collect",
        resourceId: RESOURCE_IDS.PEDRA,
        quantity: 150,
        description: "Colete 150 pedras"
      },
      {
        type: "collect",
        resourceId: RESOURCE_IDS.CRISTAIS,
        quantity: 50,
        description: "Colete 50 cristais"
      }
    ],
    rewards: {
      coins: 5000,
      experience: 2500,
      items: {
        [RESOURCE_IDS.CRISTAIS]: 30,
        [RESOURCE_IDS.FERRO_FUNDIDO]: 40
      }
    },
    isActive: true
  },
  {
    name: "Imperador das Expedições",
    description: "Apenas lendas chegam a 100 expedições. Torne-se imortal na história dos exploradores.",
    emoji: "🏰",
    type: "explore",
    category: "lendario",
    requiredLevel: 13,
    objectives: [
      {
        type: "expedition",
        biomeId: BIOME_IDS.FLORESTA,
        amount: 100,
        description: "Complete 100 expedições na Floresta"
      }
    ],
    rewards: {
      coins: 6000,
      experience: 3000,
      items: {
        [RESOURCE_IDS.CRISTAIS]: 40,
        [RESOURCE_IDS.FERRO_FUNDIDO]: 50
      }
    },
    isActive: true
  },
  {
    name: "Senhor dos Oceanos",
    description: "Torne-se uma lenda dos mares capturando uma quantidade épica dos peixes mais raros.",
    emoji: "🌊",
    type: "collect",
    category: "lendario",
    requiredLevel: 14,
    objectives: [
      {
        type: "collect",
        resourceId: RESOURCE_IDS.SALMAO,
        quantity: 10,
        description: "Pesque 10 salmões (extremamente raros)"
      },
      {
        type: "collect",
        resourceId: RESOURCE_IDS.PEIXE_GRANDE,
        quantity: 25,
        description: "Pesque 25 peixes grandes"
      }
    ],
    rewards: {
      coins: 4500,
      experience: 2250,
      items: {
        [RESOURCE_IDS.OSSOS]: 50,
        [RESOURCE_IDS.CARNE]: 60,
        [RESOURCE_IDS.CRISTAIS]: 25
      }
    },
    isActive: true
  },
  {
    name: "Rei da Caçada",
    description: "Estabeleça sua supremacia como o maior caçador de todos os tempos.",
    emoji: "👑",
    type: "hunt",
    category: "lendario",
    requiredLevel: 14,
    objectives: [
      {
        type: "collect",
        resourceId: RESOURCE_IDS.VEADO,
        quantity: 10,
        description: "Caçe 10 veados"
      },
      {
        type: "collect",
        resourceId: RESOURCE_IDS.COELHO,
        quantity: 25,
        description: "Caçe 25 coelhos"
      }
    ],
    rewards: {
      coins: 5500,
      experience: 2750,
      items: {
        [RESOURCE_IDS.COURO]: 50,
        [RESOURCE_IDS.CARNE]: 75,
        [RESOURCE_IDS.OSSOS]: 40
      }
    },
    isActive: true
  },
  {
    name: "Arquiteto dos Deuses",
    description: "Crie uma quantidade divina de equipamentos e materiais, estabelecendo um império de criação.",
    emoji: "🏛️",
    type: "craft",
    category: "lendario",
    requiredLevel: 15,
    objectives: [
      {
        type: "craft",
        itemId: EQUIPMENT_IDS.MOCHILA,
        quantity: 10,
        description: "Crie 10 mochilas"
      },
      {
        type: "craft",
        itemId: EQUIPMENT_IDS.ARCO_FLECHA,
        quantity: 8,
        description: "Crie 8 arcos e flechas"
      },
      {
        type: "craft",
        resourceId: RESOURCE_IDS.CORDA,
        quantity: 100,
        description: "Crie 100 cordas"
      }
    ],
    rewards: {
      coins: 7000,
      experience: 3500,
      items: {
        [RESOURCE_IDS.CRISTAIS]: 50,
        [RESOURCE_IDS.FERRO_FUNDIDO]: 60
      }
    },
    isActive: true
  },
  {
    name: "Chef dos Deuses",
    description: "Prepare um banquete que alimentaria uma civilização inteira.",
    emoji: "🍖",
    type: "craft",
    category: "lendario",
    requiredLevel: 15,
    objectives: [
      {
        type: "craft",
        resourceId: RESOURCE_IDS.ENSOPADO_CARNE,
        quantity: 50,
        description: "Cozinhe 50 ensopados de carne"
      },
      {
        type: "craft",
        resourceId: RESOURCE_IDS.CARNE_ASSADA,
        quantity: 75,
        description: "Cozinhe 75 carnes assadas"
      },
      {
        type: "craft",
        resourceId: RESOURCE_IDS.SUCO_FRUTAS,
        quantity: 60,
        description: "Prepare 60 sucos de frutas"
      }
    ],
    rewards: {
      coins: 6500,
      experience: 3250,
      items: {
        [RESOURCE_IDS.AGUA_FRESCA]: 100,
        [RESOURCE_IDS.CRISTAIS]: 35
      }
    },
    isActive: true
  },
  {
    name: "Mestre Absoluto",
    description: "A quest definitiva. Apenas os verdadeiramente lendários podem completar este desafio supremo.",
    emoji: "⚡",
    type: "collect",
    category: "lendario",
    requiredLevel: 16,
    objectives: [
      {
        type: "collect",
        resourceId: RESOURCE_IDS.CRISTAIS,
        quantity: 100,
        description: "Colete 100 cristais"
      },
      {
        type: "collect",
        resourceId: RESOURCE_IDS.FERRO_FUNDIDO,
        quantity: 75,
        description: "Colete 75 ferro fundido"
      },
      {
        type: "expedition",
        biomeId: BIOME_IDS.FLORESTA,
        amount: 200,
        description: "Complete 200 expedições na Floresta"
      }
    ],
    rewards: {
      coins: 10000,
      experience: 5000,
      items: {
        [RESOURCE_IDS.CRISTAIS]: 75,
        [RESOURCE_IDS.FERRO_FUNDIDO]: 100
      }
    },
    isActive: true
  },
  {
    name: "Arsenal Completo",
    description: "Crie um arsenal completo de todas as ferramentas e equipamentos disponíveis.",
    emoji: "⚔️",
    type: "craft",
    category: "lendario",
    requiredLevel: 17,
    objectives: [
      {
        type: "craft",
        itemId: EQUIPMENT_IDS.PICARETA,
        quantity: 15,
        description: "Crie 15 picaretas"
      },
      {
        type: "craft",
        itemId: EQUIPMENT_IDS.MACHADO,
        quantity: 15,
        description: "Crie 15 machados"
      },
      {
        type: "craft",
        itemId: EQUIPMENT_IDS.FACA,
        quantity: 15,
        description: "Crie 15 facas"
      },
      {
        type: "craft",
        itemId: EQUIPMENT_IDS.VARA_PESCA,
        quantity: 10,
        description: "Crie 10 varas de pesca"
      }
    ],
    rewards: {
      coins: 8500,
      experience: 4250,
      items: {
        [RESOURCE_IDS.FERRO_FUNDIDO]: 80,
        [RESOURCE_IDS.MADEIRA]: 120,
        [RESOURCE_IDS.CRISTAIS]: 45
      }
    },
    isActive: true
  },
  {
    name: "Senhor dos Recursos",
    description: "Acumule uma quantidade impossível de todos os recursos básicos e raros.",
    emoji: "💰",
    type: "collect",
    category: "lendario",
    requiredLevel: 18,
    objectives: [
      {
        type: "collect",
        resourceId: RESOURCE_IDS.FIBRA,
        quantity: 500,
        description: "Colete 500 fibras"
      },
      {
        type: "collect",
        resourceId: RESOURCE_IDS.MADEIRA,
        quantity: 300,
        description: "Colete 300 madeiras"
      },
      {
        type: "collect",
        resourceId: RESOURCE_IDS.PEDRA,
        quantity: 400,
        description: "Colete 400 pedras"
      },
      {
        type: "collect",
        resourceId: RESOURCE_IDS.ARGILA,
        quantity: 200,
        description: "Colete 200 argilas"
      }
    ],
    rewards: {
      coins: 12000,
      experience: 6000,
      items: {
        [RESOURCE_IDS.CRISTAIS]: 100,
        [RESOURCE_IDS.FERRO_FUNDIDO]: 150
      }
    },
    isActive: true
  },
  {
    name: "Imortal da Floresta",
    description: "A quest final. Apenas os verdadeiros imortais conseguem completar esta prova definitiva.",
    emoji: "🌟",
    type: "explore",
    category: "lendario",
    requiredLevel: 20,
    objectives: [
      {
        type: "expedition",
        biomeId: BIOME_IDS.FLORESTA,
        amount: 500,
        description: "Complete 500 expedições na Floresta"
      },
      {
        type: "collect",
        resourceId: RESOURCE_IDS.CRISTAIS,
        quantity: 200,
        description: "Colete 200 cristais"
      },
      {
        type: "collect",
        resourceId: RESOURCE_IDS.FERRO_FUNDIDO,
        quantity: 150,
        description: "Colete 150 ferro fundido"
      }
    ],
    rewards: {
      coins: 25000,
      experience: 12500,
      items: {
        [RESOURCE_IDS.CRISTAIS]: 200,
        [RESOURCE_IDS.FERRO_FUNDIDO]: 300
      }
    },
    isActive: true
  }
];
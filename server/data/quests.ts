import type { InsertQuest } from "@shared/schema";

export const ALL_QUESTS: InsertQuest[] = [
  // Tutorial/Beginner Quests
  {
    name: "Primeiro Passo",
    description: "Colete suas primeiras madeiras para começar sua aventura",
    emoji: "🌳",
    type: "collect",
    requiredLevel: 1,
    objectives: [
      {
        type: "collect",
        resourceId: "2403e29c-64a8-49c7-8515-6d314682167f", // Madeira
        quantity: 5,
        description: "Colete 5 madeiras"
      }
    ],
    rewards: {
      coins: 50,
      experience: 25,
      items: {
        "2c7495cc-9f28-4ce3-baf8-3f477b8424c0": 3 // Gravetos
      }
    },
    isActive: true
  },
  {
    name: "Construtor Iniciante",
    description: "Crie sua primeira ferramenta para facilitar a coleta",
    emoji: "🔨",
    type: "craft",
    requiredLevel: 1,
    objectives: [
      {
        type: "craft",
        itemId: "2e61f8ab-4055-49bf-9aa5-66b0e9fd041d", // Faca (tool)
        quantity: 1,
        description: "Crie 1 faca"
      }
    ],
    rewards: {
      coins: 100,
      experience: 50,
      items: {
        "2c7495cc-9f28-4ce3-baf8-3f477b8424c0": 3 // Gravetos
      }
    },
    isActive: true
  },
  {
    name: "Explorador da Floresta",
    description: "Complete uma expedição no bioma Floresta",
    emoji: "🏕️",
    type: "explore",
    requiredLevel: 1,
    objectives: [
      {
        type: "expedition",
        biomeId: "78566f17-d3dc-45f6-a936-8b2332d89133", // Floresta
        quantity: 1,
        description: "Complete 1 expedição na Floresta"
      }
    ],
    rewards: {
      coins: 75,
      experience: 40,
      items: {
        "94e8664f-8c91-45e1-b869-6ddff1b51b35": 2 // Água Fresca
      }
    },
    isActive: true
  },

  // Intermediate Quests
  {
    name: "Coletor Experiente",
    description: "Colete uma grande variedade de recursos básicos",
    emoji: "📦",
    type: "collect",
    requiredLevel: 5,
    objectives: [
      {
        type: "collect",
        resourceId: "92ad7096-9896-43ed-8ca5-57a49cce8367", // Pedra
        quantity: 10,
        description: "Colete 10 pedras"
      },
      {
        type: "collect",
        resourceId: "ccf77b6d-ad96-4101-9eed-d80f2f2a77e4", // Fibra
        quantity: 15,
        description: "Colete 15 fibras"
      },
      {
        type: "collect",
        resourceId: "2c7495cc-9f28-4ce3-baf8-3f477b8424c0", // Gravetos
        quantity: 8,
        description: "Colete 8 gravetos"
      }
    ],
    rewards: {
      coins: 200,
      experience: 100,
      items: {
        "b1816cc3-14e2-4232-bec9-2370f40efdf1": 5 // Pedras Soltas
      }
    },
    isActive: true
  },
  {
    name: "Caçador Habilidoso",
    description: "Caçe diferentes tipos de animais",
    emoji: "🏹",
    type: "collect",
    requiredLevel: 3,
    objectives: [
      {
        type: "collect",
        resourceId: "d7e35c48-ba8b-4595-8533-3c7cf83cc729", // Coelho
        quantity: 3,
        description: "Caçe 3 coelhos"
      },
      {
        type: "collect",
        resourceId: "e5e768ff-5877-4e69-9a24-e1fe4b430f68", // Veado
        quantity: 1,
        description: "Caçe 1 veado"
      }
    ],
    rewards: {
      coins: 150,
      experience: 80,
      items: {
        "carne": 5,
        "couro": 2
      }
    },
    isActive: true
  },
  {
    name: "Ferramenteiro",
    description: "Crie ferramentas essenciais para expedições",
    emoji: "⚒️",
    type: "craft",
    requiredLevel: 5,
    objectives: [
      {
        type: "craft",
        target: "machado",
        amount: 1,
        description: "Crie 1 machado"
      },
      {
        type: "craft",
        target: "picareta",
        amount: 1,
        description: "Crie 1 picareta"
      }
    ],
    rewards: {
      coins: 300,
      experience: 150,
      items: {
        "barbante": 10
      }
    },
    isActive: true
  },

  // Advanced Quests
  {
    name: "Mestre do Deserto",
    description: "Explore o perigoso bioma do Deserto",
    emoji: "🏜️",
    type: "explore",
    requiredLevel: 20,
    objectives: [
      {
        type: "expedition_complete",
        target: "deserto",
        amount: 3,
        description: "Complete 3 expedições no Deserto"
      }
    ],
    rewards: {
      coins: 500,
      experience: 250,
      items: {
        "ferro_fundido": 2,
        "argila": 5
      }
    },
    isActive: true
  },
  {
    name: "Pescador Profissional",
    description: "Pesque diferentes tipos de peixes",
    emoji: "🎣",
    type: "collect",
    requiredLevel: 8,
    objectives: [
      {
        type: "collect",
        target: "peixe_pequeno",
        amount: 5,
        description: "Pesque 5 peixes pequenos"
      },
      {
        type: "collect",
        target: "peixe_grande",
        amount: 3,
        description: "Pesque 3 peixes grandes"
      },
      {
        type: "collect",
        target: "salmao",
        amount: 1,
        description: "Pesque 1 salmão"
      }
    ],
    rewards: {
      coins: 250,
      experience: 120,
      items: {
        "isca_para_pesca": 5
      }
    },
    isActive: true
  },
  {
    name: "Cozinheiro Experiente",
    description: "Prepare diferentes tipos de comida",
    emoji: "🍳",
    type: "craft",
    requiredLevel: 10,
    objectives: [
      {
        type: "craft",
        target: "carne_assada",
        amount: 5,
        description: "Cozinhe 5 carnes assadas"
      },
      {
        type: "craft",
        target: "peixe_grelhado",
        amount: 3,
        description: "Cozinhe 3 peixes grelhados"
      },
      {
        type: "craft",
        target: "ensopado_de_carne",
        amount: 1,
        description: "Prepare 1 ensopado de carne"
      }
    ],
    rewards: {
      coins: 400,
      experience: 200,
      items: {
        "panela_de_barro": 1
      }
    },
    isActive: true
  },

  // Level-based Quests
  {
    name: "Aventureiro Experiente",
    description: "Alcance um nível mais alto para desbloquear novas áreas",
    emoji: "⭐",
    type: "level",
    requiredLevel: 1,
    objectives: [
      {
        type: "reach_level",
        target: "10",
        amount: 1,
        description: "Alcance o nível 10"
      }
    ],
    rewards: {
      coins: 1000,
      experience: 500,
      items: {
        "mochila": 1
      }
    },
    isActive: true
  },
  {
    name: "Explorador das Montanhas",
    description: "Torne-se forte o suficiente para explorar as montanhas",
    emoji: "⛰️",
    type: "level",
    requiredLevel: 25,
    objectives: [
      {
        type: "reach_level",
        target: "50",
        amount: 1,
        description: "Alcance o nível 50"
      }
    ],
    rewards: {
      coins: 2000,
      experience: 1000,
      items: {
        "lanca": 1,
        "arco_e_flecha": 1
      }
    },
    isActive: true
  }
];
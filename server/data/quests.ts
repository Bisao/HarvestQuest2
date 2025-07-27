// Quest data management module
import type { InsertQuest } from "@shared/schema";

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
        biomeId: "78566f17-d3dc-45f6-a936-8b2332d89133", // Floresta
        quantity: 1,
        description: "Complete 1 expedição na Floresta"
      }
    ],
    rewards: {
      coins: 50,
      experience: 25,
      items: {
        "94e8664f-8c91-45e1-b869-6ddff1b51b35": 2 // Água Fresca
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
        biomeId: "78566f17-d3dc-45f6-a936-8b2332d89133", // Floresta
        quantity: 5,
        description: "Complete 5 expedições na Floresta"
      }
    ],
    rewards: {
      coins: 200,
      experience: 100,
      items: {
        "2c7495cc-9f28-4ce3-baf8-3f477b8424c0": 10 // Gravetos
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
        biomeId: "78566f17-d3dc-45f6-a936-8b2332d89133", // Floresta
        quantity: 15,
        description: "Complete 15 expedições na Floresta"
      }
    ],
    rewards: {
      coins: 500,
      experience: 250,
      items: {
        "ccf77b6d-ad96-4101-9eed-d80f2f2a77e4": 20 // Fibra
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
        resourceId: "ccf77b6d-ad96-4101-9eed-d80f2f2a77e4", // Fibra
        quantity: 5,
        description: "Colete 5 fibras"
      },
      {
        type: "collect",
        resourceId: "2c7495cc-9f28-4ce3-baf8-3f477b8424c0", // Gravetos
        quantity: 3,
        description: "Colete 3 gravetos"
      }
    ],
    rewards: {
      coins: 30,
      experience: 15,
      items: {
        "b1816cc3-14e2-4232-bec9-2370f40efdf1": 2 // Pedras Soltas
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
        resourceId: "2403e29c-64a8-49c7-8515-6d314682167f", // Madeira
        quantity: 10,
        description: "Colete 10 madeiras"
      },
      {
        type: "collect",
        resourceId: "b1816cc3-14e2-4232-bec9-2370f40efdf1", // Pedras Soltas
        quantity: 15,
        description: "Colete 15 pedras soltas"
      }
    ],
    rewards: {
      coins: 100,
      experience: 50,
      items: {
        "ccf77b6d-ad96-4101-9eed-d80f2f2a77e4": 10 // Fibra
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
        resourceId: "92ad7096-9896-43ed-8ca5-57a49cce8367", // Pedra
        quantity: 20,
        description: "Colete 20 pedras (requer picareta)"
      }
    ],
    rewards: {
      coins: 150,
      experience: 75,
      items: {
        "c7efa60d-2184-4289-86ef-47d230afe951": 5 // Argila
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
        resourceId: "5e1bc0d0-7631-4aee-8001-210771dc2def", // Ferro Fundido
        quantity: 5,
        description: "Colete 5 ferro fundido"
      },
      {
        type: "collect",
        resourceId: "c7efa60d-2184-4289-86ef-47d230afe951", // Argila
        quantity: 25,
        description: "Colete 25 argilas"
      }
    ],
    rewards: {
      coins: 300,
      experience: 150,
      items: {
        "31ad8a38-aceb-4cfa-a751-c12832a7b986": 1 // Cristais
      }
    },
    isActive: true
  },

  // ===== CATEGORIA: CAÇA =====
  {
    name: "Primeiro Caçador",
    description: "Aprenda a caçar animais pequenos",
    emoji: "🐰",
    type: "hunt",
    category: "caca",
    requiredLevel: 3,
    objectives: [
      {
        type: "collect",
        resourceId: "d7e35c48-ba8b-4595-8533-3c7cf83cc729", // Coelho
        quantity: 3,
        description: "Caçe 3 coelhos (requer faca)"
      }
    ],
    rewards: {
      coins: 120,
      experience: 60,
      items: {
        "f9d5e263-c12f-41b2-ab35-fd973504bcd8": 3 // Carne
      }
    },
    isActive: true
  },
  {
    name: "Caçador de Plantas",
    description: "Colete plantas e cogumelos da floresta",
    emoji: "🍄",
    type: "hunt",
    category: "caca",
    requiredLevel: 2,
    objectives: [
      {
        type: "collect",
        resourceId: "af1c8c31-cc47-4dd9-9bb3-ae6e2be6c513", // Cogumelos
        quantity: 10,
        description: "Colete 10 cogumelos"
      },
      {
        type: "collect",
        resourceId: "9ea8effe-3ad4-4ff1-9c0a-f22b66c79acd", // Frutas Silvestres
        quantity: 15,
        description: "Colete 15 frutas silvestres"
      }
    ],
    rewards: {
      coins: 80,
      experience: 40,
      items: {
        "16b463d8-b17d-437e-8fd6-ecdca805475f": 3 // Barbante
      }
    },
    isActive: true
  },
  {
    name: "Pescador Iniciante",
    description: "Aprenda a pescar nos rios da floresta",
    emoji: "🎣",
    type: "hunt",
    category: "caca",
    requiredLevel: 5,
    objectives: [
      {
        type: "collect",
        resourceId: "7a423b00-cf97-4637-9f7a-f39ee6c91736", // Peixe Pequeno
        quantity: 8,
        description: "Pesque 8 peixes pequenos (requer vara de pesca)"
      }
    ],
    rewards: {
      coins: 180,
      experience: 90,
      items: {
        "4d5eb4a6-0d99-41f3-a41c-d5b6d4fec95b": 5 // Ossos
      }
    },
    isActive: true
  },
  {
    name: "Caçador Experiente",
    description: "Caçe animais maiores e mais desafiadores",
    emoji: "🦌",
    type: "hunt",
    category: "caca",
    requiredLevel: 8,
    objectives: [
      {
        type: "collect",
        resourceId: "e5e768ff-5877-4e69-9a24-e1fe4b430f68", // Veado
        quantity: 2,
        description: "Caçe 2 veados (requer arma + faca)"
      },
      {
        type: "collect",
        resourceId: "4f9ae68f-a445-4d8c-a1c7-b6831263b1c6", // Peixe Grande
        quantity: 5,
        description: "Pesque 5 peixes grandes"
      }
    ],
    rewards: {
      coins: 400,
      experience: 200,
      items: {
        "425e9a16-2ca5-45f4-b04e-e9cddecd1b73": 8 // Couro
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
        itemId: "16b463d8-b17d-437e-8fd6-ecdca805475f", // Barbante
        quantity: 3,
        description: "Crie 3 barbantes"
      }
    ],
    rewards: {
      coins: 60,
      experience: 30,
      items: {
        "2c7495cc-9f28-4ce3-baf8-3f477b8424c0": 5 // Gravetos
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
        itemId: "2e61f8ab-4055-49bf-9aa5-66b0e9fd041d", // Faca
        quantity: 1,
        description: "Crie 1 faca"
      },
      {
        type: "craft",
        itemId: "331078c4-80d7-4e58-9b61-57f4c07746ba", // Machado
        quantity: 1,
        description: "Crie 1 machado"
      }
    ],
    rewards: {
      coins: 200,
      experience: 100,
      items: {
        "b1816cc3-14e2-4232-bec9-2370f40efdf1": 10 // Pedras Soltas
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
        itemId: "61442df8-fdde-43fc-aec4-7cb3113c7516", // Picareta
        quantity: 1,
        description: "Crie 1 picareta"
      },
      {
        type: "craft",
        itemId: "c43802c7-0dd6-42e0-ba94-5dbd82cf28a3", // Vara de Pesca
        quantity: 1,
        description: "Crie 1 vara de pesca"
      }
    ],
    rewards: {
      coins: 300,
      experience: 150,
      items: {
        "16b463d8-b17d-437e-8fd6-ecdca805475f": 15 // Barbante
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
        itemId: "0177efd5-e051-438a-87db-7051ecdd3560", // Cogumelos Assados
        quantity: 5,
        description: "Cozinhe 5 cogumelos assados"
      },
      {
        type: "craft",
        itemId: "e7d8654b-c7da-4f21-9153-66088bd748e8", // Carne Assada
        quantity: 3,
        description: "Cozinhe 3 carnes assadas"
      }
    ],
    rewards: {
      coins: 250,
      experience: 125,
      items: {
        "94e8664f-8c91-45e1-b869-6ddff1b51b35": 10 // Água Fresca
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
        itemId: "12b5e8a1-4c72-4d8f-9a3e-7f6b8c9d0e1f", // Ensopado de Carne
        quantity: 2,
        description: "Cozinhe 2 ensopados de carne"
      },
      {
        type: "craft",
        itemId: "23c6f9b2-5d83-4e9f-ab4f-8g7c9d0e1f2g", // Suco de Frutas
        quantity: 5,
        description: "Prepare 5 sucos de frutas"
      }
    ],
    rewards: {
      coins: 450,
      experience: 225,
      items: {
        "5e1bc0d0-7631-4aee-8001-210771dc2def": 3 // Ferro Fundido
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
        itemId: "40e7b350-6e02-463d-b88d-76b9c67c19d4", // Mochila
        quantity: 1,
        description: "Crie 1 mochila"
      },
      {
        type: "craft",
        itemId: "8f2e5a76-3b94-4c82-9d61-a5e8f7b2c4d9", // Arco e Flecha
        quantity: 1,
        description: "Crie 1 arco e flecha"
      }
    ],
    rewards: {
      coins: 600,
      experience: 300,
      items: {
        "31ad8a38-aceb-4cfa-a751-c12832a7b986": 2 // Cristais
      }
    },
    isActive: true
  }
];
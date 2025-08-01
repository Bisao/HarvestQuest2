
// Modern recipe system with fundamental attributes
import type { InsertRecipe } from "@shared/types";
import { RESOURCE_IDS, EQUIPMENT_IDS } from "@shared/constants/game-ids";

export function createModernRecipeData(): InsertRecipe[] {
  return [
    // MATERIAIS BÁSICOS
    {
      id: "rec-barbante-001",
      name: "Barbante",
      emoji: "🧵",
      category: "basic_materials",
      subcategory: "processed_fiber",
      difficulty: "trivial",
      requiredLevel: 1,
      ingredients: [
        { itemId: "res-f2b8e7d6-9a5c-4e31-8b7f-3c9e1d5a8b42", quantity: 5, consumed: true } // Fibra
      ],
      outputs: [
        { itemId: "res-b1a4d264-7d91-4560-88c0-99706231b8d1", quantity: 1, chance: 100 } // Barbante
      ],
      craftingTime: 5,
      experienceGained: 10,
      successRate: 100
    },

    // FERRAMENTAS
    {
      id: "rec-machado-001", 
      name: "Machado",
      emoji: "🪓",
      category: "tools",
      subcategory: "cutting_tools",
      difficulty: "easy",
      requiredLevel: 1,
      ingredients: [
        { itemId: "res-e4c8f7a2-6b9d-4e31-8f5a-2c9e7d3b1a65", quantity: 1, consumed: true }, // Pedras Soltas
        { itemId: "res-b1a4d264-7d91-4560-88c0-99706231b8d1", quantity: 2, consumed: true }, // Barbante
        { itemId: "res-a7f9e3c5-8b2d-4e61-9a8f-1c5e9b7d3a42", quantity: 1, consumed: true }  // Gravetos
      ],
      outputs: [
        { itemId: "eq-machado-basico-001", quantity: 1, chance: 100 }
      ],
      craftingTime: 30,
      experienceGained: 25,
      successRate: 95
    },

    {
      id: "rec-picareta-001",
      name: "Picareta", 
      emoji: "⛏️",
      category: "tools",
      subcategory: "mining_tools",
      difficulty: "easy",
      requiredLevel: 1,
      ingredients: [
        { itemId: "res-e4c8f7a2-6b9d-4e31-8f5a-2c9e7d3b1a65", quantity: 2, consumed: true }, // Pedras Soltas
        { itemId: "res-b1a4d264-7d91-4560-88c0-99706231b8d1", quantity: 2, consumed: true }, // Barbante
        { itemId: "res-a7f9e3c5-8b2d-4e61-9a8f-1c5e9b7d3a42", quantity: 1, consumed: true }  // Gravetos
      ],
      outputs: [
        { itemId: "eq-picareta-basica-001", quantity: 1, chance: 100 }
      ],
      craftingTime: 35,
      experienceGained: 30,
      successRate: 95
    },

    {
      id: "rec-faca-001",
      name: "Faca",
      emoji: "🗡️", 
      category: "weapons",
      subcategory: "melee_weapons",
      difficulty: "easy",
      requiredLevel: 1,
      ingredients: [
        { itemId: "res-e4c8f7a2-6b9d-4e31-8f5a-2c9e7d3b1a65", quantity: 1, consumed: true }, // Pedras Soltas
        { itemId: "res-b1a4d264-7d91-4560-88c0-99706231b8d1", quantity: 1, consumed: true }, // Barbante
        { itemId: "res-a7f9e3c5-8b2d-4e61-9a8f-1c5e9b7d3a42", quantity: 1, consumed: true }  // Gravetos
      ],
      outputs: [
        { itemId: "eq-faca-basica-001", quantity: 1, chance: 100 }
      ],
      craftingTime: 25,
      experienceGained: 20,
      successRate: 95
    },

    {
      id: "rec-vara-pesca-001",
      name: "Vara de Pesca",
      emoji: "🎣",
      category: "tools",
      subcategory: "fishing_tools", 
      difficulty: "medium",
      requiredLevel: 3,
      ingredients: [
        { itemId: "res-a7f9e3c5-8b2d-4e61-9a8f-1c5e9b7d3a42", quantity: 3, consumed: true }, // Gravetos
        { itemId: "res-f2b8e7d6-9a5c-4e31-8b7f-3c9e1d5a8b42", quantity: 2, consumed: true }  // Fibra
      ],
      outputs: [
        { itemId: "eq-vara-pesca-001", quantity: 1, chance: 100 }
      ],
      craftingTime: 45,
      experienceGained: 40,
      successRate: 85
    },

    {
      id: "rec-foice-001",
      name: "Foice",
      emoji: "🔪",
      category: "tools",
      subcategory: "harvesting_tools",
      difficulty: "medium", 
      requiredLevel: 2,
      ingredients: [
        { itemId: "res-c9f7e5a3-8b1d-4e62-9a7f-2c8e6b9d4a53", quantity: 1, consumed: true }, // Pedra
        { itemId: "res-b1a4d264-7d91-4560-88c0-99706231b8d1", quantity: 2, consumed: true }, // Barbante
        { itemId: "res-a7f9e3c5-8b2d-4e61-9a8f-1c5e9b7d3a42", quantity: 1, consumed: true }  // Gravetos
      ],
      outputs: [
        { itemId: "eq-foice-basica-001", quantity: 1, chance: 100 }
      ],
      craftingTime: 40,
      experienceGained: 35,
      successRate: 90
    },

    // ARMAS
    {
      id: "rec-arco-flecha-001",
      name: "Arco e Flecha",
      emoji: "🏹",
      category: "weapons",
      subcategory: "ranged_weapons",
      difficulty: "hard",
      requiredLevel: 5,
      ingredients: [
        { itemId: "res-a7f9e3c5-8b2d-4e61-9a8f-1c5e9b7d3a42", quantity: 2, consumed: true }, // Gravetos
        { itemId: "res-b1a4d264-7d91-4560-88c0-99706231b8d1", quantity: 2, consumed: true }, // Barbante
        { itemId: "res-e4c8f7a2-6b9d-4e31-8f5a-2c9e7d3b1a65", quantity: 1, consumed: true }  // Pedras Soltas
      ],
      outputs: [
        { itemId: "eq-arco-flecha-001", quantity: 1, chance: 100 }
      ],
      craftingTime: 60,
      experienceGained: 60,
      successRate: 70
    },

    {
      id: "rec-lanca-001", 
      name: "Lança",
      emoji: "🗡️",
      category: "weapons",
      subcategory: "melee_weapons",
      difficulty: "medium",
      requiredLevel: 4,
      ingredients: [
        { itemId: "res-a7f9e3c5-8b2d-4e61-9a8f-1c5e9b7d3a42", quantity: 2, consumed: true }, // Gravetos
        { itemId: "res-b1a4d264-7d91-4560-88c0-99706231b8d1", quantity: 4, consumed: true }, // Barbante
        { itemId: "res-e4c8f7a2-6b9d-4e31-8f5a-2c9e7d3b1a65", quantity: 1, consumed: true }  // Pedras Soltas
      ],
      outputs: [
        { itemId: "eq-lanca-basica-001", quantity: 1, chance: 100 }
      ],
      craftingTime: 50,
      experienceGained: 50,
      successRate: 80
    },

    // CONTAINERS/UTENSILS
    {
      id: "rec-balde-madeira-001",
      name: "Balde de Madeira",
      emoji: "🪣",
      category: "containers",
      subcategory: "storage_containers",
      difficulty: "medium",
      requiredLevel: 2,
      ingredients: [
        { itemId: "res-d8e6f4b2-9c7a-4e53-8b9f-1d7e5c3a9b64", quantity: 1, consumed: true }, // Madeira
        { itemId: "res-b1a4d264-7d91-4560-88c0-99706231b8d1", quantity: 2, consumed: true }  // Barbante
      ],
      outputs: [
        { itemId: "eq-balde-madeira-001", quantity: 1, chance: 100 }
      ],
      craftingTime: 40,
      experienceGained: 35,
      successRate: 90
    },

    // CONSUMABLES
    {
      id: "rec-cogumelos-assados-001",
      name: "Cogumelos Assados",
      emoji: "🍄",
      category: "consumables",
      subcategory: "cooked_food",
      difficulty: "trivial",
      requiredLevel: 1,
      ingredients: [
        { itemId: "res-2a8f5c1e-9b7d-4a63-8e52-9c1a6f8e4b37", quantity: 3, consumed: true }, // Cogumelos
        { itemId: "res-a7f9e3c5-8b2d-4e61-9a8f-1c5e9b7d3a42", quantity: 1, consumed: true }  // Gravetos
      ],
      outputs: [
        { itemId: "res-8f1f5c93-ebb4-4808-b8fe-a6a912552aec", quantity: 1, chance: 100 } // Cogumelos Assados
      ],
      craftingTime: 15,
      experienceGained: 15,
      successRate: 100
    },

    {
      id: "rec-carne-assada-001",
      name: "Carne Assada",
      emoji: "🥩",
      category: "consumables", 
      subcategory: "cooked_food",
      difficulty: "trivial",
      requiredLevel: 1,
      ingredients: [
        { itemId: "res-d7a5f9c3-8e2b-4d61-9a8f-3c7e5b9d1a42", quantity: 1, consumed: true }, // Carne
        { itemId: "res-a7f9e3c5-8b2d-4e61-9a8f-1c5e9b7d3a42", quantity: 1, consumed: true }  // Gravetos
      ],
      outputs: [
        { itemId: "res-5e9d8c7a-3f2b-4e61-8a90-1c4b7e5f9d23", quantity: 1, chance: 100 } // Carne Assada
      ],
      craftingTime: 20,
      experienceGained: 20,
      successRate: 100
    },

    // SUCO DE FRUTAS
    {
      id: "rec-suco-frutas-001",
      name: "Suco de Frutas",
      emoji: "🧃",
      category: "consumables",
      subcategory: "cooked_food",
      difficulty: "trivial",
      requiredLevel: 1,
      ingredients: [
        { itemId: "res-a1f7c9e5-3b8d-4e09-9a20-2c8e6f9b5de8", quantity: 3, consumed: true } // Frutas Silvestres
      ],
      outputs: [
        { itemId: "res-f7c9a1e5-8d3b-4e08-9a19-6c2e8f5b9df9", quantity: 1, chance: 100 } // Suco de Frutas
      ],
      craftingTime: 10,
      experienceGained: 10,
      successRate: 100
    }
  ];
}

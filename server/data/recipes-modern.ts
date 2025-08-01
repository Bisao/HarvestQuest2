// Central recipe system - ALL IDs must reference shared/constants/game-ids.ts
import { RESOURCE_IDS, EQUIPMENT_IDS, RECIPE_IDS } from "@shared/constants/game-ids";
import type { InsertRecipe } from "@shared/types";

export function createModernRecipeData(): InsertRecipe[] {
  console.log('🔧 RECIPE-LOADING: Using corrected IDs from game-ids.ts master file');

  return [
    // MATERIAIS BÁSICOS
    {
      id: RECIPE_IDS.BARBANTE,
      name: "Barbante",
      emoji: "🧵",
      category: "basic_materials",
      subcategory: "processed_fiber",
      difficulty: "trivial",
      requiredLevel: 1,
      ingredients: [
        { itemId: RESOURCE_IDS.FIBRA, quantity: 5, consumed: true }
      ],
      outputs: [
        { itemId: RESOURCE_IDS.BARBANTE, quantity: 1, chance: 100 }
      ],
      craftingTime: 5,
      experienceGained: 10,
      successRate: 100
    },

    // FERRAMENTAS
    {
      id: RECIPE_IDS.MACHADO, 
      name: "Machado",
      emoji: "🪓",
      category: "tools",
      subcategory: "cutting_tools",
      difficulty: "easy",
      requiredLevel: 1,
      ingredients: [
        { itemId: RESOURCE_IDS.PEDRAS_SOLTAS, quantity: 1, consumed: true },
        { itemId: RESOURCE_IDS.BARBANTE, quantity: 2, consumed: true },
        { itemId: RESOURCE_IDS.GRAVETOS, quantity: 1, consumed: true }
      ],
      outputs: [
        { itemId: EQUIPMENT_IDS.MACHADO, quantity: 1, chance: 100 }
      ],
      craftingTime: 30,
      experienceGained: 25,
      successRate: 95
    },

    {
      id: RECIPE_IDS.PICARETA,
      name: "Picareta", 
      emoji: "⛏️",
      category: "tools",
      subcategory: "mining_tools",
      difficulty: "easy",
      requiredLevel: 1,
      ingredients: [
        { itemId: RESOURCE_IDS.PEDRAS_SOLTAS, quantity: 2, consumed: true },
        { itemId: RESOURCE_IDS.BARBANTE, quantity: 2, consumed: true },
        { itemId: RESOURCE_IDS.GRAVETOS, quantity: 1, consumed: true }
      ],
      outputs: [
        { itemId: EQUIPMENT_IDS.PICARETA, quantity: 1, chance: 100 }
      ],
      craftingTime: 35,
      experienceGained: 30,
      successRate: 95
    },

    {
      id: RECIPE_IDS.FACA,
      name: "Faca",
      emoji: "🗡️", 
      category: "weapons",
      subcategory: "melee_weapons",
      difficulty: "easy",
      requiredLevel: 1,
      ingredients: [
        { itemId: RESOURCE_IDS.PEDRAS_SOLTAS, quantity: 1, consumed: true },
        { itemId: RESOURCE_IDS.BARBANTE, quantity: 1, consumed: true },
        { itemId: RESOURCE_IDS.GRAVETOS, quantity: 1, consumed: true }
      ],
      outputs: [
        { itemId: EQUIPMENT_IDS.FACA, quantity: 1, chance: 100 }
      ],
      craftingTime: 25,
      experienceGained: 20,
      successRate: 95
    },

    {
      id: RECIPE_IDS.VARA_PESCA,
      name: "Vara de Pesca",
      emoji: "🎣",
      category: "tools",
      subcategory: "fishing_tools", 
      difficulty: "medium",
      requiredLevel: 3,
      ingredients: [
        { itemId: RESOURCE_IDS.GRAVETOS, quantity: 3, consumed: true },
        { itemId: RESOURCE_IDS.FIBRA, quantity: 2, consumed: true }
      ],
      outputs: [
        { itemId: EQUIPMENT_IDS.VARA_PESCA, quantity: 1, chance: 100 }
      ],
      craftingTime: 45,
      experienceGained: 40,
      successRate: 85
    },

    {
      id: RECIPE_IDS.FOICE,
      name: "Foice",
      emoji: "🔪",
      category: "tools",
      subcategory: "harvesting_tools",
      difficulty: "medium", 
      requiredLevel: 2,
      ingredients: [
        { itemId: RESOURCE_IDS.PEDRA, quantity: 1, consumed: true },
        { itemId: RESOURCE_IDS.BARBANTE, quantity: 2, consumed: true },
        { itemId: RESOURCE_IDS.GRAVETOS, quantity: 1, consumed: true }
      ],
      outputs: [
        { itemId: EQUIPMENT_IDS.FOICE, quantity: 1, chance: 100 }
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
        { itemId: RESOURCE_IDS.GRAVETOS, quantity: 2, consumed: true },
        { itemId: RESOURCE_IDS.BARBANTE, quantity: 2, consumed: true },
        { itemId: RESOURCE_IDS.PEDRAS_SOLTAS, quantity: 1, consumed: true }
      ],
      outputs: [
        { itemId: EQUIPMENT_IDS.ARCO_FLECHA, quantity: 1, chance: 100 }
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
        { itemId: RESOURCE_IDS.GRAVETOS, quantity: 2, consumed: true },
        { itemId: RESOURCE_IDS.BARBANTE, quantity: 4, consumed: true },
        { itemId: RESOURCE_IDS.PEDRAS_SOLTAS, quantity: 1, consumed: true }
      ],
      outputs: [
        { itemId: EQUIPMENT_IDS.LANCA, quantity: 1, chance: 100 }
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
        { itemId: RESOURCE_IDS.MADEIRA, quantity: 1, consumed: true },
        { itemId: RESOURCE_IDS.BARBANTE, quantity: 2, consumed: true }
      ],
      outputs: [
        { itemId: EQUIPMENT_IDS.BALDE_MADEIRA, quantity: 1, chance: 100 }
      ],
      craftingTime: 40,
      experienceGained: 35,
      successRate: 90
    },

    {
      id: "rec-garrafa-bambu-001",
      name: "Garrafa de Bambu",
      emoji: "🧴",
      category: "containers",
      subcategory: "liquid_containers",
      difficulty: "medium",
      requiredLevel: 3,
      ingredients: [
        { itemId: RESOURCE_IDS.BAMBU, quantity: 1, consumed: true },
        { itemId: RESOURCE_IDS.BARBANTE, quantity: 1, consumed: true }
      ],
      outputs: [
        { itemId: EQUIPMENT_IDS.GARRAFA_BAMBU, quantity: 1, chance: 100 }
      ],
      craftingTime: 35,
      experienceGained: 30,
      successRate: 90
    },

    {
      id: RECIPE_IDS.MOCHILA,
      name: "Mochila",
      emoji: "🎒",
      category: "containers",
      subcategory: "storage_equipment",
      difficulty: "hard",
      requiredLevel: 5,
      ingredients: [
        { itemId: RESOURCE_IDS.COURO, quantity: 2, consumed: true },
        { itemId: RESOURCE_IDS.BARBANTE, quantity: 5, consumed: true }
      ],
      outputs: [
        { itemId: EQUIPMENT_IDS.MOCHILA, quantity: 1, chance: 100 }
      ],
      craftingTime: 60,
      experienceGained: 50,
      successRate: 80
    },

    {
      id: RECIPE_IDS.CORDA,
      name: "Corda",
      emoji: "🪢",
      category: "basic_materials",
      subcategory: "cordage",
      difficulty: "easy",
      requiredLevel: 2,
      ingredients: [
        { itemId: RESOURCE_IDS.BARBANTE, quantity: 3, consumed: true }
      ],
      outputs: [
        { itemId: EQUIPMENT_IDS.CORDA, quantity: 1, chance: 100 }
      ],
      craftingTime: 20,
      experienceGained: 15,
      successRate: 100
    },

    // CONSUMABLES
    {
      id: RECIPE_IDS.COGUMELOS_ASSADOS,
      name: "Cogumelos Assados",
      emoji: "🍄",
      category: "consumables",
      subcategory: "cooked_food",
      difficulty: "trivial",
      requiredLevel: 1,
      ingredients: [
        { itemId: RESOURCE_IDS.COGUMELOS, quantity: 3, consumed: true },
        { itemId: RESOURCE_IDS.GRAVETOS, quantity: 1, consumed: true }
      ],
      outputs: [
        { itemId: RESOURCE_IDS.COGUMELOS_ASSADOS, quantity: 1, chance: 100 }
      ],
      craftingTime: 15,
      experienceGained: 15,
      successRate: 100
    },

    {
      id: RECIPE_IDS.CARNE_ASSADA,
      name: "Carne Assada",
      emoji: "🥩",
      category: "consumables", 
      subcategory: "cooked_food",
      difficulty: "trivial",
      requiredLevel: 1,
      ingredients: [
        { itemId: RESOURCE_IDS.CARNE, quantity: 1, consumed: true },
        { itemId: RESOURCE_IDS.GRAVETOS, quantity: 1, consumed: true }
      ],
      outputs: [
        { itemId: RESOURCE_IDS.CARNE_ASSADA, quantity: 1, chance: 100 }
      ],
      craftingTime: 20,
      experienceGained: 20,
      successRate: 100
    },

    {
      id: RECIPE_IDS.PEIXE_GRELHADO,
      name: "Peixe Grelhado",
      emoji: "🐟",
      category: "consumables",
      subcategory: "cooked_food",
      difficulty: "trivial",
      requiredLevel: 2,
      ingredients: [
        { itemId: RESOURCE_IDS.PEIXE_PEQUENO, quantity: 1, consumed: true },
        { itemId: RESOURCE_IDS.GRAVETOS, quantity: 1, consumed: true }
      ],
      outputs: [
        { itemId: RESOURCE_IDS.PEIXE_GRELHADO, quantity: 1, chance: 100 }
      ],
      craftingTime: 15,
      experienceGained: 15,
      successRate: 100
    },

    {
      id: RECIPE_IDS.ENSOPADO_CARNE,
      name: "Ensopado de Carne",
      emoji: "🍲",
      category: "consumables",
      subcategory: "cooked_food",
      difficulty: "medium",
      requiredLevel: 4,
      ingredients: [
        { itemId: RESOURCE_IDS.CARNE, quantity: 2, consumed: true },
        { itemId: RESOURCE_IDS.COGUMELOS, quantity: 1, consumed: true },
        { itemId: RESOURCE_IDS.AGUA_FRESCA, quantity: 1, consumed: true },
        { itemId: RESOURCE_IDS.GRAVETOS, quantity: 2, consumed: true }
      ],
      outputs: [
        { itemId: RESOURCE_IDS.ENSOPADO_CARNE, quantity: 1, chance: 100 }
      ],
      craftingTime: 45,
      experienceGained: 40,
      successRate: 90
    },

    // SUCO DE FRUTAS
    {
      id: RECIPE_IDS.SUCO_FRUTAS,
      name: "Suco de Frutas",
      emoji: "🧃",
      category: "consumables",
      subcategory: "cooked_food",
      difficulty: "trivial",
      requiredLevel: 1,
      ingredients: [
        { itemId: RESOURCE_IDS.FRUTAS_SILVESTRES, quantity: 3, consumed: true }
      ],
      outputs: [
        { itemId: RESOURCE_IDS.SUCO_FRUTAS, quantity: 1, chance: 100 }
      ],
      craftingTime: 10,
      experienceGained: 10,
      successRate: 100
    },

    // PANELAS E UTENSÍLIOS DE COZINHA
    {
      id: RECIPE_IDS.PANELA_BARRO,
      name: "Panela de Barro",
      emoji: "🏺",
      category: "tools",
      subcategory: "cooking_tools",
      difficulty: "medium",
      requiredLevel: 3,
      ingredients: [
        { itemId: RESOURCE_IDS.ARGILA, quantity: 2, consumed: true },
        { itemId: RESOURCE_IDS.AGUA_FRESCA, quantity: 1, consumed: true }
      ],
      outputs: [
        { itemId: EQUIPMENT_IDS.PANELA_BARRO, quantity: 1, chance: 100 }
      ],
      craftingTime: 50,
      experienceGained: 35,
      successRate: 85
    },

    {
      id: RECIPE_IDS.PANELA,
      name: "Panela",
      emoji: "🍲",
      category: "tools",
      subcategory: "cooking_tools",
      difficulty: "hard",
      requiredLevel: 6,
      ingredients: [
        { itemId: RESOURCE_IDS.FERRO_FUNDIDO, quantity: 1, consumed: true },
        { itemId: RESOURCE_IDS.MADEIRA, quantity: 1, consumed: true }
      ],
      outputs: [
        { itemId: EQUIPMENT_IDS.PANELA, quantity: 1, chance: 100 }
      ],
      craftingTime: 80,
      experienceGained: 60,
      successRate: 80
    },

    // ISCA PARA PESCA
    {
      id: RECIPE_IDS.ISCA_PESCA,
      name: "Isca para Pesca",
      emoji: "🪱",
      category: "consumables",
      subcategory: "bait",
      difficulty: "trivial",
      requiredLevel: 2,
      ingredients: [
        { itemId: RESOURCE_IDS.COGUMELOS, quantity: 1, consumed: true },
        { itemId: RESOURCE_IDS.FRUTAS_SILVESTRES, quantity: 1, consumed: true }
      ],
      outputs: [
        { itemId: RESOURCE_IDS.ISCA_PESCA, quantity: 3, chance: 100 }
      ],
      craftingTime: 10,
      experienceGained: 8,
      successRate: 100
    }
  ];
}
```

```typescript
// Central recipe system - ALL IDs must reference shared/constants/game-ids.ts
import { RESOURCE_IDS, EQUIPMENT_IDS, RECIPE_IDS } from "@shared/constants/game-ids";
import type { InsertRecipe } from "@shared/types";

export function createModernRecipeData(): InsertRecipe[] {
  console.log('🔧 RECIPE-LOADING: Using corrected IDs from game-ids.ts master file');

  return [
    // MATERIAIS BÁSICOS
    {
      id: RECIPE_IDS.BARBANTE,
      name: "Barbante",
      emoji: "🧵",
      category: "basic_materials",
      subcategory: "processed_fiber",
      difficulty: "trivial",
      requiredLevel: 1,
      ingredients: [
        { itemId: RESOURCE_IDS.FIBRA, quantity: 5, consumed: true }
      ],
      outputs: [
        { itemId: RESOURCE_IDS.BARBANTE, quantity: 1, chance: 100 }
      ],
      craftingTime: 5,
      experienceGained: 10,
      successRate: 100
    },

    // FERRAMENTAS
    {
      id: RECIPE_IDS.MACHADO, 
      name: "Machado",
      emoji: "🪓",
      category: "tools",
      subcategory: "cutting_tools",
      difficulty: "easy",
      requiredLevel: 1,
      ingredients: [
        { itemId: RESOURCE_IDS.PEDRAS_SOLTAS, quantity: 1, consumed: true },
        { itemId: RESOURCE_IDS.BARBANTE, quantity: 2, consumed: true },
        { itemId: RESOURCE_IDS.GRAVETOS, quantity: 1, consumed: true }
      ],
      outputs: [
        { itemId: EQUIPMENT_IDS.MACHADO, quantity: 1, chance: 100 }
      ],
      craftingTime: 30,
      experienceGained: 25,
      successRate: 95
    },

    {
      id: RECIPE_IDS.PICARETA,
      name: "Picareta", 
      emoji: "⛏️",
      category: "tools",
      subcategory: "mining_tools",
      difficulty: "easy",
      requiredLevel: 1,
      ingredients: [
        { itemId: RESOURCE_IDS.PEDRAS_SOLTAS, quantity: 2, consumed: true },
        { itemId: RESOURCE_IDS.BARBANTE, quantity: 2, consumed: true },
        { itemId: RESOURCE_IDS.GRAVETOS, quantity: 1, consumed: true }
      ],
      outputs: [
        { itemId: EQUIPMENT_IDS.PICARETA, quantity: 1, chance: 100 }
      ],
      craftingTime: 35,
      experienceGained: 30,
      successRate: 95
    },

    {
      id: RECIPE_IDS.FACA,
      name: "Faca",
      emoji: "🗡️", 
      category: "weapons",
      subcategory: "melee_weapons",
      difficulty: "easy",
      requiredLevel: 1,
      ingredients: [
        { itemId: RESOURCE_IDS.PEDRAS_SOLTAS, quantity: 1, consumed: true },
        { itemId: RESOURCE_IDS.BARBANTE, quantity: 1, consumed: true },
        { itemId: RESOURCE_IDS.GRAVETOS, quantity: 1, consumed: true }
      ],
      outputs: [
        { itemId: EQUIPMENT_IDS.FACA, quantity: 1, chance: 100 }
      ],
      craftingTime: 25,
      experienceGained: 20,
      successRate: 95
    },

    {
      id: RECIPE_IDS.VARA_PESCA,
      name: "Vara de Pesca",
      emoji: "🎣",
      category: "tools",
      subcategory: "fishing_tools", 
      difficulty: "medium",
      requiredLevel: 3,
      ingredients: [
        { itemId: RESOURCE_IDS.GRAVETOS, quantity: 3, consumed: true },
        { itemId: RESOURCE_IDS.FIBRA, quantity: 2, consumed: true }
      ],
      outputs: [
        { itemId: EQUIPMENT_IDS.VARA_PESCA, quantity: 1, chance: 100 }
      ],
      craftingTime: 45,
      experienceGained: 40,
      successRate: 85
    },

    {
      id: RECIPE_IDS.FOICE,
      name: "Foice",
      emoji: "🔪",
      category: "tools",
      subcategory: "harvesting_tools",
      difficulty: "medium", 
      requiredLevel: 2,
      ingredients: [
        { itemId: RESOURCE_IDS.PEDRA, quantity: 1, consumed: true },
        { itemId: RESOURCE_IDS.BARBANTE, quantity: 2, consumed: true },
        { itemId: RESOURCE_IDS.GRAVETOS, quantity: 1, consumed: true }
      ],
      outputs: [
        { itemId: EQUIPMENT_IDS.FOICE, quantity: 1, chance: 100 }
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
        { itemId: RESOURCE_IDS.GRAVETOS, quantity: 2, consumed: true },
        { itemId: RESOURCE_IDS.BARBANTE, quantity: 2, consumed: true },
        { itemId: RESOURCE_IDS.PEDRAS_SOLTAS, quantity: 1, consumed: true }
      ],
      outputs: [
        { itemId: EQUIPMENT_IDS.ARCO_FLECHA, quantity: 1, chance: 100 }
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
        { itemId: RESOURCE_IDS.GRAVETOS, quantity: 2, consumed: true },
        { itemId: RESOURCE_IDS.BARBANTE, quantity: 4, consumed: true },
        { itemId: RESOURCE_IDS.PEDRAS_SOLTAS, quantity: 1, consumed: true }
      ],
      outputs: [
        { itemId: EQUIPMENT_IDS.LANCA, quantity: 1, chance: 100 }
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
        { itemId: RESOURCE_IDS.MADEIRA, quantity: 1, consumed: true },
        { itemId: RESOURCE_IDS.BARBANTE, quantity: 2, consumed: true }
      ],
      outputs: [
        { itemId: EQUIPMENT_IDS.BALDE_MADEIRA, quantity: 1, chance: 100 }
      ],
      craftingTime: 40,
      experienceGained: 35,
      successRate: 90
    },

    {
      id: "rec-garrafa-bambu-001",
      name: "Garrafa de Bambu",
      emoji: "🧴",
      category: "containers",
      subcategory: "liquid_containers",
      difficulty: "medium",
      requiredLevel: 3,
      ingredients: [
        { itemId: RESOURCE_IDS.BAMBU, quantity: 1, consumed: true },
        { itemId: RESOURCE_IDS.BARBANTE, quantity: 1, consumed: true }
      ],
      outputs: [
        { itemId: EQUIPMENT_IDS.GARRAFA_BAMBU, quantity: 1, chance: 100 }
      ],
      craftingTime: 35,
      experienceGained: 30,
      successRate: 90
    },

    {
      id: RECIPE_IDS.MOCHILA,
      name: "Mochila",
      emoji: "🎒",
      category: "containers",
      subcategory: "storage_equipment",
      difficulty: "hard",
      requiredLevel: 5,
      ingredients: [
        { itemId: RESOURCE_IDS.COURO, quantity: 2, consumed: true },
        { itemId: RESOURCE_IDS.BARBANTE, quantity: 5, consumed: true }
      ],
      outputs: [
        { itemId: EQUIPMENT_IDS.MOCHILA, quantity: 1, chance: 100 }
      ],
      craftingTime: 60,
      experienceGained: 50,
      successRate: 80
    },

    {
      id: RECIPE_IDS.CORDA,
      name: "Corda",
      emoji: "🪢",
      category: "basic_materials",
      subcategory: "cordage",
      difficulty: "easy",
      requiredLevel: 2,
      ingredients: [
        { itemId: RESOURCE_IDS.BARBANTE, quantity: 3, consumed: true }
      ],
      outputs: [
        { itemId: EQUIPMENT_IDS.CORDA, quantity: 1, chance: 100 }
      ],
      craftingTime: 20,
      experienceGained: 15,
      successRate: 100
    },

    // CONSUMABLES
    {
      id: RECIPE_IDS.COGUMELOS_ASSADOS,
      name: "Cogumelos Assados",
      emoji: "🍄",
      category: "consumables",
      subcategory: "cooked_food",
      difficulty: "trivial",
      requiredLevel: 1,
      ingredients: [
        { itemId: RESOURCE_IDS.COGUMELOS, quantity: 3, consumed: true },
        { itemId: RESOURCE_IDS.GRAVETOS, quantity: 1, consumed: true }
      ],
      outputs: [
        { itemId: RESOURCE_IDS.COGUMELOS_ASSADOS, quantity: 1, chance: 100 }
      ],
      craftingTime: 15,
      experienceGained: 15,
      successRate: 100
    },

    {
      id: RECIPE_IDS.CARNE_ASSADA,
      name: "Carne Assada",
      emoji: "🥩",
      category: "consumables", 
      subcategory: "cooked_food",
      difficulty: "trivial",
      requiredLevel: 1,
      ingredients: [
        { itemId: RESOURCE_IDS.CARNE, quantity: 1, consumed: true },
        { itemId: RESOURCE_IDS.GRAVETOS, quantity: 1, consumed: true }
      ],
      outputs: [
        { itemId: RESOURCE_IDS.CARNE_ASSADA, quantity: 1, chance: 100 }
      ],
      craftingTime: 20,
      experienceGained: 20,
      successRate: 100
    },

    {
      id: RECIPE_IDS.PEIXE_GRELHADO,
      name: "Peixe Grelhado",
      emoji: "🐟",
      category: "consumables",
      subcategory: "cooked_food",
      difficulty: "trivial",
      requiredLevel: 2,
      ingredients: [
        { itemId: RESOURCE_IDS.PEIXE_PEQUENO, quantity: 1, consumed: true },
        { itemId: RESOURCE_IDS.GRAVETOS, quantity: 1, consumed: true }
      ],
      outputs: [
        { itemId: RESOURCE_IDS.PEIXE_GRELHADO, quantity: 1, chance: 100 }
      ],
      craftingTime: 15,
      experienceGained: 15,
      successRate: 100
    },

    {
      id: RECIPE_IDS.ENSOPADO_CARNE,
      name: "Ensopado de Carne",
      emoji: "🍲",
      category: "consumables",
      subcategory: "cooked_food",
      difficulty: "medium",
      requiredLevel: 4,
      ingredients: [
        { itemId: RESOURCE_IDS.CARNE, quantity: 2, consumed: true },
        { itemId: RESOURCE_IDS.COGUMELOS, quantity: 1, consumed: true },
        { itemId: RESOURCE_IDS.AGUA_FRESCA, quantity: 1, consumed: true },
        { itemId: RESOURCE_IDS.GRAVETOS, quantity: 2, consumed: true }
      ],
      outputs: [
        { itemId: RESOURCE_IDS.ENSOPADO_CARNE, quantity: 1, chance: 100 }
      ],
      craftingTime: 45,
      experienceGained: 40,
      successRate: 90
    },

    // SUCO DE FRUTAS
    {
      id: RECIPE_IDS.SUCO_FRUTAS,
      name: "Suco de Frutas",
      emoji: "🧃",
      category: "consumables",
      subcategory: "cooked_food",
      difficulty: "trivial",
      requiredLevel: 1,
      ingredients: [
        { itemId: RESOURCE_IDS.FRUTAS_SILVESTRES, quantity: 3, consumed: true }
      ],
      outputs: [
        { itemId: RESOURCE_IDS.SUCO_FRUTAS, quantity: 1, chance: 100 }
      ],
      craftingTime: 10,
      experienceGained: 10,
      successRate: 100
    },

    // PANELAS E UTENSÍLIOS DE COZINHA
    {
      id: RECIPE_IDS.PANELA_BARRO,
      name: "Panela de Barro",
      emoji: "🏺",
      category: "tools",
      subcategory: "cooking_tools",
      difficulty: "medium",
      requiredLevel: 3,
      ingredients: [
        { itemId: RESOURCE_IDS.ARGILA, quantity: 2, consumed: true },
        { itemId: RESOURCE_IDS.AGUA_FRESCA, quantity: 1, consumed: true }
      ],
      outputs: [
        { itemId: EQUIPMENT_IDS.PANELA_BARRO, quantity: 1, chance: 100 }
      ],
      craftingTime: 50,
      experienceGained: 35,
      successRate: 85
    },

    {
      id: RECIPE_IDS.PANELA,
      name: "Panela",
      emoji: "🍲",
      category: "tools",
      subcategory: "cooking_tools",
      difficulty: "hard",
      requiredLevel: 6,
      ingredients: [
        { itemId: RESOURCE_IDS.FERRO_FUNDIDO, quantity: 1, consumed: true },
        { itemId: RESOURCE_IDS.MADEIRA, quantity: 1, consumed: true }
      ],
      outputs: [
        { itemId: EQUIPMENT_IDS.PANELA, quantity: 1, chance: 100 }
      ],
      craftingTime: 80,
      experienceGained: 60,
      successRate: 80
    },

    // ISCA PARA PESCA
    {
      id: RECIPE_IDS.ISCA_PESCA,
      name: "Isca para Pesca",
      emoji: "🪱",
      category: "consumables",
      subcategory: "bait",
      difficulty: "trivial",
      requiredLevel: 2,
      ingredients: [
        { itemId: RESOURCE_IDS.COGUMELOS, quantity: 1, consumed: true },
        { itemId: RESOURCE_IDS.FRUTAS_SILVESTRES, quantity: 1, consumed: true }
      ],
      outputs: [
        { itemId: RESOURCE_IDS.ISCA_PESCA, quantity: 3, chance: 100 }
      ],
      craftingTime: 10,
      experienceGained: 8,
      successRate: 100
    }
  ];
}
```
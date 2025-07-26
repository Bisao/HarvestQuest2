// Recipe data management module
import type { InsertRecipe } from "@shared/schema";

export function createRecipeData(resourceIds: string[]): InsertRecipe[] {
  // Map resource names to their IDs for easier reference
  const resourceMap: Record<string, string> = {
    "fibra": resourceIds[0],        // Fibra
    "pedra": resourceIds[1],        // Pedra  
    "pedras_soltas": resourceIds[2], // Pedras Soltas
    "gravetos": resourceIds[3],     // Gravetos
    "agua_fresca": resourceIds[4],  // Água Fresca
    "bambu": resourceIds[5],        // Bambu
    "madeira": resourceIds[6],      // Madeira
    "argila": resourceIds[7],       // Argila
    "ferro_fundido": resourceIds[8], // Ferro Fundido
    "couro": resourceIds[9],        // Couro
    "carne": resourceIds[10],       // Carne
    "ossos": resourceIds[11],       // Ossos
    "pelo": resourceIds[12],        // Pelo
    "barbante": resourceIds[13],    // Barbante (new resource)
    "cogumelos": resourceIds[17],   // Cogumelos (updated index)
    "frutas_silvestres": resourceIds[18], // Frutas Silvestres (updated index)
    "peixe_pequeno": resourceIds[19], // Peixe Pequeno (updated index)
    "peixe_grande": resourceIds[20], // Peixe Grande (updated index)
  };

  return [
    // MATERIAIS BÁSICOS
    {
      name: "Barbante",
      emoji: "🧵",
      requiredLevel: 1,
      ingredients: { [resourceMap.fibra]: 5 },
      output: { [resourceMap.barbante]: 1 }
    },
    
    // FERRAMENTAS
    {
      name: "Machado",
      emoji: "🪓",
      requiredLevel: 1,
      ingredients: { [resourceMap.pedras_soltas]: 1, [resourceMap.barbante]: 2, [resourceMap.gravetos]: 1 },
      output: { "axe": 1 }
    },
    {
      name: "Picareta",
      emoji: "⛏️",
      requiredLevel: 1,
      ingredients: { [resourceMap.pedras_soltas]: 2, [resourceMap.barbante]: 2, [resourceMap.gravetos]: 1 },
      output: { "pickaxe": 1 }
    },
    {
      name: "Foice",
      emoji: "🔪",
      requiredLevel: 2,
      ingredients: { [resourceMap.pedras_soltas]: 1, [resourceMap.barbante]: 2, [resourceMap.gravetos]: 1 },
      output: { "sickle": 1 }
    },
    {
      name: "Balde de Madeira",
      emoji: "🪣",
      requiredLevel: 2,
      ingredients: { [resourceMap.madeira]: 1, [resourceMap.barbante]: 2 },
      output: { "bucket": 1 }
    },
    {
      name: "Faca",
      emoji: "🗡️",
      requiredLevel: 1,
      ingredients: { [resourceMap.pedras_soltas]: 1, [resourceMap.barbante]: 1, [resourceMap.gravetos]: 1 },
      output: { "knife": 1 }
    },
    {
      name: "Vara de Pesca",
      emoji: "🎣",
      requiredLevel: 3,
      ingredients: { [resourceMap.gravetos]: 3, [resourceMap.fibra]: 2 },
      output: { "fishing_rod": 1 }
    },
    
    // ARMAS
    {
      name: "Arco e Flecha",
      emoji: "🏹",
      requiredLevel: 5,
      ingredients: { [resourceMap.gravetos]: 2, [resourceMap.barbante]: 2, [resourceMap.pedras_soltas]: 1 },
      output: { "bow": 1 }
    },
    {
      name: "Lança",
      emoji: "🔱",
      requiredLevel: 4,
      ingredients: { [resourceMap.gravetos]: 2, [resourceMap.barbante]: 4, [resourceMap.pedras_soltas]: 1 },
      output: { "spear": 1 }
    },
    
    // EQUIPAMENTOS
    {
      name: "Mochila",
      emoji: "🎒",
      requiredLevel: 5,
      ingredients: { [resourceMap.couro]: 2, [resourceMap.barbante]: 4 },
      output: { "backpack": 1 }
    },
    
    // MATERIAIS AVANÇADOS
    {
      name: "Corda",
      emoji: "🪢",
      requiredLevel: 3,
      ingredients: { [resourceMap.couro]: 2 },
      output: { "rope": 1 },

    },
    {
      name: "Isca para Pesca",
      emoji: "🪱",
      requiredLevel: 2,
      ingredients: { [resourceMap.fibra]: 1, [resourceMap.frutas_silvestres]: 1 },
      output: { "bait": 1 }
    },
    
    // UTENSÍLIOS DE COZINHA
    {
      name: "Panela de Barro",
      emoji: "🏺",
      requiredLevel: 4,
      ingredients: { [resourceMap.argila]: 10 },
      output: { "clay_pot": 1 }
    },
    {
      name: "Panela",
      emoji: "🫕",
      requiredLevel: 6,
      ingredients: { [resourceMap.ferro_fundido]: 2 },
      output: { "pot": 1 }
    },
    {
      name: "Garrafa de Bambu",
      emoji: "🎍",
      requiredLevel: 2,
      ingredients: { [resourceMap.bambu]: 2 },
      output: { "bamboo_bottle": 1 }
    },
    
    // COMIDAS E BEBIDAS
    {
      name: "Suco de Frutas",
      emoji: "🧃",
      requiredLevel: 1,
      ingredients: { [resourceMap.agua_fresca]: 1, "bamboo_bottle": 1 },
      output: { "fruit_juice": 1 },

    },
    {
      name: "Cogumelos Assados",
      emoji: "🍄‍🟫",
      requiredLevel: 1,
      ingredients: { [resourceMap.cogumelos]: 3, [resourceMap.gravetos]: 1 },
      output: { "roasted_mushrooms": 1 }
    },
    {
      name: "Peixe Grelhado",
      emoji: "🐟",
      requiredLevel: 1,
      ingredients: { [resourceMap.peixe_pequeno]: 1, [resourceMap.gravetos]: 1 },
      output: { "grilled_fish": 1 }
    },
    {
      name: "Carne Assada",
      emoji: "🍖",
      requiredLevel: 1,
      ingredients: { [resourceMap.carne]: 1, [resourceMap.gravetos]: 1 },
      output: { "roasted_meat": 1 }
    },
    {
      name: "Ensopado de Carne",
      emoji: "🍲",
      requiredLevel: 3,
      ingredients: { "clay_pot": 1, [resourceMap.carne]: 2, [resourceMap.agua_fresca]: 3 },
      output: { "meat_stew": 1 },

    }
  ];
}
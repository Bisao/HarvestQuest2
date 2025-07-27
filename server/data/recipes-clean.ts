// Sistema de receitas limpo e organizado - versão impecável
import type { InsertRecipe } from "@shared/schema";

export function createRecipeData(resourceIds: string[]): InsertRecipe[] {
  // Map resource names to their IDs for easier reference
  const resourceMap: Record<string, string> = {
    "fibra": resourceIds[0],
    "pedra": resourceIds[1],
    "pedras_soltas": resourceIds[2],
    "gravetos": resourceIds[3],
    "agua_fresca": resourceIds[4],
    "bambu": resourceIds[5],
    "madeira": resourceIds[6],
    "argila": resourceIds[7],
    "ferro_fundido": resourceIds[8],
    "couro": resourceIds[9],
    "carne": resourceIds[10],
    "ossos": resourceIds[11],
    "pelo": resourceIds[12],
    "barbante": resourceIds[13],
    "cogumelos": resourceIds[17],
    "frutas_silvestres": resourceIds[18],
    "peixe_pequeno": resourceIds[19],
    "peixe_grande": resourceIds[20],
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
    {
      name: "Cola Natural",
      emoji: "🍯",
      requiredLevel: 15,
      ingredients: { "resina_de_arvore": 2, [resourceMap.ossos]: 3 },
      output: { "natural_glue": 1 }
    },
    
    // FERRAMENTAS EVOLUTIVAS - MACHADOS (3 TIERS)
    {
      name: "Machado Improvisado",
      emoji: "🪓",
      requiredLevel: 1,
      ingredients: { [resourceMap.pedras_soltas]: 1, [resourceMap.barbante]: 2, [resourceMap.gravetos]: 1 },
      output: { "axe": 1 }
    },
    {
      name: "Machado de Ferro",
      emoji: "🪓",
      requiredLevel: 8,
      ingredients: { [resourceMap.ferro_fundido]: 2, [resourceMap.madeira]: 1, [resourceMap.barbante]: 3 },
      output: { "axe": 1 }
    },
    {
      name: "Machado Avançado",
      emoji: "🪓",
      requiredLevel: 15,
      ingredients: { [resourceMap.ferro_fundido]: 2, "natural_glue": 1, [resourceMap.madeira]: 2 },
      output: { "axe": 1 }
    },
    
    // FERRAMENTAS EVOLUTIVAS - PICARETAS (3 TIERS)
    {
      name: "Picareta Improvisada", 
      emoji: "⛏️",
      requiredLevel: 1,
      ingredients: { [resourceMap.pedras_soltas]: 2, [resourceMap.barbante]: 2, [resourceMap.gravetos]: 1 },
      output: { "pickaxe": 1 }
    },
    {
      name: "Picareta de Ferro",
      emoji: "⛏️", 
      requiredLevel: 10,
      ingredients: { [resourceMap.ferro_fundido]: 3, [resourceMap.madeira]: 1, [resourceMap.barbante]: 3 },
      output: { "pickaxe": 1 }
    },
    {
      name: "Picareta Avançada",
      emoji: "⛏️",
      requiredLevel: 18,
      ingredients: { [resourceMap.ferro_fundido]: 3, "natural_glue": 2, [resourceMap.madeira]: 1 },
      output: { "pickaxe": 1 }
    },

    // FERRAMENTAS EVOLUTIVAS - PÁS (3 TIERS)
    {
      name: "Pá Improvisada",
      emoji: "🔺",
      requiredLevel: 2,
      ingredients: { [resourceMap.madeira]: 1, [resourceMap.barbante]: 2, [resourceMap.gravetos]: 1 },
      output: { "shovel": 1 }
    },
    {
      name: "Pá de Ferro",
      emoji: "🏗️",
      requiredLevel: 9,
      ingredients: { [resourceMap.ferro_fundido]: 2, [resourceMap.madeira]: 1, [resourceMap.barbante]: 3 },
      output: { "shovel": 1 }
    },
    {
      name: "Pá Avançada",
      emoji: "⚡",
      requiredLevel: 20,
      ingredients: { [resourceMap.ferro_fundido]: 2, "natural_glue": 1, [resourceMap.couro]: 1 },
      output: { "shovel": 1 }
    },

    // FERRAMENTAS EVOLUTIVAS - VARAS DE PESCA (3 TIERS)
    {
      name: "Vara de Pesca Improvisada",
      emoji: "🎣",
      requiredLevel: 3,
      ingredients: { [resourceMap.bambu]: 2, [resourceMap.barbante]: 3, [resourceMap.gravetos]: 1 },
      output: { "fishing_rod": 1 }
    },
    {
      name: "Vara de Pesca de Ferro", 
      emoji: "🎣",
      requiredLevel: 12,
      ingredients: { [resourceMap.ferro_fundido]: 1, [resourceMap.bambu]: 2, [resourceMap.barbante]: 4 },
      output: { "fishing_rod": 1 }
    },
    {
      name: "Vara de Pesca Avançada",
      emoji: "🎣",
      requiredLevel: 24,
      ingredients: { [resourceMap.ferro_fundido]: 1, "natural_glue": 1, "mel_selvagem": 1 },
      output: { "fishing_rod": 1 }
    },

    // FERRAMENTAS EVOLUTIVAS - FOICES (3 TIERS)
    {
      name: "Foice Improvisada",
      emoji: "🔪",
      requiredLevel: 2,
      ingredients: { [resourceMap.pedras_soltas]: 1, [resourceMap.barbante]: 2, [resourceMap.gravetos]: 1 },
      output: { "sickle": 1 }
    },
    {
      name: "Foice de Ferro",
      emoji: "🔪",
      requiredLevel: 10,
      ingredients: { [resourceMap.ferro_fundido]: 1, [resourceMap.madeira]: 1, [resourceMap.barbante]: 3 },
      output: { "sickle": 1 }
    },
    {
      name: "Foice Avançada",
      emoji: "🔪",
      requiredLevel: 22,
      ingredients: { [resourceMap.ferro_fundido]: 1, "natural_glue": 1, "ervas_medicinais": 2 },
      output: { "sickle": 1 }
    },

    // FERRAMENTAS EVOLUTIVAS - FACAS (3 TIERS)
    {
      name: "Faca Improvisada",
      emoji: "🗡️",
      requiredLevel: 1,
      ingredients: { [resourceMap.pedras_soltas]: 1, [resourceMap.barbante]: 1, [resourceMap.gravetos]: 1 },
      output: { "knife": 1 }
    },
    {
      name: "Faca de Ferro",
      emoji: "🗡️",
      requiredLevel: 8,
      ingredients: { [resourceMap.ferro_fundido]: 1, [resourceMap.madeira]: 1, [resourceMap.barbante]: 2 },
      output: { "knife": 1 }
    },
    {
      name: "Faca Avançada",
      emoji: "🗡️",
      requiredLevel: 19,
      ingredients: { [resourceMap.ferro_fundido]: 1, "natural_glue": 1, [resourceMap.couro]: 1 },
      output: { "knife": 1 }
    },

    // FERRAMENTAS EVOLUTIVAS - BALDES (3 TIERS)
    {
      name: "Balde Improvisado",
      emoji: "🪣",
      requiredLevel: 2,
      ingredients: { [resourceMap.madeira]: 3, [resourceMap.barbante]: 4 },
      output: { "bucket": 1 }
    },
    {
      name: "Balde de Ferro",
      emoji: "🪣",
      requiredLevel: 11,
      ingredients: { [resourceMap.ferro_fundido]: 2, [resourceMap.barbante]: 3 },
      output: { "bucket": 1 }
    },
    {
      name: "Balde Avançado",
      emoji: "🪣",
      requiredLevel: 23,
      ingredients: { [resourceMap.ferro_fundido]: 2, "natural_glue": 1, "mel_selvagem": 1 },
      output: { "bucket": 1 }
    },

    // ARMAS EVOLUTIVAS - ESPADAS (3 TIERS)
    {
      name: "Espada Improvisada",
      emoji: "⚔️",
      requiredLevel: 1,
      ingredients: { [resourceMap.pedras_soltas]: 2, [resourceMap.gravetos]: 1, [resourceMap.barbante]: 2 },
      output: { "sword": 1 }
    },
    {
      name: "Espada de Ferro",
      emoji: "⚔️",
      requiredLevel: 12,
      ingredients: { [resourceMap.ferro_fundido]: 2, [resourceMap.madeira]: 1, [resourceMap.barbante]: 3 },
      output: { "sword": 1 }
    },
    {
      name: "Espada Avançada",
      emoji: "⚔️",
      requiredLevel: 25,
      ingredients: { [resourceMap.ferro_fundido]: 2, "natural_glue": 1, [resourceMap.madeira]: 2, "mel_selvagem": 1 },
      output: { "sword": 1 }
    },

    // ARMAS EVOLUTIVAS - ARCOS (3 TIERS)
    {
      name: "Arco Improvisado",
      emoji: "🏹",
      requiredLevel: 5,
      ingredients: { [resourceMap.gravetos]: 2, [resourceMap.barbante]: 2, [resourceMap.pedras_soltas]: 1 },
      output: { "bow": 1 }
    },
    {
      name: "Arco de Ferro",
      emoji: "🏹",
      requiredLevel: 15,
      ingredients: { [resourceMap.ferro_fundido]: 1, [resourceMap.madeira]: 2, [resourceMap.barbante]: 4 },
      output: { "bow": 1 }
    },
    {
      name: "Arco Avançado",
      emoji: "🏹",
      requiredLevel: 30,
      ingredients: { [resourceMap.ferro_fundido]: 1, "natural_glue": 1, [resourceMap.madeira]: 3, "resina_de_arvore": 1 },
      output: { "bow": 1 }
    },

    // ARMAS EVOLUTIVAS - LANÇAS (3 TIERS)
    {
      name: "Lança Improvisada",
      emoji: "🔱",
      requiredLevel: 4,
      ingredients: { [resourceMap.gravetos]: 2, [resourceMap.barbante]: 3, [resourceMap.pedras_soltas]: 1 },
      output: { "spear": 1 }
    },
    {
      name: "Lança de Ferro",
      emoji: "🔱",
      requiredLevel: 16,
      ingredients: { [resourceMap.madeira]: 2, [resourceMap.ferro_fundido]: 2, [resourceMap.barbante]: 4 },
      output: { "spear": 1 }
    },
    {
      name: "Lança Avançada",
      emoji: "🔱",
      requiredLevel: 32,
      ingredients: { [resourceMap.madeira]: 3, [resourceMap.ferro_fundido]: 2, "natural_glue": 2, "ervas_medicinais": 1 },
      output: { "spear": 1 }
    },

    // ARMAS EVOLUTIVAS - BESTAS (3 TIERS)
    {
      name: "Besta Improvisada",
      emoji: "🏹",
      requiredLevel: 8,
      ingredients: { [resourceMap.madeira]: 3, [resourceMap.ferro_fundido]: 1, [resourceMap.barbante]: 5 },
      output: { "crossbow": 1 }
    },
    {
      name: "Besta de Ferro",
      emoji: "🏹",
      requiredLevel: 18,
      ingredients: { [resourceMap.madeira]: 3, [resourceMap.ferro_fundido]: 3, [resourceMap.barbante]: 6, [resourceMap.couro]: 1 },
      output: { "crossbow": 1 }
    },
    {
      name: "Besta Avançada",
      emoji: "🏹",
      requiredLevel: 35,
      ingredients: { [resourceMap.madeira]: 4, [resourceMap.ferro_fundido]: 3, "natural_glue": 3, "mel_selvagem": 2 },
      output: { "crossbow": 1 }
    },

    // ARMADURAS EVOLUTIVAS - CAPACETES (3 TIERS)
    {
      name: "Capacete Improvisado",
      emoji: "🎩",
      requiredLevel: 1,
      ingredients: { [resourceMap.couro]: 1, [resourceMap.barbante]: 2 },
      output: { "helmet": 1 }
    },
    {
      name: "Capacete de Ferro",
      emoji: "🪖",
      requiredLevel: 8,
      ingredients: { [resourceMap.ferro_fundido]: 2, [resourceMap.barbante]: 2 },
      output: { "helmet": 1 }
    },
    {
      name: "Capacete Avançado",
      emoji: "👑",
      requiredLevel: 20,
      ingredients: { [resourceMap.ferro_fundido]: 1, "natural_glue": 1, "mel_selvagem": 1 },
      output: { "helmet": 1 }
    },

    // ARMADURAS EVOLUTIVAS - PEITORAIS (3 TIERS)
    {
      name: "Peitoral Improvisado",
      emoji: "🦺",
      requiredLevel: 3,
      ingredients: { [resourceMap.couro]: 3, [resourceMap.barbante]: 4 },
      output: { "chestplate": 1 }
    },
    {
      name: "Peitoral de Ferro",
      emoji: "🛡️",
      requiredLevel: 10,
      ingredients: { [resourceMap.ferro_fundido]: 4, [resourceMap.barbante]: 3 },
      output: { "chestplate": 1 }
    },
    {
      name: "Peitoral Avançado",
      emoji: "✨",
      requiredLevel: 22,
      ingredients: { [resourceMap.ferro_fundido]: 3, "natural_glue": 2, "resina_de_arvore": 1 },
      output: { "chestplate": 1 }
    },

    // ARMADURAS EVOLUTIVAS - CALÇAS (3 TIERS)
    {
      name: "Calças Improvisadas",
      emoji: "👖",
      requiredLevel: 2,
      ingredients: { [resourceMap.couro]: 2, [resourceMap.barbante]: 3 },
      output: { "leggings": 1 }
    },
    {
      name: "Calças de Ferro",
      emoji: "🦵",
      requiredLevel: 9,
      ingredients: { [resourceMap.ferro_fundido]: 3, [resourceMap.barbante]: 3 },
      output: { "leggings": 1 }
    },
    {
      name: "Calças Avançadas",
      emoji: "🌟",
      requiredLevel: 21,
      ingredients: { [resourceMap.ferro_fundido]: 2, "natural_glue": 1, "ervas_medicinais": 2 },
      output: { "leggings": 1 }
    },

    // ARMADURAS EVOLUTIVAS - BOTAS (3 TIERS)
    {
      name: "Botas Improvisadas",
      emoji: "🥾",
      requiredLevel: 1,
      ingredients: { [resourceMap.couro]: 1, [resourceMap.barbante]: 2 },
      output: { "boots": 1 }
    },
    {
      name: "Botas de Ferro",
      emoji: "👢",
      requiredLevel: 7,
      ingredients: { [resourceMap.ferro_fundido]: 2, [resourceMap.barbante]: 2 },
      output: { "boots": 1 }
    },
    {
      name: "Botas Avançadas",
      emoji: "🌈",
      requiredLevel: 18,
      ingredients: { [resourceMap.ferro_fundido]: 1, "natural_glue": 1, "penas": 3 },
      output: { "boots": 1 }
    },

    // EQUIPAMENTOS EVOLUTIVOS - MOCHILAS (3 TIERS)
    {
      name: "Mochila Improvisada",
      emoji: "🎒",
      requiredLevel: 4,
      ingredients: { [resourceMap.couro]: 2, [resourceMap.barbante]: 4 },
      output: { "backpack": 1 }
    },
    {
      name: "Mochila de Ferro",
      emoji: "🎒",
      requiredLevel: 11,
      ingredients: { [resourceMap.ferro_fundido]: 2, [resourceMap.couro]: 3, [resourceMap.barbante]: 6 },
      output: { "backpack": 1 }
    },
    {
      name: "Mochila Avançada",
      emoji: "🎒",
      requiredLevel: 25,
      ingredients: { [resourceMap.ferro_fundido]: 1, "natural_glue": 2, [resourceMap.couro]: 2, "mel_selvagem": 2 },
      output: { "backpack": 1 }
    },

    // EQUIPAMENTOS EVOLUTIVOS - BOLSAS DE COMIDA (3 TIERS)
    {
      name: "Bolsa de Comida Improvisada",
      emoji: "🥘",
      requiredLevel: 6,
      ingredients: { [resourceMap.couro]: 1, [resourceMap.barbante]: 3, [resourceMap.pelo]: 2 },
      output: { "foodbag": 1 }
    },
    {
      name: "Bolsa de Comida de Ferro",
      emoji: "🥘",
      requiredLevel: 13,
      ingredients: { [resourceMap.ferro_fundido]: 1, [resourceMap.couro]: 2, [resourceMap.barbante]: 4 },
      output: { "foodbag": 1 }
    },
    {
      name: "Bolsa de Comida Avançada",
      emoji: "🥘",
      requiredLevel: 26,
      ingredients: { [resourceMap.ferro_fundido]: 1, "natural_glue": 1, [resourceMap.couro]: 1, "mel_selvagem": 1 },
      output: { "foodbag": 1 }
    },

    // ALIMENTOS EVOLUTIVOS - CARNES (3 TIERS)
    {
      name: "Carne Assada",
      emoji: "🥩",
      requiredLevel: 1,
      ingredients: { [resourceMap.carne]: 1, [resourceMap.gravetos]: 1 },
      output: { "cooked_meat": 1 }
    },
    {
      name: "Carne Grelhada",
      emoji: "🥩",
      requiredLevel: 5,
      ingredients: { [resourceMap.carne]: 2, [resourceMap.gravetos]: 2, [resourceMap.madeira]: 1 },
      output: { "cooked_meat": 2 }
    },
    {
      name: "Carne Defumada",
      emoji: "🥩",
      requiredLevel: 12,
      ingredients: { [resourceMap.carne]: 3, [resourceMap.madeira]: 2, "mel_selvagem": 1 },
      output: { "cooked_meat": 4 }
    },

    // ALIMENTOS EVOLUTIVOS - ENSOPADOS (3 TIERS)
    {
      name: "Ensopado Simples",
      emoji: "🍲",
      requiredLevel: 3,
      ingredients: { [resourceMap.carne]: 1, [resourceMap.agua_fresca]: 2, [resourceMap.cogumelos]: 1 },
      output: { "stew": 1 }
    },
    {
      name: "Ensopado Nutritivo",
      emoji: "🍲",
      requiredLevel: 8,
      ingredients: { [resourceMap.carne]: 2, [resourceMap.agua_fresca]: 3, [resourceMap.cogumelos]: 2, [resourceMap.frutas_silvestres]: 1 },
      output: { "stew": 2 }
    },
    {
      name: "Ensopado Especial",
      emoji: "🍲",
      requiredLevel: 15,
      ingredients: { [resourceMap.carne]: 3, [resourceMap.agua_fresca]: 4, "ervas_medicinais": 2, "mel_selvagem": 1 },
      output: { "stew": 3 }
    },

    // ALIMENTOS EVOLUTIVOS - COGUMELOS (3 TIERS)
    {
      name: "Cogumelos Assados",
      emoji: "🍄",
      requiredLevel: 2,
      ingredients: { [resourceMap.cogumelos]: 3, [resourceMap.gravetos]: 1 },
      output: { "cooked_mushrooms": 1 }
    },
    {
      name: "Cogumelos Grelhados",
      emoji: "🍄",
      requiredLevel: 6,
      ingredients: { [resourceMap.cogumelos]: 4, [resourceMap.madeira]: 1, [resourceMap.barbante]: 1 },
      output: { "cooked_mushrooms": 2 }
    },
    {
      name: "Cogumelos Refogados",
      emoji: "🍄",
      requiredLevel: 10,
      ingredients: { [resourceMap.cogumelos]: 5, [resourceMap.couro]: 1, "ervas_medicinais": 1 },
      output: { "cooked_mushrooms": 3 }
    },

    // ALIMENTOS EVOLUTIVOS - PEIXES (3 TIERS)
    {
      name: "Peixe Grelhado",
      emoji: "🐟",
      requiredLevel: 4,
      ingredients: { [resourceMap.peixe_pequeno]: 2, [resourceMap.gravetos]: 1 },
      output: { "cooked_fish": 1 }
    },
    {
      name: "Peixe Assado",
      emoji: "🐟",
      requiredLevel: 7,
      ingredients: { [resourceMap.peixe_grande]: 1, [resourceMap.madeira]: 1, [resourceMap.barbante]: 1 },
      output: { "cooked_fish": 2 }
    },
    {
      name: "Peixe Defumado",
      emoji: "🐟",
      requiredLevel: 14,
      ingredients: { [resourceMap.peixe_grande]: 2, [resourceMap.madeira]: 2, "mel_selvagem": 1 },
      output: { "cooked_fish": 3 }
    },

    // ALIMENTOS EVOLUTIVOS - BEBIDAS (3 TIERS)
    {
      name: "Suco de Frutas",
      emoji: "🥤",
      requiredLevel: 3,
      ingredients: { [resourceMap.frutas_silvestres]: 3, [resourceMap.agua_fresca]: 1 },
      output: { "fruit_juice": 1 }
    },
    {
      name: "Vitamina Natural",
      emoji: "🥤",
      requiredLevel: 9,
      ingredients: { [resourceMap.frutas_silvestres]: 4, [resourceMap.agua_fresca]: 2, [resourceMap.cogumelos]: 1 },
      output: { "fruit_juice": 2 }
    },
    {
      name: "Elixir Energético",
      emoji: "🥤",
      requiredLevel: 16,
      ingredients: { [resourceMap.frutas_silvestres]: 5, [resourceMap.agua_fresca]: 3, "ervas_medicinais": 2, "mel_selvagem": 1 },
      output: { "fruit_juice": 3 }
    },

    // UTENSÍLIOS DE COZINHA
    {
      name: "Panela de Barro",
      emoji: "🏺",
      requiredLevel: 5,
      ingredients: { [resourceMap.argila]: 10 },
      output: { "clay_pot": 1 }
    },
    {
      name: "Panela de Ferro",
      emoji: "🍲",
      requiredLevel: 12,
      ingredients: { [resourceMap.ferro_fundido]: 2 },
      output: { "iron_pot": 1 }
    },
    {
      name: "Garrafa de Bambu",
      emoji: "🎍",
      requiredLevel: 4,
      ingredients: { [resourceMap.bambu]: 2 },
      output: { "bamboo_bottle": 1 }
    },

    // EQUIPAMENTOS UTILITÁRIOS
    {
      name: "Corda",
      emoji: "🪢",
      requiredLevel: 6,
      ingredients: { [resourceMap.couro]: 2 },
      output: { "rope": 1 }
    },
    {
      name: "Isca para Pesca",
      emoji: "🪱",
      requiredLevel: 2,
      ingredients: { [resourceMap.fibra]: 1, [resourceMap.frutas_silvestres]: 1 },
      output: { "fishing_bait": 1 }
    },
    {
      name: "Armadilha Simples",
      emoji: "🕳️",
      requiredLevel: 8,
      ingredients: { [resourceMap.madeira]: 3, [resourceMap.barbante]: 5, [resourceMap.pedra]: 2 },
      output: { "simple_trap": 1 }
    }
  ];
}
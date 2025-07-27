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
    
    // FERRAMENTAS EVOLUTIVAS - NÍVEL IMPROVISADO
    {
      name: "Machado Improvisado",
      emoji: "🪓",
      requiredLevel: 1,
      ingredients: { [resourceMap.pedras_soltas]: 1, [resourceMap.barbante]: 2, [resourceMap.gravetos]: 1 },
      output: { "axe": 1 }
    },
    {
      name: "Picareta Improvisada", 
      emoji: "⛏️",
      requiredLevel: 1,
      ingredients: { [resourceMap.pedras_soltas]: 2, [resourceMap.barbante]: 2, [resourceMap.gravetos]: 1 },
      output: { "pickaxe": 1 }
    },
    
    // FERRAMENTAS EVOLUTIVAS - NÍVEL FERRO
    {
      name: "Machado de Ferro",
      emoji: "🪓",
      requiredLevel: 8,
      ingredients: { [resourceMap.ferro_fundido]: 2, [resourceMap.madeira]: 1, [resourceMap.barbante]: 3 },
      output: { "axe": 1 }
    },
    {
      name: "Picareta de Ferro",
      emoji: "⛏️", 
      requiredLevel: 10,
      ingredients: { [resourceMap.ferro_fundido]: 3, [resourceMap.madeira]: 1, [resourceMap.barbante]: 3 },
      output: { "pickaxe": 1 }
    },
    
    // FERRAMENTAS EVOLUTIVAS - NÍVEL AVANÇADO
    {
      name: "Machado Avançado",
      emoji: "🪓",
      requiredLevel: 15,
      ingredients: { [resourceMap.ferro_fundido]: 2, "natural_glue": 1, [resourceMap.madeira]: 2 },
      output: { "axe": 1 }
    },
    {
      name: "Picareta Avançada",
      emoji: "⛏️",
      requiredLevel: 18,
      ingredients: { [resourceMap.ferro_fundido]: 3, "natural_glue": 2, [resourceMap.madeira]: 1 },
      output: { "pickaxe": 1 }
    },
    
    // FERRAMENTAS ESPECIALIZADAS - PÁS
    {
      name: "Pá de Madeira",
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
      name: "Pá Elite",
      emoji: "⚡",
      requiredLevel: 20,
      ingredients: { [resourceMap.ferro_fundido]: 2, "natural_glue": 1, [resourceMap.couro]: 1 },
      output: { "shovel": 1 }
    },
    
    // FERRAMENTAS ESPECIALIZADAS - VARAS DE PESCA
    {
      name: "Vara de Pesca Simples",
      emoji: "🎣",
      requiredLevel: 3,
      ingredients: { [resourceMap.bambu]: 2, [resourceMap.barbante]: 3, [resourceMap.gravetos]: 1 },
      output: { "fishing_rod": 1 }
    },
    {
      name: "Vara de Pesca Reforçada",
      emoji: "🎣",
      requiredLevel: 12,
      ingredients: { [resourceMap.ferro_fundido]: 1, [resourceMap.bambu]: 2, [resourceMap.barbante]: 4 },
      output: { "fishing_rod": 1 }
    },
    {
      name: "Vara de Pesca Mágica",
      emoji: "🎣",
      requiredLevel: 24,
      ingredients: { [resourceMap.ferro_fundido]: 1, "natural_glue": 1, "mel_selvagem": 1 },
      output: { "fishing_rod": 1 }
    },
    
    // FERRAMENTAS ESPECIALIZADAS - FOICES
    {
      name: "Foice de Pedra",
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
      name: "Foice Druídica",
      emoji: "🔪",
      requiredLevel: 22,
      ingredients: { [resourceMap.ferro_fundido]: 1, "natural_glue": 1, "ervas_medicinais": 2 },
      output: { "sickle": 1 }
    },
    
    // FERRAMENTAS ESPECIALIZADAS - FACAS
    {
      name: "Faca de Pedra",
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
      name: "Faca de Caçador",
      emoji: "🗡️",
      requiredLevel: 19,
      ingredients: { [resourceMap.ferro_fundido]: 1, "natural_glue": 1, [resourceMap.couro]: 1 },
      output: { "knife": 1 }
    },
    
    // FERRAMENTAS ESPECIALIZADAS - BALDES
    {
      name: "Balde de Madeira",
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
      name: "Balde Mágico",
      emoji: "🪣",
      requiredLevel: 23,
      ingredients: { [resourceMap.ferro_fundido]: 2, "natural_glue": 1, "mel_selvagem": 1 },
      output: { "bucket": 1 }
    },
    {
      name: "Picareta Avançada",
      emoji: "⛏️",
      requiredLevel: 18,
      ingredients: { [resourceMap.ferro_fundido]: 3, "natural_glue": 1, [resourceMap.madeira]: 2 },
      output: { "pickaxe": 1 }
    },
    {
      name: "Foice",
      emoji: "🔪",
      requiredLevel: 2,
      ingredients: { [resourceMap.pedra]: 1, [resourceMap.barbante]: 2, [resourceMap.gravetos]: 1 },
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
    
    // ARMAS EVOLUTIVAS - NÍVEL IMPROVISADO
    {
      name: "Espada Improvisada",
      emoji: "⚔️",
      requiredLevel: 1,
      ingredients: { [resourceMap.pedras_soltas]: 2, [resourceMap.gravetos]: 1, [resourceMap.barbante]: 2 },
      output: { "sword": 1 }
    },
    {
      name: "Arco Simples",
      emoji: "🏹",
      requiredLevel: 5,
      ingredients: { [resourceMap.gravetos]: 2, [resourceMap.barbante]: 2, [resourceMap.pedras_soltas]: 1 },
      output: { "bow": 1 }
    },
    
    // ARMAS EVOLUTIVAS - NÍVEL FERRO
    {
      name: "Espada de Ferro",
      emoji: "⚔️",
      requiredLevel: 12,
      ingredients: { [resourceMap.ferro_fundido]: 2, [resourceMap.madeira]: 1, [resourceMap.barbante]: 3 },
      output: { "sword": 1 }
    },
    {
      name: "Arco Composto",
      emoji: "🏹",
      requiredLevel: 15,
      ingredients: { [resourceMap.ferro_fundido]: 1, [resourceMap.madeira]: 2, [resourceMap.barbante]: 4 },
      output: { "bow": 1 }
    },
    
    // ARMAS EVOLUTIVAS - NÍVEL ÉLFICO
    {
      name: "Espada Élfica",
      emoji: "⚔️",
      requiredLevel: 25,
      ingredients: { [resourceMap.ferro_fundido]: 2, "natural_glue": 1, [resourceMap.madeira]: 2, "mel_selvagem": 1 },
      output: { "sword": 1 }
    },
    {
      name: "Arco Élfico",
      emoji: "🏹",
      requiredLevel: 30,
      ingredients: { [resourceMap.ferro_fundido]: 1, "natural_glue": 1, [resourceMap.madeira]: 3, "resina_de_arvore": 1 },
      output: { "bow": 1 }
    },
    
    // ARMAS ADICIONAIS - LANÇAS (3 VARIAÇÕES)
    {
      name: "Lança de Madeira",
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
      name: "Lança Ancestral",
      emoji: "🔱",
      requiredLevel: 32,
      ingredients: { [resourceMap.madeira]: 3, [resourceMap.ferro_fundido]: 2, "natural_glue": 2, "ervas_medicinais": 1 },
      output: { "spear": 1 }
    },
    
    // ARMAS ADICIONAIS - BESTAS (3 VARIAÇÕES)
    {
      name: "Besta Simples",
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
      name: "Besta Élfica",
      emoji: "🏹",
      requiredLevel: 35,
      ingredients: { [resourceMap.madeira]: 4, [resourceMap.ferro_fundido]: 3, "natural_glue": 3, "mel_selvagem": 2 },
      output: { "crossbow": 1 }
    },
    
    // ARMAS ADICIONAIS - MARTELOS (3 VARIAÇÕES)
    {
      name: "Clava de Madeira",
      emoji: "🔨",
      requiredLevel: 3,
      ingredients: { [resourceMap.madeira]: 3, [resourceMap.barbante]: 2, [resourceMap.pedra]: 1 },
      output: { "mace": 1 }
    },
    {
      name: "Martelo de Guerra",
      emoji: "🔨",
      requiredLevel: 14,
      ingredients: { [resourceMap.madeira]: 2, [resourceMap.ferro_fundido]: 4, [resourceMap.barbante]: 4 },
      output: { "mace": 1 }
    },
    {
      name: "Martelo dos Titãs",
      emoji: "🔨",
      requiredLevel: 30,
      ingredients: { [resourceMap.madeira]: 3, [resourceMap.ferro_fundido]: 5, "natural_glue": 3, [resourceMap.couro]: 2 },
      output: { "mace": 1 }
    },
    
    // ARMADURAS EVOLUTIVAS - CAPACETES
    {
      name: "Capacete de Couro",
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
      name: "Capacete Élfico",
      emoji: "👑",
      requiredLevel: 20,
      ingredients: { [resourceMap.ferro_fundido]: 1, "natural_glue": 1, "mel_selvagem": 1 },
      output: { "helmet": 1 }
    },
    
    // ARMADURAS EVOLUTIVAS - PEITORAIS
    {
      name: "Peitoral de Couro",
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
      name: "Peitoral Élfico",
      emoji: "✨",
      requiredLevel: 22,
      ingredients: { [resourceMap.ferro_fundido]: 3, "natural_glue": 2, "resina_de_arvore": 1 },
      output: { "chestplate": 1 }
    },
    
    // ARMADURAS EVOLUTIVAS - CALÇAS
    {
      name: "Calças de Couro",
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
      name: "Calças Élficas",
      emoji: "🌟",
      requiredLevel: 21,
      ingredients: { [resourceMap.ferro_fundido]: 2, "natural_glue": 1, "ervas_medicinais": 2 },
      output: { "leggings": 1 }
    },
    
    // ARMADURAS EVOLUTIVAS - BOTAS
    {
      name: "Botas de Couro",
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
      name: "Botas Élficas",
      emoji: "🌈",
      requiredLevel: 18,
      ingredients: { [resourceMap.ferro_fundido]: 1, "natural_glue": 1, "penas": 3 },
      output: { "boots": 1 }
    },
    
    // EQUIPAMENTOS EVOLUTIVOS - MOCHILAS
    {
      name: "Mochila Simples",
      emoji: "🎒",
      requiredLevel: 4,
      ingredients: { [resourceMap.couro]: 2, [resourceMap.barbante]: 4 },
      output: { "backpack": 1 }
    },
    {
      name: "Mochila Reforçada",
      emoji: "🎒",
      requiredLevel: 11,
      ingredients: { [resourceMap.ferro_fundido]: 2, [resourceMap.couro]: 3, [resourceMap.barbante]: 6 },
      output: { "backpack": 1 }
    },
    {
      name: "Mochila Dimensional",
      emoji: "🎒",
      requiredLevel: 25,
      ingredients: { [resourceMap.ferro_fundido]: 1, "natural_glue": 2, [resourceMap.couro]: 2, "mel_selvagem": 2 },
      output: { "backpack": 1 }
    },
    
    // EQUIPAMENTOS EVOLUTIVOS - BOLSAS DE COMIDA
    {
      name: "Bolsa de Comida",
      emoji: "🥘",
      requiredLevel: 6,
      ingredients: { [resourceMap.couro]: 1, [resourceMap.barbante]: 3, [resourceMap.pelo]: 2 },
      output: { "foodbag": 1 }
    },
    {
      name: "Bolsa Refrigerada",
      emoji: "🧊",
      requiredLevel: 13,
      ingredients: { [resourceMap.ferro_fundido]: 1, [resourceMap.couro]: 2, [resourceMap.argila]: 3 },
      output: { "foodbag": 1 }
    },
    {
      name: "Bolsa Mágica",
      emoji: "✨",
      requiredLevel: 26,
      ingredients: { "natural_glue": 1, [resourceMap.couro]: 1, "mel_selvagem": 1, "ervas_medicinais": 2 },
      output: { "foodbag": 1 }
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
    },
    
    // NOVAS RECEITAS DA FLORESTA
    {
      name: "Chá de Ervas",
      emoji: "🍵",
      requiredLevel: 2,
      ingredients: { [resourceMap.agua_fresca]: 1, "ervas_medicinais": 1 },
      output: { "herbal_tea": 1 }
    },
    {
      name: "Nozes Torradas",
      emoji: "🥜",
      requiredLevel: 1,
      ingredients: { "nozes": 3, [resourceMap.gravetos]: 1 },
      output: { "roasted_nuts": 1 }
    },
    {
      name: "Raízes Cozidas",
      emoji: "🥔",
      requiredLevel: 1,
      ingredients: { "raizes": 2, [resourceMap.agua_fresca]: 1, [resourceMap.gravetos]: 1 },
      output: { "cooked_roots": 1 }
    },
    {
      name: "Carne Defumada",
      emoji: "🥓",
      requiredLevel: 4,
      ingredients: { [resourceMap.carne]: 2, [resourceMap.madeira]: 1, "resina_de_arvore": 1 },
      output: { "smoked_meat": 1 }
    },
    {
      name: "Sopa de Cogumelos",
      emoji: "🥣",
      requiredLevel: 2,
      ingredients: { [resourceMap.cogumelos]: 4, [resourceMap.agua_fresca]: 2, "clay_pot": 1 },
      output: { "mushroom_soup": 1 }
    },
    {
      name: "Torta de Frutas",
      emoji: "🥧",
      requiredLevel: 5,
      ingredients: { [resourceMap.frutas_silvestres]: 5, "nozes": 2, "mel_selvagem": 1, [resourceMap.madeira]: 1 },
      output: { "fruit_pie": 1 }
    },
    {
      name: "Hidromél",
      emoji: "🍺",
      requiredLevel: 6,
      ingredients: { "mel_selvagem": 2, [resourceMap.agua_fresca]: 3, "ervas_medicinais": 1 },
      output: { "mead": 1 }
    },
    {
      name: "Cola Natural",
      emoji: "🧴",
      requiredLevel: 3,
      ingredients: { "resina_de_arvore": 2, [resourceMap.ossos]: 3, [resourceMap.agua_fresca]: 1 },
      output: { "natural_glue": 1 }
    },
    {
      name: "Pá de Madeira",
      emoji: "🔺",
      requiredLevel: 2,
      ingredients: { [resourceMap.madeira]: 1, [resourceMap.barbante]: 2 },
      output: { "shovel": 1 }
    },
    {
      name: "Armadilha Simples",
      emoji: "🪤",
      requiredLevel: 3,
      ingredients: { [resourceMap.gravetos]: 4, [resourceMap.barbante]: 3, "natural_glue": 1 },
      output: { "simple_trap": 1 }
    }
  ];
}
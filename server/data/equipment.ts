// Equipment data management module
import type { InsertEquipment } from "@shared/schema";

// Tipos para evolução de equipamentos
export interface EquipmentEvolution {
  baseType: string;
  levels: {
    name: string;
    emoji: string;
    level: number;
    effect: string;
    bonus: any;
    weight: number;
    tier: 'improvisado' | 'ferro' | 'avancado';
  }[];
}

export const TOOL_EVOLUTIONS: EquipmentEvolution[] = [
  {
    baseType: "axe",
    levels: [
      {
        name: "Machado Improvisado",
        emoji: "🪓",
        level: 1,
        effect: "+10% madeira",
        bonus: { type: "resource_boost", resource: "madeira", multiplier: 1.1 },
        weight: 2,
        tier: 'improvisado'
      },
      {
        name: "Machado de Ferro",
        emoji: "🪓",
        level: 8,
        effect: "+25% madeira",
        bonus: { type: "resource_boost", resource: "madeira", multiplier: 1.25 },
        weight: 4,
        tier: 'ferro'
      },
      {
        name: "Machado Avançado",
        emoji: "🪓",
        level: 15,
        effect: "+40% madeira",
        bonus: { type: "resource_boost", resource: "madeira", multiplier: 1.4 },
        weight: 3,
        tier: 'avancado'
      }
    ]
  },
  {
    baseType: "pickaxe",
    levels: [
      {
        name: "Picareta Improvisada",
        emoji: "⛏️",
        level: 1,
        effect: "+10% pedra",
        bonus: { type: "resource_boost", resource: "pedra", multiplier: 1.1 },
        weight: 2,
        tier: 'improvisado'
      },
      {
        name: "Picareta de Ferro",
        emoji: "⛏️",
        level: 10,
        effect: "+25% pedra",
        bonus: { type: "resource_boost", resource: "pedra", multiplier: 1.25 },
        weight: 4,
        tier: 'ferro'
      },
      {
        name: "Picareta Avançada",
        emoji: "⛏️",
        level: 18,
        effect: "+40% pedra",
        bonus: { type: "resource_boost", resource: "pedra", multiplier: 1.4 },
        weight: 3,
        tier: 'avancado'
      }
    ]
  },
  {
    baseType: "fishing_rod", 
    levels: [
      {
        name: "Vara de Pesca Simples",
        emoji: "🎣",
        level: 3,
        effect: "Pesca básica",
        bonus: { type: "fishing", value: 1 },
        weight: 2,
        tier: 'improvisado'
      },
      {
        name: "Vara de Pesca Reforçada",
        emoji: "🎣",
        level: 12,
        effect: "Pesca avançada +25%",
        bonus: { type: "fishing", value: 2 },
        weight: 3,
        tier: 'ferro'
      },
      {
        name: "Vara de Pesca Mágica",
        emoji: "🎣",
        level: 24,
        effect: "Pesca mágica +50%",
        bonus: { type: "fishing", value: 3 },
        weight: 2,
        tier: 'avancado'
      }
    ]
  },
  {
    baseType: "shovel",
    levels: [
      {
        name: "Pá de Madeira",
        emoji: "🏗️",
        level: 2,
        effect: "Escavação básica",
        bonus: { type: "digging", value: 1 },
        weight: 2,
        tier: 'improvisado'
      },
      {
        name: "Pá de Ferro",
        emoji: "🏗️",
        level: 9, 
        effect: "Escavação eficiente",
        bonus: { type: "digging", value: 2 },
        weight: 3,
        tier: 'ferro'
      },
      {
        name: "Pá Élfica",
        emoji: "🏗️",
        level: 20,
        effect: "Escavação mágica",
        bonus: { type: "digging", value: 3 },
        weight: 2,
        tier: 'avancado'
      }
    ]
  },
  {
    baseType: "sickle",
    levels: [
      {
        name: "Foice Improvisada",
        emoji: "🔪",
        level: 4,
        effect: "Colheita básica",
        bonus: { type: "harvesting", value: 1 },
        weight: 1,
        tier: 'improvisado'
      },
      {
        name: "Foice de Ferro", 
        emoji: "🔪",
        level: 11,
        effect: "Colheita eficiente",
        bonus: { type: "harvesting", value: 2 },
        weight: 2,
        tier: 'ferro'
      },
      {
        name: "Foice Élfica",
        emoji: "🔪",
        level: 22,
        effect: "Colheita mágica",
        bonus: { type: "harvesting", value: 3 },
        weight: 1,
        tier: 'avancado'
      }
    ]
  },
  {
    baseType: "knife",
    levels: [
      {
        name: "Faca Improvisada",
        emoji: "🔪",
        level: 1,
        effect: "Corte básico",
        bonus: { type: "cutting", value: 1 },
        weight: 1,
        tier: 'improvisado'
      },
      {
        name: "Faca de Ferro",
        emoji: "🔪", 
        level: 6,
        effect: "Corte preciso",
        bonus: { type: "cutting", value: 2 },
        weight: 1,
        tier: 'ferro'
      },
      {
        name: "Faca Élfica",
        emoji: "🔪",
        level: 16,
        effect: "Corte mágico",
        bonus: { type: "cutting", value: 3 },
        weight: 1,
        tier: 'avancado'
      }
    ]
  },
  {
    baseType: "bucket",
    levels: [
      {
        name: "Balde de Madeira",
        emoji: "🪣",
        level: 5,
        effect: "Transporte de líquidos",
        bonus: { type: "liquid_storage", value: 10 },
        weight: 2,
        tier: 'improvisado'
      },
      {
        name: "Balde de Ferro",
        emoji: "🪣",
        level: 13,
        effect: "Transporte eficiente",
        bonus: { type: "liquid_storage", value: 20 },
        weight: 3,
        tier: 'ferro'
      },
      {
        name: "Balde Mágico",
        emoji: "🪣",
        level: 26,
        effect: "Transporte infinito",
        bonus: { type: "liquid_storage", value: 50 },
        weight: 2,
        tier: 'avancado'
      }
    ]
  }
];

// Evolução de armas
export const WEAPON_EVOLUTIONS: EquipmentEvolution[] = [
  {
    baseType: "sword",
    levels: [
      {
        name: "Espada Improvisada",
        emoji: "⚔️",
        level: 1,
        effect: "Caça animais pequenos",
        bonus: { type: "hunting", value: 1 },
        weight: 3,
        tier: 'improvisado'
      },
      {
        name: "Espada de Ferro",
        emoji: "⚔️",
        level: 12,
        effect: "Caça animais médios",
        bonus: { type: "hunting", value: 2 },
        weight: 5,
        tier: 'ferro'
      },
      {
        name: "Espada Élfica",
        emoji: "⚔️",
        level: 25,
        effect: "Caça todos os animais",
        bonus: { type: "hunting", value: 3 },
        weight: 4,
        tier: 'avancado'
      }
    ]
  },
  {
    baseType: "bow",
    levels: [
      {
        name: "Arco Simples",
        emoji: "🏹",
        level: 5,
        effect: "Caça à distância",
        bonus: { type: "hunting", value: 2 },
        weight: 2,
        tier: 'improvisado'
      },
      {
        name: "Arco Composto",
        emoji: "🏹",
        level: 15,
        effect: "Caça avançada",
        bonus: { type: "hunting", value: 3 },
        weight: 3,
        tier: 'ferro'
      },
      {
        name: "Arco Élfico",
        emoji: "🏹",
        level: 30,
        effect: "Caça de elite",
        bonus: { type: "hunting", value: 4 },
        weight: 2,
        tier: 'avancado'
      }
    ]
  },
  {
    baseType: "spear",
    levels: [
      {
        name: "Lança Improvisada",
        emoji: "🗡️",
        level: 7,
        effect: "Arma de alcance",
        bonus: { type: "hunting", value: 2 },
        weight: 3,
        tier: 'improvisado'
      },
      {
        name: "Lança de Ferro",
        emoji: "🗡️",
        level: 17,
        effect: "Perfuração aprimorada",
        bonus: { type: "hunting", value: 3 },
        weight: 4,
        tier: 'ferro'
      },
      {
        name: "Lança Élfica",
        emoji: "🗡️",
        level: 28,
        effect: "Perfuração mágica",
        bonus: { type: "hunting", value: 4 },
        weight: 3,
        tier: 'avancado'
      }
    ]
  },
  {
    baseType: "crossbow",
    levels: [
      {
        name: "Besta Simples",
        emoji: "🏹",
        level: 14,
        effect: "Precisão mecânica",
        bonus: { type: "hunting", value: 3 },
        weight: 4,
        tier: 'improvisado'
      },
      {
        name: "Besta de Ferro",
        emoji: "🏹",
        level: 23,
        effect: "Alto impacto",
        bonus: { type: "hunting", value: 4 },
        weight: 5,
        tier: 'ferro'
      },
      {
        name: "Besta Élfica",
        emoji: "🏹",
        level: 32,
        effect: "Precisão divina",
        bonus: { type: "hunting", value: 5 },
        weight: 4,
        tier: 'avancado'
      }
    ]
  }
];

// Evolução de armaduras
export const ARMOR_EVOLUTIONS: EquipmentEvolution[] = [
  {
    baseType: "helmet",
    levels: [
      {
        name: "Capacete de Couro",
        emoji: "🎩",
        level: 1,
        effect: "+5% proteção",
        bonus: { type: "protection", value: 5 },
        weight: 1,
        tier: 'improvisado'
      },
      {
        name: "Capacete de Ferro",
        emoji: "🪖",
        level: 8,
        effect: "+15% proteção",
        bonus: { type: "protection", value: 15 },
        weight: 2,
        tier: 'ferro'
      },
      {
        name: "Capacete Élfico",
        emoji: "👑",
        level: 20,
        effect: "+25% proteção",
        bonus: { type: "protection", value: 25 },
        weight: 1,
        tier: 'avancado'
      }
    ]
  },
  {
    baseType: "chestplate",
    levels: [
      {
        name: "Peitoral de Couro",
        emoji: "🦺",
        level: 3,
        effect: "+10% proteção",
        bonus: { type: "protection", value: 10 },
        weight: 3,
        tier: 'improvisado'
      },
      {
        name: "Peitoral de Ferro",
        emoji: "🛡️",
        level: 10,
        effect: "+20% proteção",
        bonus: { type: "protection", value: 20 },
        weight: 5,
        tier: 'ferro'
      },
      {
        name: "Peitoral Élfico",
        emoji: "✨",
        level: 22,
        effect: "+35% proteção",
        bonus: { type: "protection", value: 35 },
        weight: 4,
        tier: 'avancado'
      }
    ]
  },
  {
    baseType: "leggings",
    levels: [
      {
        name: "Calças de Couro",
        emoji: "👖",
        level: 2,
        effect: "+8% proteção",
        bonus: { type: "protection", value: 8 },
        weight: 2,
        tier: 'improvisado'
      },
      {
        name: "Calças de Ferro",
        emoji: "🦵",
        level: 9,
        effect: "+18% proteção",
        bonus: { type: "protection", value: 18 },
        weight: 4,
        tier: 'ferro'
      },
      {
        name: "Calças Élficas",
        emoji: "🌟",
        level: 21,
        effect: "+30% proteção",
        bonus: { type: "protection", value: 30 },
        weight: 3,
        tier: 'avancado'
      }
    ]
  },
  {
    baseType: "boots",
    levels: [
      {
        name: "Botas de Couro",
        emoji: "🥾",
        level: 1,
        effect: "+5% velocidade",
        bonus: { type: "speed_boost", value: 5 },
        weight: 1,
        tier: 'improvisado'
      },
      {
        name: "Botas de Ferro",
        emoji: "👢",
        level: 7,
        effect: "+12% velocidade",
        bonus: { type: "speed_boost", value: 12 },
        weight: 2,
        tier: 'ferro'
      },
      {
        name: "Botas Élficas",
        emoji: "🌈",
        level: 18,
        effect: "+20% velocidade",
        bonus: { type: "speed_boost", value: 20 },
        weight: 1,
        tier: 'avancado'
      }
    ]
  },
  {
    baseType: "backpack",
    levels: [
      {
        name: "Mochila Simples",
        emoji: "🎒",
        level: 4,
        effect: "+15kg capacidade",
        bonus: { type: "weight_boost", value: 15 },
        weight: 2,
        tier: 'improvisado'
      },
      {
        name: "Mochila Reforçada",
        emoji: "🎒",
        level: 11,
        effect: "+30kg capacidade",
        bonus: { type: "weight_boost", value: 30 },
        weight: 4,
        tier: 'ferro'
      },
      {
        name: "Mochila Dimensional",
        emoji: "🎒",
        level: 25,
        effect: "+50kg capacidade",
        bonus: { type: "weight_boost", value: 50 },
        weight: 3,
        tier: 'avancado'
      }
    ]
  },
  {
    baseType: "foodbag",
    levels: [
      {
        name: "Bolsa de Comida",
        emoji: "🥘",
        level: 6,
        effect: "Preserva alimentos",
        bonus: { type: "food_preservation", value: 1 },
        weight: 1,
        tier: 'improvisado'
      },
      {
        name: "Bolsa Refrigerada",
        emoji: "🧊",
        level: 13,
        effect: "Preserva melhor",
        bonus: { type: "food_preservation", value: 2 },
        weight: 2,
        tier: 'ferro'
      },
      {
        name: "Bolsa Mágica",
        emoji: "✨",
        level: 26,
        effect: "Preservação perfeita",
        bonus: { type: "food_preservation", value: 3 },
        weight: 1,
        tier: 'avancado'
      }
    ]
  }
];

// Helper function to convert evolution data to equipment
function evolutionToEquipment(evolution: EquipmentEvolution, slot: string): InsertEquipment[] {
  return evolution.levels.map(level => ({
    name: level.name,
    emoji: level.emoji,
    effect: level.effect,
    bonus: level.bonus,
    slot: slot as any,
    toolType: evolution.baseType,
    weight: level.weight,
  }));
}

// FERRAMENTAS ESPECIALIZADAS - 3 VARIAÇÕES CADA
export const SPECIALIZED_TOOLS: EquipmentEvolution[] = [
  {
    baseType: "shovel",
    levels: [
      {
        name: "Pá de Madeira",
        emoji: "🔺",
        level: 2,
        effect: "+15% escavação",
        bonus: { type: "resource_boost", resource: "argila", multiplier: 1.15 },
        weight: 2,
        tier: 'improvisado'
      },
      {
        name: "Pá de Ferro",
        emoji: "🏗️",
        level: 9,
        effect: "+30% escavação",
        bonus: { type: "resource_boost", resource: "argila", multiplier: 1.3 },
        weight: 4,
        tier: 'ferro'
      },
      {
        name: "Pá Elite",
        emoji: "⚡",
        level: 20,
        effect: "+50% escavação",
        bonus: { type: "resource_boost", resource: "argila", multiplier: 1.5 },
        weight: 3,
        tier: 'avancado'
      }
    ]
  },
  {
    baseType: "fishing_rod",
    levels: [
      {
        name: "Vara de Pesca Simples",
        emoji: "🎣",
        level: 3,
        effect: "Pesca básica",
        bonus: { type: "fishing", value: 1 },
        weight: 2,
        tier: 'improvisado'
      },
      {
        name: "Vara de Pesca Reforçada",
        emoji: "🎣",
        level: 12,
        effect: "+25% chance de peixe grande",
        bonus: { type: "fishing", value: 2 },
        weight: 3,
        tier: 'ferro'
      },
      {
        name: "Vara de Pesca Mágica",
        emoji: "🎣",
        level: 24,
        effect: "+50% peixes raros",
        bonus: { type: "fishing", value: 3 },
        weight: 2,
        tier: 'avancado'
      }
    ]
  },
  {
    baseType: "sickle",
    levels: [
      {
        name: "Foice de Pedra",
        emoji: "🔪",
        level: 2,
        effect: "+15% plantas",
        bonus: { type: "resource_boost", resource: "fibra", multiplier: 1.15 },
        weight: 2,
        tier: 'improvisado'
      },
      {
        name: "Foice de Ferro",
        emoji: "🔪",
        level: 10,
        effect: "+30% plantas",
        bonus: { type: "resource_boost", resource: "fibra", multiplier: 1.3 },
        weight: 3,
        tier: 'ferro'
      },
      {
        name: "Foice Druídica",
        emoji: "🔪",
        level: 22,
        effect: "+50% plantas raras",
        bonus: { type: "resource_boost", resource: "fibra", multiplier: 1.5 },
        weight: 2,
        tier: 'avancado'
      }
    ]
  },
  {
    baseType: "knife",
    levels: [
      {
        name: "Faca de Pedra",
        emoji: "🗡️",
        level: 1,
        effect: "Esfola animais pequenos",
        bonus: { type: "skinning", value: 1 },
        weight: 1,
        tier: 'improvisado'
      },
      {
        name: "Faca de Ferro",
        emoji: "🗡️",
        level: 8,
        effect: "Esfola todos os animais",
        bonus: { type: "skinning", value: 2 },
        weight: 2,
        tier: 'ferro'
      },
      {
        name: "Faca de Caçador",
        emoji: "🗡️",
        level: 19,
        effect: "+25% materiais animais",
        bonus: { type: "skinning", value: 3 },
        weight: 1,
        tier: 'avancado'
      }
    ]
  },
  {
    baseType: "bucket",
    levels: [
      {
        name: "Balde de Madeira",
        emoji: "🪣",
        level: 2,
        effect: "Coleta água básica",
        bonus: { type: "water_collection", value: 1 },
        weight: 2,
        tier: 'improvisado'
      },
      {
        name: "Balde de Ferro",
        emoji: "🪣",
        level: 11,
        effect: "Coleta mais água",
        bonus: { type: "water_collection", value: 2 },
        weight: 4,
        tier: 'ferro'
      },
      {
        name: "Balde Mágico",
        emoji: "🪣",
        level: 23,
        effect: "Água infinita",
        bonus: { type: "water_collection", value: 3 },
        weight: 2,
        tier: 'avancado'
      }
    ]
  }
];

// UTENSÍLIOS DE COZINHA - 3 VARIAÇÕES CADA
export const COOKING_UTENSILS: EquipmentEvolution[] = [
  {
    baseType: "pot",
    levels: [
      {
        name: "Panela de Barro",
        emoji: "🏺",
        level: 4,
        effect: "Cozinha receitas básicas",
        bonus: { type: "cooking", value: 1 },
        weight: 4,
        tier: 'improvisado'
      },
      {
        name: "Panela de Ferro",
        emoji: "🫕",
        level: 12,
        effect: "Cozinha receitas avançadas",
        bonus: { type: "cooking", value: 2 },
        weight: 5,
        tier: 'ferro'
      },
      {
        name: "Caldeirão Mágico",
        emoji: "🔮",
        level: 28,
        effect: "Cozinha receitas especiais",
        bonus: { type: "cooking", value: 3 },
        weight: 4,
        tier: 'avancado'
      }
    ]
  },
  {
    baseType: "bottle",
    levels: [
      {
        name: "Garrafa de Bambu",
        emoji: "🎍",
        level: 2,
        effect: "Armazena bebidas básicas",
        bonus: { type: "storage", value: 1 },
        weight: 1,
        tier: 'improvisado'
      },
      {
        name: "Garrafa de Vidro",
        emoji: "🍶",
        level: 14,
        effect: "Armazena bebidas especiais",
        bonus: { type: "storage", value: 2 },
        weight: 2,
        tier: 'ferro'
      },
      {
        name: "Garrafa Cristalina",
        emoji: "💎",
        level: 26,
        effect: "Preserva bebidas perfeitamente",
        bonus: { type: "storage", value: 3 },
        weight: 1,
        tier: 'avancado'
      }
    ]
  }
];

// MATERIAIS DE CRAFTING - 3 VARIAÇÕES CADA
export const CRAFTING_MATERIALS: EquipmentEvolution[] = [
  {
    baseType: "rope",
    levels: [
      {
        name: "Corda de Fibra",
        emoji: "🪢",
        level: 3,
        effect: "Material básico de crafting",
        bonus: { type: "crafting", value: 1 },
        weight: 1,
        tier: 'improvisado'
      },
      {
        name: "Corda de Couro",
        emoji: "🪢",
        level: 11,
        effect: "Material resistente",
        bonus: { type: "crafting", value: 2 },
        weight: 2,
        tier: 'ferro'
      },
      {
        name: "Corda Élfica",
        emoji: "🪢",
        level: 25,
        effect: "Material superior",
        bonus: { type: "crafting", value: 3 },
        weight: 1,
        tier: 'avancado'
      }
    ]
  },
  {
    baseType: "bait",
    levels: [
      {
        name: "Isca Simples",
        emoji: "🪱",
        level: 2,
        effect: "Melhora pesca básica",
        bonus: { type: "fishing_boost", value: 1 },
        weight: 0.1,
        tier: 'improvisado'
      },
      {
        name: "Isca Especial",
        emoji: "🐛",
        level: 13,
        effect: "Atrai peixes grandes",
        bonus: { type: "fishing_boost", value: 2 },
        weight: 0.2,
        tier: 'ferro'
      },
      {
        name: "Isca Mágica",
        emoji: "✨",
        level: 27,
        effect: "Atrai peixes lendários",
        bonus: { type: "fishing_boost", value: 3 },
        weight: 0.1,
        tier: 'avancado'
      }
    ]
  }
];

// Equipamentos utilitários diversos
export const UTILITY_EQUIPMENT: InsertEquipment[] = [
  {
    name: "Armadilha Simples",
    emoji: "🕳️",
    effect: "Captura animais pequenos",
    bonus: { type: "trap", value: 1 },
    slot: "tool",
    toolType: "trap",
    weight: 3,
  },
];

// ARMAS ADICIONAIS - 3 VARIAÇÕES CADA
export const ADDITIONAL_WEAPONS: EquipmentEvolution[] = [
  {
    baseType: "spear",
    levels: [
      {
        name: "Lança de Madeira",
        emoji: "🔱",
        level: 4,
        effect: "Caça animais médios",
        bonus: { type: "hunting", value: 2 },
        weight: 3,
        tier: 'improvisado'
      },
      {
        name: "Lança de Ferro",
        emoji: "🔱",
        level: 16,
        effect: "Caça animais grandes",
        bonus: { type: "hunting", value: 3 },
        weight: 5,
        tier: 'ferro'
      },
      {
        name: "Lança Ancestral",
        emoji: "🔱",
        level: 32,
        effect: "Caça criaturas lendárias",
        bonus: { type: "hunting", value: 4 },
        weight: 4,
        tier: 'avancado'
      }
    ]
  },
  {
    baseType: "crossbow",
    levels: [
      {
        name: "Besta Simples",
        emoji: "🏹",
        level: 8,
        effect: "Precisão aprimorada",
        bonus: { type: "hunting", value: 2 },
        weight: 4,
        tier: 'improvisado'
      },
      {
        name: "Besta de Ferro",
        emoji: "🏹",
        level: 18,
        effect: "Alta precisão",
        bonus: { type: "hunting", value: 3 },
        weight: 6,
        tier: 'ferro'
      },
      {
        name: "Besta Élfica",
        emoji: "🏹",
        level: 35,
        effect: "Precisão perfeita",
        bonus: { type: "hunting", value: 4 },
        weight: 4,
        tier: 'avancado'
      }
    ]
  },
  {
    baseType: "mace",
    levels: [
      {
        name: "Clava de Madeira",
        emoji: "🔨",
        level: 3,
        effect: "Força bruta básica",
        bonus: { type: "hunting", value: 1 },
        weight: 4,
        tier: 'improvisado'
      },
      {
        name: "Martelo de Guerra",
        emoji: "🔨",
        level: 14,
        effect: "Força devastadora",
        bonus: { type: "hunting", value: 3 },
        weight: 7,
        tier: 'ferro'
      },
      {
        name: "Martelo dos Titãs",
        emoji: "🔨",
        level: 30,
        effect: "Poder absoluto",
        bonus: { type: "hunting", value: 4 },
        weight: 6,
        tier: 'avancado'
      }
    ]
  }
];

// Cleaned up - removing duplicated armor that's now in EVOLUTIONARY_ARMOR

export function createEquipmentData(): InsertEquipment[] {
  const toolEvolutions = [
    ...TOOL_EVOLUTIONS,
    ...SPECIALIZED_TOOLS
  ].flatMap(evolution => evolutionToEquipment(evolution, "tool"));

  const weaponEvolutions = [
    ...WEAPON_EVOLUTIONS,
    ...ADDITIONAL_WEAPONS
  ].flatMap(evolution => evolutionToEquipment(evolution, "weapon"));

  const armorEvolutions = ARMOR_EVOLUTIONS.flatMap(evolution => 
    evolution.levels.map(level => ({
      name: level.name,
      emoji: level.emoji,
      effect: level.effect,
      bonus: level.bonus,
      slot: evolution.baseType as any,
      toolType: null,
      weight: level.weight,
    }))
  );

  const utensilEvolutions = [
    ...COOKING_UTENSILS,
    ...CRAFTING_MATERIALS
  ].flatMap(evolution => evolutionToEquipment(evolution, "tool"));

  return [
    ...toolEvolutions,
    ...weaponEvolutions,
    ...armorEvolutions,
    ...utensilEvolutions,
    ...UTILITY_EQUIPMENT,
  ];
}

// Equipment categories for better organization
export const EQUIPMENT_CATEGORIES = {
  TOOLS: "tools",
  WEAPONS: "weapons", 
  ARMOR: "armor",
  HELMET: "helmet",
  CHESTPLATE: "chestplate",
  LEGGINGS: "leggings",
  BOOTS: "boots",
  BACKPACK: "backpack",
  FOODBAG: "foodbag"
} as const;

export function getEquipmentByCategory(category: string): InsertEquipment[] {
  const allEquipment = createEquipmentData();
  switch (category) {
    case EQUIPMENT_CATEGORIES.TOOLS:
      return allEquipment.filter(eq => eq.slot === "tool");
    case EQUIPMENT_CATEGORIES.WEAPONS:
      return allEquipment.filter(eq => eq.slot === "weapon");
    case EQUIPMENT_CATEGORIES.HELMET:
      return allEquipment.filter(eq => eq.slot === "helmet");
    case EQUIPMENT_CATEGORIES.CHESTPLATE:
      return allEquipment.filter(eq => eq.slot === "chestplate");
    case EQUIPMENT_CATEGORIES.LEGGINGS:
      return allEquipment.filter(eq => eq.slot === "leggings");
    case EQUIPMENT_CATEGORIES.BOOTS:
      return allEquipment.filter(eq => eq.slot === "boots");
    case EQUIPMENT_CATEGORIES.BACKPACK:
      return allEquipment.filter(eq => eq.slot === "backpack");
    case EQUIPMENT_CATEGORIES.FOODBAG:
      return allEquipment.filter(eq => eq.slot === "foodbag");
    default:
      return allEquipment;
  }
}

export function getEquipmentBySlot(slot: string): InsertEquipment[] {
  const allEquipment = createEquipmentData();
  return allEquipment.filter(eq => eq.slot === slot);
}
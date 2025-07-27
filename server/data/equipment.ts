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

// Função para gerar equipamentos evolutivos
export const EVOLUTIONARY_TOOLS: InsertEquipment[] = TOOL_EVOLUTIONS.flatMap(evolution => 
  evolution.levels.map(level => ({
    name: level.name,
    emoji: level.emoji,
    effect: level.effect,
    bonus: level.bonus,
    slot: "tool" as const,
    toolType: evolution.baseType,
    weight: level.weight,
  }))
);

export const EVOLUTIONARY_WEAPONS: InsertEquipment[] = WEAPON_EVOLUTIONS.flatMap(evolution => 
  evolution.levels.map(level => ({
    name: level.name,
    emoji: level.emoji,
    effect: level.effect,
    bonus: level.bonus,
    slot: "weapon" as const,
    toolType: evolution.baseType,
    weight: level.weight,
  }))
);

export const EVOLUTIONARY_ARMOR: InsertEquipment[] = ARMOR_EVOLUTIONS.flatMap(evolution => 
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

// Ferramentas básicas (não evolutivas) 
export const BASIC_TOOLS: InsertEquipment[] = [
  {
    name: "Pá de Madeira",
    emoji: "🔺",
    effect: "+15% escavação",
    bonus: { type: "resource_boost", resource: "areia", multiplier: 1.15 },
    slot: "tool",
    toolType: "shovel",
    weight: 2,
  },
  {
    name: "Vara de Pesca",
    emoji: "🎣",
    effect: "Permite pescar",
    bonus: { type: "fishing", value: 1 },
    slot: "tool",
    toolType: "fishing_rod",
    weight: 2,
  },
  {
    name: "Foice",
    emoji: "🔪",
    effect: "+15% plantas",
    bonus: { type: "resource_boost", resource: "fibra", multiplier: 1.15 },
    slot: "tool",
    toolType: "sickle",
    weight: 2,
  },
  {
    name: "Faca",
    emoji: "🗡️",
    effect: "Permite esfolar animais",
    bonus: { type: "skinning", value: 1 },
    slot: "tool",
    toolType: "knife",
    weight: 1,
  },
  {
    name: "Balde de Madeira",
    emoji: "🪣",
    effect: "Permite coletar água",
    bonus: { type: "water_collection", value: 1 },
    slot: "tool",
    toolType: "bucket",
    weight: 2,
  },
];

export const UTILITY_TOOLS: InsertEquipment[] = [
  {
    name: "Garrafa de Bambu",
    emoji: "🎍",
    effect: "Usado para fazer bebidas",
    bonus: { type: "crafting", value: 1 },
    slot: "tool",
    toolType: "bamboo_bottle",
    weight: 1,
  },
  {
    name: "Panela",
    emoji: "🫕",
    effect: "Usada para cozinhar ensopados",
    bonus: { type: "cooking", value: 1 },
    slot: "tool",
    toolType: "pot",
    weight: 3,
  },
  {
    name: "Isca para Pesca",
    emoji: "🪱",
    effect: "Melhora chance de pescar",
    bonus: { type: "fishing", value: 2 },
    slot: "tool",
    toolType: "bait",
    weight: 0.1,
  },
  {
    name: "Corda",
    emoji: "🪢",
    effect: "Material robusto para crafting",
    bonus: { type: "crafting", value: 2 },
    slot: "tool",
    toolType: "rope",
    weight: 1,
  },
  {
    name: "Panela de Barro",
    emoji: "🏺",
    effect: "Usada para cozinhar ensopados",
    bonus: { type: "cooking", value: 1 },
    slot: "tool",
    toolType: "clay_pot",
    weight: 4,
  },
];

export const EQUIPMENT_ARMOR: InsertEquipment[] = [
  {
    name: "Mochila",
    emoji: "🎒",
    effect: "Aumenta capacidade de inventário",
    bonus: { type: "inventory", value: 50 },
    slot: "chestplate",
    toolType: "backpack",
    weight: 2,
  },
];

export const WEAPONS: InsertEquipment[] = [
  {
    name: "Espada de Pedra",
    emoji: "⚔️",
    effect: "Permite caçar animais pequenos",
    bonus: { type: "hunting", value: 1 },
    slot: "weapon",
    toolType: "sword",
    weight: 4,
  },
  {
    name: "Arco e Flecha",
    emoji: "🏹",
    effect: "Permite caçar todos os animais",
    bonus: { type: "hunting", value: 2 },
    slot: "weapon",
    toolType: "bow",
    weight: 3,
  },
  {
    name: "Lança",
    emoji: "🔱",
    effect: "Permite caçar animais grandes",
    bonus: { type: "hunting", value: 3 },
    slot: "weapon",
    toolType: "spear",
    weight: 5,
  },
  {
    name: "Faca",
    emoji: "🗡️",
    effect: "Permite esfolar animais + caça pequena",
    bonus: { type: "hunting", value: 1 },
    slot: "weapon",
    toolType: "knife",
    weight: 1,
  },
];

export const ARMOR: InsertEquipment[] = [
  {
    name: "Capacete de Ferro",
    emoji: "🪖",
    effect: "+10% proteção",
    bonus: { type: "protection", value: 10 },
    slot: "helmet",
    toolType: null,
    weight: 2,
  },
  {
    name: "Mochila",
    emoji: "🎒",
    effect: "+15 kg capacidade",
    bonus: { type: "weight_boost", value: 15 },
    slot: "backpack",
    toolType: null,
    weight: 3,
  },
  {
    name: "Peitoral de Ferro",
    emoji: "🦺",
    effect: "+15% proteção",
    bonus: { type: "protection", value: 15 },
    slot: "chestplate",
    toolType: null,
    weight: 4,
  },
  {
    name: "Calças de Couro",
    emoji: "👖",
    effect: "+5% proteção",
    bonus: { type: "protection", value: 5 },
    slot: "leggings",
    toolType: null,
    weight: 2,
  },
  {
    name: "Bolsa de Comida",
    emoji: "🥘",
    effect: "Preserva alimentos",
    bonus: { type: "food_preservation", value: 1 },
    slot: "foodbag",
    toolType: null,
    weight: 2,
  },
  {
    name: "Botas de Couro",
    emoji: "🥾",
    effect: "+5% velocidade",
    bonus: { type: "speed_boost", value: 5 },
    slot: "boots",
    toolType: null,
    weight: 1,
  },
];

export const ALL_EQUIPMENT = [
  ...EVOLUTIONARY_TOOLS, 
  ...BASIC_TOOLS, 
  ...UTILITY_TOOLS, 
  ...EVOLUTIONARY_WEAPONS, 
  ...EVOLUTIONARY_ARMOR, 
  ...WEAPONS, 
  ...EQUIPMENT_ARMOR, 
  ...ARMOR
];

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
  switch (category) {
    case EQUIPMENT_CATEGORIES.TOOLS:
      return [...EVOLUTIONARY_TOOLS, ...BASIC_TOOLS, ...UTILITY_TOOLS];
    case EQUIPMENT_CATEGORIES.WEAPONS:
      return [...EVOLUTIONARY_WEAPONS, ...WEAPONS];
    case EQUIPMENT_CATEGORIES.ARMOR:
      return [...EVOLUTIONARY_ARMOR, ...ARMOR];
    case EQUIPMENT_CATEGORIES.HELMET:
      return ALL_EQUIPMENT.filter(eq => eq.slot === "helmet");
    case EQUIPMENT_CATEGORIES.CHESTPLATE:
      return ALL_EQUIPMENT.filter(eq => eq.slot === "chestplate");
    case EQUIPMENT_CATEGORIES.LEGGINGS:
      return ALL_EQUIPMENT.filter(eq => eq.slot === "leggings");
    case EQUIPMENT_CATEGORIES.BOOTS:
      return ALL_EQUIPMENT.filter(eq => eq.slot === "boots");
    case EQUIPMENT_CATEGORIES.BACKPACK:
      return ALL_EQUIPMENT.filter(eq => eq.slot === "backpack");
    case EQUIPMENT_CATEGORIES.FOODBAG:
      return ALL_EQUIPMENT.filter(eq => eq.slot === "foodbag");
    default:
      return ALL_EQUIPMENT;
  }
}

export function getEquipmentBySlot(slot: string): InsertEquipment[] {
  return ALL_EQUIPMENT.filter(eq => eq.slot === slot);
}
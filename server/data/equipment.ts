// Equipment data management module
import type { InsertEquipment } from "@shared/schema";

// Pre-defined UUIDs for equipment to ensure consistency across systems
export const EQUIPMENT_IDS = {
  // Tools
  PICARETA: "tool-1a2b3c4d-5e6f-7890-abcd-ef1234567890",
  MACHADO: "tool-2b3c4d5e-6f78-9012-bcde-f12345678901",
  PA: "tool-3c4d5e6f-7890-1234-cdef-123456789012",
  VARA_PESCA: "tool-4d5e6f78-9012-3456-def1-234567890123",
  FOICE: "tool-5e6f7890-1234-5678-ef12-345678901234",
  FACA: "tool-6f789012-3456-7890-f123-456789012345",
  BALDE_MADEIRA: "tool-7890123a-4567-8901-1234-567890123456",
  GARRAFA_BAMBU: "tool-890123ab-5678-9012-2345-678901234567",
  ISCA_PESCA: "tool-bait-fishing-001",
  CORDA: "tool-0123abcd-789a-1234-4567-89012345678a",
  
  // Weapons
  ARCO_FLECHA: "weapon-a1b2c3d4-5e6f-7890-abcd-ef1234567890",
  LANCA: "weapon-b2c3d4e5-6f78-9012-bcde-f12345678901",
  
  // Armor
  CAPACETE_COURO: "armor-c3d4e5f6-7890-1234-cdef-123456789012",
  PEITORAL_COURO: "armor-d4e5f678-9012-3456-def1-234567890123",
  CALCAS_COURO: "armor-e5f67890-1234-5678-ef12-345678901234",
  BOTAS_COURO: "armor-f6789012-3456-7890-f123-456789012345",
  
  // Storage/Utility
  MOCHILA: "utility-78901234-5678-9012-1234-567890123456",
  PANELA_BARRO: "utility-89012345-6789-0123-2345-678901234567",
  PANELA: "utility-90123456-789a-1234-3456-789012345678",
};

export function createEquipmentWithIds(): InsertEquipment[] {
  return [
    // Tools
    {
      id: EQUIPMENT_IDS.PICARETA,
      name: "Picareta",
      emoji: "⛏️",
      effect: "+20% pedra",
      bonus: { type: "resource_boost", resource: "pedra", multiplier: 1.2 },
      slot: "tool",
      toolType: "pickaxe",
      weight: 3,
    },
    {
      id: EQUIPMENT_IDS.MACHADO,
      name: "Machado",
      emoji: "🪓",
      effect: "+20% madeira",
      bonus: { type: "resource_boost", resource: "madeira", multiplier: 1.2 },
      slot: "tool",
      toolType: "axe",
      weight: 4,
    },
    {
      id: EQUIPMENT_IDS.PA,
      name: "Pá",
      emoji: "🗿",
      effect: "+20% areia",
      bonus: { type: "resource_boost", resource: "areia", multiplier: 1.2 },
      slot: "tool",
      toolType: "shovel",
      weight: 2,
    },
    {
      id: EQUIPMENT_IDS.VARA_PESCA,
      name: "Vara de Pesca",
      emoji: "🎣",
      effect: "Permite pescar",
      bonus: { type: "fishing", value: 1 },
      slot: "tool",
      toolType: "fishing_rod",
      weight: 2,
    },
    {
      id: EQUIPMENT_IDS.FOICE,
      name: "Foice",
      emoji: "🔪",
      effect: "+15% plantas",
      bonus: { type: "resource_boost", resource: "fibra", multiplier: 1.15 },
      slot: "tool",
      toolType: "sickle",
      weight: 2,
    },
    {
      id: EQUIPMENT_IDS.FACA,
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
    name: "Mochila",
    emoji: "🎒",
    effect: "Aumenta capacidade de inventário",
    bonus: { type: "inventory", value: 50 },
    slot: "chestplate",
    toolType: "backpack",
    weight: 2,
  },
  {
    id: EQUIPMENT_IDS.ISCA_PESCA,
    name: "Isca para Pesca",
    emoji: "🪱",
    effect: "Necessária para pescar peixes",
    bonus: { type: "fishing", value: 1 },
    slot: "tool",
    toolType: "bait",
    weight: 1,
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
    // Adicionar mais itens aqui se necessário  
  ];
}

// Legacy exports (agora deprecated - usar createEquipmentWithIds())
export const TOOLS = createEquipmentWithIds().filter(e => e.slot === "tool");
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
    effect: "+15 kg peso",
    bonus: { type: "weight_boost", value: 15 },
    slot: "chestplate",
    toolType: null,
    weight: 3,
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
    name: "Botas de Couro",
    emoji: "🥾",
    effect: "+5% velocidade",
    bonus: { type: "speed_boost", value: 5 },
    slot: "boots",
    toolType: null,
    weight: 1,
  },
];

export const ALL_EQUIPMENT = createEquipmentWithIds();

// Equipment categories for better organization
export const EQUIPMENT_CATEGORIES = {
  TOOLS: "tools",
  WEAPONS: "weapons",
  ARMOR: "armor",
} as const;

export function getEquipmentByCategory(category: string): InsertEquipment[] {
  switch (category) {
    case EQUIPMENT_CATEGORIES.TOOLS:
      return TOOLS;
    case EQUIPMENT_CATEGORIES.WEAPONS:
      return WEAPONS;
    case EQUIPMENT_CATEGORIES.ARMOR:
      return ARMOR;
    default:
      return ALL_EQUIPMENT;
  }
}

export function getEquipmentBySlot(slot: string): InsertEquipment[] {
  return ALL_EQUIPMENT.filter(eq => eq.slot === slot);
}
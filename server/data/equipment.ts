// Equipment data management module
import type { InsertEquipment } from "@shared/types";
import { EQUIPMENT_IDS } from "@shared/constants/game-ids";
import { v4 as uuidv4 } from 'uuid';

export function createEquipmentWithIds(): InsertEquipment[] {
  return [
    // Tools
    {
      id: EQUIPMENT_IDS.PICARETA || uuidv4(),
      name: "Picareta",
      emoji: "⛏️",
      category: "tools",
      effects: [{ type: "resource_boost", target: "pedra", value: 1.2, description: "+20% pedra" }],
      slot: "tool",
      toolType: "pickaxe",
      weight: 3,
    },
    {
      id: EQUIPMENT_IDS.MACHADO,
      name: "Machado",
      emoji: "🪓",
      category: "tools",
      effects: [{ type: "resource_boost", target: "madeira", value: 1.2, description: "+20% madeira" }],
      slot: "tool",
      toolType: "axe",
      weight: 4,
    },
    {
      id: EQUIPMENT_IDS.PA,
      name: "Pá",
      emoji: "🗿",
      category: "tools",
      effects: [{ type: "resource_boost", target: "areia", value: 1.2, description: "+20% areia" }],
      slot: "tool",
      toolType: "shovel",
      weight: 2,
    },
    {
      id: EQUIPMENT_IDS.VARA_PESCA,
      name: "Vara de Pesca",
      emoji: "🎣",
      category: "tools",
      effects: [{ type: "special_ability", target: "fishing", value: 1, description: "Permite pescar" }],
      slot: "tool",
      toolType: "fishing_rod",
      weight: 2,
    },
    {
      id: EQUIPMENT_IDS.FOICE,
      name: "Foice",
      emoji: "🔪",
      category: "tools",
      effects: [{ type: "resource_boost", target: "fibra", value: 1.15, description: "+15% plantas" }],
      slot: "tool",
      toolType: "sickle",
      weight: 2,
    },
    {
      id: EQUIPMENT_IDS.FACA,
      name: "Faca",
      emoji: "🔪",
      category: "tools",
      effects: [{ type: "special_ability", target: "skinning", value: 1, description: "Permite esfolar animais" }],
      slot: "tool",
      toolType: "knife",
      weight: 1,
    },
    {
      id: EQUIPMENT_IDS.BALDE_MADEIRA,
      name: "Balde de Madeira",
      emoji: "🪣",
      category: "tools",
      effects: [{ type: "special_ability", target: "water_collection", value: 1, description: "Permite coletar água" }],
      slot: "tool",
      toolType: "bucket",
      weight: 2,
    },
    {
      id: EQUIPMENT_IDS.GARRAFA_BAMBU,
      name: "Garrafa de Bambu",
      emoji: "🎍",
      category: "tools",
      effects: [{ type: "special_ability", target: "crafting", value: 1, description: "Usado para fazer bebidas" }],
      slot: "tool",
      toolType: "bamboo_bottle",
      weight: 1,
    },
    {
      id: EQUIPMENT_IDS.PANELA,
      name: "Panela",
      emoji: "🫕",
      category: "containers",
      effects: [{ type: "special_ability", target: "cooking", value: 1, description: "Usada para cozinhar ensopados" }],
      slot: "tool",
      toolType: "pot",
      weight: 3,
    },
    {
      id: EQUIPMENT_IDS.CORDA,
      name: "Corda",
      emoji: "🪢",
      category: "tools",
      effects: [{ type: "special_ability", target: "crafting", value: 2, description: "Material robusto para crafting" }],
      slot: "tool",
      toolType: "rope",
      weight: 1,
    },
    {
      id: EQUIPMENT_IDS.PANELA_BARRO,
      name: "Panela de Barro",
      emoji: "🏺",
      category: "containers",
      effects: [{ type: "special_ability", target: "cooking", value: 1, description: "Usada para cozinhar ensopados" }],
      slot: "tool",
      toolType: "clay_pot",
      weight: 4,
    },

    // Weapons
    {
      id: EQUIPMENT_IDS.ARCO_FLECHA,
      name: "Arco e Flecha",
      emoji: "🏹",
      category: "weapons",
      effects: [{ type: "special_ability", target: "hunting", value: 2, description: "Permite caçar todos os animais" }],
      slot: "weapon",
      toolType: "bow",
      weight: 3,
    },
    {
      id: EQUIPMENT_IDS.LANCA,
      name: "Lança",
      emoji: "🔱",
      category: "weapons",
      effects: [{ type: "special_ability", target: "hunting", value: 3, description: "Permite caçar animais grandes" }],
      slot: "weapon",
      toolType: "spear",
      weight: 5,
    },
    {
      id: EQUIPMENT_IDS.ESPADA_PEDRA,
      name: "Espada de Pedra",
      emoji: "⚔️",
      category: "weapons",
      effects: [{ type: "special_ability", target: "hunting", value: 1, description: "Permite caçar animais pequenos" }],
      slot: "weapon",
      toolType: "sword",
      weight: 4,
    },

    // Armor
    {
      id: EQUIPMENT_IDS.CAPACETE_FERRO,
      name: "Capacete de Ferro",
      emoji: "⛑️",
      category: "armor",
      effects: [{ type: "stat_boost", target: "protection", value: 10, description: "+10% proteção" }],
      slot: "helmet",
      weight: 2,
    },
    {
      id: EQUIPMENT_IDS.CAPACETE_COURO,
      name: "Capacete de Couro",
      emoji: "🪖",
      category: "armor",
      effects: [{ type: "stat_boost", target: "protection", value: 5, description: "+5% proteção" }],
      slot: "helmet",
      weight: 1,
    },
    {
      id: EQUIPMENT_IDS.PEITORAL_COURO,
      name: "Peitoral de Couro",
      emoji: "🦺",
      category: "armor",
      effects: [{ type: "stat_boost", target: "protection", value: 8, description: "+8% proteção" }],
      slot: "chestplate",
      weight: 3,
    },
    {
      id: EQUIPMENT_IDS.CALCAS_COURO,
      name: "Calças de Couro",
      emoji: "👖",
      category: "armor",
      effects: [{ type: "stat_boost", target: "protection", value: 6, description: "+6% proteção" }],
      slot: "leggings",
      weight: 2,
    },
    {
      id: EQUIPMENT_IDS.BOTAS_COURO,
      name: "Botas de Couro",
      emoji: "🥾",
      category: "armor",
      effects: [{ type: "stat_boost", target: "protection", value: 4, description: "+4% proteção" }],
      slot: "boots",
      weight: 1,
    },

    // Storage/Utility
    {
      id: EQUIPMENT_IDS.MOCHILA,
      name: "Mochila",
      emoji: "🎒",
      category: "accessories",
      effects: [{ type: "stat_boost", target: "inventory", value: 50, description: "Aumenta capacidade de inventário" }],
      slot: "accessory",
      toolType: "backpack",
      weight: 2,
    },
    {
      id: EQUIPMENT_IDS.BARRIL_IMPROVISADO,
      name: "Barril Improvisado",
      emoji: "🛢️",
      category: "containers",
      effects: [{ type: "special_ability", target: "water_tank_unlock", value: 50, description: "Desbloqueie um tanque de água (50 unidades)" }],
      slot: "container",
      toolType: "barrel",
      weight: 8,
    },
  ];
}

// Legacy exports for backward compatibility (now deprecated)
export const TOOLS = createEquipmentWithIds().filter(e => e.slot === "tool");
export const WEAPONS = createEquipmentWithIds().filter(e => e.slot === "weapon");
export const ARMOR = createEquipmentWithIds().filter(e => ["helmet", "chestplate", "leggings", "boots"].includes(e.slot || ""));

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
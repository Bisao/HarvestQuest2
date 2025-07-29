// Equipment data management module
import type { InsertEquipment } from "@shared/types";
import { EQUIPMENT_IDS } from "@shared/constants/game-ids";

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
      emoji: "🔪",
      effect: "Permite esfolar animais",
      bonus: { type: "skinning", value: 1 },
      slot: "tool",
      toolType: "knife",
      weight: 1,
    },
    {
      id: EQUIPMENT_IDS.BALDE_MADEIRA,
      name: "Balde de Madeira",
      emoji: "🪣",
      effect: "Permite coletar água",
      bonus: { type: "water_collection", value: 1 },
      slot: "tool",
      toolType: "bucket",
      weight: 2,
    },
    {
      id: EQUIPMENT_IDS.GARRAFA_BAMBU,
      name: "Garrafa de Bambu",
      emoji: "🎍",
      effect: "Usado para fazer bebidas",
      bonus: { type: "crafting", value: 1 },
      slot: "tool",
      toolType: "bamboo_bottle",
      weight: 1,
    },
    {
      id: EQUIPMENT_IDS.PANELA,
      name: "Panela",
      emoji: "🫕",
      effect: "Usada para cozinhar ensopados",
      bonus: { type: "cooking", value: 1 },
      slot: "tool",
      toolType: "pot",
      weight: 3,
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
      id: EQUIPMENT_IDS.CORDA,
      name: "Corda",
      emoji: "🪢",
      effect: "Material robusto para crafting",
      bonus: { type: "crafting", value: 2 },
      slot: "tool",
      toolType: "rope",
      weight: 1,
    },
    {
      id: EQUIPMENT_IDS.PANELA_BARRO,
      name: "Panela de Barro",
      emoji: "🏺",
      effect: "Usada para cozinhar ensopados",
      bonus: { type: "cooking", value: 1 },
      slot: "tool",
      toolType: "clay_pot",
      weight: 4,
    },
    
    // Weapons
    {
      id: EQUIPMENT_IDS.ARCO_FLECHA,
      name: "Arco e Flecha",
      emoji: "🏹",
      effect: "Permite caçar todos os animais",
      bonus: { type: "hunting", value: 2 },
      slot: "weapon",
      toolType: "bow",
      weight: 3,
    },
    {
      id: EQUIPMENT_IDS.LANCA,
      name: "Lança",
      emoji: "🔱",
      effect: "Permite caçar animais grandes",
      bonus: { type: "hunting", value: 3 },
      slot: "weapon",
      toolType: "spear",
      weight: 5,
    },
    {
      id: EQUIPMENT_IDS.ESPADA_PEDRA,
      name: "Espada de Pedra",
      emoji: "⚔️",
      effect: "Permite caçar animais pequenos",
      bonus: { type: "hunting", value: 1 },
      slot: "weapon",
      toolType: "sword",
      weight: 4,
    },
    
    // Armor
    {
      id: EQUIPMENT_IDS.CAPACETE_FERRO,
      name: "Capacete de Ferro",
      emoji: "⛑️",
      effect: "+10% proteção",
      bonus: { type: "protection", value: 10 },
      slot: "helmet",
      toolType: null,
      weight: 2,
    },
    {
      id: EQUIPMENT_IDS.CAPACETE_COURO,
      name: "Capacete de Couro",
      emoji: "🪖",
      effect: "+5% proteção",
      bonus: { type: "protection", value: 5 },
      slot: "helmet",
      toolType: null,
      weight: 1,
    },
    {
      id: EQUIPMENT_IDS.PEITORAL_COURO,
      name: "Peitoral de Couro",
      emoji: "🦺",
      effect: "+8% proteção",
      bonus: { type: "protection", value: 8 },
      slot: "chestplate",
      toolType: null,
      weight: 3,
    },
    {
      id: EQUIPMENT_IDS.CALCAS_COURO,
      name: "Calças de Couro",
      emoji: "👖",
      effect: "+6% proteção",
      bonus: { type: "protection", value: 6 },
      slot: "leggings",
      toolType: null,
      weight: 2,
    },
    {
      id: EQUIPMENT_IDS.BOTAS_COURO,
      name: "Botas de Couro",
      emoji: "🥾",
      effect: "+4% proteção",
      bonus: { type: "protection", value: 4 },
      slot: "boots",
      toolType: null,
      weight: 1,
    },
    
    // Storage/Utility
    {
      id: EQUIPMENT_IDS.MOCHILA,
      name: "Mochila",
      emoji: "🎒",
      effect: "Aumenta capacidade de inventário",
      bonus: { type: "inventory", value: 50 },
      slot: "chestplate",
      toolType: "backpack",
      weight: 2,
    },
  ];
}

// Legacy exports for backward compatibility (now deprecated)
export const TOOLS = createEquipmentWithIds().filter(e => e.slot === "tool");
export const WEAPONS = createEquipmentWithIds().filter(e => e.slot === "weapon");
export const ARMOR = createEquipmentWithIds().filter(e => ["helmet", "chestplate", "leggings", "boots"].includes(e.slot));

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
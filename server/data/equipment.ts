// Equipment data management module
import type { InsertEquipment } from "@shared/schema";

export const TOOLS: InsertEquipment[] = [
  {
    name: "Picareta",
    emoji: "⛏️",
    effect: "+20% pedra",
    bonus: { type: "resource_boost", resource: "pedra", multiplier: 1.2 },
    slot: "tool",
    toolType: "pickaxe",
    weight: 3,
  },
  {
    name: "Machado",
    emoji: "🪓",
    effect: "+20% madeira",
    bonus: { type: "resource_boost", resource: "madeira", multiplier: 1.2 },
    slot: "tool",
    toolType: "axe",
    weight: 4,
  },
  {
    name: "Pá",
    emoji: "🗿",
    effect: "+20% areia",
    bonus: { type: "resource_boost", resource: "areia", multiplier: 1.2 },
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
    name: "Isca para Pesca",
    emoji: "🪱",
    effect: "Melhora chance de pescar",
    bonus: { type: "fishing", value: 2 },
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

export const ALL_EQUIPMENT = [...TOOLS, ...WEAPONS, ...ARMOR];

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
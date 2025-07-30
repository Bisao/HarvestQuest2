// Modern unified item system - combines resources, equipment, and consumables
import type { InsertGameItem, GameItem } from "@shared/types-new";
import { RESOURCE_IDS, EQUIPMENT_IDS } from "@shared/constants/game-ids";

// Helper function to create timestamp
const now = () => new Date().toISOString();

export function createModernGameItems(): InsertGameItem[] {
  return [
    // BASIC RESOURCES - Raw materials
    {
      id: RESOURCE_IDS.FIBRA,
      name: "fibra",
      displayName: "Fibra",
      description: "Fibras naturais de plantas, úteis para cordas e tecidos básicos",
      iconPath: "🌾",
      category: "resource",
      subcategory: "plant_fiber",
      weight: 0.1,
      stackable: true,
      maxStackSize: 99,
      rarity: "common",
      xpReward: 1,
      yieldAmount: 1,
      requiredTool: null,
      spawnRate: 0.8,
      sellPrice: 2,
      buyPrice: 4,
      attributes: { harvestable: true, renewable: true },
      effects: [],
      tags: ["natural", "renewable", "craftable"]
    },
    {
      id: RESOURCE_IDS.PEDRA,
      name: "stone",
      displayName: "Pedra",
      description: "Rocha sólida, material básico para construção e ferramentas",
      iconPath: "🪨",
      category: "resource",
      subcategory: "mineral",
      weight: 3.0,
      stackable: true,
      maxStackSize: 50,
      rarity: "common",
      xpReward: 2,
      yieldAmount: 1,
      requiredTool: "pickaxe",
      spawnRate: 0.7,
      sellPrice: 3,
      buyPrice: 6,
      attributes: { hardness: "medium", durability: "high" },
      effects: [],
      tags: ["mineral", "construction", "durable"]
    },
    {
      id: RESOURCE_IDS.PEDRAS_SOLTAS,
      name: "loose_stones",
      displayName: "Pedras Soltas",
      description: "Pequenas pedras espalhadas pelo chão, fáceis de coletar",
      iconPath: "🗿",
      category: "resource",
      subcategory: "mineral",
      weight: 1.0,
      stackable: true,
      maxStackSize: 99,
      rarity: "common",
      xpReward: 1,
      yieldAmount: 2,
      requiredTool: null,
      spawnRate: 0.9,
      sellPrice: 1,
      buyPrice: 2,
      attributes: { easy_collect: true },
      effects: [],
      tags: ["mineral", "easy", "abundant"]
    },
    {
      id: RESOURCE_IDS.MADEIRA,
      name: "wood",
      displayName: "Madeira",
      description: "Tronco de árvore processado, material versátil para construção",
      iconPath: "🪵",
      category: "resource",
      subcategory: "wood",
      weight: 3.0,
      stackable: true,
      maxStackSize: 64,
      rarity: "common",
      xpReward: 6,
      yieldAmount: 1,
      requiredTool: "axe",
      spawnRate: 0.6,
      sellPrice: 5,
      buyPrice: 10,
      attributes: { flammable: true, workable: true },
      effects: [],
      tags: ["wood", "construction", "flammable", "renewable"]
    },

    // TOOLS - Equipment for resource gathering
    {
      id: EQUIPMENT_IDS.MACHADO,
      name: "axe",
      displayName: "Machado",
      description: "Ferramenta robusta para cortar madeira e processar árvores",
      iconPath: "🪓",
      category: "tool",
      subcategory: "cutting",
      weight: 4.0,
      stackable: false,
      maxStackSize: 1,
      rarity: "common",
      xpReward: 0,
      yieldAmount: 1,
      durability: 100,
      requiredTool: null,
      spawnRate: 0.0, // Crafted only
      sellPrice: 50,
      buyPrice: 100,
      attributes: { 
        toolType: "axe",
        efficiency: 1.2,
        durabilityLoss: 1,
        slot: "tool"
      },
      effects: ["wood_boost_20"],
      tags: ["tool", "cutting", "durable", "craftable"]
    },
    {
      id: EQUIPMENT_IDS.PICARETA,
      name: "pickaxe",
      displayName: "Picareta",
      description: "Ferramenta essencial para mineração de pedras e minérios",
      iconPath: "⛏️",
      category: "tool",
      subcategory: "mining",
      weight: 3.0,
      stackable: false,
      maxStackSize: 1,
      rarity: "common",
      xpReward: 0,
      yieldAmount: 1,
      durability: 80,
      requiredTool: null,
      spawnRate: 0.0,
      sellPrice: 45,
      buyPrice: 90,
      attributes: {
        toolType: "pickaxe",
        efficiency: 1.2,
        durabilityLoss: 1,
        slot: "tool"
      },
      effects: ["stone_boost_20"],
      tags: ["tool", "mining", "durable", "craftable"]
    },
    {
      id: EQUIPMENT_IDS.VARA_PESCA,
      name: "fishing_rod",
      displayName: "Vara de Pesca",
      description: "Equipamento especializado para capturar peixes em corpos d'água",
      iconPath: "🎣",
      category: "tool",
      subcategory: "fishing",
      weight: 2.0,
      stackable: false,
      maxStackSize: 1,
      rarity: "common",
      xpReward: 0,
      yieldAmount: 1,
      durability: 60,
      requiredTool: null,
      spawnRate: 0.0,
      sellPrice: 30,
      buyPrice: 60,
      attributes: {
        toolType: "fishing_rod",
        efficiency: 1.0,
        durabilityLoss: 2,
        slot: "tool"
      },
      effects: ["fishing_enabled"],
      tags: ["tool", "fishing", "specialized", "craftable"]
    },

    // ANIMALS - Huntable creatures
    {
      id: RESOURCE_IDS.COELHO,
      name: "rabbit",
      displayName: "Coelho",
      description: "Pequeno mamífero ágil, fonte de carne e couro",
      iconPath: "🐰",
      category: "resource",
      subcategory: "small_game",
      weight: 3.0,
      stackable: false,
      maxStackSize: 5,
      rarity: "common",
      xpReward: 5,
      yieldAmount: 1,
      requiredTool: "knife",
      spawnRate: 0.4,
      sellPrice: 15,
      buyPrice: 30,
      attributes: {
        processes_to: {
          "carne": 1,
          "couro": 1,
          "ossos": 2,
          "pelo": 2
        },
        hunting_difficulty: "easy"
      },
      effects: [],
      tags: ["animal", "huntable", "small", "renewable"]
    },
    {
      id: RESOURCE_IDS.VEADO,
      name: "deer",
      displayName: "Veado",
      description: "Mamífero de médio porte, abundante em recursos",
      iconPath: "🦌",
      category: "resource",
      subcategory: "medium_game",
      weight: 8.0,
      stackable: false,
      maxStackSize: 3,
      rarity: "uncommon",
      xpReward: 8,
      yieldAmount: 1,
      requiredTool: "weapon_and_knife",
      spawnRate: 0.2,
      sellPrice: 35,
      buyPrice: 70,
      attributes: {
        processes_to: {
          "carne": 3,
          "couro": 2,
          "ossos": 4,
          "pelo": 1
        },
        hunting_difficulty: "medium"
      },
      effects: [],
      tags: ["animal", "huntable", "medium", "valuable"]
    },

    {
      id: RESOURCE_IDS.COGUMELOS,
      name: "mushrooms",
      displayName: "Cogumelos",
      description: "Cogumelos silvestres, podem ser consumidos crus ou usados para crafting",
      iconPath: "🍄",
      category: "consumable",
      subcategory: "food",
      weight: 1.0,
      stackable: true,
      maxStackSize: 50,
      rarity: "common",
      xpReward: 2,
      yieldAmount: 1,
      requiredTool: null,
      spawnRate: 0.5,
      sellPrice: 6,
      buyPrice: 12,
      attributes: { 
        harvestable: true,
        hunger_restore: 10,
        thirst_restore: 0
      },
      effects: ["hunger_restore"],
      tags: ["natural", "edible", "craftable", "food"]
    },
    {
      id: RESOURCE_IDS.FRUTAS_SILVESTRES,
      name: "wild_berries",
      displayName: "Frutas Silvestres",
      description: "Pequenas frutas encontradas na natureza, doces e nutritivas",
      iconPath: "🫐",
      category: "consumable",
      subcategory: "food",
      weight: 0.5,
      stackable: true,
      maxStackSize: 99,
      rarity: "common",
      xpReward: 1,
      yieldAmount: 3,
      requiredTool: null,
      spawnRate: 0.6,
      sellPrice: 4,
      buyPrice: 8,
      attributes: { 
        harvestable: true, 
        perishable: true,
        hunger_restore: 8,
        thirst_restore: 5
      },
      effects: ["hunger_restore", "thirst_restore"],
      tags: ["natural", "edible", "sweet", "food"]
    },

    // CONSUMABLES - Food and potions
    {
      id: RESOURCE_IDS.CARNE_ASSADA,
      name: "cooked_meat",
      displayName: "Carne Assada",
      description: "Carne preparada no fogo, nutritiva e saborosa",
      iconPath: "🍖",
      category: "consumable",
      subcategory: "food",
      weight: 2.0,
      stackable: true,
      maxStackSize: 20,
      rarity: "common",
      xpReward: 5,
      yieldAmount: 1,
      requiredTool: null,
      spawnRate: 0.0, // Crafted only
      sellPrice: 15,
      buyPrice: 30,
      attributes: {
        hunger_restore: 25,
        thirst_restore: 5,
        spoil_time: 72, // hours
        cook_time: 30 // seconds
      },
      effects: ["hunger_restore", "minor_health_regen"],
      tags: ["food", "cooked", "nutritious", "perishable"]
    },
    {
      id: RESOURCE_IDS.AGUA_FRESCA,
      name: "fresh_water",
      displayName: "Água Fresca",
      description: "Água limpa e pura, essencial para hidratação",
      iconPath: "💧",
      category: "consumable",
      subcategory: "drink",
      weight: 1.0,
      stackable: true,
      maxStackSize: 50,
      rarity: "common",
      xpReward: 1,
      yieldAmount: 5,
      requiredTool: "bucket",
      spawnRate: 0.8,
      sellPrice: 1,
      buyPrice: 2,
      attributes: {
        thirst_restore: 20,
        purity: "high",
        temperature: "cool"
      },
      effects: ["thirst_restore", "cooling"],
      tags: ["drink", "essential", "pure", "renewable"]
    },

    // MATERIALS - Crafting components
    {
      id: RESOURCE_IDS.BARBANTE,
      name: "string",
      displayName: "Barbante",
      description: "Corda fina feita de fibras entrelaçadas, útil para crafting",
      iconPath: "🧵",
      category: "material",
      subcategory: "cordage",
      weight: 0.1,
      stackable: true,
      maxStackSize: 99,
      rarity: "common",
      xpReward: 1,
      yieldAmount: 1,
      requiredTool: null,
      spawnRate: 0.0, // Crafted from fibra
      sellPrice: 1,
      buyPrice: 2,
      attributes: {
        tensile_strength: "low",
        flexibility: "high",
        crafting_tier: 1
      },
      effects: [],
      tags: ["material", "crafting", "flexible", "essential"]
    },
    {
      id: RESOURCE_IDS.FERRO_FUNDIDO,
      name: "cast_iron",
      displayName: "Ferro Fundido",
      description: "Metal processado de alta qualidade para ferramentas avançadas",
      iconPath: "🔩",
      category: "material",
      subcategory: "metal",
      weight: 4.0,
      stackable: true,
      maxStackSize: 20,
      rarity: "uncommon",
      xpReward: 5,
      yieldAmount: 1,
      requiredTool: "pickaxe",
      spawnRate: 0.1,
      sellPrice: 15,
      buyPrice: 30,
      attributes: {
        hardness: "high",
        conductivity: "medium",
        magnetic: true,
        crafting_tier: 2
      },
      effects: [],
      tags: ["material", "metal", "advanced", "durable"]
    }
  ];
}

// Legacy adapter functions for backward compatibility
export function adaptToLegacyResource(item: GameItem): any {
  return {
    id: item.id,
    name: item.displayName,
    emoji: item.iconPath,
    weight: item.weight,
    value: item.sellPrice,
    type: item.subcategory,
    rarity: item.rarity,
    requiredTool: item.requiredTool,
    experienceValue: item.xpReward
  };
}

export function adaptToLegacyEquipment(item: GameItem): any {
  return {
    id: item.id,
    name: item.displayName,
    emoji: item.iconPath,
    effect: item.description,
    bonus: item.attributes,
    slot: item.attributes.slot || "tool",
    toolType: item.attributes.toolType,
    weight: item.weight
  };
}

// Export all items with proper timestamps
export function getAllGameItems(): GameItem[] {
  const timestamp = now();
  return createModernGameItems().map(item => ({
    ...item,
    createdAt: timestamp,
    updatedAt: timestamp
  } as GameItem));
}

// Category filters
export function getItemsByCategory(category: string): GameItem[] {
  return getAllGameItems().filter(item => item.category === category);
}

export function getItemsBySubcategory(subcategory: string): GameItem[] {
  return getAllGameItems().filter(item => item.subcategory === subcategory);
}

export function getItemsByTag(tag: string): GameItem[] {
  return getAllGameItems().filter(item => item.tags.includes(tag));
}

export function getCollectableItems(): GameItem[] {
  return getAllGameItems().filter(item => 
    item.category === 'resource' && item.spawnRate > 0
  );
}

export function getCraftableItems(): GameItem[] {
  return getAllGameItems().filter(item => 
    item.tags.includes('craftable') || item.spawnRate === 0
  );
}
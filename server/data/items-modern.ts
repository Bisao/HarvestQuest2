// Modern unified item system - combines resources, equipment, and consumables
import type { Resource, Equipment } from "@shared/types";
import { RESOURCE_IDS, EQUIPMENT_IDS } from "@shared/constants/game-ids";

// Helper function to create timestamp
const now = () => new Date().toISOString();

export function createModernGameItems(): (Resource | Equipment)[] {
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
      weight: 15, // 15 gramas por fibra
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
      id: RESOURCE_IDS.BARBANTE,
      name: "barbante",
      displayName: "Barbante",
      description: "Fios processados de fibra, material essencial para artesanato e ferramentas",
      iconPath: "🧵",
      category: "resource",
      subcategory: "processed_fiber",
      weight: 10, // 10 gramas por barbante
      stackable: true,
      maxStackSize: 99,
      rarity: "common",
      xpReward: 2,
      yieldAmount: 1,
      requiredTool: null,
      spawnRate: 0, // Não spawn natural, apenas craftado
      sellPrice: 5,
      buyPrice: 10,
      attributes: { crafted: true, flexible: true },
      effects: [],
      tags: ["crafted", "cordage", "essential"]
    },
    {
      id: RESOURCE_IDS.PEDRA,
      name: "stone",
      displayName: "Pedra",
      description: "Rocha sólida, material básico para construção e ferramentas",
      iconPath: "🪨",
      category: "resource",
      subcategory: "mineral",
      weight: 1300, // 1.3 kg = 1300 gramas
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
      weight: 350, // 350 gramas por pedra solta
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
      weight: 2500, // 2.5 kg = 2500 gramas por tronco
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
    
    // More basic resources that were missing
    {
      id: RESOURCE_IDS.GRAVETOS,
      name: "twigs",
      displayName: "Gravetos",
      description: "Pequenos galhos secos, úteis para fogueiras e artesanato básico",
      iconPath: "🪵",
      category: "resource",
      subcategory: "wood",
      weight: 100,
      stackable: true,
      maxStackSize: 99,
      rarity: "common",
      xpReward: 1,
      yieldAmount: 2,
      requiredTool: null,
      spawnRate: 0.9,
      sellPrice: 2,
      buyPrice: 4,
      attributes: { flammable: true },
      effects: [],
      tags: ["wood", "fuel", "abundant"]
    },
    {
      id: RESOURCE_IDS.AGUA_FRESCA,
      name: "fresh_water",
      displayName: "Água Fresca",
      description: "Água limpa e potável de fontes naturais",
      iconPath: "💧",
      category: "resource",
      subcategory: "liquid",
      weight: 1000,
      stackable: true,
      maxStackSize: 10,
      rarity: "common",
      xpReward: 1,
      yieldAmount: 1,
      requiredTool: "bucket",
      spawnRate: 0.8,
      sellPrice: 1,
      buyPrice: 2,
      attributes: { consumable: true, thirst_restore: 20 },
      effects: ["thirst_restore"],
      tags: ["liquid", "consumable", "essential"]
    },
    {
      id: RESOURCE_IDS.BAMBU,
      name: "bamboo",
      displayName: "Bambu",
      description: "Bambu flexível e resistente, ideal para construções e ferramentas",
      iconPath: "🎋",
      category: "resource",
      subcategory: "wood",
      weight: 800,
      stackable: true,
      maxStackSize: 64,
      rarity: "common",
      xpReward: 2,
      yieldAmount: 1,
      requiredTool: "axe",
      spawnRate: 0.6,
      sellPrice: 4,
      buyPrice: 8,
      attributes: { flexible: true, lightweight: true },
      effects: [],
      tags: ["wood", "flexible", "renewable"]
    },
    
    // Animals for hunting
    {
      id: RESOURCE_IDS.COELHO,
      name: "rabbit",
      displayName: "Coelho",
      description: "Coelho selvagem, fonte de carne e pelo",
      iconPath: "🐰",
      category: "resource",
      subcategory: "small_game",
      weight: 1500,
      stackable: true,
      maxStackSize: 10,
      rarity: "common",
      xpReward: 5,
      yieldAmount: 1,
      requiredTool: "knife",
      spawnRate: 0.4,
      sellPrice: 15,
      buyPrice: 30,
      attributes: { hunted: true, processing_required: true },
      effects: [],
      tags: ["meat", "fur", "small_game"]
    },
    {
      id: RESOURCE_IDS.VEADO,
      name: "deer",
      displayName: "Veado",
      description: "Veado majestoso, fonte valiosa de carne e couro",
      iconPath: "🦌",
      category: "resource", 
      subcategory: "medium_game",
      weight: 45000,
      stackable: true,
      maxStackSize: 5,
      rarity: "uncommon",
      xpReward: 8,
      yieldAmount: 1,
      requiredTool: "weapon_and_knife",
      spawnRate: 0.2,
      sellPrice: 35,
      buyPrice: 70,
      attributes: { hunted: true, weapon_required: true },
      effects: [],
      tags: ["meat", "leather", "medium_game"]
    },
    {
      id: RESOURCE_IDS.JAVALI,
      name: "boar",
      displayName: "Javali",
      description: "Javali selvagem feroz, caça de grande valor",
      iconPath: "🐗",
      category: "resource",
      subcategory: "large_game", 
      weight: 70000,
      stackable: true,
      maxStackSize: 3,
      rarity: "rare",
      xpReward: 12,
      yieldAmount: 1,
      requiredTool: "weapon_and_knife",
      spawnRate: 0.1,
      sellPrice: 50,
      buyPrice: 100,
      attributes: { dangerous: true, weapon_required: true },
      effects: [],
      tags: ["meat", "leather", "large_game", "dangerous"]
    },
    
    // Fish
    {
      id: RESOURCE_IDS.PEIXE_PEQUENO,
      name: "small_fish",
      displayName: "Peixe Pequeno",
      description: "Peixe pequeno comum em rios e lagos",
      iconPath: "🐟",
      category: "resource",
      subcategory: "fish",
      weight: 300,
      stackable: true,
      maxStackSize: 20,
      rarity: "common",
      xpReward: 2,
      yieldAmount: 1,
      requiredTool: "fishing_rod",
      spawnRate: 0.6,
      sellPrice: 8,
      buyPrice: 16,
      attributes: { aquatic: true, bait_required: true },
      effects: [],
      tags: ["fish", "food", "common"]
    },
    {
      id: RESOURCE_IDS.PEIXE_GRANDE,
      name: "large_fish",
      displayName: "Peixe Grande",
      description: "Peixe de grande porte, mais nutritivo e valioso",
      iconPath: "🐠",
      category: "resource",
      subcategory: "fish",
      weight: 1500,
      stackable: true,
      maxStackSize: 10,
      rarity: "uncommon",
      xpReward: 4,
      yieldAmount: 1,
      requiredTool: "fishing_rod",
      spawnRate: 0.3,
      sellPrice: 18,
      buyPrice: 36,
      attributes: { aquatic: true, bait_required: true },
      effects: [],
      tags: ["fish", "food", "nutritious"]
    },
    {
      id: RESOURCE_IDS.SALMAO,
      name: "salmon",
      displayName: "Salmão",
      description: "Salmão premium, peixe raro e muito nutritivo",
      iconPath: "🍣",
      category: "resource",
      subcategory: "fish",
      weight: 2500,
      stackable: true,
      maxStackSize: 5,
      rarity: "rare",
      xpReward: 6,
      yieldAmount: 1,
      requiredTool: "fishing_rod",
      spawnRate: 0.1,
      sellPrice: 25,
      buyPrice: 50,
      attributes: { aquatic: true, premium: true },
      effects: [],
      tags: ["fish", "food", "premium", "rare"]
    },
    
    // Wild plants
    {
      id: RESOURCE_IDS.COGUMELOS,
      name: "mushrooms",
      displayName: "Cogumelos",
      description: "Cogumelos selvagens nutritivos encontrados na floresta",
      iconPath: "🍄",
      category: "resource",
      subcategory: "wild_plant",
      weight: 80,
      stackable: true,
      maxStackSize: 50,
      rarity: "common",
      xpReward: 2,
      yieldAmount: 3,
      requiredTool: null,
      spawnRate: 0.5,
      sellPrice: 6,
      buyPrice: 12,
      attributes: { consumable: true, hunger_restore: 8 },
      effects: ["hunger_restore"],
      tags: ["food", "forage", "natural"]
    },
    {
      id: RESOURCE_IDS.FRUTAS_SILVESTRES,
      name: "wild_berries", 
      displayName: "Frutas Silvestres",
      description: "Frutas silvestres doces e refrescantes",
      iconPath: "🫐",
      category: "resource",
      subcategory: "wild_plant",
      weight: 50,
      stackable: true,
      maxStackSize: 50,
      rarity: "common",
      xpReward: 1,
      yieldAmount: 4,
      requiredTool: null,
      spawnRate: 0.7,
      sellPrice: 4,
      buyPrice: 8,
      attributes: { consumable: true, thirst_restore: 5, hunger_restore: 3 },
      effects: ["hunger_restore", "thirst_restore"],
      tags: ["food", "fruit", "refreshing"]
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
      weight: 1800, // 1.8 kg = 1800 gramas
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
      weight: 1500, // 1.5 kg = 1500 gramas
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
      weight: 800, // 800 gramas
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
      weight: 1200, // 1.2 kg = 1200 gramas (coelho médio)
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
      weight: 35000, // 35 kg = 35000 gramas (veado médio)
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
      weight: 200,
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
        hunger_restore: 2,
        thirst_restore: 0,
        consumable: true,
        food_type: "raw"
      },
      effects: ["hunger_restore"],
      tags: ["natural", "edible", "craftable", "food", "consumable"]
    },
    {
      id: RESOURCE_IDS.FRUTAS_SILVESTRES,
      name: "wild_berries",
      displayName: "Frutas Silvestres",
      description: "Pequenas frutas encontradas na natureza, doces e nutritivas",
      iconPath: "🫐",
      category: "consumable",
      subcategory: "food",
      weight: 80,
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
        hunger_restore: 1,
        thirst_restore: 2,
        consumable: true,
        food_type: "raw"
      },
      effects: ["hunger_restore", "thirst_restore"],
      tags: ["natural", "edible", "sweet", "food", "consumable"]
    },

    // CONSUMABLES - Food and potions
    {
      id: RESOURCE_IDS.COGUMELOS_ASSADOS,
      name: "cooked_mushrooms",
      displayName: "Cogumelos Assados",
      description: "Cogumelos preparados no fogo, mais nutritivos que crus",
      iconPath: "🍄‍🟫",
      category: "consumable",
      subcategory: "food",
      weight: 180,
      stackable: true,
      maxStackSize: 30,
      rarity: "common",
      xpReward: 3,
      yieldAmount: 1,
      requiredTool: null,
      spawnRate: 0.0,
      sellPrice: 10,
      buyPrice: 20,
      attributes: {
        hunger_restore: 8,
        thirst_restore: 1,
        consumable: true,
        food_type: "cooked",
        cook_time: 20
      },
      effects: ["hunger_restore"],
      tags: ["food", "cooked", "nutritious", "consumable"]
    },
    {
      id: RESOURCE_IDS.CARNE_ASSADA,
      name: "cooked_meat",
      displayName: "Carne Assada",
      description: "Carne preparada no fogo, nutritiva e saborosa",
      iconPath: "🍖",
      category: "consumable",
      subcategory: "food",
      weight: 250,
      stackable: true,
      maxStackSize: 20,
      rarity: "common",
      xpReward: 5,
      yieldAmount: 1,
      requiredTool: null,
      spawnRate: 0.0,
      sellPrice: 15,
      buyPrice: 30,
      attributes: {
        hunger_restore: 25,
        thirst_restore: 5,
        spoil_time: 72,
        cook_time: 30,
        consumable: true,
        food_type: "cooked"
      },
      effects: ["hunger_restore", "minor_health_regen"],
      tags: ["food", "cooked", "nutritious", "perishable", "consumable"]
    },
    {
      id: RESOURCE_IDS.AGUA_FRESCA,
      name: "fresh_water",
      displayName: "Água Fresca",
      description: "Água limpa e pura, essencial para hidratação",
      iconPath: "💧",
      category: "consumable",
      subcategory: "drink",
      weight: 500,
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
        temperature: "cool",
        consumable: true,
        food_type: "drink"
      },
      effects: ["thirst_restore", "cooling"],
      tags: ["drink", "essential", "pure", "renewable", "consumable"]
    },
    {
      id: RESOURCE_IDS.PEIXE_GRELHADO,
      name: "grilled_fish",
      displayName: "Peixe Grelhado",
      description: "Peixe cozido, fonte proteica nutritiva",
      iconPath: "🐟",
      category: "consumable",
      subcategory: "food",
      weight: 200,
      stackable: true,
      maxStackSize: 20,
      rarity: "common",
      xpReward: 4,
      yieldAmount: 1,
      requiredTool: null,
      spawnRate: 0.0,
      sellPrice: 12,
      buyPrice: 24,
      attributes: {
        hunger_restore: 12,
        thirst_restore: 2,
        consumable: true,
        food_type: "cooked",
        cook_time: 25
      },
      effects: ["hunger_restore"],
      tags: ["food", "cooked", "nutritious", "consumable"]
    },
    {
      id: RESOURCE_IDS.ENSOPADO_CARNE,
      name: "meat_stew",
      displayName: "Ensopado de Carne",
      description: "Ensopado rico e nutritivo, muito satisfatório",
      iconPath: "🍲",
      category: "consumable",
      subcategory: "food",
      weight: 400,
      stackable: true,
      maxStackSize: 15,
      rarity: "uncommon",
      xpReward: 8,
      yieldAmount: 1,
      requiredTool: null,
      spawnRate: 0.0,
      sellPrice: 25,
      buyPrice: 50,
      attributes: {
        hunger_restore: 20,
        thirst_restore: 8,
        consumable: true,
        food_type: "cooked",
        cook_time: 60
      },
      effects: ["hunger_restore", "thirst_restore", "minor_health_regen"],
      tags: ["food", "cooked", "nutritious", "hearty", "consumable"]
    },
    {
      id: RESOURCE_IDS.SUCO_FRUTAS,
      name: "fruit_juice",
      displayName: "Suco de Frutas",
      description: "Bebida refrescante feita de frutas silvestres",
      iconPath: "🧃",
      category: "consumable",
      subcategory: "drink",
      weight: 250,
      stackable: true,
      maxStackSize: 30,
      rarity: "common",
      xpReward: 2,
      yieldAmount: 1,
      requiredTool: null,
      spawnRate: 0.0,
      sellPrice: 5,
      buyPrice: 10,
      attributes: {
        hunger_restore: 3,
        thirst_restore: 12,
        consumable: true,
        food_type: "drink",
        refreshing: true
      },
      effects: ["hunger_restore", "thirst_restore", "refreshing"],
      tags: ["drink", "refreshing", "sweet", "consumable"]
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
      weight: 25, // 25 gramas por metro de barbante
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
      weight: 2800, // 2.8 kg = 2800 gramas por barra de ferro
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
export function adaptToLegacyResource(item: any): any {
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

export function adaptToLegacyEquipment(item: any): any {
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
export function getAllGameItems(): any[] {
  const timestamp = now();
  return createModernGameItems().map(item => ({
    ...item,
    createdAt: timestamp,
    updatedAt: timestamp
  }));
}

// Category filters
export function getItemsByCategory(category: string): any[] {
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
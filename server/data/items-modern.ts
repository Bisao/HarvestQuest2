
/**
 * SISTEMA MODERNO DE ITENS - ATUALIZADO COM TODOS OS NOVOS RECURSOS
 * 
 * Este arquivo contém TODOS os itens do jogo com suas propriedades completas.
 * Atualizado com os novos recursos, animais e UUIDs padronizados.
 */

import { 
  RESOURCE_IDS, 
  EQUIPMENT_IDS, 
  BIOME_IDS,
  isValidGameId 
} from '../shared/constants/game-ids';

export interface ModernItem {
  id: string;
  name: string;
  description: string;
  type: 'resource' | 'equipment' | 'consumable' | 'material' | 'component';
  category: string;
  
  // Propriedades físicas
  weight: number;
  stackable: boolean;
  maxStack?: number;
  durability?: number;
  
  // Propriedades econômicas
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  baseValue: number;
  
  // Propriedades de spawn
  spawnBiomes?: string[];
  spawnRate?: number;
  toolRequired?: string[];
  minToolLevel?: number;
  
  // Propriedades consumíveis
  consumable?: boolean;
  hungerRestore?: number;
  thirstRestore?: number;
  healthRestore?: number;
  buffs?: Array<{
    type: string;
    value: number;
    duration: number;
  }>;
  
  // Propriedades de equipamento
  equipmentSlot?: 'head' | 'chest' | 'legs' | 'feet' | 'hands' | 'weapon' | 'tool';
  attackPower?: number;
  defense?: number;
  toolEfficiency?: number;
  
  // Metadados
  tags: string[];
  craftable: boolean;
  obtainableMethods: string[];
}

/**
 * RECURSOS BÁSICOS - EXPANDIDOS
 */
export const BASIC_RESOURCES: ModernItem[] = [
  {
    id: RESOURCE_IDS.FIBRA,
    name: "Fibra",
    description: "Fibras naturais coletadas de plantas selvagens. Material básico para artesanato.",
    type: "resource",
    category: "basic_materials",
    weight: 0.1,
    stackable: true,
    maxStack: 100,
    rarity: "common",
    baseValue: 1,
    spawnBiomes: [BIOME_IDS.FLORESTA, BIOME_IDS.SAVANA],
    spawnRate: 0.8,
    toolRequired: [],
    tags: ["basic", "plant", "fiber"],
    craftable: false,
    obtainableMethods: ["gathering", "exploration"]
  },
  {
    id: RESOURCE_IDS.PEDRA,
    name: "Pedra",
    description: "Pedras comuns encontradas no solo. Úteis para construção e ferramentas básicas.",
    type: "resource",
    category: "basic_materials",
    weight: 0.5,
    stackable: true,
    maxStack: 50,
    rarity: "common",
    baseValue: 2,
    spawnBiomes: [BIOME_IDS.MONTANHA, BIOME_IDS.DESERTO],
    spawnRate: 0.9,
    toolRequired: [],
    tags: ["basic", "stone", "construction"],
    craftable: false,
    obtainableMethods: ["gathering", "mining"]
  },
  {
    id: RESOURCE_IDS.MADEIRA,
    name: "Madeira",
    description: "Madeira comum de árvores. Material versátil para construção e crafting.",
    type: "resource",
    category: "basic_materials",
    weight: 0.3,
    stackable: true,
    maxStack: 50,
    rarity: "common",
    baseValue: 3,
    spawnBiomes: [BIOME_IDS.FLORESTA],
    spawnRate: 0.7,
    toolRequired: [EQUIPMENT_IDS.MACHADO],
    minToolLevel: 1,
    tags: ["basic", "wood", "construction"],
    craftable: false,
    obtainableMethods: ["chopping", "gathering"]
  },
  {
    id: RESOURCE_IDS.BAMBU,
    name: "Bambu",
    description: "Bambu resistente e flexível. Excelente para construções leves e ferramentas.",
    type: "resource",
    category: "basic_materials",
    weight: 0.2,
    stackable: true,
    maxStack: 30,
    rarity: "uncommon",
    baseValue: 5,
    spawnBiomes: [BIOME_IDS.FLORESTA, BIOME_IDS.PANTANO],
    spawnRate: 0.6,
    toolRequired: [EQUIPMENT_IDS.MACHADO],
    tags: ["wood", "flexible", "construction"],
    craftable: false,
    obtainableMethods: ["chopping"]
  },
  {
    id: RESOURCE_IDS.ARGILA,
    name: "Argila",
    description: "Argila maleável encontrada próxima a corpos d'água. Ideal para cerâmica.",
    type: "resource",
    category: "basic_materials",
    weight: 0.8,
    stackable: true,
    maxStack: 20,
    rarity: "common",
    baseValue: 4,
    spawnBiomes: [BIOME_IDS.PANTANO, BIOME_IDS.OCEANO],
    spawnRate: 0.5,
    toolRequired: [EQUIPMENT_IDS.PA],
    tags: ["clay", "ceramic", "moldable"],
    craftable: false,
    obtainableMethods: ["digging", "gathering"]
  },
  {
    id: RESOURCE_IDS.FERRO_FUNDIDO,
    name: "Ferro Fundido",
    description: "Ferro bruto extraído de minérios. Base para ferramentas e armas avançadas.",
    type: "resource",
    category: "metals",
    weight: 2.0,
    stackable: true,
    maxStack: 20,
    rarity: "uncommon",
    baseValue: 15,
    spawnBiomes: [BIOME_IDS.MONTANHA, BIOME_IDS.CAVERNAS],
    spawnRate: 0.3,
    toolRequired: [EQUIPMENT_IDS.PICARETA],
    minToolLevel: 2,
    tags: ["metal", "iron", "processed"],
    craftable: false,
    obtainableMethods: ["mining", "smelting"]
  }
];

/**
 * NOVOS MATERIAIS EXPANDIDOS
 */
export const EXPANDED_MATERIALS: ModernItem[] = [
  // Fibras Especializadas
  {
    id: RESOURCE_IDS.LINHO,
    name: "Linho",
    description: "Fibra de linho de alta qualidade. Excelente para tecidos resistentes.",
    type: "resource",
    category: "fibers",
    weight: 0.1,
    stackable: true,
    maxStack: 100,
    rarity: "uncommon",
    baseValue: 8,
    spawnBiomes: [BIOME_IDS.FLORESTA],
    spawnRate: 0.4,
    tags: ["fiber", "textile", "quality"],
    craftable: false,
    obtainableMethods: ["gathering", "farming"]
  },
  {
    id: RESOURCE_IDS.ALGODAO,
    name: "Algodão",
    description: "Fibra macia de algodão. Ideal para roupas confortáveis.",
    type: "resource",
    category: "fibers",
    weight: 0.05,
    stackable: true,
    maxStack: 100,
    rarity: "uncommon",
    baseValue: 10,
    spawnBiomes: [BIOME_IDS.SAVANA],
    spawnRate: 0.3,
    tags: ["fiber", "soft", "textile"],
    craftable: false,
    obtainableMethods: ["gathering", "farming"]
  },
  {
    id: RESOURCE_IDS.CANAMO,
    name: "Cânhamo",
    description: "Fibra resistente de cânhamo. Perfeita para cordas e tecidos duráveis.",
    type: "resource",
    category: "fibers",
    weight: 0.15,
    stackable: true,
    maxStack: 80,
    rarity: "uncommon",
    baseValue: 12,
    spawnBiomes: [BIOME_IDS.FLORESTA, BIOME_IDS.MONTANHA],
    spawnRate: 0.35,
    tags: ["fiber", "durable", "rope"],
    craftable: false,
    obtainableMethods: ["gathering"]
  },

  // Madeiras Especializadas
  {
    id: RESOURCE_IDS.MADEIRA_CARVALHO,
    name: "Madeira de Carvalho",
    description: "Madeira nobre e resistente. Ideal para construções permanentes.",
    type: "resource",
    category: "premium_woods",
    weight: 0.5,
    stackable: true,
    maxStack: 30,
    rarity: "rare",
    baseValue: 25,
    spawnBiomes: [BIOME_IDS.FLORESTA],
    spawnRate: 0.2,
    toolRequired: [EQUIPMENT_IDS.MACHADO_FERRO],
    minToolLevel: 2,
    tags: ["wood", "premium", "durable"],
    craftable: false,
    obtainableMethods: ["chopping"]
  },
  {
    id: RESOURCE_IDS.MADEIRA_CEDRO,
    name: "Madeira de Cedro",
    description: "Madeira aromática e resistente a insetos. Excelente para armazenamento.",
    type: "resource",
    category: "premium_woods",
    weight: 0.4,
    stackable: true,
    maxStack: 30,
    rarity: "rare",
    baseValue: 30,
    spawnBiomes: [BIOME_IDS.MONTANHA],
    spawnRate: 0.15,
    toolRequired: [EQUIPMENT_IDS.MACHADO_FERRO],
    tags: ["wood", "aromatic", "preservation"],
    craftable: false,
    obtainableMethods: ["chopping"]
  },
  {
    id: RESOURCE_IDS.MADEIRA_MOGNO,
    name: "Madeira de Mogno",
    description: "Madeira exótica de altíssima qualidade. Rara e valiosa.",
    type: "resource",
    category: "exotic_woods",
    weight: 0.6,
    stackable: true,
    maxStack: 20,
    rarity: "epic",
    baseValue: 50,
    spawnBiomes: [BIOME_IDS.FLORESTA],
    spawnRate: 0.05,
    toolRequired: [EQUIPMENT_IDS.MACHADO_ACO],
    minToolLevel: 3,
    tags: ["wood", "exotic", "luxury"],
    craftable: false,
    obtainableMethods: ["chopping"]
  },

  // Pedras e Minerais Preciosos
  {
    id: RESOURCE_IDS.QUARTZO,
    name: "Quartzo",
    description: "Cristal de quartzo puro. Usado em equipamentos mágicos e decoração.",
    type: "resource",
    category: "gems",
    weight: 0.3,
    stackable: true,
    maxStack: 50,
    rarity: "rare",
    baseValue: 40,
    spawnBiomes: [BIOME_IDS.CAVERNAS, BIOME_IDS.MONTANHA],
    spawnRate: 0.2,
    toolRequired: [EQUIPMENT_IDS.PICARETA_FERRO],
    tags: ["gem", "crystal", "magic"],
    craftable: false,
    obtainableMethods: ["mining"]
  },
  {
    id: RESOURCE_IDS.AMETISTA,
    name: "Ametista",
    description: "Gema roxa rara. Possui propriedades místicas especiais.",
    type: "resource",
    category: "gems",
    weight: 0.2,
    stackable: true,
    maxStack: 20,
    rarity: "epic",
    baseValue: 100,
    spawnBiomes: [BIOME_IDS.CAVERNAS],
    spawnRate: 0.1,
    toolRequired: [EQUIPMENT_IDS.PICARETA_ACO],
    tags: ["gem", "rare", "mystical"],
    craftable: false,
    obtainableMethods: ["mining"]
  },
  {
    id: RESOURCE_IDS.DIAMANTE,
    name: "Diamante",
    description: "A gema mais dura e valiosa conhecida. Extremamente rara.",
    type: "resource",
    category: "gems",
    weight: 0.1,
    stackable: true,
    maxStack: 10,
    rarity: "legendary",
    baseValue: 500,
    spawnBiomes: [BIOME_IDS.CAVERNAS],
    spawnRate: 0.02,
    toolRequired: [EQUIPMENT_IDS.PICARETA_ACO],
    minToolLevel: 5,
    tags: ["gem", "legendary", "unbreakable"],
    craftable: false,
    obtainableMethods: ["deep_mining"]
  }
];

/**
 * ANIMAIS TERRESTRES E AQUÁTICOS
 */
export const ANIMALS_AND_FISH: ModernItem[] = [
  // Animais Pequenos
  {
    id: RESOURCE_IDS.COELHO,
    name: "Coelho",
    description: "Coelho selvagem. Fonte de carne e pelo macio.",
    type: "resource",
    category: "small_animals",
    weight: 2.0,
    stackable: true,
    maxStack: 10,
    rarity: "common",
    baseValue: 15,
    spawnBiomes: [BIOME_IDS.FLORESTA, BIOME_IDS.SAVANA],
    spawnRate: 0.6,
    toolRequired: [EQUIPMENT_IDS.ARCO_FLECHA, EQUIPMENT_IDS.LANCA],
    tags: ["animal", "meat", "fur"],
    craftable: false,
    obtainableMethods: ["hunting"],
    consumable: true,
    hungerRestore: 25,
    healthRestore: 5
  },
  {
    id: RESOURCE_IDS.RAPOSA,
    name: "Raposa",
    description: "Raposa astuta. Pelo valioso e carne saborosa.",
    type: "resource",
    category: "small_animals",
    weight: 3.0,
    stackable: true,
    maxStack: 8,
    rarity: "uncommon",
    baseValue: 25,
    spawnBiomes: [BIOME_IDS.FLORESTA],
    spawnRate: 0.3,
    toolRequired: [EQUIPMENT_IDS.ARCO_FLECHA],
    tags: ["animal", "fur", "cunning"],
    craftable: false,
    obtainableMethods: ["hunting"],
    consumable: true,
    hungerRestore: 30,
    healthRestore: 8
  },

  // Animais Médios
  {
    id: RESOURCE_IDS.VEADO,
    name: "Veado",
    description: "Veado gracioso. Excelente fonte de carne e couro.",
    type: "resource",
    category: "medium_animals",
    weight: 8.0,
    stackable: true,
    maxStack: 5,
    rarity: "uncommon",
    baseValue: 50,
    spawnBiomes: [BIOME_IDS.FLORESTA, BIOME_IDS.MONTANHA],
    spawnRate: 0.4,
    toolRequired: [EQUIPMENT_IDS.ARCO_FLECHA, EQUIPMENT_IDS.LANCA],
    tags: ["animal", "meat", "leather"],
    craftable: false,
    obtainableMethods: ["hunting"],
    consumable: true,
    hungerRestore: 60,
    healthRestore: 15
  },
  {
    id: RESOURCE_IDS.JAVALI,
    name: "Javali",
    description: "Javali feroz. Carne abundante e couro resistente.",
    type: "resource",
    category: "medium_animals",
    weight: 12.0,
    stackable: true,
    maxStack: 3,
    rarity: "uncommon",
    baseValue: 80,
    spawnBiomes: [BIOME_IDS.FLORESTA, BIOME_IDS.PANTANO],
    spawnRate: 0.3,
    toolRequired: [EQUIPMENT_IDS.LANCA, EQUIPMENT_IDS.ARCO_FLECHA],
    minToolLevel: 2,
    tags: ["animal", "dangerous", "meat"],
    craftable: false,
    obtainableMethods: ["hunting"],
    consumable: true,
    hungerRestore: 80,
    healthRestore: 20
  },

  // Animais Grandes
  {
    id: RESOURCE_IDS.URSO,
    name: "Urso",
    description: "Urso poderoso. Perigoso, mas fornece muito couro e carne.",
    type: "resource",
    category: "large_animals",
    weight: 25.0,
    stackable: true,
    maxStack: 2,
    rarity: "rare",
    baseValue: 200,
    spawnBiomes: [BIOME_IDS.MONTANHA, BIOME_IDS.FLORESTA],
    spawnRate: 0.1,
    toolRequired: [EQUIPMENT_IDS.LANCA_FERRO, EQUIPMENT_IDS.ARCO_COMPOSTO],
    minToolLevel: 3,
    tags: ["animal", "dangerous", "boss"],
    craftable: false,
    obtainableMethods: ["hunting"],
    consumable: true,
    hungerRestore: 150,
    healthRestore: 50
  },

  // Peixes de Água Doce
  {
    id: RESOURCE_IDS.TRUTA,
    name: "Truta",
    description: "Peixe de água doce saboroso. Rica em nutrientes.",
    type: "resource",
    category: "freshwater_fish",
    weight: 1.0,
    stackable: true,
    maxStack: 15,
    rarity: "common",
    baseValue: 12,
    spawnBiomes: [BIOME_IDS.FLORESTA],
    spawnRate: 0.7,
    toolRequired: [EQUIPMENT_IDS.VARA_PESCA],
    tags: ["fish", "nutritious", "freshwater"],
    craftable: false,
    obtainableMethods: ["fishing"],
    consumable: true,
    hungerRestore: 20,
    thirstRestore: 5,
    healthRestore: 3
  },
  {
    id: RESOURCE_IDS.SALMAO,
    name: "Salmão",
    description: "Peixe grande e nutritivo. Excelente para pratos elaborados.",
    type: "resource",
    category: "freshwater_fish",
    weight: 2.0,
    stackable: true,
    maxStack: 10,
    rarity: "uncommon",
    baseValue: 25,
    spawnBiomes: [BIOME_IDS.FLORESTA, BIOME_IDS.MONTANHA],
    spawnRate: 0.4,
    toolRequired: [EQUIPMENT_IDS.VARA_PESCA_AVANCADA],
    tags: ["fish", "large", "premium"],
    craftable: false,
    obtainableMethods: ["fishing"],
    consumable: true,
    hungerRestore: 40,
    thirstRestore: 8,
    healthRestore: 10
  },

  // Peixes Marinhos
  {
    id: RESOURCE_IDS.ATUM,
    name: "Atum",
    description: "Peixe marinho grande e saboroso. Muito nutritivo.",
    type: "resource",
    category: "saltwater_fish",
    weight: 5.0,
    stackable: true,
    maxStack: 5,
    rarity: "rare",
    baseValue: 60,
    spawnBiomes: [BIOME_IDS.OCEANO],
    spawnRate: 0.3,
    toolRequired: [EQUIPMENT_IDS.VARA_PESCA_MASTER],
    tags: ["fish", "ocean", "large"],
    craftable: false,
    obtainableMethods: ["deep_fishing"],
    consumable: true,
    hungerRestore: 80,
    thirstRestore: 10,
    healthRestore: 20
  }
];

/**
 * PLANTAS E CONSUMÍVEIS NATURAIS
 */
export const PLANTS_AND_CONSUMABLES: ModernItem[] = [
  {
    id: RESOURCE_IDS.COGUMELOS,
    name: "Cogumelos Selvagens",
    description: "Cogumelos comestíveis encontrados na floresta. Nutritivos mas simples.",
    type: "consumable",
    category: "wild_plants",
    weight: 0.2,
    stackable: true,
    maxStack: 30,
    rarity: "common",
    baseValue: 5,
    spawnBiomes: [BIOME_IDS.FLORESTA, BIOME_IDS.PANTANO],
    spawnRate: 0.8,
    tags: ["plant", "mushroom", "edible"],
    craftable: false,
    obtainableMethods: ["foraging"],
    consumable: true,
    hungerRestore: 15,
    healthRestore: 2
  },
  {
    id: RESOURCE_IDS.FRUTAS_SILVESTRES,
    name: "Frutas Silvestres",
    description: "Mistura de frutas selvagens. Doces e refrescantes.",
    type: "consumable",
    category: "wild_plants",
    weight: 0.3,
    stackable: true,
    maxStack: 25,
    rarity: "common",
    baseValue: 8,
    spawnBiomes: [BIOME_IDS.FLORESTA, BIOME_IDS.SAVANA],
    spawnRate: 0.6,
    tags: ["fruit", "sweet", "refreshing"],
    craftable: false,
    obtainableMethods: ["foraging"],
    consumable: true,
    hungerRestore: 12,
    thirstRestore: 8,
    healthRestore: 3
  },
  {
    id: RESOURCE_IDS.ERVAS_MEDICINAIS,
    name: "Ervas Medicinais",
    description: "Plantas com propriedades curativas. Úteis para medicina natural.",
    type: "consumable",
    category: "medicinal",
    weight: 0.1,
    stackable: true,
    maxStack: 20,
    rarity: "uncommon",
    baseValue: 20,
    spawnBiomes: [BIOME_IDS.FLORESTA, BIOME_IDS.MONTANHA],
    spawnRate: 0.3,
    tags: ["herb", "medicinal", "healing"],
    craftable: false,
    obtainableMethods: ["foraging"],
    consumable: true,
    healthRestore: 25,
    buffs: [{
      type: "regeneration",
      value: 5,
      duration: 300
    }]
  }
];

/**
 * COMPONENTES E PARTES DE EQUIPAMENTOS
 */
export const EQUIPMENT_COMPONENTS: ModernItem[] = [
  // Cabos e Hastes
  {
    id: RESOURCE_IDS.CABO_MACHADO,
    name: "Cabo de Machado",
    description: "Cabo de madeira resistente, ideal para machados.",
    type: "component",
    category: "handles",
    weight: 0.5,
    stackable: true,
    maxStack: 20,
    rarity: "common",
    baseValue: 10,
    tags: ["component", "handle", "axe"],
    craftable: true,
    obtainableMethods: ["crafting"]
  },
  {
    id: RESOURCE_IDS.CABO_ESPADA,
    name: "Cabo de Espada",
    description: "Empunhadura ergonômica para espadas. Proporciona melhor controle.",
    type: "component",
    category: "handles",
    weight: 0.3,
    stackable: true,
    maxStack: 20,
    rarity: "uncommon",
    baseValue: 15,
    tags: ["component", "handle", "sword"],
    craftable: true,
    obtainableMethods: ["crafting"]
  },

  // Cabeças e Lâminas
  {
    id: RESOURCE_IDS.CABECA_MACHADO,
    name: "Cabeça de Machado",
    description: "Lâmina afiada de metal para machados. Durável e eficiente.",
    type: "component",
    category: "heads",
    weight: 1.0,
    stackable: true,
    maxStack: 10,
    rarity: "uncommon",
    baseValue: 25,
    tags: ["component", "blade", "axe"],
    craftable: true,
    obtainableMethods: ["smithing"]
  },
  {
    id: RESOURCE_IDS.LAMINA_ESPADA,
    name: "Lâmina de Espada",
    description: "Lâmina forjada para espadas. Afiada e equilibrada.",
    type: "component",
    category: "blades",
    weight: 1.5,
    stackable: true,
    maxStack: 10,
    rarity: "rare",
    baseValue: 40,
    tags: ["component", "blade", "sword"],
    craftable: true,
    obtainableMethods: ["smithing"]
  }
];

/**
 * MATERIAIS PROCESSADOS AVANÇADOS
 */
export const PROCESSED_MATERIALS: ModernItem[] = [
  {
    id: RESOURCE_IDS.BARBANTE,
    name: "Barbante",
    description: "Cordão simples feito de fibras entrelaçadas. Útil para amarrações básicas.",
    type: "material",
    category: "processed",
    weight: 0.1,
    stackable: true,
    maxStack: 100,
    rarity: "common",
    baseValue: 3,
    tags: ["string", "basic", "binding"],
    craftable: true,
    obtainableMethods: ["crafting"]
  },
  {
    id: RESOURCE_IDS.CORDA_RESISTENTE,
    name: "Corda Resistente",
    description: "Corda de alta qualidade. Muito mais forte que barbante comum.",
    type: "material",
    category: "processed",
    weight: 0.3,
    stackable: true,
    maxStack: 50,
    rarity: "uncommon",
    baseValue: 15,
    tags: ["rope", "strong", "durable"],
    craftable: true,
    obtainableMethods: ["crafting"]
  },
  {
    id: RESOURCE_IDS.COURO_CURTIDO,
    name: "Couro Curtido",
    description: "Couro processado e tratado. Pronto para uso em equipamentos.",
    type: "material",
    category: "processed",
    weight: 1.0,
    stackable: true,
    maxStack: 20,
    rarity: "uncommon",
    baseValue: 25,
    tags: ["leather", "processed", "armor"],
    craftable: true,
    obtainableMethods: ["tanning"]
  },
  {
    id: RESOURCE_IDS.BARRA_FERRO,
    name: "Barra de Ferro",
    description: "Ferro refinado em forma de barra. Pronto para forjaria.",
    type: "material",
    category: "metals",
    weight: 2.0,
    stackable: true,
    maxStack: 15,
    rarity: "uncommon",
    baseValue: 30,
    tags: ["metal", "refined", "smithing"],
    craftable: true,
    obtainableMethods: ["smelting"]
  }
];

/**
 * CONSOLIDAÇÃO DE TODOS OS ITENS
 */
export const ALL_MODERN_ITEMS: ModernItem[] = [
  ...BASIC_RESOURCES,
  ...EXPANDED_MATERIALS,
  ...ANIMALS_AND_FISH,
  ...PLANTS_AND_CONSUMABLES,
  ...EQUIPMENT_COMPONENTS,
  ...PROCESSED_MATERIALS
];

/**
 * FUNÇÕES DE UTILIDADE
 */
export function getItemById(id: string): ModernItem | undefined {
  return ALL_MODERN_ITEMS.find(item => item.id === id);
}

export function getItemsByCategory(category: string): ModernItem[] {
  return ALL_MODERN_ITEMS.filter(item => item.category === category);
}

export function getItemsByType(type: string): ModernItem[] {
  return ALL_MODERN_ITEMS.filter(item => item.type === type);
}

export function getItemsByBiome(biomeId: string): ModernItem[] {
  return ALL_MODERN_ITEMS.filter(item => 
    item.spawnBiomes?.includes(biomeId)
  );
}

export function validateAllItemIds(): boolean {
  const invalidItems = ALL_MODERN_ITEMS.filter(item => !isValidGameId(item.id));
  
  if (invalidItems.length > 0) {
    console.error('❌ Invalid item IDs found:', invalidItems.map(item => item.id));
    return false;
  }
  
  console.log('✅ All item IDs are valid');
  return true;
}

// Validação automática ao carregar o módulo
validateAllItemIds();

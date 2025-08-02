// Skill Definitions - Definições completas da árvore de skills
// Integrado com o sistema de IDs centralizado

import { SKILL_IDS } from '@shared/constants/game-ids';
import type { Skill, SkillTreeLayout } from '@shared/types/skill-types';

export const SKILL_DEFINITIONS: { [skillId: string]: Omit<Skill, 'currentLevel' | 'experience' | 'experienceToNext'> } = {
  // === COLETA E EXPLORAÇÃO ===
  [SKILL_IDS.COLETA]: {
    id: SKILL_IDS.COLETA,
    name: "Coleta",
    description: "Aumenta a eficiência na coleta de recursos básicos como fibras, pedras e gravetos.",
    category: "gathering",
    icon: "🌿",
    maxLevel: 100,
    prerequisites: [],
    bonuses: [
      { type: "resource_yield", value: 5, target: "gathering" }, // +5% por nível
      { type: "luck", value: 2, condition: "gathering" }
    ],
    unlocks: [
      { type: "ability", target: "auto_gather_basic", description: "Coleta automática de recursos básicos" }
    ],
    passive: true,
    treePosition: { x: 0, y: 0 }
  },

  [SKILL_IDS.MINERACAO]: {
    id: SKILL_IDS.MINERACAO,
    name: "Mineração",
    description: "Especialização em extração de minérios e pedras preciosas.",
    category: "gathering",
    icon: "⛏️",
    maxLevel: 100,
    prerequisites: [
      { type: 'skill', requirement: SKILL_IDS.COLETA, value: 10 }
    ],
    bonuses: [
      { type: "resource_yield", value: 8, target: "mining" },
      { type: "durability", value: 10, target: "pickaxe" }
    ],
    unlocks: [
      { type: "resource", target: "rare_ores", description: "Desbloqueia minérios raros" },
      { type: "recipe", target: "advanced_pickaxe", description: "Picaretas avançadas" }
    ],
    passive: true,
    treePosition: { x: 1, y: 1 }
  },

  [SKILL_IDS.LENHADOR]: {
    id: SKILL_IDS.LENHADOR,
    name: "Lenhador",
    description: "Maestria no corte de árvores e processamento de madeira.",
    category: "gathering",
    icon: "🪓",
    maxLevel: 100,
    prerequisites: [
      { type: 'skill', requirement: SKILL_IDS.COLETA, value: 10 }
    ],
    bonuses: [
      { type: "resource_yield", value: 8, target: "woodcutting" },
      { type: "craft_speed", value: 15, target: "wood_recipes" }
    ],
    unlocks: [
      { type: "resource", target: "exotic_woods", description: "Madeiras exóticas" },
      { type: "recipe", target: "advanced_tools", description: "Ferramentas avançadas de madeira" }
    ],
    passive: true,
    treePosition: { x: -1, y: 1 }
  },

  [SKILL_IDS.PESCA]: {
    id: SKILL_IDS.PESCA,
    name: "Pesca",
    description: "Habilidade em pescar diferentes tipos de peixes e criaturas aquáticas.",
    category: "gathering",
    icon: "🎣",
    maxLevel: 100,
    prerequisites: [
      { type: 'skill', requirement: SKILL_IDS.COLETA, value: 5 }
    ],
    bonuses: [
      { type: "resource_yield", value: 10, target: "fishing" },
      { type: "luck", value: 5, condition: "fishing" }
    ],
    unlocks: [
      { type: "resource", target: "rare_fish", description: "Peixes raros e lendários" },
      { type: "recipe", target: "fishing_gear", description: "Equipamentos de pesca avançados" }
    ],
    passive: true,
    treePosition: { x: 0, y: 2 }
  },

  [SKILL_IDS.CACA]: {
    id: SKILL_IDS.CACA,
    name: "Caça",
    description: "Especialização em caçar animais e obter recursos de alta qualidade.",
    category: "gathering",
    icon: "🏹",
    maxLevel: 100,
    prerequisites: [
      { type: 'skill', requirement: SKILL_IDS.COLETA, value: 15 },
      { type: 'skill', requirement: SKILL_IDS.COMBATE, value: 10 }
    ],
    bonuses: [
      { type: "resource_yield", value: 12, target: "hunting" },
      { type: "attack", value: 5, condition: "hunting" }
    ],
    unlocks: [
      { type: "resource", target: "legendary_animals", description: "Animais lendários" },
      { type: "recipe", target: "hunting_weapons", description: "Armas de caça especializadas" }
    ],
    passive: true,
    treePosition: { x: 2, y: 1 }
  },

  [SKILL_IDS.EXPLORACAO]: {
    id: SKILL_IDS.EXPLORACAO,
    name: "Exploração",
    description: "Descobre novos locais e reduz riscos durante expedições.",
    category: "gathering",
    icon: "🗺️",
    maxLevel: 100,
    prerequisites: [
      { type: 'level', requirement: '10' }
    ],
    bonuses: [
      { type: "xp_multiplier", value: 3, target: "expeditions" },
      { type: "luck", value: 8, condition: "exploration" }
    ],
    unlocks: [
      { type: "biome", target: "hidden_areas", description: "Áreas secretas" },
      { type: "ability", target: "fast_travel", description: "Viagem rápida" }
    ],
    passive: true,
    treePosition: { x: 0, y: -1 }
  },

  // === CRIAÇÃO E ARTESANATO ===
  [SKILL_IDS.ARTESANATO]: {
    id: SKILL_IDS.ARTESANATO,
    name: "Artesanato",
    description: "Habilidade básica de criação de itens e ferramentas.",
    category: "crafting",
    icon: "🔨",
    maxLevel: 100,
    prerequisites: [],
    bonuses: [
      { type: "craft_speed", value: 5, target: "all" },
      { type: "resource_yield", value: 3, target: "crafting" }
    ],
    unlocks: [
      { type: "recipe", target: "basic_tools", description: "Ferramentas básicas" },
      { type: "ability", target: "batch_crafting", description: "Criação em lote" }
    ],
    passive: true,
    treePosition: { x: 0, y: 0 }
  },

  [SKILL_IDS.FERRARIA]: {
    id: SKILL_IDS.FERRARIA,
    name: "Ferraria",
    description: "Especialização em forjar armas e armaduras de metal.",
    category: "crafting",
    icon: "⚒️",
    maxLevel: 100,
    prerequisites: [
      { type: 'skill', requirement: SKILL_IDS.ARTESANATO, value: 20 },
      { type: 'skill', requirement: SKILL_IDS.MINERACAO, value: 15 }
    ],
    bonuses: [
      { type: "durability", value: 15, target: "metal_items" },
      { type: "craft_speed", value: 10, target: "smithing" }
    ],
    unlocks: [
      { type: "recipe", target: "advanced_weapons", description: "Armas avançadas" },
      { type: "recipe", target: "armor_sets", description: "Conjuntos de armadura" }
    ],
    passive: true,
    treePosition: { x: 1, y: 1 }
  },

  [SKILL_IDS.CULINARIA]: {
    id: SKILL_IDS.CULINARIA,
    name: "Culinária",
    description: "Arte de preparar alimentos nutritivos e poções benéficas.",
    category: "crafting",
    icon: "🍳",
    maxLevel: 100,
    prerequisites: [
      { type: 'skill', requirement: SKILL_IDS.ARTESANATO, value: 10 }
    ],
    bonuses: [
      { type: "resource_yield", value: 8, target: "cooking" },
      { type: "hunger", value: 10, condition: "eating_crafted_food" }
    ],
    unlocks: [
      { type: "recipe", target: "gourmet_meals", description: "Refeições gourmet" },
      { type: "recipe", target: "stat_boosting_food", description: "Comidas que aumentam atributos" }
    ],
    passive: true,
    treePosition: { x: -1, y: 1 }
  },

  [SKILL_IDS.ALQUIMIA]: {
    id: SKILL_IDS.ALQUIMIA,
    name: "Alquimia",
    description: "Criação de poções mágicas e substâncias especiais.",
    category: "magic",
    icon: "🧪",
    maxLevel: 100,
    prerequisites: [
      { type: 'skill', requirement: SKILL_IDS.ARTESANATO, value: 25 },
      { type: 'skill', requirement: SKILL_IDS.CULINARIA, value: 20 },
      { type: 'level', requirement: '15' }
    ],
    bonuses: [
      { type: "resource_yield", value: 12, target: "alchemy" },
      { type: "xp_multiplier", value: 5, target: "magical_activities" }
    ],
    unlocks: [
      { type: "recipe", target: "healing_potions", description: "Poções de cura" },
      { type: "recipe", target: "enhancement_potions", description: "Poções de aprimoramento" }
    ],
    passive: true,
    treePosition: { x: 0, y: 2 }
  },

  // === COMBATE E SOBREVIVÊNCIA ===
  [SKILL_IDS.COMBATE]: {
    id: SKILL_IDS.COMBATE,
    name: "Combate",
    description: "Habilidade de luta e uso eficiente de armas.",
    category: "combat",
    icon: "⚔️",
    maxLevel: 100,
    prerequisites: [],
    bonuses: [
      { type: "attack", value: 8, target: "all_weapons" },
      { type: "durability", value: 5, target: "weapons" }
    ],
    unlocks: [
      { type: "ability", target: "critical_strikes", description: "Ataques críticos" },
      { type: "ability", target: "combo_attacks", description: "Ataques em combo" }
    ],
    passive: true,
    treePosition: { x: 0, y: 0 }
  },

  [SKILL_IDS.DEFESA]: {
    id: SKILL_IDS.DEFESA,
    name: "Defesa",
    description: "Reduz dano recebido e aumenta resistência.",
    category: "combat",
    icon: "🛡️",
    maxLevel: 100,
    prerequisites: [
      { type: 'skill', requirement: SKILL_IDS.COMBATE, value: 10 }
    ],
    bonuses: [
      { type: "defense", value: 10, target: "all" },
      { type: "health", value: 5, target: "max_health" }
    ],
    unlocks: [
      { type: "ability", target: "damage_blocking", description: "Bloqueio de dano" },
      { type: "ability", target: "counter_attacks", description: "Contra-ataques" }
    ],
    passive: true,
    treePosition: { x: -1, y: 1 }
  },

  [SKILL_IDS.SOBREVIVENCIA]: {
    id: SKILL_IDS.SOBREVIVENCIA,
    name: "Sobrevivência",
    description: "Resistência a condições adversas e doenças.",
    category: "survival",
    icon: "🏕️",
    maxLevel: 100,
    prerequisites: [],
    bonuses: [
      { type: "hunger", value: -2, condition: "degradation_reduction" },
      { type: "thirst", value: -2, condition: "degradation_reduction" }
    ],
    unlocks: [
      { type: "ability", target: "disease_immunity", description: "Imunidade a doenças básicas" },
      { type: "ability", target: "temperature_resistance", description: "Resistência a temperatura" }
    ],
    passive: true,
    treePosition: { x: 0, y: 0 }
  },

  // === ESPECIALIZAÇÃO ===
  [SKILL_IDS.RESISTENCIA]: {
    id: SKILL_IDS.RESISTENCIA,
    name: "Resistência",
    description: "Aumenta energia máxima e reduz fadiga.",
    category: "survival",
    icon: "💪",
    maxLevel: 100,
    prerequisites: [
      { type: 'skill', requirement: SKILL_IDS.SOBREVIVENCIA, value: 15 }
    ],
    bonuses: [
      { type: "health", value: 8, target: "max_health" },
      { type: "resource_yield", value: 5, condition: "reduced_fatigue" }
    ],
    unlocks: [
      { type: "ability", target: "extended_expeditions", description: "Expedições prolongadas" },
      { type: "ability", target: "heavy_lifting", description: "Carregamento pesado" }
    ],
    passive: true,
    treePosition: { x: 1, y: 1 }
  },

  [SKILL_IDS.AGILIDADE]: {
    id: SKILL_IDS.AGILIDADE,
    name: "Agilidade",
    description: "Aumenta velocidade de movimento e precisão.",
    category: "combat",
    icon: "💨",
    maxLevel: 100,
    prerequisites: [
      { type: 'skill', requirement: SKILL_IDS.COMBATE, value: 15 }
    ],
    bonuses: [
      { type: "craft_speed", value: 8, target: "all" },
      { type: "luck", value: 5, condition: "all_activities" }
    ],
    unlocks: [
      { type: "ability", target: "quick_actions", description: "Ações rápidas" },
      { type: "ability", target: "dodge_attacks", description: "Esquivar de ataques" }
    ],
    passive: true,
    treePosition: { x: 1, y: 1 }
  },

  [SKILL_IDS.SORTE]: {
    id: SKILL_IDS.SORTE,
    name: "Sorte",
    description: "Aumenta chance de encontrar itens raros e críticos.",
    category: "magic",
    icon: "🍀",
    maxLevel: 100,
    prerequisites: [
      { type: 'level', requirement: '20' }
    ],
    bonuses: [
      { type: "luck", value: 15, condition: "all_activities" },
      { type: "resource_yield", value: 5, condition: "rare_items" }
    ],
    unlocks: [
      { type: "ability", target: "treasure_hunter", description: "Caçador de tesouros" },
      { type: "ability", target: "lucky_breaks", description: "Golpes de sorte" }
    ],
    passive: true,
    treePosition: { x: 0, y: 2 }
  }
};

// Layout da árvore de skills
export const SKILL_TREE_LAYOUT: SkillTreeLayout = {
  gathering: {
    name: "Coleta",
    color: "#22c55e", // verde
    skills: {
      [SKILL_IDS.COLETA]: { x: 2, y: 2, connections: [SKILL_IDS.MINERACAO, SKILL_IDS.LENHADOR, SKILL_IDS.PESCA] },
      [SKILL_IDS.MINERACAO]: { x: 3, y: 1, connections: [SKILL_IDS.CACA] },
      [SKILL_IDS.LENHADOR]: { x: 1, y: 1, connections: [] },
      [SKILL_IDS.PESCA]: { x: 2, y: 3, connections: [] },
      [SKILL_IDS.CACA]: { x: 4, y: 1, connections: [] },
      [SKILL_IDS.EXPLORACAO]: { x: 2, y: 0, connections: [] }
    }
  },
  crafting: {
    name: "Artesanato",
    color: "#f59e0b", // amarelo/laranja
    skills: {
      [SKILL_IDS.ARTESANATO]: { x: 2, y: 2, connections: [SKILL_IDS.FERRARIA, SKILL_IDS.CULINARIA] },
      [SKILL_IDS.FERRARIA]: { x: 3, y: 1, connections: [] },
      [SKILL_IDS.CULINARIA]: { x: 1, y: 1, connections: [SKILL_IDS.ALQUIMIA] },
      [SKILL_IDS.ALQUIMIA]: { x: 2, y: 3, connections: [] }
    }
  },
  combat: {
    name: "Combate",
    color: "#ef4444", // vermelho
    skills: {
      [SKILL_IDS.COMBATE]: { x: 2, y: 2, connections: [SKILL_IDS.DEFESA, SKILL_IDS.AGILIDADE] },
      [SKILL_IDS.DEFESA]: { x: 1, y: 1, connections: [] },
      [SKILL_IDS.AGILIDADE]: { x: 3, y: 1, connections: [] }
    }
  },
  survival: {
    name: "Sobrevivência", 
    color: "#8b5cf6", // roxo
    skills: {
      [SKILL_IDS.SOBREVIVENCIA]: { x: 2, y: 2, connections: [SKILL_IDS.RESISTENCIA] },
      [SKILL_IDS.RESISTENCIA]: { x: 3, y: 1, connections: [] }
    }
  },
  magic: {
    name: "Magia",
    color: "#ec4899", // rosa/magenta
    skills: {
      [SKILL_IDS.ALQUIMIA]: { x: 1, y: 1, connections: [] },
      [SKILL_IDS.SORTE]: { x: 2, y: 2, connections: [] }
    }
  }
};
// Disease Definitions - Sistema completo de doenças
// Integrado com o sistema de IDs centralizado

import { DISEASE_IDS } from '@shared/constants/game-ids';
import type { Disease } from '@shared/types/skill-types';

export const DISEASE_DEFINITIONS: { [diseaseId: string]: Disease } = {
  [DISEASE_IDS.RESFRIADO]: {
    id: DISEASE_IDS.RESFRIADO,
    name: "Resfriado",
    description: "Uma doença respiratória comum que reduz energia e eficiência.",
    category: "respiratory",
    rarity: "common",
    contagious: true,
    icon: "🤧",
    color: "#94a3b8",
    
    causes: [
      { type: "environmental", trigger: "cold_weather", chance: 15 },
      { type: "hygiene", trigger: "low_hygiene", chance: 8 },
      { type: "fatigue", trigger: "high_fatigue", chance: 5 }
    ],
    
    stages: [
      {
        name: "Inicial",
        duration: 3600, // 1 hora
        effects: [
          { type: "stat_reduction", target: "fatigue", value: 10, isPercentage: false },
          { type: "skill_penalty", target: "all", value: 5, isPercentage: true }
        ],
        symptoms: ["Espirros ocasionais", "Leve mal-estar"],
        canSpread: true
      },
      {
        name: "Desenvolvido",
        duration: 7200, // 2 horas
        effects: [
          { type: "stat_reduction", target: "fatigue", value: 20, isPercentage: false },
          { type: "skill_penalty", target: "all", value: 10, isPercentage: true },
          { type: "stat_drain", target: "thirst", value: 2, isPercentage: false }
        ],
        symptoms: ["Espirros frequentes", "Nariz entupido", "Sede aumentada"],
        canSpread: true
      }
    ],
    
    treatments: [
      { type: "rest", requirement: "bed", effectiveness: 40 },
      { type: "item", requirement: "herbal_tea", effectiveness: 60 },
      { type: "time", requirement: "24h", effectiveness: 80 }
    ],
    
    prevention: [
      { type: "item", method: "warm_clothes", effectiveness: 30 },
      { type: "behavior", method: "maintain_hygiene", effectiveness: 25 }
    ],
    
    natural_recovery_time: 86400, // 24 hours
    natural_recovery_chance: 80
  },

  [DISEASE_IDS.FEBRE]: {
    id: DISEASE_IDS.FEBRE,
    name: "Febre",
    description: "Aumento da temperatura corporal que causa fraqueza e desidratação.",
    category: "infection",
    rarity: "uncommon",
    contagious: false,
    icon: "🤒",
    color: "#f87171",
    
    causes: [
      { type: "injury", trigger: "infected_wound", chance: 25 },
      { type: "dietary", trigger: "bad_food", chance: 15 },
      { type: "environmental", trigger: "extreme_heat", chance: 10 }
    ],
    
    stages: [
      {
        name: "Febre Baixa",
        duration: 1800, // 30 min
        effects: [
          { type: "stat_reduction", target: "temperature", value: 15, isPercentage: false },
          { type: "stat_drain", target: "thirst", value: 3, isPercentage: false }
        ],
        symptoms: ["Calafrios leves", "Sede aumentada"]
      },
      {
        name: "Febre Alta",
        duration: 3600, // 1 hora
        effects: [
          { type: "stat_reduction", target: "temperature", value: 30, isPercentage: false },
          { type: "stat_drain", target: "thirst", value: 5, isPercentage: false },
          { type: "stat_drain", target: "health", value: 2, isPercentage: false }
        ],
        symptoms: ["Suor excessivo", "Fraqueza", "Tontura"]
      }
    ],
    
    treatments: [
      { type: "item", requirement: "cooling_herbs", effectiveness: 70 },
      { type: "item", requirement: "fresh_water", effectiveness: 40, cost: 10 },
      { type: "rest", requirement: "shade", effectiveness: 30 }
    ],
    
    prevention: [
      { type: "behavior", method: "avoid_spoiled_food", effectiveness: 50 },
      { type: "item", method: "antiseptic", effectiveness: 30 }
    ],
    
    natural_recovery_time: 14400, // 4 hours
    natural_recovery_chance: 60
  },

  [DISEASE_IDS.INTOXICACAO]: {
    id: DISEASE_IDS.INTOXICACAO,
    name: "Intoxicação Alimentar",
    description: "Envenenamento causado por alimentos contaminados ou vencidos.",
    category: "digestive",
    rarity: "uncommon",
    contagious: false,
    icon: "🤮",
    color: "#16a34a",
    
    causes: [
      { type: "dietary", trigger: "spoiled_food", chance: 60 },
      { type: "dietary", trigger: "raw_meat", chance: 30 },
      { type: "environmental", trigger: "contaminated_water", chance: 20 }
    ],
    
    stages: [
      {
        name: "Náusea",
        duration: 900, // 15 min
        effects: [
          { type: "stat_reduction", target: "hunger", value: 20, isPercentage: false },
          { type: "action_failure", target: "eating", value: 50, isPercentage: true }
        ],
        symptoms: ["Enjoo", "Perda de apetite"]
      },
      {
        name: "Intoxicação Aguda",
        duration: 2700, // 45 min
        effects: [
          { type: "stat_drain", target: "hunger", value: 5, isPercentage: false },
          { type: "stat_drain", target: "thirst", value: 3, isPercentage: false },
          { type: "stat_drain", target: "health", value: 1, isPercentage: false }
        ],
        symptoms: ["Vômitos", "Diarreia", "Desidratação"]
      }
    ],
    
    treatments: [
      { type: "item", requirement: "activated_charcoal", effectiveness: 80 },
      { type: "item", requirement: "clean_water", effectiveness: 50 },
      { type: "rest", requirement: "complete_rest", effectiveness: 40 }
    ],
    
    prevention: [
      { type: "skill", method: "cooking_skill_high", effectiveness: 40 },
      { type: "item", method: "food_preservation", effectiveness: 35 }
    ],
    
    natural_recovery_time: 10800, // 3 hours
    natural_recovery_chance: 70
  },

  [DISEASE_IDS.DESIDRATACAO]: {
    id: DISEASE_IDS.DESIDRATACAO,
    name: "Desidratação",
    description: "Perda excessiva de água corporal que afeta todas as funções.",
    category: "environmental",
    rarity: "common",
    contagious: false,
    icon: "🏜️",
    color: "#eab308",
    
    causes: [
      { type: "environmental", trigger: "hot_weather", chance: 20 },
      { type: "fatigue", trigger: "excessive_activity", chance: 15 },
      { type: "dietary", trigger: "insufficient_water", chance: 25 }
    ],
    
    stages: [
      {
        name: "Sede Intensa",
        duration: 1800, // 30 min
        effects: [
          { type: "stat_drain", target: "thirst", value: 5, isPercentage: false },
          { type: "skill_penalty", target: "all", value: 8, isPercentage: true }
        ],
        symptoms: ["Sede extrema", "Boca seca"]
      },
      {
        name: "Desidratação Severa",
        duration: 3600, // 1 hora
        effects: [
          { type: "stat_drain", target: "thirst", value: 8, isPercentage: false },
          { type: "stat_drain", target: "health", value: 3, isPercentage: false },
          { type: "movement_speed", target: "all", value: 30, isPercentage: true }
        ],
        symptoms: ["Tontura", "Fraqueza extrema", "Visão turva"]
      }
    ],
    
    treatments: [
      { type: "item", requirement: "clean_water", effectiveness: 90 },
      { type: "item", requirement: "electrolyte_solution", effectiveness: 95 },
      { type: "rest", requirement: "shade", effectiveness: 20 }
    ],
    
    prevention: [
      { type: "behavior", method: "regular_hydration", effectiveness: 80 },
      { type: "item", method: "water_storage", effectiveness: 60 }
    ],
    
    natural_recovery_time: 0, // No natural recovery
    natural_recovery_chance: 0
  },

  [DISEASE_IDS.FERIMENTO]: {
    id: DISEASE_IDS.FERIMENTO,
    name: "Ferimento Aberto",
    description: "Lesão física que pode infeccionar se não tratada adequadamente.",
    category: "injury",
    rarity: "common",
    contagious: false,
    icon: "🩸",
    color: "#dc2626",
    
    causes: [
      { type: "combat", trigger: "animal_attack", chance: 40 },
      { type: "environmental", trigger: "sharp_objects", chance: 15 },
      { type: "injury", trigger: "fall_damage", chance: 20 }
    ],
    
    stages: [
      {
        name: "Ferimento Recente",
        duration: 1800, // 30 min
        effects: [
          { type: "stat_drain", target: "health", value: 1, isPercentage: false },
          { type: "skill_penalty", target: "physical", value: 10, isPercentage: true }
        ],
        symptoms: ["Sangramento", "Dor localizada"]
      },
      {
        name: "Ferimento Infectado",
        duration: 7200, // 2 horas
        effects: [
          { type: "stat_drain", target: "health", value: 2, isPercentage: false },
          { type: "stat_reduction", target: "fatigue", value: 15, isPercentage: false }
        ],
        symptoms: ["Inflamação", "Pus", "Dor intensa"]
      }
    ],
    
    treatments: [
      { type: "item", requirement: "bandages", effectiveness: 60 },
      { type: "item", requirement: "healing_salve", effectiveness: 80 },
      { type: "skill", requirement: "first_aid", effectiveness: 70 }
    ],
    
    prevention: [
      { type: "item", method: "protective_gear", effectiveness: 40 },
      { type: "skill", method: "combat_defense", effectiveness: 30 }
    ],
    
    natural_recovery_time: 28800, // 8 hours
    natural_recovery_chance: 40
  },

  [DISEASE_IDS.FADIGA]: {
    id: DISEASE_IDS.FADIGA,
    name: "Fadiga Extrema",
    description: "Exaustão física e mental que reduz drasticamente a eficiência.",
    category: "psychological",
    rarity: "common",
    contagious: false,
    icon: "😴",
    color: "#6b7280",
    
    causes: [
      { type: "fatigue", trigger: "overwork", chance: 30 },
      { type: "environmental", trigger: "lack_of_sleep", chance: 40 },
      { type: "dietary", trigger: "malnutrition", chance: 15 }
    ],
    
    stages: [
      {
        name: "Cansaço",
        duration: 3600, // 1 hora
        effects: [
          { type: "skill_penalty", target: "all", value: 15, isPercentage: true },
          { type: "stat_reduction", target: "fatigue", value: 20, isPercentage: false }
        ],
        symptoms: ["Sonolência", "Lentidão"]
      },
      {
        name: "Exaustão",
        duration: 7200, // 2 horas
        effects: [
          { type: "skill_penalty", target: "all", value: 30, isPercentage: true },
          { type: "action_failure", target: "all", value: 20, isPercentage: true }
        ],
        symptoms: ["Incapacidade de concentração", "Movimentos lentos"]
      }
    ],
    
    treatments: [
      { type: "rest", requirement: "bed", effectiveness: 90 },
      { type: "item", requirement: "energy_food", effectiveness: 50 },
      { type: "time", requirement: "8h_sleep", effectiveness: 95 }
    ],
    
    prevention: [
      { type: "behavior", method: "regular_sleep", effectiveness: 70 },
      { type: "behavior", method: "balanced_activity", effectiveness: 50 }
    ],
    
    natural_recovery_time: 28800, // 8 hours
    natural_recovery_chance: 90
  }
};
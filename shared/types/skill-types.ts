// Skill System Types - Sistema robusto de árvore de skills
// Integrado com todos os sistemas do jogo

export interface Skill {
  id: string;
  name: string;
  description: string;
  category: SkillCategory;
  icon: string;
  maxLevel: number;
  currentLevel: number;
  experience: number;
  experienceToNext: number;
  prerequisites: SkillPrerequisite[];
  bonuses: SkillBonus[];
  unlocks: SkillUnlock[];
  passive: boolean;
  treePosition: { x: number; y: number };
}

export interface PlayerSkills {
  [skillId: string]: {
    level: number;
    experience: number;
    unlocked: boolean;
    unlockedAt?: number; // timestamp
  };
}

export interface SkillPrerequisite {
  type: 'skill' | 'level' | 'item' | 'quest';
  requirement: string; // skill id, level number, item id, quest id
  value?: number; // for skill level requirements
}

export interface SkillBonus {
  type: 'resource_yield' | 'craft_speed' | 'durability' | 'health' | 'hunger' | 'thirst' | 'defense' | 'attack' | 'luck' | 'xp_multiplier';
  value: number; // percentage or flat bonus
  target?: string; // specific resource, tool, etc.
  condition?: string; // when bonus applies
}

export interface SkillUnlock {
  type: 'recipe' | 'biome' | 'resource' | 'equipment' | 'ability';
  target: string; // id of unlocked content
  description: string;
}

export type SkillCategory = 
  | 'gathering' // Coleta
  | 'crafting'  // Artesanato  
  | 'combat'    // Combate
  | 'survival'  // Sobrevivência
  | 'magic';    // Magia/Especial

// Skill Tree Layout - Define posições no grid da árvore
export interface SkillTreeLayout {
  [category: string]: {
    name: string;
    color: string;
    skills: {
      [skillId: string]: {
        x: number;
        y: number;
        connections: string[]; // skills connected to this one
      };
    };
  };
}

// Player Status System Enhancement
export interface PlayerStatus {
  // Existing
  health: number;
  maxHealth: number;
  hunger: number;
  maxHunger: number;
  thirst: number;
  maxThirst: number;
  
  // New Status Effects
  temperature: number; // -100 (frozen) to 100 (overheated)
  fatigue: number; // 0 (rested) to 100 (exhausted)
  morale: number; // 0 (depressed) to 100 (euphoric)
  hygiene: number; // 0 (filthy) to 100 (clean)
  
  // Disease System
  diseases: PlayerDisease[];
  immunities: string[]; // disease IDs player is immune to
  resistances: { [diseaseId: string]: number }; // resistance level 0-100
}

export interface PlayerDisease {
  id: string;
  name: string;
  severity: 'mild' | 'moderate' | 'severe' | 'critical';
  effects: DiseaseEffect[];
  duration: number; // remaining time in seconds
  maxDuration: number; // total duration
  contractedAt: number; // timestamp
  cureIds: string[]; // items that can cure this disease
  natural_recovery: boolean; // recovers over time
}

export interface DiseaseEffect {
  type: 'stat_reduction' | 'stat_drain' | 'skill_penalty' | 'movement_speed' | 'vision' | 'action_failure';
  target: string; // stat name, skill id, etc.
  value: number; // reduction amount or percentage
  isPercentage: boolean;
}

// Disease Definitions
export interface Disease {
  id: string;
  name: string;
  description: string;
  category: DiseaseCategory;
  rarity: 'common' | 'uncommon' | 'rare' | 'very_rare';
  contagious: boolean;
  
  // Contraction conditions
  causes: DiseaseCause[];
  
  // Effects and progression
  stages: DiseaseStage[];
  
  // Treatment
  treatments: DiseaseTreatment[];
  prevention: DiseasePreventionMethod[];
  
  // Recovery
  natural_recovery_time?: number; // seconds
  natural_recovery_chance: number; // 0-100
  
  // Visual/UI
  icon: string;
  color: string;
}

export interface DiseaseCause {
  type: 'environmental' | 'dietary' | 'injury' | 'fatigue' | 'hygiene' | 'combat' | 'random';
  trigger: string; // specific condition
  chance: number; // 0-100 probability
  conditions?: { [key: string]: any }; // additional requirements
}

export interface DiseaseStage {
  name: string;
  duration: number; // seconds in this stage
  effects: DiseaseEffect[];
  symptoms: string[]; // text descriptions for UI
  canSpread?: boolean; // if contagious in this stage
}

export interface DiseaseTreatment {
  type: 'item' | 'rest' | 'skill' | 'time';
  requirement: string; // item id, skill id, etc.
  effectiveness: number; // 0-100, chance of cure
  cost?: number; // hunger/thirst/health cost
}

export interface DiseasePreventionMethod {
  type: 'item' | 'skill' | 'behavior';
  method: string; // specific prevention
  effectiveness: number; // 0-100 prevention chance
}

export type DiseaseCategory = 
  | 'respiratory' // Respiratório
  | 'digestive'   // Digestivo
  | 'injury'      // Ferimentos
  | 'infection'   // Infecções
  | 'environmental' // Ambientais
  | 'psychological'; // Psicológicas

// Skill Points System
export interface SkillPointsSystem {
  totalPoints: number;
  spentPoints: number;
  availablePoints: number;
  pointsPerLevel: number; // How many points gained per player level
  resetCost?: number; // Cost in coins to reset skills
  lastReset?: number; // timestamp of last reset
}

// Achievement/Milestone system for skills
export interface SkillAchievement {
  id: string;
  name: string;
  description: string;
  skillId: string;
  requirement: {
    type: 'level' | 'experience' | 'usage_count' | 'special';
    value: number | string;
  };
  reward: {
    type: 'skill_points' | 'experience' | 'item' | 'title';
    value: number | string;
  };
  unlocked: boolean;
  unlockedAt?: number;
}
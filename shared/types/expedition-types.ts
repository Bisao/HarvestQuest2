// Tipos modernos para o sistema de expedições

export interface ExpeditionTarget {
  id: string;
  type: 'resource' | 'location' | 'quest';
  resourceId?: string;
  locationId?: string;
  questId?: string;
  quantity: number;
  estimatedTime: number; // em minutos
  requiredTools?: string[];
  requiredLevel?: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'extreme';
  baseSuccessRate: number;
}

export interface ExpeditionPlan {
  id: string;
  name: string;
  biomeId: string;
  targets: ExpeditionTarget[];
  totalDuration: number; // em minutos
  requiredEnergy: number;
  requiredHunger: number;
  requiredThirst: number;
  expectedRewards: {
    resourceId: string;
    minQuantity: number;
    maxQuantity: number;
    probability: number;
  }[];
  risks: {
    type: 'hunger' | 'thirst' | 'health' | 'equipment_damage';
    severity: number;
    probability: number;
  }[];
}

export interface ActiveExpedition {
  id: string;
  playerId: string;
  planId: string;
  startTime: number;
  estimatedEndTime: number;
  currentPhase: 'preparing' | 'traveling' | 'exploring' | 'returning' | 'completed';
  progress: number; // 0-100
  completedTargets: string[];
  collectedResources: Record<string, number>;
  events: ExpeditionEvent[];
  status: 'active' | 'paused' | 'failed' | 'completed';
}

export interface ExpeditionEvent {
  id: string;
  timestamp: number;
  type: 'resource_found' | 'danger_encounter' | 'tool_break' | 'discovery' | 'weather_change';
  description: string;
  effects: {
    resourceGain?: Record<string, number>;
    statusChange?: Record<string, number>;
    equipmentDamage?: string[];
  };
}

export interface ExpeditionTemplate {
  id: string;
  name: string;
  description: string;
  biomeId: string;
  category: 'gathering' | 'hunting' | 'exploration' | 'quest';
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  duration: {
    min: number;
    max: number;
  };
  requirements: {
    minLevel: number;
    requiredTools: string[];
    minHunger: number;
    minThirst: number;
    minHealth: number;
  };
  rewards: {
    guaranteed: Record<string, number>;
    possible: {
      resourceId: string;
      quantity: number;
      chance: number;
    }[];
    experience: number;
  };
}
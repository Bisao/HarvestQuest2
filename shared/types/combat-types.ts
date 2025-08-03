// Types for the turn-based combat system
export type CombatAction = 'attack' | 'defend' | 'analyze' | 'flee';

export interface CombatEncounter {
  id: string;
  playerId: string;
  animalId: string;
  expeditionId: string;
  status: 'active' | 'victory' | 'defeat' | 'fled' | 'analyzed';
  playerHealth: number;
  animalHealth: number;
  turn: number;
  playerTurn: boolean;
  startTime: number;
  endTime?: number;
  actions: CombatActionRecord[];
  rewards?: {
    resources: Record<string, number>;
    experience: number;
    discoveryBonus?: boolean;
  };
}

export interface CombatActionRecord {
  turn: number;
  actor: 'player' | 'animal';
  action: string;
  damage?: number;
  effect?: string;
  timestamp: number;
}

export interface CombatStats {
  health: number;
  maxHealth: number;
  attack: number;
  defense: number;
  speed: number;
  accuracy: number;
}

export interface PlayerCombatStats extends CombatStats {
  weaponBonus: number;
  armorBonus: number;
  level: number;
  experience: number;
}

export interface AnimalCombatStats extends CombatStats {
  attacks: Array<{
    name: string;
    damage: number;
    accuracy: number;
    type: string;
    description: string;
  }>;
  behavior: 'aggressive' | 'defensive' | 'neutral' | 'territorial';
  fleeChance: number;
}

export interface CombatResult {
  winner: 'player' | 'animal' | 'fled';
  playerHealth: number;
  animalHealth: number;
  rewards?: {
    resources: Record<string, number>;
    experience: number;
    discoveryBonus?: boolean;
  };
  actionLog: CombatActionRecord[];
}
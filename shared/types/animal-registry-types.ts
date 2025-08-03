
// Animal Registry System Types
export interface AnimalRegistryEntry {
  id: string;
  species: string;
  commonName: string;
  scientificName?: string;
  emoji: string;
  category: AnimalCategory;
  habitat: string[];
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  
  // Gender-specific information
  male: AnimalGenderInfo;
  female: AnimalGenderInfo;
  
  // General information
  generalInfo: {
    diet: string;
    lifespan: string;
    size: string;
    weight: string;
    behavior: string[];
    funFacts: string[];
  };
  
  // Combat and interaction
  combat: {
    health: number;
    defense: number;
    attacks: AnimalAttack[];
    abilities: AnimalAbility[];
    weaknesses: string[];
    resistances: string[];
  };
  
  // Drops and rewards
  drops: AnimalDrop[];
  
  // Discovery and game mechanics
  discoveredAt?: number; // timestamp when first discovered
  discoveryMethod: 'hunting' | 'fishing' | 'observation' | 'special_event';
  requiredLevel: number;
  discoveryLocation: string[];
}

export interface AnimalAttack {
  name: string;
  damage: number;
  type: 'physical' | 'poison' | 'fire' | 'ice' | 'electric' | 'psychic' | 'dark';
  accuracy: number;
  description: string;
  cooldown?: number;
}

export interface AnimalAbility {
  name: string;
  type: 'passive' | 'active' | 'defensive' | 'offensive';
  description: string;
  effect: string;
  trigger?: string;
}

export interface AnimalDrop {
  itemId: string;
  itemName: string;
  emoji: string;
  dropRate: number; // 0-100%
  minQuantity: number;
  maxQuantity: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

export interface AnimalGenderInfo {
  name: string; // e.g., "Coelho Macho", "Coelha"
  emoji?: string; // Optional different emoji for gender
  characteristics: string[];
  physicalTraits: {
    size: string;
    weight: string;
    distinctiveFeatures: string[];
  };
  behavior: string[];
  reproductiveInfo?: string;
}

export type AnimalCategory = 
  | 'mammal_small'
  | 'mammal_medium' 
  | 'mammal_large'
  | 'bird'
  | 'fish_freshwater'
  | 'fish_saltwater'
  | 'reptile'
  | 'amphibian'
  | 'insect'
  | 'arthropod'
  | 'mythical'
  | 'undead'
  | 'demon'
  | 'celestial'
  | 'elemental'
  | 'prehistoric'
  | 'alien';

export interface PlayerAnimalRegistry {
  playerId: string;
  discoveredAnimals: string[]; // animal IDs
  favoriteAnimals: string[];
  completionStats: {
    totalDiscovered: number;
    totalAvailable: number;
    categoryProgress: { [category: string]: number };
  };
}

export interface AnimalObservation {
  id: string;
  playerId: string;
  animalId: string;
  timestamp: number;
  location: string;
  notes?: string;
  photoCaptured?: boolean;
}

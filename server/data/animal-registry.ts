import { AnimalRegistryEntry, AnimalCategory } from '../../shared/types/animal-registry-types';
import { generateCombatData } from './combat-generator';

export const ANIMAL_CATEGORIES: { [key: string]: string } = {
  'mammal_small': 'Mamíferos Pequenos',
  'mammal_medium': 'Mamíferos Médios',
  'mammal_large': 'Mamíferos Grandes',
  'bird': 'Aves',
  'fish_freshwater': 'Peixes de Água Doce',
  'fish_saltwater': 'Peixes de Água Salgada',
  'reptile': 'Répteis',
  'amphibian': 'Anfíbios',
  'insect': 'Insetos',
  'arthropod': 'Artrópodes',
  'mythical': 'Criaturas Míticas',
  'undead': 'Mortos-Vivos',
  'demon': 'Demônios',
  'celestial': 'Celestiais',
  'elemental': 'Elementais',
  'prehistoric': 'Pré-Históricos',
  'alien': 'Alienígenas'
};

export function getAnimalsByCategory(category: string): AnimalRegistryEntry[] {
  return ANIMAL_REGISTRY.filter(animal => animal.category === category);
}

function createAnimalWithCombat(baseAnimal: Omit<AnimalRegistryEntry, 'combat' | 'drops'>, customDrops?: any[]): AnimalRegistryEntry {
  const combatData = generateCombatData(baseAnimal.category, baseAnimal.rarity, baseAnimal.commonName, customDrops);

  return {
    ...baseAnimal,
    ...combatData
  };
}

export const ANIMAL_REGISTRY: AnimalRegistryEntry[] = [
  createAnimalWithCombat({
    animalId: 'rabbit',
    commonName: 'Coelho',
    scientificName: 'Oryctolagus cuniculus',
    category: 'mammal_small',
    rarity: 'common',
    baseImageUrl: '/images/animals/rabbit.png',
    description: 'Um pequeno mamífero conhecido por suas longas orelhas e capacidade de saltar.',
    physicalCharacteristics: {
      size: 'Pequeno',
      weight: '1-2.5 kg',
      lifespan: '9-12 anos',
      distinctiveFeatures: ['Longas orelhas', 'Patas traseiras fortes']
    },
    habitat: {
      regions: ['Europa', 'África', 'América'],
      environment: ['Florestas', 'Campos', 'Planícies']
    },
    diet: {
      primaryFood: ['Grama', 'Vegetais', 'Raízes'],
      feedingBehavior: 'Herbívoro'
    },
    behavior: {
      socialStructure: 'Vivem em grupos',
      activityCycle: 'Principalmente noturno',
      communicationMethods: ['Toques', 'Posturas']
    },
    reproduction: {
      gestationPeriod: '28-31 dias',
      litterSize: '4-12 filhotes',
      matingSeason: 'Primavera a Outono'
    },
    conservationStatus: {
      status: 'Pouco preocupante',
      threats: ['Perda de habitat', 'Predadores']
    },

    // Discovery and game mechanics
    discoveredAt: undefined,
    discoveryMethod: 'hunting',
    requiredLevel: 1,
    discoveryLocation: ['Floresta', 'Campo', 'Planície']
  }, [
    {
      itemId: 'rabbit-meat',
      itemName: 'Carne de Coelho',
      emoji: '🥩',
      dropRate: 90,
      minQuantity: 1,
      maxQuantity: 2,
      rarity: 'common'
    },
    {
      itemId: 'rabbit-fur',
      itemName: 'Pele de Coelho',
      emoji: '🧶',
      dropRate: 75,
      minQuantity: 1,
      maxQuantity: 1,
      rarity: 'common'
    },
    {
      itemId: 'rabbit-foot',
      itemName: 'Pé de Coelho da Sorte',
      emoji: '🍀',
      dropRate: 5,
      minQuantity: 1,
      maxQuantity: 1,
      rarity: 'rare'
    }
  ]),
]
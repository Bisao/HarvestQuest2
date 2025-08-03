
import { AnimalAttack, AnimalAbility, AnimalDrop } from '../../shared/types/animal-registry-types';

interface CombatTemplate {
  health: number;
  defense: number;
  baseAttacks: AnimalAttack[];
  baseAbilities: AnimalAbility[];
  commonDrops: AnimalDrop[];
}

export function generateCombatData(
  category: string, 
  rarity: string, 
  animalName: string,
  customDrops?: AnimalDrop[]
): {
  combat: {
    health: number;
    defense: number;
    attacks: AnimalAttack[];
    abilities: AnimalAbility[];
    weaknesses: string[];
    resistances: string[];
  };
  drops: AnimalDrop[];
} {
  const rarityMultiplier = {
    'common': 1,
    'uncommon': 1.5,
    'rare': 2,
    'epic': 3,
    'legendary': 5
  }[rarity] || 1;

  const categoryData = getCategoryTemplate(category);
  
  return {
    combat: {
      health: Math.round(categoryData.health * rarityMultiplier),
      defense: Math.round(categoryData.defense * rarityMultiplier),
      attacks: categoryData.baseAttacks.map(attack => ({
        ...attack,
        damage: Math.round(attack.damage * rarityMultiplier)
      })),
      abilities: categoryData.baseAbilities,
      weaknesses: getCategoryWeaknesses(category),
      resistances: getCategoryResistances(category)
    },
    drops: customDrops || generateDefaultDrops(animalName, category, rarity)
  };
}

function getCategoryTemplate(category: string): CombatTemplate {
  const templates: { [key: string]: CombatTemplate } = {
    'mammal_small': {
      health: 30,
      defense: 3,
      baseAttacks: [
        { name: 'Mordida', damage: 10, type: 'physical', accuracy: 80, description: 'Mordida rápida' },
        { name: 'Arranhar', damage: 8, type: 'physical', accuracy: 90, description: 'Arranha com as garras' }
      ],
      baseAbilities: [
        { name: 'Agilidade', type: 'passive', description: 'Movimento rápido', effect: '+20% esquiva' }
      ],
      commonDrops: []
    },
    'mammal_medium': {
      health: 60,
      defense: 5,
      baseAttacks: [
        { name: 'Investida', damage: 18, type: 'physical', accuracy: 75, description: 'Ataque corpo a corpo' },
        { name: 'Chifrada', damage: 22, type: 'physical', accuracy: 70, description: 'Ataque com chifres' }
      ],
      baseAbilities: [
        { name: 'Resistência', type: 'passive', description: 'Maior resistência', effect: '+10 defesa' }
      ],
      commonDrops: []
    },
    'mammal_large': {
      health: 120,
      defense: 8,
      baseAttacks: [
        { name: 'Pisão', damage: 35, type: 'physical', accuracy: 80, description: 'Pisoteia o inimigo' },
        { name: 'Investida Furiosa', damage: 40, type: 'physical', accuracy: 65, description: 'Ataque devastador' }
      ],
      baseAbilities: [
        { name: 'Força Bruta', type: 'passive', description: 'Força impressionante', effect: '+50% dano físico' }
      ],
      commonDrops: []
    },
    'bird': {
      health: 40,
      defense: 2,
      baseAttacks: [
        { name: 'Bicada', damage: 12, type: 'physical', accuracy: 85, description: 'Ataque com o bico' },
        { name: 'Garra Voadora', damage: 15, type: 'physical', accuracy: 75, description: 'Ataque aéreo' }
      ],
      baseAbilities: [
        { name: 'Voo', type: 'active', description: 'Pode voar', effect: '70% chance de fuga' }
      ],
      commonDrops: []
    },
    'fish_freshwater': {
      health: 25,
      defense: 1,
      baseAttacks: [
        { name: 'Mordida', damage: 6, type: 'physical', accuracy: 70, description: 'Mordida aquática' }
      ],
      baseAbilities: [
        { name: 'Respiração Aquática', type: 'passive', description: 'Vive na água', effect: 'Imune a afogamento' }
      ],
      commonDrops: []
    },
    'fish_saltwater': {
      health: 35,
      defense: 2,
      baseAttacks: [
        { name: 'Mordida Salgada', damage: 8, type: 'physical', accuracy: 75, description: 'Mordida do mar' }
      ],
      baseAbilities: [
        { name: 'Resistência Salina', type: 'passive', description: 'Adaptado ao sal', effect: '+20% resistência' }
      ],
      commonDrops: []
    },
    'reptile': {
      health: 50,
      defense: 6,
      baseAttacks: [
        { name: 'Mordida Venenosa', damage: 14, type: 'poison', accuracy: 80, description: 'Mordida com veneno' },
        { name: 'Chicote de Cauda', damage: 16, type: 'physical', accuracy: 85, description: 'Ataque com a cauda' }
      ],
      baseAbilities: [
        { name: 'Sangue Frio', type: 'passive', description: 'Controle térmico', effect: 'Resistente a temperaturas' }
      ],
      commonDrops: []
    },
    'amphibian': {
      health: 35,
      defense: 3,
      baseAttacks: [
        { name: 'Língua Pegajosa', damage: 10, type: 'physical', accuracy: 90, description: 'Ataque com língua' }
      ],
      baseAbilities: [
        { name: 'Metamorfose', type: 'passive', description: 'Adaptação dupla', effect: 'Vive em terra e água' }
      ],
      commonDrops: []
    },
    'insect': {
      health: 15,
      defense: 1,
      baseAttacks: [
        { name: 'Picada', damage: 5, type: 'poison', accuracy: 95, description: 'Picada venenosa' }
      ],
      baseAbilities: [
        { name: 'Exosqueleto', type: 'passive', description: 'Proteção natural', effect: '+5 defesa' }
      ],
      commonDrops: []
    },
    'arthropod': {
      health: 20,
      defense: 4,
      baseAttacks: [
        { name: 'Pinça', damage: 12, type: 'physical', accuracy: 85, description: 'Ataque com pinças' }
      ],
      baseAbilities: [
        { name: 'Carapaça', type: 'passive', description: 'Proteção dura', effect: '+10 defesa' }
      ],
      commonDrops: []
    },
    'mythical': {
      health: 200,
      defense: 15,
      baseAttacks: [
        { name: 'Magia Arcana', damage: 50, type: 'psychic', accuracy: 90, description: 'Ataque mágico' },
        { name: 'Energia Mística', damage: 60, type: 'psychic', accuracy: 85, description: 'Poder sobrenatural' }
      ],
      baseAbilities: [
        { name: 'Regeneração', type: 'passive', description: 'Cura automática', effect: '+5 HP por turno' },
        { name: 'Imortalidade', type: 'passive', description: 'Resistente à morte', effect: '10% chance de reviver' }
      ],
      commonDrops: []
    },
    'undead': {
      health: 80,
      defense: 10,
      baseAttacks: [
        { name: 'Toque Sombrio', damage: 25, type: 'dark', accuracy: 80, description: 'Toque que drena vida' },
        { name: 'Grito Fantasmagórico', damage: 20, type: 'psychic', accuracy: 85, description: 'Grito aterrorizante' }
      ],
      baseAbilities: [
        { name: 'Imorto', type: 'passive', description: 'Já está morto', effect: 'Imune a veneno e doenças' },
        { name: 'Drenar Vida', type: 'active', description: 'Rouba vida do inimigo', effect: 'Cura 50% do dano causado' }
      ],
      commonDrops: []
    },
    'demon': {
      health: 150,
      defense: 12,
      baseAttacks: [
        { name: 'Chamas Infernais', damage: 45, type: 'fire', accuracy: 85, description: 'Fogo do inferno' },
        { name: 'Garra Demoníaca', damage: 40, type: 'dark', accuracy: 90, description: 'Garras das trevas' }
      ],
      baseAbilities: [
        { name: 'Resistência Infernal', type: 'passive', description: 'Resistente ao fogo', effect: 'Imune a fogo' },
        { name: 'Possessão', type: 'active', description: 'Controla o inimigo', effect: '30% chance de confundir' }
      ],
      commonDrops: []
    },
    'celestial': {
      health: 180,
      defense: 20,
      baseAttacks: [
        { name: 'Luz Divina', damage: 55, type: 'psychic', accuracy: 95, description: 'Poder celestial' },
        { name: 'Raio Purificador', damage: 50, type: 'electric', accuracy: 90, description: 'Raio sagrado' }
      ],
      baseAbilities: [
        { name: 'Aura Sagrada', type: 'passive', description: 'Proteção divina', effect: '+25% resistência a dark' },
        { name: 'Cura Celestial', type: 'active', description: 'Cura automática', effect: '+10 HP por turno' }
      ],
      commonDrops: []
    },
    'elemental': {
      health: 100,
      defense: 8,
      baseAttacks: [
        { name: 'Explosão Elemental', damage: 35, type: 'fire', accuracy: 85, description: 'Poder elemental' }
      ],
      baseAbilities: [
        { name: 'Forma Elemental', type: 'passive', description: 'Corpo elemental', effect: 'Resistente a físico' }
      ],
      commonDrops: []
    }
  };

  return templates[category] || templates['mammal_small'];
}

function getCategoryWeaknesses(category: string): string[] {
  const weaknessMap: { [key: string]: string[] } = {
    'mammal_small': ['Predadores', 'Frio'],
    'mammal_medium': ['Fogo', 'Água'],
    'mammal_large': ['Ataques rápidos', 'Veneno'],
    'bird': ['Vento forte', 'Chuva'],
    'fish_freshwater': ['Poluição', 'Falta de água'],
    'fish_saltwater': ['Poluição', 'Mudança de temperatura'],
    'reptile': ['Frio extremo', 'Desidratação'],
    'amphibian': ['Secura', 'Poluição'],
    'insect': ['Inseticidas', 'Frio'],
    'arthropod': ['Ataques pesados'],
    'mythical': ['Ferro frio', 'Magia banimento'],
    'undead': ['Luz sagrada', 'Água benta'],
    'demon': ['Luz sagrada', 'Ferro frio'],
    'celestial': ['Trevas', 'Corrupção'],
    'elemental': ['Elemento oposto']
  };

  return weaknessMap[category] || ['Nenhuma'];
}

function getCategoryResistances(category: string): string[] {
  const resistanceMap: { [key: string]: string[] } = {
    'mammal_small': ['Frio moderado'],
    'mammal_medium': ['Frio', 'Fadiga'],
    'mammal_large': ['Ataques físicos', 'Empurrões'],
    'bird': ['Vento', 'Altitudes'],
    'fish_freshwater': ['Afogamento', 'Pressão água'],
    'fish_saltwater': ['Sal', 'Pressão'],
    'reptile': ['Veneno', 'Calor'],
    'amphibian': ['Umidade', 'Água'],
    'insect': ['Pesticidas fracos'],
    'arthropod': ['Pressão'],
    'mythical': ['Magia', 'Ilusões'],
    'undead': ['Necromancia', 'Medo'],
    'demon': ['Fogo', 'Trevas'],
    'celestial': ['Luz', 'Purificação'],
    'elemental': ['Elemento próprio']
  };

  return resistanceMap[category] || ['Nenhuma'];
}

function generateDefaultDrops(animalName: string, category: string, rarity: string): AnimalDrop[] {
  const drops: AnimalDrop[] = [];
  
  // Drop básico de carne (para animais que produzem carne)
  if (['mammal_small', 'mammal_medium', 'mammal_large', 'bird'].includes(category)) {
    drops.push({
      itemId: `${animalName.toLowerCase().replace(' ', '-')}-meat`,
      itemName: `Carne de ${animalName}`,
      emoji: '🥩',
      dropRate: 85,
      minQuantity: 1,
      maxQuantity: rarity === 'legendary' ? 4 : rarity === 'epic' ? 3 : 2,
      rarity: 'common'
    });
  }

  // Drop de peixe
  if (category.includes('fish')) {
    drops.push({
      itemId: `${animalName.toLowerCase().replace(' ', '-')}-fish`,
      itemName: `${animalName}`,
      emoji: '🐟',
      dropRate: 90,
      minQuantity: 1,
      maxQuantity: 1,
      rarity: 'common'
    });
  }

  // Drops especiais baseados na raridade
  if (rarity === 'rare' || rarity === 'epic' || rarity === 'legendary') {
    drops.push({
      itemId: `${animalName.toLowerCase().replace(' ', '-')}-essence`,
      itemName: `Essência de ${animalName}`,
      emoji: '✨',
      dropRate: rarity === 'legendary' ? 50 : rarity === 'epic' ? 30 : 15,
      minQuantity: 1,
      maxQuantity: 1,
      rarity: rarity as any
    });
  }

  // Drops míticos
  if (category === 'mythical') {
    drops.push({
      itemId: `${animalName.toLowerCase().replace(' ', '-')}-crystal`,
      itemName: `Cristal Místico de ${animalName}`,
      emoji: '💎',
      dropRate: 75,
      minQuantity: 1,
      maxQuantity: 2,
      rarity: 'epic'
    });
  }

  return drops;
}

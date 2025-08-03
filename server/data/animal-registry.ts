
import { AnimalRegistryEntry } from '../../shared/types/animal-registry-types';
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
    id: 'animal-rabbit-001',
    species: 'Coelho Europeu',
    commonName: 'Coelho',
    scientificName: 'Oryctolagus cuniculus',
    emoji: '🐰',
    category: 'mammal_small',
    habitat: ['Floresta', 'Campo', 'Planície'],
    rarity: 'common',
    
    male: {
      name: 'Coelho Macho',
      characteristics: ['Mais territorial', 'Marca território'],
      physicalTraits: {
        size: '35-45 cm',
        weight: '1.5-2.5 kg',
        distinctiveFeatures: ['Orelhas mais largas', 'Corpo mais robusto']
      },
      behavior: ['Territorial', 'Protetor'],
      reproductiveInfo: 'Pode acasalar o ano todo'
    },
    
    female: {
      name: 'Coelha',
      characteristics: ['Mais social', 'Cuidadora dos filhotes'],
      physicalTraits: {
        size: '30-40 cm',
        weight: '1.2-2.0 kg',
        distinctiveFeatures: ['Orelhas mais finas', 'Corpo mais ágil']
      },
      behavior: ['Social', 'Maternal'],
      reproductiveInfo: 'Gestação de 28-31 dias'
    },
    
    generalInfo: {
      diet: 'Herbívoro que se alimenta de grama, vegetais e raízes',
      lifespan: '9-12 anos',
      size: 'Pequeno',
      weight: '1-2.5 kg',
      behavior: ['Noturno', 'Social', 'Saltador'],
      funFacts: [
        'Podem saltar até 1 metro de altura',
        'Têm 28 dentes que crescem continuamente',
        'Enxergam quase 360 graus ao redor'
      ]
    },
    
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
    }
  ]),

  createAnimalWithCombat({
    id: 'animal-deer-001',
    species: 'Veado-Branco',
    commonName: 'Veado',
    scientificName: 'Odocoileus virginianus',
    emoji: '🦌',
    category: 'mammal_medium',
    habitat: ['Floresta', 'Montanha', 'Vale'],
    rarity: 'uncommon',
    
    male: {
      name: 'Cervo',
      characteristics: ['Possui chifres', 'Mais agressivo durante o cio'],
      physicalTraits: {
        size: '1.6-2.1 m',
        weight: '60-130 kg',
        distinctiveFeatures: ['Chifres ramificados', 'Pescoço mais grosso']
      },
      behavior: ['Territorial durante cio', 'Solitário'],
      reproductiveInfo: 'Chifres caem e crescem anualmente'
    },
    
    female: {
      name: 'Corça',
      characteristics: ['Sem chifres', 'Cuidadora dos filhotes'],
      physicalTraits: {
        size: '1.5-1.8 m',
        weight: '40-90 kg',
        distinctiveFeatures: ['Sem chifres', 'Corpo mais delgado']
      },
      behavior: ['Protetora', 'Vive em grupos'],
      reproductiveInfo: 'Gestação de 6.5 meses'
    },
    
    generalInfo: {
      diet: 'Herbívoro que se alimenta de folhas, brotos e frutas',
      lifespan: '10-15 anos',
      size: 'Médio',
      weight: '40-130 kg',
      behavior: ['Crepuscular', 'Alerta', 'Veloz'],
      funFacts: [
        'Podem correr até 60 km/h',
        'Saltam até 3 metros de altura',
        'Têm excelente audição e olfato'
      ]
    },
    
    discoveryMethod: 'hunting',
    requiredLevel: 5,
    discoveryLocation: ['Floresta', 'Montanha', 'Vale']
  }),

  createAnimalWithCombat({
    id: 'animal-boar-001',
    species: 'Javali-Europeu',
    commonName: 'Javali',
    scientificName: 'Sus scrofa',
    emoji: '🐗',
    category: 'mammal_medium',
    habitat: ['Floresta', 'Pântano', 'Colina'],
    rarity: 'rare',
    
    male: {
      name: 'Javali Macho',
      characteristics: ['Presas grandes', 'Muito agressivo'],
      physicalTraits: {
        size: '1.5-2.0 m',
        weight: '150-320 kg',
        distinctiveFeatures: ['Presas curvas', 'Crina no pescoço']
      },
      behavior: ['Agressivo', 'Territorial'],
      reproductiveInfo: 'Compete violentamente por fêmeas'
    },
    
    female: {
      name: 'Javali Fêmea',
      characteristics: ['Presas menores', 'Protetora dos filhotes'],
      physicalTraits: {
        size: '1.2-1.6 m',
        weight: '80-180 kg',
        distinctiveFeatures: ['Presas menores', 'Corpo mais compacto']
      },
      behavior: ['Protetora', 'Social'],
      reproductiveInfo: 'Gestação de 4 meses'
    },
    
    generalInfo: {
      diet: 'Onívoro que se alimenta de raízes, frutas, insetos e pequenos animais',
      lifespan: '15-20 anos',
      size: 'Médio-Grande',
      weight: '80-320 kg',
      behavior: ['Noturno', 'Agressivo', 'Escavador'],
      funFacts: [
        'Podem chegar a 50 km/h',
        'Têm excelente olfato',
        'São muito inteligentes'
      ]
    },
    
    discoveryMethod: 'hunting',
    requiredLevel: 10,
    discoveryLocation: ['Floresta', 'Pântano', 'Colina']
  }),

  createAnimalWithCombat({
    id: 'animal-smallfish-001',
    species: 'Peixe-Pequeno',
    commonName: 'Peixe Pequeno',
    scientificName: 'Leuciscus leuciscus',
    emoji: '🐟',
    category: 'fish_freshwater',
    habitat: ['Rio', 'Lago', 'Riacho'],
    rarity: 'common',
    
    male: {
      name: 'Peixe Pequeno Macho',
      characteristics: ['Cores mais vibrantes durante reprodução'],
      physicalTraits: {
        size: '8-15 cm',
        weight: '20-80 g',
        distinctiveFeatures: ['Nadadeiras mais coloridas', 'Corpo alongado']
      },
      behavior: ['Territorial durante desova'],
      reproductiveInfo: 'Constrói ninhos no fundo'
    },
    
    female: {
      name: 'Peixe Pequeno Fêmea',
      characteristics: ['Corpo mais arredondado'],
      physicalTraits: {
        size: '6-12 cm',
        weight: '15-60 g',
        distinctiveFeatures: ['Corpo mais robusto', 'Cores mais discretas']
      },
      behavior: ['Busca locais seguros para desovar'],
      reproductiveInfo: 'Põe ovos em águas rasas'
    },
    
    generalInfo: {
      diet: 'Onívoro que se alimenta de algas, insetos aquáticos e pequenos crustáceos',
      lifespan: '2-4 anos',
      size: 'Muito Pequeno',
      weight: '15-80 g',
      behavior: ['Cardume', 'Diurno', 'Nadador rápido'],
      funFacts: [
        'Vivem em cardumes de centenas',
        'Podem detectar mudanças de pressão',
        'São indicadores de qualidade da água'
      ]
    },
    
    discoveryMethod: 'fishing',
    requiredLevel: 1,
    discoveryLocation: ['Rio', 'Lago', 'Riacho']
  }),

  createAnimalWithCombat({
    id: 'animal-largefish-001',
    species: 'Peixe-Grande',
    commonName: 'Peixe Grande',
    scientificName: 'Esox lucius',
    emoji: '🐠',
    category: 'fish_freshwater',
    habitat: ['Lago', 'Rio Grande'],
    rarity: 'uncommon',
    
    male: {
      name: 'Peixe Grande Macho',
      characteristics: ['Mais agressivo', 'Cores intensas'],
      physicalTraits: {
        size: '60-100 cm',
        weight: '3-15 kg',
        distinctiveFeatures: ['Mandíbula proeminente', 'Corpo alongado']
      },
      behavior: ['Predador solitário', 'Territorial'],
      reproductiveInfo: 'Protege território de desova'
    },
    
    female: {
      name: 'Peixe Grande Fêmea',
      characteristics: ['Maior que o macho', 'Mais cautelosa'],
      physicalTraits: {
        size: '80-130 cm',
        weight: '5-25 kg',
        distinctiveFeatures: ['Corpo mais robusto', 'Abdômen arredondado']
      },
      behavior: ['Cautelosa', 'Protetora da prole'],
      reproductiveInfo: 'Põe milhares de ovos'
    },
    
    generalInfo: {
      diet: 'Carnívoro que se alimenta de peixes menores, anfíbios e crustáceos',
      lifespan: '10-30 anos',
      size: 'Grande',
      weight: '3-25 kg',
      behavior: ['Solitário', 'Emboscador', 'Predador'],
      funFacts: [
        'Podem viver mais de 30 anos',
        'São predadores de emboscada',
        'Têm dentes afiados como navalhas'
      ]
    },
    
    discoveryMethod: 'fishing',
    requiredLevel: 5,
    discoveryLocation: ['Lago', 'Rio Grande']
  }),

  createAnimalWithCombat({
    id: 'animal-salmon-001',
    species: 'Salmão-Atlântico',
    commonName: 'Salmão',
    scientificName: 'Salmo salar',
    emoji: '🍣',
    category: 'fish_freshwater',
    habitat: ['Rio', 'Oceano'],
    rarity: 'rare',
    
    male: {
      name: 'Salmão Macho',
      characteristics: ['Ganha gancho na mandíbula durante reprodução'],
      physicalTraits: {
        size: '80-150 cm',
        weight: '8-30 kg',
        distinctiveFeatures: ['Gancho na mandíbula', 'Cores vermelhas intensas']
      },
      behavior: ['Agressivo durante desova', 'Luta por território'],
      reproductiveInfo: 'Desenvolve características sexuais exageradas'
    },
    
    female: {
      name: 'Salmão Fêmea',
      characteristics: ['Corpo se torna mais escuro durante reprodução'],
      physicalTraits: {
        size: '70-120 cm',
        weight: '6-20 kg',
        distinctiveFeatures: ['Corpo mais fusiforme', 'Mudança de cor dramática']
      },
      behavior: ['Prepara ninho no cascalho', 'Protetora dos ovos'],
      reproductiveInfo: 'Escava ninho para milhares de ovos'
    },
    
    generalInfo: {
      diet: 'Carnívoro que se alimenta de peixes, crustáceos e lulas no oceano',
      lifespan: '4-8 anos',
      size: 'Grande',
      weight: '6-30 kg',
      behavior: ['Migratório', 'Anádromo', 'Determinado'],
      funFacts: [
        'Podem nadar milhares de quilômetros',
        'Voltam ao rio onde nasceram para reproduzir',
        'Saltam cachoeiras de até 3 metros'
      ]
    },
    
    discoveryMethod: 'fishing',
    requiredLevel: 15,
    discoveryLocation: ['Rio', 'Oceano']
  }),

  // Adicionando mais animais para expandir o bestiário
  createAnimalWithCombat({
    id: 'animal-wolf-001',
    species: 'Lobo-Cinzento',
    commonName: 'Lobo',
    scientificName: 'Canis lupus',
    emoji: '🐺',
    category: 'mammal_large',
    habitat: ['Floresta', 'Montanha', 'Tundra'],
    rarity: 'rare',
    
    male: {
      name: 'Lobo Alfa',
      characteristics: ['Líder da matilha', 'Mais agressivo'],
      physicalTraits: {
        size: '1.6-2.0 m',
        weight: '30-80 kg',
        distinctiveFeatures: ['Maior da matilha', 'Postura dominante']
      },
      behavior: ['Dominante', 'Protetor', 'Estratégico'],
      reproductiveInfo: 'Líder reprodutivo da matilha'
    },
    
    female: {
      name: 'Loba Alfa',
      characteristics: ['Co-líder da matilha', 'Maternal'],
      physicalTraits: {
        size: '1.4-1.8 m',
        weight: '25-55 kg',
        distinctiveFeatures: ['Menor que o macho', 'Expressão maternal']
      },
      behavior: ['Co-dominante', 'Maternal', 'Protetora'],
      reproductiveInfo: 'Gestação de 62-75 dias'
    },
    
    generalInfo: {
      diet: 'Carnívoro que caça em matilha animais de grande porte',
      lifespan: '12-16 anos',
      size: 'Grande',
      weight: '25-80 kg',
      behavior: ['Matilha', 'Noturno', 'Caçador'],
      funFacts: [
        'Podem correr até 60 km/h',
        'Comunicam-se através de uivos',
        'Têm hierarquia social complexa'
      ]
    },
    
    discoveryMethod: 'hunting',
    requiredLevel: 20,
    discoveryLocation: ['Floresta', 'Montanha', 'Tundra']
  }),

  createAnimalWithCombat({
    id: 'animal-eagle-001',
    species: 'Águia-Real',
    commonName: 'Águia',
    scientificName: 'Aquila chrysaetos',
    emoji: '🦅',
    category: 'bird',
    habitat: ['Montanha', 'Desfiladeiro', 'Floresta'],
    rarity: 'epic',
    
    male: {
      name: 'Águia Macho',
      characteristics: ['Menor que a fêmea', 'Mais territorial'],
      physicalTraits: {
        size: '75-85 cm envergadura 2.0 m',
        weight: '3-5 kg',
        distinctiveFeatures: ['Envergadura menor', 'Cores mais vibrantes']
      },
      behavior: ['Territorial', 'Acrobático', 'Caçador'],
      reproductiveInfo: 'Corteja com voos acrobáticos'
    },
    
    female: {
      name: 'Águia Fêmea',
      characteristics: ['Maior que o macho', 'Mais cautelosa'],
      physicalTraits: {
        size: '85-95 cm envergadura 2.3 m',
        weight: '4-7 kg',
        distinctiveFeatures: ['Maior envergadura', 'Garras mais poderosas']
      },
      behavior: ['Cautelosa', 'Protetora do ninho', 'Dominante'],
      reproductiveInfo: 'Incubação de 43-45 dias'
    },
    
    generalInfo: {
      diet: 'Carnívoro que caça mamíferos pequenos e médios, peixes e aves',
      lifespan: '20-30 anos',
      size: 'Grande',
      weight: '3-7 kg',
      behavior: ['Solitário', 'Diurno', 'Voador'],
      funFacts: [
        'Podem mergulhar a 240 km/h',
        'Enxergam 8 vezes melhor que humanos',
        'Constroem ninhos que podem durar décadas'
      ]
    },
    
    discoveryMethod: 'observation',
    requiredLevel: 25,
    discoveryLocation: ['Montanha', 'Desfiladeiro', 'Floresta']
  }),

  createAnimalWithCombat({
    id: 'animal-bear-001',
    species: 'Urso-Pardo',
    commonName: 'Urso',
    scientificName: 'Ursus arctos',
    emoji: '🐻',
    category: 'mammal_large',
    habitat: ['Floresta', 'Montanha', 'Vale'],
    rarity: 'epic',
    
    male: {
      name: 'Urso Macho',
      characteristics: ['Muito maior', 'Extremamente territorial'],
      physicalTraits: {
        size: '2.0-2.8 m',
        weight: '135-390 kg',
        distinctiveFeatures: ['Porte gigantesco', 'Músculos proeminentes']
      },
      behavior: ['Solitário', 'Territorial', 'Agressivo'],
      reproductiveInfo: 'Compete violentamente por fêmeas'
    },
    
    female: {
      name: 'Ursa',
      characteristics: ['Menor que o macho', 'Extremamente protetora'],
      physicalTraits: {
        size: '1.5-2.0 m',
        weight: '95-180 kg',
        distinctiveFeatures: ['Menor porte', 'Expressão maternal']
      },
      behavior: ['Protetora', 'Maternal', 'Cuidadosa'],
      reproductiveInfo: 'Gestação de 6-8 meses'
    },
    
    generalInfo: {
      diet: 'Onívoro que se alimenta de peixes, frutas, mel, carne e vegetais',
      lifespan: '20-30 anos',
      size: 'Muito Grande',
      weight: '95-390 kg',
      behavior: ['Solitário', 'Hibernação', 'Poderoso'],
      funFacts: [
        'Podem correr até 50 km/h',
        'Hibernam por até 7 meses',
        'Têm olfato 7 vezes melhor que cães'
      ]
    },
    
    discoveryMethod: 'hunting',
    requiredLevel: 30,
    discoveryLocation: ['Floresta', 'Montanha', 'Vale']
  }),

  createAnimalWithCombat({
    id: 'animal-dragon-001',
    species: 'Dragão-Menor',
    commonName: 'Dragão',
    scientificName: 'Draco minorus',
    emoji: '🐉',
    category: 'mythical',
    habitat: ['Caverna', 'Montanha', 'Vulcão'],
    rarity: 'legendary',
    
    male: {
      name: 'Dragão Macho',
      characteristics: ['Mais agressivo', 'Chamas mais intensas'],
      physicalTraits: {
        size: '8-12 m',
        weight: '2000-5000 kg',
        distinctiveFeatures: ['Chifres maiores', 'Escamas mais escuras']
      },
      behavior: ['Territorial', 'Solitário', 'Dominante'],
      reproductiveInfo: 'Protege tesouro para atrair fêmeas'
    },
    
    female: {
      name: 'Dragão Fêmea',
      characteristics: ['Mais inteligente', 'Colecionadora'],
      physicalTraits: {
        size: '6-10 m',
        weight: '1500-4000 kg',
        distinctiveFeatures: ['Escamas mais brilhantes', 'Olhos mais penetrantes']
      },
      behavior: ['Inteligente', 'Colecionadora', 'Estratégica'],
      reproductiveInfo: 'Põe ovos em tesouros protegidos'
    },
    
    generalInfo: {
      diet: 'Carnívoro que se alimenta de grandes mamíferos e criaturas mágicas',
      lifespan: '500-1000 anos',
      size: 'Colossal',
      weight: '1500-5000 kg',
      behavior: ['Solitário', 'Inteligente', 'Mágico'],
      funFacts: [
        'Podem cuspir fogo a 1000°C',
        'São imortais até serem mortos',
        'Acumulam tesouros por séculos'
      ]
    },
    
    discoveryMethod: 'special_event',
    requiredLevel: 50,
    discoveryLocation: ['Caverna', 'Montanha', 'Vulcão']
  }),

  createAnimalWithCombat({
    id: 'animal-unicorn-001',
    species: 'Unicórnio-Prateado',
    commonName: 'Unicórnio',
    scientificName: 'Unicornis argenteus',
    emoji: '🦄',
    category: 'mythical',
    habitat: ['Floresta Encantada', 'Clareira Sagrada', 'Vale Místico'],
    rarity: 'legendary',
    
    male: {
      name: 'Unicórnio Macho',
      characteristics: ['Chifre mais longo', 'Crina prateada'],
      physicalTraits: {
        size: '1.8-2.2 m',
        weight: '400-600 kg',
        distinctiveFeatures: ['Chifre espiralado de 60cm', 'Crina prateada flutuante']
      },
      behavior: ['Nobre', 'Protetor', 'Esquivo'],
      reproductiveInfo: 'Corteja com danças mágicas'
    },
    
    female: {
      name: 'Unicórnio Fêmea',
      characteristics: ['Mais pura', 'Poderes curativos'],
      physicalTraits: {
        size: '1.6-2.0 m',
        weight: '350-500 kg',
        distinctiveFeatures: ['Chifre dourado de 50cm', 'Aura luminosa']
      },
      behavior: ['Pura', 'Curadora', 'Compassiva'],
      reproductiveInfo: 'Gestação mágica de 13 meses'
    },
    
    generalInfo: {
      diet: 'Herbívoro mágico que se alimenta de plantas encantadas e orvalho lunar',
      lifespan: 'Imortal (até 2000 anos)',
      size: 'Grande',
      weight: '350-600 kg',
      behavior: ['Puro', 'Mágico', 'Benevolente'],
      funFacts: [
        'Só aparecem para corações puros',
        'Seu chifre pode curar qualquer veneno',
        'Podem teleportar entre dimensões'
      ]
    },
    
    discoveryMethod: 'special_event',
    requiredLevel: 40,
    discoveryLocation: ['Floresta Encantada', 'Clareira Sagrada', 'Vale Místico']
  }),

  createAnimalWithCombat({
    id: 'animal-phoenix-001',
    species: 'Fênix-Dourada',
    commonName: 'Fênix',
    scientificName: 'Phoenix aureus',
    emoji: '🔥🐦',
    category: 'mythical',
    habitat: ['Vulcão', 'Deserto', 'Templo Antigo'],
    rarity: 'legendary',
    
    male: {
      name: 'Fênix Macho',
      characteristics: ['Chamas mais intensas', 'Maior envergadura'],
      physicalTraits: {
        size: '2.0 m envergadura 4.0 m',
        weight: '15-25 kg',
        distinctiveFeatures: ['Penas douradas incandescentes', 'Cauda de fogo']
      },
      behavior: ['Majestoso', 'Protetor', 'Renascente'],
      reproductiveInfo: 'Renasce das próprias cinzas'
    },
    
    female: {
      name: 'Fênix Fêmea',
      characteristics: ['Mais graciosa', 'Poderes curativos'],
      physicalTraits: {
        size: '1.8 m envergadura 3.5 m',
        weight: '12-20 kg',
        distinctiveFeatures: ['Penas com tons rosados', 'Lágrimas curativas']
      },
      behavior: ['Graciosa', 'Curadora', 'Sábia'],
      reproductiveInfo: 'Constrói ninho de especiarias aromáticas'
    },
    
    generalInfo: {
      diet: 'Energia solar e essências mágicas',
      lifespan: 'Imortal (ciclos de 500 anos)',
      size: 'Grande',
      weight: '12-25 kg',
      behavior: ['Imortal', 'Majestoso', 'Renascente'],
      funFacts: [
        'Renasce das próprias cinzas',
        'Lágrimas têm poderes curativos',
        'Canto pode curar ferimentos mortais'
      ]
    },
    
    discoveryMethod: 'special_event',
    requiredLevel: 45,
    discoveryLocation: ['Vulcão', 'Deserto', 'Templo Antigo']
  })
];

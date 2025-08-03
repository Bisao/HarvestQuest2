
import type { AnimalRegistryEntry } from "@shared/types/animal-registry-types";
import { RESOURCE_IDS } from "@shared/constants/game-ids";

export const ANIMAL_REGISTRY: AnimalRegistryEntry[] = [
  // === MAMÍFEROS PEQUENOS ===
  {
    id: "animal-rabbit-001",
    species: "Oryctolagus cuniculus",
    commonName: "Coelho",
    scientificName: "Oryctolagus cuniculus",
    emoji: "🐰",
    category: "mammal_small",
    habitat: ["floresta", "campo", "planície"],
    rarity: "common",
    male: {
      name: "Coelho Macho",
      emoji: "🐰",
      characteristics: [
        "Geralmente maior que a fêmea",
        "Cabeça mais larga e robusta",
        "Comportamento mais territorial"
      ],
      physicalTraits: {
        size: "25-35cm",
        weight: "1.2-1.8kg",
        distinctiveFeatures: [
          "Orelhas ligeiramente maiores",
          "Corpo mais musculoso",
          "Patas traseiras mais desenvolvidas"
        ]
      },
      behavior: [
        "Marca território com glândulas de cheiro",
        "Mais ativo durante o crepúsculo",
        "Comportamento protetor durante acasalamento"
      ],
      reproductiveInfo: "Atinge maturidade sexual aos 4-6 meses"
    },
    female: {
      name: "Coelha",
      emoji: "🐇",
      characteristics: [
        "Corpo mais esguio",
        "Comportamento mais cauteloso",
        "Excelente mãe cuidadora"
      ],
      physicalTraits: {
        size: "23-30cm",
        weight: "1.0-1.5kg",
        distinctiveFeatures: [
          "Orelhas proporcionalmente menores",
          "Corpo mais alongado",
          "Pelagem mais densa"
        ]
      },
      behavior: [
        "Constrói ninhos elaborados",
        "Extremamente protetora dos filhotes",
        "Comportamento de grupo mais desenvolvido"
      ],
      reproductiveInfo: "Gestação de 28-32 dias, 4-8 filhotes por ninhada"
    },
    generalInfo: {
      diet: "Herbívoro - ervas, folhas, casca de árvore",
      lifespan: "8-12 anos na natureza",
      size: "Pequeno porte",
      weight: "1-2kg",
      behavior: ["Crepuscular", "Escavador", "Social"],
      funFacts: [
        "Podem correr até 50 km/h",
        "Seus dentes nunca param de crescer",
        "Enxergam quase 360 graus",
        "Podem saltar até 1 metro de altura"
      ]
    },
    discoveryMethod: "hunting",
    requiredLevel: 1,
    discoveryLocation: ["floresta", "campo_aberto"]
  },

  {
    id: "animal-deer-001",
    species: "Cervus elaphus",
    commonName: "Veado",
    scientificName: "Cervus elaphus",
    emoji: "🦌",
    category: "mammal_medium",
    habitat: ["floresta", "montanha", "vale"],
    rarity: "uncommon",
    male: {
      name: "Cervo",
      emoji: "🦌",
      characteristics: [
        "Possui grandes chifres ramificados",
        "Significativamente maior que a fêmea",
        "Comportamento dominante durante época de acasalamento"
      ],
      physicalTraits: {
        size: "120-150cm",
        weight: "90-120kg",
        distinctiveFeatures: [
          "Chifres (galhadas) que renovam anualmente",
          "Pescoço mais grosso e musculoso",
          "Pelagem mais escura no pescoço"
        ]
      },
      behavior: [
        "Brami alto durante época de acasalamento",
        "Luta com outros machos por território",
        "Líder de pequenos grupos familiares"
      ],
      reproductiveInfo: "Época de acasalamento no outono, compete por harém de fêmeas"
    },
    female: {
      name: "Cerva",
      emoji: "🦌",
      characteristics: [
        "Sem chifres, mais ágil",
        "Comportamento maternal forte",
        "Vive em grupos maiores"
      ],
      physicalTraits: {
        size: "100-130cm",
        weight: "60-85kg",
        distinctiveFeatures: [
          "Ausência de chifres",
          "Corpo mais esguio",
          "Cabeça menor e mais delicada"
        ]
      },
      behavior: [
        "Forma grupos com outras fêmeas",
        "Extremamente protetiva dos filhotes",
        "Ensina técnicas de sobrevivência aos jovens"
      ],
      reproductiveInfo: "Gestação de 8 meses, normalmente 1 filhote (raramente 2)"
    },
    generalInfo: {
      diet: "Herbívoro - folhas, brotos, frutas, líquens",
      lifespan: "15-20 anos na natureza",
      size: "Médio a grande porte",
      weight: "60-120kg",
      behavior: ["Crepuscular", "Migratório", "Social"],
      funFacts: [
        "Chifres dos machos podem pesar até 15kg",
        "Podem correr até 70 km/h",
        "Excelentes nadadores",
        "Saltam obstáculos de até 3 metros"
      ]
    },
    discoveryMethod: "hunting",
    requiredLevel: 5,
    discoveryLocation: ["floresta_densa", "montanha"]
  },

  {
    id: "animal-boar-001",
    species: "Sus scrofa",
    commonName: "Javali",
    scientificName: "Sus scrofa",
    emoji: "🐗",
    category: "mammal_medium",
    habitat: ["floresta", "pântano", "colina"],
    rarity: "rare",
    male: {
      name: "Javali Macho",
      emoji: "🐗",
      characteristics: [
        "Presas desenvolvidas e afiadas",
        "Comportamento extremamente agressivo",
        "Solitário fora da época reprodutiva"
      ],
      physicalTraits: {
        size: "150-180cm",
        weight: "80-120kg",
        distinctiveFeatures: [
          "Presas curvadas para cima",
          "Crina eriçada no pescoço",
          "Músculos do pescoço muito desenvolvidos"
        ]
      },
      behavior: [
        "Marca território com lama e urina",
        "Ataca quando se sente ameaçado",
        "Escava em busca de raízes e tubérculos"
      ],
      reproductiveInfo: "Compete violentamente por acesso às fêmeas"
    },
    female: {
      name: "Javali Fêmea",
      emoji: "🐷",
      characteristics: [
        "Presas menores",
        "Vive em grupos com filhotes",
        "Comportamento maternal intenso"
      ],
      physicalTraits: {
        size: "130-160cm",
        weight: "60-90kg",
        distinctiveFeatures: [
          "Presas menos proeminentes",
          "Corpo mais alongado",
          "Crina menos desenvolvida"
        ]
      },
      behavior: [
        "Forma grupos familiares",
        "Ensina filhotes a procurar comida",
        "Defende grupo com ferocidade"
      ],
      reproductiveInfo: "Gestação de 4 meses, 4-8 filhotes por ninhada"
    },
    generalInfo: {
      diet: "Onívoro - raízes, frutas, insetos, pequenos animais",
      lifespan: "10-15 anos na natureza",
      size: "Grande porte",
      weight: "60-120kg",
      behavior: ["Noturno", "Territorial", "Agressivo"],
      funFacts: [
        "Podem cavar buracos de até 1 metro",
        "Excelente olfato, 2000x melhor que humanos",
        "Podem correr até 48 km/h",
        "Inteligência comparável à de cães"
      ]
    },
    discoveryMethod: "hunting",
    requiredLevel: 10,
    discoveryLocation: ["floresta_densa", "pantano"]
  },

  // === PEIXES ===
  {
    id: "animal-smallfish-001",
    species: "Leuciscus leuciscus",
    commonName: "Peixe Pequeno",
    emoji: "🐟",
    category: "fish_freshwater",
    habitat: ["rio", "lago", "riacho"],
    rarity: "common",
    male: {
      name: "Peixe Pequeno Macho",
      characteristics: [
        "Cores mais vibrantes durante reprodução",
        "Comportamento mais territorial",
        "Nadadeiras ligeiramente maiores"
      ],
      physicalTraits: {
        size: "8-12cm",
        weight: "15-30g",
        distinctiveFeatures: [
          "Cores mais intensas na época reprodutiva",
          "Barbatanas dorsais mais pontiagudas",
          "Corpo ligeiramente mais robusto"
        ]
      },
      behavior: [
        "Defende território de desova",
        "Corteja fêmeas com exibições",
        "Constrói ninhos no substrato"
      ],
      reproductiveInfo: "Prepara local de desova e protege ovos"
    },
    female: {
      name: "Peixe Pequeno Fêmea",
      characteristics: [
        "Abdômen mais arredondado",
        "Comportamento menos agressivo",
        "Maior durante época reprodutiva"
      ],
      physicalTraits: {
        size: "10-14cm",
        weight: "20-40g",
        distinctiveFeatures: [
          "Abdômen visível quando com ovos",
          "Cores mais suaves",
          "Barbatanas mais arredondadas"
        ]
      },
      behavior: [
        "Forma cardumes durante migração",
        "Seleciona locais ideais para desova",
        "Comportamento mais cauteloso"
      ],
      reproductiveInfo: "Deposita 200-500 ovos em locais protegidos"
    },
    generalInfo: {
      diet: "Onívoro - plâncton, insetos, plantas aquáticas",
      lifespan: "3-5 anos",
      size: "Pequeno",
      weight: "15-40g",
      behavior: ["Cardume", "Migratório", "Diurno"],
      funFacts: [
        "Podem detectar vibrações na água",
        "Mudam de cor conforme humor",
        "Navegam usando campos magnéticos",
        "Alguns podem viver em água salobra"
      ]
    },
    discoveryMethod: "fishing",
    requiredLevel: 1,
    discoveryLocation: ["rio_calmo", "lago"]
  },

  {
    id: "animal-largefish-001",
    species: "Esox lucius",
    commonName: "Peixe Grande",
    emoji: "🐠",
    category: "fish_freshwater",
    habitat: ["lago", "rio_grande"],
    rarity: "uncommon",
    male: {
      name: "Peixe Grande Macho",
      characteristics: [
        "Corpo mais alongado",
        "Comportamento mais agressivo",
        "Caça solitária"
      ],
      physicalTraits: {
        size: "40-60cm",
        weight: "800-1500g",
        distinctiveFeatures: [
          "Cabeça proporcionalmente maior",
          "Dentes mais proeminentes",
          "Nadadeiras mais desenvolvidas"
        ]
      },
      behavior: [
        "Caçador emboscada",
        "Territorial durante reprodução",
        "Comportamento solitário"
      ],
      reproductiveInfo: "Não cuida dos ovos após fertilização"
    },
    female: {
      name: "Peixe Grande Fêmea",
      characteristics: [
        "Maior que o macho",
        "Abdômen mais pronunciado",
        "Comportamento maternal básico"
      ],
      physicalTraits: {
        size: "50-70cm",
        weight: "1200-2000g",
        distinctiveFeatures: [
          "Corpo mais robusto",
          "Abdômen expandido durante desova",
          "Escamas ligeiramente maiores"
        ]
      },
      behavior: [
        "Seleciona locais de desova cuidadosamente",
        "Mais cautelosa que o macho",
        "Comportamento protetor temporal"
      ],
      reproductiveInfo: "Deposita até 10.000 ovos em vegetação aquática"
    },
    generalInfo: {
      diet: "Carnívoro - peixes menores, crustáceos, insetos aquáticos",
      lifespan: "8-12 anos",
      size: "Médio",
      weight: "800-2000g",
      behavior: ["Predador", "Solitário", "Emboscada"],
      funFacts: [
        "Podem acelerar a 30 km/h instantaneamente",
        "Dentes renovam-se constantemente",
        "Detectam movimento a 20 metros",
        "Podem ficar imóveis por horas esperando presa"
      ]
    },
    discoveryMethod: "fishing",
    requiredLevel: 5,
    discoveryLocation: ["lago_profundo", "rio_grande"]
  },

  {
    id: "animal-salmon-001",
    species: "Salmo salar",
    commonName: "Salmão",
    emoji: "🍣",
    category: "fish_freshwater",
    habitat: ["rio", "oceano"],
    rarity: "rare",
    male: {
      name: "Salmão Macho",
      characteristics: [
        "Desenvolve garra na mandíbula",
        "Cores intensas durante migração",
        "Comportamento extremamente territorial"
      ],
      physicalTraits: {
        size: "60-80cm",
        weight: "2-4kg",
        distinctiveFeatures: [
          "Kype (garra) curvada na mandíbula",
          "Cores vermelhas brilhantes",
          "Corpo mais musculoso"
        ]
      },
      behavior: [
        "Luta violentamente por território",
        "Migra milhares de quilômetros",
        "Constrói e defende ninhos"
      ],
      reproductiveInfo: "Morre após reprodução, dedicando toda energia ao processo"
    },
    female: {
      name: "Salmão Fêmea",
      characteristics: [
        "Corpo mais arredondado",
        "Comportamento de escavação",
        "Cores menos intensas"
      ],
      physicalTraits: {
        size: "55-75cm",
        weight: "2.5-4.5kg",
        distinctiveFeatures: [
          "Abdômen expandido com ovos",
          "Sem desenvolvimento de kype",
          "Cores mais sutis"
        ]
      },
      behavior: [
        "Escava ninhos no cascalho",
        "Seleciona locais com fluxo ideal",
        "Protege ovos até a morte"
      ],
      reproductiveInfo: "Deposita 2000-5000 ovos em depressões escavadas"
    },
    generalInfo: {
      diet: "Carnívoro - crustáceos, peixes pequenos, krill",
      lifespan: "4-6 anos",
      size: "Grande",
      weight: "2-5kg",
      behavior: ["Migratório", "Anádromo", "Sacrificial"],
      funFacts: [
        "Navegam por cheiro para voltar ao local de nascimento",
        "Podem saltar cachoeiras de 3 metros",
        "Mudam completamente de cor durante migração",
        "Percorrem até 3000km em migração"
      ]
    },
    discoveryMethod: "fishing",
    requiredLevel: 15,
    discoveryLocation: ["rio_montanha", "cachoeira"]
  }
];

// Helper functions for animal registry
export function getAnimalsByCategory(category: string): AnimalRegistryEntry[] {
  return ANIMAL_REGISTRY.filter(animal => animal.category === category);
}

export function getAnimalByResourceId(resourceId: string): AnimalRegistryEntry | undefined {
  const resourceToAnimalMap: Record<string, string> = {
    [RESOURCE_IDS.COELHO]: "animal-rabbit-001",
    [RESOURCE_IDS.VEADO]: "animal-deer-001", 
    [RESOURCE_IDS.JAVALI]: "animal-boar-001",
    [RESOURCE_IDS.PEIXE_PEQUENO]: "animal-smallfish-001",
    [RESOURCE_IDS.PEIXE_GRANDE]: "animal-largefish-001",
    [RESOURCE_IDS.SALMAO]: "animal-salmon-001"
  };
  
  const animalId = resourceToAnimalMap[resourceId];
  return ANIMAL_REGISTRY.find(animal => animal.id === animalId);
}

// Animal categories for filtering and organization
export const ANIMAL_CATEGORIES = [
  'mammal_small',
  'mammal_medium', 
  'mammal_large',
  'bird',
  'fish_freshwater',
  'fish_saltwater',
  'reptile',
  'amphibian',
  'insect',
  'arthropod',
  'mythical'
] as const;

export function getDiscoverableAnimals(playerLevel: number): AnimalRegistryEntry[] {
  return ANIMAL_REGISTRY.filter(animal => animal.requiredLevel <= playerLevel);
}


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
    id: "animal-hamster-001",
    species: "Mesocricetus auratus",
    commonName: "Hamster",
    emoji: "🐹",
    category: "mammal_small",
    habitat: ["campo", "toca", "deserto"],
    rarity: "common",
    male: {
      name: "Hamster Macho",
      characteristics: ["Território mais marcado", "Glândulas de cheiro ativas"],
      physicalTraits: {
        size: "12-17cm",
        weight: "85-130g",
        distinctiveFeatures: ["Bochechas expansíveis", "Cauda curta"]
      },
      behavior: ["Noturno", "Escavador", "Acumula comida"],
      reproductiveInfo: "Maturidade aos 6-10 semanas"
    },
    female: {
      name: "Hamster Fêmea",
      characteristics: ["Mais territorial que o macho", "Cuidado maternal intenso"],
      physicalTraits: {
        size: "12-17cm",
        weight: "95-150g",
        distinctiveFeatures: ["Abdômen mais arredondado"]
      },
      behavior: ["Constrói ninhos elaborados", "Defende território ferozmente"],
      reproductiveInfo: "Gestação de 16-22 dias, 4-12 filhotes"
    },
    generalInfo: {
      diet: "Onívoro - sementes, grãos, insetos",
      lifespan: "2-3 anos",
      size: "Muito pequeno",
      weight: "85-150g",
      behavior: ["Noturno", "Solitário", "Escavador"],
      funFacts: [
        "Podem carregar até 20% do peso corporal nas bochechas",
        "Correm até 8km por noite",
        "Hibernam quando muito frio"
      ]
    },
    discoveryMethod: "hunting",
    requiredLevel: 1,
    discoveryLocation: ["campo_seco", "toca_subterranea"]
  },

  {
    id: "animal-hedgehog-001",
    species: "Erinaceus europaeus",
    commonName: "Ouriço",
    emoji: "🦔",
    category: "mammal_small",
    habitat: ["floresta", "jardim", "campo"],
    rarity: "uncommon",
    male: {
      name: "Ouriço Macho",
      characteristics: ["Ligeiramente maior", "Mais agressivo"],
      physicalTraits: {
        size: "20-30cm",
        weight: "400-1200g",
        distinctiveFeatures: ["5000-7000 espinhos", "Focinho pontudo"]
      },
      behavior: ["Solitário", "Territorial", "Enrola-se quando ameaçado"],
      reproductiveInfo: "Corteja fêmeas com rituais circulares"
    },
    female: {
      name: "Ouriça",
      characteristics: ["Menor que o macho", "Comportamento maternal"],
      physicalTraits: {
        size: "18-25cm",
        weight: "350-1000g",
        distinctiveFeatures: ["Espinhos mais suaves"]
      },
      behavior: ["Constrói ninhos para filhotes", "Ensina técnicas de defesa"],
      reproductiveInfo: "Gestação de 35 dias, 3-5 filhotes"
    },
    generalInfo: {
      diet: "Insetívoro - besouros, minhocas, lesmas",
      lifespan: "4-7 anos",
      size: "Pequeno",
      weight: "350-1200g",
      behavior: ["Noturno", "Solitário", "Hibernação"],
      funFacts: [
        "Podem nadar e escalar",
        "Imunes a venenos de cobras",
        "Espinhos renovam-se anualmente"
      ]
    },
    discoveryMethod: "hunting",
    requiredLevel: 3,
    discoveryLocation: ["floresta_temperada", "jardim_selvagem"]
  },

  // === MAMÍFEROS MÉDIOS ===
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

  {
    id: "animal-fox-001",
    species: "Vulpes vulpes",
    commonName: "Raposa",
    emoji: "🦊",
    category: "mammal_medium",
    habitat: ["floresta", "campo", "tundra"],
    rarity: "uncommon",
    male: {
      name: "Raposa Macho",
      characteristics: ["Ligeiramente maior", "Cauda mais volumosa"],
      physicalTraits: {
        size: "45-90cm",
        weight: "4.9-8.7kg",
        distinctiveFeatures: ["Cauda fofa e longa", "Orelhas pontiagudas", "Focinho fino"]
      },
      behavior: ["Territorial", "Caçador solitário", "Marca território"],
      reproductiveInfo: "Monogâmico durante época reprodutiva"
    },
    female: {
      name: "Raposa Fêmea",
      characteristics: ["Menor que o macho", "Cuidado maternal intenso"],
      physicalTraits: {
        size: "40-75cm",
        weight: "3.6-7.2kg",
        distinctiveFeatures: ["Corpo mais esguio", "Cauda proporcional"]
      },
      behavior: ["Escava tocas elaboradas", "Ensina técnicas de caça"],
      reproductiveInfo: "Gestação de 52 dias, 2-12 filhotes"
    },
    generalInfo: {
      diet: "Onívoro - roedores, aves, frutas, insetos",
      lifespan: "8-10 anos",
      size: "Médio",
      weight: "4-9kg",
      behavior: ["Crepuscular", "Solitário", "Adaptável"],
      funFacts: [
        "Audição excepcional - ouve roedores a 40 metros",
        "Podem saltar 2 metros de altura",
        "Usam campo magnético terrestre para caçar"
      ]
    },
    discoveryMethod: "hunting",
    requiredLevel: 7,
    discoveryLocation: ["floresta_mista", "campo_aberto"]
  },

  {
    id: "animal-raccoon-001",
    species: "Procyon lotor",
    commonName: "Guaxinim",
    emoji: "🦝",
    category: "mammal_medium",
    habitat: ["floresta", "cidade", "pântano"],
    rarity: "uncommon",
    male: {
      name: "Guaxinim Macho",
      characteristics: ["Maior que a fêmea", "Mais agressivo"],
      physicalTraits: {
        size: "40-70cm",
        weight: "3.5-9kg",
        distinctiveFeatures: ["Máscara facial preta", "Cauda anelada", "Patas dianteiras hábeis"]
      },
      behavior: ["Solitário", "Territorial", "Noturno"],
      reproductiveInfo: "Múltiplas parceiras por temporada"
    },
    female: {
      name: "Guaxinim Fêmea",
      characteristics: ["Menor", "Cuidado maternal prolongado"],
      physicalTraits: {
        size: "35-60cm",
        weight: "2.5-7kg",
        distinctiveFeatures: ["Máscara menos pronunciada"]
      },
      behavior: ["Ensina filhotes por meses", "Forma grupos familiares"],
      reproductiveInfo: "Gestação de 65 dias, 2-5 filhotes"
    },
    generalInfo: {
      diet: "Onívoro - frutas, nozes, peixes, ovos, lixo",
      lifespan: "7-16 anos",
      size: "Médio",
      weight: "3-9kg",
      behavior: ["Noturno", "Escalador", "Lavador"],
      funFacts: [
        "Lavam comida antes de comer",
        "Patas dianteiras extremamente sensíveis",
        "Podem abrir fechaduras simples"
      ]
    },
    discoveryMethod: "hunting",
    requiredLevel: 6,
    discoveryLocation: ["floresta_úmida", "área_urbana"]
  },

  // === MAMÍFEROS GRANDES ===
  {
    id: "animal-bear-001",
    species: "Ursus americanus",
    commonName: "Urso",
    emoji: "🐻",
    category: "mammal_large",
    habitat: ["floresta", "montanha", "tundra"],
    rarity: "rare",
    male: {
      name: "Urso Macho",
      characteristics: ["Muito maior que a fêmea", "Extremamente territorial"],
      physicalTraits: {
        size: "150-200cm",
        weight: "125-250kg",
        distinctiveFeatures: ["Força descomunal", "Garras poderosas", "Olfato excepcional"]
      },
      behavior: ["Solitário", "Marcação territorial", "Pesca salmão"],
      reproductiveInfo: "Combate outros machos por acasalamento"
    },
    female: {
      name: "Ursa",
      characteristics: ["Menor", "Mãe protetora"],
      physicalTraits: {
        size: "130-180cm",
        weight: "90-180kg",
        distinctiveFeatures: ["Mais ágil que o macho"]
      },
      behavior: ["Cuida filhotes por 2 anos", "Ensina técnicas de sobrevivência"],
      reproductiveInfo: "Gestação de 220 dias, 1-4 filhotes"
    },
    generalInfo: {
      diet: "Onívoro - peixes, frutas, mel, carne",
      lifespan: "20-25 anos",
      size: "Grande",
      weight: "90-250kg",
      behavior: ["Solitário", "Hibernação", "Escalador"],
      funFacts: [
        "Podem correr 55 km/h",
        "Olfato 7x melhor que cães",
        "Hibernam 5-7 meses por ano"
      ]
    },
    discoveryMethod: "hunting",
    requiredLevel: 15,
    discoveryLocation: ["floresta_boreal", "montanha_alta"]
  },

  {
    id: "animal-bison-001",
    species: "Bison bison",
    commonName: "Bisão",
    emoji: "🦬",
    category: "mammal_large",
    habitat: ["planície", "pradaria", "campo"],
    rarity: "rare",
    male: {
      name: "Bisão Macho",
      characteristics: ["Gigantesco", "Corcova pronunciada"],
      physicalTraits: {
        size: "200-350cm",
        weight: "460-988kg",
        distinctiveFeatures: ["Corcova muscular", "Chifres curvos", "Pelagem densa"]
      },
      behavior: ["Líder do rebanho", "Protetor", "Combativo"],
      reproductiveInfo: "Competição intensa durante acasalamento"
    },
    female: {
      name: "Bisão Fêmea",
      characteristics: ["Menor", "Matriarcal"],
      physicalTraits: {
        size: "150-300cm",
        weight: "360-544kg",
        distinctiveFeatures: ["Corcova menor", "Mais ágil"]
      },
      behavior: ["Lidera migrações", "Cuidado comunitário"],
      reproductiveInfo: "Gestação de 285 dias, 1 filhote"
    },
    generalInfo: {
      diet: "Herbívoro - gramíneas, ervas",
      lifespan: "15-20 anos",
      size: "Muito grande",
      weight: "360-988kg",
      behavior: ["Migratório", "Rebanho", "Pastoreio"],
      funFacts: [
        "Podem saltar cercas de 2 metros",
        "Correm até 65 km/h",
        "Símbolo das Grandes Planícies"
      ]
    },
    discoveryMethod: "hunting",
    requiredLevel: 20,
    discoveryLocation: ["grande_planície", "pradaria_aberta"]
  },

  {
    id: "animal-moose-001",
    species: "Alces alces",
    commonName: "Alce",
    emoji: "🫎",
    category: "mammal_large",
    habitat: ["floresta_boreal", "tundra", "pântano"],
    rarity: "rare",
    male: {
      name: "Alce Macho",
      characteristics: ["Gigantesco", "Chifres palmados enormes"],
      physicalTraits: {
        size: "240-310cm",
        weight: "380-720kg",
        distinctiveFeatures: ["Chifres palmados até 2m", "Barbela no pescoço"]
      },
      behavior: ["Solitário", "Territorial", "Agressivo no cio"],
      reproductiveInfo: "Disputa fêmeas com chifradas"
    },
    female: {
      name: "Alce Fêmea",
      characteristics: ["Sem chifres", "Mãe dedicada"],
      physicalTraits: {
        size: "200-270cm",
        weight: "270-400kg",
        distinctiveFeatures: ["Sem chifres", "Corpo mais esguio"]
      },
      behavior: ["Protege filhotes ferozmente", "Ensina natação"],
      reproductiveInfo: "Gestação de 243 dias, 1-2 filhotes"
    },
    generalInfo: {
      diet: "Herbívoro - plantas aquáticas, brotos, casca",
      lifespan: "15-25 anos",
      size: "Gigante",
      weight: "270-720kg",
      behavior: ["Solitário", "Aquático", "Migratório"],
      funFacts: [
        "Maiores cervídeos do mundo",
        "Excelentes nadadores",
        "Podem mergulhar até 6 metros"
      ]
    },
    discoveryMethod: "hunting",
    requiredLevel: 18,
    discoveryLocation: ["floresta_boreal", "lago_norte"]
  },

  // === AVES ===
  {
    id: "animal-chicken-001",
    species: "Gallus gallus domesticus",
    commonName: "Galinha",
    emoji: "🐔",
    category: "bird",
    habitat: ["fazenda", "quintal", "campo"],
    rarity: "common",
    male: {
      name: "Galo",
      emoji: "🐓",
      characteristics: ["Crista vermelha grande", "Canto matinal"],
      physicalTraits: {
        size: "35-45cm",
        weight: "2.5-4.5kg",
        distinctiveFeatures: ["Crista grande", "Cauda arqueada", "Esporões"]
      },
      behavior: ["Protetor do galinheiro", "Canta ao amanhecer", "Dominante"],
      reproductiveInfo: "Corteja fêmeas com dança"
    },
    female: {
      name: "Galinha",
      characteristics: ["Menor", "Põe ovos"],
      physicalTraits: {
        size: "30-40cm",
        weight: "1.5-3kg",
        distinctiveFeatures: ["Crista menor", "Cauda menos arqueada"]
      },
      behavior: ["Choca ovos", "Protege pintos", "Ciscadora"],
      reproductiveInfo: "Põe 1 ovo a cada 24-26 horas"
    },
    generalInfo: {
      diet: "Onívoro - grãos, insetos, minhocas",
      lifespan: "5-10 anos",
      size: "Médio",
      weight: "1.5-4.5kg",
      behavior: ["Diurno", "Social", "Domesticado"],
      funFacts: [
        "Reconhecem mais de 100 faces",
        "Podem voar pequenas distâncias",
        "Descendem de dinossauros"
      ]
    },
    discoveryMethod: "observation",
    requiredLevel: 1,
    discoveryLocation: ["fazenda", "quintal_rural"]
  },

  {
    id: "animal-duck-001",
    species: "Anas platyrhynchos",
    commonName: "Pato",
    emoji: "🦆",
    category: "bird",
    habitat: ["lago", "rio", "pântano"],
    rarity: "common",
    male: {
      name: "Pato Macho",
      characteristics: ["Cabeça verde iridescente", "Cores vibrantes"],
      physicalTraits: {
        size: "50-65cm",
        weight: "0.7-1.6kg",
        distinctiveFeatures: ["Cabeça verde", "Colar branco", "Bico amarelo"]
      },
      behavior: ["Cortejo elaborado", "Territorial na água", "Mergulhador"],
      reproductiveInfo: "Múltiplas parceiras por temporada"
    },
    female: {
      name: "Pata",
      characteristics: ["Plumagem marrom", "Camuflagem"],
      physicalTraits: {
        size: "45-60cm",
        weight: "0.6-1.4kg",
        distinctiveFeatures: ["Plumagem discreta", "Bico laranja"]
      },
      behavior: ["Constrói ninhos próximos à água", "Guia patinhos"],
      reproductiveInfo: "Gestação de 28 dias, 8-15 ovos"
    },
    generalInfo: {
      diet: "Onívoro - plantas aquáticas, insetos, pequenos peixes",
      lifespan: "5-10 anos",
      size: "Médio",
      weight: "0.6-1.6kg",
      behavior: ["Aquático", "Migratório", "Social"],
      funFacts: [
        "Penas à prova d'água",
        "Podem dormir com metade do cérebro",
        "Navegam por estrelas"
      ]
    },
    discoveryMethod: "observation",
    requiredLevel: 2,
    discoveryLocation: ["lago_calmo", "rio_lento"]
  },

  {
    id: "animal-goose-001",
    species: "Anser anser",
    commonName: "Ganso",
    emoji: "🪿",
    category: "bird",
    habitat: ["lago", "campo", "pântano"],
    rarity: "uncommon",
    male: {
      name: "Ganso Macho",
      characteristics: ["Maior que a fêmea", "Mais agressivo"],
      physicalTraits: {
        size: "75-90cm",
        weight: "3-5kg",
        distinctiveFeatures: ["Pescoço longo", "Bico laranja", "Envergadura 1.6m"]
      },
      behavior: ["Protetor", "Grasnados altos", "Formação V"],
      reproductiveInfo: "Monogâmico, acasala para vida"
    },
    female: {
      name: "Gansa",
      characteristics: ["Ligeiramente menor", "Construtora de ninhos"],
      physicalTraits: {
        size: "70-80cm",
        weight: "2.5-4kg",
        distinctiveFeatures: ["Pescoço proporcionalmente menor"]
      },
      behavior: ["Choca ovos sozinha", "Ensina voo aos filhotes"],
      reproductiveInfo: "Incubação de 28-30 dias, 4-7 ovos"
    },
    generalInfo: {
      diet: "Herbívoro - gramíneas, plantas aquáticas",
      lifespan: "10-24 anos",
      size: "Grande",
      weight: "2.5-5kg",
      behavior: ["Migratório", "Formação", "Territorial"],
      funFacts: [
        "Voam em formação V para economia de energia",
        "Podem voar a 8.000m de altitude",
        "Navegam por campos magnéticos"
      ]
    },
    discoveryMethod: "observation",
    requiredLevel: 4,
    discoveryLocation: ["lago_grande", "pântano_aberto"]
  },

  {
    id: "animal-swan-001",
    species: "Cygnus olor",
    commonName: "Cisne",
    emoji: "🦢",
    category: "bird",
    habitat: ["lago", "rio_grande", "lagoa"],
    rarity: "rare",
    male: {
      name: "Cisne Macho",
      characteristics: ["Ligeiramente maior", "Mais territorial"],
      physicalTraits: {
        size: "140-160cm",
        weight: "10-15kg",
        distinctiveFeatures: ["Pescoço gracioso", "Plumagem branca", "Bico laranja"]
      },
      behavior: ["Extremamente territorial", "Displays de cortejo", "Protetor"],
      reproductiveInfo: "Monogâmico, acasala para vida"
    },
    female: {
      name: "Cisne Fêmea",
      characteristics: ["Elegante", "Construtora de ninhos"],
      physicalTraits: {
        size: "130-150cm",
        weight: "8-12kg",
        distinctiveFeatures: ["Pescoço ligeiramente menor"]
      },
      behavior: ["Constrói ninhos flutuantes", "Carrega filhotes nas costas"],
      reproductiveInfo: "Incubação de 35-38 dias, 4-7 ovos"
    },
    generalInfo: {
      diet: "Herbívoro - plantas aquáticas, algas",
      lifespan: "20-30 anos",
      size: "Muito grande",
      weight: "8-15kg",
      behavior: ["Aquático", "Elegante", "Monogâmico"],
      funFacts: [
        "Símbolo de beleza e fidelidade",
        "Podem quebrar ossos com as asas",
        "Migram em família"
      ]
    },
    discoveryMethod: "observation",
    requiredLevel: 8,
    discoveryLocation: ["lago_cristalino", "reserva_natural"]
  },

  {
    id: "animal-eagle-001",
    species: "Aquila chrysaetos",
    commonName: "Águia",
    emoji: "🦅",
    category: "bird",
    habitat: ["montanha", "penhasco", "floresta"],
    rarity: "rare",
    male: {
      name: "Águia Macho",
      characteristics: ["Menor que a fêmea", "Acrobático"],
      physicalTraits: {
        size: "75-85cm",
        weight: "3-5kg",
        distinctiveFeatures: ["Envergadura 2m", "Visão 8x melhor que humanos"]
      },
      behavior: ["Voos acrobáticos", "Caçador de pequenos mamíferos", "Territorial"],
      reproductiveInfo: "Cortejo aéreo espetacular"
    },
    female: {
      name: "Águia Fêmea",
      characteristics: ["Maior que o macho", "Caçadora superior"],
      physicalTraits: {
        size: "85-95cm",
        weight: "4.5-7kg",
        distinctiveFeatures: ["Maior envergadura", "Garras mais poderosas"]
      },
      behavior: ["Constrói ninhos gigantes", "Caça presas maiores"],
      reproductiveInfo: "Incubação de 45 dias, 1-3 ovos"
    },
    generalInfo: {
      diet: "Carnívoro - mamíferos, aves, peixes",
      lifespan: "20-30 anos",
      size: "Grande",
      weight: "3-7kg",
      behavior: ["Diurno", "Predador apex", "Monogâmico"],
      funFacts: [
        "Enxergam presas a 5km de distância",
        "Mergulham a 300 km/h",
        "Reutilizam ninhos por décadas"
      ]
    },
    discoveryMethod: "observation",
    requiredLevel: 12,
    discoveryLocation: ["pico_montanha", "penhasco_alto"]
  },

  {
    id: "animal-owl-001",
    species: "Bubo bubo",
    commonName: "Coruja",
    emoji: "🦉",
    category: "bird",
    habitat: ["floresta", "campo", "cidade"],
    rarity: "uncommon",
    male: {
      name: "Coruja Macho",
      characteristics: ["Canto territorial", "Menor que a fêmea"],
      physicalTraits: {
        size: "60-75cm",
        weight: "1.5-3kg",
        distinctiveFeatures: ["Olhos frontais", "Audição direcional", "Voo silencioso"]
      },
      behavior: ["Canta para marcar território", "Caça roedores", "Noturno"],
      reproductiveInfo: "Corteja com oferendas de comida"
    },
    female: {
      name: "Coruja Fêmea",
      characteristics: ["Maior", "Mãe dedicada"],
      physicalTraits: {
        size: "65-80cm",
        weight: "2-4kg",
        distinctiveFeatures: ["Maior que o macho", "Cuidado parental intenso"]
      },
      behavior: ["Choca ovos sozinha", "Ensina técnicas de caça"],
      reproductiveInfo: "Incubação de 32-35 dias, 2-5 ovos"
    },
    generalInfo: {
      diet: "Carnívoro - roedores, pequenas aves, insetos",
      lifespan: "15-25 anos",
      size: "Médio-grande",
      weight: "1.5-4kg",
      behavior: ["Noturno", "Predador", "Silencioso"],
      funFacts: [
        "Cabeça gira 270 graus",
        "Voo completamente silencioso",
        "Símbolo de sabedoria"
      ]
    },
    discoveryMethod: "observation",
    requiredLevel: 6,
    discoveryLocation: ["floresta_noturna", "campo_aberto"]
  },

  {
    id: "animal-parrot-001",
    species: "Psittacus erithacus",
    commonName: "Papagaio",
    emoji: "🦜",
    category: "bird",
    habitat: ["floresta_tropical", "selva", "área_urbana"],
    rarity: "uncommon",
    male: {
      name: "Papagaio Macho",
      characteristics: ["Cores mais vibrantes", "Mais vocal"],
      physicalTraits: {
        size: "33-40cm",
        weight: "400-650g",
        distinctiveFeatures: ["Bico curvado forte", "Pés zigodáctilos", "Plumagem colorida"]
      },
      behavior: ["Imitação vocal", "Acrobacias", "Social"],
      reproductiveInfo: "Corteja com displays coloridos"
    },
    female: {
      name: "Papagaia",
      characteristics: ["Cores ligeiramente mais suaves", "Construtora de ninhos"],
      physicalTraits: {
        size: "30-38cm",
        weight: "350-600g",
        distinctiveFeatures: ["Plumagem um pouco menos vibrante"]
      },
      behavior: ["Constrói ninhos em ocos", "Cuidado parental prolongado"],
      reproductiveInfo: "Incubação de 28 dias, 2-4 ovos"
    },
    generalInfo: {
      diet: "Onívoro - frutas, sementes, nozes, flores",
      lifespan: "50-80 anos",
      size: "Médio",
      weight: "350-650g",
      behavior: ["Diurno", "Social", "Inteligente"],
      funFacts: [
        "Inteligência de criança de 5 anos",
        "Podem aprender centenas de palavras",
        "Usam ferramentas"
      ]
    },
    discoveryMethod: "observation",
    requiredLevel: 5,
    discoveryLocation: ["floresta_tropical", "copa_das_árvores"]
  },

  {
    id: "animal-peacock-001",
    species: "Pavo cristatus",
    commonName: "Pavão",
    emoji: "🦚",
    category: "bird",
    habitat: ["floresta", "jardim", "campo_aberto"],
    rarity: "rare",
    male: {
      name: "Pavão Macho",
      characteristics: ["Cauda espetacular", "Display de cortejo"],
      physicalTraits: {
        size: "180-230cm",
        weight: "4-6kg",
        distinctiveFeatures: ["Cauda com ocelos", "Crista azul", "Pescoço iridescente"]
      },
      behavior: ["Display de cauda", "Chamados altos", "Territorial"],
      reproductiveInfo: "Exibe cauda para atrair fêmeas"
    },
    female: {
      name: "Pavoa",
      characteristics: ["Plumagem discreta", "Mãe cuidadosa"],
      physicalTraits: {
        size: "90-100cm",
        weight: "2.75-4kg",
        distinctiveFeatures: ["Plumagem marrom", "Sem cauda ornamental"]
      },
      behavior: ["Escolhe macho pela cauda", "Cuida filhotes sozinha"],
      reproductiveInfo: "Incubação de 28 dias, 4-8 ovos"
    },
    generalInfo: {
      diet: "Onívoro - plantas, insetos, pequenos répteis",
      lifespan: "15-20 anos",
      size: "Grande",
      weight: "2.75-6kg",
      behavior: ["Diurno", "Territorial", "Ornamental"],
      funFacts: [
        "Cauda tem até 200 penas",
        "Símbolo de beleza e orgulho",
        "Podem voar apesar do tamanho"
      ]
    },
    discoveryMethod: "observation",
    requiredLevel: 10,
    discoveryLocation: ["jardim_real", "floresta_aberta"]
  },

  {
    id: "animal-flamingo-001",
    species: "Phoenicopterus roseus",
    commonName: "Flamingo",
    emoji: "🦩",
    category: "bird",
    habitat: ["lago_salgado", "lagoa", "pântano"],
    rarity: "rare",
    male: {
      name: "Flamingo Macho",
      characteristics: ["Ligeiramente maior", "Cor mais intensa"],
      physicalTraits: {
        size: "120-145cm",
        weight: "2-4kg",
        distinctiveFeatures: ["Pescoço curvo", "Bico curvado", "Pernas longas"]
      },
      behavior: ["Dança de cortejo", "Construção de ninhos", "Filtrador"],
      reproductiveInfo: "Dança sincronizada em grupo"
    },
    female: {
      name: "Flamingo Fêmea",
      characteristics: ["Ligeiramente menor", "Mãe dedicada"],
      physicalTraits: {
        size: "115-140cm",
        weight: "1.8-3.5kg",
        distinctiveFeatures: ["Proporções ligeiramente menores"]
      },
      behavior: ["Alimenta filhote com 'leite' do papo", "Cuidado prolongado"],
      reproductiveInfo: "Incubação de 28-32 dias, 1 ovo"
    },
    generalInfo: {
      diet: "Filtrador - algas, crustáceos, moluscos",
      lifespan: "20-30 anos",
      size: "Grande",
      weight: "1.8-4kg",
      behavior: ["Gregário", "Filtrador", "Migratório"],
      funFacts: [
        "Cor vem da alimentação rica em carotenoides",
        "Dormem em pé numa perna só",
        "Vivem em colônias de milhares"
      ]
    },
    discoveryMethod: "observation",
    requiredLevel: 9,
    discoveryLocation: ["lago_salgado", "reserva_aquática"]
  },

  // === PEIXES DE ÁGUA DOCE ===
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
  },

  {
    id: "animal-trout-001",
    species: "Oncorhynchus mykiss",
    commonName: "Truta",
    emoji: "🐟",
    category: "fish_freshwater",
    habitat: ["rio_montanha", "lago_frio", "riacho"],
    rarity: "uncommon",
    male: {
      name: "Truta Macho",
      characteristics: ["Cores mais vibrantes", "Kype durante reprodução"],
      physicalTraits: {
        size: "30-50cm",
        weight: "400-1200g",
        distinctiveFeatures: ["Listras características", "Barbatanas coloridas"]
      },
      behavior: ["Defende território", "Salta obstáculos", "Caça insetos"],
      reproductiveInfo: "Desenvolve cores brilhantes no cio"
    },
    female: {
      name: "Truta Fêmea",
      characteristics: ["Cores mais suaves", "Escava ninhos"],
      physicalTraits: {
        size: "25-45cm",
        weight: "300-1000g",
        distinctiveFeatures: ["Padrões menos contrastantes"]
      },
      behavior: ["Escava redds (ninhos)", "Seleciona cascalho limpo"],
      reproductiveInfo: "Deposita 1000-3000 ovos em cascalho"
    },
    generalInfo: {
      diet: "Carnívoro - insetos, crustáceos, peixes pequenos",
      lifespan: "4-6 anos",
      size: "Médio",
      weight: "300-1200g",
      behavior: ["Saltador", "Territorial", "Indicador de qualidade"],
      funFacts: [
        "Indicadores de água limpa",
        "Podem saltar até 3 metros",
        "Memória de locais de alimentação"
      ]
    },
    discoveryMethod: "fishing",
    requiredLevel: 8,
    discoveryLocation: ["rio_montanha", "corredeira"]
  },

  // === PEIXES DE ÁGUA SALGADA ===
  {
    id: "animal-shark-001",
    species: "Carcharodon carcharias",
    commonName: "Tubarão",
    emoji: "🦈",
    category: "fish_saltwater",
    habitat: ["oceano", "mar_profundo"],
    rarity: "legendary",
    male: {
      name: "Tubarão Macho",
      characteristics: ["Menores que fêmeas", "Mais agressivos"],
      physicalTraits: {
        size: "300-400cm",
        weight: "500-1000kg",
        distinctiveFeatures: ["Dentes serrilhados", "Cartilagem", "Brânquias"]
      },
      behavior: ["Caça solitária", "Migração oceânica", "Predador apex"],
      reproductiveInfo: "Competem por acesso às fêmeas"
    },
    female: {
      name: "Tubarão Fêmea",
      characteristics: ["Maiores", "Gestação longa"],
      physicalTraits: {
        size: "400-600cm",
        weight: "800-2000kg",
        distinctiveFeatures: ["Maior robustez", "Cicatrizes de acasalamento"]
      },
      behavior: ["Migração para berçários", "Cuidado maternal limitado"],
      reproductiveInfo: "Gestação de 11 meses, 2-10 filhotes"
    },
    generalInfo: {
      diet: "Carnívoro - peixes, focas, tartarugas",
      lifespan: "70+ anos",
      size: "Gigante",
      weight: "500-2000kg",
      behavior: ["Predador apex", "Migratório", "Solitário"],
      funFacts: [
        "Existem há 400 milhões de anos",
        "Detectam sangue a quilômetros",
        "Perdem 35.000 dentes na vida"
      ]
    },
    discoveryMethod: "fishing",
    requiredLevel: 25,
    discoveryLocation: ["oceano_profundo", "costa_selvagem"]
  },

  {
    id: "animal-tuna-001",
    species: "Thunnus thynnus",
    commonName: "Atum",
    emoji: "🐟",
    category: "fish_saltwater",
    habitat: ["oceano", "mar_aberto"],
    rarity: "rare",
    male: {
      name: "Atum Macho",
      characteristics: ["Velocidade máxima", "Migrador"],
      physicalTraits: {
        size: "200-250cm",
        weight: "150-250kg",
        distinctiveFeatures: ["Corpo hidrodinâmico", "Barbatanas como foice"]
      },
      behavior: ["Cardumes de caça", "Mergulhos profundos", "Velocidade"],
      reproductiveInfo: "Desova em águas tropicais"
    },
    female: {
      name: "Atum Fêmea",
      characteristics: ["Ligeiramente maior", "Produção de ovos"],
      physicalTraits: {
        size: "220-280cm",
        weight: "180-300kg",
        distinctiveFeatures: ["Abdômen mais robusto"]
      },
      behavior: ["Migração reprodutiva", "Produção milhões de ovos"],
      reproductiveInfo: "Libera milhões de ovos no oceano"
    },
    generalInfo: {
      diet: "Carnívoro - peixes menores, lulas, crustáceos",
      lifespan: "15-30 anos",
      size: "Muito grande",
      weight: "150-300kg",
      behavior: ["Veloz", "Migratório", "Sangue quente"],
      funFacts: [
        "Nadam a 70 km/h",
        "Sangue quente como mamíferos",
        "Migram milhares de quilômetros"
      ]
    },
    discoveryMethod: "fishing",
    requiredLevel: 20,
    discoveryLocation: ["oceano_aberto", "corrente_marinha"]
  },

  // === RÉPTEIS ===
  {
    id: "animal-lizard-001",
    species: "Lacerta agilis",
    commonName: "Lagarto",
    emoji: "🦎",
    category: "reptile",
    habitat: ["deserto", "rocha", "campo_seco"],
    rarity: "common",
    male: {
      name: "Lagarto Macho",
      characteristics: ["Cores mais vibrantes", "Territorial"],
      physicalTraits: {
        size: "15-25cm",
        weight: "20-50g",
        distinctiveFeatures: ["Escamas coloridas", "Crista dorsal", "Cauda longa"]
      },
      behavior: ["Exibições territoriais", "Termorregulação", "Caça insetos"],
      reproductiveInfo: "Corteja com displays coloridos"
    },
    female: {
      name: "Lagarta",
      characteristics: ["Cores mais suaves", "Escava ninhos"],
      physicalTraits: {
        size: "12-20cm",
        weight: "15-40g",
        distinctiveFeatures: ["Padrões menos contrastantes"]
      },
      behavior: ["Escava ninhos na areia", "Cuida ovos"],
      reproductiveInfo: "Deposita 3-12 ovos em areia quente"
    },
    generalInfo: {
      diet: "Insetívoro - moscas, besouros, aranhas",
      lifespan: "5-8 anos",
      size: "Pequeno",
      weight: "15-50g",
      behavior: ["Diurno", "Termorregulador", "Territorial"],
      funFacts: [
        "Regeneram a cauda perdida",
        "Mudam de cor levemente",
        "Terceiro olho no topo da cabeça"
      ]
    },
    discoveryMethod: "hunting",
    requiredLevel: 3,
    discoveryLocation: ["rocha_quente", "deserto_pedregoso"]
  },

  {
    id: "animal-snake-001",
    species: "Python regius",
    commonName: "Cobra",
    emoji: "🐍",
    category: "reptile",
    habitat: ["floresta", "campo", "deserto"],
    rarity: "uncommon",
    male: {
      name: "Cobra Macho",
      characteristics: ["Menor que fêmea", "Mais ativo"],
      physicalTraits: {
        size: "90-120cm",
        weight: "500-1500g",
        distinctiveFeatures: ["Escamas lisas", "Sem patas", "Língua bifurcada"]
      },
      behavior: ["Caça por emboscada", "Constricção", "Rastreamento"],
      reproductiveInfo: "Combate ritual com outros machos"
    },
    female: {
      name: "Cobra Fêmea",
      characteristics: ["Maior", "Choca ovos"],
      physicalTraits: {
        size: "120-180cm",
        weight: "800-2500g",
        distinctiveFeatures: ["Corpo mais robusto"]
      },
      behavior: ["Incuba ovos enrolando-se", "Jejum durante incubação"],
      reproductiveInfo: "Incuba 4-10 ovos por 60 dias"
    },
    generalInfo: {
      diet: "Carnívoro - roedores, aves",
      lifespan: "20-30 anos",
      size: "Médio-grande",
      weight: "500-2500g",
      behavior: ["Noturno", "Constrictor", "Solitário"],
      funFacts: [
        "Sentem vibrações pelo chão",
        "Engolem presas inteiras",
        "Podem jejuar por meses"
      ]
    },
    discoveryMethod: "hunting",
    requiredLevel: 8,
    discoveryLocation: ["floresta_densa", "campo_rochoso"]
  },

  {
    id: "animal-turtle-001",
    species: "Testudo hermanni",
    commonName: "Tartaruga",
    emoji: "🐢",
    category: "reptile",
    habitat: ["campo", "floresta", "jardim"],
    rarity: "uncommon",
    male: {
      name: "Tartaruga Macho",
      characteristics: ["Carapaça mais côncava", "Cauda mais longa"],
      physicalTraits: {
        size: "20-25cm",
        weight: "800-1500g",
        distinctiveFeatures: ["Casco duro", "Patas robustas", "Cabeça retrátil"]
      },
      behavior: ["Combates com outros machos", "Cortejo persistente"],
      reproductiveInfo: "Monta fêmea com dificuldade devido ao casco"
    },
    female: {
      name: "Tartaruga Fêmea",
      characteristics: ["Carapaça mais plana", "Maior"],
      physicalTraits: {
        size: "22-28cm",
        weight: "1000-2000g",
        distinctiveFeatures: ["Casco mais arredondado"]
      },
      behavior: ["Escava ninhos na terra", "Abandona ovos"],
      reproductiveInfo: "Deposita 3-8 ovos enterrados"
    },
    generalInfo: {
      diet: "Herbívoro - plantas, frutas, flores",
      lifespan: "50-80 anos",
      size: "Médio",
      weight: "800-2000g",
      behavior: ["Lento", "Hibernação", "Longevidade"],
      funFacts: [
        "Podem viver mais de 100 anos",
        "Hibernam enterradas",
        "Determinação sexual por temperatura"
      ]
    },
    discoveryMethod: "observation",
    requiredLevel: 4,
    discoveryLocation: ["campo_mediterrâneo", "jardim_antigo"]
  },

  {
    id: "animal-crocodile-001",
    species: "Crocodylus niloticus",
    commonName: "Crocodilo",
    emoji: "🐊",
    category: "reptile",
    habitat: ["rio", "pântano", "lago"],
    rarity: "rare",
    male: {
      name: "Crocodilo Macho",
      characteristics: ["Muito maior", "Extremamente territorial"],
      physicalTraits: {
        size: "400-600cm",
        weight: "225-750kg",
        distinctiveFeatures: ["Mandíbulas poderosas", "Couraça", "Cauda musculosa"]
      },
      behavior: ["Defende território violentamente", "Rugidos intimidadores"],
      reproductiveInfo: "Combate outros machos até a morte"
    },
    female: {
      name: "Crocodila",
      characteristics: ["Menor", "Mãe protetora"],
      physicalTraits: {
        size: "250-350cm",
        weight: "100-250kg",
        distinctiveFeatures: ["Mandíbulas proporcionalmente menores"]
      },
      behavior: ["Constrói ninhos elaborados", "Carrega filhotes na boca"],
      reproductiveInfo: "Deposita 20-80 ovos em ninhos de vegetação"
    },
    generalInfo: {
      diet: "Carnívoro - peixes, mamíferos, aves",
      lifespan: "70-100 anos",
      size: "Gigante",
      weight: "100-750kg",
      behavior: ["Aquático", "Emboscada", "Territorial"],
      funFacts: [
        "Força de mordida de 2 toneladas",
        "Sobreviventes dos dinossauros",
        "Podem ficar 1 ano sem comer"
      ]
    },
    discoveryMethod: "hunting",
    requiredLevel: 22,
    discoveryLocation: ["rio_tropical", "pântano_profundo"]
  },

  // === ANFÍBIOS ===
  {
    id: "animal-frog-001",
    species: "Rana temporaria",
    commonName: "Sapo",
    emoji: "🐸",
    category: "amphibian",
    habitat: ["pântano", "lago", "floresta_úmida"],
    rarity: "common",
    male: {
      name: "Sapo Macho",
      characteristics: ["Coaxar alto", "Sacos vocais"],
      physicalTraits: {
        size: "6-9cm",
        weight: "20-50g",
        distinctiveFeatures: ["Pele úmida", "Patas palmadas", "Língua extensível"]
      },
      behavior: ["Canto territorial", "Amplexo", "Indicador ambiental"],
      reproductiveInfo: "Agarra fêmea durante reprodução aquática"
    },
    female: {
      name: "Sapo Fêmea",
      characteristics: ["Maior", "Produção de ovos"],
      physicalTraits: {
        size: "7-11cm",
        weight: "30-70g",
        distinctiveFeatures: ["Abdômen expandido com ovos"]
      },
      behavior: ["Seleciona locais de desova", "Cuidado parental limitado"],
      reproductiveInfo: "Deposita centenas de ovos em água"
    },
    generalInfo: {
      diet: "Insetívoro - moscas, mosquitos, minhocas",
      lifespan: "4-15 anos",
      size: "Pequeno",
      weight: "20-70g",
      behavior: ["Aquático/terrestre", "Indicador", "Metamorfose"],
      funFacts: [
        "Respiram pela pele",
        "Indicadores de qualidade ambiental",
        "Metamorfose de girino para adulto"
      ]
    },
    discoveryMethod: "observation",
    requiredLevel: 2,
    discoveryLocation: ["lagoa_calma", "pântano_raso"]
  },

  {
    id: "animal-toad-001",
    species: "Bufo bufo",
    commonName: "Sapo-boi",
    emoji: "🐸",
    category: "amphibian",
    habitat: ["jardim", "floresta", "campo_úmido"],
    rarity: "common",
    male: {
      name: "Sapo-boi Macho",
      characteristics: ["Menor", "Calosidades nos dedos"],
      physicalTraits: {
        size: "8-12cm",
        weight: "50-100g",
        distinctiveFeatures: ["Pele verrucosa", "Glândulas parotoides"]
      },
      behavior: ["Migração para reprodução", "Canto em coro"],
      reproductiveInfo: "Agarra fêmea com calosidades especiais"
    },
    female: {
      name: "Sapo-boi Fêmea",
      characteristics: ["Maior", "Carrega macho"],
      physicalTraits: {
        size: "10-15cm",
        weight: "80-150g",
        distinctiveFeatures: ["Corpo mais robusto"]
      },
      behavior: ["Migração longa para água", "Produção massiva de ovos"],
      reproductiveInfo: "Deposita cordões de ovos"
    },
    generalInfo: {
      diet: "Insetívoro - lesmas, minhocas, insetos",
      lifespan: "10-12 anos",
      size: "Médio",
      weight: "50-150g",
      behavior: ["Terrestre", "Migratório", "Noturno"],
      funFacts: [
        "Podem viver longe da água",
        "Toxinas na pele como defesa",
        "Hibernam enterrados"
      ]
    },
    discoveryMethod: "observation",
    requiredLevel: 3,
    discoveryLocation: ["jardim_úmido", "sob_pedras"]
  },

  // === INSETOS ===
  {
    id: "animal-butterfly-001",
    species: "Vanessa atalanta",
    commonName: "Borboleta",
    emoji: "🦋",
    category: "insect",
    habitat: ["jardim", "campo_florido", "floresta"],
    rarity: "common",
    male: {
      name: "Borboleta Macho",
      characteristics: ["Cores mais vibrantes", "Territorial"],
      physicalTraits: {
        size: "5-7cm envergadura",
        weight: "0.3-0.5g",
        distinctiveFeatures: ["Asas coloridas", "Antenas clavadas", "Probóscide"]
      },
      behavior: ["Patrulha território", "Cortejo aéreo", "Busca néctar"],
      reproductiveInfo: "Exibe cores para atrair fêmeas"
    },
    female: {
      name: "Borboleta Fêmea",
      characteristics: ["Cores mais suaves", "Busca plantas hospedeiras"],
      physicalTraits: {
        size: "5.5-8cm envergadura",
        weight: "0.4-0.7g",
        distinctiveFeatures: ["Abdômen mais robusto"]
      },
      behavior: ["Seleciona plantas para ovos", "Polinização"],
      reproductiveInfo: "Deposita ovos em plantas específicas"
    },
    generalInfo: {
      diet: "Nectarívoro - néctar de flores",
      lifespan: "2-5 semanas adulto",
      size: "Pequeno",
      weight: "0.3-0.7g",
      behavior: ["Diurno", "Polinizador", "Metamorfose"],
      funFacts: [
        "Passam por metamorfose completa",
        "Enxergam cores ultravioletas",
        "Algumas migram milhares de km"
      ]
    },
    discoveryMethod: "observation",
    requiredLevel: 1,
    discoveryLocation: ["jardim_florido", "prado"]
  },

  {
    id: "animal-bee-001",
    species: "Apis mellifera",
    commonName: "Abelha",
    emoji: "🐝",
    category: "insect",
    habitat: ["jardim", "campo_florido", "colmeia"],
    rarity: "common",
    male: {
      name: "Zangão",
      characteristics: ["Maior que operárias", "Não possui ferrão"],
      physicalTraits: {
        size: "15-17mm",
        weight: "200-300mg",
        distinctiveFeatures: ["Olhos grandes", "Antenas longas", "Sem ferrão"]
      },
      behavior: ["Acasalamento", "Não trabalha", "Expulso no inverno"],
      reproductiveInfo: "Único propósito é acasalar com rainhas"
    },
    female: {
      name: "Abelha Operária",
      characteristics: ["Trabalhadora", "Possui ferrão"],
      physicalTraits: {
        size: "12-15mm",
        weight: "100mg",
        distinctiveFeatures: ["Corbículas para pólen", "Ferrão com farpa"]
      },
      behavior: ["Coleta néctar", "Constrói favos", "Defende colônia"],
      reproductiveInfo: "Estéril, cuidam da prole da rainha"
    },
    generalInfo: {
      diet: "Nectarívoro - néctar e pólen",
      lifespan: "6 semanas (operária), 2-5 anos (rainha)",
      size: "Pequeno",
      weight: "100-300mg",
      behavior: ["Social", "Polinizador", "Comunicação por dança"],
      funFacts: [
        "Produzem mel e cera",
        "Comunicam-se por dança",
        "Essenciais para agricultura"
      ]
    },
    discoveryMethod: "observation",
    requiredLevel: 1,
    discoveryLocation: ["campo_florido", "colmeia_natural"]
  },

  {
    id: "animal-ant-001",
    species: "Formica rufa",
    commonName: "Formiga",
    emoji: "🐜",
    category: "insect",
    habitat: ["floresta", "jardim", "formigueiro"],
    rarity: "common",
    male: {
      name: "Formiga Macho",
      characteristics: ["Alada", "Reprodutor"],
      physicalTraits: {
        size: "8-12mm",
        weight: "10-20mg",
        distinctiveFeatures: ["Asas temporárias", "Mandíbulas menores"]
      },
      behavior: ["Voo nupcial", "Morre após acasalamento"],
      reproductiveInfo: "Vive apenas para reprodução"
    },
    female: {
      name: "Formiga Operária",
      characteristics: ["Sem asas", "Trabalhadora"],
      physicalTraits: {
        size: "6-10mm",
        weight: "5-15mg",
        distinctiveFeatures: ["Mandíbulas fortes", "Sem asas"]
      },
      behavior: ["Forrageia", "Constrói ninhos", "Cuida larvas"],
      reproductiveInfo: "Estéril, cuidam da prole da rainha"
    },
    generalInfo: {
      diet: "Onívoro - sementes, insetos, néctar",
      lifespan: "1-3 meses (operária), 15 anos (rainha)",
      size: "Muito pequeno",
      weight: "5-20mg",
      behavior: ["Eussocial", "Comunicação química", "Construção"],
      funFacts: [
        "Podem carregar 50x seu peso",
        "Comunicam-se por feromônios",
        "Algumas cultivam fungos"
      ]
    },
    discoveryMethod: "observation",
    requiredLevel: 1,
    discoveryLocation: ["trilha_floresta", "formigueiro"]
  },

  {
    id: "animal-spider-001",
    species: "Araneus diadematus",
    commonName: "Aranha",
    emoji: "🕷️",
    category: "arthropod",
    habitat: ["jardim", "floresta", "casa"],
    rarity: "common",
    male: {
      name: "Aranha Macho",
      characteristics: ["Menor que fêmea", "Cortejo elaborado"],
      physicalTraits: {
        size: "5-10mm",
        weight: "10-50mg",
        distinctiveFeatures: ["Pedipalpos desenvolvidos", "Mais esguio"]
      },
      behavior: ["Cortejo vibracional", "Risco de canibalismo"],
      reproductiveInfo: "Muitas vezes morto pela fêmea após acasalamento"
    },
    female: {
      name: "Aranha Fêmea",
      characteristics: ["Maior", "Constrói teias"],
      physicalTraits: {
        size: "10-20mm",
        weight: "100-500mg",
        distinctiveFeatures: ["Abdômen globoso", "Fiandeiras ativas"]
      },
      behavior: ["Constrói teias orbiculares", "Cuida ovos"],
      reproductiveInfo: "Deposita centenas de ovos em casulos"
    },
    generalInfo: {
      diet: "Carnívoro - insetos presos na teia",
      lifespan: "1 ano",
      size: "Pequeno",
      weight: "10-500mg",
      behavior: ["Construtora", "Predador", "Solitário"],
      funFacts: [
        "Seda mais forte que aço",
        "Sentem vibrações na teia",
        "Algumas podem viver 25 anos"
      ]
    },
    discoveryMethod: "observation",
    requiredLevel: 1,
    discoveryLocation: ["teia_jardim", "canto_escuro"]
  },

  {
    id: "animal-scorpion-001",
    species: "Euscorpius italicus",
    commonName: "Escorpião",
    emoji: "🦂",
    category: "arthropod",
    habitat: ["deserto", "rocha", "caverna"],
    rarity: "uncommon",
    male: {
      name: "Escorpião Macho",
      characteristics: ["Menor", "Pinças mais longas"],
      physicalTraits: {
        size: "3-6cm",
        weight: "1-5g",
        distinctiveFeatures: ["Pinças desenvolvidas", "Cauda com ferrão"]
      },
      behavior: ["Dança do acasalamento", "Territorial"],
      reproductiveInfo: "Dança elaborada segurando pinças da fêmea"
    },
    female: {
      name: "Escorpião Fêmea",
      characteristics: ["Maior", "Carrega filhotes"],
      physicalTraits: {
        size: "4-8cm",
        weight: "2-8g",
        distinctiveFeatures: ["Abdômen mais largo"]
      },
      behavior: ["Carrega filhotes nas costas", "Mais agressiva"],
      reproductiveInfo: "Gestação de 2-18 meses, 6-90 filhotes"
    },
    generalInfo: {
      diet: "Carnívoro - insetos, aranhas",
      lifespan: "2-6 anos",
      size: "Pequeno",
      weight: "1-8g",
      behavior: ["Noturno", "Predador emboscada", "Fluorescente"],
      funFacts: [
        "Brilham sob luz ultravioleta",
        "Podem ficar 1 ano sem comer",
        "Existem há 400 milhões de anos"
      ]
    },
    discoveryMethod: "hunting",
    requiredLevel: 6,
    discoveryLocation: ["rocha_deserto", "caverna_seca"]
  },

  // === CRIATURAS AQUÁTICAS ESPECIAIS ===
  {
    id: "animal-octopus-001",
    species: "Octopus vulgaris",
    commonName: "Polvo",
    emoji: "🐙",
    category: "arthropod",
    habitat: ["oceano", "recife", "caverna_marinha"],
    rarity: "rare",
    male: {
      name: "Polvo Macho",
      characteristics: ["Menor", "Braço reprodutor especializado"],
      physicalTraits: {
        size: "60-100cm",
        weight: "1-3kg",
        distinctiveFeatures: ["Hectocótilo", "8 braços", "Três corações"]
      },
      behavior: ["Cortejo com cores", "Morre após acasalamento"],
      reproductiveInfo: "Transfere esperma com braço modificado"
    },
    female: {
      name: "Polvo Fêmea",
      characteristics: ["Maior", "Cuida ovos até morrer"],
      physicalTraits: {
        size: "80-130cm",
        weight: "2-5kg",
        distinctiveFeatures: ["Maior capacidade craniana"]
      },
      behavior: ["Jejua enquanto cuida ovos", "Morre após eclosão"],
      reproductiveInfo: "Deposita milhares de ovos em cavernas"
    },
    generalInfo: {
      diet: "Carnívoro - crustáceos, peixes, moluscos",
      lifespan: "1-2 anos",
      size: "Médio-grande",
      weight: "1-5kg",
      behavior: ["Solitário", "Inteligente", "Camuflagem"],
      funFacts: [
        "Inteligência excepcional",
        "Podem mudar cor instantaneamente",
        "Usam ferramentas"
      ]
    },
    discoveryMethod: "fishing",
    requiredLevel: 16,
    discoveryLocation: ["recife_coral", "caverna_submarina"]
  },

  {
    id: "animal-jellyfish-001",
    species: "Aurelia aurita",
    commonName: "Água-viva",
    emoji: "🪼",
    category: "arthropod",
    habitat: ["oceano", "mar", "lagoa_salgada"],
    rarity: "uncommon",
    male: {
      name: "Água-viva Macho",
      characteristics: ["Libera esperma na água"],
      physicalTraits: {
        size: "10-40cm",
        weight: "50-200g",
        distinctiveFeatures: ["Umbrela transparente", "Tentáculos urticantes"]
      },
      behavior: ["Deriva com correntes", "Reprodução por liberação"],
      reproductiveInfo: "Libera gametas na coluna d'água"
    },
    female: {
      name: "Água-viva Fêmea",
      characteristics: ["Incuba ovos"],
      physicalTraits: {
        size: "12-45cm",
        weight: "60-250g",
        distinctiveFeatures: ["Gônadas visíveis"]
      },
      behavior: ["Incuba larvas", "Pulsa para locomoção"],
      reproductiveInfo: "Fertilização externa, metamorfose complexa"
    },
    generalInfo: {
      diet: "Carnívoro - plâncton, pequenos peixes",
      lifespan: "6 meses - 2 anos",
      size: "Médio",
      weight: "50-250g",
      behavior: ["Deriva", "Predador passivo", "Regeneração"],
      funFacts: [
        "95% água",
        "Não possuem cérebro",
        "Podem regenerar partes perdidas"
      ]
    },
    discoveryMethod: "observation",
    requiredLevel: 7,
    discoveryLocation: ["costa_oceânica", "mar_calmo"]
  },

  // === CRIATURAS MÍTICAS ===
  {
    id: "animal-unicorn-001",
    species: "Equus unicornis",
    commonName: "Unicórnio",
    emoji: "🦄",
    category: "mythical",
    habitat: ["floresta_encantada", "clareira_mágica"],
    rarity: "legendary",
    male: {
      name: "Unicórnio Macho",
      characteristics: ["Chifre espiralado dourado", "Crina prateada"],
      physicalTraits: {
        size: "140-180cm",
        weight: "200-300kg",
        distinctiveFeatures: ["Chifre único", "Cascos de madrepérola", "Aura luminosa"]
      },
      behavior: ["Extremamente esquivo", "Purifica águas", "Cura feridos"],
      reproductiveInfo: "Acasala apenas sob lua cheia"
    },
    female: {
      name: "Unicórnio Fêmea",
      characteristics: ["Chifre prateado", "Mais delicada"],
      physicalTraits: {
        size: "130-170cm",
        weight: "180-250kg",
        distinctiveFeatures: ["Chifre com brilho lunar", "Crina mais longa"]
      },
      behavior: ["Protege filhotes fiercely", "Aparece apenas para puros de coração"],
      reproductiveInfo: "Gestação de 13 meses lunares"
    },
    generalInfo: {
      diet: "Herbívoro - flores raras, orvalho, luz lunar",
      lifespan: "1000+ anos",
      size: "Grande",
      weight: "180-300kg",
      behavior: ["Mágico", "Puro", "Imortal"],
      funFacts: [
        "Chifre neutraliza venenos",
        "Lágrimas curam qualquer mal",
        "Apenas aparecem para almas puras"
      ]
    },
    discoveryMethod: "special_event",
    requiredLevel: 50,
    discoveryLocation: ["floresta_encantada", "clareira_lunar"]
  },

  {
    id: "animal-dragon-001",
    species: "Draco magnificus",
    commonName: "Dragão",
    emoji: "🐉",
    category: "mythical",
    habitat: ["montanha_vulcânica", "caverna_profunda"],
    rarity: "legendary",
    male: {
      name: "Dragão Macho",
      characteristics: ["Maior", "Sopra fogo mais intenso"],
      physicalTraits: {
        size: "800-1500cm",
        weight: "5000-15000kg",
        distinctiveFeatures: ["Escamas impermeáveis", "Asas gigantes", "Hálito ígneo"]
      },
      behavior: ["Extremamente territorial", "Acumula tesouros", "Voa longas distâncias"],
      reproductiveInfo: "Combate mortal por território e fêmeas"
    },
    female: {
      name: "Dragoa",
      characteristics: ["Ligeiramente menor", "Mãe protetora"],
      physicalTraits: {
        size: "700-1200cm",
        weight: "4000-12000kg",
        distinctiveFeatures: ["Escamas mais suaves", "Chama azulada"]
      },
      behavior: ["Constrói ninhos em vulcões", "Protege ovos por décadas"],
      reproductiveInfo: "Incuba ovos com calor interno por 100 anos"
    },
    generalInfo: {
      diet: "Carnívoro - grandes mamíferos, metais preciosos",
      lifespan: "10000+ anos",
      size: "Colossal",
      weight: "4000-15000kg",
      behavior: ["Territorial", "Inteligente", "Acumulador"],
      funFacts: [
        "Respiram fogo verdadeiro",
        "Inteligência superior aos humanos",
        "Guardiões de tesouros antigos"
      ]
    },
    discoveryMethod: "special_event",
    requiredLevel: 100,
    discoveryLocation: ["vulcão_ativo", "caverna_do_tesouro"]
  },

  {
    id: "animal-phoenix-001",
    species: "Phoenix immortalis",
    commonName: "Fênix",
    emoji: "🔥",
    category: "mythical",
    habitat: ["deserto_ardente", "oásis_sagrado"],
    rarity: "legendary",
    male: {
      name: "Fênix Macho",
      characteristics: ["Plumagem dourada", "Chamas mais intensas"],
      physicalTraits: {
        size: "200-300cm envergadura",
        weight: "15-25kg",
        distinctiveFeatures: ["Penas de fogo", "Olhos como brasas", "Cauda flamejante"]
      },
      behavior: ["Ciclo de renascimento", "Voo solar", "Canto hipnótico"],
      reproductiveInfo: "Renasce das próprias cinzas a cada 500 anos"
    },
    female: {
      name: "Fênix Fêmea",
      characteristics: ["Plumagem vermelha", "Maternal"],
      physicalTraits: {
        size: "180-250cm envergadura",
        weight: "12-20kg",
        distinctiveFeatures: ["Penas carmesim", "Chamas suaves"]
      },
      behavior: ["Cuida ninhos de fogo", "Canto de cura"],
      reproductiveInfo: "Ovos eclodem em chamas sagradas"
    },
    generalInfo: {
      diet: "Energia solar, essências aromáticas",
      lifespan: "Imortal (ciclos de 500 anos)",
      size: "Grande",
      weight: "12-25kg",
      behavior: ["Imortal", "Curador", "Solar"],
      funFacts: [
        "Renasce das próprias cinzas",
        "Lágrimas curam qualquer ferimento",
        "Canto pode ressuscitar mortos"
      ]
    },
    discoveryMethod: "special_event",
    requiredLevel: 75,
    discoveryLocation: ["deserto_sagrado", "pira_eterna"]
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

import { AnimalRegistryEntry } from '../../shared/types/animal-registry-types';

export const ANIMAL_CATEGORIES = [
  { id: 'mammal_small', name: 'Mamíferos Pequenos', emoji: '🐰', description: 'Pequenos mamíferos' },
  { id: 'mammal_medium', name: 'Mamíferos Médios', emoji: '🦌', description: 'Mamíferos de porte médio' },
  { id: 'mammal_large', name: 'Mamíferos Grandes', emoji: '🐻', description: 'Grandes mamíferos' },
  { id: 'bird', name: 'Aves', emoji: '🐦', description: 'Criaturas voadoras com penas' },
  { id: 'fish_freshwater', name: 'Peixes de Água Doce', emoji: '🐟', description: 'Peixes de rios e lagos' },
  { id: 'fish_saltwater', name: 'Peixes de Água Salgada', emoji: '🐠', description: 'Peixes marinhos' },
  { id: 'reptile', name: 'Répteis', emoji: '🦎', description: 'Animais de sangue frio com escamas' },
  { id: 'amphibian', name: 'Anfíbios', emoji: '🐸', description: 'Criaturas que vivem na terra e água' },
  { id: 'insect', name: 'Insetos', emoji: '🦋', description: 'Pequenos artrópodes' },
  { id: 'arthropod', name: 'Artrópodes', emoji: '🦂', description: 'Artrópodes diversos' },
  { id: 'mythical', name: 'Criaturas Míticas', emoji: '🦄', description: 'Seres lendários e mágicos' },
  { id: 'undead', name: 'Mortos-Vivos', emoji: '🧟', description: 'Criaturas sobrenaturais não-mortas' },
  { id: 'supernatural', name: 'Sobrenaturais', emoji: '👻', description: 'Entidades sobrenaturais' },
  { id: 'marine', name: 'Vida Marinha', emoji: '🐙', description: 'Criaturas marinhas diversas' }
];

export function getAnimalsByCategory(category: string): AnimalRegistryEntry[] {
  return ANIMAL_REGISTRY.filter(animal => animal.category === category);
}

export const ANIMAL_REGISTRY: AnimalRegistryEntry[] = [
// CRIATURAS MÍTICAS - DRAGÃO
  {
    id: "dragon-fire-001",
    species: "Dragão de Fogo",
    commonName: "Dragão Vermelho",
    scientificName: "Draco ignis magnificus",
    emoji: "🐉",
    category: "mythical",
    habitat: ["montanha", "vulcão", "caverna"],
    rarity: "legendary",
    male: {
      name: "Dragão de Fogo Macho",
      characteristics: [
        "Escamas vermelhas brilhantes",
        "Chifres dourados impressionantes",
        "Respiração de fogo devastadora"
      ],
      physicalTraits: {
        size: "30-40 metros de comprimento",
        weight: "15-25 toneladas",
        distinctiveFeatures: [
          "Asas membranosas gigantescas",
          "Garras afiadas como espadas",
          "Olhos que brilham como brasas"
        ]
      },
      behavior: [
        "Extremamente territorial",
        "Coleciona tesouros",
        "Voa em grandes altitudes"
      ],
      reproductiveInfo: "Acasala uma vez a cada século, põe 1-3 ovos dourados"
    },
    female: {
      name: "Dragoa de Fogo",
      characteristics: [
        "Escamas ligeiramente mais escuras",
        "Chifres menores mas mais elegantes",
        "Temperamento mais cauteloso"
      ],
      physicalTraits: {
        size: "25-35 metros de comprimento",
        weight: "12-20 toneladas",
        distinctiveFeatures: [
          "Pescoço mais longo e gracioso",
          "Cauda com espinhos defensivos",
          "Olhar mais penetrante"
        ]
      },
      behavior: [
        "Protege ferozmente os ovos",
        "Mais estratégica em combate",
        "Constrói ninhos em locais inacessíveis"
      ],
      reproductiveInfo: "Incuba ovos por 2 anos, cuida dos filhotes por décadas"
    },
    generalInfo: {
      diet: "Carnívoro - grandes mamíferos, ocasionalmente humanos",
      lifespan: "800-1200 anos",
      size: "Colossal - até 40 metros",
      weight: "15-25 toneladas",
      behavior: [
        "Altamente inteligente",
        "Capaz de comunicação telepática",
        "Domina magia elemental"
      ],
      funFacts: [
        "Suas escamas são imunes ao fogo",
        "Podem voar por dias sem descansar",
        "Possuem memória perfeita",
        "Falam múltiplas línguas antigas"
      ]
    },
    discoveryMethod: "special_event",
    requiredLevel: 100,
    discoveryLocation: ["pico_vulcânico", "câmara_tesouro", "portal_dimensional"]
  },

  // MORTOS-VIVOS
  {
    id: "zombie-001",
    species: "Zumbi",
    commonName: "Morto-Vivo Comum",
    emoji: "🧟",
    category: "undead",
    habitat: ["cemitério", "ruínas", "cidade_abandonada"],
    rarity: "uncommon",
    male: {
      name: "Zumbi Macho",
      characteristics: ["Pele em decomposição", "Movimentos lentos", "Gemidos constantes"],
      physicalTraits: {
        size: "1,7-1,8 metros",
        weight: "60-80 kg",
        distinctiveFeatures: ["Olhos esbranquiçados", "Feridas abertas", "Roupas rasgadas"]
      },
      behavior: ["Busca por carne humana", "Anda em grupos", "Ativo principalmente à noite"]
    },
    female: {
      name: "Zumbi Fêmea",
      characteristics: ["Cabelos desgrenhados", "Unhas longas", "Movimentos erráticos"],
      physicalTraits: {
        size: "1,6-1,7 metros",
        weight: "50-70 kg",
        distinctiveFeatures: ["Vestidos rasgados", "Maquiagem borrada", "Expressão vazia"]
      },
      behavior: ["Mais ágil que machos", "Caça em emboscadas", "Emite sons agudos"]
    },
    generalInfo: {
      diet: "Carnívoro - carne humana fresca",
      lifespan: "Indefinido até destruição",
      size: "Humano adulto",
      weight: "50-80 kg",
      behavior: ["Não sente dor", "Movido por fome insaciável", "Infecta através de mordidas"],
      funFacts: ["Criados por vírus desconhecido", "Só morrem com dano cerebral", "Podem detectar vida a distância"]
    },
    discoveryMethod: "hunting",
    requiredLevel: 25,
    discoveryLocation: ["cemitério", "hospital_abandonado", "zona_quarentena"]
  },

  {
    id: "vampire-001",
    species: "Vampiro",
    commonName: "Sanguessuga Noturna",
    emoji: "🧛",
    category: "undead",
    habitat: ["castelo", "cripta", "mansão_antiga"],
    rarity: "rare",
    male: {
      name: "Vampiro Nobre",
      characteristics: ["Pele pálida", "Presas afiadas", "Charme sobrenatural"],
      physicalTraits: {
        size: "1,8-1,9 metros",
        weight: "70-85 kg",
        distinctiveFeatures: ["Capa negra", "Olhos vermelhos", "Sem reflexo"]
      },
      behavior: ["Seduz vítimas", "Transforma em morcego", "Evita luz solar"]
    },
    female: {
      name: "Vampira",
      characteristics: ["Beleza fatal", "Voz hipnótica", "Elegância mortal"],
      physicalTraits: {
        size: "1,7-1,8 metros",
        weight: "55-70 kg",
        distinctiveFeatures: ["Vestido vitoriano", "Cabelos longos", "Jóias antigas"]
      },
      behavior: ["Mais sedutora", "Controla animais noturnos", "Cria servos leais"]
    },
    generalInfo: {
      diet: "Hematófago - sangue humano",
      lifespan: "Imortal",
      size: "Humano adulto",
      weight: "55-85 kg",
      behavior: ["Força sobre-humana", "Regeneração rápida", "Fraqueza à água benta"],
      funFacts: ["Não envelhece", "Pode criar outros vampiros", "Dorme em caixões", "Teme alho e cruzes"]
    },
    discoveryMethod: "special_event",
    requiredLevel: 40,
    discoveryLocation: ["castelo_gótico", "cripta_familiar", "baile_máscaras"]
  },

  // SOBRENATURAIS
  {
    id: "ghost-001",
    species: "Fantasma",
    commonName: "Espírito Errante",
    emoji: "👻",
    category: "supernatural",
    habitat: ["casa_assombrada", "cemitério", "local_traumático"],
    rarity: "uncommon",
    male: {
      name: "Fantasma Masculino",
      characteristics: ["Forma translúcida", "Voz etérea", "Aparições súbitas"],
      physicalTraits: {
        size: "Varia conforme memória",
        weight: "Sem peso físico",
        distinctiveFeatures: ["Brilho azulado", "Atravessa objetos", "Flutuação"]
      },
      behavior: ["Preso ao local da morte", "Busca justiça", "Aparece à meia-noite"]
    },
    female: {
      name: "Fantasma Feminina",
      characteristics: ["Vestido esvoaçante", "Lamento melancólico", "Temperatura gelada"],
      physicalTraits: {
        size: "Forma humana etérea",
        weight: "Imaterial",
        distinctiveFeatures: ["Cabelos ao vento", "Olhos vazios", "Aura sombria"]
      },
      behavior: ["Mais emotiva", "Protege entes queridos", "Manifesta objetos"]
    },
    generalInfo: {
      diet: "Energia espiritual",
      lifespan: "Até encontrar paz",
      size: "Forma humana",
      weight: "Imaterial",
      behavior: ["Atravessa paredes", "Manipula temperatura", "Comunica através de sinais"],
      funFacts: ["Presos por traumas", "Podem possuir objetos", "Visíveis apenas à noite", "Sentem emoções humanas"]
    },
    discoveryMethod: "observation",
    requiredLevel: 15,
    discoveryLocation: ["mansão_vitoriana", "torre_abandonada", "ponte_maldita"]
  },

  {
    id: "demon-001",
    species: "Demônio",
    commonName: "Entidade Infernal",
    emoji: "👹",
    category: "supernatural",
    habitat: ["portal_infernal", "círculo_mágico", "lugar_profano"],
    rarity: "epic",
    male: {
      name: "Demônio Guerreiro",
      characteristics: ["Pele vermelha", "Chifres curvos", "Força descomunal"],
      physicalTraits: {
        size: "2,2-2,5 metros",
        weight: "150-200 kg",
        distinctiveFeatures: ["Asas de morcego", "Garras negras", "Olhos de fogo"]
      },
      behavior: ["Extremamente agressivo", "Faz contratos", "Corrompe almas"]
    },
    female: {
      name: "Demônia Sedutora",
      characteristics: ["Beleza perigosa", "Voz tentadora", "Magia sombria"],
      physicalTraits: {
        size: "1,8-2,0 metros",
        weight: "70-90 kg",
        distinctiveFeatures: ["Chifres elegantes", "Cauda bifurcada", "Aura sombria"]
      },
      behavior: ["Seduz e corrompe", "Mestra em ilusões", "Manipula desejos"]
    },
    generalInfo: {
      diet: "Almas e energia negativa",
      lifespan: "Imortal",
      size: "Gigantesco",
      weight: "70-200 kg",
      behavior: ["Imune ao fogo", "Teletransporte", "Magia das trevas"],
      funFacts: ["Vem de dimensão infernal", "Pode ser banido", "Fala todas as línguas", "Teme símbolos sagrados"]
    },
    discoveryMethod: "special_event",
    requiredLevel: 75,
    discoveryLocation: ["altar_profano", "eclipse_lunar", "invocação_ritual"]
  },

  {
    id: "angel-001",
    species: "Anjo",
    commonName: "Ser Celestial",
    emoji: "👼",
    category: "supernatural",
    habitat: ["templo", "lugar_sagrado", "céu"],
    rarity: "legendary",
    male: {
      name: "Anjo Guerreiro",
      characteristics: ["Luz dourada", "Asas brancas", "Espada flamejante"],
      physicalTraits: {
        size: "2,0-2,3 metros",
        weight: "Etéreo",
        distinctiveFeatures: ["Auréola brilhante", "Armadura dourada", "Olhos azuis"]
      },
      behavior: ["Protege inocentes", "Luta contra o mal", "Traz mensagens divinas"]
    },
    female: {
      name: "Anjo da Guarda",
      characteristics: ["Presença pacífica", "Voz melodiosa", "Cura milagrosa"],
      physicalTraits: {
        size: "1,7-1,9 metros",
        weight: "Sem peso",
        distinctiveFeatures: ["Vestimentas brancas", "Cabelos dourados", "Aura sagrada"]
      },
      behavior: ["Cura ferimentos", "Guia perdidos", "Protege crianças"]
    },
    generalInfo: {
      diet: "Energia divina",
      lifespan: "Imortal",
      size: "Humano alto",
      weight: "Etéreo",
      behavior: ["Voo celestial", "Magia da luz", "Banimento de demônios"],
      funFacts: ["Servos divinos", "Falam línguas celestiais", "Podem se tornar invisíveis", "Trazem boa sorte"]
    },
    discoveryMethod: "special_event",
    requiredLevel: 90,
    discoveryLocation: ["catedral_antiga", "local_milagre", "momento_desespero"]
  },

  // VIDA MARINHA EXÓTICA
  {
    id: "octopus-001",
    species: "Polvo Gigante",
    commonName: "Kraken Menor",
    emoji: "🐙",
    category: "marine",
    habitat: ["oceano_profundo", "caverna_submarina", "abismo"],
    rarity: "rare",
    male: {
      name: "Polvo Macho",
      characteristics: ["8 tentáculos poderosos", "Ventosas enormes", "Capacidade de camuflagem"],
      physicalTraits: {
        size: "15-20 metros de envergadura",
        weight: "800-1200 kg",
        distinctiveFeatures: ["Olhos gigantes", "Bico córneo", "Pele mutável"]
      },
      behavior: ["Extremamente inteligente", "Constrói abrigos", "Caça emboscadas"]
    },
    female: {
      name: "Polvo Fêmea",
      characteristics: ["Maior que o macho", "Mais agressiva", "Protege ovos"],
      physicalTraits: {
        size: "20-25 metros de envergadura",
        weight: "1000-1500 kg",
        distinctiveFeatures: ["Tentáculos mais grossos", "Cores mais vibrantes", "Cicatrizes de batalha"]
      },
      behavior: ["Mãe dedicada", "Território bem definido", "Memória excepcional"]
    },
    generalInfo: {
      diet: "Carnívoro - peixes, crustáceos, ocasionalmente navios pequenos",
      lifespan: "80-120 anos",
      size: "Gigantesco",
      weight: "800-1500 kg",
      behavior: ["Resolve quebra-cabeças", "Usa ferramentas", "Comunica por cores"],
      funFacts: ["Tem 3 corações", "Sangue azul", "Pode regenerar tentáculos", "Lendas marinhas"]
    },
    discoveryMethod: "fishing",
    requiredLevel: 50,
    discoveryLocation: ["fossa_oceânica", "naufrágio_antigo", "corrente_profunda"]
  },

  {
    id: "mermaid-001",
    species: "Sereia",
    commonName: "Donzela do Mar",
    emoji: "🧜‍♀️",
    category: "mythical",
    habitat: ["recife_coral", "lagoa_cristalina", "caverna_submarina"],
    rarity: "epic",
    male: {
      name: "Tritão",
      characteristics: ["Torso humano musculoso", "Cauda de peixe azul", "Barba algas"],
      physicalTraits: {
        size: "2,0-2,5 metros de comprimento",
        weight: "80-120 kg",
        distinctiveFeatures: ["Tridente dourado", "Escamas brilhantes", "Guelras laterais"]
      },
      behavior: ["Guardião dos oceanos", "Controla marés", "Comunica com vida marinha"]
    },
    female: {
      name: "Sereia",
      characteristics: ["Beleza hipnótica", "Voz encantadora", "Cabelos flutuantes"],
      physicalTraits: {
        size: "1,8-2,2 metros de comprimento",
        weight: "60-90 kg",
        distinctiveFeatures: ["Cauda colorida", "Conchas no cabelo", "Pele nacarada"]
      },
      behavior: ["Canta para marinheiros", "Salva náufragos", "Coleciona tesouros"]
    },
    generalInfo: {
      diet: "Onívoro - algas, peixes, frutos do mar",
      lifespan: "300-500 anos",
      size: "Humano alongado",
      weight: "60-120 kg",
      behavior: ["Respiração aquática", "Velocidade de natação incrível", "Magia aquática"],
      funFacts: ["Lendas dos marinheiros", "Podem viver em terra por curtos períodos", "Guardiãs de tesouros submersos"]
    },
    discoveryMethod: "observation",
    requiredLevel: 60,
    discoveryLocation: ["lua_cheia_sobre_mar", "tempestade_calma", "navio_perdido"]
  },

  // CRIATURAS FANTÁSTICAS ADICIONAIS
  {
    id: "phoenix-001",
    species: "Fênix",
    commonName: "Pássaro Imortal",
    emoji: "🔥🦅",
    category: "mythical",
    habitat: ["vulcão_ativo", "templo_fogo", "ninho_cinzas"],
    rarity: "legendary",
    male: {
      name: "Fênix Dourado",
      characteristics: ["Plumas douradas", "Fogo eterno", "Canto celestial"],
      physicalTraits: {
        size: "3-4 metros de envergadura",
        weight: "25-35 kg",
        distinctiveFeatures: ["Crista flamejante", "Olhos como rubis", "Cauda de fogo"]
      },
      behavior: ["Renasce das cinzas", "Voo majestoso", "Cura com lágrimas"]
    },
    female: {
      name: "Fênix Vermelha",
      characteristics: ["Plumas carmesim", "Chamas mais intensas", "Maternidade eterna"],
      physicalTraits: {
        size: "3,5-4,5 metros de envergadura",
        weight: "30-40 kg",
        distinctiveFeatures: ["Bico dourado", "Garras de cristal", "Aura ardente"]
      },
      behavior: ["Protege ninhos sagrados", "Ciclo de 500 anos", "Profetiza eventos"]
    },
    generalInfo: {
      diet: "Energia solar e fogo",
      lifespan: "Imortal - ciclos de 500 anos",
      size: "Águia gigante",
      weight: "25-40 kg",
      behavior: ["Imune ao fogo", "Ressurreição cíclica", "Purificação espiritual"],
      funFacts: ["Símbolo de renascimento", "Lágrimas curam qualquer ferimento", "Apenas uma existe por vez"]
    },
    discoveryMethod: "special_event",
    requiredLevel: 95,
    discoveryLocation: ["erupção_vulcânica", "eclipse_solar", "templo_destruído"]
  },

  {
    id: "centaur-001",
    species: "Centauro",
    commonName: "Meio-Homem Meio-Cavalo",
    emoji: "🏹🐎",
    category: "mythical",
    habitat: ["floresta_antiga", "pradaria", "clareira_mágica"],
    rarity: "rare",
    male: {
      name: "Centauro Guerreiro",
      characteristics: ["Torso humano forte", "Corpo de cavalo", "Arqueiro expert"],
      physicalTraits: {
        size: "2,2 metros de altura total",
        weight: "300-400 kg",
        distinctiveFeatures: ["Arco élfico", "Cicatrizes de batalha", "Barba selvagem"]
      },
      behavior: ["Protetor da floresta", "Nômade tribal", "Sábio ancião"]
    },
    female: {
      name: "Centaura",
      characteristics: ["Elegância natural", "Conexão com plantas", "Curandeira tribal"],
      physicalTraits: {
        size: "2,0 metros de altura total",
        weight: "280-350 kg",
        distinctiveFeatures: ["Cabelos ornamentados", "Flores entrelaçadas", "Olhar compassivo"]
      },
      behavior: ["Xamã da tribo", "Domestica animais", "Profetisa natural"]
    },
    generalInfo: {
      diet: "Onívoro - vegetais, frutas, ocasionalmente carne",
      lifespan: "150-200 anos",
      size: "Cavalo com torso humano",
      weight: "280-400 kg",
      behavior: ["Velocidade de galope", "Tiro certeiro", "Sabedoria ancestral"],
      funFacts: ["Mestres da caça", "Conhecem segredos da floresta", "Falam com animais", "Temem civilização"]
    },
    discoveryMethod: "observation",
    requiredLevel: 35,
    discoveryLocation: ["bosque_sagrado", "campo_flores", "nascente_cristalina"]
  },

  {
    id: "minotaur-001",
    species: "Minotauro",
    commonName: "Touro Humanoide",
    emoji: "🐂👤",
    category: "mythical",
    habitat: ["labirinto", "caverna", "ruínas_antigas"],
    rarity: "epic",
    male: {
      name: "Minotauro Guardião",
      characteristics: ["Cabeça de touro", "Corpo humano gigante", "Força brutal"],
      physicalTraits: {
        size: "2,5-3,0 metros",
        weight: "200-300 kg",
        distinctiveFeatures: ["Chifres afiados", "Machado gigante", "Músculos possantes"]
      },
      behavior: ["Guarda tesouros", "Ódio de invasores", "Perdido em labirintos"]
    },
    female: {
      name: "Minotaura",
      characteristics: ["Menos agressiva", "Mais inteligente", "Maternal com filhotes"],
      physicalTraits: {
        size: "2,2-2,7 metros",
        weight: "150-250 kg",
        distinctiveFeatures: ["Chifres menores", "Força concentrada", "Olhar astuto"]
      },
      behavior: ["Constrói labirintos", "Protege território", "Resolve enigmas"]
    },
    generalInfo: {
      diet: "Onívoro - prefere carne",
      lifespan: "200-300 anos",
      size: "Gigante humanoide",
      weight: "150-300 kg",
      behavior: ["Força sobre-humana", "Senso de direção perfeito", "Resistência extrema"],
      funFacts: ["Presos em labirintos", "Guardiões de segredos antigos", "Temem espaços abertos"]
    },
    discoveryMethod: "hunting",
    requiredLevel: 55,
    discoveryLocation: ["ruínas_gregas", "labirinto_subterrâneo", "templo_abandonado"]
  }];
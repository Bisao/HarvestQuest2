
// Animal Registry System - Comprehensive animal data for the game
export interface AnimalData {
  id: string;
  name: string;
  emoji: string;
  category: 'mammal' | 'bird' | 'aquatic' | 'insect' | 'reptile' | 'amphibian' | 'mythical';
  subcategory: string;
  habitat: string[];
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  size: 'tiny' | 'small' | 'medium' | 'large' | 'huge';
  behavior: string;
  description: string;
  discoveredAt?: string; // When player first encountered
  encounterCount: number;
  lastSeen?: string;
  isDiscovered: boolean;
  huntable?: boolean;
  tameable?: boolean;
  products?: string[]; // What resources they provide
  requiredTool?: string;
  experienceReward?: number;
  seasonality?: string[];
  timeOfDay?: string[];
  facts: string[];
}

export const ANIMAL_REGISTRY: AnimalData[] = [
  // MAMÍFEROS DOMÉSTICOS
  {
    id: "dog",
    name: "Cachorro",
    emoji: "🐶",
    category: "mammal",
    subcategory: "domestic",
    habitat: ["village", "camp"],
    rarity: "common",
    size: "medium",
    behavior: "Leal e protetor",
    description: "Companheiro fiel do homem, excelente para guarda e companhia.",
    encounterCount: 0,
    isDiscovered: false,
    tameable: true,
    products: ["companionship", "protection"],
    facts: [
      "Podem detectar perigos antes dos humanos",
      "Leais até a morte",
      "Excelentes caçadores quando treinados"
    ]
  },
  {
    id: "cat",
    name: "Gato",
    emoji: "🐱",
    category: "mammal",
    subcategory: "domestic",
    habitat: ["village", "camp"],
    rarity: "common",
    size: "small",
    behavior: "Independente e caçador",
    description: "Felino doméstico, excelente caçador de pequenos roedores.",
    encounterCount: 0,
    isDiscovered: false,
    tameable: true,
    products: ["pest_control", "companionship"],
    facts: [
      "Podem ver no escuro",
      "Mantêm o acampamento livre de ratos",
      "Dormem 12-16 horas por dia"
    ]
  },
  {
    id: "rabbit",
    name: "Coelho",
    emoji: "🐰",
    category: "mammal",
    subcategory: "small_game",
    habitat: ["forest", "meadow", "plains"],
    rarity: "common",
    size: "small",
    behavior: "Tímido e rápido",
    description: "Pequeno mamífero herbívoro, fonte de carne e pelo macio.",
    encounterCount: 0,
    isDiscovered: false,
    huntable: true,
    products: ["meat", "fur", "leather"],
    requiredTool: "knife",
    experienceReward: 5,
    seasonality: ["spring", "summer", "autumn"],
    timeOfDay: ["dawn", "dusk"],
    facts: [
      "Podem correr até 50 km/h",
      "Têm dentes que crescem continuamente",
      "Comunicam-se batendo as patas traseiras"
    ]
  },

  // MAMÍFEROS SELVAGENS
  {
    id: "deer",
    name: "Veado",
    emoji: "🦌",
    category: "mammal",
    subcategory: "medium_game",
    habitat: ["forest", "meadow"],
    rarity: "uncommon",
    size: "large",
    behavior: "Cauteloso e elegante",
    description: "Majestoso cervídeo, fonte valiosa de carne e couro de qualidade.",
    encounterCount: 0,
    isDiscovered: false,
    huntable: true,
    products: ["meat", "leather", "antlers"],
    requiredTool: "weapon_and_knife",
    experienceReward: 8,
    seasonality: ["spring", "summer", "autumn"],
    timeOfDay: ["dawn", "dusk"],
    facts: [
      "Machos possuem chifres que renovam anualmente",
      "Podem saltar até 3 metros de altura",
      "Vivem em grupos familiares"
    ]
  },
  {
    id: "wolf",
    name: "Lobo",
    emoji: "🐺",
    category: "mammal",
    subcategory: "predator",
    habitat: ["forest", "mountain", "tundra"],
    rarity: "rare",
    size: "large",
    behavior: "Territorial e em matilha",
    description: "Predador apex que caça em grupos organizados.",
    encounterCount: 0,
    isDiscovered: false,
    huntable: true,
    products: ["meat", "fur", "fangs"],
    requiredTool: "weapon_and_knife",
    experienceReward: 15,
    seasonality: ["winter", "autumn"],
    timeOfDay: ["night", "dawn"],
    facts: [
      "Vivem em matilhas hierárquicas",
      "Podem percorrer 20km por dia",
      "Comunicam-se através de uivos"
    ]
  },
  {
    id: "bear",
    name: "Urso",
    emoji: "🐻",
    category: "mammal",
    subcategory: "large_predator",
    habitat: ["forest", "mountain"],
    rarity: "rare",
    size: "huge",
    behavior: "Solitário e territorial",
    description: "Poderoso omnívoro, extremamente perigoso quando provocado.",
    encounterCount: 0,
    isDiscovered: false,
    huntable: true,
    products: ["meat", "fur", "claws"],
    requiredTool: "weapon_and_knife",
    experienceReward: 25,
    seasonality: ["spring", "summer", "autumn"],
    timeOfDay: ["day", "dawn", "dusk"],
    facts: [
      "Podem correr até 60 km/h",
      "Hibernam durante o inverno",
      "Têm um olfato 7x melhor que cães"
    ]
  },

  // AVES
  {
    id: "chicken",
    name: "Galinha",
    emoji: "🐔",
    category: "bird",
    subcategory: "domestic",
    habitat: ["farm", "camp"],
    rarity: "common",
    size: "small",
    behavior: "Sociável e produtiva",
    description: "Ave doméstica que fornece ovos e carne regularmente.",
    encounterCount: 0,
    isDiscovered: false,
    tameable: true,
    products: ["eggs", "meat", "feathers"],
    facts: [
      "Podem voar pequenas distâncias",
      "Botam ovos quase diariamente",
      "Reconhecem até 100 faces diferentes"
    ]
  },
  {
    id: "eagle",
    name: "Águia",
    emoji: "🦅",
    category: "bird",
    subcategory: "bird_of_prey",
    habitat: ["mountain", "cliff"],
    rarity: "rare",
    size: "large",
    behavior: "Majestosa e territorial",
    description: "Predador aéreo com visão excepcional e voo poderoso.",
    encounterCount: 0,
    isDiscovered: false,
    huntable: true,
    products: ["meat", "feathers", "talons"],
    requiredTool: "bow_or_crossbow",
    experienceReward: 12,
    timeOfDay: ["day"],
    facts: [
      "Podem ver presas a 3km de distância",
      "Voam a altitudes de até 6.000m",
      "Símbolo de poder em muitas culturas"
    ]
  },

  // VIDA AQUÁTICA
  {
    id: "small_fish",
    name: "Peixe Pequeno",
    emoji: "🐟",
    category: "aquatic",
    subcategory: "freshwater_fish",
    habitat: ["river", "lake"],
    rarity: "common",
    size: "small",
    behavior: "Nadador em cardumes",
    description: "Pequeno peixe comum em rios e lagos, fácil de pescar.",
    encounterCount: 0,
    isDiscovered: false,
    huntable: true,
    products: ["meat", "scales"],
    requiredTool: "fishing_rod",
    experienceReward: 2,
    seasonality: ["spring", "summer"],
    facts: [
      "Vivem em grandes cardumes",
      "Servem de alimento para peixes maiores",
      "Indicadores da qualidade da água"
    ]
  },
  {
    id: "shark",
    name: "Tubarão",
    emoji: "🦈",
    category: "aquatic",
    subcategory: "ocean_predator",
    habitat: ["ocean", "deep_sea"],
    rarity: "legendary",
    size: "huge",
    behavior: "Predador apex marinho",
    description: "Antigo predador dos oceanos, perigoso e majestoso.",
    encounterCount: 0,
    isDiscovered: false,
    huntable: true,
    products: ["meat", "teeth", "oil"],
    requiredTool: "harpoon",
    experienceReward: 30,
    facts: [
      "Existem há mais de 400 milhões de anos",
      "Podem detectar sangue a quilômetros",
      "Perdem milhares de dentes durante a vida"
    ]
  },

  // INSETOS
  {
    id: "butterfly",
    name: "Borboleta",
    emoji: "🦋",
    category: "insect",
    subcategory: "flying_insect",
    habitat: ["garden", "meadow", "forest"],
    rarity: "common",
    size: "tiny",
    behavior: "Delicada e polinizadora",
    description: "Belo inseto que auxilia na polinização das plantas.",
    encounterCount: 0,
    isDiscovered: false,
    products: ["silk", "beauty"],
    seasonality: ["spring", "summer"],
    timeOfDay: ["day"],
    facts: [
      "Passam por metamorfose completa",
      "Podem migrar milhares de quilômetros",
      "Veem cores ultravioletas"
    ]
  },
  {
    id: "bee",
    name: "Abelha",
    emoji: "🐝",
    category: "insect",
    subcategory: "beneficial_insect",
    habitat: ["garden", "meadow", "forest"],
    rarity: "common",
    size: "tiny",
    behavior: "Trabalhadora e social",
    description: "Inseto vital para o ecossistema, produz mel e poliniza plantas.",
    encounterCount: 0,
    isDiscovered: false,
    tameable: true,
    products: ["honey", "wax", "pollen"],
    seasonality: ["spring", "summer", "autumn"],
    timeOfDay: ["day"],
    facts: [
      "Visitam até 5.000 flores por dia",
      "Comunicam-se através de danças",
      "Essenciais para a agricultura"
    ]
  },

  // CRIATURAS MÍTICAS
  {
    id: "unicorn",
    name: "Unicórnio",
    emoji: "🦄",
    category: "mythical",
    subcategory: "legendary_beast",
    habitat: ["enchanted_forest", "sacred_grove"],
    rarity: "legendary",
    size: "large",
    behavior: "Puro e esquivo",
    description: "Criatura lendária de beleza incomparável e poderes mágicos.",
    encounterCount: 0,
    isDiscovered: false,
    products: ["magic_essence", "healing_horn"],
    experienceReward: 100,
    seasonality: ["spring"],
    timeOfDay: ["dawn", "moonlight"],
    facts: [
      "Símbolo de pureza e magia",
      "Apenas os puros de coração podem vê-los",
      "Seu chifre tem propriedades curativas"
    ]
  }
];

// Utility functions for animal registry
export function getAnimalsByCategory(category: AnimalData['category']): AnimalData[] {
  return ANIMAL_REGISTRY.filter(animal => animal.category === category);
}

export function getDiscoveredAnimals(playerAnimals: string[]): AnimalData[] {
  return ANIMAL_REGISTRY.filter(animal => playerAnimals.includes(animal.id));
}

export function getAnimalById(id: string): AnimalData | undefined {
  return ANIMAL_REGISTRY.find(animal => animal.id === id);
}

export function getAnimalsByHabitat(habitat: string): AnimalData[] {
  return ANIMAL_REGISTRY.filter(animal => animal.habitat.includes(habitat));
}

export function getHuntableAnimals(): AnimalData[] {
  return ANIMAL_REGISTRY.filter(animal => animal.huntable);
}

export function getTameableAnimals(): AnimalData[] {
  return ANIMAL_REGISTRY.filter(animal => animal.tameable);
}

export const ANIMAL_CATEGORIES = [
  { id: 'mammal', name: 'Mamíferos', emoji: '🐾', description: 'Animais de sangue quente com pelos' },
  { id: 'bird', name: 'Aves', emoji: '🐦', description: 'Criaturas voadoras com penas' },
  { id: 'aquatic', name: 'Vida Aquática', emoji: '🐟', description: 'Criaturas que vivem na água' },
  { id: 'insect', name: 'Insetos', emoji: '🦋', description: 'Pequenos artrópodes' },
  { id: 'reptile', name: 'Répteis', emoji: '🦎', description: 'Animais de sangue frio com escamas' },
  { id: 'amphibian', name: 'Anfíbios', emoji: '🐸', description: 'Criaturas que vivem na terra e água' },
  { id: 'mythical', name: 'Criaturas Míticas', emoji: '🦄', description: 'Seres lendários e mágicos' }
] as const;

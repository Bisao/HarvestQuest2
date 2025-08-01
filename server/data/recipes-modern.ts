
/**
 * RECEITAS MODERNAS - SISTEMA COMPLETO ATUALIZADO
 * 
 * Sistema completo de receitas com todos os novos materiais e componentes.
 * Inclui receitas para todos os itens expandidos e novos equipamentos.
 */

import { RESOURCE_IDS, EQUIPMENT_IDS, RECIPE_IDS } from '@shared/constants/game-ids';

export interface ModernRecipe {
  id: string;
  name: string;
  description: string;
  category: string;
  
  // Ingredientes necessários
  ingredients: Array<{
    itemId: string;
    quantity: number;
    optional?: boolean;
  }>;
  
  // Produtos gerados
  outputs: Array<{
    itemId: string;
    quantity: number;
    probability?: number;
  }>;
  
  // Requisitos
  requiredLevel?: number;
  requiredWorkshop?: 'basic' | 'advanced' | 'forge' | 'loom' | 'tannery';
  requiredTool?: string;
  
  // Custos e benefícios
  craftingTime: number; // em segundos
  experienceGained: number;
  energyCost?: number;
  
  // Metadados
  tags: string[];
  unlockConditions?: string[];
}

/**
 * RECEITAS DE MATERIAIS BÁSICOS
 */
export const BASIC_MATERIAL_RECIPES: ModernRecipe[] = [
  {
    id: RECIPE_IDS.BARBANTE,
    name: "Barbante",
    description: "Transforma fibras em barbante útil.",
    category: "basic_materials",
    ingredients: [
      { itemId: RESOURCE_IDS.FIBRA, quantity: 3 }
    ],
    outputs: [
      { itemId: RESOURCE_IDS.BARBANTE, quantity: 1 }
    ],
    craftingTime: 5,
    experienceGained: 2,
    tags: ["basic", "string", "utility"],
    requiredWorkshop: "basic"
  },
  {
    id: RECIPE_IDS.CORDA_RESISTENTE,
    name: "Corda Resistente",
    description: "Combina barbante e fibras especiais para criar corda forte.",
    category: "advanced_materials",
    ingredients: [
      { itemId: RESOURCE_IDS.BARBANTE, quantity: 4 },
      { itemId: RESOURCE_IDS.CANAMO, quantity: 2 }
    ],
    outputs: [
      { itemId: RESOURCE_IDS.CORDA_RESISTENTE, quantity: 1 }
    ],
    requiredLevel: 3,
    craftingTime: 15,
    experienceGained: 8,
    tags: ["rope", "strong", "utility"],
    requiredWorkshop: "advanced"
  },
  {
    id: RECIPE_IDS.COURO_CURTIDO,
    name: "Couro Curtido",
    description: "Processa couro bruto em material utilizável.",
    category: "leather_working",
    ingredients: [
      { itemId: RESOURCE_IDS.COURO, quantity: 1 },
      { itemId: RESOURCE_IDS.AGUA_FRESCA, quantity: 2 }
    ],
    outputs: [
      { itemId: RESOURCE_IDS.COURO_CURTIDO, quantity: 1 }
    ],
    requiredLevel: 2,
    craftingTime: 30,
    experienceGained: 10,
    tags: ["leather", "processing", "armor"],
    requiredWorkshop: "tannery"
  }
];

/**
 * RECEITAS DE COMPONENTES DE EQUIPAMENTOS
 */
export const COMPONENT_RECIPES: ModernRecipe[] = [
  // Cabos e Hastes
  {
    id: RECIPE_IDS.CABO_MACHADO,
    name: "Cabo de Machado",
    description: "Esculpe madeira em cabo ergonômico para machado.",
    category: "weapon_components",
    ingredients: [
      { itemId: RESOURCE_IDS.MADEIRA, quantity: 2 },
      { itemId: RESOURCE_IDS.BARBANTE, quantity: 1 }
    ],
    outputs: [
      { itemId: RESOURCE_IDS.CABO_MACHADO, quantity: 1 }
    ],
    requiredLevel: 1,
    craftingTime: 10,
    experienceGained: 5,
    tags: ["component", "handle", "axe"],
    requiredWorkshop: "basic"
  },
  {
    id: RECIPE_IDS.CABO_ESPADA,
    name: "Cabo de Espada",
    description: "Cria empunhadura especializada para espadas.",
    category: "weapon_components",
    ingredients: [
      { itemId: RESOURCE_IDS.MADEIRA_CARVALHO, quantity: 1 },
      { itemId: RESOURCE_IDS.COURO_CURTIDO, quantity: 1 },
      { itemId: RESOURCE_IDS.BARBANTE, quantity: 2 }
    ],
    outputs: [
      { itemId: RESOURCE_IDS.CABO_ESPADA, quantity: 1 }
    ],
    requiredLevel: 3,
    craftingTime: 20,
    experienceGained: 12,
    tags: ["component", "handle", "sword"],
    requiredWorkshop: "advanced"
  },
  {
    id: RECIPE_IDS.CABO_PICARETA,
    name: "Cabo de Picareta",
    description: "Cabo reforçado para suportar o peso de cabeças de picareta.",
    category: "tool_components",
    ingredients: [
      { itemId: RESOURCE_IDS.MADEIRA, quantity: 2 },
      { itemId: RESOURCE_IDS.CORDA_RESISTENTE, quantity: 1 }
    ],
    outputs: [
      { itemId: RESOURCE_IDS.CABO_PICARETA, quantity: 1 }
    ],
    requiredLevel: 2,
    craftingTime: 15,
    experienceGained: 8,
    tags: ["component", "handle", "pickaxe"],
    requiredWorkshop: "basic"
  },

  // Cabeças e Lâminas
  {
    id: RECIPE_IDS.CABECA_MACHADO,
    name: "Cabeça de Machado",
    description: "Forja lâmina de ferro em cabeça de machado eficiente.",
    category: "weapon_components",
    ingredients: [
      { itemId: RESOURCE_IDS.BARRA_FERRO, quantity: 2 },
      { itemId: RESOURCE_IDS.CARVAO, quantity: 1 }
    ],
    outputs: [
      { itemId: RESOURCE_IDS.CABECA_MACHADO, quantity: 1 }
    ],
    requiredLevel: 3,
    craftingTime: 25,
    experienceGained: 15,
    tags: ["component", "blade", "axe"],
    requiredWorkshop: "forge"
  },
  {
    id: RECIPE_IDS.LAMINA_ESPADA,
    name: "Lâmina de Espada",
    description: "Forja lâmina afiada e equilibrada para espadas.",
    category: "weapon_components",
    ingredients: [
      { itemId: RESOURCE_IDS.BARRA_FERRO, quantity: 3 },
      { itemId: RESOURCE_IDS.CARVAO, quantity: 2 },
      { itemId: RESOURCE_IDS.PEDRA_AMOLAR, quantity: 1 }
    ],
    outputs: [
      { itemId: RESOURCE_IDS.LAMINA_ESPADA, quantity: 1 }
    ],
    requiredLevel: 4,
    craftingTime: 40,
    experienceGained: 25,
    tags: ["component", "blade", "sword"],
    requiredWorkshop: "forge"
  },
  {
    id: RECIPE_IDS.CABECA_PICARETA,
    name: "Cabeça de Picareta",
    description: "Forja cabeça resistente para mineração.",
    category: "tool_components",
    ingredients: [
      { itemId: RESOURCE_IDS.BARRA_FERRO, quantity: 2 },
      { itemId: RESOURCE_IDS.CARVAO, quantity: 1 }
    ],
    outputs: [
      { itemId: RESOURCE_IDS.CABECA_PICARETA, quantity: 1 }
    ],
    requiredLevel: 3,
    craftingTime: 30,
    experienceGained: 18,
    tags: ["component", "head", "pickaxe"],
    requiredWorkshop: "forge"
  }
];

/**
 * RECEITAS DE EQUIPAMENTOS COMPLETOS
 */
export const EQUIPMENT_RECIPES: ModernRecipe[] = [
  // Ferramentas Básicas
  {
    id: RECIPE_IDS.MACHADO,
    name: "Machado",
    description: "Combina cabo e cabeça para criar machado funcional.",
    category: "tools",
    ingredients: [
      { itemId: RESOURCE_IDS.CABO_MACHADO, quantity: 1 },
      { itemId: RESOURCE_IDS.CABECA_MACHADO, quantity: 1 },
      { itemId: RESOURCE_IDS.CORDA_RESISTENTE, quantity: 1 }
    ],
    outputs: [
      { itemId: EQUIPMENT_IDS.MACHADO, quantity: 1 }
    ],
    requiredLevel: 2,
    craftingTime: 35,
    experienceGained: 20,
    tags: ["tool", "axe", "chopping"],
    requiredWorkshop: "advanced"
  },
  {
    id: RECIPE_IDS.PICARETA,
    name: "Picareta",
    description: "Ferramenta essencial para mineração eficiente.",
    category: "tools",
    ingredients: [
      { itemId: RESOURCE_IDS.CABO_PICARETA, quantity: 1 },
      { itemId: RESOURCE_IDS.CABECA_PICARETA, quantity: 1 },
      { itemId: RESOURCE_IDS.BARBANTE, quantity: 2 }
    ],
    outputs: [
      { itemId: EQUIPMENT_IDS.PICARETA, quantity: 1 }
    ],
    requiredLevel: 2,
    craftingTime: 30,
    experienceGained: 18,
    tags: ["tool", "pickaxe", "mining"],
    requiredWorkshop: "advanced"
  },
  {
    id: RECIPE_IDS.ESPADA_FERRO,
    name: "Espada de Ferro",
    description: "Arma de ferro balanceada para combate.",
    category: "weapons",
    ingredients: [
      { itemId: RESOURCE_IDS.CABO_ESPADA, quantity: 1 },
      { itemId: RESOURCE_IDS.LAMINA_ESPADA, quantity: 1 },
      { itemId: RESOURCE_IDS.EMPUNHADURA_COURO, quantity: 1 }
    ],
    outputs: [
      { itemId: EQUIPMENT_IDS.ESPADA_FERRO, quantity: 1 }
    ],
    requiredLevel: 4,
    craftingTime: 50,
    experienceGained: 35,
    tags: ["weapon", "sword", "combat"],
    requiredWorkshop: "forge"
  },

  // Ferramentas Avançadas
  {
    id: RECIPE_IDS.MACHADO_FERRO,
    name: "Machado de Ferro",
    description: "Machado aprimorado com lâmina de ferro refinado.",
    category: "advanced_tools",
    ingredients: [
      { itemId: RESOURCE_IDS.CABO_MACHADO, quantity: 1 },
      { itemId: RESOURCE_IDS.BARRA_FERRO, quantity: 3 },
      { itemId: RESOURCE_IDS.COURO_CURTIDO, quantity: 1 }
    ],
    outputs: [
      { itemId: EQUIPMENT_IDS.MACHADO_FERRO, quantity: 1 }
    ],
    requiredLevel: 4,
    craftingTime: 45,
    experienceGained: 30,
    tags: ["tool", "advanced", "iron"],
    requiredWorkshop: "forge"
  },
  {
    id: RECIPE_IDS.PICARETA_FERRO,
    name: "Picareta de Ferro",
    description: "Picareta reforçada para mineração de materiais duros.",
    category: "advanced_tools",
    ingredients: [
      { itemId: RESOURCE_IDS.CABO_PICARETA, quantity: 1 },
      { itemId: RESOURCE_IDS.BARRA_FERRO, quantity: 4 },
      { itemId: RESOURCE_IDS.CORDA_RESISTENTE, quantity: 1 }
    ],
    outputs: [
      { itemId: EQUIPMENT_IDS.PICARETA_FERRO, quantity: 1 }
    ],
    requiredLevel: 4,
    craftingTime: 40,
    experienceGained: 28,
    tags: ["tool", "advanced", "mining"],
    requiredWorkshop: "forge"
  }
];

/**
 * RECEITAS DE MATERIAIS PROCESSADOS
 */
export const PROCESSED_MATERIAL_RECIPES: ModernRecipe[] = [
  {
    id: RECIPE_IDS.BARRA_FERRO,
    name: "Barra de Ferro",
    description: "Refina ferro bruto em barras utilizáveis.",
    category: "metallurgy",
    ingredients: [
      { itemId: RESOURCE_IDS.FERRO_FUNDIDO, quantity: 2 },
      { itemId: RESOURCE_IDS.CARVAO, quantity: 3 }
    ],
    outputs: [
      { itemId: RESOURCE_IDS.BARRA_FERRO, quantity: 1 }
    ],
    requiredLevel: 3,
    craftingTime: 60,
    experienceGained: 25,
    tags: ["metal", "processing", "smithing"],
    requiredWorkshop: "forge"
  },
  {
    id: RECIPE_IDS.TECIDO_LINHO,
    name: "Tecido de Linho",
    description: "Tece fibras de linho em tecido resistente.",
    category: "textiles",
    ingredients: [
      { itemId: RESOURCE_IDS.LINHO, quantity: 4 },
      { itemId: RESOURCE_IDS.BARBANTE, quantity: 2 }
    ],
    outputs: [
      { itemId: RESOURCE_IDS.TECIDO_LINHO, quantity: 1 }
    ],
    requiredLevel: 2,
    craftingTime: 25,
    experienceGained: 12,
    tags: ["textile", "fabric", "clothing"],
    requiredWorkshop: "loom"
  },
  {
    id: RECIPE_IDS.COURO_REFINADO,
    name: "Couro Refinado",
    description: "Processa couro curtido em material premium.",
    category: "leather_working",
    ingredients: [
      { itemId: RESOURCE_IDS.COURO_CURTIDO, quantity: 2 },
      { itemId: RESOURCE_IDS.OLEO_LINHAÇA, quantity: 1 },
      { itemId: RESOURCE_IDS.CERA_ABELHA, quantity: 1 }
    ],
    outputs: [
      { itemId: RESOURCE_IDS.COURO_REFINADO, quantity: 1 }
    ],
    requiredLevel: 4,
    craftingTime: 45,
    experienceGained: 22,
    tags: ["leather", "premium", "armor"],
    requiredWorkshop: "tannery"
  }
];

/**
 * RECEITAS DE CONSUMÍVEIS
 */
export const CONSUMABLE_RECIPES: ModernRecipe[] = [
  {
    id: RECIPE_IDS.CARNE_ASSADA,
    name: "Carne Assada",
    description: "Assa carne crua para melhorar sabor e conservação.",
    category: "cooking",
    ingredients: [
      { itemId: RESOURCE_IDS.CARNE, quantity: 1 },
      { itemId: RESOURCE_IDS.GRAVETOS, quantity: 2 }
    ],
    outputs: [
      { itemId: RESOURCE_IDS.CARNE_ASSADA, quantity: 1 }
    ],
    craftingTime: 15,
    experienceGained: 5,
    tags: ["food", "cooked", "preservation"],
    requiredWorkshop: "basic"
  },
  {
    id: RECIPE_IDS.PEIXE_GRELHADO,
    name: "Peixe Grelhado",
    description: "Grelha peixe fresco para refeição nutritiva.",
    category: "cooking",
    ingredients: [
      { itemId: RESOURCE_IDS.PEIXE_PEQUENO, quantity: 1 },
      { itemId: RESOURCE_IDS.GRAVETOS, quantity: 1 }
    ],
    outputs: [
      { itemId: RESOURCE_IDS.PEIXE_GRELHADO, quantity: 1 }
    ],
    craftingTime: 10,
    experienceGained: 4,
    tags: ["food", "fish", "healthy"],
    requiredWorkshop: "basic"
  },
  {
    id: RECIPE_IDS.ENSOPADO_CARNE,
    name: "Ensopado de Carne",
    description: "Combina carne e vegetais em refeição substancial.",
    category: "cooking",
    ingredients: [
      { itemId: RESOURCE_IDS.CARNE_ASSADA, quantity: 1 },
      { itemId: RESOURCE_IDS.COGUMELOS, quantity: 2 },
      { itemId: RESOURCE_IDS.AGUA_FRESCA, quantity: 1 }
    ],
    outputs: [
      { itemId: RESOURCE_IDS.ENSOPADO_CARNE, quantity: 1 }
    ],
    requiredLevel: 2,
    craftingTime: 25,
    experienceGained: 12,
    tags: ["food", "stew", "hearty"],
    requiredWorkshop: "advanced"
  }
];

/**
 * RECEITAS DE CONTAINERS E UTENSÍLIOS
 */
export const CONTAINER_RECIPES: ModernRecipe[] = [
  {
    id: RECIPE_IDS.MOCHILA,
    name: "Mochila",
    description: "Container básico para carregar itens.",
    category: "storage",
    ingredients: [
      { itemId: RESOURCE_IDS.COURO_CURTIDO, quantity: 3 },
      { itemId: RESOURCE_IDS.BARBANTE, quantity: 4 },
      { itemId: RESOURCE_IDS.FIVELA_METAL, quantity: 2 }
    ],
    outputs: [
      { itemId: EQUIPMENT_IDS.MOCHILA, quantity: 1 }
    ],
    requiredLevel: 2,
    craftingTime: 35,
    experienceGained: 15,
    tags: ["storage", "container", "utility"],
    requiredWorkshop: "advanced"
  },
  {
    id: RECIPE_IDS.BAU_MADEIRA,
    name: "Baú de Madeira",
    description: "Container grande para armazenamento permanente.",
    category: "storage",
    ingredients: [
      { itemId: RESOURCE_IDS.MADEIRA, quantity: 8 },
      { itemId: RESOURCE_IDS.DOBRADIÇA_FERRO, quantity: 2 },
      { itemId: RESOURCE_IDS.PREGO_FERRO, quantity: 6 }
    ],
    outputs: [
      { itemId: EQUIPMENT_IDS.BAU_MADEIRA, quantity: 1 }
    ],
    requiredLevel: 3,
    craftingTime: 50,
    experienceGained: 25,
    tags: ["storage", "furniture", "large"],
    requiredWorkshop: "advanced"
  }
];

/**
 * CONSOLIDAÇÃO DE TODAS AS RECEITAS
 */
export const ALL_MODERN_RECIPES: ModernRecipe[] = [
  ...BASIC_MATERIAL_RECIPES,
  ...COMPONENT_RECIPES,
  ...EQUIPMENT_RECIPES,
  ...PROCESSED_MATERIAL_RECIPES,
  ...CONSUMABLE_RECIPES,
  ...CONTAINER_RECIPES
];

/**
 * FUNÇÕES DE UTILIDADE
 */
export function getRecipeById(id: string): ModernRecipe | undefined {
  return ALL_MODERN_RECIPES.find(recipe => recipe.id === id);
}

export function getRecipesByCategory(category: string): ModernRecipe[] {
  return ALL_MODERN_RECIPES.filter(recipe => recipe.category === category);
}

export function getRecipesForItem(itemId: string): ModernRecipe[] {
  return ALL_MODERN_RECIPES.filter(recipe => 
    recipe.outputs.some(output => output.itemId === itemId)
  );
}

export function getRecipesUsingIngredient(itemId: string): ModernRecipe[] {
  return ALL_MODERN_RECIPES.filter(recipe =>
    recipe.ingredients.some(ingredient => ingredient.itemId === itemId)
  );
}

export function validateAllRecipeIds(): boolean {
  let isValid = true;
  
  for (const recipe of ALL_MODERN_RECIPES) {
    // Validar ID da receita
    if (!RECIPE_IDS[Object.keys(RECIPE_IDS).find(key => RECIPE_IDS[key as keyof typeof RECIPE_IDS] === recipe.id) as keyof typeof RECIPE_IDS]) {
      console.error(`❌ Invalid recipe ID: ${recipe.id}`);
      isValid = false;
    }
    
    // Validar IDs dos ingredientes
    for (const ingredient of recipe.ingredients) {
      if (!Object.values(RESOURCE_IDS).includes(ingredient.itemId as any) && 
          !Object.values(EQUIPMENT_IDS).includes(ingredient.itemId as any)) {
        console.error(`❌ Invalid ingredient ID in recipe ${recipe.id}: ${ingredient.itemId}`);
        isValid = false;
      }
    }
    
    // Validar IDs dos produtos
    for (const output of recipe.outputs) {
      if (!Object.values(RESOURCE_IDS).includes(output.itemId as any) && 
          !Object.values(EQUIPMENT_IDS).includes(output.itemId as any)) {
        console.error(`❌ Invalid output ID in recipe ${recipe.id}: ${output.itemId}`);
        isValid = false;
      }
    }
  }
  
  if (isValid) {
    console.log('✅ All recipe IDs are valid');
  }
  
  return isValid;
}

// Validação automática
validateAllRecipeIds();

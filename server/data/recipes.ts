// Recipe data management module
import type { InsertRecipe } from "@shared/schema";

export function createRecipeData(resourceIds: string[]): InsertRecipe[] {
  return [
    {
      name: "Machado",
      emoji: "🪓",
      requiredLevel: 1,
      ingredients: { [resourceIds[3]]: 2, [resourceIds[1]]: 2 }, // 2 Madeira + 2 Pedra
      output: { "axe": 1 },
    },
    {
      name: "Picareta",
      emoji: "⛏️",
      requiredLevel: 1,
      ingredients: { [resourceIds[3]]: 1, [resourceIds[1]]: 3 }, // 1 Madeira + 3 Pedra
      output: { "pickaxe": 1 },
    },
    {
      name: "Foice",
      emoji: "🔪",
      requiredLevel: 1,
      ingredients: { [resourceIds[3]]: 1, [resourceIds[1]]: 2 }, // 1 Madeira + 2 Pedra
      output: { "sickle": 1 },
    },
    {
      name: "Vara de Pesca",
      emoji: "🎣",
      requiredLevel: 1,
      ingredients: { [resourceIds[3]]: 2, [resourceIds[0]]: 3 }, // 2 Madeira + 3 Fibra
      output: { "fishing_rod": 1 },
    },
    {
      name: "Espada de Pedra",
      emoji: "⚔️",
      requiredLevel: 2,
      ingredients: { [resourceIds[3]]: 1, [resourceIds[1]]: 4 }, // 1 Madeira + 4 Pedra
      output: { "stone_sword": 1 },
    },
    {
      name: "Arco e Flecha",
      emoji: "🏹",
      requiredLevel: 5,
      ingredients: { [resourceIds[3]]: 3, [resourceIds[0]]: 5 }, // 3 Madeira + 5 Fibra
      output: { "bow": 1 },
    },
    {
      name: "Lança",
      emoji: "🔱",
      requiredLevel: 8,
      ingredients: { [resourceIds[3]]: 4, [resourceIds[1]]: 2 }, // 4 Madeira + 2 Pedra
      output: { "spear": 1 },
    },
    {
      name: "Mochila",
      emoji: "🎒",
      requiredLevel: 3,
      ingredients: { [resourceIds[0]]: 8, [resourceIds[7]]: 1 }, // 8 Fibra + 1 Coelho (couro)
      output: { "backpack": 1 },
    },
    {
      name: "Isca para Pesca",
      emoji: "🪱",
      requiredLevel: 1,
      ingredients: { [resourceIds[2]]: 1, [resourceIds[13]]: 1 }, // 1 Gravetos + 1 Cogumelos
      output: { "bait": 5 },
    },
    {
      name: "Corda",
      emoji: "🧵",
      requiredLevel: 1,
      ingredients: { [resourceIds[0]]: 4 }, // 4 Fibra
      output: { "rope": 1 },
    },
  ];
}

// Recipe categories for better organization
export const RECIPE_CATEGORIES = {
  TOOLS: "tools",
  WEAPONS: "weapons",
  ARMOR: "armor",
  CONSUMABLES: "consumables",
  MATERIALS: "materials",
} as const;

export function getRecipesByCategory(category: string, recipes: any[]): any[] {
  const toolRecipes = ["Machado", "Picareta", "Foice", "Vara de Pesca"];
  const weaponRecipes = ["Espada de Pedra", "Arco e Flecha", "Lança"];
  const armorRecipes = ["Mochila"];
  const consumableRecipes = ["Isca para Pesca"];
  const materialRecipes = ["Corda"];

  switch (category) {
    case RECIPE_CATEGORIES.TOOLS:
      return recipes.filter(r => toolRecipes.includes(r.name));
    case RECIPE_CATEGORIES.WEAPONS:
      return recipes.filter(r => weaponRecipes.includes(r.name));
    case RECIPE_CATEGORIES.ARMOR:
      return recipes.filter(r => armorRecipes.includes(r.name));
    case RECIPE_CATEGORIES.CONSUMABLES:
      return recipes.filter(r => consumableRecipes.includes(r.name));
    case RECIPE_CATEGORIES.MATERIALS:
      return recipes.filter(r => materialRecipes.includes(r.name));
    default:
      return recipes;
  }
}
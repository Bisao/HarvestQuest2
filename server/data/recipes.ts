// Recipe data management module
import type { InsertRecipe } from "@shared/schema";
import { RESOURCE_IDS, EQUIPMENT_IDS, RECIPE_IDS } from "@shared/constants/game-ids";

export function createRecipeData(): InsertRecipe[] {

  return [
    // MATERIAIS BÁSICOS
    {
      id: RECIPE_IDS.BARBANTE,
      name: "Barbante",
      emoji: "🧵",
      requiredLevel: 1,
      ingredients: { [RESOURCE_IDS.FIBRA]: 5 },
      output: { [RESOURCE_IDS.BARBANTE]: 1 }
    },
    
    // FERRAMENTAS
    {
      id: RECIPE_IDS.MACHADO,
      name: "Machado",
      emoji: "🪓",
      requiredLevel: 1,
      ingredients: { [RESOURCE_IDS.PEDRAS_SOLTAS]: 1, [RESOURCE_IDS.BARBANTE]: 2, [RESOURCE_IDS.GRAVETOS]: 1 },
      output: { [EQUIPMENT_IDS.MACHADO]: 1 }
    },
    {
      id: RECIPE_IDS.PICARETA,
      name: "Picareta",
      emoji: "⛏️",
      requiredLevel: 1,
      ingredients: { [RESOURCE_IDS.PEDRAS_SOLTAS]: 2, [RESOURCE_IDS.BARBANTE]: 2, [RESOURCE_IDS.GRAVETOS]: 1 },
      output: { [EQUIPMENT_IDS.PICARETA]: 1 }
    },
    {
      id: RECIPE_IDS.FOICE,
      name: "Foice",
      emoji: "🔪",
      requiredLevel: 2,
      ingredients: { [RESOURCE_IDS.PEDRA]: 1, [RESOURCE_IDS.BARBANTE]: 2, [RESOURCE_IDS.GRAVETOS]: 1 },
      output: { [EQUIPMENT_IDS.FOICE]: 1 }
    },
    {
      id: RECIPE_IDS.BALDE_MADEIRA,
      name: "Balde de Madeira",
      emoji: "🪣",
      requiredLevel: 2,
      ingredients: { [RESOURCE_IDS.MADEIRA]: 1, [RESOURCE_IDS.BARBANTE]: 2 },
      output: { [EQUIPMENT_IDS.BALDE_MADEIRA]: 1 }
    },
    {
      id: RECIPE_IDS.FACA,
      name: "Faca",
      emoji: "🗡️",
      requiredLevel: 1,
      ingredients: { [RESOURCE_IDS.PEDRAS_SOLTAS]: 1, [RESOURCE_IDS.BARBANTE]: 1, [RESOURCE_IDS.GRAVETOS]: 1 },
      output: { [EQUIPMENT_IDS.FACA]: 1 }
    },
    {
      id: RECIPE_IDS.VARA_PESCA,
      name: "Vara de Pesca",
      emoji: "🎣",
      requiredLevel: 3,
      ingredients: { [RESOURCE_IDS.GRAVETOS]: 3, [RESOURCE_IDS.FIBRA]: 2 },
      output: { [EQUIPMENT_IDS.VARA_PESCA]: 1 }
    },
    
    // ARMAS
    {
      id: RECIPE_IDS.ARCO_FLECHA,
      name: "Arco e Flecha",
      emoji: "🏹",
      requiredLevel: 5,
      ingredients: { [RESOURCE_IDS.GRAVETOS]: 2, [RESOURCE_IDS.BARBANTE]: 2, [RESOURCE_IDS.PEDRAS_SOLTAS]: 1 },
      output: { [EQUIPMENT_IDS.ARCO_FLECHA]: 1 }
    },
    {
      id: RECIPE_IDS.LANCA,
      name: "Lança",
      emoji: "🔱",
      requiredLevel: 4,
      ingredients: { [RESOURCE_IDS.GRAVETOS]: 2, [RESOURCE_IDS.BARBANTE]: 4, [RESOURCE_IDS.PEDRAS_SOLTAS]: 1 },
      output: { [EQUIPMENT_IDS.LANCA]: 1 }
    },
    
    // EQUIPAMENTOS
    {
      id: RECIPE_IDS.MOCHILA,
      name: "Mochila",
      emoji: "🎒",
      requiredLevel: 5,
      ingredients: { [RESOURCE_IDS.COURO]: 2, [RESOURCE_IDS.BARBANTE]: 4 },
      output: { [EQUIPMENT_IDS.MOCHILA]: 1 }
    },
    
    // MATERIAIS AVANÇADOS
    {
      id: RECIPE_IDS.CORDA,
      name: "Corda",
      emoji: "🪢",
      requiredLevel: 3,
      ingredients: { [RESOURCE_IDS.COURO]: 2 },
      output: { [EQUIPMENT_IDS.CORDA]: 1 }
    },
    {
      id: RECIPE_IDS.ISCA_PESCA,
      name: "Isca para Pesca",
      emoji: "🪱",
      requiredLevel: 2,
      ingredients: { [RESOURCE_IDS.FIBRA]: 1, [RESOURCE_IDS.FRUTAS_SILVESTRES]: 1 },
      output: { [EQUIPMENT_IDS.ISCA_PESCA]: 3 } // Produz 3 iscas por craft
    },
    
    // UTENSÍLIOS DE COZINHA
    {
      id: RECIPE_IDS.PANELA_BARRO,
      name: "Panela de Barro",
      emoji: "🏺",
      requiredLevel: 4,
      ingredients: { [RESOURCE_IDS.ARGILA]: 10 },
      output: { [EQUIPMENT_IDS.PANELA_BARRO]: 1 }
    },
    {
      id: RECIPE_IDS.PANELA,
      name: "Panela",
      emoji: "🫕",
      requiredLevel: 6,
      ingredients: { [RESOURCE_IDS.FERRO_FUNDIDO]: 2 },
      output: { [EQUIPMENT_IDS.PANELA]: 1 }
    },
    {
      id: RECIPE_IDS.GARRAFA_BAMBU,
      name: "Garrafa de Bambu",
      emoji: "🎍",
      requiredLevel: 2,
      ingredients: { [RESOURCE_IDS.BAMBU]: 2 },
      output: { [EQUIPMENT_IDS.GARRAFA_BAMBU]: 1 }
    },
    
    // COMIDAS
    {
      id: RECIPE_IDS.SUCO_FRUTAS,
      name: "Suco de Frutas",
      emoji: "🧃",
      requiredLevel: 1,
      ingredients: { [RESOURCE_IDS.AGUA_FRESCA]: 1, [RESOURCE_IDS.FRUTAS_SILVESTRES]: 1 },
      output: { [RESOURCE_IDS.SUCO_FRUTAS]: 1 }
    },
    {
      id: RECIPE_IDS.COGUMELOS_ASSADOS,
      name: "Cogumelos Assados",
      emoji: "🍄‍🟫",
      requiredLevel: 1,
      ingredients: { [RESOURCE_IDS.COGUMELOS]: 3, [RESOURCE_IDS.GRAVETOS]: 1 },
      output: { [RESOURCE_IDS.COGUMELOS_ASSADOS]: 1 }
    },
    {
      id: RECIPE_IDS.PEIXE_GRELHADO,
      name: "Peixe Grelhado",
      emoji: "🐟",
      requiredLevel: 2,
      ingredients: { [RESOURCE_IDS.CARNE]: 1, [RESOURCE_IDS.GRAVETOS]: 1 },
      output: { [RESOURCE_IDS.PEIXE_GRELHADO]: 1 }
    },
    {
      id: RECIPE_IDS.CARNE_ASSADA,
      name: "Carne Assada",
      emoji: "🍖",
      requiredLevel: 2,
      ingredients: { [RESOURCE_IDS.CARNE]: 1, [RESOURCE_IDS.GRAVETOS]: 1 },
      output: { [RESOURCE_IDS.CARNE_ASSADA]: 1 }
    },
    {
      id: RECIPE_IDS.ENSOPADO_CARNE,
      name: "Ensopado de Carne",
      emoji: "🍲",
      requiredLevel: 4,
      ingredients: { [RESOURCE_IDS.CARNE]: 2, [RESOURCE_IDS.AGUA_FRESCA]: 3 },
      output: { [RESOURCE_IDS.ENSOPADO_CARNE]: 1 }
    }
  ];
}
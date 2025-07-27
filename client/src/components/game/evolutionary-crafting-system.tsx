import { useState } from "react";
import type { Recipe, Resource, StorageItem } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { ChevronDown, ChevronRight, ChevronLeft, ChevronRight as ChevronRightIcon } from "lucide-react";

interface EvolutionaryItem {
  baseType: string;
  name: string;
  recipes: Recipe[];
  category: string;
}

interface EvolutionaryCraftingSystemProps {
  recipes: Recipe[];
  resources: Resource[];
  playerLevel: number;
  playerId: string;
  isBlocked?: boolean;
}

// Definição das famílias evolutivas com base nos dados do servidor
const EQUIPMENT_FAMILIES = {
  // Ferramentas
  axe: {
    baseType: "axe",
    name: "Machado",
    emoji: "🪓",
    category: "Ferramentas Evolutivas",
    tiers: ["Improvisado", "de Ferro", "Avançado"]
  },
  pickaxe: {
    baseType: "pickaxe", 
    name: "Picareta",
    emoji: "⛏️",
    category: "Ferramentas Evolutivas",
    tiers: ["Improvisada", "de Ferro", "Avançada"]
  },
  fishing_rod: {
    baseType: "fishing_rod",
    name: "Vara de Pesca",
    emoji: "🎣",
    category: "Ferramentas Evolutivas",
    tiers: ["Improvisada", "de Ferro", "Avançada"]
  },
  shovel: {
    baseType: "shovel",
    name: "Pá",
    emoji: "🏗️",
    category: "Ferramentas Evolutivas",
    tiers: ["Improvisada", "de Ferro", "Avançada"]
  },
  sickle: {
    baseType: "sickle",
    name: "Foice",
    emoji: "🔪",
    category: "Ferramentas Evolutivas",
    tiers: ["Improvisada", "de Ferro", "Avançada"]
  },
  knife: {
    baseType: "knife",
    name: "Faca",
    emoji: "🔪",
    category: "Ferramentas Evolutivas",
    tiers: ["Improvisada", "de Ferro", "Avançada"]
  },
  bucket: {
    baseType: "bucket",
    name: "Balde",
    emoji: "🪣",
    category: "Ferramentas Evolutivas",
    tiers: ["Improvisado", "de Ferro", "Avançado"]
  },
  
  // Armas
  sword: {
    baseType: "sword",
    name: "Espada", 
    emoji: "⚔️",
    category: "Armas Evolutivas",
    tiers: ["Improvisada", "de Ferro", "Avançada"]
  },
  bow: {
    baseType: "bow",
    name: "Arco",
    emoji: "🏹", 
    category: "Armas Evolutivas",
    tiers: ["Improvisado", "de Ferro", "Avançado"]
  },
  spear: {
    baseType: "spear",
    name: "Lança",
    emoji: "🗡️",
    category: "Armas Evolutivas",
    tiers: ["Improvisada", "de Ferro", "Avançada"]
  },
  crossbow: {
    baseType: "crossbow",
    name: "Besta",
    emoji: "🏹",
    category: "Armas Evolutivas",
    tiers: ["Improvisada", "de Ferro", "Avançada"]
  },
  
  // Armaduras
  helmet: {
    baseType: "helmet",
    name: "Capacete",
    emoji: "🎩",
    category: "Armaduras Evolutivas", 
    tiers: ["Improvisado", "de Ferro", "Avançado"]
  },
  chestplate: {
    baseType: "chestplate",
    name: "Peitoral",
    emoji: "🦺",
    category: "Armaduras Evolutivas",
    tiers: ["Improvisado", "de Ferro", "Avançado"]
  },
  leggings: {
    baseType: "leggings",
    name: "Calças",
    emoji: "👖", 
    category: "Armaduras Evolutivas",
    tiers: ["Improvisadas", "de Ferro", "Avançadas"]
  },
  boots: {
    baseType: "boots",
    name: "Botas",
    emoji: "🥾",
    category: "Armaduras Evolutivas", 
    tiers: ["Improvisadas", "de Ferro", "Avançadas"]
  },
  backpack: {
    baseType: "backpack",
    name: "Mochila",
    emoji: "🎒",
    category: "Armaduras Evolutivas",
    tiers: ["Improvisada", "de Ferro", "Avançada"]
  },
  foodbag: {
    baseType: "foodbag", 
    name: "Bolsa de Comida",
    emoji: "🥘",
    category: "Armaduras Evolutivas",
    tiers: ["Improvisada", "de Ferro", "Avançada"]
  },
  
  // Alimentos evolutivos
  cooked_meat: {
    baseType: "cooked_meat",
    name: "Carne",
    emoji: "🥩",
    category: "Alimentos Evolutivos",
    tiers: ["Improvisada", "de Ferro", "Avançada"]
  },
  stew: {
    baseType: "stew",
    name: "Ensopado",
    emoji: "🍲",
    category: "Alimentos Evolutivos", 
    tiers: ["Improvisado", "de Ferro", "Avançado"]
  },
  cooked_mushrooms: {
    baseType: "cooked_mushrooms",
    name: "Cogumelos",
    emoji: "🍄",
    category: "Alimentos Evolutivos",
    tiers: ["Improvisados", "de Ferro", "Avançados"]
  },
  cooked_fish: {
    baseType: "cooked_fish",
    name: "Peixe",
    emoji: "🐟",
    category: "Alimentos Evolutivos",
    tiers: ["Improvisado", "de Ferro", "Avançado"]
  },
  beverages: {
    baseType: "beverages",
    name: "Bebidas",
    emoji: "🥤",
    category: "Alimentos Evolutivos",
    tiers: ["Improvisadas", "de Ferro", "Avançadas"]
  },

  // Equipamentos utilitários evolutivos
  rope: {
    baseType: "rope",
    name: "Corda",
    emoji: "🪢",
    category: "Equipamentos Evolutivos",
    tiers: ["Improvisada", "de Ferro", "Avançada"]
  },
  fishing_bait: {
    baseType: "fishing_bait",
    name: "Isca",
    emoji: "🪱",
    category: "Equipamentos Evolutivos",
    tiers: ["Improvisada", "de Ferro", "Avançada"]
  },
  simple_trap: {
    baseType: "simple_trap",
    name: "Armadilha",
    emoji: "🕳️",
    category: "Equipamentos Evolutivos",
    tiers: ["Improvisada", "de Ferro", "Avançada"]
  },

  // Utensílios evolutivos
  clay_pot: {
    baseType: "clay_pot",
    name: "Panela",
    emoji: "🏺",
    category: "Utensílios Evolutivos",
    tiers: ["Improvisada", "de Ferro", "Avançada"]
  },
  bamboo_bottle: {
    baseType: "bamboo_bottle", 
    name: "Garrafa",
    emoji: "🎍",
    category: "Utensílios Evolutivos",
    tiers: ["Improvisada", "de Ferro", "Avançada"]
  }
};

export default function EvolutionaryCraftingSystem({ 
  recipes, 
  resources, 
  playerLevel, 
  playerId, 
  isBlocked = false 
}: EvolutionaryCraftingSystemProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    "Materiais Básicos": true,
    "Ferramentas Evolutivas": true,
    "Armas Evolutivas": false,
    "Armaduras Evolutivas": false,
    "Alimentos Evolutivos": false,
    "Equipamentos Utilitários": false,
    "Utensílios de Cozinha": false,
    "Consumíveis": false,
  });

  // Estado do carrossel para cada família de equipamentos
  const [carouselStates, setCarouselStates] = useState<Record<string, number>>({});

  // Get storage items to check available resources
  const { data: storageItems = [] } = useQuery<StorageItem[]>({
    queryKey: ["/api/storage", playerId],
    enabled: !!playerId,
  });

  const craftMutation = useMutation({
    mutationFn: async ({ recipeId }: { recipeId: string }) => {
      const response = await fetch("/api/craft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId, recipeId }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Item Craftado!",
        description: `${data.recipe.name} foi criado com sucesso!`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/storage", playerId] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory", playerId] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro no Crafting",
        description: error.message || "Não foi possível craftar o item",
        variant: "destructive",
      });
    },
  });

  // Funções auxiliares
  const getResourceData = (resourceId: string) => {
    const resource = resources.find(r => r.id === resourceId);
    if (resource) return resource;
    
    const equipmentMappings: Record<string, { name: string; emoji: string }> = {
      "string": { name: "Barbante", emoji: "🧵" },
      "bamboo_bottle": { name: "Garrafa de Bambu", emoji: "🎍" },
      "clay_pot": { name: "Panela de Barro", emoji: "🏺" },
      "rope": { name: "Corda", emoji: "🪢" },
      "natural_glue": { name: "Cola Natural", emoji: "🍯" }
    };
    
    const mapping = equipmentMappings[resourceId];
    return {
      id: resourceId,
      name: mapping?.name || resourceId,
      emoji: mapping?.emoji || "📦",
      weight: 1,
      value: 1,
      type: "basic",
      rarity: "common",
      requiredTool: null,
      experienceValue: 1
    };
  };

  const getStorageQuantity = (resourceId: string) => {
    const storageItem = storageItems.find(item => item.resourceId === resourceId);
    if (storageItem) return storageItem.quantity;
    
    const equipmentMappings: Record<string, string> = {
      "string": "Barbante",
      "bamboo_bottle": "Garrafa de Bambu", 
      "clay_pot": "Panela de Barro",
      "rope": "Corda",
      "natural_glue": "Cola Natural"
    };
    
    if (equipmentMappings[resourceId]) {
      const equipmentName = equipmentMappings[resourceId];
      const equipmentInStorage = storageItems.find(item => {
        const resource = resources.find(r => r.id === item.resourceId);
        return resource?.name === equipmentName;
      });
      return equipmentInStorage?.quantity || 0;
    }
    
    return 0;
  };

  const getRecipeIngredients = (recipe: Recipe) => {
    const ingredients = recipe.ingredients as Record<string, number>;
    return Object.entries(ingredients).map(([resourceId, quantity]) => ({
      resource: getResourceData(resourceId),
      quantity,
    }));
  };

  const canCraftRecipe = (recipe: Recipe) => {
    if (playerLevel < recipe.requiredLevel) return false;
    
    const ingredients = getRecipeIngredients(recipe);
    return ingredients.every(({ resource, quantity }) => {
      const available = getStorageQuantity(resource!.id);
      return available >= quantity;
    });
  };

  // Categorização inteligente de receitas
  const categorizeRecipes = () => {
    const categories: Record<string, Recipe[]> = {
      "Materiais Básicos": [],
      "Ferramentas Evolutivas": [],
      "Armas Evolutivas": [],
      "Armaduras Evolutivas": [],
      "Alimentos Evolutivos": [],
      "Equipamentos Evolutivos": [],
      "Utensílios Evolutivos": [],
      "Consumíveis": []
    };

    recipes.forEach(recipe => {
      const name = recipe.name.toLowerCase();
      
      // Materiais básicos
      if (name.includes("barbante") || name.includes("cola natural")) {
        categories["Materiais Básicos"].push(recipe);
      }
      // Ferramentas evolutivas - TODAS as ferramentas com variações evolutivas
      else if (name.includes("machado") || name.includes("picareta") || 
               name.includes("vara de pesca") || name.includes("vara") ||
               name.includes("pá") || name.includes("foice") || 
               name.includes("faca") || name.includes("balde")) {
        categories["Ferramentas Evolutivas"].push(recipe);
      }
      // Armas evolutivas - TODAS as armas com variações evolutivas
      else if (name.includes("espada") || name.includes("arco") ||
               name.includes("lança") || name.includes("besta")) {
        categories["Armas Evolutivas"].push(recipe);
      }
      // Armaduras evolutivas - TODAS as armaduras com variações evolutivas
      else if (name.includes("capacete") || name.includes("peitoral") || 
               name.includes("calças") || name.includes("botas") ||
               name.includes("mochila") || name.includes("bolsa")) {
        categories["Armaduras Evolutivas"].push(recipe);
      }
      // Alimentos evolutivos - TODOS os alimentos com variações
      else if ((name.includes("carne") && (name.includes("assada") || name.includes("grelhada") || name.includes("defumada"))) ||
               (name.includes("ensopado")) ||
               (name.includes("cogumelos") && (name.includes("assados") || name.includes("grelhados") || name.includes("refogados"))) ||
               (name.includes("peixe") && (name.includes("grelhado") || name.includes("assado") || name.includes("defumado"))) ||
               (name.includes("suco") || name.includes("vitamina") || name.includes("elixir"))) {
        categories["Alimentos Evolutivos"].push(recipe);
      }
      // Equipamentos evolutivos (cordas, iscas, armadilhas)
      else if (name.includes("corda") || name.includes("isca") || 
               name.includes("armadilha")) {
        categories["Equipamentos Evolutivos"].push(recipe);
      }
      // Utensílios evolutivos (panelas, garrafas)
      else if (name.includes("panela") || name.includes("garrafa")) {
        categories["Utensílios Evolutivos"].push(recipe);
      }
      // Consumíveis (comidas e bebidas)
      else {
        categories["Consumíveis"].push(recipe);
      }
    });

    return categories;
  };

  // Agrupar receitas por família evolutiva
  const groupEvolutionaryRecipes = (categoryRecipes: Recipe[]) => {
    const evolutionaryGroups: Record<string, Recipe[]> = {};
    const nonEvolutionary: Recipe[] = [];

    categoryRecipes.forEach(recipe => {
      let foundFamily = false;
      
      Object.values(EQUIPMENT_FAMILIES).forEach(family => {
        const isPartOfFamily = family.tiers.some(tier => 
          recipe.name.toLowerCase().includes(family.name.toLowerCase()) &&
          recipe.name.toLowerCase().includes(tier.toLowerCase())
        );
        
        if (isPartOfFamily) {
          if (!evolutionaryGroups[family.baseType]) {
            evolutionaryGroups[family.baseType] = [];
          }
          evolutionaryGroups[family.baseType].push(recipe);
          foundFamily = true;
        }
      });
      
      if (!foundFamily) {
        nonEvolutionary.push(recipe);
      }
    });

    return { evolutionaryGroups, nonEvolutionary };
  };

  // Obter cor do tier
  const getTierColor = (recipeName: string) => {
    const name = recipeName.toLowerCase();
    if (name.includes("improvisad") || name.includes("simples") || name.includes("couro") || name.includes("normal")) {
      return "border-amber-400 bg-amber-50 text-amber-800";
    }
    if (name.includes("ferro") || name.includes("composto") || name.includes("reforçad") || name.includes("refrigerad")) {
      return "border-blue-400 bg-blue-50 text-blue-800";
    }
    if (name.includes("avançad") || name.includes("élf") || name.includes("dimensional") || name.includes("mágic")) {
      return "border-purple-400 bg-purple-50 text-purple-800";
    }
    return "border-gray-400 bg-gray-50 text-gray-800";
  };

  // Obter indicador de tier
  const getTierLabel = (recipeName: string) => {
    const name = recipeName.toLowerCase();
    if (name.includes("improvisad") || name.includes("simples") || name.includes("couro") || name.includes("normal")) {
      return "IMPROVISADO";
    }
    if (name.includes("ferro") || name.includes("composto") || name.includes("reforçad") || name.includes("refrigerad")) {
      return "FERRO";
    }
    if (name.includes("avançad") || name.includes("élf") || name.includes("dimensional") || name.includes("mágic")) {
      return "AVANÇADO";
    }
    return "BÁSICO";
  };

  // Render do carrossel evolutivo com tamanho fixo e simétrico
  const renderEvolutionaryCarousel = (familyType: string, familyRecipes: Recipe[]) => {
    const family = EQUIPMENT_FAMILIES[familyType as keyof typeof EQUIPMENT_FAMILIES];
    if (!family) return null;

    // Ordenar receitas por nível
    const sortedRecipes = [...familyRecipes].sort((a, b) => a.requiredLevel - b.requiredLevel);
    const currentIndex = carouselStates[familyType] || 0;
    const currentRecipe = sortedRecipes[currentIndex];

    if (!currentRecipe) return null;

    const canCraft = canCraftRecipe(currentRecipe);
    const ingredients = getRecipeIngredients(currentRecipe);

    const navigateCarousel = (direction: 'prev' | 'next') => {
      setCarouselStates(prev => ({
        ...prev,
        [familyType]: direction === 'next' 
          ? Math.min(currentIndex + 1, sortedRecipes.length - 1)
          : Math.max(currentIndex - 1, 0)
      }));
    };

    return (
      <div className={`border-2 rounded-lg p-2 h-48 flex flex-col ${getTierColor(currentRecipe.name)}`}>
        {/* Header compacto com navegação */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-start space-x-1 flex-1 min-w-0">
            <span className="text-lg flex-shrink-0">{family.emoji}</span>
            <div className="min-w-0 flex-1">
              <h4 className="font-semibold text-xs leading-tight truncate">{currentRecipe.name}</h4>
              <div className="flex items-center space-x-1 text-xs mt-0.5">
                <span className="font-medium text-xs">{getTierLabel(currentRecipe.name)}</span>
                <span>•</span>
                <span>Nível {currentRecipe.requiredLevel}</span>
              </div>
            </div>
          </div>
          
          {/* Controles compactos do carrossel */}
          <div className="flex items-center space-x-0.5 flex-shrink-0 ml-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateCarousel('prev')}
              disabled={currentIndex === 0}
              className="h-5 w-5 p-0"
            >
              <ChevronLeft className="w-3 h-3" />
            </Button>
            
            {/* Indicadores de pontos menores */}
            <div className="flex space-x-0.5">
              {sortedRecipes.map((_, index) => (
                <div
                  key={index}
                  className={`w-1 h-1 rounded-full ${
                    index === currentIndex ? 'bg-current' : 'bg-current opacity-30'
                  }`}
                />
              ))}
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateCarousel('next')}
              disabled={currentIndex === sortedRecipes.length - 1}
              className="h-5 w-5 p-0"
            >
              <ChevronRightIcon className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Ingredientes compactos */}
        <div className="flex-1 space-y-1 mb-2 overflow-y-auto min-h-0">
          <h5 className="text-xs font-semibold text-gray-700">Ingredientes:</h5>
          {ingredients.map(({ resource, quantity }, index) => {
            if (!resource) return null;
            const available = getStorageQuantity(resource.id);
            const hasEnough = available >= quantity;
            
            return (
              <div
                key={index}
                className={`flex items-center justify-between text-xs ${
                  hasEnough ? "text-green-600" : "text-red-600"
                }`}
              >
                <span className="flex items-center space-x-1 min-w-0 flex-1">
                  <span className="flex-shrink-0">{resource.emoji}</span>
                  <span className="truncate">{resource.name}</span>
                </span>
                <span className="font-semibold flex-shrink-0 ml-1">
                  {available}/{quantity}
                </span>
              </div>
            );
          })}
        </div>

        {/* Botão compacto */}
        <Button
          onClick={() => craftMutation.mutate({ recipeId: currentRecipe.id })}
          disabled={!canCraft || craftMutation.isPending || isBlocked}
          className={`w-full text-xs h-7 ${
            canCraft 
              ? "bg-green-600 hover:bg-green-700 text-white" 
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          {craftMutation.isPending ? "Craftando..." : 
           isBlocked ? "🚫 Bloqueado" : 
           canCraft ? "🔨 Craftar" : "Indisponível"}
        </Button>
      </div>
    );
  };

  // Render de receita simples (não evolutiva) - mesmo tamanho compacto
  const renderSimpleRecipe = (recipe: Recipe) => {
    const canCraft = canCraftRecipe(recipe);
    const ingredients = getRecipeIngredients(recipe);

    return (
      <div key={recipe.id} className="border rounded-lg p-2 bg-white shadow-sm h-48 flex flex-col">
        <div className="flex items-start space-x-1 mb-2">
          <span className="text-lg flex-shrink-0">{recipe.emoji || "🔧"}</span>
          <div className="min-w-0 flex-1">
            <h4 className="font-semibold text-xs leading-tight truncate">{recipe.name}</h4>
            <p className="text-xs text-gray-600">Nível {recipe.requiredLevel}</p>
          </div>
        </div>

        <div className="flex-1 space-y-1 mb-2 overflow-y-auto min-h-0">
          <h5 className="text-xs font-semibold text-gray-700">Ingredientes:</h5>
          {ingredients.map(({ resource, quantity }, index) => {
            if (!resource) return null;
            const available = getStorageQuantity(resource.id);
            const hasEnough = available >= quantity;
            
            return (
              <div
                key={index}
                className={`flex items-center justify-between text-xs ${
                  hasEnough ? "text-green-600" : "text-red-600"
                }`}
              >
                <span className="flex items-center space-x-1 min-w-0 flex-1">
                  <span className="flex-shrink-0">{resource.emoji}</span>
                  <span className="truncate">{resource.name}</span>
                </span>
                <span className="font-semibold flex-shrink-0 ml-1">
                  {available}/{quantity}
                </span>
              </div>
            );
          })}
        </div>

        <Button
          onClick={() => craftMutation.mutate({ recipeId: recipe.id })}
          disabled={!canCraft || craftMutation.isPending || isBlocked}
          className={`w-full text-xs h-7 ${
            canCraft 
              ? "bg-green-600 hover:bg-green-700 text-white" 
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          {craftMutation.isPending ? "Craftando..." : 
           isBlocked ? "🚫 Bloqueado" : 
           canCraft ? "🔨 Craftar" : "Indisponível"}
        </Button>
      </div>
    );
  };

  const categorizedRecipes = categorizeRecipes();

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">🔨 Central de Crafting Evolutivo</h3>
        <p className="text-sm text-gray-600">
          Sistema inteligente com carrossel para equipamentos evolutivos
        </p>
      </div>

      <div className="space-y-6">
        {Object.entries(categorizedRecipes).map(([categoryName, categoryRecipes]) => {
          if (categoryRecipes.length === 0) return null;

          const isExpanded = expandedCategories[categoryName];
          const { evolutionaryGroups, nonEvolutionary } = groupEvolutionaryRecipes(categoryRecipes);

          return (
            <div key={categoryName} className="border rounded-lg overflow-hidden">
              <button
                onClick={() => setExpandedCategories(prev => ({
                  ...prev,
                  [categoryName]: !prev[categoryName]
                }))}
                className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between text-left transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-gray-800">{categoryName}</span>
                  <span className="text-sm text-gray-500">({categoryRecipes.length})</span>
                </div>
                {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>

              {isExpanded && (
                <div className="p-4 space-y-4">
                  {/* Grupos evolutivos com carrossel em grid otimizado */}
                  {Object.keys(evolutionaryGroups).length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {Object.entries(evolutionaryGroups).map(([familyType, familyRecipes]) => (
                        <div key={familyType}>
                          {renderEvolutionaryCarousel(familyType, familyRecipes)}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Receitas não evolutivas em grid otimizado */}
                  {nonEvolutionary.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {nonEvolutionary.map(recipe => renderSimpleRecipe(recipe))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
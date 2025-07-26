import { useState } from "react";
import type { Recipe, Resource, StorageItem } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ChevronDown, ChevronRight } from "lucide-react";

interface CraftingTabProps {
  recipes: Recipe[];
  resources: Resource[];
  playerLevel: number;
  playerId: string;
  isBlocked?: boolean;
}

export default function EnhancedCraftingTab({ recipes, resources, playerLevel, playerId, isBlocked = false }: CraftingTabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    "Ferramentas": true,
    "Equipamentos": false,
    "Consumíveis": false,
    "Itens Especiais": false,
  });

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
      // Invalidate storage and inventory queries
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

  const getResourceData = (resourceId: string) => {
    return resources.find(r => r.id === resourceId);
  };

  const getStorageQuantity = (resourceId: string) => {
    const storageItem = storageItems.find(item => item.resourceId === resourceId);
    return storageItem?.quantity || 0;
  };

  const getRecipeIngredients = (recipe: Recipe) => {
    const ingredients = recipe.ingredients as Record<string, number>;
    return Object.entries(ingredients).map(([resourceId, quantity]) => ({
      resource: getResourceData(resourceId),
      quantity,
      available: getStorageQuantity(resourceId),
      hasEnough: getStorageQuantity(resourceId) >= quantity,
    }));
  };

  const canCraftRecipe = (recipe: Recipe) => {
    if (playerLevel < recipe.requiredLevel) return false;
    
    const ingredients = getRecipeIngredients(recipe);
    return ingredients.every(ingredient => ingredient.hasEnough);
  };

  const isRecipeUnlocked = (recipe: Recipe) => {
    return playerLevel >= recipe.requiredLevel;
  };

  const handleCraft = (recipe: Recipe) => {
    if (!canCraftRecipe(recipe)) return;
    craftMutation.mutate({ recipeId: recipe.id });
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const categorizeRecipes = (recipes: Recipe[]) => {
    const categories: Record<string, Recipe[]> = {
      "Ferramentas": [],
      "Equipamentos": [],
      "Consumíveis": [],
      "Itens Especiais": []
    };

    recipes.forEach(recipe => {
      const name = recipe.name.toLowerCase();
      
      if (name.includes("machado") || name.includes("picareta") || name.includes("vara") || name.includes("foice") || name.includes("pá") || name.includes("balde")) {
        categories["Ferramentas"].push(recipe);
      } else if (name.includes("capacete") || name.includes("peitoral") || name.includes("calças") || name.includes("botas") || name.includes("arco") || name.includes("lança") || name.includes("faca")) {
        categories["Equipamentos"].push(recipe);
      } else if (name.includes("suco") || name.includes("assados") || name.includes("grelhado") || name.includes("assada") || name.includes("ensopado")) {
        categories["Consumíveis"].push(recipe);
      } else {
        categories["Itens Especiais"].push(recipe);
      }
    });

    return categories;
  };

  const categorizedRecipes = categorizeRecipes(recipes);

  const renderRecipeCard = (recipe: Recipe) => {
    const ingredients = getRecipeIngredients(recipe);
    const unlocked = isRecipeUnlocked(recipe);
    const canCraft = canCraftRecipe(recipe);

    return (
      <div
        key={recipe.id}
        className={`recipe-card bg-white border-2 rounded-xl p-6 hover:shadow-lg transition-all ${
          canCraft 
            ? "border-green-200 hover:border-green-300" 
            : unlocked 
            ? "border-gray-200" 
            : "border-gray-300 opacity-60"
        }`}
      >
        <div className="text-center mb-4">
          <div className={`text-5xl mb-2 ${!unlocked ? "grayscale" : ""}`}>
            {recipe.emoji}
          </div>
          <h4 className={`text-lg font-bold ${unlocked ? "text-gray-800" : "text-gray-600"}`}>
            {recipe.name}
          </h4>
          <div className="flex items-center justify-center space-x-2 mt-1">
            {!unlocked && (
              <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                🔒 Nível {recipe.requiredLevel}
              </span>
            )}
            {unlocked && canCraft && (
              <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded">
                ✅ Disponível
              </span>
            )}
            {unlocked && !canCraft && (
              <span className="text-xs bg-yellow-100 text-yellow-600 px-2 py-1 rounded">
                ⚠️ Recursos insuficientes
              </span>
            )}
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <h5 className="text-sm font-semibold text-gray-700">Ingredientes:</h5>
          {ingredients.map(({ resource, quantity, available, hasEnough }) => (
            resource && (
              <div
                key={resource.id}
                className={`flex items-center justify-between text-sm ${
                  hasEnough ? "text-green-600" : "text-red-600"
                }`}
              >
                <span className="flex items-center space-x-1">
                  <span>{resource.emoji}</span>
                  <span>{resource.name}</span>
                </span>
                <span className="font-semibold">
                  {available}/{quantity}
                </span>
              </div>
            )
          ))}
        </div>

        <Button
          onClick={() => handleCraft(recipe)}
          disabled={!canCraft || craftMutation.isPending || isBlocked}
          className={`w-full ${
            canCraft 
              ? "bg-green-600 hover:bg-green-700 text-white" 
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          {craftMutation.isPending ? "Craftando..." : isBlocked ? "🚫 Bloqueado" : canCraft ? "🔨 Craftar" : "Indisponível"}
        </Button>
      </div>
    );
  };

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">🔨 Central de Crafting</h3>
        <p className="text-sm text-gray-600">
          Use recursos do seu armazém para criar equipamentos úteis
        </p>
      </div>

      {Object.entries(categorizedRecipes).map(([categoryName, categoryRecipes]) => {
        if (categoryRecipes.length === 0) return null;
        
        const isExpanded = expandedCategories[categoryName];
        
        return (
          <div key={categoryName} className="mb-6">
            <button
              onClick={() => toggleCategory(categoryName)}
              className="w-full flex items-center justify-between bg-gray-100 hover:bg-gray-200 rounded-lg p-4 mb-4 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <span className="text-lg">
                  {categoryName === "Ferramentas" && "🔧"}
                  {categoryName === "Equipamentos" && "⚔️"}
                  {categoryName === "Consumíveis" && "🍽️"}
                  {categoryName === "Itens Especiais" && "✨"}
                </span>
                <h4 className="text-lg font-semibold text-gray-800">{categoryName}</h4>
                <span className="text-sm text-gray-500">({categoryRecipes.length})</span>
              </div>
              {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
            </button>
            
            {isExpanded && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categoryRecipes.map(renderRecipeCard)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
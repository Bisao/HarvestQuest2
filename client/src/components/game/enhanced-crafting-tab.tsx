import { useState } from "react";
import type { Recipe, Resource, StorageItem, Equipment } from "@shared/types";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
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
    "Materiais": true,
    "Ferramentas": false,
    "Armas": false,
    "Equipamentos": false,
    "Utensílios": false,
    "Comidas": false,
  });

  // State for craft quantities
  const [craftQuantities, setCraftQuantities] = useState<Record<string, number>>({});

  // Get storage items to check available resources
  const { data: storageItems = [] } = useQuery<StorageItem[]>({
    queryKey: ["/api/storage", playerId],
    enabled: !!playerId,
  });

  const craftMutation = useMutation({
    mutationFn: async ({ recipeId, quantity = 1 }: { recipeId: string; quantity?: number }) => {
      try {
        const response = await fetch("/api/v2/craft", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ playerId, recipeId, quantity: quantity || 1 }),
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: "Erro desconhecido no servidor" }));
          console.error("Craft API Error:", errorData);
          throw new Error(errorData.message || `Erro HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        console.log("Craft Success:", result);
        return result;
      } catch (error) {
        console.error("Craft Error Details:", error);
        if (error instanceof Error) {
          throw error;
        }
        throw new Error("Erro de conexão com o servidor");
      }
    },
    onSuccess: (response) => {
      // Handle both wrapped and direct response formats
      const data = response.data || response;
      const quantity = data?.quantity || 1;
      const recipeName = data?.recipe?.name || data?.recipe || "Item";

      toast({
        title: "Item Craftado!",
        description: `${quantity}x ${recipeName} foi criado com sucesso!`,
      });

      // Reset craft quantity for this recipe
      if (data?.recipe?.id) {
        setCraftQuantities(prev => ({ ...prev, [data.recipe.id]: 1 }));
      }

      // CRITICAL: Force complete cache invalidation for real-time sync
      queryClient.removeQueries({ queryKey: ["/api/storage", playerId] });
      queryClient.removeQueries({ queryKey: ["/api/inventory", playerId] });
      queryClient.removeQueries({ queryKey: ["/api/player", playerId] });
      queryClient.removeQueries({ queryKey: ["/api/player", playerId, "quests"] });

      // Force immediate refetch
      queryClient.invalidateQueries({ queryKey: ["/api/storage", playerId] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory", playerId] });
      queryClient.invalidateQueries({ queryKey: ["/api/player/Player1"] });
      queryClient.invalidateQueries({ queryKey: ["/api/player", playerId, "quests"] });
    },
    onError: (error: any) => {
      console.error("Craft error:", error);
      toast({
        title: "Erro no Crafting",
        description: error.message || "Não foi possível craftar o item",
        variant: "destructive",
      });
    },
  });

  // Get resource data for ingredient resolution
  const getResourceData = (resourceId: string) => {
    // First: busca em resources
    const resource = resources.find(r => r.id === resourceId);
    if (resource) return resource;

    // Enhanced fallback mapping based on game-ids.ts
    let mappedName = "Item Desconhecido";
    let emoji = "📦";
    
    // Map common resource IDs to proper names
    if (resourceId.includes("barbante") || resourceId === "res-9d5a1f3e-7b8c-4e16-9a27-8c6e2f9b5dd1") {
      mappedName = "Barbante";
      emoji = "🧵";
    } else if (resourceId.includes("fibra") || resourceId === "res-8bd33b18-a241-4859-ae9f-870fab5673d0") {
      mappedName = "Fibra";
      emoji = "🌾";
    } else if (resourceId.includes("pedras") || resourceId.includes("stone")) {
      mappedName = "Pedras Soltas";
      emoji = "🗿";
    } else if (resourceId.includes("gravetos") || resourceId.includes("stick")) {
      mappedName = "Gravetos";
      emoji = "🪵";
    } else if (resourceId.includes("madeira") || resourceId.includes("wood")) {
      mappedName = "Madeira";
      emoji = "🪵";
    }
    
    return {
      id: resourceId,
      name: mappedName,
      emoji: emoji
    };
  };

  // Get available quantity in storage
  const getStorageQuantity = (resourceId: string) => {
    // Check storage items for resources
    const storageItem = storageItems.find(item => item.resourceId === resourceId);
    if (storageItem) return storageItem.quantity;

    // Check if this is actually a resource in the resources list
    const resourceData = resources.find(r => r.id === resourceId);
    if (resourceData) {
      const storageMatch = storageItems.find(item => item.resourceId === resourceId);
      return storageMatch ? storageMatch.quantity : 0;
    }

    return 0;
  };

  // Get recipe ingredients
  const getRecipeIngredients = (recipe: Recipe) => {
    if (!recipe.ingredients) return [];
    
    return recipe.ingredients.map(ingredient => {
      const resourceData = getResourceData(ingredient.itemId);
      const availableQuantity = getStorageQuantity(ingredient.itemId);
      
      return {
        ...ingredient,
        resourceData,
        availableQuantity,
        hasEnough: availableQuantity >= ingredient.quantity
      };
    });
  };

  // Calculate max craftable quantity
  const getMaxCraftable = (recipe: Recipe) => {
    const ingredients = getRecipeIngredients(recipe);
    if (ingredients.length === 0) return 0;
    
    return Math.min(
      ...ingredients.map(ing => Math.floor(ing.availableQuantity / ing.quantity))
    );
  };

  // Check if recipe can be crafted
  const canCraftRecipe = (recipe: Recipe) => {
    if (playerLevel < recipe.requiredLevel) return false;
    return getMaxCraftable(recipe) > 0;
  };

  // Handle craft action
  const handleCraft = (recipe: Recipe) => {
    if (isBlocked || !canCraftRecipe(recipe) || craftMutation.isPending) return;
    
    const quantity = craftQuantities[recipe.id] || 1;
    craftMutation.mutate({ recipeId: recipe.id, quantity });
  };

  // Categorize recipes
  const categorizedRecipes = recipes.reduce((acc, recipe) => {
    let category = "Materiais";
    
    if (recipe.category === "tools") category = "Ferramentas";
    else if (recipe.category === "weapons") category = "Armas";
    else if (recipe.category === "armor") category = "Equipamentos";
    else if (recipe.category === "consumables") category = "Comidas";
    else if (recipe.subcategory?.includes("cooking") || recipe.subcategory?.includes("container")) category = "Utensílios";
    
    if (!acc[category]) acc[category] = [];
    acc[category].push(recipe);
    
    return acc;
  }, {} as Record<string, Recipe[]>);

  // Render recipe card
  const renderRecipeCard = (recipe: Recipe) => {
    const ingredients = getRecipeIngredients(recipe);
    const maxCraftable = getMaxCraftable(recipe);
    const canCraft = canCraftRecipe(recipe);
    const currentQuantity = craftQuantities[recipe.id] || 1;

    return (
      <div
        key={recipe.id}
        className={`p-4 border-2 rounded-lg transition-all duration-200 ${
          canCraft 
            ? "border-green-200 bg-green-50 hover:bg-green-100" 
            : "border-gray-200 bg-gray-50"
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{recipe.emoji || "🔨"}</span>
            <div>
              <h4 className="font-semibold text-gray-800">{recipe.name}</h4>
              <p className="text-xs text-gray-500">Nível {recipe.requiredLevel}</p>
            </div>
          </div>
          {playerLevel < recipe.requiredLevel && (
            <span className="text-xs text-red-500 font-medium">Nível insuficiente</span>
          )}
        </div>

        {/* Ingredients */}
        <div className="mb-4">
          <h5 className="text-sm font-medium text-gray-700 mb-2">Ingredientes:</h5>
          <div className="space-y-1">
            {ingredients.map((ingredient, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span>{ingredient.resourceData.emoji}</span>
                  <span>{ingredient.resourceData.name}</span>
                </div>
                <span className={`font-medium ${
                  ingredient.hasEnough ? "text-green-600" : "text-red-500"
                }`}>
                  {ingredient.availableQuantity}/{ingredient.quantity}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quantity selector and craft button */}
        {canCraft && maxCraftable > 1 && (
          <div className="mb-3">
            <Label className="text-sm">Quantidade: {currentQuantity}</Label>
            <Slider
              value={[currentQuantity]}
              onValueChange={([value]) => {
                setCraftQuantities(prev => ({ ...prev, [recipe.id]: value }));
              }}
              max={maxCraftable}
              min={1}
              step={1}
              className="mt-2"
            />
          </div>
        )}

        <Button
          onClick={() => handleCraft(recipe)}
          disabled={!canCraft || isBlocked || craftMutation.isPending}
          className={`w-full ${
            canCraft 
              ? "bg-green-600 hover:bg-green-700 text-white" 
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          {craftMutation.isPending ? "Craftando..." : 
           !canCraft ? "Não pode craftar" : 
           `Craftar ${currentQuantity > 1 ? `(${currentQuantity}x)` : ""}`}
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

      {/* Horizontal Category Tabs */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-1 sm:gap-2 mb-6 border-b border-gray-200 overflow-x-auto">
          {Object.entries(categorizedRecipes).map(([categoryName, categoryRecipes]) => {
            if (categoryRecipes.length === 0) return null;

            return (
              <button
                key={categoryName}
                onClick={() => {
                  setExpandedCategories(prev => ({
                    ...prev,
                    [categoryName]: !prev[categoryName]
                  }));
                }}
                className={`px-3 py-2 rounded-t-lg text-sm font-medium whitespace-nowrap flex items-center gap-2 transition-colors ${
                  expandedCategories[categoryName]
                    ? "bg-blue-100 text-blue-700 border-b-2 border-blue-500"
                    : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                }`}
              >
                <span>
                  {categoryName === "Materiais" && "🧵"}
                  {categoryName === "Ferramentas" && "🔨"}
                  {categoryName === "Armas" && "⚔️"}
                  {categoryName === "Utensílios" && "🍳"}
                  {categoryName === "Comidas" && "🍽️"}
                </span>
                <span className="hidden sm:inline">{categoryName}</span>
                <span className="sm:hidden">{
                  categoryName === "Materiais" ? "Mat." :
                  categoryName === "Ferramentas" ? "Ferr." :
                  categoryName === "Armas" ? "Arm." :
                  categoryName === "Utensílios" ? "Uten." :
                  "Com."
                }</span>
                <span className="text-xs text-gray-500">({categoryRecipes.length})</span>
              </button>
            );
          })}
        </div>

        {/* Content for Active Category */}
        {Object.entries(categorizedRecipes).map(([categoryName, categoryRecipes]) => {
          if (categoryRecipes.length === 0 || !expandedCategories[categoryName]) return null;

          return (
            <div key={categoryName} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
              {categoryRecipes.map(renderRecipeCard)}
            </div>
          );
        })}
      </div>
    </div>
  );
}
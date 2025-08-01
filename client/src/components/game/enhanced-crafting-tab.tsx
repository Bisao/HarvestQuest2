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
      const response = await fetch("/api/v2/craft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId, recipeId, quantity: quantity || 1 }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erro no crafting");
      }
      return response.json();
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

    // Simple fallback for unknown resources

      return {
        id: resourceId,
        name: mappedName,
        emoji: mappedName === "Barbante" ? "🧵" : 
               mappedName === "Fibra" ? "🌾" :
               mappedName === "Pedras Soltas" ? "🗿" :
               mappedName === "Gravetos" ? "🪵" : "📦"
      };
    }

    // Final fallback
    return {
      id: resourceId,
      name: resourceId === "string" ? "Barbante" : resourceId,
      emoji: resourceId === "string" ? "🧵" : "📦"
    };
  };

  const getStorageQuantity = (resourceId: string) => {
    // Check storage items for resources
    const storageItem = storageItems.find(item => item.resourceId === resourceId);
    if (storageItem) return storageItem.quantity;

    // ID mapping for known inconsistencies
    const idMappings: Record<string, string> = {
      "res-9d5a1f3e-7b8c-4e16-9a27-8c6e2f9b5dd1": "Barbante",
      "res-8bd33b18-a241-4859-ae9f-870fab5673d0": "Fibra",
      "res-5e9d8c7a-3f2b-4e61-8a90-1c4b7e5f9d23": "Pedras Soltas",
      "res-2a8f5c1e-9b7d-4a63-8e52-9c1a6f8e4b37": "Gravetos"
    };

    // Try to find by mapped name
    const mappedName = idMappings[resourceId];
    if (mappedName) {
      const mappedResource = resources.find(r => r.name === mappedName);
      if (mappedResource) {
        const mappedStorageItem = storageItems.find(item => item.resourceId === mappedResource.id);
        return mappedStorageItem?.quantity || 0;
      }
    }

    // Equipment mappings fallback
    const equipmentMappings: Record<string, string> = {
      "string": "Barbante",
      "bamboo_bottle": "Garrafa de Bambu",
      "wooden_bucket": "Balde de Madeira",
      "rope": "Corda"
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

  // Get equipment data for ingredient resolution
  const { data: equipment = [] } = useQuery<Equipment[]>({
    queryKey: ["/api/equipment"],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const getRecipeIngredients = (recipe: Recipe) => {
    if (!recipe.ingredients || !Array.isArray(recipe.ingredients)) return [];

    return recipe.ingredients.map(ingredient => {
      // First try resources
      const resource = resources.find(r => r.id === ingredient.itemId);
      if (resource) {
        const available = storageItems.find(item => item.resourceId === ingredient.itemId)?.quantity || 0;
        return {
          resource,
          name: resource.name,
          emoji: resource.emoji,
          quantity: ingredient.quantity,
          available,
          hasEnough: available >= ingredient.quantity
        };
      }

      // Then try equipment
      const equipmentItem = equipment.find(e => e.id === ingredient.itemId);
      if (equipmentItem) {
        const available = storageItems.find(item => item.resourceId === ingredient.itemId)?.quantity || 0;
        return {
          resource: {
            id: equipmentItem.id,
            name: equipmentItem.name,
            emoji: equipmentItem.emoji
          },
          quantity: ingredient.quantity,
          available,
          hasEnough: available >= ingredient.quantity
        };
      }

      // Enhanced fallback system
      const fallbackResource = getResourceData(ingredient.itemId);
      const available = getStorageQuantity(ingredient.itemId);

      // Direct lookup without special handling

      return {
        resource: fallbackResource,
        quantity: ingredient.quantity,
        available,
        hasEnough: available >= ingredient.quantity
      };
    });
  };

  const canCraftRecipe = (recipe: Recipe, quantity = 1) => {
    if (playerLevel < recipe.requiredLevel) return false;

    const ingredients = getRecipeIngredients(recipe);
    return ingredients.every(ingredient => ingredient.available >= (ingredient.quantity * quantity));
  };

  const getMaxCraftableQuantity = (recipe: Recipe) => {
    if (playerLevel < recipe.requiredLevel) return 0;

    const ingredients = getRecipeIngredients(recipe);
    const maxQuantities = ingredients.map(ingredient => 
      Math.floor(ingredient.available / ingredient.quantity)
    );
    return Math.min(...maxQuantities, 99); // Cap at 99 for UI reasons
  };

  const isRecipeUnlocked = (recipe: Recipe) => {
    return playerLevel >= recipe.requiredLevel;
  };

  const handleCraft = (recipe: Recipe) => {
    const quantity = craftQuantities[recipe.id] || 1;
    if (!canCraftRecipe(recipe, quantity)) return;
    craftMutation.mutate({ recipeId: recipe.id, quantity });
  };

  const updateCraftQuantity = (recipeId: string, quantity: number) => {
    setCraftQuantities(prev => ({ ...prev, [recipeId]: Math.max(1, quantity) }));
  };

  const getCraftQuantity = (recipeId: string) => {
    return craftQuantities[recipeId] || 1;
  };

  const toggleCategory = (category: string) => {
    // Only show one category at a time (tab behavior)
    setExpandedCategories(prev => {
      const newState: Record<string, boolean> = {};
      Object.keys(prev).forEach(key => {
        newState[key] = key === category;
      });
      return newState;
    });
  };

  const categorizeRecipes = (recipes: Recipe[]) => {
    const categories: Record<string, Recipe[]> = {
      "Materiais": [],
      "Ferramentas": [],
      "Armas": [],
      "Equipamentos": [],
      "Utensílios": [],
      "Comidas": []
    };

    recipes.forEach(recipe => {
      const name = recipe.name.toLowerCase();

      // Materiais básicos
      if (name.includes("barbante") || name.includes("corda") || name.includes("isca")) {
        categories["Materiais"].push(recipe);
      }
      // Ferramentas de trabalho
      else if (name.includes("machado") || name.includes("picareta") || name.includes("foice") || name.includes("balde") || name.includes("vara")) {
        categories["Ferramentas"].push(recipe);
      }
      // Equipamentos de proteção e acessórios
      else if (name.includes("mochila") || name.includes("capacete") || name.includes("armadura") || name.includes("escudo")) {
        categories["Equipamentos"].push(recipe);
      }
      // Armas
      else if (name.includes("arco") || name.includes("lança") || name.includes("faca")) {
        categories["Armas"].push(recipe);
      }
      // Utensílios (cozinha e outros)
      else if (name.includes("panela") || name.includes("garrafa")) {
        categories["Utensílios"].push(recipe);
      }
      // Comidas e bebidas
      else if (name.includes("suco") || name.includes("assados") || name.includes("grelhado") || name.includes("assada") || name.includes("ensopado")) {
        categories["Comidas"].push(recipe);
      }
      // Fallback para materiais
      else {
        categories["Materiais"].push(recipe);
      }
    });

    return categories;
  };

  const categorizedRecipes = categorizeRecipes(recipes);

  const renderRecipeCard = (recipe: Recipe) => {
    const ingredients = getRecipeIngredients(recipe);
    const unlocked = isRecipeUnlocked(recipe);
    const maxQuantity = getMaxCraftableQuantity(recipe);
    const currentQuantity = getCraftQuantity(recipe.id);
    const canCraft = canCraftRecipe(recipe, currentQuantity);

    return (
      <div
        key={recipe.id}
        className={`recipe-card bg-white border-2 rounded-xl p-3 sm:p-6 hover:shadow-lg transition-all ${
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
                  available >= (quantity * currentQuantity) ? "text-green-600" : "text-red-600"
                }`}
              >
                <span className="flex items-center space-x-1">
                  <span>{resource.emoji}</span>
                  <span>{resource.name}</span>
                </span>
                <span className="font-semibold">
                  {available}/{quantity * currentQuantity}
                </span>
              </div>
            )
          ))}
        </div>

        {/* Quantity Slider */}
        {unlocked && maxQuantity > 1 && (
          <div className="mb-4">
            <Label className="text-sm font-semibold text-gray-700 mb-2 block">
              Quantidade: {currentQuantity} (Máx: {maxQuantity})
            </Label>
            <div className="px-2">
              <Slider
                value={[currentQuantity]}
                onValueChange={(value) => updateCraftQuantity(recipe.id, value[0])}
                max={maxQuantity}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1</span>
                <span>{maxQuantity}</span>
              </div>
            </div>
          </div>
        )}

        <Button
          onClick={() => handleCraft(recipe)}
          disabled={!canCraft || craftMutation.isPending || isBlocked || maxQuantity === 0}
          className={`w-full ${
            canCraft 
              ? "bg-green-600 hover:bg-green-700 text-white" 
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          {craftMutation.isPending ? "Craftando..." : 
           isBlocked ? "🚫 Bloqueado" : 
           canCraft ? `🔨 Craftar ${currentQuantity}x` : "Indisponível"}
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

            const isActive = expandedCategories[categoryName];

            return (
              <button
                key={categoryName}
                onClick={() => toggleCategory(categoryName)}
                className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 sm:py-3 rounded-t-lg font-medium transition-all whitespace-nowrap flex-shrink-0 text-xs sm:text-sm ${
                  isActive 
                    ? "bg-white border-t border-l border-r border-gray-300 text-gray-800 -mb-px" 
                    : "bg-gray-50 hover:bg-gray-100 text-gray-600 border-b border-gray-200"
                }`}
              >
                <span className="text-sm sm:text-lg">
                  {categoryName === "Materiais" && "🧵"}
                  {categoryName === "Ferramentas" && "🔧"}
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
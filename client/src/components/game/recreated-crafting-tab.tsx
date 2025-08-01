import { useState, useMemo } from "react";
import type { Recipe, Resource, StorageItem, Equipment } from "@shared/types";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ChevronDown, ChevronRight, Clock, Star, Zap } from "lucide-react";

interface RecreatedCraftingTabProps {
  recipes: Recipe[];
  resources: Resource[];
  playerLevel: number;
  playerId: string;
  isBlocked?: boolean;
}

// Enhanced recipe categorization with better organization
const CATEGORY_CONFIG = {
  "Materiais": {
    emoji: "🧵",
    shortName: "Mat.",
    description: "Materiais básicos e processados",
    priority: 1
  },
  "Ferramentas": {
    emoji: "🔨",
    shortName: "Ferr.",
    description: "Ferramentas para coleta e trabalho",
    priority: 2
  },
  "Armas": {
    emoji: "⚔️",
    shortName: "Arm.",
    description: "Armas para caça e defesa",
    priority: 3
  },
  "Equipamentos": {
    emoji: "🛡️",
    shortName: "Equip.",
    description: "Armaduras e proteções",
    priority: 4
  },
  "Utensílios": {
    emoji: "🍳",
    shortName: "Uten.",
    description: "Itens para cozinha e casa",
    priority: 5
  },
  "Comidas": {
    emoji: "🍽️",
    shortName: "Com.",
    description: "Alimentos e bebidas",
    priority: 6
  }
};

export default function RecreatedCraftingTab({ recipes, resources, playerLevel, playerId, isBlocked = false }: RecreatedCraftingTabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // State management
  const [activeCategory, setActiveCategory] = useState<string>("Materiais");
  const [craftQuantities, setCraftQuantities] = useState<Record<string, number>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [craftingInProgress, setCraftingInProgress] = useState<Record<string, boolean>>({});

  // Get storage items for ingredient checking
  const { data: storageItems = [] } = useQuery<StorageItem[]>({
    queryKey: ["/api/storage", playerId],
    enabled: !!playerId,
  });

  // Enhanced craft mutation with better error handling
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
        setCraftingInProgress(prev => ({ ...prev, [data.recipe.id]: false }));
      }

      // Force complete cache invalidation for real-time sync
      queryClient.removeQueries({ queryKey: ["/api/storage", playerId] });
      queryClient.removeQueries({ queryKey: ["/api/inventory", playerId] });
      queryClient.removeQueries({ queryKey: ["/api/player", playerId] });
      queryClient.removeQueries({ queryKey: ["/api/player", playerId, "quests"] });

      // Force immediate refetch
      queryClient.invalidateQueries({ queryKey: ["/api/storage", playerId] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory", playerId] });
      queryClient.invalidateQueries({ queryKey: ["/api/player", playerId] });
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

  // Enhanced resource resolution with fallback system
  const getResourceData = (resourceId: string) => {
    // Primary lookup in resources array
    const resource = resources.find(r => r.id === resourceId);
    if (resource) return resource;

    // Enhanced fallback mapping based on game-ids.ts
    const resourceMap: Record<string, { name: string; emoji: string }> = {
      "res-9d5a1f3e-7b8c-4e16-9a27-8c6e2f9b5dd1": { name: "Barbante", emoji: "🧵" },
      "res-8bd33b18-a241-4859-ae9f-870fab5673d0": { name: "Fibra", emoji: "🌾" },
      "res-a3f7e2d9-8c41-4b5e-9f73-1d6a8e4b2c95": { name: "Pedras Soltas", emoji: "🗿" },
      "res-b8e3f1a6-7d29-4c8e-a5f2-9b6e3d8a1c47": { name: "Gravetos", emoji: "🪵" },
      "res-c9d4e2b7-8a31-4f6e-b8g3-2c7f4e9b5d68": { name: "Madeira", emoji: "🪵" }
    };

    // Check direct mapping
    if (resourceMap[resourceId]) {
      return {
        id: resourceId,
        name: resourceMap[resourceId].name,
        emoji: resourceMap[resourceId].emoji
      };
    }

    // Pattern-based fallback
    let mappedName = "Item Desconhecido";
    let emoji = "📦";

    if (resourceId.includes("barbante")) {
      mappedName = "Barbante";
      emoji = "🧵";
    } else if (resourceId.includes("fibra")) {
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
    const storageItem = storageItems.find(item => item.resourceId === resourceId);
    return storageItem ? storageItem.quantity : 0;
  };

    // Enhanced recipe analysis
  const analyzeRecipe = (recipe: Recipe) => {
    if (!recipe.ingredients) return { ingredients: [], maxCraftable: 0, canCraft: false };

    const ingredients = recipe.ingredients.map(ingredient => {
      const resourceData = getResourceData(ingredient.itemId);
      const availableQuantity = getStorageQuantity(ingredient.itemId);

      return {
        ...ingredient,
        resourceData,
        availableQuantity,
        hasEnough: availableQuantity >= ingredient.quantity,
        shortage: Math.max(0, ingredient.quantity - availableQuantity)
      };
    });

    const maxCraftable = ingredients.length > 0 
      ? Math.min(...ingredients.map(ing => Math.floor(ing.availableQuantity / ing.quantity)))
      : 0;

    const canCraft = playerLevel >= recipe.requiredLevel && maxCraftable > 0;

    return { ingredients, maxCraftable, canCraft };
  };

  // Enhanced recipe categorization
  const categorizedRecipes = useMemo(() => {
    return recipes.reduce((acc, recipe) => {
      let category = "Materiais";

      // Enhanced categorization logic
      if (recipe.category === "tools" || recipe.subcategory?.includes("tool")) {
        category = "Ferramentas";
      } else if (recipe.category === "weapons" || recipe.subcategory?.includes("weapon")) {
        category = "Armas";
      } else if (recipe.category === "armor" || recipe.subcategory?.includes("armor")) {
        category = "Equipamentos";
      } else if (recipe.category === "consumables" || recipe.subcategory?.includes("food")) {
        category = "Comidas";
      } else if (recipe.subcategory?.includes("cooking") || recipe.subcategory?.includes("container")) {
        category = "Utensílios";
      } else if (recipe.category === "basic_materials" || recipe.subcategory?.includes("material")) {
        category = "Materiais";
      }

      if (!acc[category]) acc[category] = [];
      acc[category].push(recipe);

      return acc;
    }, {} as Record<string, Recipe[]>);
  }, [recipes]);

  // Filter recipes based on search query
  const filteredRecipes = useMemo(() => {
    if (!searchQuery.trim()) return categorizedRecipes[activeCategory] || [];

    const query = searchQuery.toLowerCase();
    return (categorizedRecipes[activeCategory] || []).filter(recipe =>
      recipe.name.toLowerCase().includes(query) ||
      recipe.category?.toLowerCase().includes(query) ||
      recipe.subcategory?.toLowerCase().includes(query)
    );
  }, [categorizedRecipes, activeCategory, searchQuery]);

  const canCraftRecipe = (recipe: Recipe) => {
    return analyzeRecipe(recipe).canCraft;
  }

  // Handle crafting action
  const handleCraft = (recipe: Recipe) => {
    if (isBlocked || !canCraftRecipe(recipe) || craftMutation.isPending || craftingInProgress[recipe.id]) return;

    // Mark this recipe as being crafted
    setCraftingInProgress(prev => ({ ...prev, [recipe.id]: true }));

    const quantity = craftQuantities[recipe.id] || 1;
    craftMutation.mutate({ recipeId: recipe.id, quantity });
  };

  // Get difficulty color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'trivial': return 'text-green-600';
      case 'easy': return 'text-blue-600';
      case 'normal': return 'text-yellow-600';
      case 'hard': return 'text-orange-600';
      case 'expert': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  // Render enhanced recipe card
  const renderRecipeCard = (recipe: Recipe) => {
    const { ingredients, maxCraftable, canCraft } = analyzeRecipe(recipe);
    const currentQuantity = craftQuantities[recipe.id] || 1;
    const isLevelLocked = playerLevel < recipe.requiredLevel;

    return (
      <Card
        key={recipe.id}
        className={`transition-all duration-200 hover:shadow-md ${
          canCraft 
            ? "border-green-200 bg-gradient-to-br from-green-50 to-white hover:border-green-300" 
            : isLevelLocked
            ? "border-red-200 bg-gradient-to-br from-red-50 to-white"
            : "border-gray-200 bg-gradient-to-br from-gray-50 to-white"
        }`}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{recipe.emoji || "🔨"}</span>
              <div>
                <CardTitle className="text-lg font-semibold text-gray-800">
                  {recipe.name}
                </CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    Nível {recipe.requiredLevel}
                  </Badge>
                  {recipe.difficulty && (
                    <Badge variant="secondary" className={`text-xs ${getDifficultyColor(recipe.difficulty)}`}>
                      {recipe.difficulty}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Status indicators */}
            <div className="flex flex-col items-end gap-1">
              {isLevelLocked && (
                <Badge variant="destructive" className="text-xs">
                  Bloqueado
                </Badge>
              )}
              {canCraft && (
                <Badge variant="default" className="text-xs bg-green-600">
                  Disponível
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Recipe info */}
          <div className="flex items-center gap-4 text-sm text-gray-600">
            {recipe.craftingTime && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{recipe.craftingTime}s</span>
              </div>
            )}
            {recipe.experienceGained && (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4" />
                <span>+{recipe.experienceGained} XP</span>
              </div>
            )}
            {recipe.successRate && recipe.successRate < 100 && (
              <div className="flex items-center gap-1">
                <Zap className="w-4 h-4" />
                <span>{recipe.successRate}%</span>
              </div>
            )}
          </div>

          {/* Ingredients */}
          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-2">Ingredientes:</h5>
            <div className="space-y-2">
              {ingredients.map((ingredient, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-white border">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{ingredient.resourceData.emoji}</span>
                    <span className="text-sm font-medium">{ingredient.resourceData.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${
                      ingredient.hasEnough ? "text-green-600" : "text-red-500"
                    }`}>
                      {ingredient.availableQuantity}/{ingredient.quantity}
                    </span>
                    {!ingredient.hasEnough && (
                      <Badge variant="outline" className="text-xs text-red-600">
                        Falta {ingredient.shortage}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quantity selector */}
          {canCraft && maxCraftable > 1 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Quantidade: {currentQuantity} (máx: {maxCraftable})
              </Label>
              <Slider
                value={[currentQuantity]}
                onValueChange={([value]) => {
                  setCraftQuantities(prev => ({ ...prev, [recipe.id]: value }));
                }}
                max={maxCraftable}
                min={1}
                step={1}
                className="w-full"
              />
            </div>
          )}

          {/* Craft button */}
          <Button
            onClick={() => handleCraft(recipe)}
            disabled={!canCraft || isBlocked || craftMutation.isPending || craftingInProgress[recipe.id]}
            className={`w-full font-medium ${
              canCraft 
                ? "bg-green-600 hover:bg-green-700 text-white" 
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {craftMutation.isPending || craftingInProgress[recipe.id] ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Craftando...
              </div>
            ) : !canCraft ? (
              isLevelLocked ? "Nível insuficiente" : "Recursos insuficientes"
            ) : (
              `Craftar ${currentQuantity > 1 ? `(${currentQuantity}x)` : ""}`
            )}
          </Button>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
          🔨 Central de Crafting
        </h3>
        <p className="text-gray-600">
          Use recursos do seu armazém para criar equipamentos úteis
        </p>
      </div>

      {/* Search Bar */}
      <div className="max-w-md">
        <input
          type="text"
          placeholder="Buscar receitas..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Category Tabs - Maintaining original horizontal layout */}
      <div className="border-b border-gray-200">
        <div className="flex flex-wrap gap-1 sm:gap-2 overflow-x-auto">
          {Object.entries(CATEGORY_CONFIG)
            .sort(([,a], [,b]) => a.priority - b.priority)
            .map(([categoryName, config]) => {
              const categoryRecipes = categorizedRecipes[categoryName] || [];
              if (categoryRecipes.length === 0) return null;

              const availableCount = categoryRecipes.filter(recipe => 
                analyzeRecipe(recipe).canCraft
              ).length;

              return (
                <button
                  key={categoryName}
                  onClick={() => {
                    setActiveCategory(categoryName);
                    setSearchQuery(""); // Clear search when switching categories
                  }}
                  className={`px-4 py-3 rounded-t-lg text-sm font-medium whitespace-nowrap flex items-center gap-2 transition-all duration-200 ${
                    activeCategory === categoryName
                      ? "bg-blue-100 text-blue-700 border-b-2 border-blue-500 shadow-sm"
                      : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                  }`}
                >
                  <span className="text-lg">{config.emoji}</span>
                  <span className="hidden sm:inline">{categoryName}</span>
                  <span className="sm:hidden">{config.shortName}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-500">({categoryRecipes.length})</span>
                    {availableCount > 0 && (
                      <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                        {availableCount}
                      </Badge>
                    )}
                  </div>
                </button>
              );
            })
          }
        </div>
      </div>

      {/* Recipe Grid - Maintaining original responsive grid layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {filteredRecipes.length > 0 ? (
          filteredRecipes.map(renderRecipeCard)
        ) : (
          <div className="col-span-full text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🔍</div>
            <h4 className="text-lg font-medium text-gray-600 mb-2">
              {searchQuery ? "Nenhuma receita encontrada" : "Nenhuma receita disponível"}
            </h4>
            <p className="text-gray-500">
              {searchQuery 
                ? `Tente buscar por outro termo ou verifique outra categoria`
                : `Esta categoria não possui receitas no momento`
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
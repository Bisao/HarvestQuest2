import { useState } from "react";
import type { Recipe, Resource, StorageItem } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface CraftingTabProps {
  recipes: Recipe[];
  resources: Resource[];
  playerLevel: number;
  playerId: string;
}

export default function EnhancedCraftingTab({ recipes, resources, playerLevel, playerId }: CraftingTabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">🔨 Central de Crafting</h3>
        <p className="text-sm text-gray-600">
          Use recursos do seu armazém para criar equipamentos úteis
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.map((recipe) => {
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

              <div className="mb-4">
                <h5 className="font-semibold text-sm mb-3 text-gray-700">
                  Materiais necessários:
                </h5>
                <div className="space-y-2">
                  {ingredients.map((ingredient, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{ingredient.resource?.emoji}</span>
                        <span className="text-gray-700">{ingredient.resource?.name}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className={`font-medium ${
                          ingredient.hasEnough ? "text-green-600" : "text-red-500"
                        }`}>
                          {ingredient.available}
                        </span>
                        <span className="text-gray-500">/ {ingredient.quantity}</span>
                        {ingredient.hasEnough ? (
                          <span className="text-green-500 text-xs">✓</span>
                        ) : (
                          <span className="text-red-500 text-xs">✗</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700">Resultado:</span>
                  <div className="flex items-center space-x-1">
                    <span className="text-lg">{recipe.emoji}</span>
                    <span className="text-sm font-medium">×1</span>
                  </div>
                </div>

                <Button
                  onClick={() => handleCraft(recipe)}
                  disabled={!canCraft || craftMutation.isPending}
                  className={`w-full ${
                    canCraft 
                      ? "bg-green-600 hover:bg-green-700 text-white" 
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {craftMutation.isPending ? (
                    "Craftando..."
                  ) : canCraft ? (
                    `🔨 Craftar ${recipe.name}`
                  ) : !unlocked ? (
                    `🔒 Nível ${recipe.requiredLevel} necessário`
                  ) : (
                    "❌ Recursos insuficientes"
                  )}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {recipes.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔨</div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Nenhuma receita disponível
          </h3>
          <p className="text-gray-500">
            Complete expedições para desbloquear receitas de crafting
          </p>
        </div>
      )}
    </div>
  );
}
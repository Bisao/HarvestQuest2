import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import type { Recipe, Resource, Player } from "@shared/schema";

interface CraftingTabProps {
  recipes: Recipe[];
  resources: Resource[];
  playerLevel: number;
  playerId: string;
}

export default function CraftingTab({ recipes, resources, playerLevel, playerId }: CraftingTabProps) {
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  // Get all resources including processed ones for storage checking
  const { data: allResources = [] } = useQuery({
    queryKey: ["/api/resources/all"],
  });

  // Get storage items to check availability
  const { data: storageItems = [] } = useQuery({
    queryKey: ["/api/storage", playerId],
  });

  const craftMutation = useMutation({
    mutationFn: async (recipeId: string) => {
      return apiRequest(`/api/craft`, {
        method: "POST",
        body: JSON.stringify({ playerId, recipeId }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Item criado com sucesso!",
        description: "O item foi adicionado ao seu armazém.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/storage"] });
      queryClient.invalidateQueries({ queryKey: ["/api/player"] });
      setIsDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar item",
        description: error.message || "Recursos insuficientes",
        variant: "destructive",
      });
    },
  });
  const getResourceData = (resourceId: string) => {
    return resources.find(r => r.id === resourceId);
  };

  const getRecipeIngredients = (recipe: Recipe) => {
    const ingredients = recipe.ingredients as Record<string, number>;
    return Object.entries(ingredients).map(([resourceId, quantity]) => ({
      resource: getResourceData(resourceId),
      quantity,
    }));
  };

  const isRecipeUnlocked = (recipe: Recipe) => {
    return playerLevel >= recipe.requiredLevel;
  };

  return (
    <div>
      <h3 className="text-xl font-semibold text-gray-800 mb-6">🔨 Central de Crafting</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.map((recipe) => {
          const ingredients = getRecipeIngredients(recipe);
          const unlocked = isRecipeUnlocked(recipe);

          return (
            <div
              key={recipe.id}
              className={`recipe-card bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow ${
                !unlocked ? "opacity-60" : ""
              }`}
            >
              <div className="text-center mb-4">
                <div className={`text-4xl mb-2 ${!unlocked ? "grayscale" : ""}`}>
                  {recipe.emoji}
                </div>
                <h4 className={`font-bold ${unlocked ? "text-gray-800" : "text-gray-600"}`}>
                  {recipe.name}
                </h4>
                <p className={`text-sm ${unlocked ? "text-gray-600" : "text-red-500"}`}>
                  {unlocked ? "Item básico de crafting" : `🔒 Requer nível ${recipe.requiredLevel}`}
                </p>
              </div>

              <div className="mb-4">
                <h5 className={`font-semibold text-sm mb-2 ${unlocked ? "text-gray-700" : "text-gray-500"}`}>
                  Materiais necessários:
                </h5>
                <div className={`flex items-center justify-center space-x-2 text-sm ${unlocked ? "" : "text-gray-500"}`}>
                  {ingredients.map((ingredient, index) => (
                    <div key={index} className="flex items-center">
                      {index > 0 && <span className="mx-1">+</span>}
                      <span className="flex items-center space-x-1">
                        <span className="text-lg">{ingredient.resource?.emoji}</span>
                        <span>×{ingredient.quantity}</span>
                      </span>
                    </div>
                  ))}
                  <span>=</span>
                  <span className="flex items-center space-x-1">
                    <span className="text-lg">{recipe.emoji}</span>
                    <span>×1</span>
                  </span>
                </div>
              </div>

              <button
                disabled={!unlocked}
                className={`w-full font-semibold py-3 px-4 rounded-lg transition-colors ${
                  unlocked
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-gray-400 text-gray-600 cursor-not-allowed"
                }`}
              >
                {unlocked ? "⚡ Craftar" : "🔒 Bloqueado"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

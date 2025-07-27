import type { Recipe, Resource, StorageItem } from "@shared/schema";
import { useState } from "react";
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface EvolutionaryCraftingTabProps {
  recipes: Recipe[];
  resources: Resource[];
  playerLevel: number;
  playerId: string;
  isBlocked?: boolean;
}

// Definir famílias de equipamentos evolutivos
const EQUIPMENT_FAMILIES = {
  axe: {
    name: "Machado",
    emoji: "🪓",
    levels: [
      { name: "Machado Improvisado", tier: "improvisado", level: 1 },
      { name: "Machado de Ferro", tier: "ferro", level: 8 },
      { name: "Machado Avançado", tier: "avancado", level: 15 },
    ]
  },
  pickaxe: {
    name: "Picareta", 
    emoji: "⛏️",
    levels: [
      { name: "Picareta Improvisada", tier: "improvisado", level: 1 },
      { name: "Picareta de Ferro", tier: "ferro", level: 10 },
      { name: "Picareta Avançada", tier: "avancado", level: 18 },
    ]
  }
};

const TIER_COLORS = {
  improvisado: "border-green-300 bg-green-50",
  ferro: "border-blue-300 bg-blue-50", 
  avancado: "border-purple-300 bg-purple-50"
};

export default function EvolutionaryCraftingTab({ recipes, resources, playerLevel, playerId, isBlocked = false }: EvolutionaryCraftingTabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedLevels, setSelectedLevels] = useState<Record<string, number>>({
    axe: 0,
    pickaxe: 0
  });
  
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    "Materiais": true,
    "Ferramentas Evolutivas": true,
    "Ferramentas": true,
    "Armas": false,
    "Equipamentos": false,
    "Utensílios": false,
    "Consumíveis": false,
  });

  // Get storage items to check available resources
  const { data: storageItems = [] } = useQuery<StorageItem[]>({
    queryKey: ["/api/storage", playerId],
    enabled: !!playerId,
  });

  // Craft mutation
  const craftMutation = useMutation({
    mutationFn: async (recipe: Recipe) => {
      return apiRequest(`/api/recipes/${recipe.id}/craft`, "POST", { playerId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/storage", playerId] });
      queryClient.invalidateQueries({ queryKey: ["/api/player/Player1"] });
      toast({
        title: "Item craftado com sucesso!",
        description: "O item foi criado e enviado para o armazém.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao craftar",
        description: error.message || "Não foi possível craftar o item.",
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

  // Categorizar receitas
  const categorizeRecipes = () => {
    const categories: Record<string, Recipe[]> = {
      "Materiais": [],
      "Ferramentas Evolutivas": [],
      "Ferramentas": [],
      "Armas": [],
      "Equipamentos": [],
      "Utensílios": [],
      "Consumíveis": [],
    };

    recipes.forEach(recipe => {
      // Check if it's an evolutionary recipe
      const isEvolutionary = Object.values(EQUIPMENT_FAMILIES).some(family =>
        family.levels.some(level => level.name === recipe.name)
      );

      if (isEvolutionary) {
        categories["Ferramentas Evolutivas"].push(recipe);
      } else if (recipe.name === "Barbante") {
        categories["Materiais"].push(recipe);
      } else if (["Faca", "Foice", "Pá de Madeira", "Vara de Pesca", "Balde de Madeira"].includes(recipe.name)) {
        categories["Ferramentas"].push(recipe);
      } else if (["Arco e Flecha", "Lança", "Espada de Pedra"].includes(recipe.name)) {
        categories["Armas"].push(recipe);
      } else if (["Mochila", "Capacete de Ferro", "Peitoral de Ferro"].includes(recipe.name)) {
        categories["Equipamentos"].push(recipe);
      } else if (["Garrafa de Bambu", "Panela", "Panela de Barro", "Isca para Pesca", "Corda"].includes(recipe.name)) {
        categories["Utensílios"].push(recipe);
      } else {
        categories["Consumíveis"].push(recipe);
      }
    });

    return categories;
  };

  const categorizedRecipes = categorizeRecipes();

  // Helper functions for crafting
  const getAvailableQuantity = (resourceId: string): number => {
    const item = storageItems.find(item => item.resourceId === resourceId);
    return item?.quantity || 0;
  };

  const handleCraft = async (recipe: Recipe) => {
    if (isBlocked) {
      toast({
        title: "Ação bloqueada",
        description: "Não é possível craftar durante uma expedição.",
        variant: "destructive",
      });
      return;
    }
    await craftMutation.mutateAsync(recipe);
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const navigateLevel = (familyKey: string, direction: 'prev' | 'next') => {
    const family = EQUIPMENT_FAMILIES[familyKey as keyof typeof EQUIPMENT_FAMILIES];
    const currentLevel = selectedLevels[familyKey];
    
    if (direction === 'prev' && currentLevel > 0) {
      setSelectedLevels(prev => ({ ...prev, [familyKey]: currentLevel - 1 }));
    } else if (direction === 'next' && currentLevel < family.levels.length - 1) {
      setSelectedLevels(prev => ({ ...prev, [familyKey]: currentLevel + 1 }));
    }
  };

  const EvolutionaryCard = ({ familyKey, family }: { familyKey: string, family: any }) => {
    const currentLevel = selectedLevels[familyKey];
    const levelData = family.levels[currentLevel];
    const recipe = categorizedRecipes["Ferramentas Evolutivas"].find(r => r.name === levelData.name);
    
    if (!recipe) return null;

    const ingredients = getRecipeIngredients(recipe);
    const unlocked = isRecipeUnlocked(recipe);
    
    // Check if we have enough materials
    const canCraft = ingredients.every(({ resource, quantity }) => {
      if (!resource) return false;
      const available = getAvailableQuantity(resource.id);
      return available >= quantity;
    });

    return (
      <div className={`border-2 rounded-lg p-4 ${TIER_COLORS[levelData.tier as keyof typeof TIER_COLORS]}`}>
        <div className="flex items-center justify-between mb-3">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigateLevel(familyKey, 'prev')}
            disabled={currentLevel === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="text-center flex-1">
            <div className={`text-3xl mb-1 ${!unlocked ? "grayscale" : ""}`}>
              {family.emoji}
            </div>
            <h4 className={`font-bold text-sm ${unlocked ? "text-gray-800" : "text-gray-600"}`}>
              {levelData.name}
            </h4>
            <p className={`text-xs ${unlocked ? "text-gray-600" : "text-red-500"}`}>
              {unlocked ? `${levelData.tier.toUpperCase()} • Nível ${levelData.level}` : `🔒 Requer nível ${recipe.requiredLevel}`}
            </p>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigateLevel(familyKey, 'next')}
            disabled={currentLevel === family.levels.length - 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="mb-3">
          <h5 className={`font-semibold text-xs mb-2 ${unlocked ? "text-gray-700" : "text-gray-500"}`}>
            Materiais necessários:
          </h5>
          <div className="space-y-1">
            {ingredients.map(({ resource, quantity }, index) => {
              if (!resource) return null;
              const available = getAvailableQuantity(resource.id);
              const hasEnough = available >= quantity;
              
              return (
                <div
                  key={index}
                  className={`flex items-center justify-between text-xs ${
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
              );
            })}
          </div>
        </div>

        <Button 
          onClick={() => handleCraft(recipe)}
          disabled={!unlocked || !canCraft || craftMutation.isPending || isBlocked}
          className={`w-full text-xs ${
            unlocked && canCraft 
              ? "bg-green-600 hover:bg-green-700 text-white" 
              : "bg-gray-400 text-gray-600 cursor-not-allowed"
          }`}
        >
          {craftMutation.isPending ? "Craftando..." : isBlocked ? "🚫 Bloqueado" : !unlocked ? "🔒 Bloqueado" : canCraft ? "🔨 Craftar" : "Indisponível"}
        </Button>
        
        {/* Indicador de progresso */}
        <div className="flex justify-center mt-2 space-x-1">
          {family.levels.map((_: any, index: number) => (
            <div 
              key={index}
              className={`w-2 h-2 rounded-full ${
                index === currentLevel ? "bg-gray-600" : "bg-gray-300"
              }`}
            />
          ))}
        </div>
      </div>
    );
  };

  const RegularRecipeCard = ({ recipe }: { recipe: Recipe }) => {
    const ingredients = getRecipeIngredients(recipe);
    const unlocked = isRecipeUnlocked(recipe);
    
    const canCraft = unlocked && ingredients.every(({ resource, quantity }) => {
      if (!resource) return false;
      const available = getAvailableQuantity(resource.id);
      return available >= quantity;
    });

    return (
      <div className={`bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow ${!unlocked ? "opacity-60" : ""}`}>
        <div className="text-center mb-3">
          <div className={`text-2xl mb-1 ${!unlocked ? "grayscale" : ""}`}>
            {recipe.emoji}
          </div>
          <h4 className={`font-bold text-sm ${unlocked ? "text-gray-800" : "text-gray-600"}`}>
            {recipe.name}
          </h4>
          <p className={`text-xs ${unlocked ? "text-gray-600" : "text-red-500"}`}>
            {unlocked ? "Disponível" : `🔒 Requer nível ${recipe.requiredLevel}`}
          </p>
        </div>

        <div className="space-y-2 mb-4">
          <h5 className="text-xs font-semibold text-gray-700">Ingredientes:</h5>
          {ingredients.map(({ resource, quantity }, index) => {
            if (!resource) return null;
            const available = getAvailableQuantity(resource.id);
            const hasEnough = available >= quantity;
            
            return (
              <div
                key={index}
                className={`flex items-center justify-between text-xs ${
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
            );
          })}
        </div>

        <Button
          onClick={() => handleCraft(recipe)}
          disabled={!canCraft || craftMutation.isPending || isBlocked}
          className={`w-full text-xs ${
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
          Use recursos do seu armazém para criar equipamentos e itens. {isBlocked && "⚠️ Bloqueado durante expedição."}
        </p>
      </div>

      <ScrollArea className="h-96 w-full">
        <div className="space-y-6">
          {Object.entries(categorizedRecipes).map(([category, categoryRecipes]) => {
            if (categoryRecipes.length === 0) return null;
            
            const isExpanded = expandedCategories[category];
            
            return (
              <div key={category} className="bg-gray-50 rounded-lg border border-gray-200">
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-100 transition-colors rounded-t-lg"
                >
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-gray-800">{category}</span>
                    <span className="text-sm text-gray-500">({categoryRecipes.length})</span>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  )}
                </button>
                
                {isExpanded && (
                  <div className="p-4 border-t border-gray-200">
                    {category === "Ferramentas Evolutivas" ? (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {Object.entries(EQUIPMENT_FAMILIES).map(([key, family]) => (
                            <EvolutionaryCard key={key} familyKey={key} family={family} />
                          ))}
                        </div>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                          <p className="text-sm text-blue-700 mb-1">
                            💡 <strong>Dica:</strong> Use as setas ← → para navegar entre diferentes níveis
                          </p>
                          <p className="text-xs text-blue-600">
                            Equipamentos avançados têm maior eficiência e durabilidade
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {categoryRecipes.map((recipe) => (
                          <RegularRecipeCard key={recipe.id} recipe={recipe} />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
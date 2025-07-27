import { useState } from "react";
import type { Recipe, Resource, StorageItem } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ChevronDown, ChevronRight, Filter } from "lucide-react";

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
    "Materiais Básicos": true,
    "Ferramentas Evolutivas": true,
    "Ferramentas Especializadas": false,
    "Armas Evolutivas": false,
    "Armas Adicionais": false,
    "Armaduras Evolutivas": false,
    "Equipamentos Utilitários": false,
    "Utensílios de Cozinha": false,
    "Consumíveis": false,
  });

  // Sistema de filtros por tier para cada categoria
  const [tierFilters, setTierFilters] = useState<Record<string, string>>({
    "Ferramentas Evolutivas": "all",
    "Ferramentas Especializadas": "all", 
    "Armas Evolutivas": "all",
    "Armas Adicionais": "all",
    "Armaduras Evolutivas": "all",
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
    // First try to find in resources
    const resource = resources.find(r => r.id === resourceId);
    if (resource) return resource;
    
    // If not found, it might be an equipment name (like "string", "bamboo_bottle", etc.)
    // Return a placeholder with the resourceId as name for display
    return {
      id: resourceId,
      name: resourceId === "string" ? "Barbante" :
            resourceId === "bamboo_bottle" ? "Garrafa de Bambu" :
            resourceId === "clay_pot" ? "Panela de Barro" :
            resourceId === "rope" ? "Corda" :
            resourceId,
      emoji: resourceId === "string" ? "🧵" :
             resourceId === "bamboo_bottle" ? "🎍" :
             resourceId === "clay_pot" ? "🏺" :
             resourceId === "rope" ? "🪢" :
             "📦",
      weight: 1,
      value: 1,
      type: "basic",
      rarity: "common",
      requiredTool: null,
      experienceValue: 1
    };
  };

  const getStorageQuantity = (resourceId: string) => {
    // Check storage items for resources
    const storageItem = storageItems.find(item => item.resourceId === resourceId);
    if (storageItem) return storageItem.quantity;
    
    // For equipment items (like "string", "bamboo_bottle"), check by name match
    const equipmentMappings: Record<string, string> = {
      "string": "Barbante",
      "bamboo_bottle": "Garrafa de Bambu",
      "clay_pot": "Panela de Barro",
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

  const setTierFilter = (category: string, tier: string) => {
    setTierFilters(prev => ({
      ...prev,
      [category]: tier
    }));
  };

  // Função para detectar o tier de um item baseado no nome
  const getItemTier = (recipeName: string): string => {
    const name = recipeName.toLowerCase();
    
    // Tier 1 - Básico/Improvisado/Simples
    if (name.includes("improvisad") || name.includes("simples") || name.includes("de pedra") || 
        name.includes("de madeira") || name.includes("de couro")) {
      return "basic";
    }
    
    // Tier 2 - Ferro/Reforçado/Composto
    if (name.includes("de ferro") || name.includes("reforçad") || name.includes("composto") || 
        name.includes("guerra")) {
      return "iron";
    }
    
    // Tier 3 - Avançado/Elite/Élfico/Mágico
    if (name.includes("avançad") || name.includes("elite") || name.includes("élf") || 
        name.includes("mágic") || name.includes("druíd") || name.includes("caçador") ||
        name.includes("ancestral") || name.includes("titãs") || name.includes("dimensional")) {
      return "advanced";
    }
    
    return "basic"; // default
  };

  // Filtrar receitas por tier se aplicável
  const filterRecipesByTier = (categoryRecipes: Recipe[], category: string): Recipe[] => {
    const tierFilter = tierFilters[category];
    if (!tierFilter || tierFilter === "all") {
      return categoryRecipes;
    }
    
    return categoryRecipes.filter(recipe => getItemTier(recipe.name) === tierFilter);
  };

  const categorizeRecipes = (recipes: Recipe[]) => {
    const categories: Record<string, Recipe[]> = {
      "Materiais Básicos": [],
      "Ferramentas Evolutivas": [],
      "Ferramentas Especializadas": [],
      "Armas Evolutivas": [],
      "Armas Adicionais": [],
      "Armaduras Evolutivas": [],
      "Equipamentos Utilitários": [],
      "Utensílios de Cozinha": [],
      "Consumíveis": []
    };

    recipes.forEach(recipe => {
      const name = recipe.name.toLowerCase();
      
      // Materiais básicos para crafting
      if (name.includes("barbante") || name.includes("cola natural")) {
        categories["Materiais Básicos"].push(recipe);
      }
      // Ferramentas evolutivas principais
      else if (name.includes("machado") || name.includes("picareta")) {
        categories["Ferramentas Evolutivas"].push(recipe);
      }
      // Ferramentas especializadas
      else if (name.includes("pá") || name.includes("vara") || 
               name.includes("foice") || name.includes("faca") || 
               name.includes("balde")) {
        categories["Ferramentas Especializadas"].push(recipe);
      }
      // Armas evolutivas principais (espadas e arcos)
      else if (name.includes("espada") || name.includes("arco")) {
        categories["Armas Evolutivas"].push(recipe);
      }
      // Armas adicionais
      else if (name.includes("lança") || name.includes("besta") || 
               name.includes("clava") || name.includes("martelo")) {
        categories["Armas Adicionais"].push(recipe);
      }
      // Armaduras e equipamentos de proteção
      else if (name.includes("capacete") || name.includes("peitoral") || 
               name.includes("calças") || name.includes("botas") ||
               name.includes("mochila") || name.includes("bolsa")) {
        categories["Armaduras Evolutivas"].push(recipe);
      }
      // Equipamentos utilitários diversos
      else if (name.includes("corda") || name.includes("isca") ||
               name.includes("armadilha")) {
        categories["Equipamentos Utilitários"].push(recipe);
      }
      // Utensílios de cozinha
      else if (name.includes("panela") || name.includes("garrafa")) {
        categories["Utensílios de Cozinha"].push(recipe);
      }
      // Comidas e bebidas
      else if (name.includes("suco") || name.includes("assados") || 
               name.includes("grelhado") || name.includes("assada") || 
               name.includes("ensopado") || name.includes("chá") ||
               name.includes("nozes") || name.includes("raízes") ||
               name.includes("carne") || name.includes("cogumelos") ||
               name.includes("torta") || name.includes("sopa") ||
               name.includes("hidromél")) {
        categories["Consumíveis"].push(recipe);
      }
      // Fallback para itens não categorizados
      else {
        console.log(`Recipe não categorizada: ${recipe.name}`);
        categories["Materiais Básicos"].push(recipe);
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
        const hasTierFilter = tierFilters[categoryName] !== undefined;
        const filteredRecipes = filterRecipesByTier(categoryRecipes, categoryName);
        const currentTier = tierFilters[categoryName] || "all";
        
        return (
          <div key={categoryName} className="mb-6">
            <button
              onClick={() => toggleCategory(categoryName)}
              className="w-full flex items-center justify-between bg-gray-100 hover:bg-gray-200 rounded-lg p-4 mb-4 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <span className="text-lg">
                  {categoryName === "Materiais Básicos" && "🧵"}
                  {categoryName === "Ferramentas Evolutivas" && "🔧"}
                  {categoryName === "Ferramentas Especializadas" && "⚒️"}
                  {categoryName === "Armas Evolutivas" && "⚔️"}
                  {categoryName === "Armas Adicionais" && "🛡️"}
                  {categoryName === "Armaduras Evolutivas" && "🥾"}
                  {categoryName === "Equipamentos Utilitários" && "🎒"}
                  {categoryName === "Utensílios de Cozinha" && "🍽️"}
                  {categoryName === "Consumíveis" && "🍖"}
                </span>
                <h4 className="text-lg font-semibold text-gray-800">{categoryName}</h4>
                <span className="text-sm text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                  {filteredRecipes.length} {filteredRecipes.length === 1 ? 'receita' : 'receitas'}
                </span>
              </div>
              {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
            </button>
            
            {isExpanded && (
              <div>
                {/* Filtros de Tier para categorias evolutivas */}
                {hasTierFilter && (
                  <div className="mb-4 flex flex-wrap gap-2">
                    <span className="text-sm font-medium text-gray-600 flex items-center">
                      <Filter size={16} className="mr-1" /> Filtrar por nível:
                    </span>
                    <button
                      onClick={() => setTierFilter(categoryName, "all")}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        currentTier === "all" 
                          ? "bg-blue-500 text-white" 
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      Todos
                    </button>
                    <button
                      onClick={() => setTierFilter(categoryName, "basic")}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        currentTier === "basic" 
                          ? "bg-amber-500 text-white" 
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      🥉 Básico
                    </button>
                    <button
                      onClick={() => setTierFilter(categoryName, "iron")}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        currentTier === "iron" 
                          ? "bg-blue-600 text-white" 
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      🥈 Ferro
                    </button>
                    <button
                      onClick={() => setTierFilter(categoryName, "advanced")}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        currentTier === "advanced" 
                          ? "bg-purple-600 text-white" 
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      🥇 Avançado
                    </button>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredRecipes.map(renderRecipeCard)}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
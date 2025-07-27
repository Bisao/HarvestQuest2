import { useState } from "react";
import type { Recipe, Resource, StorageItem } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ChevronDown, ChevronRight, ChevronLeft, ChevronRight as ChevronRightIcon } from "lucide-react";

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

  // Sistema de carrossel para mostrar diferentes tiers do mesmo item
  const [carouselIndices, setCarouselIndices] = useState<Record<string, number>>({});

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

  // Função para agrupar receitas por tipo base (ex: todas as variações de Machado)
  const groupRecipesByBaseType = (recipes: Recipe[]): Record<string, Recipe[]> => {
    const groups: Record<string, Recipe[]> = {};
    
    recipes.forEach(recipe => {
      const name = recipe.name.toLowerCase();
      let baseType = "";
      
      // Identificar tipo base removendo qualificadores
      if (name.includes("machado")) baseType = "Machado";
      else if (name.includes("picareta")) baseType = "Picareta";
      else if (name.includes("pá")) baseType = "Pá";
      else if (name.includes("vara")) baseType = "Vara de Pesca";
      else if (name.includes("foice")) baseType = "Foice";
      else if (name.includes("faca")) baseType = "Faca";
      else if (name.includes("balde")) baseType = "Balde";
      else if (name.includes("espada")) baseType = "Espada";
      else if (name.includes("arco")) baseType = "Arco";
      else if (name.includes("lança")) baseType = "Lança";
      else if (name.includes("besta")) baseType = "Besta";
      else if (name.includes("clava") || name.includes("martelo")) baseType = "Martelo";
      else if (name.includes("capacete")) baseType = "Capacete";
      else if (name.includes("peitoral")) baseType = "Peitoral";
      else if (name.includes("calças")) baseType = "Calças";
      else if (name.includes("botas")) baseType = "Botas";
      else if (name.includes("mochila")) baseType = "Mochila";
      else if (name.includes("bolsa")) baseType = "Bolsa";
      else baseType = recipe.name; // fallback para itens únicos
      
      if (!groups[baseType]) {
        groups[baseType] = [];
      }
      groups[baseType].push(recipe);
    });
    
    // Ordenar cada grupo por tier (básico -> ferro -> avançado)
    Object.keys(groups).forEach(baseType => {
      groups[baseType].sort((a, b) => {
        const getTierOrder = (name: string) => {
          const n = name.toLowerCase();
          if (n.includes("improvisad") || n.includes("simples") || n.includes("de pedra") || n.includes("de madeira") || n.includes("de couro")) return 1;
          if (n.includes("de ferro") || n.includes("reforçad") || n.includes("composto") || n.includes("guerra")) return 2;
          return 3; // avançado/elite/élfico
        };
        return getTierOrder(a.name) - getTierOrder(b.name);
      });
    });
    
    return groups;
  };

  const navigateCarousel = (baseType: string, direction: number, maxIndex: number) => {
    setCarouselIndices(prev => {
      const currentIndex = prev[baseType] || 0;
      const newIndex = currentIndex + direction;
      return {
        ...prev,
        [baseType]: Math.max(0, Math.min(newIndex, maxIndex))
      };
    });
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

  const renderCarouselCard = (baseType: string, recipeGroup: Recipe[]) => {
    const currentIndex = carouselIndices[baseType] || 0;
    const maxIndex = Math.min(recipeGroup.length - 1, Math.max(0, recipeGroup.length - 1));
    const actualIndex = Math.min(currentIndex, maxIndex);
    const recipe = recipeGroup[actualIndex];
    
    if (!recipe) return null;

    const ingredients = getRecipeIngredients(recipe);
    const unlocked = isRecipeUnlocked(recipe);
    const canCraft = canCraftRecipe(recipe);

    // Determinar tier e cor
    const getTierInfo = (recipeName: string) => {
      const name = recipeName.toLowerCase();
      if (name.includes("improvisad") || name.includes("simples") || name.includes("de pedra") || name.includes("de madeira") || name.includes("de couro")) {
        return { tier: "IMPROVISADO", level: "Nível 1", color: "border-amber-300 bg-amber-50" };
      }
      if (name.includes("de ferro") || name.includes("reforçad") || name.includes("composto") || name.includes("guerra")) {
        return { tier: "FERRO", level: "Nível 2", color: "border-blue-300 bg-blue-50" };
      }
      return { tier: "AVANÇADO", level: "Nível 3", color: "border-purple-300 bg-purple-50" };
    };

    const tierInfo = getTierInfo(recipe.name);

    return (
      <div
        key={`${baseType}-${actualIndex}`}
        className={`recipe-card border-2 rounded-xl p-6 hover:shadow-lg transition-all relative ${tierInfo.color} ${
          canCraft 
            ? "shadow-md" 
            : unlocked 
            ? "" 
            : "opacity-60"
        }`}
      >
        {/* Navegação do carrossel */}
        {recipeGroup.length > 1 && (
          <>
            <button
              onClick={() => navigateCarousel(baseType, -1, maxIndex)}
              disabled={actualIndex === 0}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-white border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed z-10"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => navigateCarousel(baseType, 1, maxIndex)}
              disabled={actualIndex === maxIndex}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-white border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed z-10"
            >
              <ChevronRightIcon size={16} />
            </button>
          </>
        )}

        <div className="text-center mb-4">
          <div className={`text-5xl mb-2 ${!unlocked ? "grayscale" : ""}`}>
            {recipe.emoji}
          </div>
          <h4 className={`text-lg font-bold ${unlocked ? "text-gray-800" : "text-gray-600"}`}>
            {recipe.name}
          </h4>
          <div className="text-xs font-medium text-gray-600 mb-2">
            {tierInfo.tier} • {tierInfo.level}
          </div>
          
          {/* Indicadores de pontos do carrossel */}
          {recipeGroup.length > 1 && (
            <div className="flex justify-center space-x-1 mb-2">
              {recipeGroup.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === actualIndex ? "bg-gray-600" : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
          )}

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
          <h5 className="text-sm font-semibold text-gray-700">Materiais necessários:</h5>
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
        const shouldUseCarousel = ["Ferramentas Evolutivas", "Ferramentas Especializadas", "Armas Evolutivas", "Armas Adicionais", "Armaduras Evolutivas"].includes(categoryName);
        
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
                  {shouldUseCarousel ? Object.keys(groupRecipesByBaseType(categoryRecipes)).length : categoryRecipes.length} {shouldUseCarousel ? 'tipos' : 'receitas'}
                </span>
              </div>
              {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
            </button>
            
            {isExpanded && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {shouldUseCarousel ? (
                  // Renderizar carrossel para categorias evolutivas
                  Object.entries(groupRecipesByBaseType(categoryRecipes)).map(([baseType, recipeGroup]) => 
                    renderCarouselCard(baseType, recipeGroup)
                  )
                ) : (
                  // Renderizar cards normais para outras categorias
                  categoryRecipes.map(recipe => renderCarouselCard(recipe.name, [recipe]))
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
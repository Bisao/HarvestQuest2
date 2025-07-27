import type { Recipe, Resource } from "@shared/schema";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

interface EvolutionaryCraftingTabProps {
  recipes: Recipe[];
  resources: Resource[];
  playerLevel: number;
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

export default function EvolutionaryCraftingTab({ recipes, resources, playerLevel }: EvolutionaryCraftingTabProps) {
  const [selectedLevels, setSelectedLevels] = useState<Record<string, number>>({
    axe: 0,
    pickaxe: 0
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

  // Separar receitas por tipo
  const evolutionaryRecipes = recipes.filter(recipe => 
    Object.values(EQUIPMENT_FAMILIES).some(family =>
      family.levels.some(level => level.name === recipe.name)
    )
  );

  const basicRecipes = recipes.filter(recipe => 
    !Object.values(EQUIPMENT_FAMILIES).some(family =>
      family.levels.some(level => level.name === recipe.name)
    )
  );

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
    const recipe = evolutionaryRecipes.find(r => r.name === levelData.name);
    
    if (!recipe) return null;

    const ingredients = getRecipeIngredients(recipe);
    const unlocked = isRecipeUnlocked(recipe);

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
          <div className={`flex items-center justify-center space-x-1 text-xs ${unlocked ? "" : "text-gray-500"}`}>
            {ingredients.map((ingredient, index) => (
              <div key={index} className="flex items-center">
                {index > 0 && <span className="mx-1">+</span>}
                <span className="flex items-center space-x-1">
                  <span>{ingredient.resource?.emoji}</span>
                  <span>×{ingredient.quantity}</span>
                </span>
              </div>
            ))}
            <span>=</span>
            <span className="flex items-center space-x-1">
              <span>{recipe.emoji}</span>
              <span>×1</span>
            </span>
          </div>
        </div>

        <Button 
          className={`w-full text-xs ${unlocked ? "bg-green-600 hover:bg-green-700 text-white" : "bg-gray-400 text-gray-600 cursor-not-allowed"}`}
          disabled={!unlocked}
        >
          {unlocked ? "🔨 Criar Item" : "🔒 Bloqueado"}
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

  return (
    <div>
      <h3 className="text-xl font-semibold text-gray-800 mb-6">🔨 Central de Crafting Evolutivo</h3>
      
      <Tabs defaultValue="evolutivos" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="evolutivos">⚡ Equipamentos Evolutivos</TabsTrigger>
          <TabsTrigger value="basicos">🔧 Receitas Básicas</TabsTrigger>
        </TabsList>
        
        <TabsContent value="evolutivos">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {Object.entries(EQUIPMENT_FAMILIES).map(([key, family]) => (
              <EvolutionaryCard key={key} familyKey={key} family={family} />
            ))}
          </div>
          
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-600 mb-2">
              💡 <strong>Dica:</strong> Use as setas ← → para navegar entre diferentes níveis do mesmo equipamento
            </p>
            <p className="text-xs text-gray-500">
              Equipamentos avançados têm maior eficiência e durabilidade
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="basicos">
          <ScrollArea className="h-96 w-full rounded-md border p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {basicRecipes.map((recipe) => {
                const ingredients = getRecipeIngredients(recipe);
                const unlocked = isRecipeUnlocked(recipe);

                return (
                  <div
                    key={recipe.id}
                    className={`bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow ${
                      !unlocked ? "opacity-60" : ""
                    }`}
                  >
                    <div className="text-center mb-3">
                      <div className={`text-2xl mb-1 ${!unlocked ? "grayscale" : ""}`}>
                        {recipe.emoji}
                      </div>
                      <h4 className={`font-bold text-sm ${unlocked ? "text-gray-800" : "text-gray-600"}`}>
                        {recipe.name}
                      </h4>
                      <p className={`text-xs ${unlocked ? "text-gray-600" : "text-red-500"}`}>
                        {unlocked ? "Item básico" : `🔒 Requer nível ${recipe.requiredLevel}`}
                      </p>
                    </div>

                    <div className="mb-3">
                      <div className={`flex items-center justify-center space-x-1 text-xs ${unlocked ? "" : "text-gray-500"}`}>
                        {ingredients.map((ingredient, index) => (
                          <div key={index} className="flex items-center">
                            {index > 0 && <span className="mx-1">+</span>}
                            <span className="flex items-center space-x-1">
                              <span>{ingredient.resource?.emoji}</span>
                              <span>×{ingredient.quantity}</span>
                            </span>
                          </div>
                        ))}
                        <span>=</span>
                        <span className="flex items-center space-x-1">
                          <span>{recipe.emoji}</span>
                          <span>×1</span>
                        </span>
                      </div>
                    </div>

                    <Button 
                      className={`w-full text-xs ${unlocked ? "bg-green-600 hover:bg-green-700 text-white" : "bg-gray-400 text-gray-600 cursor-not-allowed"}`}
                      disabled={!unlocked}
                    >
                      {unlocked ? "🔨 Criar Item" : "🔒 Bloqueado"}
                    </Button>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
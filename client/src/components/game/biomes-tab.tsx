import type { Biome, Resource, Equipment, Player } from "@shared/schema";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ActiveExpedition {
  biomeId: string;
  progress: number;
  selectedResources: string[];
}

interface BiomeWithAutoRepeat extends Biome {
  autoRepeatEnabled?: boolean;
  autoRepeatCountdown?: number;
  lastExpeditionResources?: string[];
}

interface BiomesTabProps {
  biomes: BiomeWithAutoRepeat[];
  resources: Resource[];
  player: Player | null;
  activeExpedition: ActiveExpedition | null;
  onExploreBiome: (biome: Biome) => void;
  onCompleteExpedition: (expeditionId: string) => void;
  onToggleAutoRepeat?: (biomeId: string) => void;
}

// Componente para organizar recursos em categorias com abas
function BiomeResourceTabs({ biomeResources, unlocked }: { biomeResources: Resource[], unlocked: boolean }) {
  const [activeTab, setActiveTab] = useState("animais");

  // Categorizar recursos
  const categorizeResources = (resources: Resource[]) => {
    const categories = {
      animais: resources.filter(r => 
        ["Coelho", "Esquilo", "Rato do Campo", "Veado", "Raposa", "Lobo", "Javali", "Urso", "Pato Selvagem", "Faisão"].includes(r.name)
      ),
      peixes: resources.filter(r => 
        ["Peixe Pequeno", "Peixe Grande", "Salmão", "Truta", "Enguia"].includes(r.name)
      ),
      plantas: resources.filter(r => 
        ["Cogumelos", "Frutas Silvestres", "Ervas Medicinais", "Nozes", "Flores Silvestres", "Raízes", "Mel Selvagem", "Resina de Árvore"].includes(r.name)
      ),
      basicos: resources.filter(r => 
        ["Fibra", "Pedra", "Pedras Soltas", "Gravetos", "Água Fresca", "Bambu", "Madeira", "Argila"].includes(r.name)
      )
    };
    return categories;
  };

  const categories = categorizeResources(biomeResources);

  const tabsData = [
    { id: "animais", name: "🐰 Animais", resources: categories.animais },
    { id: "peixes", name: "🐟 Peixes", resources: categories.peixes },
    { id: "plantas", name: "🌿 Plantas", resources: categories.plantas },
    { id: "basicos", name: "🪨 Básicos", resources: categories.basicos }
  ];

  return (
    <div className="mb-4">
      <h4 className={`font-semibold text-sm mb-3 ${unlocked ? "text-gray-700" : "text-gray-500"}`}>
        Recursos Disponíveis:
      </h4>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-3">
          {tabsData.map((tab) => (
            <TabsTrigger 
              key={tab.id} 
              value={tab.id}
              className="text-xs px-1 py-1"
              disabled={!unlocked}
            >
              {tab.name}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {tabsData.map((tab) => (
          <TabsContent key={tab.id} value={tab.id} className="mt-0">
            <ScrollArea className="h-32 w-full rounded-md border p-2">
              <div className={`grid grid-cols-1 gap-1 text-xs ${unlocked ? "" : "text-gray-500"}`}>
                {tab.resources.length > 0 ? (
                  tab.resources.map((resource) => {
                    // Função para mostrar requisitos de ferramentas
                    const getRequirementDisplay = (requiredTool: string | null) => {
                      if (!requiredTool) return "✋ Mãos";
                      
                      const toolDisplayMap: Record<string, string> = {
                        "knife": "🔪 Faca",
                        "axe": "🪓 Machado", 
                        "pickaxe": "⛏️ Picareta",
                        "shovel": "🔺 Pá",
                        "fishing_rod": "🎣 Vara de Pesca",
                        "weapon_and_knife": "⚔️ Arma + Faca",
                        "bucket": "🪣 Balde"
                      };
                      
                      return toolDisplayMap[requiredTool] || `🔧 ${requiredTool}`;
                    };

                    return (
                      <div key={resource.id} className="flex items-center space-x-2 p-1 rounded hover:bg-gray-50">
                        <span className="text-sm">{resource.emoji}</span>
                        <span className="flex-1">{resource.name}</span>
                        <span className="text-gray-400 text-xs">{getRequirementDisplay(resource.requiredTool)}</span>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center text-gray-400 py-4">
                    Nenhum recurso desta categoria
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

export default function BiomesTab({ biomes, resources, player, activeExpedition, onExploreBiome, onCompleteExpedition, onToggleAutoRepeat }: BiomesTabProps) {
  const getResourcesForBiome = (biome: Biome) => {
    const resourceIds = biome.availableResources as string[];
    return resourceIds.map(id => resources.find(r => r.id === id)).filter(Boolean) as Resource[];
  };

  const isUnlocked = (biome: Biome) => (player?.level || 0) >= biome.requiredLevel;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {biomes.map((biome) => {
        const biomeResources = getResourcesForBiome(biome);
        const unlocked = isUnlocked(biome);
        const hasActiveExpedition = activeExpedition && activeExpedition.biomeId === biome.id;

        return (
          <div
            key={biome.id}
            className={`biome-card rounded-xl p-4 md:p-6 shadow-md hover:shadow-lg transition-shadow ${
              hasActiveExpedition
                ? "bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300"
                : unlocked
                ? "bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200"
                : "bg-gradient-to-br from-gray-50 to-slate-100 border-2 border-gray-300 opacity-60"
            }`}
          >
            <div className="text-center mb-4">
              <div className={`text-4xl md:text-6xl mb-2 ${!unlocked ? "grayscale" : ""}`}>
                {biome.emoji}
              </div>
              <h3 className={`text-lg md:text-xl font-bold ${
                hasActiveExpedition ? "text-blue-800" : unlocked ? "text-green-800" : "text-gray-600"
              }`}>
                {biome.name}
              </h3>
              <p className={`text-xs md:text-sm ${
                hasActiveExpedition ? "text-blue-600" : unlocked ? "text-green-600" : "text-red-500"
              }`}>
                {hasActiveExpedition 
                  ? "🚀 Expedição em andamento" 
                  : unlocked 
                  ? `Nível necessário: ${biome.requiredLevel}` 
                  : `🔒 Nível necessário: ${biome.requiredLevel}`
                }
              </p>
            </div>

            {hasActiveExpedition ? (
              <div className="mb-4">
                <h4 className="font-semibold text-sm mb-2 text-blue-700">
                  🎯 Coletando Recursos:
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs md:text-sm mb-3">
                  {activeExpedition.selectedResources.map((resourceId) => {
                    const resource = resources.find(r => r.id === resourceId);
                    return resource ? (
                      <div key={resourceId} className="flex items-center space-x-1 text-blue-700">
                        <span>{resource.emoji}</span>
                        <span>{resource.name}</span>
                      </div>
                    ) : null;
                  })}
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${activeExpedition.progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-blue-600 text-center">Progresso: {Math.floor(activeExpedition.progress || 0)}%</p>
                </div>
              </div>
            ) : (
              <BiomeResourceTabs biomeResources={biomeResources} unlocked={unlocked} />
            )}

            <div className="space-y-2">
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (hasActiveExpedition && activeExpedition.progress >= 100) {
                      onCompleteExpedition('current-expedition');
                    } else if (unlocked && !hasActiveExpedition) {
                      onExploreBiome(biome);
                    }
                  }}
                  disabled={!unlocked || (hasActiveExpedition && activeExpedition.progress < 100) || (!!activeExpedition && !hasActiveExpedition)}
                  className={`flex-1 font-semibold py-3 px-4 rounded-lg transition-colors ${
                    hasActiveExpedition && activeExpedition.progress >= 100
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : hasActiveExpedition
                      ? "bg-orange-500 text-white cursor-not-allowed"
                      : unlocked
                      ? "bg-green-600 hover:bg-green-700 text-white"
                      : "bg-gray-400 text-gray-600 cursor-not-allowed"
                  }`}
                >
                  {hasActiveExpedition && activeExpedition.progress >= 100
                    ? "✅ Finalizar Expedição"
                    : hasActiveExpedition
                    ? "⏳ Em Andamento..."
                    : unlocked
                    ? "🧭 Explorar Bioma"
                    : "🔒 Bloqueado"
                  }
                </button>
                
                {/* Repeat Expedition Button - Always visible but conditionally enabled */}
                {unlocked && !hasActiveExpedition && (
                  <button
                    onClick={() => onToggleAutoRepeat?.(biome.id)}
                    disabled={!biome.lastExpeditionResources || biome.lastExpeditionResources.length === 0}
                    className={`px-3 py-3 rounded-lg transition-colors font-semibold ${
                      biome.autoRepeatEnabled
                        ? "bg-purple-600 hover:bg-purple-700 text-white"
                        : biome.lastExpeditionResources && biome.lastExpeditionResources.length > 0
                        ? "bg-gray-200 hover:bg-gray-300 text-gray-700"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                    title={
                      !biome.lastExpeditionResources || biome.lastExpeditionResources.length === 0
                        ? "Faça uma expedição primeiro"
                        : biome.autoRepeatEnabled 
                        ? "Desativar repetição automática" 
                        : "Repetir última expedição"
                    }
                  >
                    🔄
                  </button>
                )}
              </div>
              
              {/* Auto Repeat Countdown */}
              {biome.autoRepeatEnabled && (biome.autoRepeatCountdown || 0) > 0 && (
                <div className="text-center bg-purple-50 border border-purple-200 rounded-lg p-2">
                  <div className="text-sm text-purple-700 font-medium">
                    ⏰ Próxima expedição em {biome.autoRepeatCountdown || 0}s
                  </div>
                  <div className="w-full bg-purple-200 rounded-full h-1 mt-1">
                    <div 
                      className="bg-purple-600 h-1 rounded-full transition-all duration-1000"
                      style={{ width: `${((10 - (biome.autoRepeatCountdown || 0)) / 10) * 100}%` }}
                    />
                  </div>
                </div>
              )}
              
              {/* Show last expedition info when auto-repeat is enabled but not counting down */}
              {biome.autoRepeatEnabled && biome.autoRepeatCountdown === 0 && biome.lastExpeditionResources && biome.lastExpeditionResources.length > 0 && (
                <div className="text-center bg-purple-50 border border-purple-200 rounded-lg p-2">
                  <div className="text-xs text-purple-700 font-medium mb-1">
                    🔄 Repetição automática ativa
                  </div>
                  <div className="text-xs text-purple-600">
                    Última expedição: {biome.lastExpeditionResources.map(resourceId => {
                      const resource = resources.find(r => r.id === resourceId);
                      return resource ? resource.emoji : '?';
                    }).join(' ')}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Expansion slot */}
      <div className="biome-card bg-gradient-to-br from-purple-50 to-indigo-100 border-2 border-dashed border-purple-300 rounded-xl p-6 shadow-md">
        <div className="text-center">
          <div className="text-6xl mb-2">➕</div>
          <h3 className="text-lg font-bold text-purple-700">Novos Biomas</h3>
          <p className="text-sm text-purple-600 mb-4">Em breve...</p>
          <button className="bg-purple-200 text-purple-700 font-semibold py-2 px-4 rounded-lg cursor-not-allowed" disabled>
            🔮 Em Desenvolvimento
          </button>
        </div>
      </div>
    </div>
  );
}
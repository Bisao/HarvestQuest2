import type { Biome, Resource, Equipment, Player } from "@shared/types";
import type { AutoRepeatSettings } from "@/hooks/use-auto-repeat";

interface ActiveExpedition {
  biomeId: string;
  progress: number;
  selectedResources: string[];
}

interface BiomesTabProps {
  biomes: Biome[];
  resources: Resource[];
  equipment: Equipment[];
  player: Player;
  onExpeditionStart: (biome: Biome) => void;
  autoRepeatSettings: AutoRepeatSettings;
  onToggleAutoRepeat: (biomeId: string) => void;
}

export default function BiomesTab({ biomes, resources, equipment, player, onExpeditionStart, autoRepeatSettings, onToggleAutoRepeat }: BiomesTabProps) {
  const getResourcesForBiome = (biome: Biome) => {
    const resourceIds = biome.availableResources as string[];
    return resourceIds.map(id => resources.find(r => r.id === id)).filter(Boolean) as Resource[];
  };

  const isUnlocked = (biome: Biome) => player.level >= biome.requiredLevel;

  // Function to get tool icons required for each resource
  const getToolIcons = (resource: Resource) => {
    const icons: string[] = [];
    
    switch (resource.name) {
      case "Fibra":
        icons.push("🤚");
        break;
      case "Pedra":
      case "Ferro Fundido":
      case "Cristais":
        icons.push("⛏️");
        break;
      case "Pedras Soltas":
      case "Gravetos":
      case "Cogumelos":
      case "Frutas Silvestres":
      case "Conchas":
      case "Argila":
        icons.push("🤚");
        break;
      case "Madeira":
      case "Bambu":
        icons.push("🪓");
        break;
      case "Água Fresca":
        icons.push("🪣");
        break;
      case "Coelho":
        icons.push("🏹", "🔪"); // Arco + Faca
        break;
      case "Veado":
      case "Javali":
        icons.push("🏹", "🔱", "🔪"); // Arco/Lança + Faca
        break;
      case "Peixe Pequeno":
      case "Peixe Grande":
      case "Salmão":
        icons.push("🎣", "🪱"); // Vara de Pesca + Isca
        break;
      case "Areia":
        icons.push("🗿");
        break;
      default:
        icons.push("🤚");
        break;
    }
    
    return icons;
  };

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

                
              </div>
            ) : (
              <div className="mb-4">
                <h4 className={`font-semibold text-sm mb-1 ${unlocked ? "text-gray-700" : "text-gray-500"}`}>
                  Recursos:
                </h4>
                <div className={`max-h-32 overflow-y-auto pr-1 ${unlocked ? "" : "text-gray-500"}`}>
                  <div className="grid grid-cols-1 gap-1 text-sm">
                    {biomeResources.map((resource) => {
                      const toolIcons = getToolIcons(resource);
                      return (
                        <div key={resource.id} className="flex items-center justify-between">
                          <div className="flex items-center space-x-1">
                            <span>{resource.emoji}</span>
                            <span>{resource.name}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            {toolIcons.map((icon, index) => (
                              <span key={index} className="text-xs">{icon}</span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <button
                onClick={() => {
                  if (hasActiveExpedition && activeExpedition.progress >= 100) {
                    onCompleteExpedition('current-expedition');
                  } else if (unlocked && !hasActiveExpedition) {
                    onExploreBiome(biome);
                  }
                }}
                disabled={!unlocked || (hasActiveExpedition && activeExpedition.progress < 100) || (!!activeExpedition && !hasActiveExpedition)}
                className={`w-full font-semibold py-3 px-4 rounded-lg transition-colors ${
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
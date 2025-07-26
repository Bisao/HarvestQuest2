import type { Biome, Resource, Equipment, Player } from "@shared/schema";

interface ActiveExpedition {
  id: string;
  biomeId: string;
  progress: number;
  selectedResources: string[];
}

interface BiomesTabProps {
  biomes: Biome[];
  resources: Resource[];
  equipment: Equipment[];
  player: Player | null;
  playerLevel: number;
  activeExpedition: ActiveExpedition | null;
  onExploreBiome: (biome: Biome) => void;
  onCompleteExpedition: (expeditionId: string) => void;
}

export default function BiomesTab({ biomes, resources, equipment, player, playerLevel, activeExpedition, onExploreBiome, onCompleteExpedition }: BiomesTabProps) {
  const getResourcesForBiome = (biome: Biome) => {
    const resourceIds = biome.availableResources as string[];
    const availableResources = resourceIds.map(id => resources.find(r => r.id === id)).filter(Boolean) as Resource[];
    
    // Filter resources based on equipped tools
    return availableResources.filter(resource => {
      if (!resource.requiredTool) return true; // No tool required
      
      // Check if player has the required tool equipped
      const equippedTool = equipment.find(eq => 
        eq.toolType === resource.requiredTool && 
        (eq.id === player?.equippedTool)
      );
      
      return !!equippedTool;
    });
  };

  const isUnlocked = (biome: Biome) => playerLevel >= biome.requiredLevel;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {biomes.map((biome) => {
        const biomeResources = getResourcesForBiome(biome);
        const unlocked = isUnlocked(biome);
        const hasActiveExpedition = activeExpedition && activeExpedition.biomeId === biome.id;

        return (
          <div
            key={biome.id}
            className={`biome-card rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow ${
              hasActiveExpedition
                ? "bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300"
                : unlocked
                ? "bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200"
                : "bg-gradient-to-br from-gray-50 to-slate-100 border-2 border-gray-300 opacity-60"
            }`}
          >
            <div className="text-center mb-4">
              <div className={`text-6xl mb-2 ${!unlocked ? "grayscale" : ""}`}>
                {biome.emoji}
              </div>
              <h3 className={`text-xl font-bold ${
                hasActiveExpedition ? "text-blue-800" : unlocked ? "text-green-800" : "text-gray-600"
              }`}>
                {biome.name}
              </h3>
              <p className={`text-sm ${
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
                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
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
              <div className="mb-4">
                <h4 className={`font-semibold text-sm mb-2 ${unlocked ? "text-gray-700" : "text-gray-500"}`}>
                  Recursos Disponíveis:
                </h4>
                <div className={`grid grid-cols-2 gap-2 text-sm ${unlocked ? "" : "text-gray-500"}`}>
                  {biomeResources.map((resource) => (
                    <div key={resource.id} className="flex items-center space-x-1">
                      <span>{resource.emoji}</span>
                      <span>{resource.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => {
                if (hasActiveExpedition && activeExpedition.progress >= 100) {
                  onCompleteExpedition(activeExpedition.id);
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

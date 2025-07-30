import type { Biome, Resource, Equipment, Player } from "@shared/types";


interface BiomesTabProps {
  biomes: Biome[];
  resources: Resource[];
  equipment: Equipment[];
  player: Player;
  onExpeditionStart: (biome: Biome) => void;

}

export default function BiomesTab({ 
  biomes, 
  resources, 
  equipment, 
  player, 
  onExpeditionStart
}: BiomesTabProps) {
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

        return (
          <div
            key={biome.id}
            className={`biome-card rounded-xl p-4 md:p-6 shadow-md hover:shadow-lg transition-shadow ${
              unlocked
                ? "bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200"
                : "bg-gradient-to-br from-gray-50 to-slate-100 border-2 border-gray-300 opacity-60"
            }`}
          >
            <div className="text-center mb-4">
              <div className={`text-4xl md:text-6xl mb-2 ${!unlocked ? "grayscale" : ""}`}>
                {biome.emoji}
              </div>
              <h3 className={`text-lg md:text-xl font-bold ${
                unlocked ? "text-green-800" : "text-gray-600"
              }`}>
                {biome.name}
              </h3>
              <p className={`text-xs md:text-sm ${
                unlocked ? "text-green-600" : "text-red-500"
              }`}>
                {unlocked 
                  ? `Nível necessário: ${biome.requiredLevel}` 
                  : `🔒 Nível necessário: ${biome.requiredLevel}`
                }
              </p>
            </div>

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

            <div className="flex space-x-2">
              {/* Explore Biome Button */}
              <button
                onClick={() => onExpeditionStart(biome)}
                disabled={!unlocked}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  unlocked
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                Explorar
              </button>

              {/* Last Expedition Resources Button */}
              {(() => {
                const lastExpeditions = typeof window !== 'undefined' 
                  ? JSON.parse(localStorage.getItem('lastExpeditionResources') || '{}')
                  : {};
                
                const hasLastExpedition = lastExpeditions[biome.id] && lastExpeditions[biome.id].length > 0;
                
                return hasLastExpedition && (
                  <button
                    onClick={() => {
                      onExpeditionStart(biome);
                      
                      // Auto-select the last expedition resources
                      setTimeout(() => {
                        const event = new CustomEvent('repeatLastExpedition', {
                          detail: { resources: lastExpeditions[biome.id] }
                        });
                        window.dispatchEvent(event);
                      }, 500);
                    }}
                    disabled={!unlocked}
                    className={`py-2 px-3 rounded-lg font-medium transition-colors ${
                      unlocked
                        ? "bg-green-600 hover:bg-green-700 text-white"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                    title="Repetir Última Expedição"
                  >
                    ↻
                  </button>
                );
              })()}


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
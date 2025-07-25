import type { Biome, Resource } from "@shared/schema";

interface BiomesTabProps {
  biomes: Biome[];
  resources: Resource[];
  playerLevel: number;
  onExploreBiome: (biome: Biome) => void;
}

export default function BiomesTab({ biomes, resources, playerLevel, onExploreBiome }: BiomesTabProps) {
  const getResourcesForBiome = (biome: Biome) => {
    const resourceIds = biome.availableResources as string[];
    return resourceIds.map(id => resources.find(r => r.id === id)).filter(Boolean) as Resource[];
  };

  const isUnlocked = (biome: Biome) => playerLevel >= biome.requiredLevel;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {biomes.map((biome) => {
        const biomeResources = getResourcesForBiome(biome);
        const unlocked = isUnlocked(biome);

        return (
          <div
            key={biome.id}
            className={`biome-card rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow ${
              unlocked
                ? "bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200"
                : "bg-gradient-to-br from-gray-50 to-slate-100 border-2 border-gray-300 opacity-60"
            }`}
          >
            <div className="text-center mb-4">
              <div className={`text-6xl mb-2 ${!unlocked ? "grayscale" : ""}`}>
                {biome.emoji}
              </div>
              <h3 className={`text-xl font-bold ${unlocked ? "text-green-800" : "text-gray-600"}`}>
                {biome.name}
              </h3>
              <p className={`text-sm ${unlocked ? "text-green-600" : "text-red-500"}`}>
                {unlocked ? `Nível necessário: ${biome.requiredLevel}` : `🔒 Nível necessário: ${biome.requiredLevel}`}
              </p>
            </div>

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

            <button
              onClick={() => unlocked && onExploreBiome(biome)}
              disabled={!unlocked}
              className={`w-full font-semibold py-3 px-4 rounded-lg transition-colors ${
                unlocked
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-gray-400 text-gray-600 cursor-not-allowed"
              }`}
            >
              {unlocked ? "🧭 Explorar Bioma" : "🔒 Bloqueado"}
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

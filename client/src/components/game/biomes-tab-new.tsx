import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import ExpeditionModal from "./expedition-modal";
import type { Biome, Resource, Equipment, Player } from "@shared/types";

interface BiomesTabProps {
  biomes: Biome[];
  resources: Resource[];
  equipment: Equipment[];
  player: Player;
  onExpeditionStart: (expeditionData: any) => void;
}

export default function BiomesTab({ 
  biomes, 
  resources, 
  equipment, 
  player, 
  onExpeditionStart
}: BiomesTabProps) {
  const [selectedBiome, setSelectedBiome] = useState<Biome | null>(null);
  const [expeditionModalOpen, setExpeditionModalOpen] = useState(false);

  const getResourcesForBiome = (biome: Biome) => {
    const resourceIds = biome.availableResources as string[];
    return resourceIds.map(id => resources.find(r => r.id === id)).filter(Boolean) as Resource[];
  };

  const isUnlocked = (biome: Biome) => player.level >= biome.requiredLevel;

  const handleExploreBiome = (biome: Biome) => {
    if (!isUnlocked(biome)) return;
    
    setSelectedBiome(biome);
    setExpeditionModalOpen(true);
  };

  const handleExpeditionStart = (expeditionData: any) => {
    setExpeditionModalOpen(false);
    setSelectedBiome(null);
    onExpeditionStart(expeditionData);
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
        {biomes.map((biome) => {
          const biomeResources = getResourcesForBiome(biome);
          const unlocked = isUnlocked(biome);
          
          return (
            <div
              key={biome.id}
              className={`relative bg-gradient-to-b from-amber-50 to-amber-100 rounded-xl border-4 transition-all duration-300 ${
                unlocked 
                  ? 'border-yellow-400 hover:border-yellow-500 hover:shadow-xl hover:scale-105 cursor-pointer shadow-lg' 
                  : 'border-gray-400 opacity-70 shadow-sm'
              }`}
              style={{
                aspectRatio: '3/4',
                minHeight: '400px',
                background: unlocked 
                  ? 'linear-gradient(135deg, #fef3c7 0%, #fbbf24 20%, #f59e0b 100%)'
                  : 'linear-gradient(135deg, #f3f4f6 0%, #d1d5db 20%, #9ca3af 100%)'
              }}
            >
              {/* Card Frame Border */}
              <div className="absolute inset-3 bg-white rounded-lg border-2 border-amber-600 overflow-hidden">
                
                {/* Header Section */}
                <div className="relative bg-gradient-to-r from-amber-200 to-yellow-200 p-3 border-b-2 border-amber-600">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-3xl filter drop-shadow-md">{biome.emoji}</span>
                      <h3 className="font-bold text-lg text-amber-900">{biome.name}</h3>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-bold ${
                      unlocked 
                        ? 'bg-green-200 text-green-800 border border-green-300'
                        : 'bg-gray-200 text-gray-600 border border-gray-300'
                    }`}>
                      Nv.{biome.requiredLevel}
                    </div>
                  </div>
                </div>

                {/* Main Content */}
                <div className="p-4 flex flex-col h-full">
                  
                  {/* Progress for locked biomes */}
                  {!unlocked && (
                    <div className="mb-3">
                      <div className="flex justify-between text-xs mb-1 text-gray-600">
                        <span>Progresso</span>
                        <span>{player.level}/{biome.requiredLevel}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-amber-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min((player.level / biome.requiredLevel) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Resources Section */}
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm text-amber-900 mb-2 border-b border-amber-300 pb-1">
                      Recursos Disponíveis
                    </h4>
                    <ScrollArea className="h-48 pr-2">
                      <div className="space-y-1">
                        {biomeResources.map((resource) => (
                          <div key={resource.id} className="flex items-center justify-between bg-amber-50 rounded-md p-2 border border-amber-200">
                            <div className="flex items-center space-x-2">
                              <span className="text-lg">{resource.emoji}</span>
                              <div className="flex flex-col">
                                <span className="text-xs font-medium text-gray-800">{resource.name}</span>
                                <span className="text-xs text-gray-500">XP: {resource.experienceValue}</span>
                              </div>
                            </div>
                            <div className="text-xs text-amber-700 font-medium">
                              {resource.value}💰
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>

                  {/* Action Button */}
                  <div className="mt-3">
                    <button 
                      onClick={() => handleExploreBiome(biome)}
                      disabled={!unlocked}
                      className={`w-full font-bold text-sm py-2 px-4 rounded-lg transition-all duration-200 ${
                        unlocked
                          ? 'bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white shadow-md hover:shadow-lg active:scale-95'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {unlocked ? "⚔️ EXPLORAR" : `🔒 Nível ${biome.requiredLevel} Requerido`}
                    </button>
                  </div>
                </div>
              </div>

              {/* Corner Decorations */}
              {unlocked && (
                <>
                  <div className="absolute top-1 left-1 w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="absolute top-1 right-1 w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="absolute bottom-1 left-1 w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="absolute bottom-1 right-1 w-3 h-3 bg-yellow-400 rounded-full"></div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Expedition Modal */}
      <ExpeditionModal
        isOpen={expeditionModalOpen}
        onClose={() => {
          setExpeditionModalOpen(false);
          setSelectedBiome(null);
        }}
        biome={selectedBiome}
        resources={resources}
        equipment={equipment}
        player={player}
        onExpeditionStart={handleExpeditionStart}
      />
    </>
  );
}
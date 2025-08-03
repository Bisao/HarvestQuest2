import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, CheckCircle, MapPin } from 'lucide-react';
import ExpeditionModal from "./expedition-modal";
import { useActiveExpeditions } from "@/hooks/use-active-expeditions";
import type { Biome, Resource, Equipment, Player } from "@shared/types";
import { useInventoryUpdates } from '@/hooks/use-inventory-updates';

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

  // Hook para gerenciar expedições ativas
  const { 
    activeExpeditions, 
    getActiveExpeditionForBiome, 
    formatTimeRemaining, 
    getPhaseLabel 
  } = useActiveExpeditions(player.id);

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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {biomes.map((biome) => {
          const biomeResources = getResourcesForBiome(biome);
          const unlocked = isUnlocked(biome);
          const activeExpedition = getActiveExpeditionForBiome(biome.id);
          const isExpeditionActive = !!activeExpedition;
          const isExpeditionCompleted = activeExpedition?.progress >= 100;

          return (
            <Card 
              key={biome.id} 
              className={`transition-all ${unlocked ? 'hover:shadow-lg cursor-pointer' : 'opacity-60'} ${isExpeditionActive ? 'ring-2 ring-blue-500' : ''}`}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{biome.emoji}</span>
                    <CardTitle className="text-lg">{biome.name}</CardTitle>
                    {isExpeditionActive && (
                      <MapPin className="w-4 h-4 text-blue-600" />
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {isExpeditionActive && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {isExpeditionCompleted ? 'Completa' : getPhaseLabel(activeExpedition.currentPhase)}
                      </Badge>
                    )}
                    <Badge variant={unlocked ? "default" : "secondary"}>
                      Nível {biome.requiredLevel}
                    </Badge>
                  </div>
                </div>
                <CardDescription>
                  {isExpeditionActive ? 'Expedição em andamento' : 'Explore este bioma para coletar recursos únicos'}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Expedition Progress */}
                {isExpeditionActive && (
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-blue-800">Expedição Ativa</span>
                      <div className="flex items-center space-x-2 text-sm text-blue-700">
                        {isExpeditionCompleted ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <>
                            <Clock className="w-4 h-4" />
                            <span>{formatTimeRemaining(activeExpedition.estimatedEndTime)}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between text-sm mb-1">
                      <span>Progresso</span>
                      <span>{Math.round(activeExpedition.progress)}%</span>
                    </div>
                    <Progress 
                      value={activeExpedition.progress} 
                      className="h-2 mb-2"
                    />

                    {Object.keys(activeExpedition.collectedResources).length > 0 && (
                      <div className="text-xs text-blue-700">
                        Recursos coletados: {Object.keys(activeExpedition.collectedResources).length} tipos
                      </div>
                    )}
                  </div>
                )}

                {/* Progress bar for locked biomes */}
                {!unlocked && !isExpeditionActive && (
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progresso para desbloqueio</span>
                      <span>{player.level}/{biome.requiredLevel}</span>
                    </div>
                    <Progress 
                      value={(player.level / biome.requiredLevel) * 100} 
                      className="h-2"
                    />
                  </div>
                )}

                {/* Resources available */}
                <div>
                  <h4 className="font-medium text-sm mb-2">Recursos Disponíveis:</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {biomeResources.slice(0, 6).map((resource) => (
                      <div key={resource.id} className="flex items-center space-x-1 text-xs">
                        <span>{resource.emoji}</span>
                        <span className="truncate">{resource.name}</span>
                      </div>
                    ))}
                    {biomeResources.length > 6 && (
                      <div className="text-xs text-gray-500 col-span-3">
                        +{biomeResources.length - 6} outros recursos...
                      </div>
                    )}
                  </div>
                </div>

                {/* Explore button */}
                <Button 
                  onClick={() => handleExploreBiome(biome)}
                  disabled={!unlocked || isExpeditionActive}
                  className="w-full"
                  variant={unlocked && !isExpeditionActive ? "default" : "secondary"}
                >
                  {!unlocked 
                    ? `Desbloqueado no Nível ${biome.requiredLevel}`
                    : isExpeditionActive 
                      ? (isExpeditionCompleted ? "Coletar Recompensas" : "Expedição em Andamento")
                      : "Explorar"
                  }
                </Button>
              </CardContent>
            </Card>
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
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import ExpeditionModal from "./expedition-modal";
import type { Biome, Resource, Equipment, Player, Expedition } from "@shared/types";

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

  // Fetch active expedition
  const { data: activeExpedition } = useQuery({
    queryKey: [`/api/player/${player.id}/active-expedition`],
    refetchInterval: 1000, // Refetch every second to update progress
  });

  const getResourcesForBiome = (biome: Biome) => {
    const resourceIds = biome.availableResources as string[];
    return resourceIds.map(id => resources.find(r => r.id === id)).filter(Boolean) as Resource[];
  };

  const isUnlocked = (biome: Biome) => player.level >= biome.requiredLevel;

  const handleExploreBiome = (biome: Biome) => {
    if (!isUnlocked(biome) || (activeExpedition && activeExpedition.progress < 100)) return;
    
    // If there's a completed expedition for this biome, complete it
    if (activeExpedition && activeExpedition.biomeId === biome.id && activeExpedition.progress >= 100) {
      handleCompleteExpedition(activeExpedition.id);
      return;
    }
    
    setSelectedBiome(biome);
    setExpeditionModalOpen(true);
  };

  const handleCompleteExpedition = async (expeditionId: string) => {
    try {
      const response = await fetch(`/api/expeditions/${expeditionId}/complete`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to complete expedition');
      }
      // Refresh data after completion
      location.reload(); // Simple refresh for now
    } catch (error) {
      console.error('Error completing expedition:', error);
    }
  };

  const getButtonText = (biome: Biome, unlocked: boolean) => {
    if (!unlocked) {
      return `Desbloqueado no Nível ${biome.requiredLevel}`;
    }
    
    if (activeExpedition) {
      if (activeExpedition.biomeId === biome.id) {
        return activeExpedition.progress >= 100 ? "Finalizar Expedição" : "Em Andamento...";
      }
      return "Expedição Ativa";
    }
    
    return "Explorar";
  };

  const getButtonVariant = (biome: Biome, unlocked: boolean) => {
    if (!unlocked) return "secondary";
    
    if (activeExpedition) {
      if (activeExpedition.biomeId === biome.id && activeExpedition.progress >= 100) {
        return "default"; // Green for completion
      }
      return "secondary"; // Disabled state
    }
    
    return "default";
  };

  const isButtonDisabled = (biome: Biome, unlocked: boolean) => {
    if (!unlocked) return true;
    
    // If there's an active expedition and it's not for this biome, disable
    if (activeExpedition && activeExpedition.biomeId !== biome.id) return true;
    
    // If there's an active expedition for this biome but not completed, disable
    if (activeExpedition && activeExpedition.biomeId === biome.id && activeExpedition.progress < 100) return true;
    
    return false;
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
          
          return (
            <Card 
              key={biome.id} 
              className={`transition-all ${unlocked ? 'hover:shadow-lg cursor-pointer' : 'opacity-60'}`}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{biome.emoji}</span>
                    <CardTitle className="text-lg">{biome.name}</CardTitle>
                  </div>
                  <Badge variant={unlocked ? "default" : "secondary"}>
                    Nível {biome.requiredLevel}
                  </Badge>
                </div>
                <CardDescription>Explore este bioma para coletar recursos únicos</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Progress bar for locked biomes */}
                {!unlocked && (
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
                  disabled={isButtonDisabled(biome, unlocked)}
                  className="w-full"
                  variant={getButtonVariant(biome, unlocked)}
                >
                  {getButtonText(biome, unlocked)}
                </Button>

                {/* Progress bar for active expedition */}
                {activeExpedition && activeExpedition.biomeId === biome.id && activeExpedition.progress < 100 && (
                  <div className="mt-2">
                    <Progress value={activeExpedition.progress} className="w-full" />
                    <p className="text-xs text-gray-600 text-center mt-1">
                      Progresso: {activeExpedition.progress}%
                    </p>
                  </div>
                )}
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
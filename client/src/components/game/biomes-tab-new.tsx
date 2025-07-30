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
  const { data: activeExpedition } = useQuery<Expedition | null>({
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
      <div className="space-y-4 md:space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {biomes.map((biome) => {
            const biomeResources = getResourcesForBiome(biome);
            const unlocked = isUnlocked(biome);
            
            return (
              <Card 
                key={biome.id} 
                className={`transition-all ${unlocked ? 'hover:shadow-lg cursor-pointer' : 'opacity-60'} min-h-[280px] md:min-h-[300px]`}
              >
                <CardHeader className="pb-2 md:pb-3">
                  <div className="flex items-center justify-between mb-1 md:mb-2">
                    <div className="flex items-center space-x-2 md:space-x-3">
                      <span className="text-xl md:text-2xl">{biome.emoji}</span>
                      <CardTitle className="text-lg md:text-xl">{biome.name}</CardTitle>
                    </div>
                    <Badge variant={unlocked ? "default" : "secondary"} className="text-xs">
                      Nível {biome.requiredLevel}
                    </Badge>
                  </div>
                  <CardDescription className="text-xs md:text-sm">
                    Explore este bioma para coletar recursos únicos
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-3 md:space-y-4 pt-0">
                  {/* Progress bar for locked biomes */}
                  {!unlocked && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-medium">Progresso para desbloqueio</span>
                        <span className="text-gray-600">{player.level}/{biome.requiredLevel}</span>
                      </div>
                      <Progress 
                        value={(player.level / biome.requiredLevel) * 100} 
                        className="h-2"
                      />
                    </div>
                  )}

                  {/* Resources available */}
                  <div className="bg-blue-50 p-2 md:p-3 rounded-lg">
                    <h4 className="font-medium text-xs md:text-sm mb-2 md:mb-3 text-blue-800">Recursos Disponíveis:</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 md:gap-2">
                      {biomeResources.slice(0, 4).map((resource) => (
                        <div key={resource.id} className="flex items-center space-x-1 md:space-x-2 text-xs bg-white p-1.5 md:p-2 rounded">
                          <span className="text-sm md:text-base">{resource.emoji}</span>
                          <span className="truncate text-gray-700 text-xs">{resource.name}</span>
                        </div>
                      ))}
                    </div>
                    {biomeResources.length > 4 && (
                      <div className="text-xs text-blue-600 mt-1 md:mt-2 text-center">
                        +{biomeResources.length - 4} outros recursos...
                      </div>
                    )}
                  </div>

                  

                  {/* Explore button */}
                  <div className="pt-1 md:pt-2">
                    <Button 
                      onClick={() => handleExploreBiome(biome)}
                      disabled={isButtonDisabled(biome, unlocked)}
                      className="w-full h-10 md:h-12 text-sm md:text-base font-medium"
                      variant={getButtonVariant(biome, unlocked)}
                    >
                      {getButtonText(biome, unlocked)}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
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
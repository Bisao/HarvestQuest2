// Painel minimizado de expedição no canto inferior esquerdo
import { useState, useEffect, useRef } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronUp, ChevronDown } from "lucide-react";
import type { Biome, Resource, Player } from "@shared/types";

export interface ActiveExpedition {
  id: string;
  biomeId: string;
  progress: number;
  selectedResources: string[];
  startTime: number;
  estimatedDuration: number;
  collectedResources?: Record<string, number>;
}

interface ExpeditionPanelProps {
  expedition: ActiveExpedition;
  biomes: Biome[];
  resources: Resource[];
  onExpeditionComplete: (shouldKeepActive?: boolean) => void;
}

export default function ExpeditionPanel({
  expedition,
  biomes,
  resources,
  onExpeditionComplete,
}: ExpeditionPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentProgress, setCurrentProgress] = useState(expedition.progress);
  const [collectedResources, setCollectedResources] = useState<Record<string, number>>({});
  const [isAutoRepeat, setIsAutoRepeat] = useState(false);
  const [autoRepeatCountdown, setAutoRepeatCountdown] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const biome = biomes?.find(b => b.id === expedition.biomeId) || null;
  const isCompleted = currentProgress >= 100;

  // Query player data for real-time hunger/thirst monitoring
  const { data: player } = useQuery<Player>({
    queryKey: [`/api/player/${expedition.id.split('-')[0]}`], // Use expedition creator ID
    refetchInterval: 2000, // Refetch every 2 seconds for real-time monitoring
    enabled: !!expedition.id
  });

  // Complete expedition mutation  
  const completeExpeditionMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/expeditions/${expedition.id}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to complete expedition');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/player/${expedition.id.split('-')[0]}`] });
      
      if (isAutoRepeat) {
        // Auto-repeat mode: restart expedition immediately
        setTimeout(() => {
          setCurrentProgress(0);
          setCollectedResources({});
          setAutoRepeatCountdown(0);
          // Update expedition start time for new cycle
          expedition.startTime = Date.now();
        }, 500);
        
        toast({
          title: "Auto-Repetição",
          description: "Nova expedição iniciada automaticamente!",
        });
      } else {
        // Normal completion
        toast({
          title: "Expedição Concluída",
          description: "Recursos coletados com sucesso!",
        });
        onExpeditionComplete(false);
      }
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao finalizar expedição",
        variant: "destructive",
      });
    },
  });

  const handleCompleteExpedition = () => {
    completeExpeditionMutation.mutate();
  };

  // Progress simulation
  useEffect(() => {
    if (currentProgress >= 100) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - expedition.startTime;
      const progressPercent = Math.min((elapsed / expedition.estimatedDuration) * 100, 100);
      
      setCurrentProgress(progressPercent);
      
      // Simulate resource collection in real-time
      if (progressPercent > 0) {
        const newCollected: Record<string, number> = {};
        expedition.selectedResources.forEach(resourceId => {
          const baseAmount = Math.floor(Math.random() * 3) + 1; // 1-3 per resource
          const collectedAmount = Math.floor((progressPercent / 100) * baseAmount);
          if (collectedAmount > 0) {
            newCollected[resourceId] = collectedAmount;
          }
        });
        setCollectedResources(newCollected);
      }
      
      if (progressPercent >= 100) {
        clearInterval(intervalRef.current!);
        intervalRef.current = null;
        
        // Handle auto-repeat - but check if player has sufficient hunger/thirst
        if (isAutoRepeat) {
          if (player && (player.hunger <= 0 || player.thirst <= 0)) {
            // Auto-disable if player status is too low
            setIsAutoRepeat(false);
            toast({
              title: "Auto-Repetição Desativada",
              description: player.hunger <= 0 
                ? "Fome muito baixa! Consuma alimentos antes de continuar." 
                : "Sede muito baixa! Beba água antes de continuar.",
              variant: "destructive",
            });
          } else {
            setAutoRepeatCountdown(5);
          }
        }
      }
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    };
  }, [expedition, currentProgress, isAutoRepeat]);

  // Auto-repeat countdown effect
  useEffect(() => {
    if (autoRepeatCountdown > 0 && isAutoRepeat) {
      countdownRef.current = setInterval(() => {
        setAutoRepeatCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownRef.current!);
            countdownRef.current = null;
            // Trigger completion
            handleCompleteExpedition();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (countdownRef.current) {
          clearInterval(countdownRef.current);
        }
      };
    }
  }, [autoRepeatCountdown, isAutoRepeat]);

  // Monitor player hunger/thirst and disable auto-repeat if they reach 0
  useEffect(() => {
    if (player && isAutoRepeat) {
      if (player.hunger <= 0 || player.thirst <= 0) {
        setIsAutoRepeat(false);
        setAutoRepeatCountdown(0);
        
        // Clear any active countdown
        if (countdownRef.current) {
          clearInterval(countdownRef.current);
          countdownRef.current = null;
        }
        
        toast({
          title: "Auto-Repetição Desativada",
          description: player.hunger <= 0 
            ? "Fome muito baixa! Consuma alimentos antes de continuar." 
            : "Sede muito baixa! Beba água antes de continuar.",
          variant: "destructive",
        });
      }
    }
  }, [player?.hunger, player?.thirst, isAutoRepeat, toast]);

  // Get resource info for display using enhanced mapping
  const getResourceInfo = (resourceId: string) => {
    // First try to find in provided resources array
    const found = resources.find(r => r.id === resourceId);
    if (found) return found;

    // Enhanced fallback mapping using exact IDs from game-ids.ts
    const resourceMap: Record<string, { name: string; emoji: string }> = {
      // Basic resources (matching exact game-ids.ts)
      "res-a1b2c3d4-e5f6-4789-abc1-234567890123": { name: "Fibra", emoji: "🌾" },
      "res-b2c3d4e5-f6a7-4890-bcd2-345678901234": { name: "Pedra", emoji: "🪨" },
      "res-c3d4e5f6-a7b8-4901-cde3-456789012345": { name: "Pedras Soltas", emoji: "🪨" },
      "res-d4e5f6a7-b8c9-4012-def4-567890123456": { name: "Gravetos", emoji: "🪵" },
      "res-e5f6a7b8-c9d0-4123-efa5-678901234567": { name: "Água Fresca", emoji: "💧" },
      "res-f6a7b8c9-d0e1-4234-fab6-789012345678": { name: "Bambu", emoji: "🎋" },
      "res-a7b8c9d0-e1f2-4345-abc7-890123456789": { name: "Madeira", emoji: "🌳" },
      "res-b8c9d0e1-f2a3-4456-bcd8-901234567890": { name: "Argila", emoji: "🧱" },
      "res-c9d0e1f2-a3b4-4567-cde9-012345678901": { name: "Ferro Fundido", emoji: "⚙️" },
      "res-d0e1f2a3-b4c5-4678-def0-123456789012": { name: "Couro", emoji: "🦫" },
      "res-e1f2a3b4-c5d6-4789-efa1-234567890123": { name: "Carne", emoji: "🥩" },
      "res-f2a3b4c5-d6e7-4890-fab2-345678901234": { name: "Ossos", emoji: "🦴" },
      "res-a3b4c5d6-e7f8-4901-abc3-456789012345": { name: "Pelo", emoji: "🧶" },
      "res-b4c5d6e7-f8a9-4012-bcd4-567890123456": { name: "Barbante", emoji: "🧵" },
      
      // More resources
      "res-c5d6e7f8-a9b0-4123-cde5-678901234567": { name: "Linho", emoji: "🌾" },
      "res-d6e7f8a9-b0c1-4234-def6-789012345678": { name: "Algodão", emoji: "☁️" },
      "res-e7f8a9b0-c1d2-4345-efa7-890123456789": { name: "Juta", emoji: "🌾" },
      "res-f8a9b0c1-d2e3-4456-fab8-901234567890": { name: "Sisal", emoji: "🌾" },
      "res-a9b0c1d2-e3f4-4567-abc9-012345678901": { name: "Cânhamo", emoji: "🌾" },
    };

    // Check direct mapping
    if (resourceMap[resourceId]) {
      return {
        id: resourceId,
        name: resourceMap[resourceId].name,
        emoji: resourceMap[resourceId].emoji
      };
    }

    // Pattern-based fallback for unrecognized IDs
    console.warn(`🔍 Resource not found for ID: ${resourceId}`);
    return {
      id: resourceId,
      name: "Recurso Desconhecido",
      emoji: "📦"
    };
  };

  const timeRemaining = Math.max(0, expedition.estimatedDuration - (Date.now() - expedition.startTime));
  const timeRemainingMinutes = Math.ceil(timeRemaining / 1000 / 60);

  return (
    <div className="fixed bottom-4 left-4 bg-white rounded-lg shadow-lg border-2 border-blue-200 z-50 min-w-80">
      {/* Minimized header */}
      <div className="p-3 flex items-center justify-between bg-blue-50 rounded-t-lg">
        <div className="flex items-center space-x-2">
          <span className="font-medium text-sm">Expedição Ativa</span>
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-medium">
            {biome?.name}
          </span>
          <span className="text-lg">{biome?.emoji}</span>
          <Button
            onClick={() => {
              setIsAutoRepeat(!isAutoRepeat);
              if (isAutoRepeat) {
                // If turning off auto-repeat, clear any active countdown
                setAutoRepeatCountdown(0);
                if (countdownRef.current) {
                  clearInterval(countdownRef.current);
                  countdownRef.current = null;
                }
              }
            }}
            className={`h-6 px-2 text-xs ${
              isAutoRepeat 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
            size="sm"
          >
            🔄 {isAutoRepeat ? 'ON' : 'OFF'}
          </Button>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="h-6 w-6 p-0"
        >
          {isExpanded ? (
            <ChevronDown className="h-3 w-3" />
          ) : (
            <ChevronUp className="h-3 w-3" />
          )}
        </Button>
      </div>

      {/* Progress bar or finalize button when minimized */}
      {!isExpanded && !isCompleted && (
        <div className="px-3 pb-2">
          <div className="flex justify-between text-xs mb-1">
            <span>Progresso</span>
            <span>{Math.round(currentProgress)}%</span>
          </div>
          <Progress value={currentProgress} className="h-2" />
        </div>
      )}
      
      {/* Auto-repeat countdown when completed and auto-repeat is on */}
      {!isExpanded && isCompleted && autoRepeatCountdown > 0 && (
        <div className="px-3 pb-2">
          <div className="bg-yellow-50 border border-yellow-200 rounded p-2 text-center">
            <div className="text-xs text-yellow-700 font-medium">
              Repetindo em {autoRepeatCountdown}s...
            </div>
            <Button
              onClick={() => {
                setIsAutoRepeat(false);
                setAutoRepeatCountdown(0);
                if (countdownRef.current) {
                  clearInterval(countdownRef.current);
                  countdownRef.current = null;
                }
              }}
              variant="outline"
              size="sm"
              className="mt-1 h-6 px-2 text-xs"
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}
      
      {/* Finalize button when completed and minimized */}
      {!isExpanded && isCompleted && !autoRepeatCountdown && (
        <div className="px-3 pb-2">
          <Button
            onClick={handleCompleteExpedition}
            disabled={completeExpeditionMutation.isPending}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            size="sm"
          >
            {completeExpeditionMutation.isPending ? "Finalizando..." : "🎯 Finalizar Expedição"}
          </Button>
        </div>
      )}

      {/* Expanded content */}
      {isExpanded && (
        <div className="border-t border-gray-200 p-3 space-y-3">
          {!isCompleted ? (
            <>
              {/* Time remaining */}
              <div className="text-xs text-gray-600">
                Tempo restante: {timeRemainingMinutes} min
              </div>

              {/* Resources being collected */}
              <div>
                <h5 className="text-xs font-medium mb-2">Coletando:</h5>
                <ScrollArea className="max-h-32">
                  <div className="space-y-1">
                    {expedition.selectedResources.map(resourceId => {
                      const resource = getResourceInfo(resourceId);
                      const collected = collectedResources[resourceId] || 0;
                      return (
                        <div key={resourceId} className="flex items-center justify-between text-xs">
                          <div className="flex items-center space-x-1">
                            <span>{resource?.emoji}</span>
                            <span>{resource?.name}</span>
                          </div>
                          <span className="text-blue-600 font-medium">
                            {collected > 0 ? `+${collected}` : "..."}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </div>
            </>
          ) : (
            <>
              {/* Expedition completed */}
              <div className="text-center">
                <p className="text-sm font-medium text-green-600 mb-2">
                  ✅ Expedição Concluída!
                </p>
                
                {/* Final results */}
                <div className="bg-green-50 rounded-lg p-2 mb-3">
                  <h5 className="text-xs font-medium mb-1">Recursos Coletados:</h5>
                  <div className="space-y-1">
                    {Object.entries(collectedResources).map(([resourceId, amount]) => {
                      const resource = getResourceInfo(resourceId);
                      return (
                        <div key={resourceId} className="flex items-center justify-between text-xs">
                          <div className="flex items-center space-x-1">
                            <span>{resource?.emoji}</span>
                            <span>{resource?.name}</span>
                          </div>
                          <span className="text-green-600 font-medium">+{amount}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {autoRepeatCountdown > 0 ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded p-2 text-center mb-2">
                    <div className="text-sm text-yellow-700 font-medium mb-2">
                      Repetindo em {autoRepeatCountdown}s...
                    </div>
                    <Button
                      onClick={() => {
                        setIsAutoRepeat(false);
                        setAutoRepeatCountdown(0);
                        if (countdownRef.current) {
                          clearInterval(countdownRef.current);
                          countdownRef.current = null;
                        }
                      }}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      Cancelar Auto-Repetição
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={handleCompleteExpedition}
                    disabled={completeExpeditionMutation.isPending}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                    size="sm"
                  >
                    {completeExpeditionMutation.isPending ? "Finalizando..." : "Finalizar Expedição"}
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
// Painel minimizado de expedição no canto inferior esquerdo
import { useState, useEffect, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronUp, ChevronDown } from "lucide-react";
import type { Biome, Resource } from "@shared/types";

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
  onExpeditionComplete: () => void;
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
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const biome = biomes.find(b => b.id === expedition.biomeId);
  const isCompleted = currentProgress >= 100;

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
      }
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [expedition, currentProgress]);

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
      toast({
        title: "Expedição Concluída",
        description: "Recursos coletados com sucesso!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/player/Player1"] });
      onExpeditionComplete();
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

  // Get resource info for display
  const getResourceInfo = (resourceId: string) => {
    return resources.find(r => r.id === resourceId);
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

      {/* Progress bar - always visible */}
      {!isCompleted && (
        <div className="px-3 pb-2">
          <div className="flex justify-between text-xs mb-1">
            <span>Progresso</span>
            <span>{Math.round(currentProgress)}%</span>
          </div>
          <Progress value={currentProgress} className="h-2" />
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

                <Button
                  onClick={handleCompleteExpedition}
                  disabled={completeExpeditionMutation.isPending}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  size="sm"
                >
                  {completeExpeditionMutation.isPending ? "Finalizando..." : "Finalizar Expedição"}
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
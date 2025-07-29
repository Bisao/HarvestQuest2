// Clean, unified expedition system component
import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import type { Biome, Resource, Equipment, Player } from "@shared/types";

// Unified interfaces
interface ExpeditionSystemProps {
  isOpen: boolean;
  onClose: () => void;
  onMinimize: () => void;
  biome: Biome | null;
  resources: Resource[];
  equipment: Equipment[];
  playerId: string;
  player: Player;
  onExpeditionComplete: () => void;
  isMinimized?: boolean;
  activeExpedition?: ActiveExpedition | null;
  onExpeditionUpdate?: (expedition: ActiveExpedition | null) => void;
}

interface ActiveExpedition {
  id: string;
  biomeId: string;
  progress: number;
  selectedResources: string[];
  startTime: number;
  estimatedDuration: number;
  collectedResources?: Record<string, number>;
}

export default function ExpeditionSystem({
  isOpen,
  onClose,
  onMinimize,
  biome,
  resources,
  equipment,
  playerId,
  player,
  onExpeditionComplete,
  isMinimized = false,
  activeExpedition: parentActiveExpedition,
  onExpeditionUpdate,
}: ExpeditionSystemProps) {
  // State management
  const [selectedResources, setSelectedResources] = useState<string[]>([]);
  const [localActiveExpedition, setLocalActiveExpedition] = useState<ActiveExpedition | null>(null);
  const [expeditionProgress, setExpeditionProgress] = useState(0);
  
  const activeExpedition = parentActiveExpedition || localActiveExpedition;
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // Resource helpers
  const getBiomeResources = () => {
    if (!biome) return [];
    const resourceIds = biome.availableResources as string[];
    return resourceIds.map(id => resources.find(r => r.id === id)).filter(Boolean) as Resource[];
  };

  const getCollectableResources = () => {
    const biomeResources = getBiomeResources();
    return biomeResources.filter(resource => {
      // Check tool requirements
      if (resource.requiredTool) {
        switch (resource.requiredTool) {
          case "axe":
            return equipment.some(eq => eq.toolType === "axe" && eq.id === player.equippedTool);
          case "pickaxe":
            return equipment.some(eq => eq.toolType === "pickaxe" && eq.id === player.equippedTool);
          case "fishing_rod":
            return equipment.some(eq => eq.toolType === "fishing_rod" && eq.id === player.equippedTool);
          case "knife":
            return equipment.some(eq => eq.toolType === "knife" && 
              (eq.id === player.equippedTool || eq.id === player.equippedWeapon));
          case "weapon_and_knife":
            const hasWeapon = player.equippedWeapon;
            const hasKnife = equipment.some(eq => eq.toolType === "knife" && 
              (eq.id === player.equippedTool || eq.id === player.equippedWeapon));
            return hasWeapon && hasKnife;
          default:
            return true;
        }
      }
      return true; // No tool required
    });
  };

  // Expedition mutations
  const startExpeditionMutation = useMutation({
    mutationFn: async (expeditionData: {
      playerId: string;
      biomeId: string;
      selectedResources: string[];
    }) => {
      const response = await apiRequest('POST', '/api/expeditions', {
        ...expeditionData,
        selectedEquipment: [] // Equipment managed through equipped items
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Failed to start expedition: ${response.status}`);
      }
      return response.json();
    },
    onSuccess: (expedition) => {
      const newActiveExpedition: ActiveExpedition = {
        id: expedition.id,
        biomeId: expedition.biomeId,
        progress: 0,
        selectedResources: expedition.selectedResources,
        startTime: Date.now(),
        estimatedDuration: 30000 // 30 seconds
      };

      if (onExpeditionUpdate) {
        onExpeditionUpdate(newActiveExpedition);
      } else {
        setLocalActiveExpedition(newActiveExpedition);
      }

      startProgressSimulation(newActiveExpedition);
      onMinimize(); // Auto-minimize when expedition starts
      
      toast({
        title: "Expedição Iniciada",
        description: `Explorando ${biome?.name}...`
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const completeExpeditionMutation = useMutation({
    mutationFn: async (expeditionId: string) => {
      const response = await apiRequest('POST', `/api/expeditions/${expeditionId}/complete`);
      if (!response.ok) {
        throw new Error(`Failed to complete expedition: ${response.status}`);
      }
      return response.json();
    },
    onSuccess: (completedExpedition) => {
      if (onExpeditionUpdate) {
        onExpeditionUpdate(null);
      } else {
        setLocalActiveExpedition(null);
      }
      
      setExpeditionProgress(0);
      onExpeditionComplete();
      
      // Invalidate queries to update UI
      queryClient.invalidateQueries({ queryKey: ["/api/player", playerId] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory", playerId] });
      queryClient.invalidateQueries({ queryKey: ["/api/storage", playerId] });
      
      toast({
        title: "Expedição Concluída",
        description: "Recursos coletados com sucesso!"
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao finalizar expedição.",
        variant: "destructive"
      });
    }
  });

  // Progress simulation
  const startProgressSimulation = (expedition: ActiveExpedition) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - expedition.startTime;
      const progress = Math.min((elapsed / expedition.estimatedDuration) * 100, 100);

      setExpeditionProgress(progress);

      if (progress >= 100) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    }, 1000);
  };

  // Effect for managing progress simulation
  useEffect(() => {
    if (activeExpedition && !intervalRef.current) {
      const elapsed = Date.now() - activeExpedition.startTime;
      if (elapsed < activeExpedition.estimatedDuration) {
        startProgressSimulation(activeExpedition);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [activeExpedition]);

  // Event handlers
  const handleStartExpedition = () => {
    if (!biome || selectedResources.length === 0) {
      toast({
        title: "Erro",
        description: "Selecione pelo menos um recurso para coletar.",
        variant: "destructive"
      });
      return;
    }

    startExpeditionMutation.mutate({
      playerId,
      biomeId: biome.id,
      selectedResources
    });
  };

  const handleCompleteExpedition = () => {
    if (activeExpedition) {
      completeExpeditionMutation.mutate(activeExpedition.id);
    }
  };

  const toggleResourceSelection = (resourceId: string) => {
    setSelectedResources(prev => 
      prev.includes(resourceId) 
        ? prev.filter(id => id !== resourceId)
        : [...prev, resourceId]
    );
  };

  if (!biome) return null;

  const collectableResources = getCollectableResources();
  const isExpeditionInProgress = activeExpedition && expeditionProgress < 100;
  const isExpeditionComplete = activeExpedition && expeditionProgress >= 100;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <span className="text-2xl">{biome.emoji}</span>
            <span>Expedição - {biome.name}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Player Status */}
          <div className="bg-muted p-4 rounded-lg">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Fome:</span>
                <span className="ml-2 font-medium">{player.hunger}/100</span>
              </div>
              <div>
                <span className="text-muted-foreground">Sede:</span>
                <span className="ml-2 font-medium">{player.thirst}/100</span>
              </div>
              <div>
                <span className="text-muted-foreground">Nível:</span>
                <span className="ml-2 font-medium">{player.level}</span>
              </div>
            </div>
          </div>

          {/* Active Expedition Progress */}
          {isExpeditionInProgress && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="font-medium text-lg">Expedição em Andamento</h3>
                <p className="text-muted-foreground">Coletando recursos...</p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progresso</span>
                  <span>{Math.round(expeditionProgress)}%</span>
                </div>
                <Progress value={expeditionProgress} className="w-full" />
              </div>
              <div className="flex space-x-2">
                <Button onClick={onMinimize} variant="outline" className="flex-1">
                  Minimizar
                </Button>
              </div>
            </div>
          )}

          {/* Expedition Complete */}
          {isExpeditionComplete && (
            <div className="space-y-4 text-center">
              <div>
                <h3 className="font-medium text-lg text-green-600">Expedição Concluída!</h3>
                <p className="text-muted-foreground">Recursos coletados com sucesso</p>
              </div>
              <Button onClick={handleCompleteExpedition} className="w-full">
                Finalizar Expedição
              </Button>
            </div>
          )}

          {/* Resource Selection (only if no active expedition) */}
          {!activeExpedition && (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-lg mb-3">Recursos Disponíveis</h3>
                <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
                  {collectableResources.map((resource) => (
                    <div key={resource.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50">
                      <Checkbox
                        checked={selectedResources.includes(resource.id)}
                        onCheckedChange={() => toggleResourceSelection(resource.id)}
                      />
                      <div className="flex items-center space-x-2 flex-1">
                        <span className="text-lg">{resource.emoji}</span>
                        <div>
                          <div className="font-medium">{resource.name}</div>
                          <div className="text-sm text-muted-foreground">
                            +{resource.experienceValue} XP • {resource.value} moedas
                          </div>
                        </div>
                      </div>
                      <Badge variant="secondary">{resource.rarity}</Badge>
                    </div>
                  ))}
                </div>
              </div>

              {collectableResources.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Nenhum recurso disponível.</p>
                  <p className="text-sm mt-1">Você precisa das ferramentas certas para coletar recursos neste bioma.</p>
                </div>
              )}

              <div className="flex space-x-2">
                <Button onClick={onClose} variant="outline" className="flex-1">
                  Cancelar
                </Button>
                <Button 
                  onClick={handleStartExpedition} 
                  disabled={selectedResources.length === 0 || startExpeditionMutation.isPending}
                  className="flex-1"
                >
                  {startExpeditionMutation.isPending ? "Iniciando..." : "Iniciar Expedição"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
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
          case "bucket":
            // Para água, verificar se tem balde ou garrafa de bambu
            const hasBucket = equipment.some(eq => eq.toolType === "bucket" && eq.id === player.equippedTool);
            const hasBambooBottle = equipment.some(eq => eq.toolType === "bamboo_bottle" && eq.id === player.equippedTool);
            return hasBucket || hasBambooBottle;
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
      onClose(); // Close modal completely - progress shows on main screen
      
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

  // Function to get tool icons required for each resource
  const getToolIcons = (resource: any) => {
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
        icons.push("🔪");
        break;
      case "Veado":
      case "Javali":
        icons.push("🏹", "🔱", "🔪");
        break;
      case "Peixe Pequeno":
      case "Peixe Grande":
      case "Salmão":
        icons.push("🎣");
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
              
              {/* Real-time collection progress */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm text-blue-700">🎯 Coletando Recursos:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {activeExpedition?.selectedResources?.map((resourceId) => {
                    const resource = resources.find(r => r.id === resourceId);
                    if (!resource) return null;
                    
                    // Calculate estimated collected quantity based on progress
                    const estimatedQuantity = Math.floor((expeditionProgress / 100) * 3); // Simulate collection
                    
                    return (
                      <div key={resourceId} className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{resource.emoji}</span>
                          <span className="text-sm font-medium text-blue-700">{resource.name}</span>
                        </div>
                        <div className="text-sm font-semibold text-blue-600">
                          {estimatedQuantity > 0 ? `+${estimatedQuantity}` : "..."}
                        </div>
                      </div>
                    );
                  })}
                </div>
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
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-medium text-lg">Recursos Disponíveis</h3>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setSelectedResources(collectableResources.map(r => r.id))}
                      variant="outline"
                      size="sm"
                      disabled={selectedResources.length === collectableResources.length}
                    >
                      ✅ Marcar Tudo
                    </Button>
                    <Button
                      onClick={() => setSelectedResources([])}
                      variant="outline"
                      size="sm"
                      disabled={selectedResources.length === 0}
                    >
                      ❌ Desmarcar Tudo
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
                  {collectableResources.map((resource) => {
                    const toolIcons = getToolIcons(resource);
                    return (
                      <div key={resource.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50">
                        <Checkbox
                          checked={selectedResources.includes(resource.id)}
                          onCheckedChange={() => toggleResourceSelection(resource.id)}
                        />
                        <div className="flex items-center space-x-2 flex-1">
                          <span className="text-lg">{resource.emoji}</span>
                          <div className="flex-1">
                            <div className="flex justify-between items-center">
                              <div className="font-medium">{resource.name}</div>
                              <div className="flex items-center space-x-1">
                                {toolIcons.map((icon, index) => (
                                  <span key={index} className="text-xs">{icon}</span>
                                ))}
                              </div>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              +{resource.experienceValue} XP
                            </div>
                          </div>
                        </div>
                        <Badge variant="secondary">{resource.rarity}</Badge>
                      </div>
                    );
                  })}
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
                  onClick={() => {
                    // Auto-select all resources for repeat functionality
                    setSelectedResources(collectableResources.map(r => r.id));
                  }}
                  variant="outline"
                  className="flex-1"
                  disabled={collectableResources.length === 0}
                >
                  🔄 Repetir Última
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
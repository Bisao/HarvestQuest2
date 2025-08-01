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
  onExpeditionStart?: () => void;
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
  onExpeditionStart,
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

  const canCollectResource = (resource: Resource) => {
    const resourceName = resource.name;
    
    // Basic resources (no tools required)
    if (['Fibra', 'Pedras Soltas', 'Gravetos', 'Cogumelos', 'Frutas Silvestres', 'Conchas', 'Argila'].includes(resourceName)) {
      return true;
    }
    
    // Tool required resources
    if (['Madeira', 'Bambu'].includes(resourceName)) {
      return equipment.some(eq => eq.toolType === "axe" && eq.id === player.equippedTool);
    }
    
    if (['Pedra', 'Ferro Fundido', 'Cristais'].includes(resourceName)) {
      return equipment.some(eq => eq.toolType === "pickaxe" && eq.id === player.equippedTool);
    }
    
    if (resourceName === 'Água Fresca') {
      const hasBucket = equipment.some(eq => eq.toolType === "bucket" && eq.id === player.equippedTool);
      const hasBambooBottle = equipment.some(eq => eq.toolType === "bamboo_bottle" && eq.id === player.equippedTool);
      return hasBucket || hasBambooBottle;
    }
    
    // Fish resources - need fishing rod equipped AND bait in inventory
    if (['Peixe Pequeno', 'Peixe Grande', 'Salmão'].includes(resourceName)) {
      const hasFishingRod = equipment.some(eq => eq.toolType === "fishing_rod" && eq.id === player.equippedTool);
      // Note: bait check would need inventory data here, but for UI purposes we assume if rod is equipped, bait requirement is handled by backend
      return hasFishingRod;
    }
    
    // Animals - require weapons and knife
    if (['Coelho', 'Veado', 'Javali'].includes(resourceName)) {
      const hasWeapon = player.equippedWeapon !== null;
      const hasKnife = equipment.some(eq => eq.toolType === "knife" && 
        (eq.id === player.equippedTool || eq.id === player.equippedWeapon));
      return hasWeapon && hasKnife;
    }
    
    return true; // Default to collectible
  };

  const getCollectableResources = () => {
    const biomeResources = getBiomeResources();
    return biomeResources.filter(resource => canCollectResource(resource));
  };

  const getAllBiomeResources = () => {
    const biomeResources = getBiomeResources();
    
    // Sort resources: collectible first, then non-collectible
    return biomeResources.sort((a, b) => {
      const aCanCollect = canCollectResource(a);
      const bCanCollect = canCollectResource(b);
      
      if (aCanCollect && !bCanCollect) return -1;
      if (!aCanCollect && bCanCollect) return 1;
      return 0;
    });
  };

  // Expedition mutations
  const startExpeditionMutation = useMutation({
    mutationFn: async (expeditionData: {
      playerId: string;
      biomeId: string;
      selectedResources: string[];
    }) => {
      const response = await fetch('/api/expeditions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...expeditionData,
          selectedEquipment: [] // Equipment managed through equipped items
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Failed to start expedition: ${response.status}`);
      }
      
      const result = await response.json();
      return result;
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
      
      // Call onExpeditionStart to close modal and show minimized window
      if (onExpeditionStart) {
        onExpeditionStart();
      } else {
        onClose();
      }
      
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

    // Invalidate player cache to get fresh data before starting expedition
    queryClient.invalidateQueries({ queryKey: [`/api/player/${playerId}`] });

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

  // Function to get required tool text for non-collectable resources
  const getRequiredToolText = (resource: any) => {
    const resourceName = resource.name;
    
    if (['Madeira', 'Bambu'].includes(resourceName)) {
      return 'Requer machado';
    }
    
    if (['Pedra', 'Ferro Fundido', 'Cristais'].includes(resourceName)) {
      return 'Requer picareta';
    }
    
    if (resourceName === 'Água Fresca') {
      return 'Requer balde';
    }
    
    if (['Peixe Pequeno', 'Peixe Grande', 'Salmão'].includes(resourceName)) {
      return 'Requer vara de pesca';
    }
    
    if (['Coelho', 'Veado', 'Javali'].includes(resourceName)) {
      return 'Requer arma + faca';
    }
    
    return 'Ferramenta necessária';
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

          {/* Progress and completion states are now handled in the minimized window */}
          {(isExpeditionInProgress || isExpeditionComplete) && (
            <div className="space-y-4 text-center">
              <div>
                <h3 className="font-medium text-lg text-blue-600">Expedição Ativa</h3>
                <p className="text-muted-foreground">Veja o progresso na janela minimizada</p>
              </div>
              <Button onClick={onMinimize} variant="outline" className="w-full">
                Minimizar para ver progresso
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
                  {getAllBiomeResources().map((resource) => {
                    const toolIcons = getToolIcons(resource);
                    const isCollectable = canCollectResource(resource);
                    return (
                      <div key={resource.id} className={`flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 ${
                        !isCollectable ? 'opacity-50 bg-gray-50' : ''
                      }`}>
                        <Checkbox
                          checked={selectedResources.includes(resource.id)}
                          onCheckedChange={() => toggleResourceSelection(resource.id)}
                          disabled={!isCollectable}
                        />
                        <div className="flex items-center space-x-2 flex-1">
                          <span className="text-lg">{resource.emoji}</span>
                          <div className="flex-1">
                            <div className="flex justify-between items-center">
                              <div className={`font-medium ${!isCollectable ? 'text-gray-500' : ''}`}>{resource.name}</div>
                              <div className="flex items-center space-x-1">
                                {toolIcons.map((icon, index) => (
                                  <span key={index} className="text-xs">{icon}</span>
                                ))}
                                {!isCollectable && (
                                  <span className="text-xs bg-orange-100 text-orange-600 px-1 rounded">
                                    {getRequiredToolText(resource)}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className={`text-sm ${!isCollectable ? 'text-gray-400' : 'text-muted-foreground'}`}>
                              {isCollectable ? 'Coletável à mão' : 'XP: +' + resource.experienceValue}
                            </div>
                          </div>
                        </div>
                        <Badge variant={isCollectable ? "secondary" : "outline"}>{resource.rarity}</Badge>
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
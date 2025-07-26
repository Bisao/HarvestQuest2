import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import type { Biome, Resource, Equipment, Player } from "@shared/schema";

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
}

type ExpeditionPhase = "setup" | "resource-selection" | "confirmation" | "in-progress" | "completed";

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
  onExpeditionUpdate
}: ExpeditionSystemProps) {
  const [phase, setPhase] = useState<ExpeditionPhase>("setup");
  const [selectedResources, setSelectedResources] = useState<string[]>([]);
  const [localActiveExpedition, setLocalActiveExpedition] = useState<ActiveExpedition | null>(null);
  const [expeditionProgress, setExpeditionProgress] = useState(0);
  
  // Use parent's activeExpedition if provided, otherwise use local state
  const activeExpedition = parentActiveExpedition || localActiveExpedition;
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setPhase("setup");
      setSelectedResources([]);
      if (onExpeditionUpdate) {
        onExpeditionUpdate(null);
      } else {
        setLocalActiveExpedition(null);
      }
      setExpeditionProgress(0);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, [isOpen]);

  const getBiomeResources = () => {
    if (!biome) return [];
    const resourceIds = biome.availableResources as string[];
    return resourceIds.map(id => resources.find(r => r.id === id)).filter(Boolean) as Resource[];
  };

  const getCollectableResources = () => {
    const biomeResources = getBiomeResources();
    
    // Get player's equipped tool
    const equippedTool = player.equippedTool ? 
      equipment.find(eq => eq.id === player.equippedTool) : null;
    
    return biomeResources.filter(resource => {
      // If resource doesn't require a tool, it's always collectable
      if (!resource.requiredTool) return true;
      
      // If resource requires a tool, check if player has the right tool equipped
      if (equippedTool && equippedTool.toolType === resource.requiredTool) {
        return true;
      }
      
      return false;
    });
  };

  const getResourceById = (id: string) => resources.find(r => r.id === id);

  const calculateExpeditionTime = () => {
    const baseTime = 30; // 30 seconds base
    const resourceMultiplier = selectedResources.length * 5; // 5 seconds per resource
    return Math.max(10, baseTime + resourceMultiplier);
  };

  const startExpeditionMutation = useMutation({
    mutationFn: async (expeditionData: {
      playerId: string;
      biomeId: string;
      selectedResources: string[];
    }) => {
      // Include selectedEquipment as empty array since equipment is now managed by equipped items
      const dataWithEquipment = {
        ...expeditionData,
        selectedEquipment: []
      };
      const response = await apiRequest('POST', '/api/expeditions', dataWithEquipment);
      if (!response.ok) {
        throw new Error(`Failed to start expedition: ${response.status}`);
      }
      return response.json();
    },
    onSuccess: (expedition) => {
      const duration = calculateExpeditionTime();
      const newActiveExpedition: ActiveExpedition = {
        id: expedition.id,
        biomeId: expedition.biomeId,
        progress: 0,
        selectedResources: expedition.selectedResources,
        startTime: Date.now(),
        estimatedDuration: duration * 1000 // Convert to milliseconds
      };
      
      // Update parent state if callback is provided
      if (onExpeditionUpdate) {
        onExpeditionUpdate(newActiveExpedition);
      } else {
        setLocalActiveExpedition(newActiveExpedition);
      }
      
      setPhase("in-progress");
      startProgressSimulation(newActiveExpedition);
      
      // Store expedition state in parent component
      if (typeof window !== 'undefined' && (window as any).setActiveExpedition) {
        (window as any).setActiveExpedition(newActiveExpedition);
      }
      
      toast({
        title: "Expedição Iniciada!",
        description: `Coletando recursos na ${biome?.name}. Duração estimada: ${Math.round(duration)}s`,
      });
    },
    onError: (error) => {
      console.error('Expedition error:', error);
      toast({
        title: "Erro",
        description: "Não foi possível iniciar a expedição. Verifique se você tem energia suficiente.",
        variant: "destructive"
      });
    }
  });

  const completeExpeditionMutation = useMutation({
    mutationFn: async (expeditionId: string) => {
      const response = await apiRequest('POST', `/api/expeditions/${expeditionId}/complete`);
      return response.json();
    },
    onSuccess: (result) => {
      setPhase("completed");
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      
      queryClient.invalidateQueries({ queryKey: ["/api/inventory", playerId] });
      queryClient.invalidateQueries({ queryKey: ["/api/player/Player1"] });
      
      toast({
        title: "Expedição Concluída!",
        description: `Recursos coletados com sucesso!`,
      });
      
      // Force expand modal when expedition completes
      if (isMinimized) {
        onMinimize(); // This will expand the modal
      }
      
      onExpeditionComplete();
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao finalizar expedição.",
        variant: "destructive"
      });
    }
  });

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

  const handleResourceToggle = (resourceId: string) => {
    setSelectedResources(prev => 
      prev.includes(resourceId) 
        ? prev.filter(id => id !== resourceId)
        : [...prev, resourceId]
    );
  };

  const handleStartExpedition = () => {
    if (!biome) return;
    
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

  const handleClose = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    onClose();
  };

  if (!biome) return null;

  const collectableResources = getCollectableResources();
  const estimatedTime = calculateExpeditionTime();

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" aria-describedby="expedition-description">
        <div id="expedition-description" className="sr-only">
          Modal para configurar e executar expedições de coleta de recursos
        </div>
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{biome.emoji}</span>
              <div>
                <h2 className="text-2xl font-bold">Expedição na {biome.name}</h2>
                <p className="text-sm text-muted-foreground">
                  {phase === "setup" && "Configure sua expedição"}
                  {phase === "resource-selection" && "Escolha os recursos para coletar"}
                  {phase === "confirmation" && "Confirme os detalhes da expedição"}
                  {phase === "in-progress" && "Expedição em andamento..."}
                  {phase === "completed" && "Expedição concluída!"}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {phase === "in-progress" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onMinimize}
                  className="p-2"
                >
                  −
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleClose}
                className="p-2"
              >
                ✕
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Indicator */}
          <div className="flex items-center justify-between">
            {["setup", "resource-selection", "confirmation"].map((step, index) => (
              <div key={step} className={`flex items-center ${index < 2 ? "flex-1" : ""}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  phase === step ? "bg-forest text-white" :
                  ["setup", "resource-selection", "confirmation"].indexOf(phase) > index ? "bg-green-500 text-white" :
                  "bg-gray-200 text-gray-600"
                }`}>
                  {index + 1}
                </div>
                {index < 2 && <div className="flex-1 h-0.5 bg-gray-200 mx-2" />}
              </div>
            ))}
          </div>

          {/* Setup Phase */}
          {phase === "setup" && (
            <div className="text-center space-y-6">
              <div className="bg-gradient-to-br from-green-50 to-blue-50 p-8 rounded-xl">
                <h3 className="text-xl font-semibold mb-4">Bem-vindo à {biome.name}</h3>
                <p className="text-gray-600 mb-6">
                  Prepare-se para uma expedição de coleta de recursos. Você pode encontrar diversos materiais valiosos neste bioma.
                </p>
                
                {/* Show available vs collectable resources */}
                <div className="mb-6">
                  <h4 className="font-semibold mb-3">Recursos Disponíveis ({collectableResources.length}/{getBiomeResources().length} coletáveis)</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {getBiomeResources().map(resource => {
                      const isCollectable = collectableResources.some(cr => cr.id === resource.id);
                      return (
                        <div key={resource.id} className={`p-3 rounded-lg text-center border-2 ${
                          isCollectable ? "bg-white border-green-200" : "bg-gray-100 border-gray-200"
                        }`}>
                          <div className="text-2xl mb-1">{resource.emoji}</div>
                          <div className="text-sm font-medium">{resource.name}</div>
                          <div className="flex flex-col gap-1 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {resource.type === "basic" ? "Básico" : "Único"}
                            </Badge>
                            {!isCollectable && resource.requiredTool && (
                              <Badge variant="destructive" className="text-xs">
                                Requer: {resource.requiredTool}
                              </Badge>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                <Button onClick={() => setPhase("resource-selection")} className="bg-forest hover:bg-forest/90">
                  Iniciar Planejamento
                </Button>
              </div>
            </div>
          )}

          {/* Resource Selection Phase */}
          {phase === "resource-selection" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Escolha os recursos que deseja coletar:</h3>
                <Badge variant="secondary" className="text-xs">
                  {selectedResources.length} selecionados
                </Badge>
              </div>
              
              {/* Equipment Status */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">⛏️ Status dos Equipamentos</h4>
                <div className="text-sm text-blue-600">
                  {player.equippedTool ? (
                    <div className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      Ferramenta equipada: {equipment.find(eq => eq.id === player.equippedTool)?.name}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-orange-500">⚠️</span>
                      Nenhuma ferramenta equipada - apenas recursos básicos disponíveis
                    </div>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {collectableResources.map(resource => {
                  const isSelected = selectedResources.includes(resource.id);
                  const requiresTool = !!resource.requiredTool;
                  
                  return (
                    <label
                      key={resource.id}
                      className={`cursor-pointer p-4 border-2 rounded-lg transition-all ${
                        isSelected
                          ? "border-forest bg-green-50"
                          : "border-gray-200 hover:border-forest/50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleResourceToggle(resource.id)}
                        className="sr-only"
                      />
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{resource.emoji}</span>
                        <div className="flex-1">
                          <h4 className="font-semibold">{resource.name}</h4>
                          <p className="text-sm text-gray-600">
                            Peso: {resource.weight}kg • Valor: {resource.value} moedas
                          </p>
                          <div className="flex gap-2 mt-2">
                            <Badge variant={resource.rarity === "rare" ? "destructive" : resource.rarity === "uncommon" ? "secondary" : "outline"}>
                              {resource.rarity === "common" ? "Comum" : resource.rarity === "uncommon" ? "Incomum" : "Raro"}
                            </Badge>
                            {requiresTool && (
                              <Badge variant="outline" className="text-xs">
                                Requer: {resource.requiredTool}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
              
              {collectableResources.length === 0 && (
                <div className="text-center p-8 bg-orange-50 border border-orange-200 rounded-lg">
                  <h4 className="font-semibold text-orange-800 mb-2">⚠️ Nenhum recurso coletável</h4>
                  <p className="text-orange-600">
                    Você precisa equipar ferramentas adequadas para coletar recursos neste bioma. 
                    Acesse o inventário e equipe ferramentas antes de iniciar a expedição.
                  </p>
                </div>
              )}
              
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setPhase("setup")}>
                  Voltar
                </Button>
                <Button 
                  onClick={() => setPhase("confirmation")}
                  disabled={selectedResources.length === 0}
                  className="bg-forest hover:bg-forest/90"
                >
                  Próximo: Confirmação
                </Button>
              </div>
            </div>
          )}

          {/* Confirmation Phase */}
          {phase === "confirmation" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Confirme os detalhes da sua expedição:</h3>
              
              <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Destino:</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{biome.emoji}</span>
                    <span className="font-medium">{biome.name}</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Recursos Selecionados ({selectedResources.length}):</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {selectedResources.map(resourceId => {
                      const resource = getResourceById(resourceId);
                      if (!resource) return null;
                      return (
                        <div key={resourceId} className="flex items-center gap-2 bg-white p-2 rounded">
                          <span>{resource.emoji}</span>
                          <span className="text-sm">{resource.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Tempo Estimado:</h4>
                  <p className="text-lg font-bold text-forest">{estimatedTime} segundos</p>
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setPhase("resource-selection")}>
                  Voltar
                </Button>
                <Button 
                  onClick={handleStartExpedition}
                  disabled={startExpeditionMutation.isPending}
                  className="bg-forest hover:bg-forest/90"
                >
                  {startExpeditionMutation.isPending ? "Iniciando..." : "🚀 Iniciar Expedição"}
                </Button>
              </div>
            </div>
          )}

          {/* In Progress Phase */}
          {phase === "in-progress" && activeExpedition && (
            <div className="space-y-6 text-center">
              <div className="bg-gradient-to-br from-blue-50 to-green-50 p-8 rounded-xl">
                <h3 className="text-xl font-semibold mb-4">Expedição em Andamento</h3>
                <div className="text-6xl mb-4">{biome.emoji}</div>
                <p className="text-gray-600 mb-6">
                  Coletando recursos na {biome.name}...
                </p>
                
                <div className="space-y-4">
                  <Progress value={expeditionProgress} className="w-full" />
                  <p className="text-sm font-medium">
                    Progresso: {Math.floor(expeditionProgress)}%
                  </p>
                  
                  {expeditionProgress >= 100 && (
                    <Button 
                      onClick={handleCompleteExpedition}
                      disabled={completeExpeditionMutation.isPending}
                      className="bg-forest hover:bg-forest/90"
                    >
                      {completeExpeditionMutation.isPending ? "Finalizando..." : "✅ Finalizar Expedição"}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Completed Phase */}
          {phase === "completed" && (
            <div className="space-y-6 text-center">
              <div className="bg-gradient-to-br from-green-50 to-blue-50 p-8 rounded-xl">
                <h3 className="text-xl font-semibold mb-4">🎉 Expedição Concluída!</h3>
                <p className="text-gray-600 mb-6">
                  Sua expedição na {biome.name} foi concluída com sucesso!
                  Os recursos coletados foram adicionados ao seu inventário.
                </p>
                <Button onClick={handleClose} className="bg-forest hover:bg-forest/90">
                  Fechar
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
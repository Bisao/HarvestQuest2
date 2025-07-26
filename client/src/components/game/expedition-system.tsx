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
  const [expeditionRewards, setExpeditionRewards] = useState<any>(null);
  const [autoCompleteTimer, setAutoCompleteTimer] = useState<number>(5);

  // Use parent's activeExpedition if provided, otherwise use local state
  const activeExpedition = parentActiveExpedition || localActiveExpedition;
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

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
      setExpeditionRewards(result);
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

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setPhase("resource-selection");
      setSelectedResources([]);
      if (onExpeditionUpdate) {
        onExpeditionUpdate(null);
      } else {
        setLocalActiveExpedition(null);
      }
      setExpeditionProgress(0);
      setExpeditionRewards(null);
      setAutoCompleteTimer(5);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, [isOpen]);

  // Auto-complete timer when progress reaches 100%
  useEffect(() => {
    if (expeditionProgress >= 100 && phase === "in-progress") {
      const timerInterval = setInterval(() => {
        setAutoCompleteTimer(prev => {
          if (prev <= 1) {
            clearInterval(timerInterval);
            handleCompleteExpedition();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timerInterval);
    }
  }, [expeditionProgress, phase]);

  // Auto-start expedition when modal opens with last resources
  useEffect(() => {
    if (isOpen && selectedResources.length === 0 && biome) {
      // Check if this is an auto-repeat expedition
      const lastExpeditions = typeof window !== 'undefined' 
        ? JSON.parse(localStorage.getItem('lastExpeditionResources') || '{}')
        : {};

      if (lastExpeditions[biome.id] && lastExpeditions[biome.id].length > 0) {
        setSelectedResources(lastExpeditions[biome.id]);
      }
    }
  }, [isOpen, biome]);

  // Listen for auto-start expedition event
  useEffect(() => {
    const handleAutoStart = (event: CustomEvent) => {
      if (event.detail.resources && biome) {
        setSelectedResources(event.detail.resources);
        // Auto-start the expedition after setting resources
        setTimeout(() => {
          if (event.detail.resources.length > 0) {
            startExpeditionMutation.mutate({
              playerId,
              biomeId: biome.id,
              selectedResources: event.detail.resources
            });
          }
        }, 100);
      }
    };

    window.addEventListener('autoStartExpedition', handleAutoStart as EventListener);
    return () => {
      window.removeEventListener('autoStartExpedition', handleAutoStart as EventListener);
    };
  }, [biome, playerId, startExpeditionMutation]);

  const getBiomeResources = () => {
    if (!biome) return [];
    const resourceIds = biome.availableResources as string[];
    return resourceIds.map(id => resources.find(r => r.id === id)).filter(Boolean) as Resource[];
  };

  const getCollectableResources = () => {
    const biomeResources = getBiomeResources();

    // Get player's equipped tool and weapon
    const equippedTool = player.equippedTool ? 
      equipment.find(eq => eq.id === player.equippedTool) : null;
    const equippedWeapon = player.equippedWeapon ? 
      equipment.find(eq => eq.id === player.equippedWeapon) : null;

    return biomeResources.filter(resource => {
      // If resource doesn't require a tool, it's always collectable
      if (!resource.requiredTool) return true;

      // Special case for hunting large animals: requires weapon AND knife
      if (resource.requiredTool === "weapon_and_knife") {
        const hasNonKnifeWeapon = equippedWeapon && equippedWeapon.toolType !== "knife";
        const hasKnife = (equippedTool && equippedTool.toolType === "knife") || 
                         (equippedWeapon && equippedWeapon.toolType === "knife");
        return !!(hasNonKnifeWeapon && hasKnife);
      }

      // Regular tool checks - check both tool and weapon slots for the required tool
      const hasRequiredTool = (equippedTool && equippedTool.toolType === resource.requiredTool) ||
                             (equippedWeapon && equippedWeapon.toolType === resource.requiredTool);

      return hasRequiredTool;
    });
  };

  const getResourceById = (id: string) => resources.find(r => r.id === id);

  const handleResourceToggle = (resourceId: string) => {
    setSelectedResources(prev => 
      prev.includes(resourceId) 
        ? prev.filter(id => id !== resourceId)
        : [...prev, resourceId]
    );
  };

  const handleStartExpedition = () => {
    if (!biome) return;

    // Save last expedition resources for auto-repeat
    if (typeof window !== 'undefined') {
      const lastExpeditions = JSON.parse(localStorage.getItem('lastExpeditionResources') || '{}');
      lastExpeditions[biome.id] = selectedResources;
      localStorage.setItem('lastExpeditionResources', JSON.stringify(lastExpeditions));
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

  const handleClose = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    onClose();
  };

  if (!biome) {
    console.log('ExpeditionSystem: No biome provided, returning null');
    return null;
  }

  console.log('ExpeditionSystem render:', { 
    isOpen, 
    biomeName: biome.name, 
    phase, 
    selectedResources: selectedResources.length,
    activeExpedition: !!activeExpedition 
  });

  const collectableResources = getCollectableResources();
  const estimatedTime = calculateExpeditionTime();

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-4xl max-h-[95vh] w-[95vw] md:w-full overflow-y-auto" aria-describedby="expedition-description">
        <div id="expedition-description" className="sr-only">
          Modal para configurar e executar expedições de coleta de recursos
        </div>
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-3">
              <span className="text-2xl md:text-4xl">{biome.emoji}</span>
              <div>
                <h2 className="text-lg md:text-2xl font-bold">Expedição na {biome.name}</h2>
                <p className="text-xs md:text-sm text-muted-foreground">
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
            {["resource-selection", "confirmation"].map((step, index) => (
              <div key={step} className={`flex items-center ${index < 1 ? "flex-1" : ""}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  phase === step ? "bg-forest text-white" :
                  ["resource-selection", "confirmation"].indexOf(phase) > index ? "bg-green-500 text-white" :
                  "bg-gray-200 text-gray-600"
                }`}>
                  {index + 1}
                </div>
                {index < 1 && <div className="flex-1 h-0.5 bg-gray-200 mx-2" />}
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
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
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
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const allResourceIds = collectableResources.map(r => r.id);
                      setSelectedResources(
                        selectedResources.length === allResourceIds.length ? [] : allResourceIds
                      );
                    }}
                    className="text-xs"
                  >
                    {selectedResources.length === collectableResources.length ? "Desmarcar Todos" : "Selecionar Todos"}
                  </Button>
                  <Badge variant="secondary" className="text-xs">
                    {selectedResources.length} selecionados
                  </Badge>
                </div>
              </div>

              {/* Equipment Status */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">⛏️ Status dos Equipamentos</h4>
                <div className="text-sm text-blue-600 space-y-1">
                  {player.equippedTool ? (
                    <div className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      Ferramenta: {equipment.find(eq => eq.id === player.equippedTool)?.name}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-orange-500">⚠️</span>
                      Nenhuma ferramenta equipada
                    </div>
                  )}
                  {player.equippedWeapon ? (
                    <div className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      Arma: {equipment.find(eq => eq.id === player.equippedWeapon)?.name}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-orange-500">⚠️</span>
                      Nenhuma arma equipada
                    </div>
                  )}
                  {/* Special note about knife versatility */}
                  {((player.equippedTool && equipment.find(eq => eq.id === player.equippedTool)?.toolType === "knife") ||
                    (player.equippedWeapon && equipment.find(eq => eq.id === player.equippedWeapon)?.toolType === "knife")) && (
                    <div className="flex items-center gap-2 text-green-700">
                      <span>🗡️</span>
                      Faca detectada - permite esfolar animais caçados
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
                            Peso: {resource.weight}kg • Valor: {resource.value} moedas • XP: {resource.experienceValue || Math.floor(resource.value / 2)}
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
                <Button variant="outline" onClick={handleClose}>
                  Cancelar
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
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-blue-50 to-green-50 p-6 rounded-xl">
                {expeditionProgress < 100 ? (
                  <>
                    <h3 className="text-xl font-semibold mb-4 text-center">Expedição em Andamento</h3>
                    <div className="text-6xl mb-4 text-center">{biome.emoji}</div>
                    <p className="text-gray-600 mb-6 text-center">
                      Coletando recursos na {biome.name}...
                    </p>

                    <div className="space-y-4">
                      <Progress value={expeditionProgress} className="w-full" />
                      <p className="text-sm font-medium text-center">
                        Progresso: {Math.floor(expeditionProgress)}%
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="text-xl font-semibold mb-4 text-center">🎉 Expedição Concluída!</h3>

                    {/* Recursos Coletados Simulados */}
                    <div className="mb-6">
                      <h4 className="font-semibold mb-3 text-center">📦 Recursos Coletados:</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {selectedResources.map(resourceId => {
                          const resource = resources.find(r => r.id === resourceId);
                          if (!resource) return null;

                          // Simular quantidade coletada (1-3 por recurso)
                          const quantity = Math.floor(Math.random() * 3) + 1;

                          return (
                            <div key={resourceId} className="bg-white p-3 rounded-lg border flex items-center gap-2">
                              <span className="text-2xl">{resource.emoji}</span>
                              <div className="flex-1">
                                <div className="font-medium text-sm">{resource.name}</div>
                                <div className="text-xs text-gray-600">x{quantity}</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* XP e Moedas Ganhas */}
                    <div className="bg-white p-4 rounded-lg border mb-6">
                      <h4 className="font-semibold mb-2 text-center">⭐ Recompensas:</h4>
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                          <div className="text-2xl mb-1">🎯</div>
                          <div className="font-semibold text-blue-600">+{selectedResources.length * 15} XP</div>
                          <div className="text-xs text-gray-600">Experiência</div>
                        </div>
                        <div>
                          <div className="text-2xl mb-1">🪙</div>
                          <div className="font-semibold text-yellow-600">+{selectedResources.length * 8}</div>
                          <div className="text-xs text-gray-600">Moedas</div>
                        </div>
                      </div>
                    </div>

                    <div className="text-center">
                      <Button 
                        onClick={handleCompleteExpedition}
                        disabled={completeExpeditionMutation.isPending}
                        className="bg-forest hover:bg-forest/90"
                      >
                        {completeExpeditionMutation.isPending ? "Finalizando..." : "✅ Finalizar Expedição"}
                      </Button>
                      <p className="text-sm text-gray-600 mt-2">
                        Auto-finalização em {autoCompleteTimer} segundos...
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Completed Phase */}
          {phase === "completed" && expeditionRewards && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-green-50 to-blue-50 p-6 rounded-xl">
                <h3 className="text-xl font-semibold mb-4 text-center">🎉 Expedição Concluída!</h3>

                {/* Recursos Coletados */}
                <div className="mb-6">
                  <h4 className="font-semibold mb-3 text-center">📦 Recursos Coletados:</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {expeditionRewards.collectedResources && Object.entries(expeditionRewards.collectedResources).map(([resourceId, quantity]: [string, any]) => {
                      const resource = resources.find(r => r.id === resourceId);
                      if (!resource || quantity <= 0) return null;
                      return (
                        <div key={resourceId} className="bg-white p-3 rounded-lg border flex items-center gap-2">
                          <span className="text-2xl">{resource.emoji}</span>
                          <div className="flex-1">
                            <div className="font-medium text-sm">{resource.name}</div>
                            <div className="text-xs text-gray-600">x{quantity}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* XP e Moedas Ganhas */}
                <div className="bg-white p-4 rounded-lg border mb-6">
                  <h4 className="font-semibold mb-2 text-center">⭐ Recompensas:</h4>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl mb-1">🎯</div>
                      <div className="font-semibold text-blue-600">+{expeditionRewards.experienceGained || 0} XP</div>
                      <div className="text-xs text-gray-600">Experiência</div>
                    </div>
                    <div>
                      <div className="text-2xl mb-1">🪙</div>
                      <div className="font-semibold text-yellow-600">+{expeditionRewards.coinsGained || 0}</div>
                      <div className="text-xs text-gray-600">Moedas</div>
                    </div>
                  </div>
                </div>

                {/* Log da Expedição */}
                <div className="bg-gray-50 p-4 rounded-lg border mb-6">
                  <h4 className="font-semibold mb-2 text-center">📋 Log da Expedição:</h4>
                  <div className="text-sm space-y-1 text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      <span>Expedição iniciada na {biome.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      <span>Recursos selecionados para coleta: {selectedResources.length}</span>
                    </div>
                    {expeditionRewards.collectedResources && Object.keys(expeditionRewards.collectedResources).length > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-green-600">✓</span>
                        <span>Coletados {Object.keys(expeditionRewards.collectedResources).length} tipos de recursos diferentes</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      <span>Experiência e moedas adicionadas à conta</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      <span>Recursos {player.autoStorage ? 'armazenados automaticamente' : 'adicionados ao inventário'}</span>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <Button onClick={handleClose} className="bg-forest hover:bg-forest/90">
                    Fechar
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
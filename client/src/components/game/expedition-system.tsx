import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import type { Biome, Resource, Equipment } from "@shared/schema";

interface ExpeditionSystemProps {
  isOpen: boolean;
  onClose: () => void;
  biome: Biome | null;
  resources: Resource[];
  equipment: Equipment[];
  playerId: string;
  onExpeditionComplete: () => void;
}

interface ActiveExpedition {
  id: string;
  biomeId: string;
  progress: number;
  selectedResources: string[];
  startTime: number;
  estimatedDuration: number;
}

type ExpeditionPhase = "setup" | "resource-selection" | "equipment-selection" | "confirmation" | "in-progress" | "completed";

export default function ExpeditionSystem({
  isOpen,
  onClose,
  biome,
  resources,
  equipment,
  playerId,
  onExpeditionComplete
}: ExpeditionSystemProps) {
  const [phase, setPhase] = useState<ExpeditionPhase>("setup");
  const [selectedResources, setSelectedResources] = useState<string[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [activeExpedition, setActiveExpedition] = useState<ActiveExpedition | null>(null);
  const [expeditionProgress, setExpeditionProgress] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setPhase("setup");
      setSelectedResources([]);
      setSelectedEquipment([]);
      setActiveExpedition(null);
      setExpeditionProgress(0);
    } else {
      // Clean up interval when closing
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

  const getResourceById = (id: string) => resources.find(r => r.id === id);
  const getEquipmentById = (id: string) => equipment.find(e => e.id === id);

  const calculateExpeditionTime = () => {
    const baseTime = 30; // 30 seconds base
    const resourceMultiplier = selectedResources.length * 5; // 5 seconds per resource
    const equipmentReduction = selectedEquipment.reduce((reduction, equipId) => {
      const equip = getEquipmentById(equipId);
      if (equip && equip.bonus && typeof equip.bonus === 'object' && 'type' in equip.bonus) {
        const bonus = equip.bonus as any;
        if (bonus.type === 'time_reduction') {
          return reduction + (bonus.multiplier ? (1 - bonus.multiplier) * 0.3 : 0);
        }
      }
      return reduction;
    }, 0);
    
    return Math.max(10, baseTime + resourceMultiplier - (baseTime * equipmentReduction));
  };

  const startExpeditionMutation = useMutation({
    mutationFn: async (expeditionData: {
      playerId: string;
      biomeId: string;
      selectedResources: string[];
      selectedEquipment: string[];
    }) => {
      const response = await apiRequest('POST', '/api/expeditions', expeditionData);
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
      
      setActiveExpedition(newActiveExpedition);
      setPhase("in-progress");
      startProgressSimulation(newActiveExpedition);
      
      toast({
        title: "Expedição Iniciada!",
        description: `Coletando recursos na ${biome?.name}. Duração estimada: ${Math.round(duration)}s`,
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Não foi possível iniciar a expedição. Tente novamente.",
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
    }, 100);
  };

  const handleResourceToggle = (resourceId: string) => {
    setSelectedResources(prev => 
      prev.includes(resourceId) 
        ? prev.filter(id => id !== resourceId)
        : [...prev, resourceId]
    );
  };

  const handleEquipmentToggle = (equipmentId: string) => {
    setSelectedEquipment(prev => 
      prev.includes(equipmentId) 
        ? prev.filter(id => id !== equipmentId)
        : [...prev, equipmentId]
    );
  };

  const handleStartExpedition = () => {
    if (!biome) return;
    
    startExpeditionMutation.mutate({
      playerId,
      biomeId: biome.id,
      selectedResources,
      selectedEquipment
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

  const biomeResources = getBiomeResources();
  const estimatedTime = calculateExpeditionTime();

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span className="text-4xl">{biome.emoji}</span>
            <div>
              <h2 className="text-2xl font-bold">Expedição na {biome.name}</h2>
              <p className="text-sm text-muted-foreground">
                {phase === "setup" && "Configure sua expedição"}
                {phase === "resource-selection" && "Escolha os recursos para coletar"}
                {phase === "equipment-selection" && "Selecione seus equipamentos"}
                {phase === "confirmation" && "Confirme os detalhes da expedição"}
                {phase === "in-progress" && "Expedição em andamento..."}
                {phase === "completed" && "Expedição concluída!"}
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Indicator */}
          <div className="flex items-center justify-between">
            {["setup", "resource-selection", "equipment-selection", "confirmation"].map((step, index) => (
              <div key={step} className={`flex items-center ${index < 3 ? "flex-1" : ""}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  phase === step ? "bg-forest text-white" :
                  ["setup", "resource-selection", "equipment-selection", "confirmation"].indexOf(phase) > index ? "bg-green-500 text-white" :
                  "bg-gray-200 text-gray-600"
                }`}>
                  {index + 1}
                </div>
                {index < 3 && <div className="flex-1 h-0.5 bg-gray-200 mx-2" />}
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
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {biomeResources.map(resource => (
                    <div key={resource.id} className="bg-white p-3 rounded-lg text-center">
                      <div className="text-2xl mb-1">{resource.emoji}</div>
                      <div className="text-sm font-medium">{resource.name}</div>
                      <Badge variant="outline" className="text-xs mt-1">
                        {resource.type === "basic" ? "Básico" : "Único"}
                      </Badge>
                    </div>
                  ))}
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
              <h3 className="text-lg font-semibold">Escolha os recursos que deseja coletar:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {biomeResources.map(resource => (
                  <label
                    key={resource.id}
                    className={`cursor-pointer p-4 border-2 rounded-lg transition-all ${
                      selectedResources.includes(resource.id)
                        ? "border-forest bg-green-50"
                        : "border-gray-200 hover:border-forest/50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedResources.includes(resource.id)}
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
                        <Badge variant={resource.rarity === "rare" ? "destructive" : resource.rarity === "uncommon" ? "secondary" : "outline"}>
                          {resource.rarity === "common" ? "Comum" : resource.rarity === "uncommon" ? "Incomum" : "Raro"}
                        </Badge>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setPhase("setup")}>
                  Voltar
                </Button>
                <Button 
                  onClick={() => setPhase("equipment-selection")}
                  disabled={selectedResources.length === 0}
                  className="bg-forest hover:bg-forest/90"
                >
                  Próximo: Equipamentos
                </Button>
              </div>
            </div>
          )}

          {/* Equipment Selection Phase */}
          {phase === "equipment-selection" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Selecione seus equipamentos (opcional):</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {equipment.map(equip => (
                  <label
                    key={equip.id}
                    className={`cursor-pointer p-4 border-2 rounded-lg transition-all ${
                      selectedEquipment.includes(equip.id)
                        ? "border-forest bg-green-50"
                        : "border-gray-200 hover:border-forest/50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedEquipment.includes(equip.id)}
                      onChange={() => handleEquipmentToggle(equip.id)}
                      className="sr-only"
                    />
                    <div className="text-center">
                      <span className="text-4xl block mb-2">{equip.emoji}</span>
                      <h4 className="font-semibold">{equip.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{equip.effect}</p>
                    </div>
                  </label>
                ))}
              </div>
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setPhase("resource-selection")}>
                  Voltar
                </Button>
                <Button onClick={() => setPhase("confirmation")} className="bg-forest hover:bg-forest/90">
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
                  <div className="flex flex-wrap gap-2">
                    {selectedResources.map(resourceId => {
                      const resource = getResourceById(resourceId);
                      return resource ? (
                        <Badge key={resourceId} variant="outline" className="flex items-center gap-1">
                          <span>{resource.emoji}</span>
                          <span>{resource.name}</span>
                        </Badge>
                      ) : null;
                    })}
                  </div>
                </div>

                {selectedEquipment.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Equipamentos ({selectedEquipment.length}):</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedEquipment.map(equipId => {
                        const equip = getEquipmentById(equipId);
                        return equip ? (
                          <Badge key={equipId} variant="outline" className="flex items-center gap-1">
                            <span>{equip.emoji}</span>
                            <span>{equip.name}</span>
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="font-semibold mb-2">Duração Estimada:</h4>
                  <p className="text-lg">{Math.round(estimatedTime)} segundos</p>
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setPhase("equipment-selection")}>
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
              <div className="bg-blue-50 p-8 rounded-xl">
                <h3 className="text-xl font-semibold mb-4">Expedição em Andamento</h3>
                <div className="text-6xl mb-4">⚡</div>
                <p className="text-gray-600 mb-6">
                  Coletando recursos na {biome.name}...
                </p>
                
                <div className="space-y-4">
                  <Progress value={expeditionProgress} className="w-full" />
                  <p className="text-sm text-gray-600">
                    Progresso: {Math.round(expeditionProgress)}%
                  </p>
                </div>

                {expeditionProgress >= 100 && (
                  <Button 
                    onClick={handleCompleteExpedition}
                    disabled={completeExpeditionMutation.isPending}
                    className="mt-6 bg-green-600 hover:bg-green-700"
                  >
                    {completeExpeditionMutation.isPending ? "Finalizando..." : "✅ Finalizar Expedição"}
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Completed Phase */}
          {phase === "completed" && (
            <div className="space-y-6 text-center">
              <div className="bg-green-50 p-8 rounded-xl">
                <h3 className="text-xl font-semibold mb-4">Expedição Concluída!</h3>
                <div className="text-6xl mb-4">🎉</div>
                <p className="text-gray-600 mb-6">
                  Recursos coletados com sucesso! Verifique seu inventário para ver os itens obtidos.
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
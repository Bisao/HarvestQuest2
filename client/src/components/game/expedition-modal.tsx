// Novo modal de expedição com seleção de recursos e verificação de ferramentas
import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import type { Biome, Resource, Equipment, Player } from "@shared/types";

interface ExpeditionModalProps {
  isOpen: boolean;
  onClose: () => void;
  biome: Biome | null;
  resources: Resource[];
  equipment: Equipment[];
  player: Player;
  onExpeditionStart: (expeditionData: any) => void;
}

interface CollectableResource extends Resource {
  canCollect: boolean;
  requirementText: string;
  toolIcon: string;
}

export default function ExpeditionModal({
  isOpen,
  onClose,
  biome,
  resources,
  equipment,
  player,
  onExpeditionStart,
}: ExpeditionModalProps) {
  const [selectedResources, setSelectedResources] = useState<string[]>([]);
  const { toast } = useToast();

  // Reset selected resources when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedResources([]);
    }
  }, [isOpen]);

  // Get resources available in this biome with collectability check
  const getCollectableResources = (): CollectableResource[] => {
    if (!biome || !biome.availableResources || !resources || !Array.isArray(resources)) {
      console.warn('Missing data for collectable resources:', { biome, resources });
      return [];
    }

    const resourceIds = Array.isArray(biome.availableResources) 
      ? biome.availableResources as string[]
      : [];
    
    if (resourceIds.length === 0) {
      console.warn('No resource IDs found for biome:', biome.name);
      return [];
    }

    const biomeResources = resourceIds
      .filter(id => id && typeof id === 'string')
      .map(id => {
        const resource = resources.find(r => r && r.id === id);
        if (!resource) {
          console.warn('Resource not found:', id);
        }
        return resource;
      })
      .filter(Boolean) as Resource[];

    return biomeResources.map(resource => {
      if (!resource || !resource.id || !resource.name) {
        console.warn('Invalid resource found:', resource);
        return null;
      }
      
      const collectabilityInfo = checkResourceCollectability(resource);
      return {
        ...resource,
        canCollect: collectabilityInfo.canCollect,
        requirementText: collectabilityInfo.requirementText,
        toolIcon: collectabilityInfo.toolIcon,
      };
    }).filter(Boolean) as CollectableResource[];
  };

  // Check if player can collect a specific resource
  const checkResourceCollectability = (resource: Resource) => {
    if (!resource || !resource.name || typeof resource.name !== 'string') {
      console.warn('Invalid resource in collectability check:', resource);
      return {
        canCollect: false,
        requirementText: "Recurso inválido",
        toolIcon: "❌",
      };
    }
    
    const resourceName = resource.name || '';

    // Basic resources (no tools required)
    if (['Fibra', 'Pedras Soltas', 'Gravetos', 'Cogumelos', 'Frutas Silvestres', 'Conchas', 'Argila'].includes(resourceName)) {
      return {
        canCollect: true,
        requirementText: "Coletável à mão",
        toolIcon: "🤚",
      };
    }

    // Tool required resources
    if (['Madeira', 'Bambu'].includes(resourceName)) {
      const hasAxe = equipment.some(eq => eq.toolType === "axe" && eq.id === player.equippedTool);
      return {
        canCollect: hasAxe,
        requirementText: hasAxe ? "Machado equipado" : "Requer machado",
        toolIcon: "🪓",
      };
    }

    if (['Pedra', 'Ferro Fundido', 'Cristais'].includes(resourceName)) {
      const hasPickaxe = equipment.some(eq => eq.toolType === "pickaxe" && eq.id === player.equippedTool);
      return {
        canCollect: hasPickaxe,
        requirementText: hasPickaxe ? "Picareta equipada" : "Requer picareta",
        toolIcon: "⛏️",
      };
    }

    if (resourceName === 'Água Fresca') {
      const hasBucket = equipment.some(eq => eq.toolType === "bucket" && eq.id === player.equippedTool);
      const hasBambooBottle = equipment.some(eq => eq.toolType === "bamboo_bottle" && eq.id === player.equippedTool);
      const canCollect = hasBucket || hasBambooBottle;
      return {
        canCollect,
        requirementText: canCollect ? "Recipiente equipado" : "Requer balde ou garrafa de bambu",
        toolIcon: "🪣",
      };
    }

    // Fish resources
    if (['Peixe Pequeno', 'Peixe Grande', 'Salmão'].includes(resourceName)) {
      const hasFishingRod = equipment.some(eq => eq.toolType === "fishing_rod" && eq.id === player.equippedTool);
      return {
        canCollect: hasFishingRod,
        requirementText: hasFishingRod ? "Vara de pesca equipada" : "Requer vara de pesca",
        toolIcon: "🎣",
      };
    }

    // Animals - require weapons and knife
    if (['Coelho', 'Veado', 'Javali'].includes(resourceName)) {
      const hasWeapon = player.equippedWeapon !== null;
      const hasKnife = equipment.some(eq => eq.toolType === "knife" && 
        (eq.id === player.equippedTool || eq.id === player.equippedWeapon));
      const canCollect = hasWeapon && hasKnife;

      let requirementText = "Requer arma + faca";
      if (hasWeapon && hasKnife) requirementText = "Arma e faca equipadas";
      else if (hasWeapon && !hasKnife) requirementText = "Requer faca";
      else if (!hasWeapon && hasKnife) requirementText = "Requer arma";

      return {
        canCollect,
        requirementText,
        toolIcon: resourceName === 'Coelho' ? "🐰" : resourceName === 'Veado' ? "🦌" : "🐗",
      };
    }

    return {
      canCollect: true,
      requirementText: "Coletável",
      toolIcon: "✨",
    };
  };

  const collectableResources = (() => {
    const biomeResources = getCollectableResources();
    const resourcesWithCollectability = biomeResources.map(resource => {
      return {
        ...resource,
      };
    });

    // Sort resources: collectible first, then non-collectible
    return resourcesWithCollectability.sort((a, b) => {
      if (a.canCollect && !b.canCollect) return -1;
      if (!a.canCollect && b.canCollect) return 1;
      return 0;
    });
  })();
  const availableResources = collectableResources.filter(r => r.canCollect);

  // Handle resource selection
  const toggleResourceSelection = (resourceId: string) => {
    setSelectedResources(prev => 
      prev.includes(resourceId) 
        ? prev.filter(id => id !== resourceId)
        : [...prev, resourceId]
    );
  };

  // Start expedition mutation
  const startExpeditionMutation = useMutation({
    mutationFn: async (expeditionData: {
      playerId: string;
      biomeId: string;
      selectedResources: string[];
    }) => {
      // Validar dados antes de enviar
      if (!expeditionData.playerId || !expeditionData.biomeId || !expeditionData.selectedResources) {
        throw new Error('Dados de expedição incompletos');
      }

      if (expeditionData.selectedResources.length === 0) {
        throw new Error('Selecione pelo menos um recurso');
      }

      // First check if there's an active expedition and try to complete it
      try {
        const activeExpeditionResponse = await fetch(`/api/player/${expeditionData.playerId}/expeditions/active`);
        
        if (activeExpeditionResponse.ok) {
          const contentType = activeExpeditionResponse.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const activeExpedition = await activeExpeditionResponse.json();
            if (activeExpedition && activeExpedition.id) {
              // Try to complete the active expedition
              console.log('Completing active expedition:', activeExpedition.id);
              const completeResponse = await fetch(`/api/expeditions/${activeExpedition.id}/complete`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
              });
              
              if (completeResponse.ok) {
                console.log('Active expedition completed successfully');
                // Wait a moment for cache invalidation
                await new Promise(resolve => setTimeout(resolve, 500));
              }
            }
          }
        }
      } catch (error) {
        console.warn('Error handling active expedition:', error);
        // Continue with new expedition creation
      }

      // Now try to start the new expedition
      console.log('Starting new expedition with data:', expeditionData);
      const response = await fetch(`/api/expeditions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...expeditionData,
          selectedEquipment: [] // Equipment managed through equipped items
        })
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        let errorMessage = 'Erro ao iniciar expedição';
        
        if (contentType && contentType.includes('application/json')) {
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
          } catch (parseError) {
            console.error('Failed to parse error response:', parseError);
          }
        } else {
          const errorText = await response.text();
          // Extract meaningful error message from HTML if needed
          if (errorText.includes('<!DOCTYPE')) {
            errorMessage = 'Erro interno do servidor. Tente novamente.';
          } else {
            errorMessage = errorText || errorMessage;
          }
        }
        
        throw new Error(errorMessage);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Resposta inválida do servidor');
      }

      const result = await response.json();
      
      if (!result || !result.id) {
        throw new Error('Dados de expedição inválidos recebidos');
      }

      return result;
    },
    onSuccess: (data) => {
      toast({
        title: "Expedição Iniciada",
        description: `Explorando ${biome?.name}...`,
      });
      onExpeditionStart(data);
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao iniciar expedição",
        variant: "destructive",
      });
    },
  });

  const handleStartExpedition = () => {
    // Validações essenciais
    if (!biome || !biome.id) {
      toast({
        title: "Erro",
        description: "Bioma inválido selecionado",
        variant: "destructive",
      });
      return;
    }

    if (!player || !player.id) {
      toast({
        title: "Erro",
        description: "Dados do jogador inválidos",
        variant: "destructive",
      });
      return;
    }

    if (!selectedResources || selectedResources.length === 0) {
      toast({
        title: "Erro",
        description: "Selecione pelo menos um recurso para coletar",
        variant: "destructive",
      });
      return;
    }

    // Verificar se todos os recursos selecionados são válidos
    const invalidResources = selectedResources.filter(resourceId => 
      !collectableResources.find(r => r && r.id === resourceId)
    );

    if (invalidResources.length > 0) {
      console.error('Invalid resources selected:', invalidResources);
      toast({
        title: "Erro",
        description: "Recursos inválidos selecionados",
        variant: "destructive",
      });
      return;
    }

    if (player.hunger < 5 || player.thirst < 5) {
      toast({
        title: "Erro",
        description: "Você precisa de pelo menos 5 de fome e sede para explorar",
        variant: "destructive",
      });
      return;
    }

    // Verificar se há recursos coletáveis
    const validResources = selectedResources.filter(resourceId => {
      const resource = collectableResources.find(r => r.id === resourceId);
      return resource && resource.canCollect;
    });

    if (validResources.length === 0) {
      toast({
        title: "Erro",
        description: "Nenhum dos recursos selecionados pode ser coletado com seu equipamento atual",
        variant: "destructive",
      });
      return;
    }

    console.log('Starting expedition with validated data:', {
      playerId: player.id,
      biomeId: biome.id,
      selectedResources: validResources,
    });

    startExpeditionMutation.mutate({
      playerId: player.id,
      biomeId: biome.id,
      selectedResources: validResources,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <span>Explorar {biome?.name}</span>
            <Badge variant="outline">{biome?.emoji}</Badge>
          </DialogTitle>
          <DialogDescription>
            Selecione os recursos que deseja coletar durante a expedição. Verifique se você possui as ferramentas necessárias.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">


          {/* Resource selection */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium">Recursos Disponíveis para Coleta:</h4>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const availableResources = collectableResources.filter(r => r.canCollect);
                  const allAvailableSelected = availableResources.every(r => selectedResources.includes(r.id));

                  if (allAvailableSelected) {
                    // Desmarcar todos os disponíveis
                    setSelectedResources(prev => prev.filter(id => !availableResources.some(r => r.id === id)));
                  } else {
                    // Marcar todos os disponíveis
                    const newSelected = [...selectedResources];
                    availableResources.forEach(resource => {
                      if (!newSelected.includes(resource.id)) {
                        newSelected.push(resource.id);
                      }
                    });
                    setSelectedResources(newSelected);
                  }
                }}
                className="text-xs"
              >
                {(() => {
                  const availableResources = collectableResources.filter(r => r.canCollect);
                  const allAvailableSelected = availableResources.every(r => selectedResources.includes(r.id));
                  return allAvailableSelected ? "❌ Desmarcar Tudo" : "✅ Marcar Tudo";
                })()}
              </Button>
            </div>
            <ScrollArea className="h-64 border rounded-lg p-3">
              <div className="space-y-2">
                {collectableResources.map((resource) => (
                  <div
                    key={resource.id}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      resource.canCollect 
                        ? "bg-white hover:bg-gray-50" 
                        : "bg-gray-100 opacity-60"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        checked={selectedResources.includes(resource.id)}
                        onCheckedChange={() => toggleResourceSelection(resource.id)}
                        disabled={!resource.canCollect}
                      />
                      <span className="text-lg">{resource.emoji}</span>
                      <div>
                        <p className="font-medium">{resource.name}</p>
                        <p className="text-xs text-gray-600">
                          XP: {resource.experienceValue} | Valor: {resource.value}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">{resource.toolIcon}</span>
                        <span className={`text-xs ${resource.canCollect ? "text-green-600" : "text-red-600"}`}>
                          {resource.requirementText}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>



          {/* Action buttons */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              onClick={handleStartExpedition}
              disabled={
                selectedResources.length === 0 || 
                player.hunger < 5 || 
                player.thirst < 5 ||
                startExpeditionMutation.isPending
              }
            >
              {startExpeditionMutation.isPending ? "Processando..." : "Iniciar Expedição"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
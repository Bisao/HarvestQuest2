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
import { CheckCircle, Clock, Users, X } from "lucide-react";

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
    if (!biome) return [];

    const resourceIds = biome.availableResources as string[];
    const biomeResources = resourceIds
      .map(id => resources.find(r => r.id === id))
      .filter(Boolean) as Resource[];

    return biomeResources.map(resource => {
      const collectabilityInfo = checkResourceCollectability(resource);
      return {
        ...resource,
        canCollect: collectabilityInfo.canCollect,
        requirementText: collectabilityInfo.requirementText,
        toolIcon: collectabilityInfo.toolIcon,
      };
    });
  };

  // Check if player can collect a specific resource
  const checkResourceCollectability = (resource: Resource) => {
    const resourceName = resource.name;

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
      // First check if there's an active expedition and try to complete it
      try {
        const activeExpeditionResponse = await fetch(`/api/player/${player.id}/expeditions/active`);

        if (activeExpeditionResponse.ok) {
          const contentType = activeExpeditionResponse.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const activeExpedition = await activeExpeditionResponse.json();
            if (activeExpedition && activeExpedition.id) {
              // Try to complete the active expedition
              const completeResponse = await fetch(`/api/expeditions/${activeExpedition.id}/complete`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
              });

              if (completeResponse.ok) {
                const completeContentType = completeResponse.headers.get('content-type');
                if (completeContentType && completeContentType.includes('application/json')) {
                  await completeResponse.json();

                  // Wait a moment for cache invalidation
                  await new Promise(resolve => setTimeout(resolve, 1000));
                }
              }
            }
          }
        }
      } catch (error) {
        // Silent error handling - expedition conflicts are common
      }

      // Now try to start the new expedition
      const response = await fetch(`/api/expeditions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expeditionData)
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        let errorMessage = 'Failed to start expedition';

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

      return response.json();
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
    if (!biome || selectedResources.length === 0) {
      toast({
        title: "Erro",
        description: "Selecione pelo menos um recurso para coletar",
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

    startExpeditionMutation.mutate({
      playerId: player.id,
      biomeId: biome.id,
      selectedResources,
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
            Selecione os recursos que deseja coletar durante a expedição. Total de recursos disponíveis: {collectableResources.length}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">


          {/* Resource selection */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium">
                Recursos Disponíveis para Coleta ({collectableResources.filter(r => r.canCollect).length}/{collectableResources.length} acessíveis):
              </h4>
              <div className="flex space-x-2">
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
                <Badge variant="secondary" className="text-xs">
                  {selectedResources.length} selecionados
                </Badge>
              </div>
            </div>
            <ScrollArea className="h-80 border rounded-lg p-3">
              <div className="space-y-2">
                {/* Categorize resources for better organization */}
                {(() => {
                  const categories = [
                    { title: "🌾 Recursos Básicos", items: collectableResources.filter(r => ["Fibra", "Pedra", "Pedras Pequenas", "Gravetos", "Água Fresca", "Bambu", "Madeira", "Argila", "Ferro Fundido", "Couro", "Barbante"].includes(r.name)) },
                    { title: "🐾 Animais", items: collectableResources.filter(r => ["Coelho", "Veado", "Javali"].includes(r.name)) },
                    { title: "🐟 Peixes", items: collectableResources.filter(r => ["Peixe Pequeno", "Peixe Grande", "Salmão"].includes(r.name)) },
                    { title: "🌿 Plantas e Comida", items: collectableResources.filter(r => ["Cogumelos", "Frutas Silvestres", "Carne", "Ossos", "Pelo"].includes(r.name)) },
                    { title: "💎 Recursos Especiais", items: collectableResources.filter(r => !["Fibra", "Pedra", "Pedras Pequenas", "Gravetos", "Água Fresca", "Bambu", "Madeira", "Argila", "Ferro Fundido", "Couro", "Barbante", "Coelho", "Veado", "Javali", "Peixe Pequeno", "Peixe Grande", "Salmão", "Cogumelos", "Frutas Silvestres", "Carne", "Ossos", "Pelo"].includes(r.name)) }
                  ];

                  return categories.map(category => (
                    category.items.length > 0 && (
                      <div key={category.title} className="mb-4">
                        <h5 className="font-semibold text-sm mb-2 text-gray-700 border-b pb-1">
                          {category.title}
                        </h5>
                        <div className="space-y-2">
                          {category.items.map(resource => (
                <div
                  key={resource.id}
                  className={`p-3 border rounded transition-colors ${
                    selectedResources.includes(resource.id)
                      ? 'border-blue-500 bg-blue-50'
                      : resource.canCollect
                      ? 'border-gray-200 hover:border-gray-300 cursor-pointer'
                      : 'border-red-200 bg-red-50 opacity-60 cursor-not-allowed'
                  }`}
                  onClick={() => resource.canCollect && toggleResourceSelection(resource.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{resource.emoji}</span>
                      <span className={`font-medium ${!resource.canCollect ? 'text-gray-500' : ''}`}>
                        {resource.name}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-sm">{resource.toolIcon}</span>
                      {selectedResources.includes(resource.id) && (
                        <CheckCircle className="h-4 w-4 text-blue-500" />
                      )}
                      {!resource.canCollect && (
                        <X className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  </div>

                  <div className="mt-1">
                    <span className={`text-xs ${
                      resource.canCollect ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {resource.requirementText}
                    </span>
                  </div>
                </div>
              ))}
                        </div>
                      </div>
                    )
                  ));
                })()}
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
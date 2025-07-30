// Novo modal de expedição com seleção de recursos e verificação de ferramentas
import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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

  const collectableResources = getCollectableResources();
  const availableResources = collectableResources.filter(r => r.canCollect);

  // Handle resource selection
  const toggleResourceSelection = (resourceId: string) => {
    setSelectedResources(prev => 
      prev.includes(resourceId) 
        ? prev.filter(id => id !== resourceId)
        : [...prev, resourceId]
    );
  };

  // Select all available resources
  const handleSelectAll = () => {
    const allAvailableIds = availableResources.map(r => r.id);
    setSelectedResources(allAvailableIds);
  };

  // Deselect all resources
  const handleDeselectAll = () => {
    setSelectedResources([]);
  };

  // Start expedition mutation
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
        body: JSON.stringify(expeditionData),
      });
      if (!response.ok) {
        throw new Error('Failed to start expedition');
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
      <DialogContent className="max-w-3xl max-h-[85vh] bg-gradient-to-br from-blue-50 to-indigo-100">
        <DialogHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 -m-6 mb-4 p-4 rounded-t-lg">
          <DialogTitle className="flex items-center space-x-3 text-white">
            <span className="text-2xl">{biome?.emoji}</span>
            <span className="text-xl font-bold">Explorar {biome?.name}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Requirements check */}
          <div className="bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-blue-200 shadow-sm">
            <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
              <span className="mr-2">📋</span> Requisitos:
            </h4>
            <div className="flex items-center space-x-6 text-sm">
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${
                player.hunger >= 5 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              }`}>
                <span>🍖</span>
                <span>Fome: {player.hunger}/100</span>
                <span>{player.hunger >= 5 ? "✓" : "✗"}</span>
              </div>
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${
                player.thirst >= 5 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              }`}>
                <span>💧</span>
                <span>Sede: {player.thirst}/100</span>
                <span>{player.thirst >= 5 ? "✓" : "✗"}</span>
              </div>
            </div>
          </div>

          {/* Resource selection */}
          <div className="bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-blue-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-800 flex items-center">
                <span className="mr-2">🎯</span> Recursos Disponíveis para Coleta:
              </h4>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                  disabled={availableResources.length === 0}
                  className="text-xs"
                >
                  Selecionar Tudo
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeselectAll}
                  disabled={selectedResources.length === 0}
                  className="text-xs"
                >
                  Desmarcar Tudo
                </Button>
              </div>
            </div>
            
            {availableResources.length > 0 ? (
              <ScrollArea className="h-72 border-2 border-blue-200 rounded-lg bg-white/50">
                <div className="p-3 space-y-3">
                  {availableResources.map((resource) => (
                    <div
                      key={resource.id}
                      className="flex items-center justify-between p-4 rounded-xl bg-white/80 border-2 border-blue-100 hover:border-blue-300 hover:bg-white/90 transition-all duration-200 shadow-sm"
                    >
                      <div className="flex items-center space-x-4">
                        <Checkbox
                          checked={selectedResources.includes(resource.id)}
                          onCheckedChange={() => toggleResourceSelection(resource.id)}
                          className="scale-110"
                        />
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl drop-shadow-sm">{resource.emoji}</span>
                          <div>
                            <p className="font-semibold text-gray-800">{resource.name}</p>
                            <p className="text-sm text-gray-600">
                              XP: {resource.experienceValue}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`flex items-center justify-center px-3 py-2 rounded-full ${
                          resource.canCollect ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        }`}>
                          <span className="text-xl">{resource.toolIcon}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <span className="text-4xl mb-2 block">🔒</span>
                <p className="font-medium">Nenhum recurso disponível para coleta</p>
                <p className="text-sm">Você precisa equipar as ferramentas adequadas</p>
              </div>
            )}
          </div>

          {/* Selection summary */}
          {selectedResources.length > 0 && (
            <div className="bg-green-100/80 backdrop-blur-sm p-4 rounded-xl border-2 border-green-200 shadow-sm">
              <div className="flex items-center space-x-2">
                <span className="text-lg">✅</span>
                <p className="font-semibold text-green-800">
                  {selectedResources.length} recurso(s) selecionado(s) para coleta
                </p>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedResources.map(resourceId => {
                  const resource = availableResources.find(r => r.id === resourceId);
                  return resource ? (
                    <span key={resourceId} className="inline-flex items-center space-x-1 bg-green-200 text-green-800 px-2 py-1 rounded-full text-xs">
                      <span>{resource.emoji}</span>
                      <span>{resource.name}</span>
                    </span>
                  ) : null;
                })}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex justify-between pt-2">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="px-6 py-2 bg-white/80 hover:bg-white border-2 border-gray-300"
            >
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
              className="px-8 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg"
            >
              {startExpeditionMutation.isPending ? (
                <span className="flex items-center space-x-2">
                  <span className="animate-spin">⚡</span>
                  <span>Iniciando...</span>
                </span>
              ) : (
                <span className="flex items-center space-x-2">
                  <span>🚀</span>
                  <span>Iniciar Expedição</span>
                </span>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
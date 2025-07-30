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
      <DialogContent className="max-w-3xl max-h-[85vh] bg-gradient-to-br from-blue-50 to-indigo-100 overflow-hidden">
        <DialogHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 -m-6 mb-4 p-4 rounded-t-lg">
          <DialogTitle className="flex items-center justify-between text-white">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">{biome?.emoji}</span>
              <span className="text-lg font-bold">Explorar {biome?.name}</span>
            </div>
            <div className="text-xs bg-white/20 px-2 py-1 rounded-full">
              Nível {biome?.requiredLevel}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 overflow-y-auto max-h-[68vh]">
          {/* Requirements check */}
          <div className="bg-white/80 backdrop-blur-sm p-3 rounded-lg border border-blue-200 shadow-sm">
            <h4 className="font-medium text-gray-800 mb-2 flex items-center text-sm">
              <span className="mr-1">📋</span> Status do Explorador
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className={`flex items-center justify-between p-2 rounded-lg border ${
                player.hunger >= 5 ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"
              }`}>
                <div className="flex items-center space-x-1">
                  <span>🍖</span>
                  <span className="font-medium">Fome</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="font-bold">{player.hunger}/100</span>
                  <span>{player.hunger >= 5 ? "✅" : "❌"}</span>
                </div>
              </div>
              <div className={`flex items-center justify-between p-2 rounded-lg border ${
                player.thirst >= 5 ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"
              }`}>
                <div className="flex items-center space-x-1">
                  <span>💧</span>
                  <span className="font-medium">Sede</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="font-bold">{player.thirst}/100</span>
                  <span>{player.thirst >= 5 ? "✅" : "❌"}</span>
                </div>
              </div>
            </div>
            {(player.hunger < 5 || player.thirst < 5) && (
              <div className="mt-2 p-2 bg-red-100 border border-red-200 rounded-lg">
                <p className="text-red-700 text-xs font-medium">⚠️ Você precisa de pelo menos 5 de fome e sede para explorar</p>
              </div>
            )}
          </div>

          {/* Resource selection */}
          <div className="bg-white/80 backdrop-blur-sm p-3 rounded-lg border border-blue-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-800 flex items-center text-sm">
                <span className="mr-1">🎯</span> Selecione os Recursos para Coletar
              </h4>
              <div className="flex space-x-2">
                <button
                  onClick={handleSelectAll}
                  disabled={availableResources.length === 0}
                  className="px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium rounded text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ✅ Tudo
                </button>
                <button
                  onClick={handleDeselectAll}
                  disabled={selectedResources.length === 0}
                  className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ❌ Nada
                </button>
              </div>
            </div>
            
            {availableResources.length > 0 ? (
              <ScrollArea className="h-48 border border-blue-200 rounded-lg bg-white/60 p-1">
                <div className="p-2 space-y-1">
                  {availableResources.map((resource) => (
                    <div
                      key={resource.id}
                      className={`flex items-center justify-between p-2 rounded-lg border transition-all duration-200 cursor-pointer hover:shadow-sm ${
                        selectedResources.includes(resource.id)
                          ? "bg-blue-50 border-blue-300 shadow-sm"
                          : "bg-white/90 border-gray-200 hover:border-blue-200"
                      }`}
                      onClick={() => toggleResourceSelection(resource.id)}
                    >
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={selectedResources.includes(resource.id)}
                          onCheckedChange={() => toggleResourceSelection(resource.id)}
                          className="scale-90"
                        />
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{resource.emoji}</span>
                          <div>
                            <p className="font-semibold text-gray-800 text-sm">{resource.name}</p>
                            <div className="flex items-center space-x-2 text-xs text-gray-600">
                              <span>⭐ {resource.experienceValue} XP</span>
                              <span>💰 {resource.value}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-center space-y-1">
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full border ${
                          resource.canCollect ? "bg-green-100 border-green-300 text-green-700" : "bg-red-100 border-red-300 text-red-700"
                        }`}>
                          <span className="text-sm">{resource.toolIcon}</span>
                        </div>
                        <span className={`text-xs font-medium ${
                          resource.canCollect ? "text-green-700" : "text-red-700"
                        }`}>
                          {resource.canCollect ? "OK" : "X"}
                        </span>
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
            <div className="bg-gradient-to-r from-green-100 to-emerald-100 backdrop-blur-sm p-3 rounded-lg border border-green-300 shadow-sm">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-lg">🎒</span>
                <div>
                  <p className="font-semibold text-green-800 text-sm">
                    {selectedResources.length} recurso(s) selecionado(s)
                  </p>
                  <p className="text-xs text-green-700">Prontos para coleta</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1">
                {selectedResources.map(resourceId => {
                  const resource = availableResources.find(r => r.id === resourceId);
                  return resource ? (
                    <div key={resourceId} className="inline-flex items-center space-x-1 bg-white/80 border border-green-300 text-green-800 px-2 py-1 rounded text-xs">
                      <span>{resource.emoji}</span>
                      <span className="font-medium">{resource.name}</span>
                      <span className="bg-green-200 px-1 rounded">+{resource.experienceValue} XP</span>
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex justify-between gap-3 pt-3 border-t border-blue-200">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-medium rounded-lg transition-colors text-sm"
            >
              ❌ Cancelar
            </button>
            <button
              onClick={handleStartExpedition}
              disabled={
                selectedResources.length === 0 || 
                player.hunger < 5 || 
                player.thirst < 5 ||
                startExpeditionMutation.isPending
              }
              className="flex-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-lg transition-all duration-200 shadow-sm hover:shadow-md disabled:cursor-not-allowed disabled:shadow-none text-sm"
            >
              {startExpeditionMutation.isPending ? (
                <span className="flex items-center justify-center space-x-1">
                  <span className="animate-spin">⚡</span>
                  <span>Iniciando...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center space-x-1">
                  <span>🚀</span>
                  <span>Iniciar Expedição</span>
                </span>
              )}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
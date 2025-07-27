import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import type { Biome, Resource, Equipment, Player } from '@shared/schema';

interface DistanceExpeditionSystemProps {
  isOpen: boolean;
  onClose: () => void;
  biome: Biome | null;
  resources: Resource[];
  equipment: Equipment[];
  playerId: string;
  player: Player;
  onExpeditionComplete: (rewards: Record<string, number>) => void;
}

interface ExpeditionState {
  phase: 'distance-selection' | 'resource-selection' | 'in-progress' | 'completed';
  maxDistance: number;
  selectedResources: string[];
  currentDistance: number;
  collectedResources: Record<string, number>;
  autoReturnTrigger: string | null;
  timeRemaining: number;
}

export default function DistanceExpeditionSystem({
  isOpen,
  onClose,
  biome,
  resources,
  equipment,
  playerId,
  player,
  onExpeditionComplete,
}: DistanceExpeditionSystemProps) {
  const [expeditionState, setExpeditionState] = useState<ExpeditionState>({
    phase: 'distance-selection',
    maxDistance: 50,
    selectedResources: [],
    currentDistance: 0,
    collectedResources: {},
    autoReturnTrigger: null,
    timeRemaining: 0,
  });

  const queryClient = useQueryClient();

  // Get available resources for selected biome
  const availableResources = biome 
    ? resources.filter(r => Array.isArray(biome.availableResources) && biome.availableResources.includes(r.id))
    : [];

  // Get player's equipped tool and weapon for collectability check
  const equippedTool = player.equippedTool ? 
    equipment.find(eq => eq.id === player.equippedTool) : null;
  const equippedWeapon = player.equippedWeapon ? 
    equipment.find(eq => eq.id === player.equippedWeapon) : null;

  // Check if resource is collectable based on equipment
  const isResourceCollectable = (resource: Resource) => {
    // BASIC RESOURCES ARE ALWAYS COLLECTIBLE - they are known to all players
    if (resource.type === "basic") {
      return true;
    }

    // If resource doesn't require a tool, it's always collectable
    if (!resource.requiredTool) {
      return true;
    }

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
  };

  // Filter resources by distance and collectability
  const resourcesInRange = availableResources.filter(r => {
    const withinDistance = r.distanceFromCamp <= expeditionState.maxDistance;
    const isCollectable = isResourceCollectable(r);
    return withinDistance && isCollectable;
  });

  // Start distance-based expedition
  const startExpeditionMutation = useMutation({
    mutationFn: async (expeditionData: {
      playerId: string;
      biomeId: string;
      maxDistanceFromCamp: number;
      selectedResources: string[];
    }) => {
      const response = await apiRequest('POST', '/api/expeditions/distance', expeditionData);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to start expedition: ${response.status}`);
      }
      return response.json();
    },
    onSuccess: (expedition) => {
      setExpeditionState(prev => ({
        ...prev,
        phase: 'in-progress',
        currentDistance: 0,
      }));
      startCollectionSimulation(expedition.id);
    },
  });

  // Collection simulation for distance-based expedition with chance system
  const startCollectionSimulation = useCallback((expeditionId: string) => {
    const interval = setInterval(async () => {
      try {
        // Call the backend simulation API
        const response = await apiRequest('POST', `/api/expeditions/distance/${expeditionId}/simulate`, {
          currentDistance: expeditionState.currentDistance,
        });

        if (!response.ok) {
          throw new Error('Failed to simulate collection');
        }

        const result = await response.json();

        if (result.shouldReturn) {
          // Expedition should end
          clearInterval(interval);
          const completeResponse = await apiRequest('POST', `/api/expeditions/distance/${expeditionId}/complete`, {
            autoReturnTrigger: result.returnReason,
          });

          if (completeResponse.ok) {
            const completedExpedition = await completeResponse.json();
            setExpeditionState(prev => ({
              ...prev,
              phase: 'completed',
              autoReturnTrigger: result.returnReason,
              collectedResources: completedExpedition.collectedResources || prev.collectedResources,
            }));
          }
          return;
        }

        // Update state based on simulation result
        setExpeditionState(prev => {
          const newState = { ...prev };

          if (result.resourceCollected) {
            // Resource was successfully collected
            newState.collectedResources = {
              ...prev.collectedResources,
              [result.resourceCollected]: (prev.collectedResources[result.resourceCollected] || 0) + 1,
            };
            newState.timeRemaining = result.collectionTime * 60; // Convert minutes to seconds
          } else if (result.collectionTime > 0) {
            // Failed collection attempt but time was spent
            newState.timeRemaining = result.collectionTime * 60;
          } else {
            // Move to next distance
            const newDistance = Math.min(prev.currentDistance + 5, prev.maxDistance);
            newState.currentDistance = newDistance;
            newState.timeRemaining = 30; // 30 seconds to move to next position
          }

          // Reduce remaining time
          if (newState.timeRemaining > 0) {
            newState.timeRemaining = Math.max(0, newState.timeRemaining - 5); // 5 second intervals
          }

          return newState;
        });

        // Refresh player data to get updated hunger/thirst
        queryClient.invalidateQueries({ queryKey: [`/api/player/${playerId}`] });

      } catch (error) {
        console.error('Collection simulation error:', error);
        clearInterval(interval);
        setExpeditionState(prev => ({
          ...prev,
          phase: 'completed',
          autoReturnTrigger: 'error',
        }));
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [expeditionState.currentDistance, playerId, queryClient]);

  // Complete expedition
  const completeExpedition = () => {
    onExpeditionComplete(expeditionState.collectedResources);
    setExpeditionState({
      phase: 'distance-selection',
      maxDistance: 50,
      selectedResources: [],
      currentDistance: 0,
      collectedResources: {},
      autoReturnTrigger: null,
      timeRemaining: 0,
    });
    onClose();
  };

  if (!biome) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl">{biome.emoji}</span>
            Expedição na {biome.name}
            <Badge variant="outline">Sistema por Distância</Badge>
          </DialogTitle>
        </DialogHeader>

        {/* Distance Selection and Resource Selection Combined */}
        {expeditionState.phase === 'distance-selection' && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Configurar Expedição</h3>
              <p className="text-gray-600 mb-4">
                Ajuste a distância e selecione os recursos para coletar
              </p>
            </div>

            {/* Distance Slider */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Distância: {expeditionState.maxDistance}m</span>
                <span className="text-sm text-blue-600">
                  {resourcesInRange.length} recursos disponíveis
                </span>
              </div>
              
              <Slider
                value={[expeditionState.maxDistance]}
                onValueChange={(value) => 
                  setExpeditionState(prev => ({ ...prev, maxDistance: value[0] }))
                }
                max={100}
                min={10}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>10m</span>
                <span>100m</span>
              </div>
            </div>

            {/* Resource Selection */}
            <div>
              <h4 className="font-semibold mb-3">
                Selecionar Recursos ({expeditionState.selectedResources.length} selecionados)
              </h4>
              
              {resourcesInRange.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>Nenhum recurso disponível nesta distância</p>
                  <p className="text-sm">Aumente a distância para encontrar recursos</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-60 overflow-y-auto">
                  {resourcesInRange.map(resource => {
                    const isSelected = expeditionState.selectedResources.includes(resource.id);
                    const canCollect = isResourceCollectable(resource);
                    const toolRequired = resource.requiredTool && resource.type !== 'basic';
                    
                    return (
                      <button
                        key={resource.id}
                        onClick={() => {
                          if (!canCollect) return;
                          setExpeditionState(prev => ({
                            ...prev,
                            selectedResources: isSelected
                              ? prev.selectedResources.filter(id => id !== resource.id)
                              : [...prev.selectedResources, resource.id]
                          }));
                        }}
                        disabled={!canCollect}
                        className={`
                          p-3 rounded-lg border text-left transition-all
                          ${isSelected 
                            ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-200' 
                            : canCollect
                              ? 'bg-white border-gray-200 hover:bg-gray-50'
                              : 'bg-gray-50 border-gray-200 opacity-60 cursor-not-allowed'
                          }
                        `}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{resource.emoji}</span>
                          <span className="font-medium text-sm">{resource.name}</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          <div>{resource.distanceFromCamp}m</div>
                          {toolRequired && (
                            <div className="text-red-600 mt-1">
                              {resource.requiredTool === 'weapon_and_knife' 
                                ? 'Requer arma + faca' 
                                : `Requer ${resource.requiredTool}`}
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <Button 
              onClick={() => setExpeditionState(prev => ({ ...prev, phase: 'confirmation' }))}
              className="w-full"
              disabled={expeditionState.selectedResources.length === 0}
            >
              Iniciar Expedição ({expeditionState.selectedResources.length} recursos)
            </Button>
          </div>
        )}

        {/* Confirmation Phase */}
        {expeditionState.phase === 'confirmation' && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Confirmar Expedição</h3>
              <p className="text-gray-600">
                Distância máxima: {expeditionState.maxDistance}m
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2 max-h-96 overflow-y-auto">
              {resourcesInRange.map(resource => (
                <div
                  key={resource.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    expeditionState.selectedResources.includes(resource.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => {
                    setExpeditionState(prev => ({
                      ...prev,
                      selectedResources: prev.selectedResources.includes(resource.id)
                        ? prev.selectedResources.filter(id => id !== resource.id)
                        : [...prev.selectedResources, resource.id]
                    }));
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{resource.emoji}</span>
                      <div>
                        <span className="font-medium">{resource.name}</span>
                        <div className="text-sm text-gray-500">
                          {resource.distanceFromCamp}m • {resource.collectionTimeMinutes}min • {resource.weight}kg • {resource.collectionChance}% chance
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{resource.experienceValue} XP</div>
                      <div className="text-sm text-gray-500">{resource.value} moedas</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setExpeditionState(prev => ({ ...prev, phase: 'distance-selection' }))}
                className="flex-1"
              >
                Voltar
              </Button>
              <Button 
                onClick={() => {
                  startExpeditionMutation.mutate({
                    playerId,
                    biomeId: biome.id,
                    maxDistanceFromCamp: expeditionState.maxDistance,
                    selectedResources: expeditionState.selectedResources,
                  });
                }}
                className="flex-1"
                disabled={expeditionState.selectedResources.length === 0 || startExpeditionMutation.isPending}
              >
                {startExpeditionMutation.isPending ? 'Iniciando...' : 'Iniciar Expedição'}
              </Button>
            </div>
          </div>
        )}

        {/* In Progress Phase */}
        {expeditionState.phase === 'in-progress' && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Expedição em Andamento</h3>
              <p className="text-gray-600">
                Explorando até {expeditionState.maxDistance}m do acampamento
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span>Distância Atual</span>
                  <span>{expeditionState.currentDistance}m / {expeditionState.maxDistance}m</span>
                </div>
                <Progress value={(expeditionState.currentDistance / expeditionState.maxDistance) * 100} />
              </div>

              {expeditionState.timeRemaining > 0 && (
                <div>
                  <div className="flex justify-between mb-2">
                    <span>Coletando...</span>
                    <span>{Math.ceil(expeditionState.timeRemaining / 60)}min restantes</span>
                  </div>
                  <Progress value={((300 - expeditionState.timeRemaining) / 300) * 100} />
                </div>
              )}
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Recursos Coletados</h4>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(expeditionState.collectedResources).map(([resourceId, quantity]) => {
                  const resource = resources.find(r => r.id === resourceId);
                  return resource ? (
                    <div key={resourceId} className="flex items-center gap-2">
                      <span>{resource.emoji}</span>
                      <span>{resource.name}</span>
                      <span className="font-medium">x{quantity}</span>
                    </div>
                  ) : null;
                })}
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">
                A expedição continua automaticamente até:
              </p>
              <div className="flex justify-center gap-4 text-sm">
                <span>• Inventário cheio</span>
                <span>• Fome ≤ 10</span>
                <span>• Sede ≤ 10</span>
              </div>
            </div>
          </div>
        )}

        {/* Completed Phase */}
        {expeditionState.phase === 'completed' && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Expedição Concluída!</h3>
              <p className="text-gray-600">
                Retorno automático: {
                  expeditionState.autoReturnTrigger === 'inventory_full' ? 'Inventário cheio' :
                  expeditionState.autoReturnTrigger === 'hunger_low' ? 'Fome baixa' :
                  expeditionState.autoReturnTrigger === 'thirst_low' ? 'Sede baixa' : 'Manual'
                }
              </p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-700 mb-2">Recursos Coletados</h4>
              <div className="grid grid-cols-1 gap-2">
                {Object.entries(expeditionState.collectedResources).map(([resourceId, quantity]) => {
                  const resource = resources.find(r => r.id === resourceId);
                  return resource ? (
                    <div key={resourceId} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span>{resource.emoji}</span>
                        <span>{resource.name}</span>
                      </div>
                      <span className="font-medium">x{quantity} ({quantity * resource.weight}kg)</span>
                    </div>
                  ) : null;
                })}
              </div>
            </div>

            <Button onClick={completeExpedition} className="w-full">
              Concluir Expedição
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import type { Biome, Resource, Equipment, Player } from '@shared/schema';

interface SimpleExpeditionSystemProps {
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
  phase: 'setup' | 'in-progress' | 'completed';
  maxDistance: number;
  selectedResources: string[];
  currentDistance: number;
  collectedResources: Record<string, number>;
  status: string;
  autoReturnTrigger: string | null;
  timeRemaining: number;
  lastCollectedResource: string | null;
}

export default function SimpleExpeditionSystem({
  isOpen,
  onClose,
  biome,
  resources,
  equipment,
  playerId,
  player,
  onExpeditionComplete,
}: SimpleExpeditionSystemProps) {
  const [expeditionState, setExpeditionState] = useState<ExpeditionState>({
    phase: 'setup',
    maxDistance: 30,
    selectedResources: [],
    currentDistance: 0,
    collectedResources: {},
    status: 'Preparando expedição...',
    autoReturnTrigger: null,
    timeRemaining: 0,
    lastCollectedResource: null,
  });

  const queryClient = useQueryClient();

  // Get player weight status for inventory capacity indicator
  const { data: weightStatus } = useQuery<{
    currentWeight: number;
    maxWeight: number;
    percentage: number;
    level: number;
    levelRange: string;
  }>({
    queryKey: ["/api/player", playerId, "weight"],
  });

  // Get available resources for selected biome
  const availableResources = biome 
    ? resources.filter(r => 
        Array.isArray(biome.availableResources) && 
        biome.availableResources.includes(r.id)
      )
    : [];

  // Get resources available at current distance
  const resourcesInRange = availableResources.filter(r => r.distanceFromCamp <= expeditionState.maxDistance);

  // Start expedition mutation
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
      console.log('Expedition started:', expedition);
      setExpeditionState(prev => ({
        ...prev,
        phase: 'in-progress',
        currentDistance: 0,
        status: 'Procurando recursos...',
      }));
      startCollectionSimulation(expedition.id);
    },
    onError: (error) => {
      console.error('Failed to start expedition:', error);
    }
  });

  // Collection simulation with simplified logic
  const startCollectionSimulation = useCallback((expeditionId: string) => {
    let currentDistance = 0;
    let searchTime = 0;

    const interval = setInterval(async () => {
      try {
        // Advance distance slowly
        if (searchTime % 3 === 0) { // Every 3 intervals, advance distance
          currentDistance = Math.min(currentDistance + 5, expeditionState.maxDistance);
          setExpeditionState(prev => ({
            ...prev,
            currentDistance,
            status: currentDistance >= expeditionState.maxDistance ? 
              'Explorando área mais distante...' : 
              `Explorando até ${currentDistance}m do acampamento...`
          }));
        }

        searchTime++;

        // Call simulation API with current expedition state
        const response = await apiRequest('POST', `/api/expeditions/distance/${expeditionId}/simulate`, {
          currentDistance,
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
              status: 'Expedição concluída!',
            }));
          }
          return;
        }

        // Update state based on simulation result
        setExpeditionState(prev => {
          const newState = { ...prev };

          if (result.resourceCollected) {
            // Resource was collected
            const resource = resources.find(r => r.id === result.resourceCollected);
            newState.collectedResources = {
              ...prev.collectedResources,
              [result.resourceCollected]: (prev.collectedResources[result.resourceCollected] || 0) + 1,
            };
            newState.lastCollectedResource = result.resourceCollected;
            newState.status = `Coletou ${resource?.emoji || '🔍'} ${resource?.name || 'recurso'}!`;
          } else {
            newState.status = 'Procurando recursos...';
            newState.lastCollectedResource = null;
          }

          newState.timeRemaining = result.collectionTime;
          return newState;
        });

        // Refresh weight status and inventory after collection
        queryClient.invalidateQueries({ queryKey: ["/api/player", playerId, "weight"] });
        queryClient.invalidateQueries({ queryKey: ["/api/inventory", playerId] });

      } catch (error) {
        console.error('Simulation error:', error);
        clearInterval(interval);
        setExpeditionState(prev => ({
          ...prev,
          status: 'Erro na expedição - retornando...',
          phase: 'completed',
        }));
      }
    }, 2000); // Run every 2 seconds

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, [expeditionState.maxDistance, resources, playerId, queryClient]);

  // Start expedition
  const handleStartExpedition = () => {
    if (!biome || expeditionState.selectedResources.length === 0) return;

    startExpeditionMutation.mutate({
      playerId,
      biomeId: biome.id,
      maxDistanceFromCamp: expeditionState.maxDistance,
      selectedResources: expeditionState.selectedResources,
    });
  };

  // Complete expedition
  const completeExpedition = () => {
    onExpeditionComplete(expeditionState.collectedResources);
    setExpeditionState({
      phase: 'setup',
      maxDistance: 30,
      selectedResources: [],
      currentDistance: 0,
      collectedResources: {},
      status: 'Preparando expedição...',
      autoReturnTrigger: null,
      timeRemaining: 0,
      lastCollectedResource: null,
    });
    onClose();
  };

  // Toggle resource selection
  const toggleResourceSelection = (resourceId: string) => {
    setExpeditionState(prev => ({
      ...prev,
      selectedResources: prev.selectedResources.includes(resourceId)
        ? prev.selectedResources.filter(id => id !== resourceId)
        : [...prev.selectedResources, resourceId]
    }));
  };

  if (!biome) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl">{biome.emoji}</span>
            Expedição na {biome.name}
            <Badge variant="outline">Sistema Simplificado</Badge>
          </DialogTitle>
        </DialogHeader>

        {/* Inventory Capacity Indicator */}
        {weightStatus && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">🎒 Capacidade do Inventário</span>
              <span className="text-sm text-blue-600 font-medium">
                {weightStatus.currentWeight.toFixed(1)} / {weightStatus.maxWeight}kg
              </span>
            </div>
            <Progress 
              value={weightStatus.percentage} 
              className={`w-full h-2 ${
                weightStatus.percentage >= 90 ? 'text-red-500' : 
                weightStatus.percentage >= 70 ? 'text-orange-500' : 'text-green-500'
              }`}
            />
            <div className="text-xs text-gray-500 mt-1">
              {weightStatus.percentage.toFixed(1)}% utilizado
              {weightStatus.percentage >= 90 && (
                <span className="text-red-500 font-medium ml-2">⚠️ Quase cheio!</span>
              )}
            </div>
          </div>
        )}

        {/* Setup Phase */}
        {expeditionState.phase === 'setup' && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Configurar Expedição</h3>
              <p className="text-gray-600 mb-4">
                Configure a distância e selecione os recursos para coletar
              </p>
            </div>

            {/* Distance Slider */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Distância Máxima: {expeditionState.maxDistance}m</span>
                <span className="text-sm text-blue-600">
                  {resourcesInRange.length} recursos disponíveis
                </span>
              </div>
              
              <Slider
                value={[expeditionState.maxDistance]}
                onValueChange={(value) => 
                  setExpeditionState(prev => ({ ...prev, maxDistance: value[0] }))
                }
                max={80}
                min={10}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>10m</span>
                <span>80m</span>
              </div>
            </div>

            {/* Resource Selection */}
            <div className="space-y-4">
              <h4 className="font-medium">Recursos para Coletar</h4>
              <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto">
                {resourcesInRange.map((resource) => (
                  <div key={resource.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={resource.id}
                      checked={expeditionState.selectedResources.includes(resource.id)}
                      onCheckedChange={() => toggleResourceSelection(resource.id)}
                    />
                    <label 
                      htmlFor={resource.id} 
                      className="text-sm cursor-pointer flex items-center gap-2"
                    >
                      <span>{resource.emoji}</span>
                      <span>{resource.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {resource.distanceFromCamp}m
                      </Badge>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <Button 
              onClick={handleStartExpedition}
              disabled={expeditionState.selectedResources.length === 0 || startExpeditionMutation.isPending}
              className="w-full"
            >
              {startExpeditionMutation.isPending ? 'Iniciando...' : 'Iniciar Expedição'}
            </Button>
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

            {/* Player Position */}
            <div className="flex justify-between items-center">
              <span className="font-medium">Posição do Jogador</span>
              <span className="text-blue-600 font-medium">
                {expeditionState.currentDistance}m / {expeditionState.maxDistance}m
              </span>
            </div>

            <div className="text-center py-4">
              <div className="text-4xl mb-2">🏕️</div>
            </div>

            {/* Status */}
            <div className="text-center">
              <div className="text-lg font-medium mb-2">{expeditionState.status}</div>
              {expeditionState.timeRemaining > 0 && (
                <div className="text-sm text-gray-500">
                  {Math.ceil(expeditionState.timeRemaining)}min restantes
                </div>
              )}
            </div>

            <Progress value={(expeditionState.currentDistance / expeditionState.maxDistance) * 100} className="w-full" />

            {/* Collected Resources */}
            <div>
              <h4 className="font-medium mb-3">Recursos Coletados</h4>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(expeditionState.collectedResources).map(([resourceId, quantity]) => {
                  const resource = resources.find(r => r.id === resourceId);
                  return (
                    <Badge key={resourceId} variant="secondary" className="text-center p-2">
                      <span className="mr-1">{resource?.emoji}</span>
                      {quantity}x {resource?.name}
                    </Badge>
                  );
                })}
              </div>
              {Object.keys(expeditionState.collectedResources).length === 0 && (
                <p className="text-gray-500 text-center py-4">Nenhum recurso coletado ainda</p>
              )}
            </div>
          </div>
        )}

        {/* Completed Phase */}
        {expeditionState.phase === 'completed' && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">🎉 Expedição Concluída!</h3>
              {expeditionState.autoReturnTrigger && (
                <p className="text-gray-600">
                  Motivo do retorno: {
                    expeditionState.autoReturnTrigger === 'inventory_full' ? 'Inventário 90% cheio' :
                    expeditionState.autoReturnTrigger === 'hunger_low' ? 'Fome baixa (10% restante)' :
                    expeditionState.autoReturnTrigger === 'thirst_low' ? 'Sede baixa (10% restante)' :
                    'Expedição completada'
                  }
                </p>
              )}
            </div>

            {/* Final Collected Resources */}
            <div>
              <h4 className="font-medium mb-3">Recursos Coletados</h4>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(expeditionState.collectedResources).map(([resourceId, quantity]) => {
                  const resource = resources.find(r => r.id === resourceId);
                  return (
                    <Badge key={resourceId} variant="secondary" className="text-center p-3">
                      <span className="mr-2 text-lg">{resource?.emoji}</span>
                      <span className="font-medium">{quantity}x</span>
                      <span className="ml-1">{resource?.name}</span>
                    </Badge>
                  );
                })}
              </div>
              {Object.keys(expeditionState.collectedResources).length === 0 && (
                <p className="text-gray-500 text-center py-4">Nenhum recurso foi coletado</p>
              )}
            </div>

            <Button onClick={completeExpedition} className="w-full">
              Finalizar Expedição
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
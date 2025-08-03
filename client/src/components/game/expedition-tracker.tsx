import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Clock, Play, Pause, CheckCircle, MapPin } from 'lucide-react';
import type { ActiveExpedition } from '@shared/types/expedition-types';
import type { Player } from '@shared/types';

interface ExpeditionTrackerProps {
  player: Player;
}

export function ExpeditionTracker({ player }: ExpeditionTrackerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar expedições ativas
  const { data: expeditionsData, isLoading } = useQuery({
    queryKey: ['/api/expeditions/player', player.id, 'active'],
    refetchInterval: 5000, // Atualizar a cada 5 segundos
    enabled: !!player.id
  });

  // Ensure activeExpeditions is always an array
  const activeExpeditions = Array.isArray(expeditionsData) ? expeditionsData : 
                            (expeditionsData?.data && Array.isArray(expeditionsData.data)) ? expeditionsData.data : [];

  // Mutation para completar expedição
  const completeExpeditionMutation = useMutation({
    mutationFn: async (expeditionId: string) => {
      const response = await fetch(`/api/expeditions/${expeditionId}/complete`, {
        method: 'POST'
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao completar expedição');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Expedição Completada!",
        description: "Recursos coletados e experiência adicionada.",
      });
      
      // Invalidar caches
      queryClient.invalidateQueries({ queryKey: ['/api/expeditions/player', player.id] });
      queryClient.invalidateQueries({ queryKey: ['/api/player', player.username] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao completar expedição",
        variant: "destructive"
      });
    }
  });

  // Mutation para resetar expedições problemáticas
  const resetExpeditionsMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/expeditions/player/${player.id}/reset`, {
        method: 'POST'
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao resetar expedições');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Expedições Resetadas!",
        description: `${data.data.resetCount} expedições problemáticas foram canceladas.`,
      });
      
      // Invalidar caches
      queryClient.invalidateQueries({ queryKey: ['/api/expeditions/player', player.id] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao resetar expedições",
        variant: "destructive"
      });
    }
  });

  const getPhaseLabel = (phase: string) => {
    switch (phase) {
      case 'preparing': return 'Preparando';
      case 'traveling': return 'Viajando';
      case 'exploring': return 'Explorando';
      case 'returning': return 'Retornando';
      case 'completed': return 'Completa';
      default: return phase;
    }
  };

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'preparing': return 'bg-yellow-100 text-yellow-800';
      case 'traveling': return 'bg-blue-100 text-blue-800';
      case 'exploring': return 'bg-green-100 text-green-800';
      case 'returning': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimeRemaining = (endTime: number) => {
    const now = Date.now();
    const remaining = Math.max(0, endTime - now);
    const minutes = Math.floor(remaining / (1000 * 60));
    const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
    
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2].map(i => (
          <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (activeExpeditions.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-8 text-center">
          <MapPin className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <CardTitle className="text-lg mb-2">Nenhuma Expedição Ativa</CardTitle>
          <CardDescription>
            Inicie uma expedição em um bioma para começar a coletar recursos
          </CardDescription>
        </CardContent>
      </Card>
    );
  }

  // Check if there are problematic expeditions (0% progress for a long time)
  const hasProblematicExpeditions = activeExpeditions.some(exp => 
    exp.progress === 0 && (Date.now() - exp.startTime) > 5 * 60 * 1000 // 5 minutes
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Expedições Ativas</h3>
        {hasProblematicExpeditions && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => resetExpeditionsMutation.mutate()}
            disabled={resetExpeditionsMutation.isPending}
            className="text-orange-600 border-orange-300 hover:bg-orange-50"
          >
            🔧 Resetar Problemas
          </Button>
        )}
      </div>
      <div className="space-y-3">
        {activeExpeditions.map((expedition: ActiveExpedition) => {
          const isCompleted = expedition.progress >= 100;
          const timeRemaining = formatTimeRemaining(expedition.estimatedEndTime);
          
          return (
            <Card key={expedition.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">
                      Expedição #{expedition.id.slice(-6)}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      <div className="flex items-center gap-2">
                        <Badge className={getPhaseColor(expedition.currentPhase)}>
                          {getPhaseLabel(expedition.currentPhase)}
                        </Badge>
                        {!isCompleted && (
                          <div className="flex items-center gap-1 text-sm">
                            <Clock className="w-4 h-4" />
                            {timeRemaining}
                          </div>
                        )}
                      </div>
                    </CardDescription>
                  </div>
                  
                  {isCompleted && (
                    <Button
                      size="sm"
                      onClick={() => completeExpeditionMutation.mutate(expedition.id)}
                      disabled={completeExpeditionMutation.isPending}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Coletar
                    </Button>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {/* Barra de Progresso */}
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progresso</span>
                      <span>{Math.round(expedition.progress)}%</span>
                    </div>
                    <Progress 
                      value={expedition.progress} 
                      className="h-2"
                    />
                  </div>

                  {/* Recursos Coletados */}
                  {Object.keys(expedition.collectedResources).length > 0 && (
                    <div>
                      <div className="text-sm font-medium mb-2">Recursos Coletados:</div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {Object.entries(expedition.collectedResources).map(([resourceId, quantity]) => (
                          <div key={resourceId} className="flex justify-between bg-gray-50 px-2 py-1 rounded">
                            <span>Item {resourceId.slice(-6)}</span>
                            <span className="font-medium">{quantity}x</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Eventos da Expedição */}
                  {expedition.events && expedition.events.length > 0 && (
                    <div>
                      <div className="text-sm font-medium mb-2">Últimos Eventos:</div>
                      <div className="space-y-1">
                        {expedition.events.slice(-3).map((event, index) => (
                          <div key={event.id || index} className="text-xs bg-blue-50 px-2 py-1 rounded">
                            {event.description}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
              
              {/* Indicador de completude */}
              {isCompleted && (
                <div className="absolute top-2 right-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
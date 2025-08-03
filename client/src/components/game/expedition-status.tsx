
import React from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Clock, Compass, CheckCircle } from 'lucide-react';
import { useActiveExpeditions } from '@/hooks/use-active-expeditions';
import { useToast } from '@/hooks/use-toast';
import type { Biome, Resource, Player } from '@shared/types';

interface ExpeditionStatusProps {
  biome: Biome;
  player: Player;
  resources: Resource[];
  unlocked: boolean;
  onExploreBiome: (biome: Biome) => void;
}

export function ExpeditionStatus({
  biome,
  player,
  resources,
  unlocked,
  onExploreBiome
}: ExpeditionStatusProps) {
  const { activeExpeditions, formatTimeRemaining } = useActiveExpeditions(player.id);
  const { toast } = useToast();

  // Buscar expedição ativa para este bioma específico
  const activeExpedition = activeExpeditions.find(exp => 
    exp.planId === biome.id || exp.planId === biome.name
  );

  const handleCompleteExpedition = async () => {
    if (!activeExpedition) return;
    
    try {
      const response = await fetch(`/api/expeditions/${activeExpedition.id}/complete`, {
        method: 'POST'
      });
      
      if (response.ok) {
        const result = await response.json();
        toast({
          title: "🎉 Expedição Concluída!",
          description: "Recursos coletados com sucesso!",
        });
        
        // Recarregar a página para atualizar os dados
        window.location.reload();
      } else {
        throw new Error('Erro ao completar expedição');
      }
    } catch (error) {
      console.error('Erro ao finalizar expedição:', error);
      toast({
        title: "❌ Erro",
        description: "Não foi possível finalizar a expedição.",
        variant: "destructive",
      });
    }
  };

  // Se há expedição ativa para este bioma
  if (activeExpedition) {
    const isCompleted = activeExpedition.progress >= 100;
    const hasCollectedResources = Object.keys(activeExpedition.collectedResources || {}).length > 0;
    
    return (
      <div className="pt-2 space-y-3">
        {/* Log de progresso */}
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
          <div className="text-sm font-medium text-blue-800 mb-2 flex items-center space-x-2">
            <span>📋</span>
            <span>Expedição Ativa</span>
            {!isCompleted && (
              <div className="flex items-center space-x-1 text-xs">
                <Clock className="w-3 h-3" />
                <span>{formatTimeRemaining(activeExpedition.estimatedEndTime)}</span>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            {/* Progresso por fases */}
            <div className="space-y-1 text-xs">
              {activeExpedition.progress >= 20 && (
                <div className="flex items-center space-x-2 text-blue-700">
                  <span>🚶</span>
                  <span>Chegou ao bioma</span>
                </div>
              )}
              {activeExpedition.progress >= 40 && (
                <div className="flex items-center space-x-2 text-yellow-700">
                  <span>🔍</span>
                  <span>Iniciou exploração</span>
                </div>
              )}
              {activeExpedition.progress >= 80 && (
                <div className="flex items-center space-x-2 text-orange-700">
                  <span>📦</span>
                  <span>Coletando recursos</span>
                </div>
              )}
              
              {/* Recursos coletados */}
              {hasCollectedResources && (
                <div className="space-y-1">
                  {Object.entries(activeExpedition.collectedResources).map(([resourceId, quantity]) => {
                    const resource = resources.find(r => r.id === resourceId);
                    return (
                      <div key={resourceId} className="flex items-center space-x-2 text-green-700">
                        <span>✅</span>
                        <span>Coletou {quantity}x {resource?.emoji || '📦'} {resource?.name || resourceId}</span>
                      </div>
                    );
                  })}
                </div>
              )}
              
              {activeExpedition.progress >= 100 && (
                <div className="flex items-center space-x-2 text-purple-700">
                  <span>🏠</span>
                  <span>Retornando ao acampamento</span>
                </div>
              )}
            </div>
            
            {/* Barra de progresso */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Progresso</span>
                <span>{Math.round(activeExpedition.progress)}%</span>
              </div>
              <Progress 
                value={activeExpedition.progress} 
                className="h-2"
              />
              <div className="text-center text-xs text-gray-600">
                {activeExpedition.currentPhase === 'preparing' ? 'Preparando' :
                 activeExpedition.currentPhase === 'traveling' ? 'Viajando' :
                 activeExpedition.currentPhase === 'exploring' ? 'Explorando' :
                 activeExpedition.currentPhase === 'returning' ? 'Retornando' : 'Expedição'}
              </div>
            </div>
          </div>
        </div>
        
        {/* Botão de finalizar se completou */}
        {isCompleted && (
          <Button 
            onClick={handleCompleteExpedition}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            size="lg"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Finalizar Expedição
          </Button>
        )}
      </div>
    );
  }

  // Botão normal quando não há expedição ativa
  return (
    <div className="pt-2">
      <Button 
        onClick={() => onExploreBiome(biome)}
        disabled={!unlocked}
        className="w-full"
        variant={unlocked ? "default" : "secondary"}
        size="lg"
      >
        {unlocked ? (
          <>
            <Compass className="w-4 h-4 mr-2" />
            Explorar Bioma
          </>
        ) : (
          <>
            <Clock className="w-4 h-4 mr-2" />
            Desbloqueado no Nível {biome.requiredLevel}
          </>
        )}
      </Button>
    </div>
  );
}

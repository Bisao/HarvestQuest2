
import { useQuery } from '@tanstack/react-query';
import type { ActiveExpedition } from '@shared/types/expedition-types';

export function useActiveExpeditions(playerId: string) {
  const { data: activeExpeditions = [], isLoading, error } = useQuery<ActiveExpedition[]>({
    queryKey: ['/api/expeditions/player', playerId, 'active'],
    refetchInterval: 5000, // Atualizar a cada 5 segundos
    enabled: !!playerId
  });

  const getActiveExpeditionForBiome = (biomeId: string) => {
    return activeExpeditions.find(exp => exp.planId === biomeId || exp.planId.includes(biomeId));
  };

  const hasActiveExpedition = activeExpeditions.length > 0;

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

  return {
    activeExpeditions,
    isLoading,
    error,
    hasActiveExpedition,
    getActiveExpeditionForBiome,
    formatTimeRemaining,
    getPhaseLabel
  };
}

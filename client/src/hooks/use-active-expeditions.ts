
import { useQuery } from '@tanstack/react-query';
import type { ActiveExpedition } from '@shared/types/expedition-types';

interface ExpeditionFromAPI {
  id: string;
  playerId: string;
  biomeId: string;
  status: string;
  progress: number;
  startTime: number;
  collectedResources: Record<string, number>;
}

export function useActiveExpeditions(playerId: string) {
  const { data: rawData, isLoading, error } = useQuery<ExpeditionFromAPI[] | { data: ExpeditionFromAPI[] }>({
    queryKey: ['/api/expeditions/player', playerId, 'active'],
    refetchInterval: 5000, // Atualizar a cada 5 segundos
    enabled: !!playerId
  });

  // Ensure rawExpeditions is always an array
  const rawExpeditions = Array.isArray(rawData) ? rawData : 
                        (rawData?.data && Array.isArray(rawData.data)) ? rawData.data : [];

  // Converter dados da API para o formato esperado
  const activeExpeditions: ActiveExpedition[] = rawExpeditions
    .filter(exp => exp.status === 'in_progress')
    .map(exp => {
      const startTime = exp.startTime * 1000; // Converter para milliseconds se necessário
      const expeditionDuration = 30 * 60 * 1000; // 30 minutos padrão
      const currentTime = Date.now();
      const elapsed = currentTime - startTime;
      const progress = Math.min(100, (elapsed / expeditionDuration) * 100);
      
      return {
        id: exp.id,
        playerId: exp.playerId,
        planId: exp.biomeId,
        startTime: startTime,
        estimatedEndTime: startTime + expeditionDuration,
        currentPhase: getPhaseFromProgress(progress),
        progress: progress,
        completedTargets: [],
        collectedResources: exp.collectedResources || {},
        events: [],
        status: 'active' as const
      };
    });

  const getActiveExpeditionForBiome = (biomeId: string) => {
    return activeExpeditions.find(exp => exp.planId === biomeId);
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

function getPhaseFromProgress(progress: number): ActiveExpedition['currentPhase'] {
  if (progress < 20) return 'preparing';
  if (progress < 40) return 'traveling';
  if (progress < 80) return 'exploring';
  if (progress < 100) return 'returning';
  return 'completed';
}


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

  // Convert API data to expected format - server already processes active expeditions
  const activeExpeditions: ActiveExpedition[] = rawExpeditions.map(exp => {
    console.log('🔍 HOOK: Processing expedition:', {
      id: exp.id,
      biomeId: exp.biomeId,
      progress: exp.progress,
      collectedResources: exp.collectedResources
    });
    
    return {
      id: exp.id,
      playerId: exp.playerId,
      planId: exp.biomeId,
      startTime: exp.startTime,
      estimatedEndTime: exp.startTime + (30 * 60 * 1000),
      currentPhase: getPhaseFromProgress(exp.progress),
      progress: exp.progress,
      completedTargets: [],
      collectedResources: exp.collectedResources || {},
      events: [],
      status: 'active' as const
    };
  });

  console.log('🎯 Active expeditions found:', activeExpeditions.length);

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

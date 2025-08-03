
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { Player, Resource, Equipment, Biome, ActiveExpedition } from '@shared/types';

interface GameState {
  player: Player | null;
  resources: Resource[];
  equipment: Equipment[];
  biomes: Biome[];
  activeExpedition: ActiveExpedition | null;
  isLoading: boolean;
  error: string | null;
}

interface UseGameStateOptions {
  playerId: string;
  enablePolling?: boolean;
  pollingInterval?: number;
}

export function useGameState({ 
  playerId, 
  enablePolling = true, 
  pollingInterval = 2000 
}: UseGameStateOptions) {
  const queryClient = useQueryClient();
  const [activeExpedition, setActiveExpedition] = useState<ActiveExpedition | null>(null);

  // Player data query
  const { 
    data: player, 
    isLoading: playerLoading, 
    error: playerError 
  } = useQuery({
    queryKey: ['player', playerId],
    queryFn: async () => {
      try {
        console.log('🕐 HOOK: Fetching player data for:', playerId);
        const response = await fetch(`/api/player/${playerId}`);
        if (!response.ok) {
          const errorText = await response.text();
          console.error('🕐 HOOK: Player fetch failed:', response.status, errorText);
          throw new Error(`Failed to fetch player: ${response.status} ${errorText}`);
        }
        const data = await response.json();
        console.log('🕐 HOOK: Player data received:', data);
        return data.data;
      } catch (error) {
        console.error('🕐 HOOK: Network or parsing error:', error);
        throw error;
      }
    },
    refetchInterval: enablePolling ? pollingInterval : false,
    staleTime: 1000,
    gcTime: 5 * 60 * 1000,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000)
  });

  // Resources query (static data, rarely changes)
  const { 
    data: resources = [], 
    isLoading: resourcesLoading 
  } = useQuery({
    queryKey: ['resources'],
    queryFn: async () => {
      const response = await fetch('/api/resources');
      if (!response.ok) throw new Error('Failed to fetch resources');
      const data = await response.json();
      return data.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000 // 30 minutes
  });

  // Equipment query (static data)
  const { 
    data: equipment = [], 
    isLoading: equipmentLoading 
  } = useQuery({
    queryKey: ['equipment'],
    queryFn: async () => {
      const response = await fetch('/api/equipment');
      if (!response.ok) throw new Error('Failed to fetch equipment');
      const data = await response.json();
      return data.data;
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000
  });

  // Biomes query (static data)
  const { 
    data: biomes = [], 
    isLoading: biomesLoading 
  } = useQuery({
    queryKey: ['biomes'],
    queryFn: async () => {
      const response = await fetch('/api/biomes');
      if (!response.ok) throw new Error('Failed to fetch biomes');
      const data = await response.json();
      return data.data;
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000
  });

  // Computed values
  const isLoading = useMemo(() => 
    playerLoading || resourcesLoading || equipmentLoading || biomesLoading,
    [playerLoading, resourcesLoading, equipmentLoading, biomesLoading]
  );

  const error = useMemo(() => 
    playerError?.message || null,
    [playerError]
  );

  // Actions
  const updatePlayer = useCallback(async (updates: Partial<Player>) => {
    try {
      const response = await fetch(`/api/player/${playerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (!response.ok) throw new Error('Failed to update player');

      // Invalidate and refetch player data
      queryClient.invalidateQueries({ queryKey: ['player', playerId] });
    } catch (error) {
      console.error('Failed to update player:', error);
      throw error;
    }
  }, [playerId, queryClient]);

  const invalidateCache = useCallback((keys?: string[]) => {
    if (keys) {
      keys.forEach(key => {
        queryClient.invalidateQueries({ queryKey: [key] });
      });
    } else {
      queryClient.invalidateQueries();
    }
  }, [queryClient]);

  const gameState: GameState = useMemo(() => ({
    player: player || null,
    resources,
    equipment,
    biomes,
    activeExpedition,
    isLoading,
    error
  }), [player, resources, equipment, biomes, activeExpedition, isLoading, error]);

  return {
    ...gameState,
    setActiveExpedition,
    updatePlayer,
    invalidateCache,
    queryClient
  };
}

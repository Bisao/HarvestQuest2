import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

interface UseGamePollingOptions {
  playerId: string | null;
  enabled?: boolean;
  pollInterval?: number;
}

export function useGamePolling({ 
  playerId, 
  enabled = true, 
  pollInterval = 2000 // 2 seconds - much more reliable than WebSocket
}: UseGamePollingOptions) {

  // Poll player data
  const playerQuery = useQuery({
    queryKey: [`/api/player/${playerId}`],
    queryFn: async () => {
      if (!playerId) return null;
      const response = await fetch(`/api/player/${playerId}`);
      if (!response.ok) throw new Error('Failed to fetch player data');
      return response.json();
    },
    enabled: enabled && !!playerId,
    refetchInterval: pollInterval,
    refetchIntervalInBackground: true,
    staleTime: 1000, // Consider data stale after 1 second
  });

  // Poll inventory data
  const inventoryQuery = useQuery({
    queryKey: ["/api/inventory", playerId],
    queryFn: async () => {
      if (!playerId) return [];
      const response = await fetch(`/api/inventory/${playerId}`);
      if (!response.ok) throw new Error('Failed to fetch inventory');
      return response.json();
    },
    enabled: enabled && !!playerId,
    refetchInterval: pollInterval,
    refetchIntervalInBackground: true,
    staleTime: 500,
  });

  // Poll storage data
  const storageQuery = useQuery({
    queryKey: ["/api/storage", playerId],
    queryFn: async () => {
      if (!playerId) return [];
      const response = await fetch(`/api/storage/${playerId}`);
      if (!response.ok) throw new Error('Failed to fetch storage');
      return response.json();
    },
    enabled: enabled && !!playerId,
    refetchInterval: pollInterval,
    refetchIntervalInBackground: true,
    staleTime: 500,
  });

  return {
    player: playerQuery.data,
    inventory: inventoryQuery.data,
    storage: storageQuery.data,
    isLoading: playerQuery.isLoading || inventoryQuery.isLoading || storageQuery.isLoading,
    error: playerQuery.error || inventoryQuery.error || storageQuery.error,
    isConnected: true, // Always connected with polling
  };
}
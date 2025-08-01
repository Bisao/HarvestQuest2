
import { useQuery } from '@tanstack/react-query';
import { CacheManager } from '@shared/utils/cache-manager';
import type { Player, InventoryItem, StorageItem } from '@shared/types/inventory-types';

interface UseGameDataOptions {
  playerId: string | null;
  enabled?: boolean;
  pollInterval?: number;
}

interface GameData {
  player: Player | null;
  inventory: InventoryItem[];
  storage: StorageItem[];
  isLoading: boolean;
  error: Error | null;
  isConnected: boolean;
}

export function useGameData({ 
  playerId, 
  enabled = true, 
  pollInterval = 2000 
}: UseGameDataOptions): GameData {

  // Single player query
  const playerQuery = useQuery({
    queryKey: CacheManager.KEYS.PLAYER(playerId!),
    queryFn: async () => {
      if (!playerId) return null;
      const response = await fetch(`/api/player/${playerId}`);
      if (!response.ok) throw new Error('Failed to fetch player data');
      return response.json();
    },
    enabled: enabled && !!playerId,
    refetchInterval: pollInterval,
    refetchIntervalInBackground: true,
    staleTime: 1000,
  });

  // Single inventory query
  const inventoryQuery = useQuery({
    queryKey: CacheManager.KEYS.INVENTORY(playerId!),
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

  // Single storage query
  const storageQuery = useQuery({
    queryKey: CacheManager.KEYS.STORAGE(playerId!),
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
    player: playerQuery.data || null,
    inventory: inventoryQuery.data || [],
    storage: storageQuery.data || [],
    isLoading: playerQuery.isLoading || inventoryQuery.isLoading || storageQuery.isLoading,
    error: playerQuery.error || inventoryQuery.error || storageQuery.error,
    isConnected: true,
  };
}

// Backward compatibility
export { useGameData as useGamePolling };

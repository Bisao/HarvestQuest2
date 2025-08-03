
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
      const data = await response.json();
      
      // Ensure consistent number formatting
      if (data) {
        data.health = Math.round(data.health || 0);
        data.hunger = Math.round(data.hunger || 0);
        data.thirst = Math.round(data.thirst || 0);
        data.temperature = Math.round(data.temperature || 20);
        data.fatigue = Math.round(data.fatigue || 0);
        data.morale = Math.round(data.morale || 50);
        data.hygiene = Math.round(data.hygiene || 100);
      }
      
      return data;
    },
    enabled: enabled && !!playerId,
    refetchInterval: pollInterval,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 500, // Reduced stale time for more real-time updates
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
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 300, // Even faster for storage updates
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

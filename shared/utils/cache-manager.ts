/**
 * UNIFIED CACHE MANAGER
 * Centralizes all cache operations and eliminates fragmented approaches
 */

import { queryClient } from '@/lib/queryClient';

export class CacheManager {
  // Standard cache keys
  static readonly KEYS = {
    PLAYER: (playerId: string) => [`/api/player/${playerId}`] as const,
    INVENTORY: (playerId: string) => ["/api/inventory", playerId] as const,
    STORAGE: (playerId: string) => ["/api/storage", playerId] as const,
    QUESTS: (playerId: string) => [`/api/player/${playerId}/quests`] as const,
    EXPEDITIONS: (playerId: string) => ["/api/expeditions", playerId] as const,
  };

  // Invalidate all player-related cache
  static async invalidatePlayer(playerId: string): Promise<void> {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: CacheManager.KEYS.PLAYER(playerId) }),
      queryClient.invalidateQueries({ queryKey: CacheManager.KEYS.INVENTORY(playerId) }),
      queryClient.invalidateQueries({ queryKey: CacheManager.KEYS.STORAGE(playerId) }),
      queryClient.invalidateQueries({ queryKey: CacheManager.KEYS.QUESTS(playerId) }),
      queryClient.invalidateQueries({ queryKey: CacheManager.KEYS.EXPEDITIONS(playerId) }),
    ]);
  }

  // Standard cache update after mutations (simplified)
  static async updateAfterMutation(playerId: string): Promise<void> {
    await CacheManager.invalidatePlayer(playerId);

    // Force immediate refetch for critical data
    await Promise.all([
      queryClient.refetchQueries({ queryKey: CacheManager.KEYS.PLAYER(playerId) }),
      queryClient.refetchQueries({ queryKey: CacheManager.KEYS.INVENTORY(playerId) }),
      queryClient.refetchQueries({ queryKey: CacheManager.KEYS.STORAGE(playerId) }),
    ]);
  }
}
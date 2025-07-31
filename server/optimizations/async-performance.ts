// Async Performance Optimizations
// Utilities for parallelizing operations and improving async performance

import type { IStorage } from "../storage-memory";

/**
 * Batches multiple database operations for better performance
 */
export async function batchOperation<T, R>(
  items: T[],
  operation: (item: T) => Promise<R>,
  batchSize: number = 10
): Promise<R[]> {
  const results: R[] = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(operation));
    results.push(...batchResults);
  }
  
  return results;
}

/**
 * Parallel data loading for game initialization
 */
export async function loadGameDataParallel(storage: IStorage) {
  const [resources, biomes, equipment, recipes] = await Promise.all([
    storage.getAllResources(),
    storage.getAllBiomes(), 
    storage.getAllEquipment(),
    storage.getAllRecipes()
  ]);
  
  return { resources, biomes, equipment, recipes };
}

/**
 * Optimized player data loading with related information
 */
export async function loadPlayerDataParallel(storage: IStorage, playerId: string) {
  const [player, inventory, storageItems] = await Promise.all([
    storage.getPlayer(playerId),
    storage.getPlayerInventory(playerId),
    storage.getPlayerStorage(playerId)
  ]);
  
  return { player, inventory, storageItems };
}

/**
 * Cache invalidation helper with parallel operations
 */
export async function invalidateCacheParallel(playerId: string) {
  const { invalidatePlayerCache } = await import("../cache/memory-cache");
  
  // Invalidate all player-related cache entries
  invalidatePlayerCache(playerId);
  
  return true;
}

/**
 * Debounced cache cleanup to prevent excessive cleanup calls
 */
let cleanupTimer: NodeJS.Timeout | null = null;
export function debouncedCacheCleanup(delay: number = 5000) {
  if (cleanupTimer) {
    clearTimeout(cleanupTimer);
  }
  
  cleanupTimer = setTimeout(async () => {
    const { gameCache } = await import("../cache/memory-cache");
    gameCache.cleanup();
  }, delay);
}

/**
 * Memory-efficient array operations
 */
export class OptimizedArray<T> {
  private items: T[] = [];
  private readonly maxSize: number;
  
  constructor(maxSize: number = 1000) {
    this.maxSize = maxSize;
  }
  
  push(item: T): void {
    this.items.push(item);
    if (this.items.length > this.maxSize) {
      this.items.shift(); // Remove oldest item
    }
  }
  
  getAll(): T[] {
    return [...this.items]; // Return copy to prevent mutation
  }
  
  clear(): void {
    this.items.length = 0;
  }
  
  size(): number {
    return this.items.length;
  }
}
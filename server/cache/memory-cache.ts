// Simple in-memory cache implementation
// In production, this should be replaced with Redis

interface CacheItem<T> {
  data: T;
  expiresAt: number;
}

class MemoryCache {
  private cache = new Map<string, CacheItem<any>>();
  private readonly defaultTTL = 5 * 60 * 1000; // 5 minutes

  set<T>(key: string, data: T, ttlMs: number = this.defaultTTL): void {
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttlMs
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);

    if (!item) {
      return null;
    }

    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Clean expired items
  cleanup(): void {
    const now = Date.now();
    const entries = Array.from(this.cache.entries());
    for (const [key, item] of entries) {
      if (now > item.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  // Get cache stats
  getStats() {
    const now = Date.now();
    let activeItems = 0;
    let expiredItems = 0;

    const entries = Array.from(this.cache.entries());
    for (const [, item] of entries) {
      if (now > item.expiresAt) {
        expiredItems++;
      } else {
        activeItems++;
      }
    }

    return {
      totalItems: this.cache.size,
      activeItems,
      expiredItems,
      hitRate: parseFloat(this.getHitRate().toFixed(2))
    };
  }

  private hits = 0;
  private misses = 0;

  private incrementHit() { this.hits++; }
  private incrementMiss() { this.misses++; }

  private getHitRate(): number {
    const total = this.hits + this.misses;
    return total === 0 ? 0 : (this.hits / total) * 100;
  }

  // Wrapper methods that track hit/miss rates
  getWithStats<T>(key: string): T | null {
    const result = this.get<T>(key);
    if (result !== null) {
      this.incrementHit();
    } else {
      this.incrementMiss();
    }
    return result;
  }
}

// Cache keys constants
export const CACHE_KEYS = {
  ALL_RESOURCES: 'resources:all',
  ALL_BIOMES: 'biomes:all',
  ALL_EQUIPMENT: 'equipment:all',
  ALL_RECIPES: 'recipes:all',
  PLAYER_INVENTORY: (playerId: string) => `inventory:${playerId}`,
  PLAYER_STORAGE: (playerId: string) => `storage:${playerId}`,
  PLAYER_DATA: (playerId: string) => `player:${playerId}`,
  BIOME_DETAILS: (biomeId: string) => `biome:${biomeId}:details`,
  RECIPE_BY_ID: (recipeId: string) => `recipe:${recipeId}`,
  RESOURCE_BY_ID: (resourceId: string) => `resource:${resourceId}`,
  EQUIPMENT_BY_ID: (equipmentId: string) => `equipment:${equipmentId}`,
  PLAYER_ACTIVE_EXPEDITION: (playerId: string) => `expedition:active:${playerId}`,
  QUEST_PROGRESS: (playerId: string) => `quest:progress:${playerId}`
};

export const CACHE_TTL = {
  STATIC_DATA: 15 * 60 * 1000,    // 15 minutes
  PLAYER_DATA: 30 * 1000,         // 30 seconds (reduced for real-time updates)
  INVENTORY: 30 * 1000,           // 30 seconds (reduced for real-time updates)
  EXPEDITIONS: 30 * 1000          // 30 seconds
};

// Global cache instance
export const gameCache = new MemoryCache();

// Cache cleanup interval (every 2 minutes) with error handling
const cacheCleanupInterval = setInterval(() => {
  try {
    gameCache.cleanup();
    const stats = gameCache.getStats();
    if (stats.totalItems > 1000) {
      console.warn(`Cache growing large: ${stats.totalItems} items`);
    }
  } catch (error) {
    console.error('Cache cleanup failed:', error);
  }
}, 2 * 60 * 1000);

// Graceful shutdown cleanup
process.on('SIGTERM', () => {
  clearInterval(cacheCleanupInterval);
  gameCache.clear();
});

process.on('SIGINT', () => {
  clearInterval(cacheCleanupInterval);
  gameCache.clear();
});

// Cache utility functions
export function cacheGetOrSet<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttl: number = CACHE_TTL.STATIC_DATA
): Promise<T> {
  return new Promise(async (resolve, reject) => {
    try {
      // Try to get from cache first
      const cached = gameCache.getWithStats<T>(key);
      if (cached !== null) {
        resolve(cached);
        return;
      }

      // Fetch fresh data
      const data = await fetchFn();

      // Store in cache
      gameCache.set(key, data, ttl);

      resolve(data);
    } catch (error) {
      reject(error);
    }
  });
}

// Invalidate related cache entries
export function invalidatePlayerCache(playerId: string) {
  gameCache.delete(CACHE_KEYS.PLAYER_DATA(playerId));
  gameCache.delete(CACHE_KEYS.PLAYER_INVENTORY(playerId));
  gameCache.delete(CACHE_KEYS.PLAYER_STORAGE(playerId));
  gameCache.delete(CACHE_KEYS.PLAYER_ACTIVE_EXPEDITION(playerId));
  gameCache.delete(CACHE_KEYS.QUEST_PROGRESS(playerId));
}

export function invalidateStaticDataCache() {
  gameCache.delete(CACHE_KEYS.ALL_RESOURCES);
  gameCache.delete(CACHE_KEYS.ALL_BIOMES);
  gameCache.delete(CACHE_KEYS.ALL_EQUIPMENT);
  gameCache.delete(CACHE_KEYS.ALL_RECIPES);
}

// Additional invalidation functions for specific operations
export function invalidateStorageCache(playerId: string): void {
  gameCache.delete(CACHE_KEYS.PLAYER_STORAGE(playerId));
}

export function invalidateInventoryCache(playerId: string): void {
  gameCache.delete(CACHE_KEYS.PLAYER_INVENTORY(playerId));
}
/**
 * ENHANCED MEMORY OPTIMIZATION SYSTEM
 * Aggressive cache cleanup and memory management
 */

interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  accessCount: number;
  lastAccessed: number;
  size: number;
}

interface MemoryStats {
  totalEntries: number;
  totalSize: number;
  hitRate: number;
  oldestEntry: number;
  newestEntry: number;
}

export class MemoryOptimizer {
  private cache = new Map<string, CacheEntry>();
  private readonly maxCacheSize: number;
  private readonly maxAge: number;
  private readonly cleanupInterval: number;
  private cleanupTimer?: NodeJS.Timeout;
  private hits = 0;
  private misses = 0;

  constructor(
    maxCacheSize = 100 * 1024 * 1024, // 100MB default
    maxAge = 15 * 60 * 1000, // 15 minutes default
    cleanupInterval = 5 * 60 * 1000 // 5 minutes cleanup
  ) {
    this.maxCacheSize = maxCacheSize;
    this.maxAge = maxAge;
    this.cleanupInterval = cleanupInterval;
    this.startCleanupTimer();
  }

  set<T>(key: string, data: T, customTTL?: number): void {
    const size = this.estimateSize(data);
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      accessCount: 0,
      lastAccessed: Date.now(),
      size
    };

    // Check if we need to make space
    this.ensureSpace(size);

    this.cache.set(key, entry);
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    
    if (!entry) {
      this.misses++;
      return null;
    }

    const now = Date.now();
    
    // Check if expired
    if (now - entry.timestamp > this.maxAge) {
      this.cache.delete(key);
      this.misses++;
      return null;
    }

    // Update access info
    entry.lastAccessed = now;
    entry.accessCount++;
    this.hits++;

    return entry.data;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }

  private ensureSpace(requiredSize: number): void {
    const currentSize = this.getCurrentSize();
    
    if (currentSize + requiredSize <= this.maxCacheSize) {
      return;
    }

    // Need to free up space - use LRU with access frequency consideration
    const entries = Array.from(this.cache.entries())
      .map(([key, entry]) => ({
        key,
        ...entry,
        score: this.calculateEvictionScore(entry)
      }))
      .sort((a, b) => a.score - b.score); // Lower score = more likely to evict

    let freedSize = 0;
    for (const entry of entries) {
      if (currentSize - freedSize + requiredSize <= this.maxCacheSize) {
        break;
      }
      
      this.cache.delete(entry.key);
      freedSize += entry.size;
    }
  }

  private calculateEvictionScore(entry: CacheEntry): number {
    const now = Date.now();
    const age = now - entry.timestamp;
    const timeSinceLastAccess = now - entry.lastAccessed;
    
    // Combine factors: older items and less frequently accessed get lower scores
    const ageScore = age / this.maxAge; // 0-1+ range
    const accessScore = 1 / (entry.accessCount + 1); // Higher access = lower score 
    const recentAccessScore = timeSinceLastAccess / this.maxAge; // Recent = lower score
    
    return ageScore + accessScore + recentAccessScore;
  }

  private getCurrentSize(): number {
    return Array.from(this.cache.values())
      .reduce((total, entry) => total + entry.size, 0);
  }

  private estimateSize(data: any): number {
    if (data === null || data === undefined) return 8;
    
    if (typeof data === 'string') {
      return data.length * 2; // UTF-16 encoding
    }
    
    if (typeof data === 'number') {
      return 8;
    }
    
    if (typeof data === 'boolean') {
      return 4;
    }
    
    if (Array.isArray(data)) {
      return data.reduce((sum, item) => sum + this.estimateSize(item), 24); // Array overhead
    }
    
    if (typeof data === 'object') {
      return Object.entries(data).reduce(
        (sum, [key, value]) => sum + this.estimateSize(key) + this.estimateSize(value),
        24 // Object overhead
      );
    }
    
    return 64; // Default for unknown types
  }

  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.performCleanup();
    }, this.cleanupInterval);
  }

  private performCleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.maxAge) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      this.cache.delete(key);
    }

    // Force garbage collection hint if available
    if (global.gc && keysToDelete.length > 10) {
      global.gc();
    }
  }

  getStats(): MemoryStats {
    const entries = Array.from(this.cache.values());
    const now = Date.now();
    
    return {
      totalEntries: entries.length,
      totalSize: this.getCurrentSize(),
      hitRate: this.hits / (this.hits + this.misses) || 0,
      oldestEntry: entries.length > 0 ? Math.min(...entries.map(e => now - e.timestamp)) : 0,
      newestEntry: entries.length > 0 ? Math.max(...entries.map(e => now - e.timestamp)) : 0
    };
  }

  // Memory pressure handling
  handleMemoryPressure(level: 'low' | 'medium' | 'high'): void {
    switch (level) {
      case 'low':
        // Clean expired entries
        this.performCleanup();
        break;
      case 'medium':
        // Remove 25% of least accessed entries
        this.evictLeastUsed(0.25);
        break;
      case 'high':
        // Remove 50% of cache and force GC
        this.evictLeastUsed(0.5);
        if (global.gc) global.gc();
        break;
    }
  }

  private evictLeastUsed(percentage: number): void {
    const entries = Array.from(this.cache.entries());
    const toRemove = Math.floor(entries.length * percentage);
    
    entries
      .sort(([, a], [, b]) => this.calculateEvictionScore(a) - this.calculateEvictionScore(b))
      .slice(0, toRemove)
      .forEach(([key]) => this.cache.delete(key));
  }

  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    this.clear();
  }
}

// Global memory optimizer instance
export const globalMemoryOptimizer = new MemoryOptimizer();

// Utility function to monitor Node.js memory usage
export function getMemoryUsage() {
  const usage = process.memoryUsage();
  return {
    rss: Math.round(usage.rss / 1024 / 1024), // MB
    heapTotal: Math.round(usage.heapTotal / 1024 / 1024), // MB
    heapUsed: Math.round(usage.heapUsed / 1024 / 1024), // MB
    external: Math.round(usage.external / 1024 / 1024), // MB
    arrayBuffers: Math.round(usage.arrayBuffers / 1024 / 1024) // MB
  };
}

// Memory pressure detection
export function detectMemoryPressure(): 'low' | 'medium' | 'high' {
  const usage = process.memoryUsage();
  const heapUsedMB = usage.heapUsed / 1024 / 1024;
  const heapTotalMB = usage.heapTotal / 1024 / 1024;
  const utilization = heapUsedMB / heapTotalMB;

  if (utilization > 0.9) return 'high';
  if (utilization > 0.7) return 'medium';
  return 'low';
}

// Auto memory management
export function startAutoMemoryManagement(): NodeJS.Timeout {
  return setInterval(() => {
    const pressure = detectMemoryPressure();
    if (pressure !== 'low') {
      console.log(`Memory pressure detected: ${pressure}`, getMemoryUsage());
      globalMemoryOptimizer.handleMemoryPressure(pressure);
    }
  }, 30000); // Check every 30 seconds
}
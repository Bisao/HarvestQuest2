// Database Performance Optimizations
// Applied to improve query performance and reduce load times

export const DATABASE_INDEXES = [
  'idx_inventory_items_player_id',
  'idx_storage_items_player_id', 
  'idx_expeditions_player_id',
  'idx_players_username',
  'idx_resources_type',
  'idx_equipment_category'
];

export const QUERY_OPTIMIZATIONS = {
  // Batch operations for better performance
  BATCH_INSERT_SIZE: 100,
  
  // Connection pooling
  MAX_CONNECTIONS: 10,
  MIN_CONNECTIONS: 2,
  
  // Query timeouts
  QUERY_TIMEOUT: 30000, // 30 seconds
  
  // Cache settings
  DEFAULT_CACHE_TTL: 5 * 60 * 1000, // 5 minutes
  STATIC_DATA_TTL: 15 * 60 * 1000,  // 15 minutes
  PLAYER_DATA_TTL: 2 * 60 * 1000,   // 2 minutes
  INVENTORY_TTL: 1 * 60 * 1000       // 1 minute
};

// Memory optimization techniques
export const MEMORY_OPTIMIZATIONS = {
  // Prevent memory leaks
  MAX_LISTENERS: 100,
  
  // Cleanup intervals
  CACHE_CLEANUP_INTERVAL: 5 * 60 * 1000,
  MEMORY_CLEANUP_INTERVAL: 10 * 60 * 1000,
  
  // GC thresholds
  GC_MEMORY_THRESHOLD: 500 * 1024 * 1024, // 500MB
  
  // Object pooling
  OBJECT_POOL_SIZE: 1000
};
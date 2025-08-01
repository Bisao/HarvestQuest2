// Game Configuration - Centralized configuration system
// All game constants and configuration values in one place for easy maintenance

export const GAME_CONFIG = {
  // WebSocket configuration
  WEBSOCKET: {
    HEARTBEAT_INTERVAL: 30000, // 30 seconds
    RECONNECT_DELAY: 5000,     // 5 seconds
    MAX_RECONNECT_ATTEMPTS: 10,
    PING_TIMEOUT: 5000,        // 5 seconds
    CONNECTION_TIMEOUT: 10000  // 10 seconds
  },

  // Hunger and Thirst system
  HUNGER_THIRST: {
    HUNGER_DECAY_RATE: 1,      // Base points per degradation cycle
    THIRST_DECAY_RATE: 1,      // Base points per degradation cycle
    UPDATE_INTERVAL: 40000,    // 40 seconds in milliseconds
    MIN_HUNGER: 0,
    MAX_HUNGER: 100,
    MIN_THIRST: 0,
    MAX_THIRST: 100,
    CRITICAL_THRESHOLD: 20,    // Below this = critical status
    EMERGENCY_THRESHOLD: 5,    // Below this = emergency status
    LEVEL_SCALING: 0.05,       // 5% increase per level
    EQUIPMENT_BONUS: 0.1,      // 10% reduction with equipment
    HEALTH_PENALTY: {
      EMERGENCY: 5,            // Health loss when at 0
      CRITICAL: 2,             // Health loss when <= 5
      LOW: 1                   // Health loss when <= 10
    },
    NOTIFICATION_CHANCE: 0.3   // 30% chance for non-emergency warnings
  },

  // Expedition system
  EXPEDITIONS: {
    MIN_DURATION: 10000,       // 10 seconds
    MAX_DURATION: 300000,      // 5 minutes
    PROGRESS_UPDATE_INTERVAL: 1000, // 1 second
    AUTO_REPEAT_DELAY: 2000,   // 2 seconds between auto-repeats
    MAX_CONCURRENT: 1,         // Max expeditions per player
    SUCCESS_RATE_BASE: 0.8     // 80% base success rate
  },

  // API configuration
  API: {
    TIMEOUT: 10000,            // 10 seconds
    RETRY_ATTEMPTS: 3,
    CACHE_TTL: 300000,         // 5 minutes
    RATE_LIMIT_WINDOW: 900000, // 15 minutes
    RATE_LIMIT_MAX: 100,       // Requests per window
    REQUEST_SIZE_LIMIT: '10mb'
  },

  // Inventory and Storage
  INVENTORY: {
    DEFAULT_MAX_WEIGHT: 50000,
    DEFAULT_MAX_SLOTS: 36,
    AUTO_STORAGE_THRESHOLD: 0.9, // 90% full
    STACK_SIZE_DEFAULT: 999,
    STACK_SIZE_EQUIPMENT: 1
  },

  // Player progression
  PROGRESSION: {
    MAX_LEVEL: 100,
    BASE_EXP_REQUIREMENT: 100,
    EXP_MULTIPLIER: 1.2,       // Exponential growth
    COINS_PER_LEVEL: 50,
    HEALTH_PER_LEVEL: 10
  },

  // Resource collection
  COLLECTION: {
    BASE_COLLECTION_TIME: 5000, // 5 seconds
    TOOL_EFFICIENCY_BONUS: 0.5, // 50% faster with proper tool
    LUCK_FACTOR_MAX: 0.3,      // Max 30% luck bonus
    RARE_DROP_CHANCE: 0.05,    // 5% chance for rare drops
    CRITICAL_CHANCE: 0.1       // 10% chance for double resources
  },

  // Crafting system
  CRAFTING: {
    BASE_CRAFT_TIME: 2000,     // 2 seconds
    BATCH_SIZE_MAX: 100,       // Max items per batch
    SUCCESS_RATE_BASE: 0.95,   // 95% base success rate
    CRITICAL_CRAFT_CHANCE: 0.05, // 5% chance for bonus output
    SKILL_BONUS_PER_LEVEL: 0.01  // 1% per level
  },

  // Combat and equipment
  COMBAT: {
    BASE_DAMAGE: 10,
    WEAPON_DAMAGE_MULTIPLIER: 2.0,
    ARMOR_DAMAGE_REDUCTION: 0.1, // 10% per armor piece
    CRITICAL_CHANCE: 0.05,     // 5% base crit chance
    CRITICAL_MULTIPLIER: 2.0,  // Double damage on crit
    DURABILITY_LOSS_RATE: 1    // 1 point per use
  },

  // Quest system
  QUESTS: {
    MAX_ACTIVE_QUESTS: 10,
    AUTO_COMPLETE_ENABLED: true,
    REWARD_EXP_MULTIPLIER: 1.5,
    REWARD_COINS_MULTIPLIER: 1.2,
    DAILY_QUEST_COUNT: 3,
    WEEKLY_QUEST_COUNT: 1
  },

  // UI and UX
  UI: {
    TOAST_DURATION: 3000,      // 3 seconds
    LOADING_DELAY: 500,        // Show loading after 500ms
    ANIMATION_DURATION: 200,   // 200ms animations
    DEBOUNCE_DELAY: 300,       // 300ms input debounce
    REFRESH_INTERVAL: 5000,    // 5 seconds for real-time data
    MODAL_BACKDROP_BLUR: true
  },

  // Performance and caching
  PERFORMANCE: {
    LAZY_LOAD_THRESHOLD: 50,   // Items before lazy loading
    VIRTUAL_SCROLL_ITEM_HEIGHT: 60, // pixels
    IMAGE_LAZY_LOAD_MARGIN: 200, // pixels
    DEBOUNCE_SEARCH: 300,      // ms
    THROTTLE_SCROLL: 16,       // 60fps
    MEMORY_CLEANUP_INTERVAL: 300000 // 5 minutes
  },

  // Development and debugging
  DEBUG: {
    ENABLED: process.env.NODE_ENV === 'development',
    LOG_LEVEL: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
    PERFORMANCE_MONITORING: true,
    VERBOSE_WEBSOCKET: false,
    SHOW_QUERY_CACHE: false
  },

  // Feature flags
  FEATURES: {
    AUTO_SAVE: true,
    REAL_TIME_UPDATES: true,
    OFFLINE_MODE: false,
    ANALYTICS: false,
    BETA_FEATURES: process.env.NODE_ENV === 'development',
    EXPERIMENTAL_UI: false
  }
} as const;

// Type helpers for configuration
export type GameConfig = typeof GAME_CONFIG;
export type ConfigSection = keyof GameConfig;

// Configuration getters with fallbacks
export const getConfig = <T extends ConfigSection>(section: T): GameConfig[T] => {
  return GAME_CONFIG[section];
};

export const getConfigValue = <T extends ConfigSection, K extends keyof GameConfig[T]>(
  section: T, 
  key: K
): GameConfig[T][K] => {
  return GAME_CONFIG[section][key];
};

// Runtime configuration validation
export const validateConfig = (): boolean => {
  try {
    // Validate critical values
    if (GAME_CONFIG.WEBSOCKET.HEARTBEAT_INTERVAL <= 0) return false;
    if (GAME_CONFIG.HUNGER_THIRST.UPDATE_INTERVAL <= 0) return false;
    if (GAME_CONFIG.API.TIMEOUT <= 0) return false;
    if (GAME_CONFIG.EXPEDITIONS.MIN_DURATION >= GAME_CONFIG.EXPEDITIONS.MAX_DURATION) return false;
    
    return true;
  } catch (error) {
    console.error('Configuration validation failed:', error);
    return false;
  }
};

// Export individual sections for convenience
export const WEBSOCKET_CONFIG = GAME_CONFIG.WEBSOCKET;
export const HUNGER_THIRST_CONFIG = GAME_CONFIG.HUNGER_THIRST;
export const EXPEDITION_CONFIG = GAME_CONFIG.EXPEDITIONS;
export const API_CONFIG = GAME_CONFIG.API;
export const UI_CONFIG = GAME_CONFIG.UI;
export const DEBUG_CONFIG = GAME_CONFIG.DEBUG;
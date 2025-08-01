
/**
 * CENTRALIZED CONSUMPTION CONFIGURATION
 * All consumption-related settings in one place
 */

export const CONSUMPTION_CONFIG = {
  // Auto-consume thresholds (configurable)
  AUTO_CONSUME: {
    TRIGGER_THRESHOLD: 15, // % when auto-consume triggers
    MAX_THRESHOLD: 75,     // % max before stopping auto-consume
    CHECK_INTERVAL: 30000, // 30 seconds
  },

  // Degradation settings
  DEGRADATION: {
    INTERVAL: 120000,      // 2 minutes
    BASE_RATE: 1,          // Base degradation rate
    MULTIPLIERS: {
      SLOW: 0.5,
      NORMAL: 1.0,
      FAST: 1.5,
      LEVEL_BONUS: 0.05,   // +5% per level
      EQUIPMENT_REDUCTION: 0.9, // 10% reduction with equipment
    }
  },

  // Status thresholds
  STATUS: {
    CRITICAL_THRESHOLD: 20,
    EMERGENCY_THRESHOLD: 5,
    WELL_FED_THRESHOLD: 80,
  },

  // Health penalties
  PENALTIES: {
    EMERGENCY: { health: 5, xp: 0.5 },
    CRITICAL: { health: 2, xp: 0.25 },
    LOW: { health: 1, xp: 0.1 },
  }
} as const;

export type ConsumptionConfig = typeof CONSUMPTION_CONFIG;

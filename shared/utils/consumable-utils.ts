// Dynamic consumable system utilities - MODERN ONLY
import type { Resource, Equipment } from "@shared/types";
import { RESOURCE_IDS } from "@shared/constants/game-ids";

export interface ConsumableEffects {
  hungerRestore: number;
  thirstRestore: number;
  effects?: string[];
}

/**
 * Check if an item is consumable using modern system only
 */
export function isConsumable(item: any): boolean {
  if (!item) return false;

  // Primary: Check by category (modern system)
  if (item.category === 'consumable') {
    return true;
  }

  // Secondary: Check by attributes (modern system priority)
  if (item.attributes && (
    (item.attributes.hunger_restore && item.attributes.hunger_restore > 0) || 
    (item.attributes.thirst_restore && item.attributes.thirst_restore > 0)
  )) {
    return true;
  }

  // Tertiary: Check by effects array (modern system)
  if (item.effects && Array.isArray(item.effects)) {
    const consumableEffects = ['hunger_restore', 'thirst_restore', 'minor_health_regen'];
    if (item.effects.some((effect: string) => consumableEffects.includes(effect))) {
      return true;
    }
  }

  // Modern consumable IDs only (from items-modern.ts)
  const modernConsumableIds = [
    RESOURCE_IDS.CARNE_ASSADA,      // res-carne-assada-001
    RESOURCE_IDS.AGUA_FRESCA,       // res-agua-fresca-001
    RESOURCE_IDS.COGUMELOS,         // res-cogumelos-001
    RESOURCE_IDS.FRUTAS_SILVESTRES, // res-frutas-silvestres-001
    "res-cogumelos-assados-001",    // Cogumelos Assados
    RESOURCE_IDS.PEIXE_GRELHADO,    // Peixe Grelhado
    RESOURCE_IDS.ENSOPADO_CARNE,    // Ensopado de Carne
    RESOURCE_IDS.SUCO_FRUTAS,       // Suco de Frutas
    // Legacy IDs for compatibility
    "res-8bd33b18-a241-4859-ae9f-870fab5673d0", // Água
    "res-5e9d8c7a-3f2b-4e61-8a90-1c4b7e5f9d23", // Carne
    "res-2a8f5c1e-9b7d-4a63-8e52-9c1a6f8e4b37", // Cogumelos
    "res-a1f7c9e5-3b8d-4e09-9a20-2c8e6f9b5de8", // Frutas
    "res-f7c9a1e5-8d3b-4e08-9a19-6c2e8f5b9df9"  // Outros consumíveis
  ];

  return modernConsumableIds.includes(item.id);
}

export function getConsumableEffects(item: any): ConsumableEffects {
  if (!item) {
    return { hungerRestore: 0, thirstRestore: 0 };
  }

  // PRIORITY 1: Modern system - get from attributes
  if (item.attributes) {
    const hungerRestore = item.attributes.hunger_restore || 0;
    const thirstRestore = item.attributes.thirst_restore || 0;

    // Return if we have actual values from attributes
    if (hungerRestore > 0 || thirstRestore > 0) {
      return {
        hungerRestore,
        thirstRestore
      };
    }
  }

  // PRIORITY 2: Modern ID-based effects (definitive values)
  const modernIdEffects: Record<string, ConsumableEffects> = {
    [RESOURCE_IDS.CARNE_ASSADA]: { hungerRestore: 15, thirstRestore: 3 },
    [RESOURCE_IDS.AGUA_FRESCA]: { hungerRestore: 0, thirstRestore: 10 },
    [RESOURCE_IDS.COGUMELOS]: { hungerRestore: 2, thirstRestore: 0 },
    [RESOURCE_IDS.FRUTAS_SILVESTRES]: { hungerRestore: 1, thirstRestore: 2 },
    "res-cogumelos-assados-001": { hungerRestore: 8, thirstRestore: 1 },
    [RESOURCE_IDS.PEIXE_GRELHADO]: { hungerRestore: 12, thirstRestore: 2 },
    [RESOURCE_IDS.ENSOPADO_CARNE]: { hungerRestore: 20, thirstRestore: 8 },
    [RESOURCE_IDS.SUCO_FRUTAS]: { hungerRestore: 3, thirstRestore: 12 },
    // Legacy IDs for backward compatibility
    "res-8bd33b18-a241-4859-ae9f-870fab5673d0": { hungerRestore: 0, thirstRestore: 10 }, // Água
    "res-5e9d8c7a-3f2b-4e61-8a90-1c4b7e5f9d23": { hungerRestore: 15, thirstRestore: 3 }, // Carne
    "res-2a8f5c1e-9b7d-4a63-8e52-9c1a6f8e4b37": { hungerRestore: 2, thirstRestore: 0 }, // Cogumelos
    "res-a1f7c9e5-3b8d-4e09-9a20-2c8e6f9b5de8": { hungerRestore: 1, thirstRestore: 2 }, // Frutas
    "res-f7c9a1e5-8d3b-4e08-9a19-6c2e8f5b9df9": { hungerRestore: 5, thirstRestore: 1 }  // Outros
  };

  return modernIdEffects[item.id] || { hungerRestore: 0, thirstRestore: 0 };
}

/**
 * Get display text for consumption effects
 */
export function getConsumableDescription(item: Resource | Equipment | any): string {
  if (!isConsumable(item)) {
    return "Item não consumível";
  }

  const effects = getConsumableEffects(item);
  const parts: string[] = [];

  if (effects.hungerRestore > 0) {
    parts.push(`+${effects.hungerRestore} Fome`);
  }

  if (effects.thirstRestore > 0) {
    parts.push(`+${effects.thirstRestore} Sede`);
  }

  if (parts.length === 0) {
    return "Efeitos variados";
  }

  return parts.join(" • ");
}

/**
 * Check if item can be consumed by checking for sufficient quantity
 */
export function canConsumeItem(item: any, requestedQuantity: number = 1): boolean {
  if (!isConsumable(item)) {
    return false;
  }

  // Check if we have enough quantity
  if ('quantity' in item && typeof item.quantity === 'number') {
    return item.quantity >= requestedQuantity;
  }

  return true;
}

/**
 * Validate consumption parameters with modern system support only
 */
export function validateConsumption(item: any, quantity: number = 1): {
  valid: boolean;
  error?: string;
  effects?: ConsumableEffects;
} {
  if (!item) {
    return { valid: false, error: "Item não encontrado" };
  }

  if (!isConsumable(item)) {
    return { valid: false, error: "Item não é consumível no sistema moderno" };
  }

  if (quantity <= 0) {
    return { valid: false, error: "Quantidade deve ser maior que zero" };
  }

  if (!canConsumeItem(item, quantity)) {
    return { valid: false, error: "Quantidade insuficiente" };
  }

  const effects = getConsumableEffects(item);

  // Validate that the item actually provides some benefit
  if (effects.hungerRestore === 0 && effects.thirstRestore === 0) {
    return { valid: false, error: "Item não fornece benefícios de consumo" };
  }

  return { valid: true, effects };
}

/**
 * Get modern item data by ID
 */
export function getModernConsumableData(itemId: string): ConsumableEffects | null {
  const modernConsumables: Record<string, ConsumableEffects> = {
    [RESOURCE_IDS.CARNE_ASSADA]: { 
      hungerRestore: 15, 
      thirstRestore: 3,
      effects: ['hunger_restore', 'minor_health_regen']
    },
    [RESOURCE_IDS.AGUA_FRESCA]: { 
      hungerRestore: 0, 
      thirstRestore: 10,
      effects: ['thirst_restore', 'cooling']
    },
    [RESOURCE_IDS.COGUMELOS]: { 
      hungerRestore: 2, 
      thirstRestore: 0,
      effects: ['hunger_restore']
    },
    [RESOURCE_IDS.FRUTAS_SILVESTRES]: { 
      hungerRestore: 1, 
      thirstRestore: 2,
      effects: ['hunger_restore', 'thirst_restore']
    },
    "res-cogumelos-assados-001": { 
      hungerRestore: 8, 
      thirstRestore: 1,
      effects: ['hunger_restore']
    },
    [RESOURCE_IDS.PEIXE_GRELHADO]: { 
      hungerRestore: 12, 
      thirstRestore: 2,
      effects: ['hunger_restore', 'thirst_restore']
    },
    [RESOURCE_IDS.ENSOPADO_CARNE]: { 
      hungerRestore: 20, 
      thirstRestore: 8,
      effects: ['hunger_restore', 'thirst_restore', 'minor_health_regen']
    },
    [RESOURCE_IDS.SUCO_FRUTAS]: { 
      hungerRestore: 3, 
      thirstRestore: 12,
      effects: ['thirst_restore', 'vitamin_boost']
    },
    // Legacy IDs for backward compatibility
    "res-8bd33b18-a241-4859-ae9f-870fab5673d0": { 
      hungerRestore: 0, 
      thirstRestore: 10,
      effects: ['thirst_restore']
    },
    "res-5e9d8c7a-3f2b-4e61-8a90-1c4b7e5f9d23": { 
      hungerRestore: 15, 
      thirstRestore: 3,
      effects: ['hunger_restore']
    },
    "res-2a8f5c1e-9b7d-4a63-8e52-9c1a6f8e4b37": { 
      hungerRestore: 2, 
      thirstRestore: 0,
      effects: ['hunger_restore']
    },
    "res-a1f7c9e5-3b8d-4e09-9a20-2c8e6f9b5de8": { 
      hungerRestore: 1, 
      thirstRestore: 2,
      effects: ['hunger_restore', 'thirst_restore']
    },
    "res-f7c9a1e5-8d3b-4e08-9a19-6c2e8f5b9df9": { 
      hungerRestore: 5, 
      thirstRestore: 1,
      effects: ['hunger_restore']
    }
  };

  return modernConsumables[itemId] || null;
}

/**
 * Check if item is using modern system
 */
export function isModernConsumable(item: any): boolean {
  if (!item) return false;

  return item.category === 'consumable' && 
         item.attributes && 
         (item.attributes.hunger_restore > 0 || item.attributes.thirst_restore > 0);
}

/**
 * Get all modern consumable IDs
 */
export function getAllModernConsumableIds(): string[] {
  return [
    RESOURCE_IDS.CARNE_ASSADA,
    RESOURCE_IDS.AGUA_FRESCA,
    RESOURCE_IDS.COGUMELOS,
    RESOURCE_IDS.FRUTAS_SILVESTRES,
    "res-cogumelos-assados-001",
    RESOURCE_IDS.PEIXE_GRELHADO,
    RESOURCE_IDS.ENSOPADO_CARNE,
    RESOURCE_IDS.SUCO_FRUTAS,
    // Legacy IDs
    "res-8bd33b18-a241-4859-ae9f-870fab5673d0",
    "res-5e9d8c7a-3f2b-4e61-8a90-1c4b7e5f9d23",
    "res-2a8f5c1e-9b7d-4a63-8e52-9c1a6f8e4b37",
    "res-a1f7c9e5-3b8d-4e09-9a20-2c8e6f9b5de8",
    "res-f7c9a1e5-8d3b-4e08-9a19-6c2e8f5b9df9"
  ];
}
const CONSUMABLE_ITEMS: Record<string, ConsumableEffects> = {
  // All consumables using standardized IDs from RESOURCE_IDS
  [RESOURCE_IDS.COGUMELOS]: {
    hunger: 2,
    thirst: 0,
    health: 0
  },
  [RESOURCE_IDS.FRUTAS_SILVESTRES]: {
    hunger: 1,
    thirst: 2,
    health: 0
  },
  [RESOURCE_IDS.AGUA_FRESCA]: {
    hunger: 0,
    thirst: 20,
    health: 0
  },
  [RESOURCE_IDS.COGUMELOS_ASSADOS]: {
    hunger: 8,
    thirst: 1,
    health: 0
  },
  [RESOURCE_IDS.CARNE_ASSADA]: {
    hunger: 25,
    thirst: 5,
    health: 2
  },
  [RESOURCE_IDS.PEIXE_GRELHADO]: {
    hunger: 12,
    thirst: 2,
    health: 1
  },
  [RESOURCE_IDS.ENSOPADO_CARNE]: {
    hunger: 20,
    thirst: 8,
    health: 3
  },
  [RESOURCE_IDS.SUCO_FRUTAS]: {
    hunger: 3,
    thirst: 12,
    health: 0
  }
};
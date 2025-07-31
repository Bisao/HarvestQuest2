
// Dynamic consumable system utilities - MODERNIZED
import type { Resource, Equipment } from "@shared/types";
import { RESOURCE_IDS } from "@shared/constants/game-ids";

export interface ConsumableEffects {
  hungerRestore: number;
  thirstRestore: number;
  effects?: string[];
}

/**
 * Check if an item is consumable using modern system
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

  // Tertiary: Check by effects array
  if (item.effects && Array.isArray(item.effects)) {
    const consumableEffects = ['hunger_restore', 'thirst_restore', 'minor_health_regen'];
    if (item.effects.some((effect: string) => consumableEffects.includes(effect))) {
      return true;
    }
  }

  // Modern consumable IDs from items-modern.ts
  const modernConsumableIds = [
    RESOURCE_IDS.CARNE_ASSADA,      // res-carne-assada-001
    RESOURCE_IDS.AGUA_FRESCA,       // res-agua-fresca-001
    RESOURCE_IDS.COGUMELOS,         // res-cogumelos-001
    RESOURCE_IDS.FRUTAS_SILVESTRES  // res-frutas-silvestres-001
  ];

  if (modernConsumableIds.includes(item.id)) {
    return true;
  }

  // Legacy support: Check by type for old items
  if (item.type === 'food') {
    return true;
  }

  // Legacy support: Check by name for existing items (only as last resort)
  const legacyConsumableNames = [
    'Carne Assada',
    'Água Fresca', 
    'Cogumelos',
    'Frutas Silvestres',
    'cooked_meat',
    'fresh_water',
    'mushrooms',
    'wild_berries'
  ];

  return legacyConsumableNames.includes(item.name || item.displayName);
}

export function getConsumableEffects(item: any): ConsumableEffects {
  if (!item) {
    return { hungerRestore: 0, thirstRestore: 0 };
  }

  // PRIORITY 1: Modern system - get from attributes
  if (item.attributes) {
    const hungerRestore = item.attributes.hunger_restore || 0;
    const thirstRestore = item.attributes.thirst_restore || 0;
    
    // Only return if we have actual values
    if (hungerRestore > 0 || thirstRestore > 0) {
      return {
        hungerRestore,
        thirstRestore
      };
    }
  }

  // PRIORITY 2: Modern ID-based effects (from items-modern.ts data)
  const modernIdEffects: Record<string, ConsumableEffects> = {
    [RESOURCE_IDS.CARNE_ASSADA]: { hungerRestore: 25, thirstRestore: 5 },
    [RESOURCE_IDS.AGUA_FRESCA]: { hungerRestore: 0, thirstRestore: 20 },
    [RESOURCE_IDS.COGUMELOS]: { hungerRestore: 2, thirstRestore: 0 },
    [RESOURCE_IDS.FRUTAS_SILVESTRES]: { hungerRestore: 1, thirstRestore: 2 }
  };

  if (modernIdEffects[item.id]) {
    return modernIdEffects[item.id];
  }

  // PRIORITY 3: Legacy support for old items (reduced values to encourage modernization)
  const legacyEffects: Record<string, ConsumableEffects> = {
    'Carne Assada': { hungerRestore: 15, thirstRestore: 3 },
    'cooked_meat': { hungerRestore: 15, thirstRestore: 3 },
    'Água Fresca': { hungerRestore: 0, thirstRestore: 10 },
    'fresh_water': { hungerRestore: 0, thirstRestore: 10 },
    'Cogumelos': { hungerRestore: 2, thirstRestore: 0 },
    'mushrooms': { hungerRestore: 2, thirstRestore: 0 },
    'Frutas Silvestres': { hungerRestore: 1, thirstRestore: 2 },
    'wild_berries': { hungerRestore: 1, thirstRestore: 2 }
  };

  return legacyEffects[item.name || item.displayName] || { hungerRestore: 0, thirstRestore: 0 };
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
 * Validate consumption parameters with modern system support
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
    return { valid: false, error: "Item não é consumível" };
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
      hungerRestore: 25, 
      thirstRestore: 5,
      effects: ['hunger_restore', 'minor_health_regen']
    },
    [RESOURCE_IDS.AGUA_FRESCA]: { 
      hungerRestore: 0, 
      thirstRestore: 20,
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

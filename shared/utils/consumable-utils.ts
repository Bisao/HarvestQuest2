// Dynamic consumable system utilities
import type { Resource, Equipment } from "@shared/types";

export interface ConsumableEffects {
  hungerRestore: number;
  thirstRestore: number;
  effects?: string[];
}

/**
 * Check if an item is consumable
 */
export function isConsumable(item: any): boolean {
  if (!item) return false;

  // Check by category and subcategory
  if (item.category === 'consumable') {
    return true;
  }

  // Check by type for legacy items
  if (item.type === 'food') {
    return true;
  }

  // Check by attributes (backup method)
  if (item.attributes && (
    item.attributes.hunger_restore > 0 || 
    item.attributes.thirst_restore > 0
  )) {
    return true;
  }

  // Check by effects array
  if (item.effects && Array.isArray(item.effects)) {
    const consumableEffects = ['hunger_restore', 'thirst_restore', 'minor_health_regen'];
    if (item.effects.some(effect => consumableEffects.includes(effect))) {
      return true;
    }
  }

  // Check by ID - usando os IDs corretos do sistema
  const consumableIds = [
    'res-carne-assada-001',
    'res-agua-fresca-001', 
    'res-cogumelos-assados-001',
    'res-peixe-grelhado-001',
    'res-ensopado-carne-001',
    'res-cogumelos-001',
    'res-frutas-silvestres-001',
    'res-suco-frutas-001'
  ];

  if (consumableIds.includes(item.id)) {
    return true;
  }

  // Fallback: check by name for existing items (legacy support)
  const consumableNames = [
    'Carne Assada',
    'Água Fresca', 
    'Cogumelos Assados',
    'Peixe Grelhado',
    'Ensopado de Carne',
    'Cogumelos',
    'Frutas Silvestres',
    'Suco de Frutas',
    'cooked_meat',
    'fresh_water',
    'cooked_mushrooms',
    'grilled_fish',
    'meat_stew'
  ];

  return consumableNames.includes(item.name || item.displayName);
}

export function getConsumableEffects(item: any): ConsumableEffects {
  if (!item) {
    return { hungerRestore: 0, thirstRestore: 0 };
  }

  // Try to get from attributes first (modern system)
  if (item.attributes) {
    return {
      hungerRestore: item.attributes.hunger_restore || 0,
      thirstRestore: item.attributes.thirst_restore || 0
    };
  }

  // Fallback to hardcoded values for existing items (legacy support)
  const hardcodedEffects: Record<string, ConsumableEffects> = {
    'Carne Assada': { hungerRestore: 25, thirstRestore: 5 },
    'cooked_meat': { hungerRestore: 25, thirstRestore: 5 },
    'Água Fresca': { hungerRestore: 0, thirstRestore: 20 },
    'fresh_water': { hungerRestore: 0, thirstRestore: 20 },
    'Cogumelos Assados': { hungerRestore: 15, thirstRestore: 0 },
    'cooked_mushrooms': { hungerRestore: 15, thirstRestore: 0 },
    'Peixe Grelhado': { hungerRestore: 20, thirstRestore: 3 },
    'grilled_fish': { hungerRestore: 20, thirstRestore: 3 },
    'Ensopado de Carne': { hungerRestore: 35, thirstRestore: 10 },
    'meat_stew': { hungerRestore: 35, thirstRestore: 10 },
    'Cogumelos': { hungerRestore: 10, thirstRestore: 0 },
    'Frutas Silvestres': { hungerRestore: 8, thirstRestore: 5 },
    'Suco de Frutas': { hungerRestore: 5, thirstRestore: 15 }
  };

  return hardcodedEffects[item.name || item.displayName] || { hungerRestore: 0, thirstRestore: 0 };
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
 * Validate consumption parameters
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
  return { valid: true, effects };
}
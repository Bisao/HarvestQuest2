// Dynamic consumable system utilities - MODERN ONLY
import type { Resource, Equipment } from "@shared/types";
import { RESOURCE_IDS } from "@shared/constants/game-ids";

export interface ConsumableEffects {
  hungerRestore: number;
  thirstRestore: number;
  effects?: string[];
}

/**
 * Check if an item is consumable (can be eaten/drunk)
 */
export function isConsumable(item: any): boolean {
  if (!item) return false;

  // PRIORITY 1: Modern system - check specific consumable resource IDs
  // Only basic consumables, not processed/cooked items
  const basicConsumableIds = [
    RESOURCE_IDS.AGUA_FRESCA,    // Água Fresca
    RESOURCE_IDS.COGUMELOS,      // Cogumelos (cru)
    RESOURCE_IDS.FRUTAS_SILVESTRES // Frutas Silvestres
  ];

  if (basicConsumableIds.includes(item.id)) {
    return true;
  }

  return false;
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
      return { hungerRestore, thirstRestore };
    }
  }

  // PRIORITY 2: Modern ID-based effects (definitive values)
  const modernIdEffects: Record<string, ConsumableEffects> = {
    [RESOURCE_IDS.CARNE_ASSADA]: { hungerRestore: 25, thirstRestore: 5 },
    [RESOURCE_IDS.AGUA_FRESCA]: { hungerRestore: 0, thirstRestore: 20 },
    [RESOURCE_IDS.COGUMELOS]: { hungerRestore: 2, thirstRestore: 0 },
    [RESOURCE_IDS.FRUTAS_SILVESTRES]: { hungerRestore: 1, thirstRestore: 2 },
    [RESOURCE_IDS.COGUMELOS_ASSADOS]: { hungerRestore: 8, thirstRestore: 1 },
    [RESOURCE_IDS.PEIXE_GRELHADO]: { hungerRestore: 12, thirstRestore: 2 },
    [RESOURCE_IDS.ENSOPADO_CARNE]: { hungerRestore: 20, thirstRestore: 8 },
    [RESOURCE_IDS.SUCO_FRUTAS]: { hungerRestore: 3, thirstRestore: 12 }
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
 * Get all modern consumable IDs
 */
export function getAllModernConsumableIds(): string[] {
  return [
    RESOURCE_IDS.CARNE_ASSADA,
    RESOURCE_IDS.AGUA_FRESCA,
    RESOURCE_IDS.COGUMELOS,
    RESOURCE_IDS.FRUTAS_SILVESTRES,
    RESOURCE_IDS.COGUMELOS_ASSADOS,
    RESOURCE_IDS.PEIXE_GRELHADO,
    RESOURCE_IDS.ENSOPADO_CARNE,
    RESOURCE_IDS.SUCO_FRUTAS
  ];
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
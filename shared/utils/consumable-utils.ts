// Dynamic consumable system utilities
import type { Resource, Equipment } from "@shared/types";

export interface ConsumableEffects {
  hungerRestore: number;
  thirstRestore: number;
  effects?: string[];
}

/**
 * Dynamically determines if an item is consumable based on category and attributes
 */
export function isConsumable(item: Resource | Equipment | any): boolean {
  // Check if item has consumable category
  if ('category' in item && item.category === 'consumable') {
    return true;
  }

  // Check for modern item structure with attributes
  if ('attributes' in item && item.attributes) {
    return !!(item.attributes.hunger_restore || item.attributes.thirst_restore);
  }

  // Legacy support: check for specific consumable tags
  if ('tags' in item && Array.isArray(item.tags)) {
    return item.tags.includes('consumable') || item.tags.includes('food') || item.tags.includes('drink');
  }

  // Fallback: check for consumable patterns in name (for legacy items)
  if ('name' in item && typeof item.name === 'string') {
    const consumablePatterns = [
      'água', 'water', 'carne', 'meat', 'peixe', 'fish', 
      'cogumelo', 'mushroom', 'fruta', 'fruit', 'suco', 'juice',
      'assado', 'cooked', 'grelhado', 'grilled', 'ensopado', 'stew'
    ];
    const itemName = item.name.toLowerCase();
    return consumablePatterns.some(pattern => itemName.includes(pattern));
  }

  return false;
}

/**
 * Extract consumption effects from item attributes
 */
export function getConsumableEffects(item: Resource | Equipment | any): ConsumableEffects {
  const defaultEffects: ConsumableEffects = {
    hungerRestore: 0,
    thirstRestore: 0,
    effects: []
  };

  // Modern item structure with attributes
  if ('attributes' in item && item.attributes) {
    return {
      hungerRestore: item.attributes.hunger_restore || 0,
      thirstRestore: item.attributes.thirst_restore || 0,
      effects: item.effects || []
    };
  }

  // Legacy fallback: determine effects based on item name/type
  if ('name' in item && typeof item.name === 'string') {
    const itemName = item.name.toLowerCase();
    
    // Water and drinks
    if (itemName.includes('água') || itemName.includes('water') || itemName.includes('suco') || itemName.includes('juice')) {
      return {
        hungerRestore: 0,
        thirstRestore: 20,
        effects: ['thirst_restore']
      };
    }
    
    // Meat and fish
    if (itemName.includes('carne') || itemName.includes('meat') || itemName.includes('peixe') || itemName.includes('fish')) {
      return {
        hungerRestore: 25,
        thirstRestore: 5,
        effects: ['hunger_restore', 'minor_health_regen']
      };
    }
    
    // Mushrooms and vegetables
    if (itemName.includes('cogumelo') || itemName.includes('mushroom') || itemName.includes('fruta') || itemName.includes('fruit')) {
      return {
        hungerRestore: 15,
        thirstRestore: 10,
        effects: ['hunger_restore']
      };
    }
    
    // Stews and complex foods
    if (itemName.includes('ensopado') || itemName.includes('stew')) {
      return {
        hungerRestore: 35,
        thirstRestore: 15,
        effects: ['hunger_restore', 'satiation_bonus']
      };
    }
  }

  return defaultEffects;
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
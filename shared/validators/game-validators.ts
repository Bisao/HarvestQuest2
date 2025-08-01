// Game Validation System - Centralized validation for all game data
// Ensures data integrity across client and server

import { GAME_CONFIG } from '../config/game-config';

export class GameValidators {
  // ID validation patterns
  static readonly ID_PATTERNS = {
    PLAYER: /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/,
    RESOURCE: /^res-[a-z0-9-]+$/,
    EQUIPMENT: /^eq-[a-z0-9-]+$/,
    BIOME: /^biome-[a-z0-9-]+$/,
    QUEST: /^quest-[a-z0-9-]+$/,
    EXPEDITION: /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/,
    INVENTORY_ITEM: /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/
  };

  // Basic ID validators
  static playerId(id: string): boolean {
    return typeof id === 'string' && this.ID_PATTERNS.PLAYER.test(id);
  }

  static resourceId(id: string): boolean {
    return typeof id === 'string' && this.ID_PATTERNS.RESOURCE.test(id);
  }

  static equipmentId(id: string): boolean {
    return typeof id === 'string' && this.ID_PATTERNS.EQUIPMENT.test(id);
  }

  static biomeId(id: string): boolean {
    return typeof id === 'string' && this.ID_PATTERNS.BIOME.test(id);
  }

  static questId(id: string): boolean {
    return typeof id === 'string' && this.ID_PATTERNS.QUEST.test(id);
  }

  static expeditionId(id: string): boolean {
    return typeof id === 'string' && this.ID_PATTERNS.EXPEDITION.test(id);
  }

  // Numeric validators
  static quantity(qty: number): boolean {
    return typeof qty === 'number' && 
           Number.isInteger(qty) && 
           qty > 0 && 
           qty <= GAME_CONFIG.INVENTORY.STACK_SIZE_DEFAULT;
  }

  static level(level: number): boolean {
    return typeof level === 'number' && 
           Number.isInteger(level) && 
           level >= 1 && 
           level <= GAME_CONFIG.PROGRESSION.MAX_LEVEL;
  }

  static experience(exp: number): boolean {
    return typeof exp === 'number' && 
           Number.isInteger(exp) && 
           exp >= 0;
  }

  static hunger(hunger: number): boolean {
    return typeof hunger === 'number' && 
           hunger >= GAME_CONFIG.HUNGER_THIRST.MIN_HUNGER && 
           hunger <= GAME_CONFIG.HUNGER_THIRST.MAX_HUNGER;
  }

  static thirst(thirst: number): boolean {
    return typeof thirst === 'number' && 
           thirst >= GAME_CONFIG.HUNGER_THIRST.MIN_THIRST && 
           thirst <= GAME_CONFIG.HUNGER_THIRST.MAX_THIRST;
  }

  static coins(coins: number): boolean {
    return typeof coins === 'number' && 
           Number.isInteger(coins) && 
           coins >= 0 && 
           coins <= 999999999; // 1 billion max
  }

  static weight(weight: number): boolean {
    return typeof weight === 'number' && 
           weight >= 0 && 
           weight <= GAME_CONFIG.INVENTORY.DEFAULT_MAX_WEIGHT;
  }

  // String validators
  static username(username: string): boolean {
    return typeof username === 'string' && 
           username.length >= 2 && 
           username.length <= 20 &&
           /^[a-zA-Z0-9_-]+$/.test(username);
  }

  static itemName(name: string): boolean {
    return typeof name === 'string' && 
           name.length >= 1 && 
           name.length <= 50 &&
           name.trim().length > 0;
  }

  // Equipment slot validator
  static equipmentSlot(slot: string): boolean {
    const validSlots = ['helmet', 'chestplate', 'leggings', 'boots', 'weapon', 'tool'];
    return typeof slot === 'string' && validSlots.includes(slot);
  }

  // Resource type validator
  static resourceType(type: string): boolean {
    const validTypes = ['plant', 'animal', 'mineral', 'fish', 'consumable', 'material'];
    return typeof type === 'string' && validTypes.includes(type);
  }

  // Rarity validator
  static rarity(rarity: string): boolean {
    const validRarities = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
    return typeof rarity === 'string' && validRarities.includes(rarity);
  }

  // Complex object validators
  static player(player: any): boolean {
    if (!player || typeof player !== 'object') return false;
    
    return this.playerId(player.id) &&
           this.username(player.username) &&
           this.level(player.level) &&
           this.experience(player.experience) &&
           this.hunger(player.hunger) &&
           this.thirst(player.thirst) &&
           this.coins(player.coins) &&
           this.weight(player.inventoryWeight) &&
           this.weight(player.maxInventoryWeight) &&
           typeof player.autoStorage === 'boolean';
  }

  static inventoryItem(item: any): boolean {
    if (!item || typeof item !== 'object') return false;
    
    return typeof item.id === 'string' &&
           this.playerId(item.playerId) &&
           typeof item.itemId === 'string' &&
           this.quantity(item.quantity);
  }

  static expedition(expedition: any): boolean {
    if (!expedition || typeof expedition !== 'object') return false;
    
    return this.expeditionId(expedition.id) &&
           this.biomeId(expedition.biomeId) &&
           typeof expedition.progress === 'number' &&
           expedition.progress >= 0 &&
           expedition.progress <= 100 &&
           Array.isArray(expedition.selectedResources) &&
           typeof expedition.startTime === 'number' &&
           typeof expedition.estimatedDuration === 'number';
  }
}

// API request validators
export class ApiValidators {
  static consume(data: any): boolean {
    return data &&
           GameValidators.playerId(data.playerId) &&
           typeof data.itemId === 'string' &&
           GameValidators.quantity(data.quantity) &&
           ['inventory', 'storage'].includes(data.location);
  }

  static equip(data: any): boolean {
    return data &&
           GameValidators.playerId(data.playerId) &&
           GameValidators.equipmentSlot(data.slot) &&
           (data.equipmentId === null || GameValidators.equipmentId(data.equipmentId));
  }

  static craft(data: any): boolean {
    return data &&
           GameValidators.playerId(data.playerId) &&
           typeof data.recipeId === 'string' &&
           GameValidators.quantity(data.quantity) &&
           ['inventory', 'storage'].includes(data.destination);
  }

  static startExpedition(data: any): boolean {
    return data &&
           GameValidators.playerId(data.playerId) &&
           GameValidators.biomeId(data.biomeId) &&
           Array.isArray(data.selectedResources) &&
           data.selectedResources.length > 0 &&
           data.selectedResources.every((id: any) => typeof id === 'string');
  }

  static completeQuest(data: any): boolean {
    return data &&
           GameValidators.playerId(data.playerId) &&
           GameValidators.questId(data.questId);
  }
}

// Validation result type
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

// Comprehensive validator with detailed error reporting
export class DetailedValidator {
  static validate(type: string, data: any): ValidationResult {
    const result: ValidationResult = { valid: true, errors: [] };

    try {
      switch (type) {
        case 'player':
          if (!GameValidators.player(data)) {
            result.valid = false;
            result.errors.push('Invalid player data structure');
          }
          break;

        case 'consume':
          if (!ApiValidators.consume(data)) {
            result.valid = false;
            result.errors.push('Invalid consume request data');
          }
          break;

        case 'equip':
          if (!ApiValidators.equip(data)) {
            result.valid = false;
            result.errors.push('Invalid equip request data');
          }
          break;

        case 'craft':
          if (!ApiValidators.craft(data)) {
            result.valid = false;
            result.errors.push('Invalid craft request data');
          }
          break;

        case 'expedition':
          if (!ApiValidators.startExpedition(data)) {
            result.valid = false;
            result.errors.push('Invalid expedition request data');
          }
          break;

        default:
          result.valid = false;
          result.errors.push(`Unknown validation type: ${type}`);
      }
    } catch (error) {
      result.valid = false;
      result.errors.push(`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return result;
  }
}

// Export commonly used validators
export const validatePlayerId = GameValidators.playerId;
export const validateQuantity = GameValidators.quantity;
export const validateLevel = GameValidators.level;
export const validateUsername = GameValidators.username;
export const validateEquipmentSlot = GameValidators.equipmentSlot;

/**
 * UUID ENFORCEMENT SYSTEM
 * 
 * Sistema que garante que TODAS as futuras adições usem apenas UUIDs.
 * Este sistema intercepta tentativas de criar IDs inválidos e força o uso de UUIDs.
 */

import { generateGameId, isValidGameIdFormat, generateResourceId, generateEquipmentId, generateRecipeId, generateBiomeId, generateQuestId } from './uuid-generator';

/**
 * MIDDLEWARE DE ENFORCEMENT - Intercepta e corrige IDs
 */
export class UUIDEnforcer {
  private static violations: string[] = [];
  
  /**
   * Força um ID a ser UUID ou gera um novo
   */
  static enforceUUID(id: string, type?: 'resource' | 'equipment' | 'recipe' | 'biome' | 'quest'): string {
    // Se já é UUID válido, retorna
    if (isValidGameIdFormat(id)) {
      return id;
    }
    
    // Log da violação
    this.logViolation(id);
    
    // Gera novo UUID baseado no tipo
    switch (type) {
      case 'resource': return generateResourceId();
      case 'equipment': return generateEquipmentId();
      case 'recipe': return generateRecipeId();
      case 'biome': return generateBiomeId();
      case 'quest': return generateQuestId();
      default:
        // Tenta deduzir do prefixo
        if (id.startsWith('res-')) return generateResourceId();
        if (id.startsWith('eq-')) return generateEquipmentId();
        if (id.startsWith('rec-')) return generateRecipeId();
        if (id.startsWith('biome-')) return generateBiomeId();
        if (id.startsWith('quest-')) return generateQuestId();
        
        // Fallback para resource
        console.warn(`UUID-ENFORCEMENT: Could not determine type for ${id}, defaulting to resource`);
        return generateResourceId();
    }
  }
  
  /**
   * Valida array de IDs e força UUIDs
   */
  static enforceArrayUUIDs(ids: string[], type?: string): string[] {
    return ids.map(id => this.enforceUUID(id, type as any));
  }
  
  /**
   * Valida objeto e força UUIDs em todas as propriedades de ID
   */
  static enforceObjectUUIDs(obj: any): any {
    const result = { ...obj };
    
    // Lista de propriedades que devem ser UUIDs
    const idProperties = ['id', 'itemId', 'resourceId', 'equipmentId', 'recipeId', 'biomeId', 'questId'];
    
    for (const prop of idProperties) {
      if (result[prop] && typeof result[prop] === 'string') {
        const originalId = result[prop];
        result[prop] = this.enforceUUID(originalId);
        
        if (originalId !== result[prop]) {
          console.log(`UUID-ENFORCEMENT: ${prop} ${originalId} -> ${result[prop]}`);
        }
      }
    }
    
    // Recursivamente aplica em arrays
    if (result.ingredients && Array.isArray(result.ingredients)) {
      result.ingredients = result.ingredients.map((ingredient: any) => this.enforceObjectUUIDs(ingredient));
    }
    
    if (result.outputs && Array.isArray(result.outputs)) {
      result.outputs = result.outputs.map((output: any) => this.enforceObjectUUIDs(output));
    }
    
    return result;
  }
  
  /**
   * Log de violação de UUID
   */
  private static logViolation(invalidId: string): void {
    this.violations.push(invalidId);
    console.warn(`🚨 UUID-ENFORCEMENT: Invalid ID detected and converted: ${invalidId}`);
  }
  
  /**
   * Relatório de violações
   */
  static getViolationReport(): { count: number; violations: string[] } {
    return {
      count: this.violations.length,
      violations: [...this.violations]
    };
  }
  
  /**
   * Limpa log de violações
   */
  static clearViolations(): void {
    this.violations = [];
  }
  
  /**
   * Middleware Express para enforcement automático
   */
  static expressMiddleware() {
    return (req: any, res: any, next: any) => {
      // Intercepta parâmetros
      if (req.params) {
        for (const [key, value] of Object.entries(req.params)) {
          if (typeof value === 'string' && (key.includes('Id') || key === 'id')) {
            req.params[key] = UUIDEnforcer.enforceUUID(value);
          }
        }
      }
      
      // Intercepta body
      if (req.body) {
        req.body = UUIDEnforcer.enforceObjectUUIDs(req.body);
      }
      
      next();
    };
  }
}

/**
 * PROXY PARA INTERCEPTAR CRIAÇÃO DE OBJETOS COM IDs
 */
export function createUUIDProxyHandler<T extends object>(target: T): T {
  return new Proxy(target, {
    set(obj: any, prop: string | symbol, value: any) {
      // Se a propriedade é um ID, força UUID
      if (typeof prop === 'string' && (prop.includes('Id') || prop === 'id') && typeof value === 'string') {
        value = UUIDEnforcer.enforceUUID(value);
      }
      
      obj[prop] = value;
      return true;
    }
  });
}

/**
 * DECORADOR PARA MÉTODOS QUE RETORNAM IDs
 */
export function enforceUUIDReturn(target: any, propertyName: string, descriptor: PropertyDescriptor) {
  const method = descriptor.value;
  
  descriptor.value = function (...args: any[]) {
    const result = method.apply(this, args);
    
    // Se retorna string que parece ser ID, força UUID
    if (typeof result === 'string' && (result.includes('-') || result.startsWith('res-') || result.startsWith('eq-'))) {
      return UUIDEnforcer.enforceUUID(result);
    }
    
    // Se retorna array, aplica em cada elemento
    if (Array.isArray(result)) {
      return result.map(item => 
        typeof item === 'string' ? UUIDEnforcer.enforceUUID(item) : UUIDEnforcer.enforceObjectUUIDs(item)
      );
    }
    
    // Se retorna objeto, aplica enforcement
    if (typeof result === 'object' && result !== null) {
      return UUIDEnforcer.enforceObjectUUIDs(result);
    }
    
    return result;
  };
  
  return descriptor;
}

/**
 * SISTEMA DE STARTUP VALIDATION
 */
export function validateStartupUUIDs(): boolean {
  console.log('🔍 UUID-ENFORCEMENT: Validating startup UUIDs...');
  
  try {
    // Importa e valida game-ids.ts
    const gameIds = require('../constants/game-ids');
    
    let totalCount = 0;
    let validCount = 0;
    
    for (const [category, ids] of Object.entries(gameIds)) {
      if (category.endsWith('_IDS') && typeof ids === 'object') {
        for (const [name, id] of Object.entries(ids as Record<string, string>)) {
          totalCount++;
          if (isValidGameIdFormat(id)) {
            validCount++;
          } else {
            console.error(`❌ Invalid UUID in ${category}.${name}: ${id}`);
          }
        }
      }
    }
    
    const isValid = validCount === totalCount;
    console.log(`✅ UUID-ENFORCEMENT: ${validCount}/${totalCount} IDs are valid UUIDs`);
    
    if (!isValid) {
      console.error('🚨 UUID-ENFORCEMENT: Some IDs are not valid UUIDs! System requires all IDs to be UUIDs.');
    }
    
    return isValid;
  } catch (error) {
    console.error('❌ UUID-ENFORCEMENT: Error during startup validation:', error);
    return false;
  }
}

/**
 * AUTO-CORRECTOR PARA MIGRAÇÃO DE IDs LEGADOS
 */
export class LegacyIdMigrator {
  private static migrationMap: Map<string, string> = new Map();
  
  /**
   * Registra migração de ID legado para UUID
   */
  static registerMigration(legacyId: string, newUUID: string): void {
    this.migrationMap.set(legacyId, newUUID);
    console.log(`📝 MIGRATION: ${legacyId} -> ${newUUID}`);
  }
  
  /**
   * Migra ID legado para UUID
   */
  static migrateId(legacyId: string): string {
    // Se já tem migração registrada, usa ela
    if (this.migrationMap.has(legacyId)) {
      return this.migrationMap.get(legacyId)!;
    }
    
    // Se já é UUID válido, retorna
    if (isValidGameIdFormat(legacyId)) {
      return legacyId;
    }
    
    // Gera novo UUID e registra migração
    const newUUID = UUIDEnforcer.enforceUUID(legacyId);
    this.registerMigration(legacyId, newUUID);
    
    return newUUID;
  }
  
  /**
   * Obtém mapa de migrações
   */
  static getMigrationMap(): Map<string, string> {
    return new Map(this.migrationMap);
  }
  
  /**
   * Salva mapa de migrações em arquivo
   */
  static exportMigrations(): string {
    const migrations = Object.fromEntries(this.migrationMap);
    return JSON.stringify(migrations, null, 2);
  }
}

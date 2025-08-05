/**
 * MIGRATION UTILITIES
 * 
 * Utilitários reutilizáveis para scripts de migração.
 * Centraliza funções comuns de migração e backup.
 */

import { randomUUID } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

export interface MigrationResult {
  success: boolean;
  message: string;
  errors?: string[];
  migratedCount?: number;
  backupPath?: string;
}

export interface MigrationMap {
  resources: Map<string, string>;
  equipment: Map<string, string>;
  recipes: Map<string, string>;
  biomes: Map<string, string>;
  quests: Map<string, string>;
  skills: Map<string, string>;
}

/**
 * Gera UUID com prefixo específico
 */
export function generateUUIDWithPrefix(prefix: string): string {
  return `${prefix}-${randomUUID()}`;
}

/**
 * Cria backup de um arquivo com timestamp
 */
export function createBackup(filePath: string): string {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Arquivo não encontrado: ${filePath}`);
  }

  const timestamp = Date.now();
  const backupPath = `${filePath}.backup-${timestamp}`;
  
  fs.copyFileSync(filePath, backupPath);
  console.log(`📁 BACKUP: Criado em ${backupPath}`);
  
  return backupPath;
}

/**
 * Migra IDs em um objeto recursivamente
 */
export function migrateIdsInObject(obj: any, migrationMap: Map<string, string>): any {
  if (typeof obj !== 'object' || obj === null) return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(item => migrateIdsInObject(item, migrationMap));
  }
  
  const result: any = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string' && migrationMap.has(value)) {
      result[key] = migrationMap.get(value);
      console.log(`🔄 MIGRATED: ${key} ${value} -> ${result[key]}`);
    } else if (typeof value === 'object') {
      result[key] = migrateIdsInObject(value, migrationMap);
    } else {
      result[key] = value;
    }
  }
  
  return result;
}

/**
 * Consolida todos os mapas de migração em um único mapa
 */
export function consolidateMigrationMaps(maps: MigrationMap): Map<string, string> {
  const consolidated = new Map<string, string>();
  
  for (const [category, map] of Object.entries(maps)) {
    for (const [oldId, newId] of map) {
      consolidated.set(oldId, newId);
    }
  }
  
  return consolidated;
}

/**
 * Verifica se uma migração já foi executada
 */
export function isMigrationAlreadyExecuted(dataPath: string): boolean {
  if (!fs.existsSync(dataPath)) {
    return false;
  }

  try {
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    
    // Verifica se existem IDs no formato UUID moderno
    const dataString = JSON.stringify(data);
    const hasModernIds = dataString.includes('-uuid-') || 
                        Boolean(dataString.match(/[a-z]+-[0-9a-f]{8}-[0-9a-f]{4}/));
    
    return hasModernIds;
  } catch (error) {
    console.warn('⚠️ Erro ao verificar migração:', error);
    return false;
  }
}

/**
 * Gera relatório de migração
 */
export function generateMigrationReport(maps: MigrationMap, dataPath: string): MigrationResult {
  const totalMigrated = Object.values(maps).reduce((sum, map) => sum + map.size, 0);
  
  const report = {
    timestamp: new Date().toISOString(),
    totalMigrated,
    byCategory: {
      resources: maps.resources.size,
      equipment: maps.equipment.size,
      recipes: maps.recipes.size,
      biomes: maps.biomes.size,
      quests: maps.quests.size,
      skills: maps.skills.size
    },
    migrationMaps: {
      resources: Object.fromEntries(maps.resources),
      equipment: Object.fromEntries(maps.equipment),
      recipes: Object.fromEntries(maps.recipes),
      biomes: Object.fromEntries(maps.biomes),
      quests: Object.fromEntries(maps.quests),
      skills: Object.fromEntries(maps.skills)
    }
  };
  
  const reportPath = path.join(path.dirname(dataPath), 'migration-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log('📊 RELATÓRIO: Salvo em migration-report.json');
  console.log(`📈 ESTATÍSTICAS:
  - Resources: ${report.byCategory.resources} IDs
  - Equipment: ${report.byCategory.equipment} IDs  
  - Recipes: ${report.byCategory.recipes} IDs
  - Biomes: ${report.byCategory.biomes} IDs
  - Quests: ${report.byCategory.quests} IDs
  - Skills: ${report.byCategory.skills} IDs
  - TOTAL: ${totalMigrated} IDs migrados`);

  return {
    success: true,
    message: `Migração concluída: ${totalMigrated} IDs migrados`,
    migratedCount: totalMigrated
  };
}

/**
 * Valida integridade dos dados após migração
 */
export function validateMigrationIntegrity(originalData: any, migratedData: any): boolean {
  try {
    // Verificações básicas de estrutura
    if (typeof originalData !== typeof migratedData) return false;
    
    // Para objetos e arrays, verificar se mantém estrutura similar
    if (typeof originalData === 'object' && originalData !== null) {
      if (Array.isArray(originalData) !== Array.isArray(migratedData)) return false;
      
      if (Array.isArray(originalData)) {
        return originalData.length === migratedData.length;
      } else {
        const originalKeys = Object.keys(originalData);
        const migratedKeys = Object.keys(migratedData);
        return originalKeys.length === migratedKeys.length;
      }
    }
    
    return true;
  } catch (error) {
    console.error('⚠️ Erro na validação de integridade:', error);
    return false;
  }
}
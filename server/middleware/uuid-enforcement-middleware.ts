
/**
 * SERVER-SIDE UUID ENFORCEMENT MIDDLEWARE
 * 
 * Middleware que intercepta todas as requisições e garante que apenas UUIDs sejam aceitos.
 * Qualquer ID que não seja UUID é automaticamente convertido ou rejeitado.
 */

import { Request, Response, NextFunction } from 'express';
import { UUIDEnforcer, validateStartupUUIDs } from '../../shared/utils/uuid-enforcement';
import { isValidGameIdFormat } from '../../shared/utils/uuid-generator';

export interface UUIDValidationConfig {
  enforceMode: 'strict' | 'convert' | 'warn';
  logViolations: boolean;
  rejectInvalid: boolean;
}

const defaultConfig: UUIDValidationConfig = {
  enforceMode: 'convert',
  logViolations: true,
  rejectInvalid: false
};

/**
 * Middleware principal de enforcement de UUIDs
 */
export function uuidEnforcementMiddleware(config: Partial<UUIDValidationConfig> = {}) {
  const finalConfig = { ...defaultConfig, ...config };
  
  return (req: Request, res: Response, next: NextFunction) => {
    const violations: string[] = [];
    
    try {
      // Valida parâmetros da URL
      if (req.params) {
        for (const [key, value] of Object.entries(req.params)) {
          if (typeof value === 'string' && isIdParameter(key)) {
            if (!isValidGameIdFormat(value)) {
              violations.push(`params.${key}: ${value}`);
              
              if (finalConfig.enforceMode === 'strict' && finalConfig.rejectInvalid) {
                return res.status(400).json({
                  error: 'Invalid UUID format',
                  field: `params.${key}`,
                  value: value,
                  message: 'All IDs must be valid UUIDs'
                });
              }
              
              if (finalConfig.enforceMode === 'convert') {
                req.params[key] = UUIDEnforcer.enforceUUID(value);
              }
            }
          }
        }
      }
      
      // Valida query parameters
      if (req.query) {
        for (const [key, value] of Object.entries(req.query)) {
          if (typeof value === 'string' && isIdParameter(key)) {
            if (!isValidGameIdFormat(value)) {
              violations.push(`query.${key}: ${value}`);
              
              if (finalConfig.enforceMode === 'strict' && finalConfig.rejectInvalid) {
                return res.status(400).json({
                  error: 'Invalid UUID format',
                  field: `query.${key}`,
                  value: value,
                  message: 'All IDs must be valid UUIDs'
                });
              }
              
              if (finalConfig.enforceMode === 'convert') {
                req.query[key] = UUIDEnforcer.enforceUUID(value);
              }
            }
          }
        }
      }
      
      // Valida corpo da requisição
      if (req.body && typeof req.body === 'object') {
        const originalBody = JSON.stringify(req.body);
        req.body = UUIDEnforcer.enforceObjectUUIDs(req.body);
        
        if (JSON.stringify(req.body) !== originalBody) {
          violations.push('body: converted invalid IDs');
        }
      }
      
      // Log das violações
      if (violations.length > 0 && finalConfig.logViolations) {
        console.warn(`🚨 UUID-ENFORCEMENT: ${violations.length} violations in ${req.method} ${req.path}:`);
        violations.forEach(violation => console.warn(`  - ${violation}`));
      }
      
      next();
    } catch (error) {
      console.error('❌ UUID-ENFORCEMENT: Error in middleware:', error);
      next();
    }
  };
}

/**
 * Middleware específico para rotas de criação que exige UUIDs
 */
export function requireUUIDMiddleware(req: Request, res: Response, next: NextFunction) {
  const invalidIds: string[] = [];
  
  // Verifica todos os IDs no body
  if (req.body) {
    checkObjectForInvalidIds(req.body, invalidIds, 'body');
  }
  
  // Verifica parâmetros
  if (req.params) {
    for (const [key, value] of Object.entries(req.params)) {
      if (typeof value === 'string' && isIdParameter(key) && !isValidGameIdFormat(value)) {
        invalidIds.push(`params.${key}: ${value}`);
      }
    }
  }
  
  if (invalidIds.length > 0) {
    return res.status(400).json({
      error: 'Invalid UUID format detected',
      invalidIds,
      message: 'All IDs must be valid UUIDs. Use the UUID generator to create proper IDs.',
      hint: 'Import { generateResourceId, generateEquipmentId, generateRecipeId } from uuid-generator'
    });
  }
  
  next();
}

/**
 * Middleware para validação no startup do servidor
 */
export function validateServerStartupUUIDs() {
  return (req: Request, res: Response, next: NextFunction) => {
    // Executa validação apenas uma vez no startup
    if (!validateServerStartupUUIDs.executed) {
      console.log('🔍 SERVER-UUID-VALIDATION: Validating all game IDs on startup...');
      
      const isValid = validateStartupUUIDs();
      
      if (!isValid) {
        console.error('🚨 SERVER-UUID-VALIDATION: Invalid UUIDs detected in game-ids.ts!');
        console.error('🔧 ACTION REQUIRED: All IDs must be converted to valid UUIDs before server can start');
        
        // Em modo de desenvolvimento, apenas avisa
        if (process.env.NODE_ENV === 'development') {
          console.warn('⚠️  SERVER-UUID-VALIDATION: Continuing in development mode with warnings');
        } else {
          // Em produção, bloqueia o servidor
          return res.status(500).json({
            error: 'Server startup validation failed',
            message: 'Invalid UUIDs detected in game data',
            action: 'All game IDs must be valid UUIDs'
          });
        }
      } else {
        console.log('✅ SERVER-UUID-VALIDATION: All game IDs are valid UUIDs');
      }
      
      validateServerStartupUUIDs.executed = true;
    }
    
    next();
  };
}

// Marca para executar apenas uma vez
(validateServerStartupUUIDs as any).executed = false;

/**
 * Middleware para logging de estatísticas de UUID
 */
export function uuidStatsMiddleware(req: Request, res: Response, next: NextFunction) {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const report = UUIDEnforcer.getViolationReport();
    
    if (report.count > 0) {
      console.log(`📊 UUID-STATS: ${req.method} ${req.path} - ${report.count} violations in ${duration}ms`);
    }
  });
  
  next();
}

/**
 * Utilitários auxiliares
 */
function isIdParameter(key: string): boolean {
  return key === 'id' || 
         key.endsWith('Id') || 
         key.endsWith('ID') ||
         ['resourceId', 'equipmentId', 'recipeId', 'biomeId', 'questId'].includes(key);
}

function checkObjectForInvalidIds(obj: any, invalidIds: string[], path: string = ''): void {
  if (typeof obj !== 'object' || obj === null) return;
  
  for (const [key, value] of Object.entries(obj)) {
    const currentPath = path ? `${path}.${key}` : key;
    
    if (typeof value === 'string' && isIdParameter(key)) {
      if (!isValidGameIdFormat(value)) {
        invalidIds.push(`${currentPath}: ${value}`);
      }
    } else if (typeof value === 'object') {
      checkObjectForInvalidIds(value, invalidIds, currentPath);
    }
  }
}

/**
 * Middleware de resposta que garante UUIDs nas respostas
 */
export function ensureResponseUUIDs(req: Request, res: Response, next: NextFunction) {
  const originalJson = res.json;
  
  res.json = function(body: any) {
    // Aplica enforcement em dados de resposta
    if (body && typeof body === 'object') {
      body = UUIDEnforcer.enforceObjectUUIDs(body);
    }
    
    return originalJson.call(this, body);
  };
  
  next();
}

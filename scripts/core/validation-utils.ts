/**
 * VALIDATION UTILITIES
 * 
 * Utilitários reutilizáveis para validação de dados do sistema.
 * Funções base para diferentes tipos de validação.
 */

export interface ValidationResult {
  success: boolean;
  message: string;
  errors?: string[];
  warnings?: string[];
  data?: any;
}

export interface IdPattern {
  name: string;
  pattern: RegExp;
  description: string;
}

/**
 * Padrões de validação para diferentes tipos de ID
 */
export const ID_PATTERNS: Record<string, IdPattern> = {
  resource: {
    name: 'Resource ID',
    pattern: /^res-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    description: 'Formato: res-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'
  },
  equipment: {
    name: 'Equipment ID',
    pattern: /^eq-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    description: 'Formato: eq-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'
  },
  recipe: {
    name: 'Recipe ID',
    pattern: /^rec-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    description: 'Formato: rec-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'
  },
  biome: {
    name: 'Biome ID',
    pattern: /^biome-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    description: 'Formato: biome-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'
  },
  quest: {
    name: 'Quest ID',
    pattern: /^quest-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    description: 'Formato: quest-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'
  },
  skill: {
    name: 'Skill ID',
    pattern: /^skill-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    description: 'Formato: skill-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'
  }
};

/**
 * Valida formato de um ID específico
 */
export function validateIdFormat(id: string, type: keyof typeof ID_PATTERNS): ValidationResult {
  const pattern = ID_PATTERNS[type];
  
  if (!pattern) {
    return {
      success: false,
      message: `Tipo de ID desconhecido: ${type}`,
      errors: [`Tipo ${type} não é suportado`]
    };
  }

  const isValid = pattern.pattern.test(id);
  
  return {
    success: isValid,
    message: isValid ? `ID válido para ${pattern.name}` : `ID inválido para ${pattern.name}`,
    errors: isValid ? undefined : [`ID '${id}' não corresponde ao padrão ${pattern.description}`]
  };
}

/**
 * Verifica duplicatas em uma lista de IDs
 */
export function findDuplicateIds(ids: string[]): ValidationResult {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  
  for (const id of ids) {
    if (seen.has(id)) {
      duplicates.add(id);
    } else {
      seen.add(id);
    }
  }
  
  return {
    success: duplicates.size === 0,
    message: duplicates.size === 0 ? 'Nenhuma duplicata encontrada' : `${duplicates.size} duplicata(s) encontrada(s)`,
    errors: duplicates.size > 0 ? Array.from(duplicates).map(id => `ID duplicado: ${id}`) : undefined,
    data: { duplicates: Array.from(duplicates) }
  };
}

/**
 * Executa múltiplas validações e consolida resultados
 */
export function runValidationSuite(tests: Array<() => ValidationResult>): ValidationResult {
  const results: ValidationResult[] = [];
  const allErrors: string[] = [];
  const allWarnings: string[] = [];
  
  for (const test of tests) {
    try {
      const result = test();
      results.push(result);
      
      if (result.errors) {
        allErrors.push(...result.errors);
      }
      
      if (result.warnings) {
        allWarnings.push(...result.warnings);
      }
    } catch (error) {
      allErrors.push(`Erro em teste de validação: ${error}`);
    }
  }
  
  const successCount = results.filter(r => r.success).length;
  const totalTests = results.length;
  
  return {
    success: allErrors.length === 0,
    message: `${successCount}/${totalTests} testes passaram`,
    errors: allErrors.length > 0 ? allErrors : undefined,
    warnings: allWarnings.length > 0 ? allWarnings : undefined,
    data: {
      totalTests,
      successCount,
      failureCount: totalTests - successCount,
      results
    }
  };
}

/**
 * Valida estrutura de dados esperada
 */
export function validateDataStructure(data: any, expectedStructure: any): ValidationResult {
  const errors: string[] = [];
  
  function validateRecursive(obj: any, expected: any, path = '') {
    if (expected === null || expected === undefined) return;
    
    if (typeof expected === 'object' && expected.constructor === Object) {
      if (typeof obj !== 'object' || obj === null) {
        errors.push(`${path || 'root'}: esperado objeto, recebido ${typeof obj}`);
        return;
      }
      
      for (const [key, value] of Object.entries(expected)) {
        const currentPath = path ? `${path}.${key}` : key;
        if (!(key in obj)) {
          errors.push(`${currentPath}: propriedade obrigatória ausente`);
        } else {
          validateRecursive(obj[key], value, currentPath);
        }
      }
    } else if (Array.isArray(expected)) {
      if (!Array.isArray(obj)) {
        errors.push(`${path || 'root'}: esperado array, recebido ${typeof obj}`);
        return;
      }
      
      if (expected.length > 0 && obj.length > 0) {
        validateRecursive(obj[0], expected[0], `${path}[0]`);
      }
    } else if (typeof expected === 'string') {
      if (typeof obj !== 'string') {
        errors.push(`${path || 'root'}: esperado string, recebido ${typeof obj}`);
      }
    } else if (typeof expected === 'number') {
      if (typeof obj !== 'number') {
        errors.push(`${path || 'root'}: esperado number, recebido ${typeof obj}`);
      }
    }
  }
  
  validateRecursive(data, expectedStructure);
  
  return {
    success: errors.length === 0,
    message: errors.length === 0 ? 'Estrutura válida' : `${errors.length} erro(s) de estrutura`,
    errors: errors.length > 0 ? errors : undefined
  };
}

/**
 * Gera relatório de validação formatado
 */
export function generateValidationReport(results: ValidationResult[], title: string): string {
  const timestamp = new Date().toISOString();
  let report = `
=== ${title} ===
Executado em: ${timestamp}

`;

  let totalSuccess = 0;
  let totalErrors = 0;
  
  results.forEach((result, index) => {
    report += `${index + 1}. ${result.message}\n`;
    
    if (result.success) {
      totalSuccess++;
      report += '   ✅ PASSOU\n';
    } else {
      report += '   ❌ FALHOU\n';
      if (result.errors) {
        result.errors.forEach(error => {
          report += `      - ${error}\n`;
          totalErrors++;
        });
      }
    }
    
    if (result.warnings && result.warnings.length > 0) {
      result.warnings.forEach(warning => {
        report += `      ⚠️ ${warning}\n`;
      });
    }
    
    report += '\n';
  });
  
  report += `RESUMO: ${totalSuccess}/${results.length} testes passaram`;
  if (totalErrors > 0) {
    report += `, ${totalErrors} erro(s) encontrado(s)`;
  }
  
  return report;
}
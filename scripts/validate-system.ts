#!/usr/bin/env tsx
/**
 * CONSOLIDATED SYSTEM VALIDATION SCRIPT
 * 
 * Script unificado para validação completa do sistema de IDs e integridade dos dados.
 * Substitui os scripts validate-ids.ts e validate-skill-ids.ts com funcionalidade expandida.
 * 
 * USO: npx tsx scripts/validate-system.ts [--detailed] [--fix-errors]
 */

import * as fs from 'fs';
import * as path from 'path';
import { validateGameStartup, getAllMasterIds, getIdStatistics } from '../shared/utils/id-resolver';
import { validateAllGameData, isValidGameId, generateValidationReport } from '../shared/utils/id-validator-strict';
import { RESOURCE_IDS, EQUIPMENT_IDS, RECIPE_IDS, SKILL_IDS } from '../shared/constants/game-ids';
import { 
  validateIdFormat, 
  findDuplicateIds, 
  runValidationSuite, 
  validateDataStructure,
  generateValidationReport as generateFormattedReport,
  ID_PATTERNS,
  type ValidationResult 
} from './core/validation-utils';

// Configuração
const DATA_PATH = path.join(__dirname, '../data.json');
const args = process.argv.slice(2);
const DETAILED_MODE = args.includes('--detailed');
const FIX_ERRORS = args.includes('--fix-errors');

/**
 * Validação do sistema mestre de IDs
 */
function validateMasterSystem(): ValidationResult {
  console.log('1️⃣ VALIDANDO SISTEMA MESTRE DE IDs...\n');
  
  const startup = validateGameStartup();
  const stats = getIdStatistics();
  
  console.log(`📊 ESTATÍSTICAS DO SISTEMA:
  - Resources: ${stats.resources} IDs
  - Equipment: ${stats.equipment} IDs
  - Recipes: ${stats.recipes} IDs
  - Biomes: ${stats.biomes} IDs
  - Quests: ${stats.quests} IDs
  - Skills: ${stats.skills} IDs
  - TOTAL: ${stats.total} IDs`);
  
  return {
    success: startup.isValid,
    message: startup.message,
    errors: startup.errors,
    data: stats
  };
}

/**
 * Validação de formato de IDs por categoria
 */
function validateIdFormats(): ValidationResult {
  console.log('\n2️⃣ VALIDANDO FORMATOS DE IDs...\n');
  
  const results: ValidationResult[] = [];
  const categories = {
    'RESOURCE_IDS': { ids: Object.values(RESOURCE_IDS), type: 'resource' as const },
    'EQUIPMENT_IDS': { ids: Object.values(EQUIPMENT_IDS), type: 'equipment' as const },
    'RECIPE_IDS': { ids: Object.values(RECIPE_IDS), type: 'recipe' as const },
    'SKILL_IDS': { ids: SKILL_IDS ? Object.values(SKILL_IDS) : [], type: 'skill' as const }
  };
  
  for (const [categoryName, { ids, type }] of Object.entries(categories)) {
    console.log(`🔍 Validando ${categoryName}:`);
    
    let validCount = 0;
    const errors: string[] = [];
    
    for (const id of ids) {
      const validation = validateIdFormat(id, type);
      if (validation.success) {
        validCount++;
        if (DETAILED_MODE) console.log(`  ✅ ${id}`);
      } else {
        errors.push(`${id}: ${validation.errors?.[0] || 'Formato inválido'}`);
        console.log(`  ❌ ${id}: Formato inválido`);
      }
    }
    
    console.log(`  📊 ${validCount}/${ids.length} IDs válidos\n`);
    
    results.push({
      success: errors.length === 0,
      message: `${categoryName}: ${validCount}/${ids.length} válidos`,
      errors: errors.length > 0 ? errors : undefined
    });
  }
  
  return runValidationSuite(results.map(r => () => r));
}

/**
 * Verificação de duplicatas
 */
function checkDuplicates(): ValidationResult {
  console.log('3️⃣ VERIFICANDO DUPLICATAS...\n');
  
  const allIds = getAllMasterIds();
  const duplicateCheck = findDuplicateIds(allIds);
  
  if (duplicateCheck.success) {
    console.log('✅ Nenhuma duplicata encontrada');
  } else {
    console.log('❌ Duplicatas encontradas:');
    duplicateCheck.data?.duplicates.forEach((id: string) => {
      console.log(`  - ${id}`);
    });
  }
  
  return duplicateCheck;
}

/**
 * Validação dos dados do jogo
 */
function validateGameData(): ValidationResult {
  console.log('\n4️⃣ VALIDANDO DADOS DO JOGO...\n');
  
  if (!fs.existsSync(DATA_PATH)) {
    return {
      success: false,
      message: 'Arquivo data.json não encontrado',
      errors: ['data.json não existe']
    };
  }
  
  try {
    const gameData = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
    const validation = validateAllGameData(gameData);
    
    if (validation.isValid) {
      console.log('✅ Dados do jogo válidos');
    } else {
      console.log('❌ Erros encontrados nos dados:');
      validation.errors.forEach(error => {
        console.log(`  - ${error}`);
      });
    }
    
    // Gerar relatório detalhado se solicitado
    if (DETAILED_MODE) {
      const report = generateValidationReport(gameData);
      console.log('\n📋 RELATÓRIO DETALHADO:');
      console.log(JSON.stringify(report, null, 2));
    }
    
    return {
      success: validation.isValid,
      message: validation.isValid ? 'Dados válidos' : `${validation.errors.length} erro(s) encontrado(s)`,
      errors: validation.errors.length > 0 ? validation.errors : undefined
    };
    
  } catch (error) {
    return {
      success: false,
      message: 'Erro ao ler dados do jogo',
      errors: [`Erro de parsing: ${error}`]
    };
  }
}

/**
 * Testes de amostra do sistema
 */
function runSampleTests(): ValidationResult {
  console.log('\n5️⃣ EXECUTANDO TESTES DE AMOSTRA...\n');
  
  const sampleTests = [
    () => {
      const testId = Object.values(RESOURCE_IDS)[0];
      const isValid = isValidGameId(testId);
      return {
        success: isValid,
        message: `Teste de ID de recurso: ${testId}`
      };
    },
    () => {
      const testId = Object.values(EQUIPMENT_IDS)[0];
      const isValid = isValidGameId(testId);
      return {
        success: isValid,
        message: `Teste de ID de equipamento: ${testId}`
      };
    },
    () => {
      const invalidId = 'invalid-test-id-123';
      const isValid = isValidGameId(invalidId);
      return {
        success: !isValid, // Esperamos que seja inválido
        message: `Teste de ID inválido: ${invalidId}`
      };
    }
  ];
  
  return runValidationSuite(sampleTests);
}

/**
 * Gera relatório final
 */
function generateFinalReport(results: ValidationResult[]): void {
  console.log('\n📊 RELATÓRIO FINAL DE VALIDAÇÃO\n');
  console.log('='.repeat(50));
  
  const report = generateFormattedReport(results, 'VALIDAÇÃO COMPLETA DO SISTEMA');
  console.log(report);
  
  // Salvar relatório em arquivo se em modo detalhado
  if (DETAILED_MODE) {
    const reportPath = path.join(__dirname, '../validation-report.txt');
    fs.writeFileSync(reportPath, report);
    console.log(`\n💾 Relatório detalhado salvo em: ${reportPath}`);
  }
  
  // Contagem de sucessos
  const totalTests = results.length;
  const successCount = results.filter(r => r.success).length;
  const successRate = (successCount / totalTests) * 100;
  
  console.log(`\n🎯 RESULTADO GERAL: ${successCount}/${totalTests} testes passaram (${successRate.toFixed(1)}%)`);
  
  if (successRate === 100) {
    console.log('🎉 SISTEMA TOTALMENTE VÁLIDO!');
  } else if (successRate >= 80) {
    console.log('⚠️ Sistema funcional com alguns avisos');
  } else {
    console.log('🚨 Sistema requer correções antes do uso');
  }
}

/**
 * Script principal
 */
async function runValidation(): Promise<void> {
  console.log('🔍 INICIANDO VALIDAÇÃO COMPLETA DO SISTEMA...\n');
  console.log(`Modo detalhado: ${DETAILED_MODE ? 'ATIVO' : 'INATIVO'}`);
  console.log(`Correção automática: ${FIX_ERRORS ? 'ATIVA' : 'INATIVA'}\n`);
  
  const startTime = Date.now();
  const results: ValidationResult[] = [];
  
  try {
    // Executar todas as validações
    results.push(validateMasterSystem());
    results.push(validateIdFormats());
    results.push(checkDuplicates());
    results.push(validateGameData());
    results.push(runSampleTests());
    
    // Gerar relatório final
    generateFinalReport(results);
    
    const executionTime = Date.now() - startTime;
    console.log(`\n⏱️ Tempo de execução: ${executionTime}ms`);
    
    // Código de saída baseado nos resultados
    const hasErrors = results.some(r => !r.success);
    process.exit(hasErrors ? 1 : 0);
    
  } catch (error) {
    console.error('💥 Erro durante validação:', error);
    process.exit(1);
  }
}

// Executar validação se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1].endsWith('validate-system.ts')) {
  runValidation().catch(console.error);
}

export { runValidation };
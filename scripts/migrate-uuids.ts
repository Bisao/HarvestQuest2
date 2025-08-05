#!/usr/bin/env tsx
/**
 * CONSOLIDATED UUID MIGRATION SCRIPT
 * 
 * Script modernizado e consolidado para migrar todos os IDs para UUIDs.
 * Inclui verificações de segurança e relatórios detalhados.
 * 
 * USO: npx tsx scripts/migrate-uuids.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { 
  generateUUIDWithPrefix,
  createBackup,
  migrateIdsInObject,
  isMigrationAlreadyExecuted,
  generateMigrationReport,
  validateMigrationIntegrity,
  type MigrationMap
} from './core/migration-utils';

// Configuração de caminhos
const DATA_PATH = path.join(__dirname, '../data.json');
const GAME_IDS_PATH = path.join(__dirname, '../shared/constants/game-ids.ts');

// Mapas de migração globais
const migrationMaps: MigrationMap = {
  resources: new Map(),
  equipment: new Map(),
  recipes: new Map(),
  biomes: new Map(),
  quests: new Map(),
  skills: new Map()
};

/**
 * Verifica pré-requisitos antes da migração
 */
function checkPrerequisites(): boolean {
  console.log('🔍 VERIFICANDO PRÉ-REQUISITOS...\n');
  
  let hasErrors = false;

  // Verificar se arquivos existem
  if (!fs.existsSync(DATA_PATH)) {
    console.error('❌ data.json não encontrado');
    hasErrors = true;
  }

  if (!fs.existsSync(GAME_IDS_PATH)) {
    console.error('❌ game-ids.ts não encontrado');
    hasErrors = true;
  }

  // Verificar se migração já foi executada
  if (isMigrationAlreadyExecuted(DATA_PATH)) {
    console.log('⚠️  Migração parece já ter sido executada (IDs modernos detectados)');
    console.log('   Continue mesmo assim? Pressione Ctrl+C para cancelar ou Enter para prosseguir');
    
    // Em ambiente de produção, poderia aguardar input do usuário aqui
  }

  return !hasErrors;
}

/**
 * Carrega dados existentes e prepara mapas de migração
 */
function prepareMigrationMaps(): any {
  console.log('📋 PREPARANDO MAPAS DE MIGRAÇÃO...\n');
  
  const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
  
  // Coletarir IDs únicos que precisam ser migrados
  const oldIds = new Set<string>();
  
  function collectIds(obj: any) {
    if (typeof obj === 'string' && obj.length > 3) {
      // Detectar possíveis IDs antigos (não UUIDs)
      if (!obj.includes('-uuid-') && !obj.match(/^[a-z]+-[0-9a-f]{8}/)) {
        oldIds.add(obj);
      }
    } else if (typeof obj === 'object' && obj !== null) {
      Object.values(obj).forEach(collectIds);
    }
  }
  
  collectIds(data);
  
  // Classificar IDs por categoria e gerar UUIDs
  for (const oldId of oldIds) {
    let category: keyof MigrationMap;
    let prefix: string;
    
    if (oldId.startsWith('res_') || oldId.includes('madeira') || oldId.includes('pedra')) {
      category = 'resources';
      prefix = 'res';
    } else if (oldId.startsWith('eq_') || oldId.includes('machado') || oldId.includes('picareta')) {
      category = 'equipment';
      prefix = 'eq';
    } else if (oldId.startsWith('rec_') || oldId.includes('recipe')) {
      category = 'recipes';
      prefix = 'rec';
    } else if (oldId.includes('biome') || oldId.includes('floresta')) {
      category = 'biomes';
      prefix = 'biome';
    } else if (oldId.includes('quest') || oldId.includes('missao')) {
      category = 'quests';
      prefix = 'quest';
    } else if (oldId.includes('skill') || oldId.includes('habilidade')) {
      category = 'skills';
      prefix = 'skill';
    } else {
      // Default para resource se não conseguir classificar
      category = 'resources';
      prefix = 'res';
    }
    
    const newId = generateUUIDWithPrefix(prefix);
    migrationMaps[category].set(oldId, newId);
    
    console.log(`🔄 ${category}: ${oldId} -> ${newId}`);
  }
  
  console.log(`\n📊 RESUMO DE MIGRAÇÃO:
  - Resources: ${migrationMaps.resources.size}
  - Equipment: ${migrationMaps.equipment.size}
  - Recipes: ${migrationMaps.recipes.size}
  - Biomes: ${migrationMaps.biomes.size}
  - Quests: ${migrationMaps.quests.size}
  - Skills: ${migrationMaps.skills.size}
  - TOTAL: ${Array.from(Object.values(migrationMaps)).reduce((sum, map) => sum + map.size, 0)} IDs\n`);
  
  return data;
}

/**
 * Executa a migração dos dados
 */
function executeMigration(originalData: any): any {
  console.log('🚀 EXECUTANDO MIGRAÇÃO...\n');
  
  // Criar backup
  const backupPath = createBackup(DATA_PATH);
  
  // Consolidar todos os mapas de migração
  const allMigrations = new Map<string, string>();
  Object.values(migrationMaps).forEach(map => {
    map.forEach((newId, oldId) => {
      allMigrations.set(oldId, newId);
    });
  });
  
  // Migrar dados
  const migratedData = migrateIdsInObject(originalData, allMigrations);
  
  // Validar integridade
  if (!validateMigrationIntegrity(originalData, migratedData)) {
    throw new Error('Falha na validação de integridade dos dados migrados');
  }
  
  // Salvar dados migrados
  fs.writeFileSync(DATA_PATH, JSON.stringify(migratedData, null, 2));
  console.log(`✅ Dados migrados salvos em ${DATA_PATH}`);
  console.log(`📁 Backup criado em ${backupPath}`);
  
  return migratedData;
}

/**
 * Atualiza arquivo game-ids.ts com comentário de migração
 */
function updateGameIdsFile(): void {
  console.log('📝 ATUALIZANDO GAME-IDS.TS...\n');
  
  if (!fs.existsSync(GAME_IDS_PATH)) {
    console.warn('⚠️ game-ids.ts não encontrado, pulando atualização');
    return;
  }
  
  const originalContent = fs.readFileSync(GAME_IDS_PATH, 'utf8');
  
  // Adicionar comentário de migração no topo
  const migrationComment = `// ✅ MIGRAÇÃO UUID EXECUTADA EM: ${new Date().toISOString()}
// 📊 TOTAL DE IDs MIGRADOS: ${Array.from(Object.values(migrationMaps)).reduce((sum, map) => sum + map.size, 0)}
// 🔧 SCRIPT: migrate-uuids.ts
//
`;
  
  const updatedContent = migrationComment + originalContent;
  
  // Criar backup do arquivo original
  createBackup(GAME_IDS_PATH);
  
  fs.writeFileSync(GAME_IDS_PATH, updatedContent);
  console.log('✅ game-ids.ts atualizado com informações de migração');
}

/**
 * Script principal
 */
async function runMigration(): Promise<void> {
  console.log('🚀 INICIANDO MIGRAÇÃO CONSOLIDADA PARA UUIDs...\n');
  
  try {
    // Passo 1: Verificar pré-requisitos
    if (!checkPrerequisites()) {
      console.error('❌ Pré-requisitos não atendidos. Abortando migração.');
      process.exit(1);
    }
    
    // Passo 2: Preparar mapas de migração
    const originalData = prepareMigrationMaps();
    
    // Passo 3: Executar migração
    const migratedData = executeMigration(originalData);
    
    // Passo 4: Atualizar game-ids.ts
    updateGameIdsFile();
    
    // Passo 5: Gerar relatório
    const report = generateMigrationReport(migrationMaps, DATA_PATH);
    
    console.log('\n🎉 MIGRAÇÃO CONCLUÍDA COM SUCESSO!');
    console.log('📋 PRÓXIMOS PASSOS:');
    console.log('  1. Reiniciar o servidor para carregar novos dados');
    console.log('  2. Testar funcionalidades principais');
    console.log('  3. Executar scripts de validação');
    console.log('  4. Remover arquivos de backup se tudo estiver OK\n');
    
  } catch (error) {
    console.error('❌ ERRO NA MIGRAÇÃO:', error);
    console.error('🔧 Verifique os logs acima e tente corrigir os problemas');
    process.exit(1);
  }
}

// Executar migração se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1].endsWith('migrate-uuids.ts')) {
  runMigration().catch(console.error);
}

export { runMigration, migrationMaps };
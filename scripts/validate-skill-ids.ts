
#!/usr/bin/env tsx
/**
 * SKILL ID VALIDATION SCRIPT
 * 
 * Valida que todos os IDs de skills estão usando UUIDs corretos
 */

import { SKILL_IDS, isSkillId } from '../shared/constants/game-ids';
import { SKILL_DEFINITIONS } from '../shared/data/skill-definitions';

console.log('🔍 VALIDANDO IDs DE SKILLS...\n');

let totalErrors = 0;

// Validar formato UUID dos SKILL_IDS
console.log('1️⃣ Validando formato UUID dos SKILL_IDS:');
for (const [name, id] of Object.entries(SKILL_IDS)) {
  const isValidFormat = /^skill-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  if (!isValidFormat) {
    console.error(`❌ ${name}: ${id} - Formato UUID inválido`);
    totalErrors++;
  } else {
    console.log(`✅ ${name}: ${id}`);
  }
}

// Validar se SKILL_DEFINITIONS usa IDs corretos
console.log('\n2️⃣ Validando SKILL_DEFINITIONS:');
for (const [skillId, definition] of Object.entries(SKILL_DEFINITIONS)) {
  if (!isSkillId(skillId)) {
    console.error(`❌ Skill definition ${skillId} não é um ID de skill válido`);
    totalErrors++;
  } else if (!Object.values(SKILL_IDS).includes(skillId as any)) {
    console.error(`❌ Skill definition ${skillId} não existe em SKILL_IDS`);
    totalErrors++;
  } else {
    console.log(`✅ ${definition.name}: ${skillId}`);
  }
}

// Verificar duplicatas
console.log('\n3️⃣ Verificando duplicatas:');
const allIds = Object.values(SKILL_IDS);
const duplicates = allIds.filter((id, index) => allIds.indexOf(id) !== index);
if (duplicates.length > 0) {
  console.error(`❌ IDs duplicados encontrados: ${duplicates.join(', ')}`);
  totalErrors += duplicates.length;
} else {
  console.log('✅ Nenhuma duplicata encontrada');
}

// Relatório final
console.log('\n📊 RELATÓRIO FINAL:');
console.log(`- Total de Skills: ${Object.keys(SKILL_IDS).length}`);
console.log(`- Skills definidas: ${Object.keys(SKILL_DEFINITIONS).length}`);
console.log(`- Erros encontrados: ${totalErrors}`);

if (totalErrors === 0) {
  console.log('\n🎉 VALIDAÇÃO COMPLETA! Todos os IDs de skills estão corretos.');
} else {
  console.log('\n🚨 VALIDAÇÃO FALHOU! Corrija os erros acima.');
  process.exit(1);
}

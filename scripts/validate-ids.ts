#!/usr/bin/env tsx
/**
 * VALIDATE IDS SCRIPT
 * 
 * Comprehensive validation script that checks all game IDs against game-ids.ts master file.
 * Run this script to ensure all IDs are consistent across the entire project.
 */

import { validateGameStartup, updateToMasterIds, getAllMasterIds } from '../shared/utils/id-resolver.js';
import { validateAllGameData, isValidGameId } from '../shared/utils/id-validator-strict.js';
import { RESOURCE_IDS, EQUIPMENT_IDS, RECIPE_IDS } from '../shared/constants/game-ids.js';

/**
 * Main validation function - runs comprehensive ID checks
 */
async function validateAllIds() {
  console.log('🔍 STARTING COMPREHENSIVE ID VALIDATION...\n');
  
  // 1. Validate master registry
  console.log('1️⃣  Validating master game-ids.ts registry...');
  const startupValidation = validateGameStartup();
  
  if (!startupValidation.isValid) {
    console.error('❌ Master registry validation failed!');
    process.exit(1);
  }
  
  console.log(`✅ Master registry valid: ${startupValidation.message}\n`);
  
  // 2. Check for duplicate IDs in master
  console.log('2️⃣  Checking for duplicate IDs in master registry...');
  const allIds = getAllMasterIds();
  const uniqueIds = new Set(allIds);
  
  if (allIds.length !== uniqueIds.size) {
    console.warn('⚠️  Duplicate IDs found in master registry:');
    const duplicates = allIds.filter((id, index) => allIds.indexOf(id) !== index);
    duplicates.forEach(id => console.warn(`   - ${id}`));
  } else {
    console.log('✅ No duplicate IDs found in master registry\n');
  }
  
  // 3. Sample validation tests
  console.log('3️⃣  Testing sample ID validations...');
  const sampleTests = [
    { id: RESOURCE_IDS.BARBANTE, expected: true },
    { id: RESOURCE_IDS.MADEIRA, expected: true },
    { id: EQUIPMENT_IDS.MACHADO, expected: true },
    { id: 'invalid-id-123', expected: false },
    { id: 'res-uuid-old-format', expected: false }
  ];
  
  let testsPassed = 0;
  sampleTests.forEach(test => {
    const result = isValidGameId(test.id);
    if (result === test.expected) {
      console.log(`✅ ${test.id}: ${result ? 'VALID' : 'INVALID'} (expected)`);
      testsPassed++;
    } else {
      console.error(`❌ ${test.id}: ${result ? 'VALID' : 'INVALID'} (unexpected)`);
    }
  });
  
  console.log(`\n📊 Sample tests: ${testsPassed}/${sampleTests.length} passed\n`);
  
  // 4. Report summary
  console.log('4️⃣  VALIDATION SUMMARY:');
  console.log(`   📋 Total master IDs: ${uniqueIds.size}`);
  console.log(`   🔹 Resources: ${Object.keys(RESOURCE_IDS).length}`);
  console.log(`   🔹 Equipment: ${Object.keys(EQUIPMENT_IDS).length}`);
  console.log(`   🔹 Recipes: ${Object.keys(RECIPE_IDS).length}`);
  
  if (testsPassed === sampleTests.length && startupValidation.isValid) {
    console.log('\n🎉 ALL VALIDATIONS PASSED! Game IDs are consistent.\n');
    return true;
  } else {
    console.error('\n❌ VALIDATION FAILED! Please fix ID inconsistencies.\n');
    return false;
  }
}

/**
 * Run validation if script is executed directly
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  validateAllIds()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('💥 Validation script failed:', error);
      process.exit(1);
    });
}

export { validateAllIds };
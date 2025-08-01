
#!/usr/bin/env node

/**
 * ID Validation Script
 * Ensures all IDs in the project reference shared/constants/game-ids.ts
 * Run with: npx tsx shared/scripts/validate-ids.ts
 */

import { validateGameDataConsistency, validateRecipeIngredients } from '../utils/id-validation';
import { createModernRecipeData } from '../../server/data/recipes-modern';

console.log("🔍 Starting comprehensive ID validation...\n");

// Validate game data consistency
console.log("1. Validating game data consistency...");
const consistencyCheck = validateGameDataConsistency();
if (consistencyCheck.isValid) {
  console.log("   ✅ Game data consistency passed");
} else {
  console.log("   ❌ Game data consistency failed:");
  consistencyCheck.errors.forEach(error => console.log(`      - ${error}`));
}

// Validate recipes
console.log("\n2. Validating recipe ingredients...");
const recipes = createModernRecipeData();
const recipeValidation = validateRecipeIngredients(recipes);
if (recipeValidation.isValid) {
  console.log("   ✅ Recipe validation passed");
} else {
  console.log("   ❌ Recipe validation failed:");
  recipeValidation.errors.forEach(error => console.log(`      - ${error}`));
  console.log("\n   🔍 Invalid IDs found:");
  recipeValidation.invalidIds.forEach(id => console.log(`      - ${id}`));
}

// Summary
console.log("\n📊 Validation Summary:");
console.log(`   Game Data: ${consistencyCheck.isValid ? '✅' : '❌'}`);
console.log(`   Recipes: ${recipeValidation.isValid ? '✅' : '❌'}`);

if (consistencyCheck.isValid && recipeValidation.isValid) {
  console.log("\n🎉 All validations passed! shared/constants/game-ids.ts is the central authority.");
  process.exit(0);
} else {
  console.log("\n💥 Validation failed! Please fix the issues above.");
  process.exit(1);
}

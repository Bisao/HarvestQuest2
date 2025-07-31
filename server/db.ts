
import { drizzle } from "drizzle-orm/neon-serverless";
import { neon } from "@neondatabase/serverless";
import * as schema from "@shared/schema";

// Get database URL from environment
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

// Create neon connection
export const connection = neon(DATABASE_URL);

// Create drizzle database instance
export const db = drizzle(connection, { schema });

// Initialize database and populate with game data
export async function initializeDatabase() {
  console.log("🔄 Initializing database with game data...");
  
  try {
    // Import game data
    const { ALL_RESOURCES } = await import("./data/resources");
    const { ALL_EQUIPMENT } = await import("./data/equipment");
    const { createBiomeData } = await import("./data/biomes");
    const { createRecipeData } = await import("./data/recipes");
    const { ALL_QUESTS } = await import("./data/quests");

    // Insert resources
    console.log("📦 Inserting resources...");
    for (const resource of ALL_RESOURCES) {
      await db.insert(schema.resources)
        .values({
          ...resource,
          value: resource.attributes?.baseValue || resource.sellPrice || 10
        })
        .onConflictDoNothing();
    }

    // Insert equipment
    console.log("⚔️ Inserting equipment...");
    for (const equip of ALL_EQUIPMENT) {
      await db.insert(schema.equipment)
        .values(equip)
        .onConflictDoNothing();
    }

    // Insert biomes
    console.log("🌍 Inserting biomes...");
    const biomesData = createBiomeData();
    for (const biome of biomesData) {
      await db.insert(schema.biomes)
        .values(biome)
        .onConflictDoNothing();
    }

    // Insert recipes
    console.log("📋 Inserting recipes...");
    const recipesData = createRecipeData();
    for (const recipe of recipesData) {
      await db.insert(schema.recipes)
        .values(recipe)
        .onConflictDoNothing();
    }

    // Insert quests
    console.log("🎯 Inserting quests...");
    for (const quest of ALL_QUESTS) {
      await db.insert(schema.quests)
        .values({
          ...quest,
          category: quest.category || null
        })
        .onConflictDoNothing();
    }

    // Create default player if it doesn't exist
    console.log("👤 Creating default player...");
    await db.insert(schema.players)
      .values({
        username: "Player1",
        level: 1,
        experience: 0,
        hunger: 100,
        thirst: 100,
        maxHunger: 100,
        maxThirst: 100,
        coins: 0,
        inventoryWeight: 0,
        maxInventoryWeight: 50000,
        autoStorage: false,
        craftedItemsDestination: 'storage',
        waterStorage: 0,
        maxWaterStorage: 500,
        waterTanks: [],
        equippedHelmet: null,
        equippedChestplate: null,
        equippedLeggings: null,
        equippedBoots: null,
        equippedWeapon: null,
        equippedTool: null,
      })
      .onConflictDoNothing();

    console.log("✅ Database initialization completed successfully!");
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
    throw error;
  }
}

export type Database = typeof db;


import { Router } from 'express';
import { BiomeManager, convertToLegacyBiome } from '../data/biomes';
import type { Player } from '@shared/types';
import { successResponse, errorResponse } from '../utils/response-helpers';

const router = Router();

// Get all available biomes
router.get('/biomes', async (req, res) => {
  try {
    const biomes = BiomeManager.getAllBiomes();
    const legacyBiomes = biomes.map(convertToLegacyBiome);
    successResponse(res, legacyBiomes);
  } catch (error) {
    console.error('Error fetching biomes:', error);
    errorResponse(res, 'Failed to fetch biomes', 500);
  }
});

// Get biomes available for a specific player level
router.get('/biomes/available/:playerLevel', async (req, res) => {
  try {
    const playerLevel = parseInt(req.params.playerLevel);
    if (isNaN(playerLevel)) {
      return errorResponse(res, 'Invalid player level', 400);
    }

    const biomes = BiomeManager.getAvailableBiomes(playerLevel);
    const legacyBiomes = biomes.map(convertToLegacyBiome);
    successResponse(res, legacyBiomes);
  } catch (error) {
    console.error('Error fetching available biomes:', error);
    errorResponse(res, 'Failed to fetch available biomes', 500);
  }
});

// Get specific biome details
router.get('/biomes/:biomeId', async (req, res) => {
  try {
    const { biomeId } = req.params;
    const biome = BiomeManager.getBiome(biomeId);
    
    if (!biome) {
      return errorResponse(res, 'Biome not found', 404);
    }

    const legacyBiome = convertToLegacyBiome(biome);
    successResponse(res, legacyBiome);
  } catch (error) {
    console.error('Error fetching biome:', error);
    errorResponse(res, 'Failed to fetch biome', 500);
  }
});

// Get resources available in a biome for a player
router.get('/biomes/:biomeId/resources/:playerId', async (req, res) => {
  try {
    const { biomeId, playerId } = req.params;
    
    // Get player data to check level and tools
    // This would need to be implemented with actual storage
    const playerLevel = 1; // Default for now
    const hasTools: string[] = []; // Default for now
    
    const resources = BiomeManager.getBiomeResources(biomeId, playerLevel, hasTools);
    successResponse(res, resources);
  } catch (error) {
    console.error('Error fetching biome resources:', error);
    errorResponse(res, 'Failed to fetch biome resources', 500);
  }
});

// Get categorized resources for a biome
router.get('/biomes/:biomeId/resources/categorized', async (req, res) => {
  try {
    const { biomeId } = req.params;
    const categorizedResources = BiomeManager.getResourcesByCategory(biomeId);
    successResponse(res, categorizedResources);
  } catch (error) {
    console.error('Error fetching categorized resources:', error);
    errorResponse(res, 'Failed to fetch categorized resources', 500);
  }
});

export default router;

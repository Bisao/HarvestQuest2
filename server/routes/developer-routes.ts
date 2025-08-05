import { Router } from 'express';
import { storage } from '../storage';
import { ANIMAL_REGISTRY } from '../data/animal-registry';
// Using console.log instead of logger for migration compatibility

const router = Router();

// Mock helper functions for the new endpoint
// In a real scenario, these would be imported from a utils file
const errorResponse = (res, statusCode, message) => {
  return res.status(statusCode).json({ error: message });
};

const successResponse = (res, data) => {
  return res.json(data);
};


// Toggle to force 100% creature encounters during expeditions
router.post('/force-creature-encounters', async (req, res) => {
  try {
    const { playerId, force } = req.body;

    if (!playerId || typeof force !== 'boolean') {
      return errorResponse(res, 400, 'PlayerId and force boolean are required');
    }

    // Store the setting in player's developer settings
    const player = await storage.getPlayer(playerId);
    if (!player) {
      return errorResponse(res, 404, 'Player not found');
    }

    // Update player with developer setting
    await storage.updatePlayer(playerId, {
      // Store in a JSON field or use a specific field for developer settings
      developerSettings: {
        ...((player ).developerSettings || {}),
        forceCreatureEncounters: force
      }
    });

    console.log(`🧪 DEV-MODE: ${force ? 'Enabled' : 'Disabled'} forced creature encounters for player ${playerId}`);

    return successResponse(res, { 
      forceCreatureEncounters: force,
      message: force ? 'Forced creature encounters enabled' : 'Normal encounter rates restored'
    });
  } catch (error) {
    console.error('❌ DEV-MODE: Error toggling creature encounters:', error.message);
    return errorResponse(res, 500, error.message);
  }
});

// Toggle to unlock all animals for testing (shows all as discovered)
router.post('/unlock-animals', async (req, res) => {
  try {
    const { playerId, unlock } = req.body;

    if (!playerId) {
      return res.status(400).json({ error: 'Player ID is required' });
    }

    const player = await storage.getPlayer(playerId);
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    if (unlock) {
      // Unlock all animals
      const allAnimalIds = ANIMAL_REGISTRY.map(animal => animal.id);
      player.discoveredAnimals = [...new Set([...(player.discoveredAnimals || []), ...allAnimalIds])];

      console.log(`🧪 DEV MODE: All animals unlocked for player ${playerId}`);

      res.json({ 
        success: true, 
        message: 'All animals unlocked',
        discoveredCount: player.discoveredAnimals.length,
        totalAnimals: ANIMAL_REGISTRY.length
      });
    } else {
      // Reset to normal mode - clear discovered animals
      player.discoveredAnimals = [];

      console.log(`🧪 DEV MODE: Animals reset to normal for player ${playerId}`);

      res.json({ 
        success: true, 
        message: 'Animals reset to normal mode',
        discoveredCount: 0,
        totalAnimals: ANIMAL_REGISTRY.length
      });
    }

    // Save player data
    await storage.updatePlayer(playerId, player);

  } catch (error) {
    console.error('Error in developer unlock animals:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/developer/status/:playerId
 * Get developer mode status for a player
 */
router.get('/status/:playerId', async (req, res) => {
  try {
    const { playerId } = req.params;

    const player = await storage.getPlayer(playerId);
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    const totalAnimals = ANIMAL_REGISTRY.length;
    const discoveredCount = player.discoveredAnimals?.length || 0;
    const hasAllAnimals = discoveredCount >= totalAnimals;

    res.json({
      playerId,
      devModeActive: hasAllAnimals,
      discoveredCount,
      totalAnimals,
      completionPercentage: Math.round((discoveredCount / totalAnimals) * 100)
    });

  } catch (error) {
    console.error('Error getting developer status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
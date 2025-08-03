
import { Router } from 'express';
import { storage } from '../storage';
import { ANIMAL_REGISTRY } from '../data/animal-registry';
// Using console.log instead of logger for migration compatibility

const router = Router();

/**
 * POST /api/developer/unlock-animals
 * Unlock all animals for testing purposes
 */
router.post('/unlock-animals', async (req, res) => {
  try {
    const { playerId, unlock } = req.body;

    if (!playerId) {
      return res.status(400).json({ error: 'Player ID is required' });
    }

    const player = storage.getPlayer(playerId);
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    if (unlock) {
      // Unlock all animals
      const allAnimalIds = ANIMAL_REGISTRY.map(animal => animal.id);
      player.discoveredAnimals = [...new Set([...(player.discoveredAnimals || []), ...allAnimalIds])];
      
      logger.info(`🧪 DEV MODE: All animals unlocked for player ${playerId}`);
      
      res.json({ 
        success: true, 
        message: 'All animals unlocked',
        discoveredCount: player.discoveredAnimals.length,
        totalAnimals: ANIMAL_REGISTRY.length
      });
    } else {
      // Reset to normal mode - clear discovered animals
      player.discoveredAnimals = [];
      
      logger.info(`🧪 DEV MODE: Animals reset to normal for player ${playerId}`);
      
      res.json({ 
        success: true, 
        message: 'Animals reset to normal mode',
        discoveredCount: 0,
        totalAnimals: ANIMAL_REGISTRY.length
      });
    }

    // Save player data
    storage.updatePlayer(playerId, player);

  } catch (error) {
    logger.error('Error in developer unlock animals:', error);
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

    const player = storage.getPlayer(playerId);
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
    logger.error('Error getting developer status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

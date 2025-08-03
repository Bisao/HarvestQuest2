
import { Router } from 'express';
import { AnimalDiscoveryService } from '../services/animal-discovery-service';
import { ANIMAL_REGISTRY } from '@shared/data/animal-registry';
// Using console.log instead of logger for migration compatibility

const router = Router();

/**
 * GET /api/animals - Lista todos os animais do registro
 */
router.get('/', (req, res) => {
  try {
    res.json(ANIMAL_REGISTRY);
  } catch (error) {
    console.error('Error fetching animals:', error);
    res.status(500).json({ error: 'Failed to fetch animals' });
  }
});

/**
 * GET /api/animals/discovered/:playerId - Obtém animais descobertos pelo jogador
 */
router.get('/discovered/:playerId', (req, res) => {
  try {
    const { playerId } = req.params;
    const discoveredAnimals = AnimalDiscoveryService.getDiscoveredAnimals(playerId);
    res.json(discoveredAnimals);
  } catch (error) {
    console.error('Error fetching discovered animals:', error);
    res.status(500).json({ error: 'Failed to fetch discovered animals' });
  }
});

/**
 * GET /api/animals/stats/:playerId - Obtém estatísticas de descoberta
 */
router.get('/stats/:playerId', (req, res) => {
  try {
    const { playerId } = req.params;
    const stats = AnimalDiscoveryService.getDiscoveryStats(playerId);
    res.json(stats);
  } catch (error) {
    logger.error('Error fetching discovery stats:', error);
    res.status(500).json({ error: 'Failed to fetch discovery stats' });
  }
});

/**
 * POST /api/animals/discover - Descobre um animal manualmente
 */
router.post('/discover', async (req, res) => {
  try {
    const { playerId, animalId } = req.body;
    
    if (!playerId || !animalId) {
      return res.status(400).json({ error: 'playerId and animalId are required' });
    }

    const wasNewDiscovery = await AnimalDiscoveryService.discoverAnimal(playerId, animalId);
    
    res.json({ 
      success: true, 
      newDiscovery: wasNewDiscovery,
      message: wasNewDiscovery ? 'Animal discovered!' : 'Animal already discovered'
    });
  } catch (error) {
    logger.error('Error discovering animal:', error);
    res.status(500).json({ error: 'Failed to discover animal' });
  }
});

/**
 * POST /api/animals/encounter - Registra um encontro com animal
 */
router.post('/encounter', async (req, res) => {
  try {
    const { playerId, animalId } = req.body;
    
    if (!playerId || !animalId) {
      return res.status(400).json({ error: 'playerId and animalId are required' });
    }

    await AnimalDiscoveryService.encounterAnimal(playerId, animalId);
    
    res.json({ success: true });
  } catch (error) {
    logger.error('Error encountering animal:', error);
    res.status(500).json({ error: 'Failed to register encounter' });
  }
});

/**
 * POST /api/animals/auto-discover - Auto-descobre animais baseado no bioma
 */
router.post('/auto-discover', async (req, res) => {
  try {
    const { playerId, biome } = req.body;
    
    if (!playerId || !biome) {
      return res.status(400).json({ error: 'playerId and biome are required' });
    }

    const discovered = await AnimalDiscoveryService.autoDiscoverFromBiome(playerId, biome);
    
    res.json({ 
      success: true, 
      discovered,
      count: discovered.length
    });
  } catch (error) {
    logger.error('Error auto-discovering animals:', error);
    res.status(500).json({ error: 'Failed to auto-discover animals' });
  }
});

/**
 * GET /api/animals/category/:category - Obtém animais por categoria
 */
router.get('/category/:category', (req, res) => {
  try {
    const { category } = req.params;
    const animals = ANIMAL_REGISTRY.filter(animal => animal.category === category);
    res.json(animals);
  } catch (error) {
    logger.error('Error fetching animals by category:', error);
    res.status(500).json({ error: 'Failed to fetch animals by category' });
  }
});

export default router;


import { Router } from 'express';
import { ANIMAL_REGISTRY, getAnimalsByCategory, getDiscoverableAnimals } from '../data/animal-registry';
import type { PlayerAnimalRegistry, AnimalObservation } from '@shared/types/animal-registry-types';

const router = Router();

// Get all animals available for player level
router.get('/animals/:playerId', async (req, res) => {
  try {
    const { playerId } = req.params;
    
    // Get player level from storage (simplified for now)
    const playerLevel = 10; // TODO: Get from actual player data
    
    const availableAnimals = getDiscoverableAnimals(playerLevel);
    
    res.json({
      success: true,
      data: availableAnimals
    });
  } catch (error) {
    console.error('Error fetching animals:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar animais'
    });
  }
});

// Get player's animal discovery progress
router.get('/registry/:playerId', async (req, res) => {
  try {
    const { playerId } = req.params;
    
    // TODO: Get from actual database
    const mockRegistry: PlayerAnimalRegistry = {
      playerId,
      discoveredAnimals: ["animal-rabbit-001", "animal-smallfish-001"],
      favoriteAnimals: ["animal-rabbit-001"],
      completionStats: {
        totalDiscovered: 2,
        totalAvailable: 6,
        categoryProgress: {
          "mammal_small": 1,
          "fish_freshwater": 1
        }
      }
    };
    
    res.json({
      success: true,
      data: mockRegistry
    });
  } catch (error) {
    console.error('Error fetching registry:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar registro'
    });
  }
});

// Record animal discovery
router.post('/discover/:playerId', async (req, res) => {
  try {
    const { playerId } = req.params;
    const { animalId, location, method } = req.body;
    
    // Validate animal exists
    const animal = ANIMAL_REGISTRY.find(a => a.id === animalId);
    if (!animal) {
      return res.status(404).json({
        success: false,
        message: 'Animal não encontrado'
      });
    }
    
    // TODO: Add to database
    console.log(`Player ${playerId} discovered ${animal.commonName} at ${location} via ${method}`);
    
    res.json({
      success: true,
      message: `${animal.commonName} adicionado ao seu registro!`
    });
  } catch (error) {
    console.error('Error recording discovery:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao registrar descoberta'
    });
  }
});

// Toggle favorite animal
router.post('/favorite/:playerId/:animalId', async (req, res) => {
  try {
    const { playerId, animalId } = req.params;
    
    // TODO: Toggle in database
    console.log(`Player ${playerId} toggled favorite for ${animalId}`);
    
    res.json({
      success: true,
      message: 'Favorito atualizado'
    });
  } catch (error) {
    console.error('Error toggling favorite:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar favorito'
    });
  }
});

// Get animals by category
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const animals = getAnimalsByCategory(category);
    
    res.json({
      success: true,
      data: animals
    });
  } catch (error) {
    console.error('Error fetching category animals:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar animais da categoria'
    });
  }
});

export default router;

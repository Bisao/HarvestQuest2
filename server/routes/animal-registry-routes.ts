
import { Router } from 'express';
import { ANIMAL_REGISTRY, getAnimalsByCategory, ANIMAL_CATEGORIES } from '../data/animal-registry';
import type { AnimalRegistryEntry } from '@shared/types/animal-registry-types';

const router = Router();

// Get all animals in registry
router.get('/registry', async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        animals: ANIMAL_REGISTRY,
        categories: ANIMAL_CATEGORIES,
        total: ANIMAL_REGISTRY.length
      }
    });
  } catch (error) {
    console.error('Error fetching animal registry:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar registro de animais'
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

// Get player's discovered animals
router.get('/player/:playerId/discovered', async (req, res) => {
  try {
    const { playerId } = req.params;
    
    // TODO: Get from actual database
    const mockDiscoveredAnimals = ["dog", "cat", "rabbit"];
    
    const discoveredAnimalsData = ANIMAL_REGISTRY.filter(animal => 
      mockDiscoveredAnimals.includes(animal.id)
    );
    
    res.json({
      success: true,
      data: {
        discoveredAnimals: mockDiscoveredAnimals,
        discoveredData: discoveredAnimalsData,
        stats: {
          total: ANIMAL_REGISTRY.length,
          discovered: mockDiscoveredAnimals.length,
          percentage: Math.round((mockDiscoveredAnimals.length / ANIMAL_REGISTRY.length) * 100)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching discovered animals:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar animais descobertos'
    });
  }
});

// Get player's discovery statistics
router.get('/player/:playerId/stats', async (req, res) => {
  try {
    const { playerId } = req.params;
    
    // TODO: Get from actual database
    const mockDiscoveredAnimals = ["dog", "cat", "rabbit"];
    
    const categoryStats: Record<string, { discovered: number; total: number }> = {};
    
    // Calculate stats by category
    for (const animal of ANIMAL_REGISTRY) {
      if (!categoryStats[animal.category]) {
        categoryStats[animal.category] = { discovered: 0, total: 0 };
      }
      categoryStats[animal.category].total++;
      
      if (mockDiscoveredAnimals.includes(animal.id)) {
        categoryStats[animal.category].discovered++;
      }
    }
    
    res.json({
      success: true,
      data: {
        totalAnimals: ANIMAL_REGISTRY.length,
        discoveredCount: mockDiscoveredAnimals.length,
        discoveryPercentage: Math.round((mockDiscoveredAnimals.length / ANIMAL_REGISTRY.length) * 100),
        categoryStats
      }
    });
  } catch (error) {
    console.error('Error fetching discovery stats:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar estatísticas'
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
    console.log(`Player ${playerId} discovered ${animal.name} at ${location} via ${method}`);
    
    res.json({
      success: true,
      message: `${animal.name} adicionado ao seu registro!`,
      data: animal
    });
  } catch (error) {
    console.error('Error recording discovery:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao registrar descoberta'
    });
  }
});

// Get animal details by ID
router.get('/animal/:animalId', async (req, res) => {
  try {
    const { animalId } = req.params;
    const animal = ANIMAL_REGISTRY.find(a => a.id === animalId);
    
    if (!animal) {
      return res.status(404).json({
        success: false,
        message: 'Animal não encontrado'
      });
    }
    
    res.json({
      success: true,
      data: animal
    });
  } catch (error) {
    console.error('Error fetching animal details:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar detalhes do animal'
    });
  }
});

// Search animals
router.get('/search', async (req, res) => {
  try {
    const { q, category, rarity } = req.query;
    
    let filteredAnimals = ANIMAL_REGISTRY;
    
    if (q && typeof q === 'string') {
      const searchTerm = q.toLowerCase();
      filteredAnimals = filteredAnimals.filter(animal => 
        animal.name.toLowerCase().includes(searchTerm) ||
        animal.description.toLowerCase().includes(searchTerm)
      );
    }
    
    if (category && category !== 'all') {
      filteredAnimals = filteredAnimals.filter(animal => animal.category === category);
    }
    
    if (rarity && rarity !== 'all') {
      filteredAnimals = filteredAnimals.filter(animal => animal.rarity === rarity);
    }
    
    res.json({
      success: true,
      data: filteredAnimals
    });
  } catch (error) {
    console.error('Error searching animals:', error);
    res.status(500).json({
      success: false,
      message: 'Erro na busca'
    });
  }
});

export default router;

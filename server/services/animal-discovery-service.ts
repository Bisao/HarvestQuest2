
import { storage } from '../storage';
import { ANIMAL_REGISTRY, type AnimalData } from '@shared/data/animal-registry';
import { logger } from '@shared/utils/logger';

export class AnimalDiscoveryService {
  /**
   * Registra a descoberta de um animal pelo jogador
   */
  static async discoverAnimal(playerId: string, animalId: string): Promise<boolean> {
    try {
      const player = storage.getPlayer(playerId);
      if (!player) {
        throw new Error('Player not found');
      }

      // Inicializa a lista se não existir
      if (!player.discoveredAnimals) {
        player.discoveredAnimals = [];
      }

      // Verifica se o animal já foi descoberto
      if (player.discoveredAnimals.includes(animalId)) {
        return false; // Já descoberto
      }

      // Verifica se o animal existe no registro
      const animal = ANIMAL_REGISTRY.find(a => a.id === animalId);
      if (!animal) {
        throw new Error('Animal not found in registry');
      }

      // Adiciona à lista de descobertos
      player.discoveredAnimals.push(animalId);

      // Atualiza as estatísticas do animal
      const animalData = ANIMAL_REGISTRY.find(a => a.id === animalId);
      if (animalData) {
        animalData.encounterCount += 1;
        animalData.isDiscovered = true;
        animalData.lastSeen = new Date().toISOString();
        if (!animalData.discoveredAt) {
          animalData.discoveredAt = new Date().toISOString();
        }
      }

      // Salva o jogador
      storage.updatePlayer(playerId, player);

      logger.info(`Player ${playerId} discovered animal: ${animalId}`);
      return true;
    } catch (error) {
      logger.error('Error discovering animal:', error);
      throw error;
    }
  }

  /**
   * Incrementa o contador de encontros com um animal
   */
  static async encounterAnimal(playerId: string, animalId: string): Promise<void> {
    try {
      const player = storage.getPlayer(playerId);
      if (!player) {
        throw new Error('Player not found');
      }

      // Se ainda não foi descoberto, descobre automaticamente
      if (!player.discoveredAnimals?.includes(animalId)) {
        await this.discoverAnimal(playerId, animalId);
        return;
      }

      // Atualiza as estatísticas do animal
      const animalData = ANIMAL_REGISTRY.find(a => a.id === animalId);
      if (animalData) {
        animalData.encounterCount += 1;
        animalData.lastSeen = new Date().toISOString();
      }

      logger.info(`Player ${playerId} encountered animal: ${animalId}`);
    } catch (error) {
      logger.error('Error encountering animal:', error);
      throw error;
    }
  }

  /**
   * Obtém todos os animais descobertos pelo jogador
   */
  static getDiscoveredAnimals(playerId: string): AnimalData[] {
    try {
      const player = storage.getPlayer(playerId);
      if (!player || !player.discoveredAnimals) {
        return [];
      }

      return ANIMAL_REGISTRY.filter(animal => 
        player.discoveredAnimals!.includes(animal.id)
      );
    } catch (error) {
      logger.error('Error getting discovered animals:', error);
      return [];
    }
  }

  /**
   * Obtém estatísticas de descoberta do jogador
   */
  static getDiscoveryStats(playerId: string): {
    totalAnimals: number;
    discoveredCount: number;
    discoveryPercentage: number;
    byCategory: Record<string, { total: number; discovered: number }>;
  } {
    try {
      const player = storage.getPlayer(playerId);
      const discoveredAnimals = player?.discoveredAnimals || [];
      
      const totalAnimals = ANIMAL_REGISTRY.length;
      const discoveredCount = discoveredAnimals.length;
      const discoveryPercentage = (discoveredCount / totalAnimals) * 100;

      // Estatísticas por categoria
      const byCategory: Record<string, { total: number; discovered: number }> = {};
      
      ANIMAL_REGISTRY.forEach(animal => {
        if (!byCategory[animal.category]) {
          byCategory[animal.category] = { total: 0, discovered: 0 };
        }
        byCategory[animal.category].total++;
        if (discoveredAnimals.includes(animal.id)) {
          byCategory[animal.category].discovered++;
        }
      });

      return {
        totalAnimals,
        discoveredCount,
        discoveryPercentage,
        byCategory
      };
    } catch (error) {
      logger.error('Error getting discovery stats:', error);
      return {
        totalAnimals: 0,
        discoveredCount: 0,
        discoveryPercentage: 0,
        byCategory: {}
      };
    }
  }

  /**
   * Descobre automaticamente animais baseado no bioma visitado
   */
  static async autoDiscoverFromBiome(playerId: string, biome: string): Promise<string[]> {
    try {
      // Animais que podem ser encontrados neste bioma
      const biomeAnimals = ANIMAL_REGISTRY.filter(animal => 
        animal.habitat.includes(biome)
      );

      const discovered: string[] = [];

      for (const animal of biomeAnimals) {
        // Chance de descoberta baseada na raridade
        const discoveryChance = this.getDiscoveryChance(animal.rarity);
        
        if (Math.random() < discoveryChance) {
          const wasNew = await this.discoverAnimal(playerId, animal.id);
          if (wasNew) {
            discovered.push(animal.id);
          }
        }
      }

      return discovered;
    } catch (error) {
      logger.error('Error auto-discovering from biome:', error);
      return [];
    }
  }

  private static getDiscoveryChance(rarity: string): number {
    switch (rarity) {
      case 'common': return 0.3;
      case 'uncommon': return 0.15;
      case 'rare': return 0.05;
      case 'epic': return 0.02;
      case 'legendary': return 0.005;
      default: return 0.1;
    }
  }
}
import { ANIMAL_REGISTRY, getAnimalByResourceId } from '../data/animal-registry';
import type { AnimalRegistryEntry } from '@shared/types/animal-registry-types';

export class AnimalDiscoveryService {
  
  /**
   * Trigger animal discovery when player catches/hunts an animal
   */
  static async triggerDiscovery(
    playerId: string, 
    resourceId: string, 
    location: string, 
    method: 'hunting' | 'fishing'
  ): Promise<{ discovered: boolean; animal?: AnimalRegistryEntry }> {
    
    const animal = getAnimalByResourceId(resourceId);
    if (!animal) {
      return { discovered: false };
    }
    
    // Check if already discovered
    const isAlreadyDiscovered = await this.isAnimalDiscovered(playerId, animal.id);
    if (isAlreadyDiscovered) {
      return { discovered: false, animal };
    }
    
    // Record discovery
    await this.recordDiscovery(playerId, animal.id, location, method);
    
    return { discovered: true, animal };
  }
  
  /**
   * Check if player has discovered an animal
   */
  static async isAnimalDiscovered(playerId: string, animalId: string): Promise<boolean> {
    // TODO: Check in database
    // For now, return mock data
    const mockDiscovered = ["animal-rabbit-001", "animal-smallfish-001"];
    return mockDiscovered.includes(animalId);
  }
  
  /**
   * Record animal discovery
   */
  static async recordDiscovery(
    playerId: string, 
    animalId: string, 
    location: string, 
    method: string
  ): Promise<void> {
    // TODO: Save to database
    console.log(`🐾 DISCOVERY: Player ${playerId} discovered animal ${animalId} at ${location} via ${method}`);
  }
  
  /**
   * Get player's discovery statistics
   */
  static async getDiscoveryStats(playerId: string, playerLevel: number) {
    const availableAnimals = ANIMAL_REGISTRY.filter(a => a.requiredLevel <= playerLevel);
    const discoveredAnimals = ["animal-rabbit-001", "animal-smallfish-001"]; // TODO: Get from database
    
    const categoryStats: Record<string, { discovered: number; total: number }> = {};
    
    // Calculate stats by category
    for (const animal of availableAnimals) {
      if (!categoryStats[animal.category]) {
        categoryStats[animal.category] = { discovered: 0, total: 0 };
      }
      categoryStats[animal.category].total++;
      
      if (discoveredAnimals.includes(animal.id)) {
        categoryStats[animal.category].discovered++;
      }
    }
    
    return {
      totalDiscovered: discoveredAnimals.length,
      totalAvailable: availableAnimals.length,
      completionPercentage: Math.round((discoveredAnimals.length / availableAnimals.length) * 100),
      categoryStats
    };
  }
  
  /**
   * Get random fun fact about an animal
   */
  static getRandomFunFact(animalId: string): string | null {
    const animal = ANIMAL_REGISTRY.find(a => a.id === animalId);
    if (!animal || animal.generalInfo.funFacts.length === 0) {
      return null;
    }
    
    const randomIndex = Math.floor(Math.random() * animal.generalInfo.funFacts.length);
    return animal.generalInfo.funFacts[randomIndex];
  }
}

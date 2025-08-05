
import type { IStorage } from '../storage';
import { ANIMAL_REGISTRY } from '../data/animal-registry';
import { CREATURE_IDS } from '../../shared/constants/creature-ids';
import { RESOURCE_IDS } from '../../shared/constants/game-ids';

export class CreatureResourceService {
  constructor(private storage: IStorage) {}

  /**
   * Get all resources that can be obtained from a specific creature
   */
  getCreatureResources(creatureId: string): string[] {
    const animal = ANIMAL_REGISTRY.find(a => a.id === creatureId);
    if (!animal || !animal.drops) return [];

    return animal.drops.map(drop => drop.itemId);
  }

  /**
   * Get all creatures that can provide a specific resource
   */
  getResourceCreatures(resourceId: string): string[] {
    return ANIMAL_REGISTRY
      .filter(animal => 
        animal.drops?.some(drop => drop.itemId === resourceId)
      )
      .map(animal => animal.id);
  }

  /**
   * Calculate resources obtained from hunting/fishing a creature
   */
  calculateCreatureDrops(creatureId: string): Record<string, number> {
    const animal = ANIMAL_REGISTRY.find(a => a.id === creatureId);
    if (!animal || !animal.drops) return {};

    const drops: Record<string, number> = {};

    animal.drops.forEach(drop => {
      if (Math.random() < (drop.dropRate / 100)) {
        const quantity = Math.floor(
          Math.random() * (drop.maxQuantity - drop.minQuantity + 1)
        ) + drop.minQuantity;
        drops[drop.itemId] = (drops[drop.itemId] || 0) + quantity;
      }
    });

    return drops;
  }

  /**
   * Check if a player can hunt/fish a specific creature
   */
  async canPlayerHuntCreature(playerId: string, creatureId: string): Promise<{
    canHunt: boolean;
    reason?: string;
  }> {
    const player = await this.storage.getPlayer(playerId);
    const animal = ANIMAL_REGISTRY.find(a => a.id === creatureId);

    if (!player) return { canHunt: false, reason: 'Jogador não encontrado' };
    if (!animal) return { canHunt: false, reason: 'Criatura não encontrada' };

    // Check level requirement
    if (player.level < animal.requiredLevel) {
      return { 
        canHunt: false, 
        reason: `Nível ${animal.requiredLevel} necessário` 
      };
    }

    // Check if player has required tools/weapons
    const requiredTool = this.getRequiredToolForCreature(animal);
    if (requiredTool) {
      const hasRequiredTool = await this.playerHasRequiredTool(player, requiredTool);
      if (!hasRequiredTool) {
        return {
          canHunt: false,
          reason: `${requiredTool} necessário para caçar ${animal.commonName}`
        };
      }
    }

    return { canHunt: true };
  }

  private getRequiredToolForCreature(animal: any): string | null {
    // Map creature categories to required tools
    switch (animal.category) {
      case 'fish_freshwater':
      case 'fish_saltwater':
        return 'fishing_rod';
      case 'mammal_large':
      case 'mammal_medium':
        return 'weapon';
      case 'mammal_small':
        return 'knife';
      default:
        return null;
    }
  }

  private async playerHasRequiredTool(player: any, requiredTool: string): Promise<boolean> {
    const allEquipment = await this.storage.getAllEquipment();

    switch (requiredTool) {
      case 'fishing_rod':
        return !!(player.equippedTool && allEquipment.find(eq => 
          eq.id === player.equippedTool && eq.toolType === 'fishing_rod'
        ));
      case 'weapon':
        return !!(player.equippedWeapon && allEquipment.find(eq => 
          eq.id === player.equippedWeapon && eq.category === 'weapons'
        ));
      case 'knife':
        const knifeAsTool = player.equippedTool && allEquipment.find(eq => 
          eq.id === player.equippedTool && eq.toolType === 'knife'
        );
        const knifeAsWeapon = player.equippedWeapon && allEquipment.find(eq => 
          eq.id === player.equippedWeapon && eq.toolType === 'knife'
        );
        return !!(knifeAsTool || knifeAsWeapon);
      default:
        return true;
    }
  }

  /**
   * Process creature hunting/fishing and give rewards to player
   */
  async processCreatureEncounter(
    playerId: string, 
    creatureId: string
  ): Promise<{
    success: boolean;
    rewards?: Record<string, number>;
    experience?: number;
    message?: string;
  }> {
    const canHunt = await this.canPlayerHuntCreature(playerId, creatureId);
    if (!canHunt.canHunt) {
      return { success: false, message: canHunt.reason };
    }

    const animal = ANIMAL_REGISTRY.find(a => a.id === creatureId);
    if (!animal) {
      return { success: false, message: 'Criatura não encontrada' };
    }

    // Calculate drops
    const drops = this.calculateCreatureDrops(creatureId);
    
    // Add rewards to player
    const { GameService } = await import('./game-service');
    const gameService = new GameService(this.storage);

    for (const [resourceId, quantity] of Object.entries(drops)) {
      await gameService.addResourceToPlayer(playerId, resourceId, quantity);
    }

    // Add experience
    const experience = animal.generalInfo?.experienceValue || 5;
    const player = await this.storage.getPlayer(playerId);
    if (player) {
      await this.storage.updatePlayer(playerId, {
        experience: player.experience + experience
      });
    }

    return {
      success: true,
      rewards: drops,
      experience,
      message: `${animal.commonName} capturado com sucesso!`
    };
  }
}

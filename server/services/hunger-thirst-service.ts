// Hunger and Thirst Degradation Service for Coletor Adventures
import type { IStorage } from "../storage";

export class HungerThirstService {
  private degradationTimer: NodeJS.Timeout | null = null;
  private isRunning = false;
  
  constructor(private storage: IStorage) {}

  /**
   * Start passive hunger/thirst degradation for all players
   * Decreases hunger and thirst gradually over time
   */
  startPassiveDegradation(): void {
    if (this.isRunning) {
      console.log('⚠️ Hunger/thirst degradation already running');
      return;
    }

    this.isRunning = true;
    console.log('🍖💧 Starting passive hunger/thirst degradation system');

    // Degrade every 2 minutes (120,000ms)
    this.degradationTimer = setInterval(async () => {
      await this.degradeAllPlayers();
    }, 120000); // 2 minutes
  }

  /**
   * Stop passive degradation
   */
  stopPassiveDegradation(): void {
    if (this.degradationTimer) {
      clearInterval(this.degradationTimer);
      this.degradationTimer = null;
    }
    this.isRunning = false;
    console.log('🛑 Stopped passive hunger/thirst degradation');
  }

  /**
   * Degrade hunger and thirst for all active players
   */
  private async degradeAllPlayers(): Promise<void> {
    try {
      const players = await this.storage.getAllPlayers();
      
      for (const player of players) {
        // Skip if player has very low hunger/thirst to avoid going negative
        if (player.hunger <= 2 && player.thirst <= 2) {
          continue;
        }

        // Base degradation rates (can be adjusted based on difficulty)
        const hungerDecrease = Math.min(3, player.hunger); // Lose 3 hunger every 2 minutes, but don't go below 0
        const thirstDecrease = Math.min(4, player.thirst); // Lose 4 thirst every 2 minutes, but don't go below 0

        const newHunger = Math.max(0, player.hunger - hungerDecrease);
        const newThirst = Math.max(0, player.thirst - thirstDecrease);

        // Only update if there's actually a change
        if (newHunger !== player.hunger || newThirst !== player.thirst) {
          await this.storage.updatePlayer(player.id, {
            hunger: newHunger,
            thirst: newThirst
          });

          // Log degradation for debugging (can be removed in production)
          if (process.env.NODE_ENV === 'development') {
            console.log(`🍖💧 Player ${player.username}: H:${player.hunger}→${newHunger}, T:${player.thirst}→${newThirst}`);
          }

          // Invalidate cache to ensure frontend gets updated data
          try {
            const { invalidatePlayerCache } = await import("../cache/memory-cache");
            invalidatePlayerCache(player.id);
          } catch (error) {
            console.warn('Cache invalidation failed during degradation:', error);
          }
        }
      }
    } catch (error) {
      console.error('Error during hunger/thirst degradation:', error);
    }
  }

  /**
   * Manual degradation for a specific player (used during expeditions)
   */
  async degradePlayer(playerId: string, hungerDecrease: number, thirstDecrease: number): Promise<void> {
    const player = await this.storage.getPlayer(playerId);
    if (!player) {
      throw new Error('Player not found');
    }

    const newHunger = Math.max(0, player.hunger - hungerDecrease);
    const newThirst = Math.max(0, player.thirst - thirstDecrease);

    await this.storage.updatePlayer(playerId, {
      hunger: newHunger,
      thirst: newThirst
    });

    // Invalidate cache
    try {
      const { invalidatePlayerCache } = await import("../cache/memory-cache");
      invalidatePlayerCache(playerId);
    } catch (error) {
      console.warn('Cache invalidation failed:', error);
    }
  }

  /**
   * Get current status of the degradation system
   */
  getStatus(): { isRunning: boolean; intervalMs: number } {
    return {
      isRunning: this.isRunning,
      intervalMs: 120000 // 2 minutes
    };
  }
}
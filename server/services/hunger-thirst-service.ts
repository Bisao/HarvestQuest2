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

    // Degrade every 40 seconds (40,000ms)
    this.degradationTimer = setInterval(async () => {
      await this.degradeAllPlayers();
    }, 40000); // 40 seconds
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

        // Dynamic degradation rates based on player status and activities
        const baseDegradation = this.calculateDynamicDegradation(player);
        const hungerDecrease = Math.min(baseDegradation.hunger, player.hunger); 
        const thirstDecrease = Math.min(baseDegradation.thirst, player.thirst);

        const newHunger = Math.max(0, player.hunger - hungerDecrease);
        const newThirst = Math.max(0, player.thirst - thirstDecrease);

        // Natural regeneration when player is resting (not on expedition)
        let naturalHungerRegen = 0;
        let naturalThirstRegen = 0;
        
        if (!player.onExpedition && player.hunger > 80 && player.thirst > 80) {
          // Slight natural regeneration when well-fed and hydrated
          if (Math.random() < 0.2) { // 20% chance
            naturalHungerRegen = Math.min(1, player.maxHunger - player.hunger);
            naturalThirstRegen = Math.min(1, player.maxThirst - player.thirst);
          }
        }

        const finalHunger = Math.min(player.maxHunger, newHunger + naturalHungerRegen);
        const finalThirst = Math.min(player.maxThirst, newThirst + naturalThirstRegen);

        // Only update if there's actually a change
        if (finalHunger !== player.hunger || finalThirst !== player.thirst) {
          // Calculate penalties for low hunger/thirst
          const penalties = this.calculateStatusPenalties(newHunger, newThirst);
          
          const updateData: any = {
            hunger: newHunger,
            thirst: newThirst
          };

          // Apply penalties if any
          if (penalties.healthPenalty > 0) {
            const newHealth = Math.max(1, player.health - penalties.healthPenalty);
            updateData.health = newHealth;
            console.log(`🩺 Player ${player.id} lost ${penalties.healthPenalty} health due to low hunger/thirst`);
          }

          await this.storage.updatePlayer(player.id, updateData);

          // Log degradation with throttling to reduce spam
          if (process.env.NODE_ENV === 'development' && Math.random() < 0.1) {
            console.log(`🍖💧 Player ${player.username}: H:${player.hunger}→${newHunger}, T:${player.thirst}→${newThirst}`);
          }

          // Check for critical status and broadcast warnings
          const CRITICAL_THRESHOLD = 20;
          const EMERGENCY_THRESHOLD = 5;

          if (newHunger <= EMERGENCY_THRESHOLD || newThirst <= EMERGENCY_THRESHOLD) {
            // Broadcast emergency warning
            try {
              const { broadcastToPlayer } = await import("../websocket-service");
              const message = newHunger <= EMERGENCY_THRESHOLD 
                ? "⚠️ EMERGÊNCIA: Sua fome está criticamente baixa! Coma algo imediatamente!"
                : "⚠️ EMERGÊNCIA: Sua sede está criticamente baixa! Beba água imediatamente!";
              
              broadcastToPlayer(player.id, {
                type: 'notification',
                level: 'emergency',
                message,
                timestamp: Date.now()
              });
            } catch (error) {
              console.warn('Failed to send emergency notification:', error);
            }
          } else if (newHunger <= CRITICAL_THRESHOLD || newThirst <= CRITICAL_THRESHOLD) {
            // Broadcast critical warning (less frequent)
            if (Math.random() < 0.3) { // 30% chance to avoid spam
              try {
                const { broadcastToPlayer } = await import("../websocket-service");
                const message = newHunger <= CRITICAL_THRESHOLD 
                  ? "⚠️ Sua fome está baixa. Considere consumir alimentos."
                  : "⚠️ Sua sede está baixa. Considere beber água.";
                
                broadcastToPlayer(player.id, {
                  type: 'notification',
                  level: 'warning',
                  message,
                  timestamp: Date.now()
                });
              } catch (error) {
                console.warn('Failed to send warning notification:', error);
              }
            }
          }

          // Broadcast real-time update via WebSocket
          try {
            const updatedPlayer = await this.storage.getPlayer(player.id);
            if (updatedPlayer) {
              const { broadcastPlayerUpdate } = await import("../websocket-service");
              broadcastPlayerUpdate(player.id, updatedPlayer);
              console.log(`📡 Real-time hunger/thirst update sent to player ${player.id}`);
            }
          } catch (error) {
            console.warn('WebSocket broadcast failed:', error);
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
   * Calculate dynamic degradation rates based on player status
   */
  private calculateDynamicDegradation(player: any): { hunger: number; thirst: number } {
    let hungerRate = 1; // Base rate
    let thirstRate = 1; // Base rate

    // Increase rate based on player level (higher level = more resource consumption)
    const levelMultiplier = 1 + (player.level - 1) * 0.05; // +5% per level above 1
    hungerRate *= levelMultiplier;
    thirstRate *= levelMultiplier;

    // Equipment can reduce degradation
    if (player.equippedChestplate) {
      hungerRate *= 0.9; // 10% less hunger loss with armor
    }
    if (player.equippedHelmet) {
      thirstRate *= 0.9; // 10% less thirst loss with helmet
    }

    // Apply temporary effects (if player has active buffs/debuffs)
    if (player.temporaryEffects) {
      for (const effect of player.temporaryEffects) {
        if (effect.expiresAt > Date.now()) {
          switch (effect.type) {
            case 'well_fed':
              hungerRate *= 0.5; // 50% slower hunger loss
              break;
            case 'hydrated':
              thirstRate *= 0.5; // 50% slower thirst loss
              break;
            case 'exhausted':
              hungerRate *= 1.5; // 50% faster hunger loss
              thirstRate *= 1.5; // 50% faster thirst loss
              break;
            case 'fasting':
              hungerRate *= 2; // Double hunger loss
              break;
          }
        }
      }
    }

    // Environmental factors
    const currentTime = new Date();
    const hour = currentTime.getHours();
    
    // Night time increases degradation slightly
    if (hour >= 22 || hour <= 6) {
      hungerRate *= 1.1;
      thirstRate *= 1.1;
    }

    // Cap the rates to reasonable values
    hungerRate = Math.min(3, Math.max(0.25, hungerRate));
    thirstRate = Math.min(3, Math.max(0.25, thirstRate));

    return {
      hunger: Math.ceil(hungerRate),
      thirst: Math.ceil(thirstRate)
    };
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
   * Calculate penalties for low hunger/thirst status
   */
  private calculateStatusPenalties(hunger: number, thirst: number): {
    healthPenalty: number;
    experiencePenalty: number;
  } {
    let healthPenalty = 0;
    let experiencePenalty = 0;

    // Severe penalties for critical status
    if (hunger <= 0 || thirst <= 0) {
      healthPenalty = 5; // Lose 5 health when completely starved/dehydrated
      experiencePenalty = 0.5; // 50% XP penalty
    } else if (hunger <= 5 || thirst <= 5) {
      healthPenalty = 2; // Lose 2 health when very low
      experiencePenalty = 0.25; // 25% XP penalty
    } else if (hunger <= 10 || thirst <= 10) {
      healthPenalty = 1; // Lose 1 health when low
      experiencePenalty = 0.1; // 10% XP penalty
    }



  /**
   * Calculate hunger/thirst degradation for offline players
   */
  async calculateOfflineDegradation(playerId: string, lastOnlineTime: number): Promise<void> {
    const player = await this.storage.getPlayer(playerId);
    if (!player) return;

    const offlineMinutes = Math.floor((Date.now() - lastOnlineTime) / 60000);
    if (offlineMinutes < 1) return;

    // Calculate degradation based on offline time (slower rate)
    const offlineRate = 0.5; // 50% of normal rate when offline
    const hungerLoss = Math.min(player.hunger, Math.floor(offlineMinutes * offlineRate));
    const thirstLoss = Math.min(player.thirst, Math.floor(offlineMinutes * offlineRate));

    if (hungerLoss > 0 || thirstLoss > 0) {
      await this.storage.updatePlayer(playerId, {
        hunger: Math.max(0, player.hunger - hungerLoss),
        thirst: Math.max(0, player.thirst - thirstLoss)
      });

      console.log(`⏰ Offline degradation applied to ${player.username}: -${hungerLoss}H, -${thirstLoss}T`);
    }
  }

    return { healthPenalty, experiencePenalty };
  }

  /**
   * Get current status of the degradation system
   */
  getStatus(): { isRunning: boolean; intervalMs: number } {
    return {
      isRunning: this.isRunning,
      intervalMs: 40000 // 40 seconds
    };
  }
}
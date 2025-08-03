// Hunger and Thirst Degradation Service for Coletor Adventures
import { GAME_CONFIG } from '@shared/config/game-config';
import { TimeService } from './time-service';
import type { IStorage } from '../storage';
import type { HungerDegradationMode } from "@shared/types";
import { CONSUMPTION_CONFIG } from "@shared/config/consumption-config";
import { PlayerStatusService } from "./player-status-service";

export class HungerThirstService {
  private degradationTimer: NodeJS.Timeout | null = null;
  private isRunning = false;
  private statusService: PlayerStatusService;

  constructor(private storage: IStorage) {
    this.statusService = new PlayerStatusService(storage);
  }

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
        // Ensure player has valid status values
        if (!player.hunger && player.hunger !== 0) player.hunger = 100;
        if (!player.thirst && player.thirst !== 0) player.thirst = 100;
        if (!player.maxHunger) player.maxHunger = 100;
        if (!player.maxThirst) player.maxThirst = 100;

        // Skip if player has very low hunger/thirst to avoid going negative
        if (player.hunger <= 2 && player.thirst <= 2) {
          continue;
        }

        // Calculate degradation based on player's selected mode
        const baseDegradation = this.calculateDegradationByMode(player);
        
        // Apply temperature modifiers to degradation
        const temperatureModifiers = await this.getTemperatureModifiers(player);
        const hungerDecrease = Math.min((baseDegradation.hunger || 1) * temperatureModifiers.hunger, player.hunger); 
        const thirstDecrease = Math.min((baseDegradation.thirst || 1) * temperatureModifiers.thirst, player.thirst);

        const newHunger = Math.max(0, player.hunger - hungerDecrease);
        const newThirst = Math.max(0, player.thirst - thirstDecrease);

        // Natural regeneration when player is resting (not on expedition)
        let naturalHungerRegen = 0;
        let naturalThirstRegen = 0;

        if (!player.onExpedition && player.hunger > CONSUMPTION_CONFIG.STATUS.WELL_FED_THRESHOLD && player.thirst > CONSUMPTION_CONFIG.STATUS.WELL_FED_THRESHOLD) {
          // Slight natural regeneration when well-fed and hydrated
          if (Math.random() < 0.2) { // 20% chance
            naturalHungerRegen = Math.min(1, player.maxHunger - player.hunger);
            naturalThirstRegen = Math.min(1, player.maxThirst - player.thirst);
          }
        }

        const finalHunger = Math.min(player.maxHunger, newHunger + naturalHungerRegen);
        const finalThirst = Math.min(player.maxThirst, newThirst + naturalThirstRegen);

        // Only update if there's actually a change and values are valid
        if ((finalHunger !== player.hunger || finalThirst !== player.thirst) && 
            !isNaN(finalHunger) && !isNaN(finalThirst)) {
          // Calculate penalties for low hunger/thirst
          const penalties = this.calculateStatusPenalties(newHunger, newThirst);

          const updateData: any = {
            hunger: Math.max(0, Math.min(player.maxHunger || 100, finalHunger)),
            thirst: Math.max(0, Math.min(player.maxThirst || 100, finalThirst))
          };

          // Apply other status degradations
          const statusDegradation = this.calculateStatusDegradation(player);
          Object.assign(updateData, statusDegradation);

          // Apply penalties if any
          if (penalties.healthPenalty > 0) {
            updateData.health = Math.max(1, (player.health || 100) - penalties.healthPenalty);
            console.log(`🩺 Player ${player.id} lost ${penalties.healthPenalty} health due to low hunger/thirst`);
          }

          await this.statusService.updatePlayerStatus(player.id, updateData);

          // Log degradation with throttling to reduce spam
          if (process.env.NODE_ENV === 'development' && Math.random() < 0.1) {
            console.log(`🍖💧 Player ${player.username}: H:${player.hunger}→${newHunger}, T:${player.thirst}→${newThirst}`);
          }

          // Check for critical status and broadcast warnings
          const CRITICAL_THRESHOLD = CONSUMPTION_CONFIG.STATUS.CRITICAL_THRESHOLD;
          const EMERGENCY_THRESHOLD = CONSUMPTION_CONFIG.STATUS.EMERGENCY_THRESHOLD;

          if (newHunger <= EMERGENCY_THRESHOLD || newThirst <= EMERGENCY_THRESHOLD) {
            // Broadcast emergency warning
            try {
              // Real-time updates handled by polling system
              const message = newHunger <= EMERGENCY_THRESHOLD 
                ? "⚠️ EMERGÊNCIA: Sua fome está criticamente baixa! Coma algo imediatamente!"
                : "⚠️ EMERGÊNCIA: Sua sede está criticamente baixa! Beba água imediatamente!";
            } catch (error) {
              console.warn('Failed to send emergency notification:', error);
            }
          } else if (newHunger <= CRITICAL_THRESHOLD || newThirst <= CRITICAL_THRESHOLD) {
            // Broadcast critical warning (less frequent)
            if (Math.random() < 0.3) { // 30% chance to avoid spam
              try {
                // Real-time updates handled by polling system
                const message = newHunger <= CRITICAL_THRESHOLD 
                  ? "⚠️ Sua fome está baixa. Considere consumir alimentos."
                  : "⚠️ Sua sede está baixa. Considere beber água.";
              } catch (error) {
                console.warn('Failed to send warning notification:', error);
              }
            }
          }

          // Player data will be updated via polling
          console.log(`✅ Hunger/thirst updated for player ${player.id}: hunger=${newHunger}, thirst=${newThirst}`);

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
   * Calculate degradation rates based on player's selected mode
   */
  private calculateDegradationByMode(player: any): { hunger: number; thirst: number } {
    const mode: HungerDegradationMode = player.hungerDegradationMode || 'automatic';

    // Disabled mode - no degradation
    if (mode === 'disabled') {
      return { hunger: 0, thirst: 0 };
    }

    let hungerRate = 1; // Base rate
    let thirstRate = 1; // Base rate

    // Apply mode-specific multipliers
    switch (mode) {
      case 'slow':
        hungerRate *= CONSUMPTION_CONFIG.DEGRADATION.MULTIPLIERS.SLOW;
        thirstRate *= CONSUMPTION_CONFIG.DEGRADATION.MULTIPLIERS.SLOW;
        break;
      case 'normal':
        hungerRate *= CONSUMPTION_CONFIG.DEGRADATION.MULTIPLIERS.NORMAL;
        thirstRate *= CONSUMPTION_CONFIG.DEGRADATION.MULTIPLIERS.NORMAL;
        break;
      case 'fast':
        hungerRate *= CONSUMPTION_CONFIG.DEGRADATION.MULTIPLIERS.FAST;
        thirstRate *= CONSUMPTION_CONFIG.DEGRADATION.MULTIPLIERS.FAST;
        break;
      case 'automatic':
      default:
        // Use dynamic calculation for automatic mode
        return this.calculateDynamicDegradation(player);
    }

    return {
      hunger: Math.ceil(hungerRate),
      thirst: Math.ceil(thirstRate)
    };
  }

  /**
   * Get temperature modifiers for hunger/thirst degradation
   */
  private async getTemperatureModifiers(player: any): Promise<{ hunger: number; thirst: number }> {
    try {
      const timeService = TimeService.getInstance();
      const gameTime = timeService.getCurrentGameTime();
      
      // Get player's current biome (default to forest if not specified)
      const biome = player.currentBiome || 'forest';
      
      // Calculate temperature
      const temperatureData = timeService.calculateTemperature(biome, gameTime, player);
      const temperature = temperatureData.current;
      
      // Apply temperature modifiers
      return timeService.getTemperatureModifiers(temperature);
    } catch (error) {
      console.warn('Failed to get temperature modifiers:', error);
      return { hunger: 1, thirst: 1 };
    }
  }

  /**
   * Calculate dynamic degradation rates based on player status (for automatic mode)
   */
  private calculateDynamicDegradation(player: any): { hunger: number; thirst: number } {
    let hungerRate = 1; // Base rate
    let thirstRate = 1; // Base rate

    // Increase rate based on player level (higher level = more resource consumption)
    const levelMultiplier = 1 + (player.level - 1) * 0.05; // +5% per level above 1
    hungerRate *= levelMultiplier;
    thirstRate *= levelMultiplier;

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
   * Manual degradation for a specific player - REMOVED to prevent conflicts with configured degradation mode
   * All degradation is now handled by the configured mode system
   */

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
      healthPenalty = CONSUMPTION_CONFIG.PENALTIES.EMERGENCY.health;
      experiencePenalty = CONSUMPTION_CONFIG.PENALTIES.EMERGENCY.xp;
    } else if (hunger <= CONSUMPTION_CONFIG.STATUS.EMERGENCY_THRESHOLD || thirst <= CONSUMPTION_CONFIG.STATUS.EMERGENCY_THRESHOLD) {
      healthPenalty = CONSUMPTION_CONFIG.PENALTIES.CRITICAL.health;
      experiencePenalty = CONSUMPTION_CONFIG.PENALTIES.CRITICAL.xp;
    } else if (hunger <= CONSUMPTION_CONFIG.STATUS.CRITICAL_THRESHOLD || thirst <= CONSUMPTION_CONFIG.STATUS.CRITICAL_THRESHOLD) {
      healthPenalty = CONSUMPTION_CONFIG.PENALTIES.LOW.health;
      experiencePenalty = CONSUMPTION_CONFIG.PENALTIES.LOW.xp;
    }

    return { healthPenalty, experiencePenalty };
  }

  /**
   * OFFLINE DEGRADATION REMOVED - Only configured degradation mode is used
   * The normal passive degradation system handles all degradation consistently
   */

  /**
   * Calculate degradation for other status values
   */
  private calculateStatusDegradation(player: any): any {
    const updates: any = {};

    // Fatigue naturally decreases when not on expedition (rest)
    if (!player.onExpedition && player.fatigue > 0) {
      const fatigueRecovery = Math.min(2, player.fatigue); // Recover 2 fatigue per cycle when resting
      updates.fatigue = Math.max(0, player.fatigue - fatigueRecovery);
    }

    // Hygiene naturally decreases over time
    if (player.hygiene > 0) {
      const hygieneDecrease = 1; // Lose 1 hygiene per cycle
      updates.hygiene = Math.max(0, player.hygiene - hygieneDecrease);
    }

    // Temperature moves toward neutral (20°C) slowly
    const currentTemp = player.temperature || 20;
    if (currentTemp !== 20) {
      const tempChange = currentTemp > 20 ? -1 : 1; // Move 1 degree toward 20
      updates.temperature = Math.max(-100, Math.min(100, currentTemp + tempChange));
    }

    // Morale slowly decreases if low hunger/thirst, slowly increases if well-fed
    if (player.hunger < 30 || player.thirst < 30) {
      updates.morale = Math.max(0, player.morale - 1); // Lose morale when hungry/thirsty
    } else if (player.hunger > 80 && player.thirst > 80 && player.morale < 100) {
      updates.morale = Math.min(100, player.morale + 1); // Gain morale when well-fed
    }

    return updates;
  }

  /**
   * Get current status of the degradation system
   */
  getStatus(): { isRunning: boolean; intervalMs: number } {
    return {
      isRunning: this.isRunning,
      intervalMs: 120000 // 2 minutes (120 seconds)
    };
  }

  private logDegradation(playerId: string, oldHunger: number, newHunger: number, oldThirst: number, newThirst: number, timeModifiers?: { hunger: number; thirst: number }) {
    const hungerDrop = oldHunger - newHunger;
    const thirstDrop = oldThirst - newThirst;

    if (hungerDrop > 0 || thirstDrop > 0) {
      const modifierInfo = timeModifiers ? ` (Mods: H${timeModifiers.hunger.toFixed(1)}x T${timeModifiers.thirst.toFixed(1)}x)` : '';
      console.log(`🍖💧 DEGRADATION: Player ${playerId} - Hunger: ${oldHunger}→${newHunger} (-${hungerDrop.toFixed(1)}), Thirst: ${oldThirst}→${newThirst} (-${thirstDrop.toFixed(1)})${modifierInfo}`);
    }
  }
}
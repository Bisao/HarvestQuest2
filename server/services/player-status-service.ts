
import type { IStorage } from "../storage";
import type { Player, PlayerDisease } from "@shared/types";
import { CONSUMPTION_CONFIG } from "@shared/config/consumption-config";

export class PlayerStatusService {
  constructor(private storage: IStorage) {}

  /**
   * Update player status with comprehensive validation
   */
  async updatePlayerStatus(playerId: string, updates: Partial<Player>): Promise<Player> {
    const player = await this.storage.getPlayer(playerId);
    if (!player) throw new Error("Player not found");

    // Validate and clamp values
    const validatedUpdates: any = {};

    if (updates.health !== undefined) {
      validatedUpdates.health = Math.max(1, Math.min(player.maxHealth, updates.health));
    }

    if (updates.hunger !== undefined) {
      validatedUpdates.hunger = Math.max(0, Math.min(player.maxHunger, updates.hunger));
    }

    if (updates.thirst !== undefined) {
      validatedUpdates.thirst = Math.max(0, Math.min(player.maxThirst, updates.thirst));
    }

    if (updates.temperature !== undefined) {
      validatedUpdates.temperature = Math.max(-100, Math.min(100, updates.temperature));
    }

    if (updates.fatigue !== undefined) {
      validatedUpdates.fatigue = Math.max(0, Math.min(100, updates.fatigue));
    }

    if (updates.morale !== undefined) {
      validatedUpdates.morale = Math.max(0, Math.min(100, updates.morale));
    }

    if (updates.hygiene !== undefined) {
      validatedUpdates.hygiene = Math.max(0, Math.min(100, updates.hygiene));
    }

    // Update other fields as provided
    Object.keys(updates).forEach(key => {
      if (!['health', 'hunger', 'thirst', 'temperature', 'fatigue', 'morale', 'hygiene'].includes(key)) {
        validatedUpdates[key] = updates[key as keyof Player];
      }
    });

    await this.storage.updatePlayer(playerId, validatedUpdates);
    return await this.storage.getPlayer(playerId) as Player;
  }

  /**
   * Apply status effects from diseases
   */
  async applyDiseaseEffects(playerId: string): Promise<void> {
    const player = await this.storage.getPlayer(playerId);
    if (!player || !player.diseases.length) return;

    let totalHealthDrain = 0;
    let totalFatigueIncrease = 0;
    let totalMoraleDecrease = 0;
    let totalHygieneDecrease = 0;

    // Process each active disease
    for (const disease of player.diseases) {
      if (disease.duration > 0) {
        for (const effect of disease.effects) {
          switch (effect.type) {
            case 'health_drain':
              totalHealthDrain += effect.value;
              break;
            case 'fatigue_increase':
              totalFatigueIncrease += effect.value;
              break;
            case 'morale_decrease':
              totalMoraleDecrease += effect.value;
              break;
            case 'hygiene_decrease':
              totalHygieneDecrease += effect.value;
              break;
          }
        }
      }
    }

    // Apply accumulated effects
    if (totalHealthDrain > 0 || totalFatigueIncrease > 0 || totalMoraleDecrease > 0 || totalHygieneDecrease > 0) {
      await this.updatePlayerStatus(playerId, {
        health: player.health - totalHealthDrain,
        fatigue: player.fatigue + totalFatigueIncrease,
        morale: player.morale - totalMoraleDecrease,
        hygiene: player.hygiene - totalHygieneDecrease
      });
    }
  }

  /**
   * Process disease duration and remove expired diseases
   */
  async processDiseases(playerId: string): Promise<void> {
    const player = await this.storage.getPlayer(playerId);
    if (!player || !player.diseases.length) return;

    const updatedDiseases = player.diseases
      .map(disease => ({
        ...disease,
        duration: Math.max(0, disease.duration - 60) // Decrease by 1 minute
      }))
      .filter(disease => disease.duration > 0); // Remove expired diseases

    await this.storage.updatePlayer(playerId, { diseases: updatedDiseases });
  }

  /**
   * Calculate status penalties for gameplay effects
   */
  calculateStatusEffects(player: Player): {
    experienceMultiplier: number;
    resourceGatheringMultiplier: number;
    movementSpeedMultiplier: number;
  } {
    let expMultiplier = 1.0;
    let gatheringMultiplier = 1.0;
    let movementMultiplier = 1.0;

    // Hunger effects
    if (player.hunger < 30) {
      expMultiplier *= 0.8;
      gatheringMultiplier *= 0.7;
    }

    // Thirst effects
    if (player.thirst < 30) {
      expMultiplier *= 0.8;
      movementMultiplier *= 0.8;
    }

    // Health effects
    if (player.health < 30) {
      expMultiplier *= 0.6;
      gatheringMultiplier *= 0.5;
      movementMultiplier *= 0.6;
    }

    // Fatigue effects
    if (player.fatigue > 70) {
      expMultiplier *= 0.7;
      gatheringMultiplier *= 0.6;
      movementMultiplier *= 0.5;
    }

    // Morale effects
    if (player.morale < 30) {
      expMultiplier *= 0.8;
    } else if (player.morale > 70) {
      expMultiplier *= 1.2;
    }

    return {
      experienceMultiplier: expMultiplier,
      resourceGatheringMultiplier: gatheringMultiplier,
      movementSpeedMultiplier: movementMultiplier
    };
  }

  /**
   * Get player status summary
   */
  getStatusSummary(player: Player): {
    overall: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
    warnings: string[];
    recommendations: string[];
  } {
    const warnings: string[] = [];
    const recommendations: string[] = [];
    
    // Check critical thresholds
    if (player.health <= 20) warnings.push("Saúde criticamente baixa!");
    if (player.hunger <= 20) warnings.push("Fome crítica!");
    if (player.thirst <= 20) warnings.push("Sede crítica!");
    if (player.fatigue >= 80) warnings.push("Extremamente cansado!");

    // Add recommendations
    if (player.hunger < 50) recommendations.push("Consuma alimentos para recuperar energia");
    if (player.thirst < 50) recommendations.push("Beba água para se hidratar");
    if (player.fatigue > 60) recommendations.push("Descanse para reduzir o cansaço");
    if (player.hygiene < 40) recommendations.push("Melhore sua higiene para evitar doenças");
    if (player.morale < 40) recommendations.push("Faça atividades prazerosas para melhorar o humor");

    // Calculate overall status
    const statusAverage = (
      (player.health / player.maxHealth) +
      (player.hunger / player.maxHunger) +
      (player.thirst / player.maxThirst) +
      ((100 - player.fatigue) / 100) +
      (player.morale / 100)
    ) / 5;

    let overall: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
    if (statusAverage >= 0.9) overall = 'excellent';
    else if (statusAverage >= 0.7) overall = 'good';
    else if (statusAverage >= 0.5) overall = 'fair';
    else if (statusAverage >= 0.3) overall = 'poor';
    else overall = 'critical';

    return { overall, warnings, recommendations };
  }
}

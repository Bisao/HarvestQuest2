/**
 * FIXED EXPEDITION TRACKING SERVICE
 * Unified expedition state management and progress tracking
 */

import type { IStorage } from '../storage';
import type { Player, Biome } from '@shared/types';
import { v4 as uuidv4 } from 'uuid';
import { createBusinessLogicError } from '@shared/utils/error-handler';

export interface ExpeditionState {
  id: string;
  playerId: string;
  biomeId: string;
  startTime: number;
  estimatedDuration: number;
  selectedResources: string[];
  progress: number;
  status: 'active' | 'completed' | 'cancelled';
  collectedResources?: Record<string, number>;
  events?: ExpeditionEvent[];
}

export interface ExpeditionEvent {
  timestamp: number;
  type: 'resource_found' | 'animal_encounter' | 'discovery' | 'hazard';
  description: string;
  resourceId?: string;
  quantity?: number;
}

export class ExpeditionTrackingService {
  private activeExpeditions = new Map<string, ExpeditionState>();
  private progressIntervals = new Map<string, NodeJS.Timeout>();

  constructor(private storage: IStorage) {}

  async startExpedition(
    playerId: string,
    biomeId: string,
    selectedResources: string[],
    estimatedDuration: number
  ): Promise<ExpeditionState> {
    // Validate player exists and can start expedition
    const player = await this.storage.getPlayer(playerId);
    if (!player) {
      throw createBusinessLogicError('Player not found');
    }

    // Check if player already has active expedition
    const existing = Array.from(this.activeExpeditions.values())
      .find(exp => exp.playerId === playerId && exp.status === 'active');
    
    if (existing) {
      throw createBusinessLogicError('Player already has an active expedition', 
        { playerId }, 'Você já tem uma expedição em andamento');
    }

    // Create new expedition
    const expedition: ExpeditionState = {
      id: uuidv4(),
      playerId,
      biomeId,
      startTime: Date.now(),
      estimatedDuration,
      selectedResources,
      progress: 0,
      status: 'active',
      collectedResources: {},
      events: []
    };

    this.activeExpeditions.set(expedition.id, expedition);
    this.startProgressTracking(expedition.id);

    return expedition;
  }

  async getActiveExpedition(playerId: string): Promise<ExpeditionState | null> {
    return Array.from(this.activeExpeditions.values())
      .find(exp => exp.playerId === playerId && exp.status === 'active') || null;
  }

  async updateExpeditionProgress(expeditionId: string): Promise<ExpeditionState | null> {
    const expedition = this.activeExpeditions.get(expeditionId);
    if (!expedition || expedition.status !== 'active') {
      return null;
    }

    const now = Date.now();
    const elapsed = now - expedition.startTime;
    const progress = Math.min(100, (elapsed / expedition.estimatedDuration) * 100);

    expedition.progress = progress;

    // Generate events at certain progress milestones
    await this.generateExpeditionEvents(expedition, progress);

    // Complete expedition if progress reaches 100%
    if (progress >= 100) {
      await this.completeExpedition(expeditionId);
    }

    return expedition;
  }

  async completeExpedition(expeditionId: string): Promise<ExpeditionState | null> {
    const expedition = this.activeExpeditions.get(expeditionId);
    if (!expedition) {
      return null;
    }

    expedition.status = 'completed';
    expedition.progress = 100;

    // Stop progress tracking
    const interval = this.progressIntervals.get(expeditionId);
    if (interval) {
      clearInterval(interval);
      this.progressIntervals.delete(expeditionId);
    }

    // Generate final rewards
    await this.generateExpeditionRewards(expedition);

    // Clean up after 5 minutes
    setTimeout(() => {
      this.activeExpeditions.delete(expeditionId);
    }, 5 * 60 * 1000);

    return expedition;
  }

  async cancelExpedition(expeditionId: string): Promise<boolean> {
    const expedition = this.activeExpeditions.get(expeditionId);
    if (!expedition) {
      return false;
    }

    expedition.status = 'cancelled';

    // Stop progress tracking
    const interval = this.progressIntervals.get(expeditionId);
    if (interval) {
      clearInterval(interval);
      this.progressIntervals.delete(expeditionId);
    }

    // Remove from active expeditions
    this.activeExpeditions.delete(expeditionId);
    return true;
  }

  private startProgressTracking(expeditionId: string): void {
    const interval = setInterval(async () => {
      await this.updateExpeditionProgress(expeditionId);
    }, 10000); // Update every 10 seconds

    this.progressIntervals.set(expeditionId, interval);
  }

  private async generateExpeditionEvents(expedition: ExpeditionState, progress: number): Promise<void> {
    const lastEventProgress = expedition.events?.length ? 
      Math.max(...expedition.events.map(e => e.timestamp)) : 0;

    // Generate events at 25%, 50%, 75% milestones
    const milestones = [25, 50, 75];
    
    for (const milestone of milestones) {
      if (progress >= milestone && lastEventProgress < milestone) {
        const event = await this.generateRandomEvent(expedition, milestone);
        if (event) {
          expedition.events = expedition.events || [];
          expedition.events.push(event);
        }
      }
    }
  }

  private async generateRandomEvent(expedition: ExpeditionState, milestone: number): Promise<ExpeditionEvent | null> {
    const eventTypes = ['resource_found', 'discovery', 'animal_encounter'];
    const randomType = eventTypes[Math.floor(Math.random() * eventTypes.length)] as ExpeditionEvent['type'];

    switch (randomType) {
      case 'resource_found':
        if (expedition.selectedResources.length > 0) {
          const resourceId = expedition.selectedResources[
            Math.floor(Math.random() * expedition.selectedResources.length)
          ];
          const quantity = Math.floor(Math.random() * 3) + 1;
          
          // Add to collected resources
          expedition.collectedResources = expedition.collectedResources || {};
          expedition.collectedResources[resourceId] = 
            (expedition.collectedResources[resourceId] || 0) + quantity;

          return {
            timestamp: milestone,
            type: 'resource_found',
            description: `Encontrou ${quantity} recursos valiosos`,
            resourceId,
            quantity
          };
        }
        break;

      case 'discovery':
        return {
          timestamp: milestone,
          type: 'discovery',
          description: this.getRandomDiscoveryMessage()
        };

      case 'animal_encounter':
        return {
          timestamp: milestone,
          type: 'animal_encounter',
          description: this.getRandomAnimalMessage()
        };
    }

    return null;
  }

  private async generateExpeditionRewards(expedition: ExpeditionState): Promise<void> {
    try {
      const player = await this.storage.getPlayer(expedition.playerId);
      if (!player) return;

      // Add collected resources to player inventory
      for (const [resourceId, quantity] of Object.entries(expedition.collectedResources || {})) {
        await this.storage.addInventoryItem({
          playerId: expedition.playerId,
          resourceId,
          quantity
        });
      }

      // Add experience and coins
      const baseExperience = Math.floor(expedition.estimatedDuration / 60000) * 5; // 5 XP per minute
      const bonusCoins = Math.floor(Math.random() * 10) + 5;

      await this.storage.updatePlayer(expedition.playerId, {
        experience: player.experience + baseExperience,
        coins: player.coins + bonusCoins
      });

    } catch (error) {
      console.error('Error generating expedition rewards:', error);
    }
  }

  private getRandomDiscoveryMessage(): string {
    const messages = [
      'Descobriu uma área inexplorada',
      'Encontrou vestígios de uma civilização antiga',
      'Descobriu uma fonte de água cristalina',
      'Achou um local perfeito para acampar',
      'Descobriu pegadas de um animal raro'
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  private getRandomAnimalMessage(): string {
    const messages = [
      'Avistou um animal selvagem à distância',
      'Encontrou pegadas frescas de um predador',
      'Observou um grupo de animais pastando',
      'Escutou sons estranhos na mata',
      'Viu pássaros exóticos voando'
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  // Cleanup method for server shutdown
  destroy(): void {
    // Clear all intervals
    for (const interval of this.progressIntervals.values()) {
      clearInterval(interval);
    }
    this.progressIntervals.clear();
    this.activeExpeditions.clear();
  }
}
import type { 
  Player, 
  OfflineActivityReport, 
  OfflineEvent, 
  OfflineCalculationResult,
  Resource,
  Biome
} from '@shared/types';
import type { MemStorage } from '../storage';

export class OfflineActivityService {
  private storage: MemStorage;

  constructor(storage: MemStorage) {
    this.storage = storage;
  }

  /**
   * Calcula atividades offline quando o jogador retorna
   */
  async calculateOfflineActivity(playerId: string): Promise<OfflineCalculationResult | null> {
    const player = await this.storage.getPlayer(playerId);
    if (!player || !player.lastOnlineTime) {
      return null;
    }

    const currentTime = Date.now();
    const timeOffline = currentTime - player.lastOnlineTime;
    const hoursOffline = timeOffline / (1000 * 60 * 60);

    // Só processa se ficou offline mais de 30 minutos
    if (hoursOffline < 0.5) {
      return null;
    }

    // Limita o tempo offline para evitar exploits (máximo 24 horas)
    const effectiveHours = Math.min(hoursOffline, 24);
    
    const report = await this.generateOfflineReport(player, effectiveHours, timeOffline);
    const { playerUpdates, inventoryUpdates, storageUpdates } = await this.applyOfflineRewards(player, report);

    return {
      report,
      playerUpdates,
      inventoryUpdates,
      storageUpdates
    };
  }

  /**
   * Gera relatório de atividades offline
   */
  private async generateOfflineReport(
    player: Player, 
    hoursOffline: number, 
    timeOffline: number
  ): Promise<OfflineActivityReport> {
    const config = player.offlineActivityConfig;
    const specialEvents: OfflineEvent[] = [];
    const resourcesCollected: Record<string, number> = {};

    // Calcula eficiência baseada em condições do jogador
    const efficiency = this.calculateOfflineEfficiency(player, hoursOffline);

    // Número de expedições offline baseado em tempo (1 a cada 2 horas, com eficiência)
    const baseExpeditions = Math.floor(hoursOffline / 2);
    const expeditionsCompleted = Math.floor(baseExpeditions * (efficiency / 100));

    // Simula coleta de recursos com base no bioma preferido
    if (expeditionsCompleted > 0) {
      const preferredBiome = config?.preferredBiome || await this.getDefaultBiome(player);
      if (preferredBiome) {
        const biome = await this.storage.getBiome(preferredBiome);
        if (biome) {
          await this.simulateOfflineExpeditions(
            player, 
            biome, 
            expeditionsCompleted, 
            efficiency,
            resourcesCollected,
            specialEvents
          );
        }
      }
    }

    // Calcula experiência ganhada
    const experienceGained = this.calculateOfflineExperience(expeditionsCompleted, efficiency);

    // Simula consumo de fome/sede (reduzido para offline)
    const hungerConsumed = Math.min(player.hunger, Math.floor(hoursOffline * 3));
    const thirstConsumed = Math.min(player.thirst, Math.floor(hoursOffline * 4));

    // Eventos especiais aleatórios
    this.generateRandomOfflineEvents(hoursOffline, specialEvents);

    return {
      timeOffline,
      hoursOffline,
      resourcesCollected,
      experienceGained,
      expeditionsCompleted,
      hungerConsumed,
      thirstConsumed,
      specialEvents,
      efficiency
    };
  }

  /**
   * Calcula eficiência das atividades offline
   */
  private calculateOfflineEfficiency(player: Player, hoursOffline: number): number {
    let efficiency = 60; // Eficiência base offline (60%)

    // Bonus por equipamentos
    if (player.equippedTool) efficiency += 10;
    if (player.equippedWeapon) efficiency += 5;
    if (player.equippedChestplate) efficiency += 5;

    // Bonus por nível
    efficiency += Math.min(player.level * 2, 20);

    // Penalidade por muito tempo offline
    if (hoursOffline > 12) {
      efficiency -= (hoursOffline - 12) * 2;
    }

    // Bonus por status de fome/sede alta
    if (player.hunger > 80) efficiency += 5;
    if (player.thirst > 80) efficiency += 5;

    return Math.max(20, Math.min(100, efficiency));
  }

  /**
   * Simula expedições offline
   */
  private async simulateOfflineExpeditions(
    player: Player,
    biome: Biome,
    expeditionsCount: number,
    efficiency: number,
    resourcesCollected: Record<string, number>,
    specialEvents: OfflineEvent[]
  ): Promise<void> {
    const resources = await this.storage.getAllResources();
    const availableResources = biome.availableResources || [];

    for (let i = 0; i < expeditionsCount; i++) {
      // Simula coleta para cada recurso disponível no bioma
      for (const resourceId of availableResources) {
        const resource = resources.find(r => r.id === resourceId);
        if (!resource) continue;

        // Quantidade base com variação e eficiência
        const baseAmount = Math.floor(Math.random() * 5) + 1;
        const efficiencyMultiplier = efficiency / 100;
        const finalAmount = Math.floor(baseAmount * efficiencyMultiplier);

        if (finalAmount > 0) {
          resourcesCollected[resourceId] = (resourcesCollected[resourceId] || 0) + finalAmount;
        }

        // Chance de evento especial (5% por expedição)
        if (Math.random() < 0.05) {
          specialEvents.push({
            type: 'resource_bonus',
            description: `Encontrou uma fonte rica de ${resource.name}! +${Math.floor(finalAmount * 0.5)} bônus`,
            timestamp: Date.now() - Math.random() * 1000 * 60 * 60 * 2, // Evento aleatório nas últimas 2h
            data: { resourceId, bonus: Math.floor(finalAmount * 0.5) }
          });
          resourcesCollected[resourceId] += Math.floor(finalAmount * 0.5);
        }
      }
    }
  }

  /**
   * Calcula experiência offline
   */
  private calculateOfflineExperience(expeditions: number, efficiency: number): number {
    const baseExp = expeditions * 15; // 15 XP por expedição
    return Math.floor(baseExp * (efficiency / 100));
  }

  /**
   * Gera eventos especiais aleatórios
   */
  private generateRandomOfflineEvents(hoursOffline: number, events: OfflineEvent[]): void {
    // Chance de level up automático se ficou muito tempo offline
    if (hoursOffline > 8 && Math.random() < 0.3) {
      events.push({
        type: 'level_up',
        description: 'Sua experiência acumulada resultou em um aumento de nível!',
        timestamp: Date.now() - Math.random() * 1000 * 60 * 60 * 4,
        data: {}
      });
    }

    // Achados especiais baseados no tempo offline
    const specialFindChance = Math.min(hoursOffline * 0.1, 0.8);
    if (Math.random() < specialFindChance) {
      const finds = [
        'Encontrou uma pedra preciosa brilhante!',
        'Descobriu uma fonte de água cristalina!',
        'Achou pegadas de uma criatura rara!',
        'Encontrou ruínas antigas misteriosas!'
      ];
      
      events.push({
        type: 'special_find',
        description: finds[Math.floor(Math.random() * finds.length)],
        timestamp: Date.now() - Math.random() * 1000 * 60 * 60,
        data: {}
      });
    }
  }

  /**
   * Aplica recompensas offline
   */
  private async applyOfflineRewards(
    player: Player, 
    report: OfflineActivityReport
  ): Promise<{
    playerUpdates: Partial<Player>;
    inventoryUpdates: { resourceId: string; quantity: number }[];
    storageUpdates: { resourceId: string; quantity: number }[];
  }> {
    const playerUpdates: Partial<Player> = {
      experience: player.experience + report.experienceGained,
      hunger: Math.max(0, player.hunger - report.hungerConsumed),
      thirst: Math.max(0, player.thirst - report.thirstConsumed),
      lastOnlineTime: Date.now() // Atualiza o timestamp
    };

    // Calcula level up se necessário
    const newLevel = this.calculateLevelFromExperience(playerUpdates.experience!);
    if (newLevel > player.level) {
      playerUpdates.level = newLevel;
    }

    // Distribui recursos coletados baseado na configuração de auto-storage
    const inventoryUpdates: { resourceId: string; quantity: number }[] = [];
    const storageUpdates: { resourceId: string; quantity: number }[] = [];

    for (const [resourceId, quantity] of Object.entries(report.resourcesCollected)) {
      if (player.autoStorage) {
        storageUpdates.push({ resourceId, quantity });
      } else {
        inventoryUpdates.push({ resourceId, quantity });
      }
    }

    return { playerUpdates, inventoryUpdates, storageUpdates };
  }

  /**
   * Calcula nível baseado na experiência
   */
  private calculateLevelFromExperience(experience: number): number {
    return Math.floor(Math.sqrt(experience / 100)) + 1;
  }

  /**
   * Obtém bioma padrão para atividades offline
   */
  private async getDefaultBiome(player: Player): Promise<string | null> {
    const biomes = await this.storage.getAllBiomes();
    const accessibleBiomes = biomes.filter(biome => biome.requiredLevel <= player.level);
    
    if (accessibleBiomes.length === 0) return null;
    
    // Retorna o bioma de maior nível que o jogador pode acessar
    return accessibleBiomes.sort((a, b) => b.requiredLevel - a.requiredLevel)[0].id;
  }

  /**
   * Marca que o jogador está online agora
   */
  async markPlayerOnline(playerId: string): Promise<void> {
    await this.storage.updatePlayer(playerId, { 
      lastOnlineTime: Date.now() 
    });
  }

  /**
   * Configura atividades offline para um jogador
   */
  async updateOfflineConfig(playerId: string, config: any): Promise<void> {
    await this.storage.updatePlayer(playerId, { 
      offlineActivityConfig: config 
    });
  }
}
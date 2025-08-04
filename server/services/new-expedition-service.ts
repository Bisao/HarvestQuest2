import type { IStorage } from '../storage';
import type { Player, Biome } from '@shared/types';
import { 
  ExpeditionTemplate, 
  ActiveExpedition, 
  ExpeditionPlan, 
  ExpeditionEvent,
  ExpeditionTarget 
} from '@shared/types/expedition-types';
import { CombatService } from './combat-service';
import { v4 as uuidv4 } from 'uuid';
import { RESOURCE_IDS } from '../../shared/constants/game-ids';
import { CREATURE_IDS, migrateLegacyCreatureId, isValidCreatureId } from '../../shared/constants/creature-ids';

export class NewExpeditionService {
  private combatService: CombatService;

  constructor(private storage: IStorage) {
    this.combatService = new CombatService(storage);
  }

  // ===================== TEMPLATES DE EXPEDIÇÃO =====================

  getExpeditionTemplates(): ExpeditionTemplate[] {
    return [
      {
        id: 'gathering-basic',
        name: 'Coleta Básica',
        description: 'Expedição simples para coletar recursos básicos da floresta',
        biomeId: '61b1e6d2-b284-4c11-a5e0-dbc4d46ebd47', // Floresta
        category: 'gathering',
        difficulty: 'beginner',
        duration: { min: 5, max: 15 },
        requirements: {
          minLevel: 1,
          requiredTools: [],
          minHunger: 20,
          minThirst: 20,
          minHealth: 50
        },
        rewards: {
          guaranteed: {
            'res-f1b2c3d4-e5f6-7890-abcd-ef1234567890': 3 // Fibra
          },
          possible: [
            {
              resourceId: 'res-a2b3c4d5-e6f7-8901-bcde-f23456789012', // Pedra
              quantity: 2,
              chance: 0.7
            },
            {
              resourceId: 'res-d5e6f7g8-h9i0-1234-ef01-567890123456', // Gravetos
              quantity: 4,
              chance: 0.8
            }
          ],
          experience: 10
        }
      },
      {
        id: 'hunting-small',
        name: 'Caça Pequena',
        description: 'Caçar pequenos animais na floresta',
        biomeId: '61b1e6d2-b284-4c11-a5e0-dbc4d46ebd47',
        category: 'hunting',
        difficulty: 'intermediate',
        duration: { min: 10, max: 25 },
        requirements: {
          minLevel: 3,
          requiredTools: ['weapon'], // Qualquer arma
          minHunger: 30,
          minThirst: 30,
          minHealth: 70
        },
        rewards: {
          guaranteed: {},
          possible: [
            {
              resourceId: 'res-f1b2c3d4-e5f6-7890-abcd-ef1234567890', // Fibra (pegadilhas)
              quantity: 2,
              chance: 0.6
            },
            {
              resourceId: 'res-a2b3c4d5-e6f7-8901-bcde-f23456789012', // Pedra
              quantity: 1,
              chance: 0.4
            }
          ],
          experience: 25
        }
      },
      {
        id: 'exploration-deep',
        name: 'Exploração Profunda',
        description: 'Aventure-se nas profundezas da floresta em busca de tesouros',
        biomeId: '61b1e6d2-b284-4c11-a5e0-dbc4d46ebd47',
        category: 'exploration',
        difficulty: 'advanced',
        duration: { min: 30, max: 60 },
        requirements: {
          minLevel: 10,
          requiredTools: ['tool'], // Qualquer ferramenta
          minHunger: 60,
          minThirst: 60,
          minHealth: 90
        },
        rewards: {
          guaranteed: {
            'res-fibra-001': 5, // Fibra
            'res-pedra-001': 3  // Pedra
          },
          possible: [
            {
              resourceId: 'res-bambu-001', // Bambu
              quantity: 3,
              chance: 0.5
            },
            {
              resourceId: 'res-frutas-silvestres-001', // Frutas silvestres
              quantity: 2,
              chance: 0.3
            }
          ],
          experience: 50
        }
      }
    ];
  }

  getTemplateById(templateId: string): ExpeditionTemplate | null {
    return this.getExpeditionTemplates().find(t => t.id === templateId) || null;
  }

  getTemplatesForBiome(biomeId: string): ExpeditionTemplate[] {
    return this.getExpeditionTemplates().filter(t => t.biomeId === biomeId);
  }

  // ===================== VALIDAÇÃO =====================

  async validateExpeditionRequirements(
    playerId: string, 
    templateId: string,
    selectedResources?: string[]
  ): Promise<{ valid: boolean; errors: string[] }> {
    const player = await this.storage.getPlayer(playerId);
    const template = this.getTemplateById(templateId);

    if (!player) return { valid: false, errors: ['Jogador não encontrado'] };
    if (!template) return { valid: false, errors: ['Template de expedição não encontrado'] };

    const errors: string[] = [];

    // Verificar level
    if (player.level < template.requirements.minLevel) {
      errors.push(`Nível mínimo requerido: ${template.requirements.minLevel}`);
    }

    // Verificar status básicos
    if (player.hunger < template.requirements.minHunger) {
      errors.push(`Fome mínima requerida: ${template.requirements.minHunger}%`);
    }
    if (player.thirst < template.requirements.minThirst) {
      errors.push(`Sede mínima requerida: ${template.requirements.minThirst}%`);
    }
    if ((player.health ?? 100) < template.requirements.minHealth) {
      errors.push(`Saúde mínima requerida: ${template.requirements.minHealth}%`);
    }

    // Verificar ferramentas do template
    if (template.requirements.requiredTools.length > 0) {
      const hasRequiredTools = await this.checkPlayerTools(player, template.requirements.requiredTools);
      if (!hasRequiredTools) {
        errors.push(`Ferramentas necessárias: ${template.requirements.requiredTools.join(', ')}`);
      }
    }

    // Verificar ferramentas necessárias para recursos selecionados
    if (selectedResources && selectedResources.length > 0) {
      const resourceValidation = await this.validateSelectedResourcesEquipment(playerId, selectedResources);
      if (!resourceValidation.valid) {
        errors.push(...resourceValidation.errors);
      }
    }

    // Verificar se já tem expedição ativa
    const activeExpeditions = await this.getPlayerActiveExpeditions(playerId);
    if (activeExpeditions.length > 0) {
      errors.push('Você já tem uma expedição ativa');
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Validar se o jogador tem as ferramentas necessárias para coletar os recursos selecionados
   */
  private async validateSelectedResourcesEquipment(
    playerId: string, 
    resourceIds: string[]
  ): Promise<{ valid: boolean; errors: string[] }> {
    try {
      const player = await this.storage.getPlayer(playerId);
      const allResources = await this.storage.getAllResources();
      const allEquipment = await this.storage.getAllEquipment();
      const errors: string[] = [];

      if (!player) {
        return { valid: false, errors: ['Jogador não encontrado'] };
      }

      console.log(`🔍 EXPEDITION-VALIDATION: Checking equipment for ${resourceIds.length} resources`);
      console.log(`🔍 EXPEDITION-VALIDATION: Player equipped - Tool: ${player.equippedTool}, Weapon: ${player.equippedWeapon}`);

      for (const resourceId of resourceIds) {
        const resource = allResources.find(r => r.id === resourceId);
        if (!resource) {
          console.warn(`⚠️ EXPEDITION-VALIDATION: Resource not found: ${resourceId}`);
          continue;
        }

        // Verificar se o recurso requer ferramentas específicas
        const requiredTool = this.getRequiredToolForResource(resource);
        if (!requiredTool) {
          console.log(`✅ EXPEDITION-VALIDATION: ${resource.name} doesn't require specific tools`);
          continue; // Recurso não requer ferramenta
        }

        console.log(`🔧 EXPEDITION-VALIDATION: ${resource.name} requires ${requiredTool}`);

        const hasRequiredTool = await this.playerHasRequiredTool(player, requiredTool, allEquipment);
        if (!hasRequiredTool) {
          const toolName = this.getToolDisplayName(requiredTool);
          errors.push(`${resource.name} requer ${toolName} equipado`);
          console.error(`❌ EXPEDITION-VALIDATION: Missing ${toolName} for ${resource.name}`);
        } else {
          console.log(`✅ EXPEDITION-VALIDATION: Player has required tool for ${resource.name}`);
        }
      }

      console.log(`📋 EXPEDITION-VALIDATION: Validation complete - ${errors.length} errors found`);
      return { valid: errors.length === 0, errors };
    } catch (error) {
      console.error('❌ EXPEDITION-VALIDATION: Error validating equipment:', error);
      return { valid: false, errors: ['Erro ao validar equipamentos'] };
    }
  }

  /**
   * Determinar que ferramenta é necessária para um recurso específico
   */
  private getRequiredToolForResource(resource: any): string | null {
    // Baseado no requiredTool do recurso ou no nome/tipo
    if (resource.requiredTool) {
      return resource.requiredTool;
    }

    // Regras baseadas no nome/ID do recurso
    switch (resource.name) {
      case 'Madeira':
      case 'Bambu':
        return 'axe';
      case 'Pedra':
      case 'Ferro Fundido':
      case 'Cristais':
        return 'pickaxe';
      case 'Areia':
        return 'shovel';
      case 'Água Fresca':
        return 'bucket';
      case 'Peixe Pequeno':
      case 'Peixe Grande':
      case 'Salmão':
        return 'fishing_rod';
      case 'Coelho':
      case 'Veado':
      case 'Javali':
        return 'weapon';
      case 'Couro':
      case 'Carne':
      case 'Ossos':
      case 'Pelo':
        return 'knife';
      default:
        return null; // Não requer ferramenta específica
    }
  }

  /**
   * Verificar se o jogador tem a ferramenta necessária equipada
   */
  private async playerHasRequiredTool(
    player: any, 
    requiredTool: string, 
    allEquipment: any[]
  ): Promise<boolean> {
    switch (requiredTool) {
      case 'axe':
        if (!player.equippedTool) return false;
        const equippedAxe = allEquipment.find(eq => 
          eq.id === player.equippedTool && eq.toolType === 'axe'
        );
        return !!equippedAxe;

      case 'pickaxe':
        if (!player.equippedTool) return false;
        const equippedPickaxe = allEquipment.find(eq => 
          eq.id === player.equippedTool && eq.toolType === 'pickaxe'
        );
        return !!equippedPickaxe;

      case 'shovel':
        if (!player.equippedTool) return false;
        const equippedShovel = allEquipment.find(eq => 
          eq.id === player.equippedTool && eq.toolType === 'shovel'
        );
        return !!equippedShovel;

      case 'bucket':
        if (!player.equippedTool) return false;
        const equippedBucket = allEquipment.find(eq => 
          eq.id === player.equippedTool && (eq.toolType === 'bucket' || eq.toolType === 'bamboo_bottle')
        );
        return !!equippedBucket;

      case 'fishing_rod':
        if (!player.equippedTool) return false;
        const equippedRod = allEquipment.find(eq => 
          eq.id === player.equippedTool && eq.toolType === 'fishing_rod'
        );
        return !!equippedRod;

      case 'weapon':
        if (!player.equippedWeapon) return false;
        const equippedWeapon = allEquipment.find(eq => 
          eq.id === player.equippedWeapon && eq.category === 'weapons'
        );
        return !!equippedWeapon;

      case 'knife':
        // Faca pode estar equipada como ferramenta ou arma
        const knifeAsTool = player.equippedTool && allEquipment.find(eq => 
          eq.id === player.equippedTool && eq.toolType === 'knife'
        );
        const knifeAsWeapon = player.equippedWeapon && allEquipment.find(eq => 
          eq.id === player.equippedWeapon && eq.toolType === 'knife'
        );
        return !!(knifeAsTool || knifeAsWeapon);

      default:
        return true; // Ferramenta não reconhecida, permitir
    }
  }

  /**
   * Obter nome de exibição da ferramenta
   */
  private getToolDisplayName(toolType: string): string {
    switch (toolType) {
      case 'axe': return 'Machado';
      case 'pickaxe': return 'Picareta';
      case 'shovel': return 'Pá';
      case 'bucket': return 'Balde ou Garrafa de Bambu';
      case 'fishing_rod': return 'Vara de Pesca';
      case 'weapon': return 'Arma';
      case 'knife': return 'Faca';
      default: return toolType;
    }
  }

  private async checkPlayerTools(player: Player, requiredTools: string[]): Promise<boolean> {
    if (requiredTools.length === 0) return true;

    const allEquipment = await this.storage.getAllEquipment();
    
    for (const toolType of requiredTools) {
      if (toolType === 'weapon' && player.equippedWeapon) {
        const hasWeapon = allEquipment.find(eq => 
          eq.id === player.equippedWeapon && eq.category === 'weapons'
        );
        if (hasWeapon) return true;
      }
      if (toolType === 'tool' && player.equippedTool) {
        const hasTool = allEquipment.find(eq => 
          eq.id === player.equippedTool && eq.category === 'tools'
        );
        if (hasTool) return true;
      }
    }
    return false;
  }

  // ===================== GESTÃO DE EXPEDIÇÕES =====================

  async startExpedition(playerId: string, templateId: string): Promise<ActiveExpedition> {
    const validation = await this.validateExpeditionRequirements(playerId, templateId);
    if (!validation.valid) {
      throw new Error(`Requisitos não atendidos: ${validation.errors.join(', ')}`);
    }

    const template = this.getTemplateById(templateId)!;
    const player = await this.storage.getPlayer(playerId)!;

    // Calcular duração real da expedição
    const duration = Math.floor(
      Math.random() * (template.duration.max - template.duration.min) + template.duration.min
    );

    const startTime = Date.now();
    const expedition: ActiveExpedition = {
      id: uuidv4(),
      playerId,
      planId: templateId,
      startTime: startTime,
      estimatedEndTime: startTime + (duration * 60 * 1000),
      currentPhase: 'preparing',
      progress: 0,
      completedTargets: [],
      collectedResources: {},
      events: [],
      status: 'active'
    };

    // Aplicar custos imediatos
    await this.applyExpeditionCosts(playerId, template);

    // Salvar expedição
    await this.storage.createExpedition({
      playerId: expedition.playerId,
      biomeId: template.biomeId,
      selectedResources: Object.keys(template.rewards.guaranteed),
      selectedEquipment: []
    });

    console.log(`🚀 EXPEDITION: Started ${template.name} for player ${playerId}`);
    return expedition;
  }

  async updateExpeditionProgress(expeditionId: string): Promise<ActiveExpedition | null> {
    try {
      const expedition = await this.storage.getExpedition(expeditionId);
      if (!expedition || expedition.status !== 'in_progress') {
        console.log(`📈 EXPEDITION-PROGRESS: Expedition ${expeditionId} not found or not in progress`);
        return null;
      }

      const currentTime = Date.now();
      // Fix: startTime is stored in seconds, but we need milliseconds for calculation
      let startTimeMs: number;
      if (expedition.startTime) {
        // If startTime looks like it's in seconds (reasonable timestamp), convert to ms
        startTimeMs = expedition.startTime < 2000000000 ? expedition.startTime * 1000 : expedition.startTime;
      } else {
        startTimeMs = currentTime; // Fallback to current time
      }

      // Use expedition's duration if available, otherwise default to 30 minutes
      const expeditionDuration = expedition.duration || (30 * 60 * 1000);
      const elapsed = currentTime - startTimeMs;
      const progress = Math.min(100, Math.max(0, (elapsed / expeditionDuration) * 100));

      console.log(`📈 EXPEDITION-PROGRESS: ${expeditionId} - elapsed: ${elapsed}ms, duration: ${expeditionDuration}ms, progress: ${Math.round(progress)}%`);

      // Gradually collect resources as expedition progresses
      let collectedResources = expedition.collectedResources || {};

      if (progress > 50 && Object.keys(collectedResources).length === 0) {
        // Start collecting resources at 50% progress
        const templates = this.getTemplatesForBiome(expedition.biomeId);
        const template = templates.length > 0 ? templates[0] : this.getTemplateById('gathering-basic');
        if (template) {
          const rewards = this.calculateRewards(template);
          collectedResources = rewards;
          console.log(`📦 EXPEDITION-PROGRESS: Resources collected at ${Math.round(progress)}%:`, rewards);
        }
      }

      // Verificar por encontros de combate durante a expedição (apenas uma vez entre 25% e 75%)
      if (progress >= 25 && progress < 75 && !expedition.combatEncounterChecked) {
        try {
          const encounterId = await this.checkForCombatEncounter(expeditionId, expedition.playerId, expedition.biomeId);
          if (encounterId) {
            console.log(`⚔️ EXPEDITION-ENCOUNTER: Combat encounter ${encounterId} triggered at ${Math.round(progress)}% progress`);
            // Mark that we've checked for combat to avoid repeated checks
            await this.storage.updateExpedition(expeditionId, { 
              combatEncounterChecked: true 
            });
          }
        } catch (encounterError) {
          console.warn(`⚠️ EXPEDITION-PROGRESS: Combat encounter check failed:`, encounterError);
        }
      }

      // Se completou, processar recompensas
      if (progress >= 100) {
        return await this.completeExpedition(expeditionId);
      }

      // Atualizar progresso e recursos coletados
      await this.storage.updateExpedition(expeditionId, { 
        progress,
        collectedResources
      });

      return {
        id: expedition.id,
        playerId: expedition.playerId,
        planId: expedition.biomeId,
        startTime: startTimeMs,
        estimatedEndTime: startTimeMs + expeditionDuration,
        currentPhase: this.getPhaseFromProgress(progress),
        progress,
        completedTargets: [],
        collectedResources,
        events: [],
        status: 'active'
      };
    } catch (error) {
      console.error(`❌ EXPEDITION-PROGRESS: Error updating progress for ${expeditionId}:`, error);
      return null;
    }
  }

  private getPhaseFromProgress(progress: number): ActiveExpedition['currentPhase'] {
    if (progress < 20) return 'preparing';
    if (progress < 40) return 'traveling';
    if (progress < 80) return 'exploring';
    if (progress < 100) return 'returning';
    return 'completed';
  }

  private calculateCollectedResources(expedition: any): Record<string, number> {
    const baseResources = expedition.biome?.resources || [];
    const collectedResources: Record<string, number> = {};

    // Ensure baseResources is an array
    if (!Array.isArray(baseResources)) {
      console.warn(`Invalid resources array for expedition ${expedition.id}`);
      return collectedResources;
    }

    // Calculate resources based on progress
    const progressPercentage = Math.min(expedition.progress || 0, 100) / 100;

    baseResources.forEach(resource => {
      if (!resource || !resource.resourceId) {
        console.warn('Invalid resource in expedition:', resource);
        return;
      }

      const baseQuantity = resource.minQuantity || 1;
      const maxQuantity = resource.maxQuantity || baseQuantity;
      const averageQuantity = (baseQuantity + maxQuantity) / 2;

      // Apply progress multiplier
      const finalQuantity = Math.floor(averageQuantity * progressPercentage);

      if (finalQuantity > 0) {
        collectedResources[resource.resourceId] = finalQuantity;
      }
    });

    return collectedResources;
  }

  async completeExpedition(expeditionId: string): Promise<ActiveExpedition> {
    console.log(`🏁 EXPEDITION-COMPLETE: Starting completion for expedition ${expeditionId}`);

    const expedition = await this.storage.getExpedition(expeditionId);
    if (!expedition) throw new Error('Expedição não encontrada');

    console.log(`📋 EXPEDITION-COMPLETE: Found expedition for player ${expedition.playerId}`);

    // Get template by biomeId - use default template for the biome
    const templates = this.getTemplatesForBiome(expedition.biomeId);
    const template = templates.length > 0 ? templates[0] : null;
    if (!template) {
      // Fallback to basic gathering template
      const fallbackTemplate = this.getTemplateById('gathering-basic');
      if (!fallbackTemplate) throw new Error('Template de expedição não encontrado');
    }

    // Use the found template or fallback
    const activeTemplate = template || this.getTemplateById('gathering-basic')!;
    console.log(`📜 EXPEDITION-COMPLETE: Using template ${activeTemplate.name}`);

    // Calcular recompensas - sempre calcular novas recompensas se não existirem
    let rewards = expedition.collectedResources || {};

    // Se não há recursos coletados ou estão vazios, calcular novas recompensas
    if (!rewards || Object.keys(rewards).length === 0) {
      rewards = this.calculateRewards(activeTemplate);
      console.log(`🎲 EXPEDITION-COMPLETE: Calculated new rewards since none existed:`, rewards);
    } else {
      console.log(`📦 EXPEDITION-COMPLETE: Using existing collected resources:`, rewards);
    }

    // Verificar se há recursos válidos para aplicar
    if (!rewards || Object.keys(rewards).length === 0) {
      console.log(`⚠️ EXPEDITION-COMPLETE: No valid rewards to apply, creating basic rewards`);
      // Garantir que pelo menos alguns recursos básicos sejam dados
      rewards = {
        'res-fibra-001': 2, // Fibra
        'res-pedra-001': 1  // Pedra
      };
    }

    console.log(`🎁 EXPEDITION-COMPLETE: Final rewards to apply:`, rewards);

    // Aplicar recompensas ao jogador
    try {
      await this.applyRewards(expedition.playerId, rewards, activeTemplate.rewards.experience);
      console.log(`✅ EXPEDITION-COMPLETE: Rewards applied successfully`);
    } catch (error) {
      console.error(`❌ EXPEDITION-COMPLETE: Failed to apply rewards:`, error);
      throw error;
    }

    // Marcar expedição como completa
    await this.storage.updateExpedition(expeditionId, { 
      status: 'completed',
      progress: 100,
      collectedResources: rewards
    });

    console.log(`✅ EXPEDITION: Completed ${activeTemplate.name} for player ${expedition.playerId}`);
    console.log(`🎁 FINAL REWARDS: ${JSON.stringify(rewards)}`);

    const startTime = expedition.startTime ?? Date.now();
    const expeditionDuration = (30 * 60 * 1000); // Default expedition duration: 30 minutes

    return {
      id: expedition.id,
      playerId: expedition.playerId,
      planId: activeTemplate.id,
      startTime: startTime * 1000,
      estimatedEndTime: startTime * 1000 + expeditionDuration,
      currentPhase: 'completed',
      progress: 100,
      completedTargets: [],
      collectedResources: rewards,
      events: [],
      status: 'completed'
    };
  }

  private calculateRewards(template: ExpeditionTemplate): Record<string, number> {
    const rewards: Record<string, number> = { ...template.rewards.guaranteed };

    // Calcular recompensas possíveis
    for (const possible of template.rewards.possible) {
      if (Math.random() < possible.chance) {
        rewards[possible.resourceId] = (rewards[possible.resourceId] || 0) + possible.quantity;
      }
    }

    return rewards;
  }

  private async applyExpeditionCosts(playerId: string, template: ExpeditionTemplate): Promise<void> {
    const player = await this.storage.getPlayer(playerId);
    if (!player) return;

    // Aplicar custos de fome e sede
    const hungerCost = Math.floor(template.duration.max * 0.5);
    const thirstCost = Math.floor(template.duration.max * 0.4);

    await this.storage.updatePlayer(playerId, {
      hunger: Math.max(0, player.hunger - hungerCost),
      thirst: Math.max(0, player.thirst - thirstCost),
      fatigue: Math.min(100, player.fatigue + Math.floor(template.duration.max * 0.3))
    });
  }

  private async applyRewards(playerId: string, rewards: Record<string, number>, experience: number): Promise<void> {
    const player = await this.storage.getPlayer(playerId);
    if (!player) {
      console.error(`❌ EXPEDITION-REWARDS: Player ${playerId} not found`);
      return;
    }

    console.log(`💰 EXPEDITION-REWARDS: Applying rewards to player ${playerId}:`, rewards);

    // Verificar se há recursos para aplicar
    if (!rewards || Object.keys(rewards).length === 0) {
      console.log(`⚠️ EXPEDITION-REWARDS: No resources to apply for player ${playerId}`);
      return;
    }

    // Validate that all reward resources exist in the database
    const allResources = await this.storage.getAllResources();
    const validRewards: Record<string, number> = {};

    for (const [resourceId, quantity] of Object.entries(rewards)) {
      const resource = allResources.find(r => r.id === resourceId);
      if (resource && quantity > 0) {
        validRewards[resourceId] = quantity;
      } else {
        console.warn(`⚠️ EXPEDITION-REWARDS: Invalid resource ${resourceId} or quantity ${quantity}, skipping`);
      }
    }

    if (Object.keys(validRewards).length === 0) {
      console.log(`⚠️ EXPEDITION-REWARDS: No valid resources to apply after validation`);
      return;
    }

    console.log(`✅ EXPEDITION-REWARDS: Valid rewards to apply:`, validRewards);

    // Import GameService to use addResourceToPlayer method
    const { GameService } = await import('./game-service');
    const gameService = new GameService(this.storage);

    // Adicionar recursos ao inventário (tenta inventário primeiro, depois storage)
    for (const [resourceId, quantity] of Object.entries(validRewards)) {
      if (quantity <= 0) {
        console.log(`⚠️ EXPEDITION-REWARD: Skipping ${resourceId} with quantity ${quantity}`);
        continue;
      }

      console.log(`📦 EXPEDITION-REWARD: Adding ${quantity}x ${resourceId} to player inventory`);
      try {
        // Verificar se o recurso existe
        const resource = await this.storage.getResource(resourceId);
        if (!resource) {
          console.error(`❌ EXPEDITION-REWARD: Resource ${resourceId} not found in database`);
          continue;
        }

        await gameService.addResourceToPlayer(playerId, resourceId, quantity);
        console.log(`✅ EXPEDITION-REWARD: Successfully added ${quantity}x ${resourceId} (${resource.name}) to player`);
        
        // Force cache invalidation
        const { invalidatePlayerCache, invalidateInventoryCache, invalidateStorageCache } = await import('../cache/memory-cache');
        invalidatePlayerCache(playerId);
        invalidateInventoryCache(playerId);
        invalidateStorageCache(playerId);
      } catch (error) {
        console.error(`❌ EXPEDITION-REWARD: Failed to add ${quantity}x ${resourceId}:`, error);

        // Fallback: adicionar diretamente ao storage se falhar no inventário
        try {
          const storageItems = await this.storage.getPlayerStorage(playerId);
          const existingStorageItem = storageItems.find(item => 
            item.resourceId === resourceId && item.itemType === 'resource'
          );

          if (existingStorageItem) {
            await this.storage.updateStorageItem(existingStorageItem.id, {
              quantity: existingStorageItem.quantity + quantity
            });
          } else {
            await this.storage.addStorageItem({
              playerId,
              resourceId,
              quantity,
              itemType: 'resource'
            });
          }
          console.log(`✅ EXPEDITION-REWARD: Added ${quantity}x ${resourceId} to storage as fallback`);
          
          // Force cache invalidation for fallback too
          const { invalidatePlayerCache, invalidateInventoryCache, invalidateStorageCache } = await import('../cache/memory-cache');
          invalidatePlayerCache(playerId);
          invalidateInventoryCache(playerId);
          invalidateStorageCache(playerId);
        } catch (fallbackError) {
          console.error(`❌ EXPEDITION-REWARD: Fallback also failed for ${resourceId}:`, fallbackError);
        }
      }
    }

    // Adicionar experiência
    console.log(`⭐ EXPEDITION-REWARD: Adding ${experience} experience to player`);
    await this.storage.updatePlayer(playerId, {
      experience: player.experience + experience
    });

    console.log(`✅ EXPEDITION-REWARDS: All rewards applied successfully`);
  }

  // ===================== CONSULTAS =====================

  async getPlayerActiveExpeditions(playerId: string): Promise<ActiveExpedition[]> {
    try {
      const expeditions = await this.storage.getPlayerExpeditions(playerId);
      console.log(`🔍 EXPEDITION-SERVICE: Found ${expeditions.length} total expeditions for player ${playerId}`);

      const activeExpeditions = expeditions
        .filter(exp => exp.status === 'in_progress')
        .map(exp => {
          const currentTime = Date.now();
          // Fix: Handle startTime conversion properly
          let startTimeMs: number;
          if (exp.startTime) {
            // If startTime looks like it's in seconds (reasonable timestamp), convert to ms
            startTimeMs = exp.startTime < 2000000000 ? exp.startTime * 1000 : exp.startTime;
          } else {
            startTimeMs = currentTime; // Fallback to current time
          }

          // Use the expedition's duration if available, otherwise use default
          const expeditionDuration = exp.duration || (30 * 60 * 1000); // Default: 30 minutes
          const elapsed = currentTime - startTimeMs;
          const progress = Math.min(100, Math.max(0, (elapsed / expeditionDuration) * 100));

          console.log(`🎯 EXPEDITION-SERVICE: Processing expedition ${exp.id}:`, {
            originalStartTime: exp.startTime,
            startTimeMs,
            elapsed,
            duration: expeditionDuration,
            progress: Math.round(progress),
            collectedResources: exp.collectedResources
          });

          return {
            id: exp.id,
            playerId: exp.playerId,
            planId: exp.biomeId,
            startTime: startTimeMs,
            estimatedEndTime: startTimeMs + expeditionDuration,
            currentPhase: this.getPhaseFromProgress(progress),
            progress: progress,
            completedTargets: [],
            collectedResources: exp.collectedResources || {},
            events: [],
            status: 'active' as const
          };
        });

      console.log(`✅ EXPEDITION-SERVICE: Returning ${activeExpeditions.length} active expeditions`);
      return activeExpeditions;
    } catch (error) {
      console.error(`❌ EXPEDITION-SERVICE: Error getting active expeditions for player ${playerId}:`, error);
      return [];
    }
  }

  async getExpeditionHistory(playerId: string): Promise<ActiveExpedition[]> {
    const expeditions = await this.storage.getPlayerExpeditions(playerId);
    return expeditions
      .filter(exp => exp.status === 'completed')
      .map(exp => {
        const startTime = exp.startTime ?? Date.now();
        const expeditionDuration = (5 * 60 * 1000); // Default expedition duration: 5 minutes
        return {
          id: exp.id,
          playerId: exp.playerId,
          planId: exp.biomeId,
          startTime: startTime * 1000,
          estimatedEndTime: startTime * 1000 + expeditionDuration,
          currentPhase: 'completed' as const,
          progress: 100,
          completedTargets: [],
          collectedResources: exp.collectedResources,
          events: [],
          status: 'completed' as const
        };
      });
  }

  // ===================== COMBAT INTEGRATION =====================

  async checkForCombatEncounter(expeditionId: string, playerId: string, biomeId: string): Promise<string | null> {
    try {
      console.log(`🎯 EXPEDITION-COMBAT: Checking for encounter in ${biomeId} for player ${playerId}`);
      
      const encounter = await this.combatService.tryGenerateEncounter(expeditionId, playerId, biomeId);
      
      if (encounter) {
        console.log(`⚔️ EXPEDITION-COMBAT: Generated encounter ${encounter.id} with ${encounter.animalId}`);
        return encounter.id;
      }
      
      console.log(`🎯 EXPEDITION-COMBAT: No encounter generated this time`);
      return null;
    } catch (error) {
      console.error('❌ COMBAT-INTEGRATION: Error generating encounter:', error);
      return null;
    }
  }
}
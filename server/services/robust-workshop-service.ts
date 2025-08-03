// Serviço de Oficinas Robusto - Sistema Avançado de Processamento
import { storage } from '../storage';
import type { IStorage } from '../storage';
import type { 
  RobustWorkshopProcess, 
  WorkshopState, 
  ActiveWorkshopProcess,
  WorkshopProcessResult,
  MaterialQuality
} from '@shared/types/workshop-types';
import { 
  ALL_ROBUST_WORKSHOP_PROCESSES,
  getRobustProcessById,
  calculateProcessEfficiency,
  estimateProcessTime
} from '../data/robust-workshop-processes';
import { randomUUID } from 'crypto';

export class RobustWorkshopService {
  constructor(private storage: IStorage) {}

  // ===== GERENCIAMENTO DE ESTADO DA OFICINA =====
  
  async getWorkshopState(playerId: string, workshopType: string): Promise<WorkshopState | null> {
    const workshops = await this.storage.getPlayerData(playerId, 'workshops') || {};
    return workshops[workshopType] || null;
  }

  async initializeWorkshop(playerId: string, workshopType: string): Promise<WorkshopState> {
    const newWorkshop: WorkshopState = {
      id: randomUUID(),
      playerId,
      workshopType: workshopType as any,
      
      condition: {
        durability: 100,
        cleanliness: 100,
        organization: 100
      },
      
      energy: {
        current: 100,
        maximum: 100,
        regenerationRate: 5, // 5 pontos por minuto
        lastUpdate: new Date()
      },
      
      fuel: {
        resourceId: null,
        quantity: 0,
        burnTimeRemaining: 0
      },
      
      activeProcesses: [],
      
      upgrades: {
        efficiencyUpgrade: 0,
        speedUpgrade: 0,
        qualityUpgrade: 0,
        capacityUpgrade: 0
      },
      
      statistics: {
        totalProcessed: 0,
        successfulProcesses: 0,
        failedProcesses: 0,
        totalExperienceGained: 0,
        averageQuality: 0
      },
      
      lastUsed: new Date(),
      createdAt: new Date()
    };

    const workshops = await this.storage.getPlayerData(playerId, 'workshops') || {};
    workshops[workshopType] = newWorkshop;
    await this.storage.setPlayerData(playerId, 'workshops', workshops);

    return newWorkshop;
  }

  // ===== SISTEMA DE ENERGIA E MANUTENÇÃO =====
  
  async updateWorkshopEnergy(playerId: string, workshopType: string): Promise<void> {
    const workshop = await this.getWorkshopState(playerId, workshopType);
    if (!workshop) return;

    const now = new Date();
    const timeDiff = (now.getTime() - workshop.energy.lastUpdate.getTime()) / (1000 * 60); // Minutos
    
    // Regenerar energia
    workshop.energy.current = Math.min(
      workshop.energy.maximum,
      workshop.energy.current + (workshop.energy.regenerationRate * timeDiff)
    );
    
    workshop.energy.lastUpdate = now;

    const workshops = await this.storage.getPlayerData(playerId, 'workshops') || {};
    workshops[workshopType] = workshop;
    await this.storage.setPlayerData(playerId, 'workshops', workshops);
  }

  async performMaintenance(playerId: string, workshopType: string): Promise<boolean> {
    const workshop = await this.getWorkshopState(playerId, workshopType);
    if (!workshop) return false;

    const player = await this.storage.getPlayer(playerId);
    if (!player) return false;

    const maintenanceCost = 50 + (workshop.upgrades.efficiencyUpgrade * 20);
    
    if (player.coins < maintenanceCost) {
      return false;
    }

    // Consumir moedas
    await this.storage.updatePlayer(playerId, {
      coins: player.coins - maintenanceCost
    });

    // Restaurar condição da oficina
    workshop.condition.durability = Math.min(100, workshop.condition.durability + 30);
    workshop.condition.cleanliness = 100;
    workshop.condition.organization = Math.min(100, workshop.condition.organization + 20);

    const workshops = await this.storage.getPlayerData(playerId, 'workshops') || {};
    workshops[workshopType] = workshop;
    await this.storage.setPlayerData(playerId, 'workshops', workshops);

    return true;
  }

  // ===== SISTEMA DE PROCESSAMENTO AVANÇADO =====
  
  async canStartProcess(
    playerId: string, 
    processId: string, 
    quantity: number = 1
  ): Promise<{ canStart: boolean; reason?: string; requirements?: any }> {
    const process = getRobustProcessById(processId);
    if (!process) {
      return { canStart: false, reason: "Processo não encontrado" };
    }

    const player = await this.storage.getPlayer(playerId);
    if (!player) {
      return { canStart: false, reason: "Jogador não encontrado" };
    }

    // Verificar nível
    if (player.level < process.requiredLevel) {
      return { 
        canStart: false, 
        reason: `Nível mínimo necessário: ${process.requiredLevel}` 
      };
    }

    // Verificar recursos
    const inventory = await this.storage.getInventory(playerId);
    const storage = await this.storage.getStorage(playerId);
    const allItems = [...inventory, ...storage];

    const requiredInputs = [
      { resourceId: process.input.resourceId, quantity: process.input.quantity * quantity },
      ...(process.secondary ? [{ resourceId: process.secondary.resourceId, quantity: process.secondary.quantity * quantity }] : []),
      ...(process.fuel ? [{ resourceId: process.fuel.resourceId, quantity: process.fuel.quantity * quantity }] : [])
    ];

    for (const required of requiredInputs) {
      const available = allItems
        .filter(item => item.resourceId === required.resourceId)
        .reduce((sum, item) => sum + item.quantity, 0);
      
      if (available < required.quantity) {
        return {
          canStart: false,
          reason: `Recursos insuficientes: ${required.quantity}x necessário`,
          requirements: requiredInputs
        };
      }
    }

    // Verificar estado da oficina
    const workshop = await this.getWorkshopState(playerId, process.category);
    if (!workshop) {
      return { canStart: false, reason: "Oficina não inicializada" };
    }

    await this.updateWorkshopEnergy(playerId, process.category);

    if (workshop.energy.current < process.requirements.workshop.energyConsumption) {
      return { 
        canStart: false, 
        reason: `Energia insuficiente: ${process.requirements.workshop.energyConsumption} necessária` 
      };
    }

    // Verificar capacidade (processos simultâneos)
    const maxSimultaneous = 1 + workshop.upgrades.capacityUpgrade;
    if (workshop.activeProcesses.length >= maxSimultaneous) {
      return { 
        canStart: false, 
        reason: `Capacidade máxima atingida: ${maxSimultaneous} processos simultâneos` 
      };
    }

    return { canStart: true };
  }

  async startProcess(
    playerId: string, 
    processId: string, 
    quantity: number = 1
  ): Promise<{ success: boolean; processInstanceId?: string; message: string }> {
    const canStart = await this.canStartProcess(playerId, processId, quantity);
    if (!canStart.canStart) {
      return { success: false, message: canStart.reason || "Não é possível iniciar o processo" };
    }

    const process = getRobustProcessById(processId);
    if (!process) {
      return { success: false, message: "Processo não encontrado" };
    }

    const player = await this.storage.getPlayer(playerId);
    if (!player) {
      return { success: false, message: "Jogador não encontrado" };
    }

    try {
      // Consumir recursos
      await this.consumeProcessResources(playerId, process, quantity);

      // Calcular eficiência e tempo
      const toolQuality = await this.getPlayerToolQuality(playerId, process.requirements.tools);
      const materialQuality = await this.getMaterialQuality(playerId, process.input.resourceId);
      
      const efficiency = calculateProcessEfficiency(process, player.level, toolQuality, materialQuality);
      const estimatedTime = estimateProcessTime(process, efficiency);

      // Criar processo ativo
      const activeProcess: ActiveWorkshopProcess = {
        id: randomUUID(),
        processId: process.id,
        playerId,
        workshopId: `${playerId}-${process.category}`,
        
        status: "running",
        progress: 0,
        
        startTime: new Date(),
        estimatedCompletionTime: new Date(Date.now() + estimatedTime * 60 * 1000),
        
        inputsUsed: [
          { resourceId: process.input.resourceId, quantity: process.input.quantity * quantity, quality: materialQuality }
        ],
        
        fuelUsed: process.fuel ? {
          resourceId: process.fuel.resourceId,
          quantity: process.fuel.quantity * quantity
        } : { resourceId: "", quantity: 0 },
        
        expectedOutputs: [{
          resourceId: process.outputs.primary.resourceId,
          estimatedQuantity: Math.floor(process.outputs.primary.baseQuantity * quantity * efficiency / 100),
          qualityPrediction: this.predictOutputQuality(materialQuality, efficiency)
        }],
        
        modifiers: {
          efficiencyBonus: efficiency - process.efficiency.baseEfficiency,
          qualityBonus: this.calculateQualityBonus(toolQuality, materialQuality),
          speedBonus: 0,
          failureReduction: Math.max(0, player.level - process.requiredLevel) * 2
        },
        
        environmentalConditions: {
          weather: "clear", // TODO: Implementar sistema de clima
          timeOfDay: this.getCurrentTimeOfDay(),
          season: this.getCurrentSeason()
        },
        
        batchNumber: quantity,
        errors: []
      };

      // Adicionar à oficina
      const workshop = await this.getWorkshopState(playerId, process.category);
      if (workshop) {
        workshop.activeProcesses.push(activeProcess);
        workshop.energy.current -= process.requirements.workshop.energyConsumption;
        
        const workshops = await this.storage.getPlayerData(playerId, 'workshops') || {};
        workshops[process.category] = workshop;
        await this.storage.setPlayerData(playerId, 'workshops', workshops);
      }

      return { 
        success: true, 
        processInstanceId: activeProcess.id,
        message: `Processo iniciado com sucesso! Tempo estimado: ${estimatedTime} minutos`
      };

    } catch (error) {
      console.error("Erro ao iniciar processo:", error);
      return { success: false, message: "Erro interno ao iniciar processo" };
    }
  }

  // ===== PROCESSAMENTO E CONCLUSÃO =====
  
  async checkProcessCompletion(playerId: string): Promise<WorkshopProcessResult[]> {
    const results: WorkshopProcessResult[] = [];
    const workshops = await this.storage.getPlayerData(playerId, 'workshops') || {};

    for (const [workshopType, workshop] of Object.entries(workshops)) {
      if (!workshop.activeProcesses) continue;

      const now = new Date();
      const completedProcesses: ActiveWorkshopProcess[] = [];

      for (const activeProcess of workshop.activeProcesses) {
        if (now >= activeProcess.estimatedCompletionTime && activeProcess.status === "running") {
          const result = await this.completeProcess(playerId, activeProcess);
          results.push(result);
          completedProcesses.push(activeProcess);
        }
      }

      // Remover processos concluídos
      workshop.activeProcesses = workshop.activeProcesses.filter(
        p => !completedProcesses.find(cp => cp.id === p.id)
      );

      workshops[workshopType] = workshop;
    }

    if (results.length > 0) {
      await this.storage.setPlayerData(playerId, 'workshops', workshops);
    }

    return results;
  }

  private async completeProcess(
    playerId: string, 
    activeProcess: ActiveWorkshopProcess
  ): Promise<WorkshopProcessResult> {
    const process = getRobustProcessById(activeProcess.processId);
    if (!process) {
      throw new Error("Processo não encontrado");
    }

    const now = new Date();
    const actualTime = (now.getTime() - activeProcess.startTime.getTime()) / (1000 * 60);
    
    // Determinar sucesso baseado em chance de falha
    const player = await this.storage.getPlayer(playerId);
    const failureChance = Math.max(0, process.requirements.skill.failureChance - activeProcess.modifiers.failureReduction);
    const success = Math.random() * 100 > failureChance;

    const result: WorkshopProcessResult = {
      success,
      processId: process.id,
      workshopId: activeProcess.workshopId,
      
      outputs: [],
      waste: [],
      
      statistics: {
        actualProcessingTime: actualTime,
        efficiencyAchieved: activeProcess.modifiers.efficiencyBonus + process.efficiency.baseEfficiency,
        qualityAchieved: activeProcess.expectedOutputs[0]?.qualityPrediction || "media",
        experienceGained: success ? process.requirements.skill.experienceGained : Math.floor(process.requirements.skill.experienceGained * 0.3),
        skillLevelIncrease: false
      },
      
      workshopEffects: {
        durabilityLoss: 2 + Math.floor(Math.random() * 3),
        energyConsumed: process.requirements.workshop.energyConsumption,
        cleanlinessLoss: 5 + Math.floor(Math.random() * 5),
        toolDamage: process.requirements.tools.map(tool => ({
          equipmentId: tool.equipmentId,
          durabilityLoss: tool.durabilityLoss
        }))
      },
      
      specialEvents: [],
      timestamp: now
    };

    if (success) {
      // Produzir outputs principais
      const primaryOutput = {
        resourceId: process.outputs.primary.resourceId,
        quantity: Math.floor(
          process.outputs.primary.baseQuantity * 
          activeProcess.batchNumber * 
          (result.statistics.efficiencyAchieved / 100) *
          process.outputs.primary.qualityMultiplier
        ),
        quality: result.statistics.qualityAchieved,
        bonusQuantity: 0
      };

      // Verificar critical success
      if (Math.random() < 0.05) { // 5% chance
        primaryOutput.bonusQuantity = Math.ceil(primaryOutput.quantity * 0.5);
        result.specialEvents.push({
          type: "critical_success",
          description: "Sucesso crítico! Produção aumentada em 50%!",
          rewards: [{
            resourceId: process.outputs.primary.resourceId,
            quantity: primaryOutput.bonusQuantity
          }]
        });
      }

      result.outputs.push(primaryOutput);

      // Adicionar ao inventário/armazém
      await this.addProcessOutputsToPlayer(playerId, result.outputs);

      // Produzir output secundário se houver
      if (process.outputs.secondary && Math.random() * 100 < process.outputs.secondary.chance) {
        const secondaryOutput = {
          resourceId: process.outputs.secondary.resourceId,
          quantity: process.outputs.secondary.baseQuantity * activeProcess.batchNumber,
          quality: "media",
          bonusQuantity: 0
        };
        
        result.outputs.push(secondaryOutput);
        await this.addProcessOutputsToPlayer(playerId, [secondaryOutput]);
      }

      // Atualizar estatísticas da oficina
      const workshop = await this.getWorkshopState(playerId, process.category);
      if (workshop) {
        workshop.statistics.successfulProcesses++;
        workshop.statistics.totalExperienceGained += result.statistics.experienceGained;
      }
    } else {
      // Processo falhou - apenas pequena quantidade de waste
      result.specialEvents.push({
        type: "critical_failure",
        description: "O processo falhou! Recursos desperdiçados."
      });

      const workshop = await this.getWorkshopState(playerId, process.category);
      if (workshop) {
        workshop.statistics.failedProcesses++;
      }
    }

    // Produzir waste sempre
    if (process.outputs.waste) {
      const waste = {
        resourceId: process.outputs.waste.resourceId,
        quantity: process.outputs.waste.quantity * activeProcess.batchNumber
      };
      result.waste.push(waste);
    }

    // Dar experiência ao player e processar level up
    if (player && result.statistics.experienceGained > 0) {
      const newExp = player.experience + result.statistics.experienceGained;
      const newLevel = Math.floor(Math.sqrt(newExp / 100)) + 1;
      
      await this.storage.updatePlayer(playerId, {
        experience: newExp,
        level: Math.max(player.level, newLevel)
      });

      if (newLevel > player.level) {
        result.statistics.skillLevelIncrease = true;
        result.specialEvents.push({
          type: "discovery",
          description: `Parabéns! Você subiu para o nível ${newLevel}!`
        });

        // Award skill points for level up
        const { SkillService } = await import('./skill-service');
        const skillService = new SkillService(this.storage);
        await skillService.handlePlayerLevelUp(playerId, newLevel);
        
        console.log(`🎉 LEVEL-UP: Player ${playerId} leveled up to ${newLevel} from crafting!`);
      }

      // Award skill experience for crafting
      const { SkillService } = await import('./skill-service');
      const skillService = new SkillService(this.storage);
      await skillService.addSkillExperience(playerId, 'skill-12345678-1234-1234-1234-123456789abc', result.statistics.experienceGained);
    }

    return result;
  }

  // ===== FUNÇÕES AUXILIARES =====
  
  private async consumeProcessResources(playerId: string, process: RobustWorkshopProcess, quantity: number): Promise<void> {
    const resourcesToConsume = [
      { resourceId: process.input.resourceId, quantity: process.input.quantity * quantity },
      ...(process.secondary ? [{ resourceId: process.secondary.resourceId, quantity: process.secondary.quantity * quantity }] : []),
      ...(process.fuel ? [{ resourceId: process.fuel.resourceId, quantity: process.fuel.quantity * quantity }] : [])
    ];

    for (const resource of resourcesToConsume) {
      let remaining = resource.quantity;
      
      // Primeiro tentar consumir do inventário
      const inventoryItems = await this.storage.getInventory(playerId);
      for (const item of inventoryItems) {
        if (item.resourceId === resource.resourceId && remaining > 0) {
          const toConsume = Math.min(item.quantity, remaining);
          await this.storage.updateInventoryItem(item.id, {
            quantity: item.quantity - toConsume
          });
          remaining -= toConsume;
        }
      }

      // Se ainda falta, consumir do armazém
      if (remaining > 0) {
        const storageItems = await this.storage.getStorage(playerId);
        for (const item of storageItems) {
          if (item.resourceId === resource.resourceId && remaining > 0) {
            const toConsume = Math.min(item.quantity, remaining);
            await this.storage.updateStorageItem(item.id, {
              quantity: item.quantity - toConsume
            });
            remaining -= toConsume;
          }
        }
      }
    }
  }

  private async addProcessOutputsToPlayer(playerId: string, outputs: any[]): Promise<void> {
    for (const output of outputs) {
      // Tentar adicionar ao armazém primeiro
      const storageItems = await this.storage.getStorage(playerId);
      const existingStorageItem = storageItems.find(item => item.resourceId === output.resourceId);

      if (existingStorageItem) {
        await this.storage.updateStorageItem(existingStorageItem.id, {
          quantity: existingStorageItem.quantity + output.quantity + (output.bonusQuantity || 0)
        });
      } else {
        await this.storage.addStorageItem({
          playerId,
          resourceId: output.resourceId,
          quantity: output.quantity + (output.bonusQuantity || 0),
          itemType: 'resource'
        });
      }
    }
  }

  private async getPlayerToolQuality(playerId: string, requiredTools: any[]): Promise<number> {
    const equipment = await this.storage.getEquipment(playerId);
    let totalQuality = 0;
    let toolCount = 0;

    for (const tool of requiredTools) {
      const equippedTool = equipment.find(eq => eq.equipmentId === tool.equipmentId);
      if (equippedTool?.attributes?.durability) {
        totalQuality += equippedTool.attributes.durability;
        toolCount++;
      }
    }

    return toolCount > 0 ? totalQuality / toolCount : 50; // Default 50% se não tiver ferramentas
  }

  private async getMaterialQuality(playerId: string, resourceId: string): Promise<string> {
    // TODO: Implementar sistema de qualidade de materiais
    return "media"; // Por enquanto retorna qualidade média
  }

  private predictOutputQuality(inputQuality: string, efficiency: number): string {
    const qualityLevels = ["baixa", "media", "alta", "superior", "lendaria"];
    const currentIndex = qualityLevels.indexOf(inputQuality);
    
    let newIndex = currentIndex;
    if (efficiency > 120) newIndex = Math.min(qualityLevels.length - 1, currentIndex + 2);
    else if (efficiency > 100) newIndex = Math.min(qualityLevels.length - 1, currentIndex + 1);
    else if (efficiency < 70) newIndex = Math.max(0, currentIndex - 1);
    
    return qualityLevels[newIndex];
  }

  private calculateQualityBonus(toolQuality: number, materialQuality: string): number {
    const qualityMultipliers = { "baixa": 0.8, "media": 1.0, "alta": 1.2, "superior": 1.5, "lendaria": 2.0 };
    const materialMultiplier = qualityMultipliers[materialQuality as keyof typeof qualityMultipliers] || 1.0;
    
    return (toolQuality / 100) * materialMultiplier * 20; // Até 20% de bonus
  }

  private getCurrentTimeOfDay(): string {
    const hour = new Date().getHours();
    if (hour < 6) return "night";
    if (hour < 12) return "morning";
    if (hour < 18) return "afternoon";
    return "evening";
  }

  private getCurrentSeason(): string {
    const month = new Date().getMonth();
    if (month < 3) return "winter";
    if (month < 6) return "spring"; 
    if (month < 9) return "summer";
    return "fall";
  }
}
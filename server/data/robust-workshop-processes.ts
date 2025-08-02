// Sistema de Oficinas Robusto - Processos Avançados e Realistas
import { RESOURCE_IDS, EQUIPMENT_IDS } from '@shared/constants/game-ids';
import type { RobustWorkshopProcess } from '@shared/types/workshop-types';

// ===== BANCADA - ARTESANATO AVANÇADO =====
export const ROBUST_BANCADA_PROCESSES: RobustWorkshopProcess[] = [
  {
    id: "proc-bancada-corda-premium-001",
    name: "Corda Reforçada Premium",
    emoji: "🪢",
    description: "Produção de corda de alta qualidade usando fibras selecionadas e técnicas avançadas de trançamento",
    category: "bancada",
    requiredLevel: 3,
    
    input: {
      resourceId: RESOURCE_IDS.FIBRA,
      quantity: 8,
      quality: "media"
    },
    secondary: {
      resourceId: RESOURCE_IDS.RESINA,
      quantity: 2,
      optional: false
    },
    
    outputs: {
      primary: {
        resourceId: RESOURCE_IDS.CORDA_RESIS,
        baseQuantity: 3,
        qualityMultiplier: 1.5
      },
      secondary: {
        resourceId: RESOURCE_IDS.FIBRA_PROCESSADA,
        baseQuantity: 1,
        chance: 25
      },
      waste: {
        resourceId: RESOURCE_IDS.DESPERDICIO_FIBRA,
        quantity: 1
      }
    },
    
    requirements: {
      tools: [{
        equipmentId: EQUIPMENT_IDS.AGULHA_ARTESANAL,
        durabilityLoss: 3,
        efficiencyBonus: 20
      }],
      workshop: {
        type: "bancada",
        energyConsumption: 15,
        maintenanceRequired: true
      },
      skill: {
        minimumLevel: 3,
        experienceGained: 25,
        failureChance: 8
      }
    },
    
    timing: {
      baseProcessingTime: 12, // 12 minutos
      batchSize: 2,
      cooldownTime: 5
    },
    
    efficiency: {
      baseEfficiency: 75,
      toolBonus: 20,
      skillBonus: 5,
      materialQualityImpact: 30
    },
    
    costs: {
      setupCost: 50,
      maintenanceCost: 10,
      energyCost: 8
    },
    
    environmental: {
      weatherImpact: false,
      timeOfDayBonus: "afternoon",
      seasonalBonus: "any"
    },
    
    tags: ["artesanato", "premium", "corda", "resistente"]
  },

  {
    id: "proc-bancada-ferramenta-improvisada-001", 
    name: "Kit de Ferramentas Improvisadas",
    emoji: "🔧",
    description: "Criação de ferramentas básicas usando materiais encontrados e técnicas primitivas",
    category: "bancada",
    requiredLevel: 1,
    
    input: {
      resourceId: RESOURCE_IDS.PEDRA,
      quantity: 5,
      quality: "baixa"
    },
    secondary: {
      resourceId: RESOURCE_IDS.MADEIRA,
      quantity: 3,
      optional: false
    },
    fuel: {
      resourceId: RESOURCE_IDS.GRAVETO,
      quantity: 4,
      burnTime: 20
    },
    
    outputs: {
      primary: {
        resourceId: RESOURCE_IDS.MACHADO_IMPROVISADO,
        baseQuantity: 1,
        qualityMultiplier: 1.0
      },
      secondary: {
        resourceId: RESOURCE_IDS.PICARETA_IMPROVISADA,
        baseQuantity: 1,
        chance: 60
      },
      waste: {
        resourceId: RESOURCE_IDS.LASCAS_PEDRA,
        quantity: 2
      }
    },
    
    requirements: {
      tools: [{
        equipmentId: EQUIPMENT_IDS.PEDRA_AFIADA,
        durabilityLoss: 5,
        efficiencyBonus: 15
      }],
      workshop: {
        type: "bancada",
        energyConsumption: 20,
        maintenanceRequired: false
      },
      skill: {
        minimumLevel: 1,
        experienceGained: 35,
        failureChance: 15
      }
    },
    
    timing: {
      baseProcessingTime: 25,
      batchSize: 1,
      cooldownTime: 10
    },
    
    efficiency: {
      baseEfficiency: 65,
      toolBonus: 15,
      skillBonus: 10,
      materialQualityImpact: 20
    },
    
    costs: {
      setupCost: 25,
      maintenanceCost: 5,
      energyCost: 12
    },
    
    environmental: {
      weatherImpact: true,
      timeOfDayBonus: "morning",
      seasonalBonus: "any"
    },
    
    tags: ["primitivo", "ferramentas", "sobrevivencia", "basico"]
  }
];

// ===== FORJA - METALURGIA AVANÇADA =====
export const ROBUST_FORJA_PROCESSES: RobustWorkshopProcess[] = [
  {
    id: "proc-forja-ferro-purificado-001",
    name: "Purificação de Ferro Avançada",
    emoji: "⚒️",
    description: "Processo complexo de purificação do ferro bruto usando técnicas de fundição e refinamento",
    category: "forja",
    requiredLevel: 5,
    
    input: {
      resourceId: RESOURCE_IDS.FERRO_BRUTO,
      quantity: 10,
      quality: "baixa"
    },
    secondary: {
      resourceId: RESOURCE_IDS.CARVAO,
      quantity: 6,
      optional: false
    },
    fuel: {
      resourceId: RESOURCE_IDS.CARVAO_VEGETAL,
      quantity: 8,
      burnTime: 45
    },
    
    outputs: {
      primary: {
        resourceId: RESOURCE_IDS.FERRO_PURO,
        baseQuantity: 6,
        qualityMultiplier: 2.0
      },
      secondary: {
        resourceId: RESOURCE_IDS.ESCORIA_FERRO,
        baseQuantity: 2,
        chance: 90
      },
      waste: {
        resourceId: RESOURCE_IDS.CINZAS_FORJA,
        quantity: 3
      }
    },
    
    requirements: {
      tools: [{
        equipmentId: EQUIPMENT_IDS.FOLE_FORJA,
        durabilityLoss: 8,
        efficiencyBonus: 35
      }, {
        equipmentId: EQUIPMENT_IDS.CADINHO_FERRO,
        durabilityLoss: 12,
        efficiencyBonus: 25
      }],
      workshop: {
        type: "forja",
        energyConsumption: 45,
        maintenanceRequired: true
      },
      skill: {
        minimumLevel: 5,
        experienceGained: 65,
        failureChance: 12
      }
    },
    
    timing: {
      baseProcessingTime: 35,
      batchSize: 1,
      cooldownTime: 20
    },
    
    efficiency: {
      baseEfficiency: 70,
      toolBonus: 35,
      skillBonus: 15,
      materialQualityImpact: 40
    },
    
    costs: {
      setupCost: 200,
      maintenanceCost: 35,
      energyCost: 30
    },
    
    environmental: {
      weatherImpact: true,
      timeOfDayBonus: "morning",
      seasonalBonus: "winter"
    },
    
    tags: ["metalurgia", "purificacao", "ferro", "avancado", "energia-intensiva"]
  }
];

// ===== FOGUEIRA - PROCESSAMENTO DE ALIMENTOS =====
export const ROBUST_FOGUEIRA_PROCESSES: RobustWorkshopProcess[] = [
  {
    id: "proc-fogueira-carne-defumada-001",
    name: "Defumação de Carne Premium",
    emoji: "🥩",
    description: "Processo lento de defumação que preserva a carne e adiciona sabores únicos",
    category: "fogueira",
    requiredLevel: 3,
    
    input: {
      resourceId: RESOURCE_IDS.CARNE_CRUA,
      quantity: 6,
      quality: "media"
    },
    secondary: {
      resourceId: RESOURCE_IDS.SAL_MARINHO,
      quantity: 2,
      optional: true
    },
    fuel: {
      resourceId: RESOURCE_IDS.MADEIRA_AROMATICA,
      quantity: 12,
      burnTime: 60
    },
    
    outputs: {
      primary: {
        resourceId: RESOURCE_IDS.CARNE_DEFUMADA,
        baseQuantity: 4,
        qualityMultiplier: 1.8
      },
      secondary: {
        resourceId: RESOURCE_IDS.GORDURA_PROCESSADA,
        baseQuantity: 1,
        chance: 40
      },
      waste: {
        resourceId: RESOURCE_IDS.CINZAS_MADEIRA,
        quantity: 2
      }
    },
    
    requirements: {
      tools: [{
        equipmentId: EQUIPMENT_IDS.GRELHA_DEFUMACAO,
        durabilityLoss: 4,
        efficiencyBonus: 30
      }],
      workshop: {
        type: "fogueira",
        energyConsumption: 25,
        maintenanceRequired: false
      },
      skill: {
        minimumLevel: 3,
        experienceGained: 45,
        failureChance: 10
      }
    },
    
    timing: {
      baseProcessingTime: 45, // Processo longo e lento
      batchSize: 3,
      cooldownTime: 15
    },
    
    efficiency: {
      baseEfficiency: 80,
      toolBonus: 30,
      skillBonus: 12,
      materialQualityImpact: 35
    },
    
    costs: {
      setupCost: 75,
      maintenanceCost: 15,
      energyCost: 18
    },
    
    environmental: {
      weatherImpact: true,
      timeOfDayBonus: "evening",
      seasonalBonus: "fall"
    },
    
    tags: ["culinaria", "preservacao", "defumacao", "premium", "lento"]
  }
];

// ===== AGREGAÇÃO DE TODOS OS PROCESSOS =====
export const ALL_ROBUST_WORKSHOP_PROCESSES: RobustWorkshopProcess[] = [
  ...ROBUST_BANCADA_PROCESSES,
  ...ROBUST_FORJA_PROCESSES,
  ...ROBUST_FOGUEIRA_PROCESSES
];

// ===== FUNÇÕES UTILITÁRIAS =====
export function getRobustProcessById(id: string): RobustWorkshopProcess | undefined {
  return ALL_ROBUST_WORKSHOP_PROCESSES.find(process => process.id === id);
}

export function getRobustProcessesByCategory(category: string): RobustWorkshopProcess[] {
  return ALL_ROBUST_WORKSHOP_PROCESSES.filter(process => process.category === category);
}

export function getProcessesForLevel(level: number): RobustWorkshopProcess[] {
  return ALL_ROBUST_WORKSHOP_PROCESSES.filter(process => process.requiredLevel <= level);
}

export function calculateProcessEfficiency(
  process: RobustWorkshopProcess,
  playerLevel: number,
  toolQuality: number,
  materialQuality: string
): number {
  let efficiency = process.efficiency.baseEfficiency;
  
  // Bonus de ferramenta
  efficiency += process.efficiency.toolBonus * (toolQuality / 100);
  
  // Bonus de habilidade
  const skillBonus = Math.min(playerLevel - process.requiredLevel, 10) * process.efficiency.skillBonus;
  efficiency += skillBonus;
  
  // Impacto da qualidade dos materiais
  const qualityMultipliers = {
    "baixa": 0.7,
    "media": 1.0,
    "alta": 1.3,
    "superior": 1.6,
    "lendaria": 2.0
  };
  
  const qualityMultiplier = qualityMultipliers[materialQuality as keyof typeof qualityMultipliers] || 1.0;
  efficiency *= qualityMultiplier;
  
  return Math.min(efficiency, 150); // Cap em 150%
}

export function estimateProcessTime(
  process: RobustWorkshopProcess,
  efficiency: number,
  environmentalBonuses: number = 0
): number {
  const baseTime = process.timing.baseProcessingTime;
  const efficiencyModifier = 100 / Math.max(efficiency, 50); // Mínimo 50% eficiência
  const environmentalModifier = 1 - (environmentalBonuses / 100);
  
  return Math.ceil(baseTime * efficiencyModifier * environmentalModifier);
}
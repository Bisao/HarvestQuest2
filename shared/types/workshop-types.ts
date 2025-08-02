// Sistema de Oficinas Robusto - Tipos Avançados

// Definição da interface principal do processo
export interface RobustWorkshopProcess {
  id: string;
  name: string;
  emoji: string;
  description: string;
  category: "bancada" | "madeira" | "pedras" | "forja" | "fogueira";
  requiredLevel: number;
  
  // === INPUTS COMPLEXOS ===
  input: {
    resourceId: string;
    quantity: number;
    quality?: "baixa" | "media" | "alta" | "superior"; // Qualidade afeta resultado
  };
  secondary?: {
    resourceId: string;
    quantity: number;
    optional?: boolean; // Se opcional, melhora resultado mas não é obrigatório
  };
  fuel?: {
    resourceId: string;
    quantity: number;
    burnTime: number; // Tempo que o combustível dura em minutos
  };
  
  // === OUTPUTS DINÂMICOS ===
  outputs: {
    primary: {
      resourceId: string;
      baseQuantity: number;
      qualityMultiplier: number; // Multiplica baseado na qualidade dos inputs
    };
    secondary?: {
      resourceId: string;
      baseQuantity: number;
      chance: number; // 0-100% chance de produzir
    };
    waste?: {
      resourceId: string;
      quantity: number; // Desperdício sempre produzido
    };
  };
  
  // === REQUISITOS REALISTAS ===
  requirements: {
    tools: {
      equipmentId: string;
      durabilityLoss: number; // Durabilidade perdida por processo
      efficiencyBonus: number; // Bonus de eficiência com a ferramenta
    }[];
    workshop: {
      type: string;
      energyConsumption: number; // Energia necessária
      maintenanceRequired: boolean;
    };
    skill: {
      minimumLevel: number;
      experienceGained: number;
      failureChance: number; // Chance de falha baseada no nível
    };
  };
  
  // === ASPECTOS TEMPORAIS ===
  timing: {
    baseProcessingTime: number; // Tempo base em minutos
    batchSize: number; // Quantos podem ser processados simultaneamente
    cooldownTime: number; // Tempo antes de poder usar novamente
  };
  
  // === EFICIÊNCIA E QUALIDADE ===
  efficiency: {
    baseEfficiency: number; // 0-100%
    toolBonus: number; // Bonus com ferramentas
    skillBonus: number; // Bonus com nível alto
    materialQualityImpact: number; // Impacto da qualidade dos materiais
  };
  
  // === ECONOMIA ===
  costs: {
    setupCost: number; // Custo inicial para configurar
    maintenanceCost: number; // Custo de manutenção por uso
    energyCost: number; // Custo de energia
  };
  
  // === CONDICOES AMBIENTAIS ===
  environmental: {
    weatherImpact: boolean; // Se é afetado pelo clima
    timeOfDayBonus: "morning" | "afternoon" | "evening" | "night" | "any";
    seasonalBonus: "spring" | "summer" | "fall" | "winter" | "any";
  };
  
  tags: string[];
}

// Estado da Oficina
export interface WorkshopState {
  id: string;
  playerId: string;
  workshopType: "bancada" | "madeira" | "pedras" | "forja" | "fogueira";
  
  // === ESTADO FÍSICO ===
  condition: {
    durability: number; // 0-100%
    cleanliness: number; // 0-100%
    organization: number; // 0-100%
  };
  
  // === RECURSOS ===
  energy: {
    current: number;
    maximum: number;
    regenerationRate: number; // Por minuto
    lastUpdate: Date;
  };
  
  fuel: {
    resourceId: string | null;
    quantity: number;
    burnTimeRemaining: number; // Minutos restantes
  };
  
  // === PROCESSOS ATIVOS ===
  activeProcesses: ActiveWorkshopProcess[];
  
  // === UPGRADES ===
  upgrades: {
    efficiencyUpgrade: number; // 0-5 níveis
    speedUpgrade: number; // 0-5 níveis
    qualityUpgrade: number; // 0-5 níveis
    capacityUpgrade: number; // 0-5 níveis
  };
  
  // === HISTÓRICO ===
  statistics: {
    totalProcessed: number;
    successfulProcesses: number;
    failedProcesses: number;
    totalExperienceGained: number;
    averageQuality: number;
  };
  
  lastUsed: Date;
  createdAt: Date;
}

// Processo Ativo na Oficina
export interface ActiveWorkshopProcess {
  id: string;
  processId: string;
  playerId: string;
  workshopId: string;
  
  // === ESTADO DO PROCESSO ===
  status: "preparing" | "running" | "paused" | "completed" | "failed" | "cancelled";
  progress: number; // 0-100%
  
  // === TIMING ===
  startTime: Date;
  estimatedCompletionTime: Date;
  actualCompletionTime?: Date;
  
  // === RECURSOS UTILIZADOS ===
  inputsUsed: {
    resourceId: string;
    quantity: number;
    quality: string;
  }[];
  
  fuelUsed: {
    resourceId: string;
    quantity: number;
  };
  
  // === RESULTADOS ESPERADOS ===
  expectedOutputs: {
    resourceId: string;
    estimatedQuantity: number;
    qualityPrediction: string;
  }[];
  
  // === MODIFICADORES APLICADOS ===
  modifiers: {
    efficiencyBonus: number;
    qualityBonus: number;
    speedBonus: number;
    failureReduction: number;
  };
  
  // === CONDIÇÕES ===
  environmentalConditions: {
    weather: string;
    timeOfDay: string;
    season: string;
  };
  
  batchNumber: number; // Para processos em lote
  errors: string[]; // Erros ocorridos durante o processo
}

// Upgrade de Oficina
export interface WorkshopUpgrade {
  id: string;
  name: string;
  description: string;
  workshopType: "bancada" | "madeira" | "pedras" | "forja" | "fogueira";
  upgradeType: "efficiency" | "speed" | "quality" | "capacity";
  
  // === REQUISITOS ===
  requirements: {
    level: number;
    resources: {
      resourceId: string;
      quantity: number;
    }[];
    cost: number;
    prerequisiteUpgrades: string[]; // IDs de upgrades necessários
  };
  
  // === BENEFÍCIOS ===
  benefits: {
    efficiencyIncrease?: number; // Porcentagem
    speedIncrease?: number; // Porcentagem
    qualityIncrease?: number; // Porcentagem
    capacityIncrease?: number; // Slots adicionais
    energyReduction?: number; // Redução no consumo de energia
    failureReduction?: number; // Redução na chance de falha
  };
  
  // === CUSTOS DE MANUTENÇÃO ===
  maintenanceCost: {
    dailyCost: number;
    resourceCost: {
      resourceId: string;
      quantity: number;
    }[];
  };
  
  maxLevel: number;
  currentLevel: number;
}

// Sistema de Qualidade de Materiais
export interface MaterialQuality {
  resourceId: string;
  quality: "baixa" | "media" | "alta" | "superior" | "lendaria";
  
  // === MODIFICADORES ===
  modifiers: {
    efficiencyMultiplier: number; // 0.5 - 2.0
    qualityBonus: number; // 0 - 50%
    yieldBonus: number; // 0 - 100% quantidade extra
    processingTimeModifier: number; // 0.5 - 1.5
  };
  
  // === APARÊNCIA ===
  visualIndicators: {
    emoji: string;
    color: string;
    sparkles: boolean;
  };
  
  // === RARIDADE ===
  rarity: {
    spawnChance: number; // 0-100%
    biomeModifiers: Record<string, number>; // Modificadores por bioma
    toolRequirements: string[]; // Ferramentas necessárias para obter
  };
  
  // === VALOR ===
  economicImpact: {
    sellPriceMultiplier: number;
    buyPriceMultiplier: number;
    tradingValueBonus: number;
  };
}

// Resultado do Processo
export interface WorkshopProcessResult {
  success: boolean;
  processId: string;
  workshopId: string;
  
  // === RESULTADOS ===
  outputs: {
    resourceId: string;
    quantity: number;
    quality: string;
    bonusQuantity: number;
  }[];
  
  waste: {
    resourceId: string;
    quantity: number;
  }[];
  
  // === ESTATÍSTICAS ===
  statistics: {
    actualProcessingTime: number; // Minutos
    efficiencyAchieved: number; // Porcentagem
    qualityAchieved: string;
    experienceGained: number;
    skillLevelIncrease: boolean;
  };
  
  // === EFEITOS NA OFICINA ===
  workshopEffects: {
    durabilityLoss: number;
    energyConsumed: number;
    cleanlinessLoss: number;
    toolDamage: {
      equipmentId: string;
      durabilityLoss: number;
    }[];
  };
  
  // === EVENTOS ESPECIAIS ===
  specialEvents: {
    type: "critical_success" | "critical_failure" | "discovery" | "breakthrough";
    description: string;
    rewards?: {
      resourceId: string;
      quantity: number;
    }[];
  }[];
  
  timestamp: Date;
}
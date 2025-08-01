import { Router } from "express";
import { successResponse, errorResponse } from "../utils/response-helpers";
import { storage } from "../storage";
import type { Player } from "@shared/types";
import { RESOURCE_IDS, EQUIPMENT_IDS } from "@shared/constants/game-ids";

const router = Router();

// Interface para processos de oficina
interface WorkshopProcess {
  id: string;
  name: string;
  emoji: string;
  description: string;
  category: "bancada" | "madeira" | "pedras" | "forja" | "fogueira";
  requiredLevel: number;
  input: {
    resourceId: string;
    quantity: number;
  };
  fuel?: {
    resourceId: string;
    quantity: number;
  };
  output: {
    resourceId: string;
    quantity: number;
  };
  processingTime: number;
  efficiency: number;
  experienceGained: number;
}

// Definir processos de oficina no servidor (deve corresponder ao frontend)
const WORKSHOP_PROCESSES: WorkshopProcess[] = [
  // MATERIAIS BÁSICOS
  {
    id: "proc-barbante-001",
    name: "Barbante",
    emoji: "🧵",
    description: "Processe fibras em barbante útil",
    category: "bancada",
    requiredLevel: 1,
    input: { resourceId: RESOURCE_IDS.FIBRA, quantity: 5 },
    output: { resourceId: RESOURCE_IDS.BARBANTE, quantity: 1 },
    processingTime: 5,
    efficiency: 100,
    experienceGained: 10
  },

  // FERRAMENTAS BÁSICAS
  {
    id: "proc-machado-001",
    name: "Machado",
    emoji: "🪓",
    description: "Crie um machado para cortar madeira",
    category: "madeira",
    requiredLevel: 1,
    input: { resourceId: RESOURCE_IDS.PEDRAS_SOLTAS, quantity: 1 },
    fuel: { resourceId: RESOURCE_IDS.BARBANTE, quantity: 2 },
    output: { resourceId: EQUIPMENT_IDS.MACHADO, quantity: 1 },
    processingTime: 30,
    efficiency: 95,
    experienceGained: 25
  },
  {
    id: "proc-picareta-001",
    name: "Picareta", 
    emoji: "⛏️",
    description: "Forje uma picareta para mineração",
    category: "forja",
    requiredLevel: 1,
    input: { resourceId: RESOURCE_IDS.PEDRAS_SOLTAS, quantity: 2 },
    fuel: { resourceId: RESOURCE_IDS.BARBANTE, quantity: 2 },
    output: { resourceId: EQUIPMENT_IDS.PICARETA, quantity: 1 },
    processingTime: 35,
    efficiency: 95,
    experienceGained: 30
  },
  {
    id: "proc-faca-001",
    name: "Faca",
    emoji: "🗡️",
    description: "Forje uma faca para caça e corte",
    category: "forja",
    requiredLevel: 1,
    input: { resourceId: RESOURCE_IDS.PEDRAS_SOLTAS, quantity: 1 },
    fuel: { resourceId: RESOURCE_IDS.BARBANTE, quantity: 1 },
    output: { resourceId: EQUIPMENT_IDS.FACA, quantity: 1 },
    processingTime: 25,
    efficiency: 95,
    experienceGained: 20
  },
  {
    id: "proc-vara-pesca-001",
    name: "Vara de Pesca",
    emoji: "🎣",
    description: "Monte uma vara de pesca",
    category: "madeira",
    requiredLevel: 3,
    input: { resourceId: RESOURCE_IDS.GRAVETOS, quantity: 3 },
    fuel: { resourceId: RESOURCE_IDS.FIBRA, quantity: 2 },
    output: { resourceId: EQUIPMENT_IDS.VARA_PESCA, quantity: 1 },
    processingTime: 45,
    efficiency: 85,
    experienceGained: 40
  },
  {
    id: "proc-foice-001",
    name: "Foice",
    emoji: "🔪",
    description: "Forje uma foice para colheita",
    category: "forja",
    requiredLevel: 2,
    input: { resourceId: RESOURCE_IDS.PEDRA, quantity: 1 },
    fuel: { resourceId: RESOURCE_IDS.BARBANTE, quantity: 2 },
    output: { resourceId: EQUIPMENT_IDS.FOICE, quantity: 1 },
    processingTime: 40,
    efficiency: 90,
    experienceGained: 35
  },

  // ARMAS
  {
    id: "proc-arco-flecha-001",
    name: "Arco e Flecha",
    emoji: "🏹",
    description: "Crie um arco para caça à distância",
    category: "madeira",
    requiredLevel: 5,
    input: { resourceId: RESOURCE_IDS.GRAVETOS, quantity: 2 },
    fuel: { resourceId: RESOURCE_IDS.BARBANTE, quantity: 2 },
    output: { resourceId: EQUIPMENT_IDS.ARCO_FLECHA, quantity: 1 },
    processingTime: 60,
    efficiency: 70,
    experienceGained: 60
  },
  {
    id: "proc-lanca-001",
    name: "Lança",
    emoji: "🔱",
    description: "Forje uma lança para combate",
    category: "forja",
    requiredLevel: 4,
    input: { resourceId: RESOURCE_IDS.GRAVETOS, quantity: 2 },
    fuel: { resourceId: RESOURCE_IDS.BARBANTE, quantity: 4 },
    output: { resourceId: EQUIPMENT_IDS.LANCA, quantity: 1 },
    processingTime: 50,
    efficiency: 80,
    experienceGained: 50
  },

  // UTENSÍLIOS
  {
    id: "proc-balde-madeira-001",
    name: "Balde de Madeira",
    emoji: "🪣",
    description: "Construa um balde para transportar água",
    category: "madeira",
    requiredLevel: 2,
    input: { resourceId: RESOURCE_IDS.MADEIRA, quantity: 1 },
    fuel: { resourceId: RESOURCE_IDS.BARBANTE, quantity: 2 },
    output: { resourceId: EQUIPMENT_IDS.BALDE_MADEIRA, quantity: 1 },
    processingTime: 40,
    efficiency: 90,
    experienceGained: 35
  },
  {
    id: "proc-garrafa-bambu-001",
    name: "Garrafa de Bambu",
    emoji: "🧴",
    description: "Crie uma garrafa para armazenar líquidos",
    category: "madeira",
    requiredLevel: 3,
    input: { resourceId: RESOURCE_IDS.BAMBU, quantity: 1 },
    fuel: { resourceId: RESOURCE_IDS.BARBANTE, quantity: 1 },
    output: { resourceId: EQUIPMENT_IDS.GARRAFA_BAMBU, quantity: 1 },
    processingTime: 35,
    efficiency: 90,
    experienceGained: 30
  },
  {
    id: "proc-mochila-001",
    name: "Mochila",
    emoji: "🎒",
    description: "Costure uma mochila para mais capacidade",
    category: "bancada",
    requiredLevel: 5,
    input: { resourceId: RESOURCE_IDS.COURO, quantity: 2 },
    fuel: { resourceId: RESOURCE_IDS.BARBANTE, quantity: 5 },
    output: { resourceId: EQUIPMENT_IDS.MOCHILA, quantity: 1 },
    processingTime: 60,
    efficiency: 80,
    experienceGained: 50
  },
  {
    id: "proc-corda-001",
    name: "Corda",
    emoji: "🪢",
    description: "Trança barbante em corda resistente",
    category: "bancada",
    requiredLevel: 2,
    input: { resourceId: RESOURCE_IDS.BARBANTE, quantity: 3 },
    output: { resourceId: EQUIPMENT_IDS.CORDA, quantity: 1 },
    processingTime: 20,
    efficiency: 90,
    experienceGained: 15
  },

  // MADEIRA
  {
    id: "proc-madeira-refinada-001",
    name: "Madeira Refinada",
    emoji: "🪵",
    description: "Processe gravetos em madeira de qualidade",
    category: "madeira",
    requiredLevel: 2,
    input: { resourceId: RESOURCE_IDS.GRAVETOS, quantity: 5 },
    output: { resourceId: RESOURCE_IDS.MADEIRA, quantity: 2 },
    processingTime: 30,
    efficiency: 80,
    experienceGained: 15
  },
  {
    id: "proc-bambu-processado-001", 
    name: "Bambu Processado",
    emoji: "🎋",
    description: "Refine bambu bruto em material de construção",
    category: "madeira",
    requiredLevel: 3,
    input: { resourceId: RESOURCE_IDS.BAMBU, quantity: 3 },
    output: { resourceId: RESOURCE_IDS.MADEIRA, quantity: 1 },
    processingTime: 25,
    efficiency: 90,
    experienceGained: 12
  },

  // PEDRAS
  {
    id: "proc-pedras-lapidadas-001",
    name: "Pedras Lapidadas", 
    emoji: "🪨",
    description: "Transforme pedras pequenas em pedras de qualidade",
    category: "pedras",
    requiredLevel: 2,
    input: { resourceId: RESOURCE_IDS.PEDRAS_SOLTAS, quantity: 8 },
    output: { resourceId: RESOURCE_IDS.PEDRA, quantity: 3 },
    processingTime: 40,
    efficiency: 75,
    experienceGained: 20
  },
  {
    id: "proc-argila-refinada-001",
    name: "Argila Refinada",
    emoji: "🧱", 
    description: "Purifique argila bruta para uso em cerâmica",
    category: "pedras",
    requiredLevel: 4,
    input: { resourceId: RESOURCE_IDS.ARGILA, quantity: 4 },
    output: { resourceId: RESOURCE_IDS.ARGILA, quantity: 6 },
    processingTime: 45,
    efficiency: 120,
    experienceGained: 25
  },

  // BANCADA (CRIAÇÃO DE ITENS)
  {
    id: "proc-fibra-processada-001",
    name: "Fibra Processada",
    emoji: "🌾",
    description: "Processe fibras brutas em material têxtil",
    category: "bancada",
    requiredLevel: 1,
    input: { resourceId: RESOURCE_IDS.FIBRA, quantity: 10 },
    output: { resourceId: RESOURCE_IDS.BARBANTE, quantity: 4 },
    processingTime: 20,
    efficiency: 80,
    experienceGained: 10
  },
  {
    id: "proc-couro-tratado-001",
    name: "Couro Tratado",
    emoji: "🦫",
    description: "Trate couro bruto para melhor qualidade",
    category: "bancada", 
    requiredLevel: 5,
    input: { resourceId: RESOURCE_IDS.COURO, quantity: 2 },
    output: { resourceId: RESOURCE_IDS.COURO, quantity: 3 },
    processingTime: 60,
    efficiency: 110,
    experienceGained: 30
  },

  // FORJA (METAIS)
  {
    id: "proc-ferro-fundido-001",
    name: "Fundição de Ferro",
    emoji: "🔩",
    description: "Processe pedras em ferro fundido usando madeira como combustível",
    category: "forja",
    requiredLevel: 6,
    input: { resourceId: RESOURCE_IDS.PEDRA, quantity: 6 },
    fuel: { resourceId: RESOURCE_IDS.MADEIRA, quantity: 2 },
    output: { resourceId: RESOURCE_IDS.FERRO_FUNDIDO, quantity: 2 },
    processingTime: 90,
    efficiency: 70,
    experienceGained: 40
  },
  {
    id: "proc-ferro-avancado-001",
    name: "Ferro Refinado",
    emoji: "⚙️",
    description: "Refine ferro fundido em ferro de alta qualidade",
    category: "forja",
    requiredLevel: 8,
    input: { resourceId: RESOURCE_IDS.FERRO_FUNDIDO, quantity: 3 },
    fuel: { resourceId: RESOURCE_IDS.MADEIRA, quantity: 3 },
    output: { resourceId: RESOURCE_IDS.FERRO_FUNDIDO, quantity: 4 },
    processingTime: 120,
    efficiency: 85,
    experienceGained: 60
  },

  // FOGUEIRA (ALIMENTOS)
  {
    id: "proc-conservas-001",
    name: "Conservas de Carne",
    emoji: "🥩",
    description: "Processe carne fresca usando gravetos como combustível",
    category: "fogueira",
    requiredLevel: 4,
    input: { resourceId: RESOURCE_IDS.CARNE, quantity: 3 },
    fuel: { resourceId: RESOURCE_IDS.GRAVETOS, quantity: 2 },
    output: { resourceId: RESOURCE_IDS.CARNE_ASSADA, quantity: 4 },
    processingTime: 50,
    efficiency: 105,
    experienceGained: 22
  },
  {
    id: "proc-cogumelos-secos-001",
    name: "Cogumelos Secos",
    emoji: "🍄",
    description: "Desidrate cogumelos usando gravetos como combustível",
    category: "fogueira",
    requiredLevel: 3,
    input: { resourceId: RESOURCE_IDS.COGUMELOS, quantity: 5 },
    fuel: { resourceId: RESOURCE_IDS.GRAVETOS, quantity: 1 },
    output: { resourceId: RESOURCE_IDS.COGUMELOS_ASSADOS, quantity: 6 },
    processingTime: 35,
    efficiency: 115,
    experienceGained: 18
  },
  {
    id: "proc-peixe-defumado-001",
    name: "Peixe Defumado",
    emoji: "🐟",
    description: "Defume peixe para preservação prolongada",
    category: "fogueira",
    requiredLevel: 5,
    input: { resourceId: RESOURCE_IDS.PEIXE_PEQUENO, quantity: 2 },
    fuel: { resourceId: RESOURCE_IDS.MADEIRA, quantity: 1 },
    output: { resourceId: RESOURCE_IDS.PEIXE_GRELHADO, quantity: 3 },
    processingTime: 45,
    efficiency: 110,
    experienceGained: 25
  }
];

// POST /api/v2/workshop/process - Processar item em oficina
router.post('/process', async (req, res, next) => {
  try {
    const { playerId, processId, quantity = 1 } = req.body;

    if (!playerId || !processId) {
      return errorResponse(res, "playerId e processId são obrigatórios", 400);
    }

    // Storage já importado globalmente
    
    // Buscar player
    const player = await storage.getPlayer(playerId);
    if (!player) {
      return errorResponse(res, "Player não encontrado", 404);
    }

    // Buscar processo
    const process = WORKSHOP_PROCESSES.find(p => p.id === processId);
    if (!process) {
      return errorResponse(res, "Processo de oficina não encontrado", 404);
    }

    // Verificar nível
    if (player.level < process.requiredLevel) {
      return errorResponse(res, `Nível ${process.requiredLevel} necessário`, 400);
    }

    // Verificar recursos disponíveis
    const storageItems = await storage.getStorageItemsByPlayer(playerId);
    
    const inputResource = storageItems.find((item: any) => item.resourceId === process.input.resourceId);
    const requiredInput = process.input.quantity * quantity;
    
    if (!inputResource || inputResource.quantity < requiredInput) {
      return errorResponse(res, `Recursos insuficientes: ${process.input.quantity * quantity} necessário`, 400);
    }

    // Verificar combustível se necessário
    if (process.fuel) {
      const fuelResource = storageItems.find((item: any) => item.resourceId === process.fuel!.resourceId);
      const requiredFuel = process.fuel.quantity * quantity;
      
      if (!fuelResource || fuelResource.quantity < requiredFuel) {
        return errorResponse(res, `Combustível insuficiente: ${process.fuel.quantity * quantity} necessário`, 400);
      }
    }

    // Consumir recursos
    await storage.removeFromStorage(playerId, process.input.resourceId, requiredInput);
    
    if (process.fuel) {
      await storage.removeFromStorage(playerId, process.fuel.resourceId, process.fuel.quantity * quantity);
    }

    // Produzir item
    const outputQuantity = process.output.quantity * quantity;
    
    // Verificar se output é equipamento ou recurso
    const isEquipment = process.output.resourceId.startsWith('eq-');
    
    if (isEquipment) {
      // Adicionar ao inventário como equipamento
      for (let i = 0; i < outputQuantity; i++) {
        await storage.addToInventory(playerId, process.output.resourceId, 1);
      }
    } else {
      // Adicionar ao storage como recurso
      await storage.addToStorage(playerId, process.output.resourceId, outputQuantity);
    }

    // Dar experiência
    const expGained = process.experienceGained * quantity;
    const updatedPlayer = await storage.updatePlayer(playerId, {
      experience: player.experience + expGained
    });

    // Verificar level up
    const newLevel = Math.floor(updatedPlayer.experience / 100) + 1;
    if (newLevel > updatedPlayer.level) {
      await storage.updatePlayer(playerId, { level: newLevel });
    }

    successResponse(res, {
      process: {
        id: process.id,
        name: process.name
      },
      quantity,
      output: {
        resourceId: process.output.resourceId,
        quantity: outputQuantity
      },
      experienceGained: expGained,
      destination: isEquipment ? 'inventory' : 'storage'
    }, `${quantity}x ${process.name} processado com sucesso!`);

  } catch (error) {
    next(error);
  }
});

// GET /api/v2/workshop/processes - Listar todos os processos disponíveis
router.get('/processes', (req, res) => {
  successResponse(res, WORKSHOP_PROCESSES, "Processos de oficina carregados com sucesso");
});

export default router;
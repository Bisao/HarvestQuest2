import { Router } from "express";
import { successResponse, errorResponse } from "../utils/response-helpers";
import { storage } from "../storage";
import type { Player } from "@shared/types";
import { RESOURCE_IDS } from "@shared/constants/game-ids";

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
  secondary?: {
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

// SISTEMA ROBUSTO DE OFICINAS - Sincronizado com frontend
const WORKSHOP_PROCESSES: WorkshopProcess[] = [
  // ===== BANCADA - MATERIAIS BÁSICOS =====
  {
    id: "proc-barbante-001",
    name: "Barbante",
    emoji: "🧵",
    description: "Processar fibras em barbante resistente",
    category: "bancada",
    requiredLevel: 1,
    input: { resourceId: RESOURCE_IDS.FIBRA, quantity: 4 },
    output: { resourceId: RESOURCE_IDS.BARBANTE, quantity: 3 },
    processingTime: 15,
    efficiency: 85,
    experienceGained: 5
  },
  {
    id: "proc-corda-001",
    name: "Corda",
    emoji: "🪢",
    description: "Trançar barbante em corda resistente",
    category: "bancada",
    requiredLevel: 2,
    input: { resourceId: RESOURCE_IDS.BARBANTE, quantity: 6 },
    output: { resourceId: RESOURCE_IDS.BARBANTE, quantity: 2 }, // Placeholder - precisa criar RESOURCE_IDS.CORDA
    processingTime: 25,
    efficiency: 80,
    experienceGained: 12
  },

  // ===== MADEIRA - PROCESSAMENTO DE MADEIRA =====
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

  // ===== PEDRAS - PROCESSAMENTO DE MINERAIS =====
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

  // ===== FORJA - METAIS =====
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

  // ===== FOGUEIRA - ALIMENTOS =====
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

    console.log(`🏭 Workshop process request: ${processId} x${quantity} for player ${playerId}`);

    if (!playerId || !processId) {
      return errorResponse(res, "playerId e processId são obrigatórios", 400);
    }

    if (quantity < 1 || quantity > 100) {
      return errorResponse(res, "Quantidade deve estar entre 1 e 100", 400);
    }

    // Buscar player
    const player = await storage.getPlayer(playerId);
    if (!player) {
      return errorResponse(res, "Player não encontrado", 404);
    }

    // Buscar processo
    const process = WORKSHOP_PROCESSES.find(p => p.id === processId);
    if (!process) {
      console.error(`🏭 Processo não encontrado: ${processId}`);
      return errorResponse(res, "Processo de oficina não encontrado", 404);
    }

    console.log(`🏭 Found process: ${process.name}`);

    // Verificar nível
    if (player.level < process.requiredLevel) {
      return errorResponse(res, `Nível ${process.requiredLevel} necessário`, 400);
    }

    // Verificar recursos disponíveis
    const storageItems = await storage.getStorageItemsByPlayer(playerId);

    // Verificar input principal
    const inputResource = storageItems.find((item: any) => item.resourceId === process.input.resourceId);
    const requiredInput = process.input.quantity * quantity;

    if (!inputResource || inputResource.quantity < requiredInput) {
      console.log(`🏭 Recursos insuficientes: ${process.input.resourceId} - Necessário: ${requiredInput}, Disponível: ${inputResource?.quantity || 0}`);
      return errorResponse(res, `Recursos insuficientes: ${requiredInput} ${process.input.resourceId} necessário`, 400);
    }

    // Verificar secondary se existir
    if (process.secondary) {
      const secondaryResource = storageItems.find((item: any) => item.resourceId === process.secondary!.resourceId);
      const requiredSecondary = process.secondary.quantity * quantity;

      if (!secondaryResource || secondaryResource.quantity < requiredSecondary) {
        console.log(`🏭 Material secundário insuficiente: ${process.secondary.resourceId}`);
        return errorResponse(res, `Material secundário insuficiente: ${requiredSecondary} ${process.secondary.resourceId} necessário`, 400);
      }
    }

    // Verificar combustível se necessário
    if (process.fuel) {
      const fuelResource = storageItems.find((item: any) => item.resourceId === process.fuel!.resourceId);
      const requiredFuel = process.fuel.quantity * quantity;

      if (!fuelResource || fuelResource.quantity < requiredFuel) {
        console.log(`🏭 Combustível insuficiente: ${process.fuel.resourceId}`);
        return errorResponse(res, `Combustível insuficiente: ${requiredFuel} ${process.fuel.resourceId} necessário`, 400);
      }
    }

    console.log(`🏭 All resources available, starting process...`);

    // Consumir recursos
    await storage.removeFromStorage(playerId, process.input.resourceId, requiredInput);
    console.log(`🏭 Consumed input: ${requiredInput} ${process.input.resourceId}`);

    if (process.secondary) {
      await storage.removeFromStorage(playerId, process.secondary.resourceId, process.secondary.quantity * quantity);
      console.log(`🏭 Consumed secondary: ${process.secondary.quantity * quantity} ${process.secondary.resourceId}`);
    }

    if (process.fuel) {
      await storage.removeFromStorage(playerId, process.fuel.resourceId, process.fuel.quantity * quantity);
      console.log(`🏭 Consumed fuel: ${process.fuel.quantity * quantity} ${process.fuel.resourceId}`);
    }

    // Produzir item
    const outputQuantity = process.output.quantity * quantity;

    // Adicionar ao storage como recurso
    await storage.addToStorage(playerId, process.output.resourceId, outputQuantity);
    console.log(`🏭 Produced: ${outputQuantity} ${process.output.resourceId}`);

    // Dar experiência
    const expGained = process.experienceGained * quantity;
    const updatedPlayer = await storage.updatePlayer(playerId, {
      experience: player.experience + expGained
    });

    // Verificar level up
    const newLevel = Math.floor(updatedPlayer.experience / 100) + 1;
    if (newLevel > updatedPlayer.level) {
      await storage.updatePlayer(playerId, { level: newLevel });
      console.log(`🏭 Player leveled up to ${newLevel}!`);
    }

    console.log(`🏭 Workshop process completed successfully`);

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
      levelUp: newLevel > player.level ? newLevel : null
    }, `${quantity}x ${process.name} processado com sucesso!`);

  } catch (error) {
    console.error("🏭 Workshop process error:", error);
    next(error);
  }
});

// GET /api/v2/workshop/processes - Listar todos os processos disponíveis
router.get('/processes', (req, res) => {
  console.log(`🏭 Listing ${WORKSHOP_PROCESSES.length} workshop processes`);
  successResponse(res, WORKSHOP_PROCESSES, "Processos de oficina carregados com sucesso");
});

// GET /api/v2/workshop/processes/:category - Listar processos por categoria
router.get('/processes/:category', (req, res) => {
  const { category } = req.params;
  const categoryProcesses = WORKSHOP_PROCESSES.filter(p => p.category === category);

  successResponse(res, categoryProcesses, `Processos da categoria ${category} carregados com sucesso`);
});

export default router;
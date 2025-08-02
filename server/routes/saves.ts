// Routes for save game management
import { Router } from "express";
import { storage } from "../storage";
import { authenticateToken, optionalAuth, type AuthenticatedRequest } from "../middleware/jwt-auth";
import { z } from "zod";

const createPlayerSchema = z.object({
  username: z.string().min(2).max(20).regex(/^[a-zA-Z0-9_]+$/, "Nome deve conter apenas letras, números e underscores"),
});

export function createSaveRoutes() {
  const router = Router();
  // Get all players (saves)
  router.get("/", optionalAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const players = await storage.getAllPlayers();
      const saves = players.map(player => ({
        id: player.id,
        username: player.username,
        level: player.level,
        lastLogin: new Date().toISOString() // Mock last login for now
      }));

      res.json(saves);
    } catch (error) {
      console.error("Get saves error:", error);
      res.status(500).json({ 
        error: "Erro ao carregar jogadores",
        message: error instanceof Error ? error.message : "Erro interno" 
      });
    }
  });

  // Create new player
  router.post("/", optionalAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const { username } = createPlayerSchema.parse(req.body);

      // Check if username already exists
      const existingPlayer = await storage.getPlayerByUsername(username);
      if (existingPlayer) {
        return res.status(400).json({ 
          error: "Nome de usuário já existe",
          message: "Escolha um nome diferente" 
        });
      }

      const newPlayer = await storage.createPlayer({
        username: username.trim(),
        level: 1,
        experience: 0,
        hunger: 100,
        maxHunger: 100,
        thirst: 100,
        maxThirst: 100,
        coins: 100,
        inventoryWeight: 0,
        maxInventoryWeight: 50000,
        autoStorage: false,
        craftedItemsDestination: "storage",
        waterStorage: 0,
        maxWaterStorage: 500,
        waterTanks: 0,
        equippedHelmet: null,
        equippedChestplate: null,
        equippedLeggings: null,
        equippedBoots: null,
        equippedWeapon: null,
        equippedTool: null,
        autoCompleteQuests: true
      });

      console.log(`👤 New player created: ${newPlayer.username} (${newPlayer.id})`);
      res.status(201).json({
        id: newPlayer.id,
        username: newPlayer.username,
        level: newPlayer.level,
        lastLogin: new Date().toISOString()
      });
    } catch (error) {
      console.error("Create player error:", error);

      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: "Dados inválidos",
          message: error.errors[0]?.message || "Nome inválido",
          details: error.errors 
        });
      }

      res.status(500).json({ 
        error: "Erro ao criar jogador",
        message: error instanceof Error ? error.message : "Erro interno do servidor" 
      });
    }
  });

  // Delete player
  router.delete("/:playerId", optionalAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const { playerId } = req.params;

      const player = await storage.getPlayer(playerId);
      if (!player) {
        return res.status(404).json({ 
          error: "Jogador não encontrado",
          message: "O jogador que você está tentando excluir não existe" 
        });
      }

      await storage.deletePlayer(playerId);

      res.json({ 
        message: "Jogador excluído com sucesso",
        deletedPlayer: player.username 
      });
    } catch (error) {
      console.error("Delete player error:", error);
      res.status(500).json({ 
        error: "Erro ao excluir jogador",
        message: error instanceof Error ? error.message : "Erro interno do servidor" 
      });
    }
  });

  return router;
}

export default createSaveRoutes();
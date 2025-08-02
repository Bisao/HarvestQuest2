// Routes for save game management
import { Router } from "express";
import { storage } from "../storage";

const router = Router();

// Get all save slots (existing players)
router.get("/", async (req, res) => {
  try {
    const allPlayers = await storage.getAllPlayers();

    // Transform players to save slot format
    const saveSlots = allPlayers.map(player => ({
      id: player.id,
      username: player.username,
      level: player.level,
      experience: player.experience,
      lastPlayed: Date.now() // Current timestamp for now
    }));

    res.json(saveSlots);
  } catch (error) {
    console.error("Error fetching saves:", error);
    res.status(500).json({ message: "Falha ao buscar jogos salvos" });
  }
});

// Delete a save slot (player)
router.delete("/:playerId", async (req, res) => {
  try {
    const { playerId } = req.params;

    await storage.deletePlayer(playerId);

    res.json({ message: "Jogo deletado com sucesso" });
  } catch (error) {
    console.error("Error deleting save:", error);
    res.status(500).json({ message: "Falha ao deletar o jogo" });
  }
});

// Get saved games
router.get('/saves', async (req, res) => {
  try {
    const saves = await storage.getAllPlayers();

    const saveData = await Promise.all(saves.map(async (player) => {
      // Check if player has an active expedition
      let offlineExpeditionActive = false;
      try {
        const expeditions = await storage.getPlayerExpeditions(player.id);
        offlineExpeditionActive = expeditions.some(exp => exp.status === "in_progress");
      } catch (error) {
        console.log('Error checking expeditions for player:', player.id);
      }

      return {
        id: player.id,
        username: player.username,
        level: player.level,
        experience: player.experience,
        lastPlayed: player.lastOnlineTime || Date.now(),
        offlineExpeditionActive
      };
    }));

    res.json(saveData);
  } catch (error) {
    console.error('Error fetching saves:', error);
    res.status(500).json({ message: 'Failed to fetch saves' });
  }
});

export default router;
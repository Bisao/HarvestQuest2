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
      last_played: Date.now() // Current timestamp for now
    }));
    
    res.json(saveSlots);
  } catch (error) {
    console.error("Error fetching saves:", error);
    res.status(500).json({ message: "Falha ao buscar jogos salvos" });
  }
});

export default router;
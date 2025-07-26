// Routes for save game management
import { Router } from "express";
import { storage } from "../storage";

const router = Router();

// Get all save slots (existing players)
router.get("/", async (req, res) => {
  try {
    // This would be implemented when we add a getAllPlayers method
    // For now, return empty array as placeholder
    res.json([]);
  } catch (error) {
    console.error("Error fetching saves:", error);
    res.status(500).json({ message: "Falha ao buscar jogos salvos" });
  }
});

export default router;
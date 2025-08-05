import { Router } from 'express';
import { AIAssistantService } from '../services/ai-assistant-service';
import type { IStorage } from '../storage';

export function createAIAssistantRoutes(storage: IStorage): Router {
  const router = Router();
  const aiService = new AIAssistantService(storage);

  // Get strategy recommendations for a player
  router.get('/recommendations/:playerId', async (req, res) => {
    try {
      const { playerId } = req.params;
      
      const analysis = await aiService.getStrategyRecommendations(playerId);
      
      res.json({
        success: true,
        data: analysis,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('AI recommendations error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get recommendations'
      });
    }
  });

  return router;
}
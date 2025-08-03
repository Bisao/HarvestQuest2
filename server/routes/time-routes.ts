
import { Router } from 'express';
import { TimeService } from '../services/time-service';
import type { IStorage } from '../storage';

export function createTimeRoutes(storage: IStorage): Router {
  const router = Router();
  const timeService = TimeService.getInstance();

  // GET /api/time/current - Obter tempo atual do jogo
  router.get('/current', (req, res) => {
    try {
      const gameTime = timeService.getCurrentGameTime();
      res.json(gameTime);
    } catch (error) {
      console.error('Error getting current time:', error);
      res.status(500).json({ error: 'Failed to get current time' });
    }
  });

  // GET /api/time/temperature - Obter temperatura para jogador/bioma
  router.get('/temperature', async (req, res) => {
    try {
      const { playerId, biome } = req.query;
      
      if (!biome) {
        return res.status(400).json({ error: 'Biome is required' });
      }

      const gameTime = timeService.getCurrentGameTime();
      let player = null;

      if (playerId) {
        player = await storage.getPlayer(playerId as string);
      }

      const temperature = timeService.calculateTemperature(
        biome as string,
        gameTime,
        player
      );

      res.json(temperature);
    } catch (error) {
      console.error('Error calculating temperature:', error);
      res.status(500).json({ error: 'Failed to calculate temperature' });
    }
  });

  return router;
}

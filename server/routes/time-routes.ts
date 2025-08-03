import { Router } from 'express';
import { TimeService } from '../services/time-service';
import type { IStorage } from '../storage';

export function createTimeRoutes(storage: IStorage): Router {
  const router = Router();
  const timeService = TimeService.getInstance();

  // Rota para obter tempo atual do jogo
  router.get('/current', (req, res) => {
    try {
      console.log('🕐 TIME-ROUTE: Fetching current game time...');
      const gameTime = timeService.getCurrentGameTime();
      console.log('🕐 TIME-ROUTE: Game time fetched:', gameTime);
      res.json(gameTime);
    } catch (error) {
      console.error('❌ TIME-ROUTE: Erro ao obter tempo do jogo:', error);
      res.status(500).json({ error: 'Failed to get game time' });
    }
  });

  // Rota para obter temperatura
  router.get('/temperature', (req, res) => {
    try {
      const { playerId, biome = 'forest' } = req.query;

      console.log('🌡️ TEMPERATURE-ROUTE: Request params:', { playerId, biome });

      if (!playerId) {
        console.log('❌ TEMPERATURE-ROUTE: Player ID is required');
        return res.status(400).json({ error: 'Player ID is required' });
      }

      const gameTime = timeService.getCurrentGameTime();

      // Buscar dados do jogador se necessário
      // Por agora, calcular temperatura apenas com bioma
      const temperature = timeService.calculateTemperature(biome as string, gameTime);

      console.log('🌡️ TEMPERATURE-ROUTE: Temperature calculated:', temperature);
      res.json(temperature);
    } catch (error) {
      console.error('❌ TEMPERATURE-ROUTE: Erro ao obter temperatura:', error);
      res.status(500).json({ error: 'Failed to get temperature' });
    }
  });

  return router;
}
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
      
      // Garantir que retornamos JSON válido
      res.setHeader('Content-Type', 'application/json');
      return res.json(gameTime);
    } catch (error) {
      console.error('❌ TIME-ROUTE: Erro ao obter tempo do jogo:', error);
      res.setHeader('Content-Type', 'application/json');
      return res.status(500).json({ error: 'Failed to get game time' });
    }
  });

  // Rota para obter temperatura
  router.get('/temperature', (req, res) => {
    try {
      const { playerId, biome = 'forest' } = req.query;

      console.log('🌡️ TEMPERATURE-ROUTE: Request params:', { playerId, biome });

      if (!playerId) {
        console.log('❌ TEMPERATURE-ROUTE: Player ID is required');
        res.setHeader('Content-Type', 'application/json');
        return res.status(400).json({ error: 'Player ID is required' });
      }

      const gameTime = timeService.getCurrentGameTime();

      // Buscar dados do jogador se necessário
      // Por agora, calcular temperatura apenas com bioma
      const temperature = timeService.calculateTemperature(biome as string, gameTime);

      console.log('🌡️ TEMPERATURE-ROUTE: Temperature calculated:', temperature);
      res.setHeader('Content-Type', 'application/json');
      return res.json(temperature);
    } catch (error) {
      console.error('❌ TEMPERATURE-ROUTE: Erro ao obter temperatura:', error);
      res.setHeader('Content-Type', 'application/json');
      return res.status(500).json({ error: 'Failed to get temperature' });
    }
  });

  // Rota para alterar o tempo do dia (POST)
  router.post('/set-time', (req, res) => {
    try {
      const { timeOfDay, hour } = req.body;

      console.log('⏰ TIME-ROUTE: Set time request:', { timeOfDay, hour });

      if (timeOfDay) {
        // Definir período do dia específico
        timeService.setTimeOfDay(timeOfDay);
      } else if (typeof hour === 'number') {
        // Definir hora específica
        timeService.setHour(hour);
      } else {
        res.setHeader('Content-Type', 'application/json');
        return res.status(400).json({ error: 'timeOfDay or hour is required' });
      }

      // Retornar o novo tempo
      const newGameTime = timeService.getCurrentGameTime();
      console.log('⏰ TIME-ROUTE: New game time:', newGameTime);
      
      res.setHeader('Content-Type', 'application/json');
      return res.json({ success: true, gameTime: newGameTime });
    } catch (error) {
      console.error('❌ TIME-ROUTE: Erro ao alterar tempo:', error);
      res.setHeader('Content-Type', 'application/json');
      return res.status(500).json({ error: 'Failed to change time' });
    }
  });

  // Rota para avançar tempo por X horas (POST)
  router.post('/advance', (req, res) => {
    try {
      const { hours } = req.body;

      console.log('⏰ TIME-ROUTE: Advance time request:', { hours });

      if (typeof hours !== 'number' || hours <= 0) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(400).json({ error: 'hours must be a positive number' });
      }

      timeService.advanceTime(hours);

      // Retornar o novo tempo
      const newGameTime = timeService.getCurrentGameTime();
      console.log('⏰ TIME-ROUTE: New game time after advance:', newGameTime);
      
      res.setHeader('Content-Type', 'application/json');
      return res.json({ success: true, gameTime: newGameTime });
    } catch (error) {
      console.error('❌ TIME-ROUTE: Erro ao avançar tempo:', error);
      res.setHeader('Content-Type', 'application/json');
      return res.status(500).json({ error: 'Failed to advance time' });
    }
  });

  return router;
}
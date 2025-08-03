// Time Speed Control Routes for Coletor Adventures
import express from 'express';
import { TimeService } from '../services/time-service';
import { TIME_CONFIG } from '@shared/config/time-config';

const router = express.Router();
const timeService = TimeService.getInstance();

// GET /api/time/speed/options - Get available speed options
router.get('/options', (req, res) => {
  try {
    console.log('⏰ SPEED-ROUTE: Fetching speed options...');
    const options = timeService.getSpeedOptions();
    console.log('⏰ SPEED-ROUTE: Speed options fetched:', options);
    res.json(options);
  } catch (error) {
    console.error('Error fetching speed options:', error);
    res.status(500).json({ error: 'Failed to fetch speed options' });
  }
});

// GET /api/time/speed/current - Get current speed
router.get('/current', (req, res) => {
  try {
    console.log('⏰ SPEED-ROUTE: Fetching current speed...');
    const currentSpeed = timeService.getCurrentSpeed();
    const speedInfo = {
      speed: currentSpeed,
      label: {
        FAST: '⚡ Rápido (45 min)',
        NORMAL: '🕐 Normal (60 min)',
        SLOW: '🐢 Lento (90 min)', 
        VERY_SLOW: '🐌 Muito Lento (120 min)'
      }[currentSpeed],
      duration: TIME_CONFIG.SPEED_OPTIONS[currentSpeed] / (60 * 1000) // Em minutos
    };
    console.log('⏰ SPEED-ROUTE: Current speed fetched:', speedInfo);
    res.json(speedInfo);
  } catch (error) {
    console.error('Error fetching current speed:', error);
    res.status(500).json({ error: 'Failed to fetch current speed' });
  }
});

// POST /api/time/speed/set - Set time speed
router.post('/set', (req, res) => {
  try {
    const { speed } = req.body;
    
    if (!speed || !TIME_CONFIG.SPEED_OPTIONS[speed as keyof typeof TIME_CONFIG.SPEED_OPTIONS]) {
      return res.status(400).json({ 
        error: 'Invalid speed option', 
        validOptions: Object.keys(TIME_CONFIG.SPEED_OPTIONS)
      });
    }
    
    console.log('⏰ SPEED-ROUTE: Set speed request:', { speed });
    
    timeService.setTimeSpeed(speed as keyof typeof TIME_CONFIG.SPEED_OPTIONS);
    const newGameTime = timeService.getCurrentGameTime();
    
    console.log('⏰ SPEED-ROUTE: Speed changed successfully:', {
      newSpeed: speed,
      gameTime: newGameTime
    });
    
    res.json({
      success: true,
      speed,
      gameTime: newGameTime,
      speedInfo: {
        label: {
          FAST: '⚡ Rápido (45 min)',
          NORMAL: '🕐 Normal (60 min)',
          SLOW: '🐢 Lento (90 min)', 
          VERY_SLOW: '🐌 Muito Lento (120 min)'
        }[speed],
        duration: TIME_CONFIG.SPEED_OPTIONS[speed as keyof typeof TIME_CONFIG.SPEED_OPTIONS] / (60 * 1000)
      }
    });
  } catch (error) {
    console.error('Error setting time speed:', error);
    res.status(500).json({ error: 'Failed to set time speed' });
  }
});

export default router;
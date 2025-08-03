
import type { GameTime, TimeConfig, TemperatureSystem } from '@shared/types/time-types';
import type { Player } from '@shared/types';
import { TIME_CONFIG } from '@shared/config/time-config';

export class TimeService {
  private static instance: TimeService;
  private config: TimeConfig;

  private constructor() {
    this.config = {
      dayDurationMs: TIME_CONFIG.DAY_DURATION_MS,
      startTime: Date.now(),
      timeMultiplier: 1
    };
  }

  static getInstance(): TimeService {
    if (!TimeService.instance) {
      TimeService.instance = new TimeService();
    }
    return TimeService.instance;
  }

  getCurrentGameTime(): GameTime {
    const now = Date.now();
    const elapsed = now - this.config.startTime;
    
    // Calcular quantos dias passaram
    const totalDays = Math.floor(elapsed / this.config.dayDurationMs);
    
    // Calcular hora atual (0-23)
    const dayProgress = (elapsed % this.config.dayDurationMs) / this.config.dayDurationMs;
    const hour = Math.floor(dayProgress * 24);
    const minute = Math.floor((dayProgress * 24 * 60) % 60);
    
    // Calcular data
    const dayNumber = totalDays + 1;
    const monthNumber = Math.floor((dayNumber - 1) / 30) % 12 + 1;
    const yearNumber = Math.floor((dayNumber - 1) / 360) + 1;
    
    // Determinar período do dia
    const timeOfDay = this.getTimeOfDay(hour);
    const isDay = hour >= 6 && hour < 20;
    
    // Determinar estação
    const season = this.getSeason(monthNumber);

    return {
      timestamp: now,
      dayNumber,
      monthNumber,
      yearNumber,
      hour,
      minute,
      timeOfDay,
      isDay,
      dayProgress,
      season
    };
  }

  private getTimeOfDay(hour: number): GameTime['timeOfDay'] {
    if (hour >= TIME_CONFIG.DAWN.start && hour < TIME_CONFIG.DAWN.end) return 'dawn';
    if (hour >= TIME_CONFIG.MORNING.start && hour < TIME_CONFIG.MORNING.end) return 'morning';
    if (hour >= TIME_CONFIG.AFTERNOON.start && hour < TIME_CONFIG.AFTERNOON.end) return 'afternoon';
    if (hour >= TIME_CONFIG.EVENING.start && hour < TIME_CONFIG.EVENING.end) return 'evening';
    if (hour >= TIME_CONFIG.NIGHT.start && hour < TIME_CONFIG.NIGHT.end) return 'night';
    return 'midnight';
  }

  private getSeason(month: number): GameTime['season'] {
    if (TIME_CONFIG.SEASONS.spring.includes(month)) return 'spring';
    if (TIME_CONFIG.SEASONS.summer.includes(month)) return 'summer';
    if (TIME_CONFIG.SEASONS.autumn.includes(month)) return 'autumn';
    return 'winter';
  }

  calculateTemperature(biomeType: string, gameTime: GameTime, player?: Player): TemperatureSystem {
    const baseTemp = TIME_CONFIG.TEMPERATURE.BIOME_MODIFIERS[biomeType as keyof typeof TIME_CONFIG.TEMPERATURE.BIOME_MODIFIERS] || 0;
    
    // Modificador dia/noite
    let timeModifier = 0;
    if (gameTime.isDay) {
      timeModifier = TIME_CONFIG.TEMPERATURE.DAY_NIGHT_VARIANCE / 2;
    } else {
      timeModifier = -TIME_CONFIG.TEMPERATURE.DAY_NIGHT_VARIANCE / 2;
    }
    
    // Modificador sazonal
    let seasonModifier = 0;
    switch (gameTime.season) {
      case 'summer': seasonModifier = TIME_CONFIG.TEMPERATURE.SEASON_VARIANCE / 2; break;
      case 'winter': seasonModifier = -TIME_CONFIG.TEMPERATURE.SEASON_VARIANCE / 2; break;
      case 'spring': seasonModifier = TIME_CONFIG.TEMPERATURE.SEASON_VARIANCE / 4; break;
      case 'autumn': seasonModifier = -TIME_CONFIG.TEMPERATURE.SEASON_VARIANCE / 4; break;
    }
    
    // Modificador do jogador (equipamentos, etc.)
    let playerModifier = 0;
    if (player) {
      // Verificar equipamentos que afetam temperatura
      if (player.equippedChestplate) playerModifier += 2;
      if (player.equippedHelmet) playerModifier += 1;
      // Adicionar outros modificadores conforme necessário
    }

    const current = Math.round(baseTemp + timeModifier + seasonModifier + playerModifier);

    return {
      current,
      base: baseTemp,
      timeModifier,
      seasonModifier,
      weatherModifier: 0, // Para futuras expansões
      playerModifier
    };
  }

  // Modificadores baseados no tempo para outros sistemas
  getHungerThirstModifiers(gameTime: GameTime): { hunger: number; thirst: number } {
    let hungerMod = 1;
    let thirstMod = 1;

    // Noite aumenta consumo de energia
    if (!gameTime.isDay) {
      hungerMod *= 1.1;
    }

    // Verão aumenta sede
    if (gameTime.season === 'summer') {
      thirstMod *= 1.2;
    }

    // Inverno aumenta fome
    if (gameTime.season === 'winter') {
      hungerMod *= 1.1;
    }

    return { hunger: hungerMod, thirst: thirstMod };
  }
}

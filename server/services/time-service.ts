
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
    
    // Modificador dia/noite mais realista
    let timeModifier = 0;
    if (gameTime.isDay) {
      // Durante o dia, temperatura sobe gradualmente
      if (gameTime.hour >= 6 && gameTime.hour <= 12) {
        // Manhã: aquecimento gradual
        timeModifier = (gameTime.hour - 6) * (TIME_CONFIG.TEMPERATURE.DAY_NIGHT_VARIANCE / 12);
      } else if (gameTime.hour > 12 && gameTime.hour <= 18) {
        // Tarde: temperatura máxima
        timeModifier = TIME_CONFIG.TEMPERATURE.DAY_NIGHT_VARIANCE / 2;
      } else {
        // Final do dia: esfriamento
        timeModifier = TIME_CONFIG.TEMPERATURE.DAY_NIGHT_VARIANCE / 4;
      }
    } else {
      // Durante a noite, mais frio
      timeModifier = -TIME_CONFIG.TEMPERATURE.DAY_NIGHT_VARIANCE / 2;
    }
    
    // Modificador sazonal mais pronunciado
    let seasonModifier = 0;
    switch (gameTime.season) {
      case 'summer': seasonModifier = TIME_CONFIG.TEMPERATURE.SEASON_VARIANCE; break;
      case 'winter': seasonModifier = -TIME_CONFIG.TEMPERATURE.SEASON_VARIANCE; break;
      case 'spring': seasonModifier = TIME_CONFIG.TEMPERATURE.SEASON_VARIANCE / 3; break;
      case 'autumn': seasonModifier = -TIME_CONFIG.TEMPERATURE.SEASON_VARIANCE / 3; break;
    }
    
    // Modificador do jogador (equipamentos que protegem do frio/calor)
    let playerModifier = 0;
    if (player) {
      // Equipamentos de proteção térmica
      if (player.equippedChestplate) playerModifier += 3; // Armadura do peito protege mais
      if (player.equippedHelmet) playerModifier += 2;     // Capacete protege moderadamente
      if (player.equippedBoots) playerModifier += 1;      // Botas protegem pouco
      if (player.equippedLeggings) playerModifier += 2;   // Calças protegem moderadamente
      
      // Limite máximo de proteção
      playerModifier = Math.min(playerModifier, 8);
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

  // Novo método para calcular modificadores baseados na temperatura
  getTemperatureModifiers(temperature: number): { hunger: number; thirst: number } {
    const { TEMPERATURE } = TIME_CONFIG;
    let hungerMod = 1;
    let thirstMod = 1;

    // Frio extremo: muito mais fome
    if (temperature <= TEMPERATURE.DEGRADATION_MODIFIERS.EXTREME_COLD_THRESHOLD) {
      hungerMod = TEMPERATURE.DEGRADATION_MODIFIERS.MULTIPLIERS.EXTREME_COLD_HUNGER;
    }
    // Frio moderado: mais fome
    else if (temperature <= TEMPERATURE.DEGRADATION_MODIFIERS.COLD_THRESHOLD) {
      hungerMod = TEMPERATURE.DEGRADATION_MODIFIERS.MULTIPLIERS.COLD_HUNGER;
    }
    // Calor moderado: mais sede
    else if (temperature >= TEMPERATURE.DEGRADATION_MODIFIERS.HOT_THRESHOLD) {
      thirstMod = TEMPERATURE.DEGRADATION_MODIFIERS.MULTIPLIERS.HOT_THIRST;
    }
    // Calor extremo: muito mais sede
    if (temperature >= TEMPERATURE.DEGRADATION_MODIFIERS.EXTREME_HOT_THRESHOLD) {
      thirstMod = TEMPERATURE.DEGRADATION_MODIFIERS.MULTIPLIERS.EXTREME_HOT_THIRST;
    }

    return { hunger: hungerMod, thirst: thirstMod };
  }

  // Método para definir uma hora específica do dia
  setTimeOfDay(timeOfDay: GameTime['timeOfDay']): void {
    const targetHour = this.getHourFromTimeOfDay(timeOfDay);
    const now = Date.now();
    const currentGameTime = this.getCurrentGameTime();
    
    // Calcular a diferença de horas necessária
    const hourDifference = targetHour - currentGameTime.hour;
    
    // Ajustar o startTime para que a hora atual seja a desejada
    const millisecondsPerHour = this.config.dayDurationMs / 24;
    const adjustment = hourDifference * millisecondsPerHour;
    
    this.config.startTime = this.config.startTime - adjustment;
    
    console.log(`⏰ TIME-SERVICE: Time changed to ${timeOfDay} (${targetHour}:00)`);
  }

  // Método para definir uma hora específica (0-23)
  setHour(hour: number): void {
    if (hour < 0 || hour > 23) {
      throw new Error('Hour must be between 0 and 23');
    }
    
    const now = Date.now();
    const currentGameTime = this.getCurrentGameTime();
    
    // Calcular a diferença de horas necessária
    const hourDifference = hour - currentGameTime.hour;
    
    // Ajustar o startTime para que a hora atual seja a desejada
    const millisecondsPerHour = this.config.dayDurationMs / 24;
    const adjustment = hourDifference * millisecondsPerHour;
    
    this.config.startTime = this.config.startTime - adjustment;
    
    console.log(`⏰ TIME-SERVICE: Time changed to ${hour}:00`);
  }

  // Método auxiliar para obter a hora de um período do dia
  private getHourFromTimeOfDay(timeOfDay: GameTime['timeOfDay']): number {
    switch (timeOfDay) {
      case 'dawn': return 6;      // 06:00
      case 'morning': return 9;   // 09:00
      case 'afternoon': return 14; // 14:00
      case 'evening': return 18;  // 18:00
      case 'night': return 21;    // 21:00
      case 'midnight': return 0;  // 00:00
      default: return 12;         // meio-dia por padrão
    }
  }

  // Método para avançar o tempo por X horas
  advanceTime(hours: number): void {
    const millisecondsPerHour = this.config.dayDurationMs / 24;
    const adjustment = hours * millisecondsPerHour;
    
    this.config.startTime = this.config.startTime - adjustment;
    
    console.log(`⏰ TIME-SERVICE: Time advanced by ${hours} hours`);
  }
}

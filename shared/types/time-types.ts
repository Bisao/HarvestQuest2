
export interface GameTime {
  timestamp: number; // Unix timestamp atual
  dayNumber: number; // Dia atual (começando do 1)
  monthNumber: number; // Mês atual (1-12)
  yearNumber: number; // Ano atual
  hour: number; // Hora atual (0-23)
  minute: number; // Minuto atual (0-59)
  timeOfDay: 'dawn' | 'morning' | 'afternoon' | 'evening' | 'night' | 'midnight';
  isDay: boolean; // true se for dia, false se for noite
  dayProgress: number; // Progresso do dia (0-1)
  season: 'spring' | 'summer' | 'autumn' | 'winter';
}

export interface TimeConfig {
  dayDurationMs: number; // Duração de um dia em ms (padrão: 24 minutos = 1440000ms)
  startTime: number; // Timestamp de início do jogo
  timeMultiplier: number; // Multiplicador de velocidade do tempo
}

export interface TemperatureSystem {
  current: number; // Temperatura atual (-50 a 50°C)
  base: number; // Temperatura base do bioma
  timeModifier: number; // Modificador baseado na hora do dia
  seasonModifier: number; // Modificador baseado na estação
  weatherModifier: number; // Modificador baseado no clima
  playerModifier: number; // Modificador baseado em equipamentos/status
}


export const TIME_CONFIG = {
  // Um dia do jogo = 24 minutos reais
  DAY_DURATION_MS: 24 * 60 * 1000, // 24 minutos
  
  // Divisões do dia
  DAWN: { start: 5, end: 7 },      // 5h-7h
  MORNING: { start: 7, end: 12 },   // 7h-12h
  AFTERNOON: { start: 12, end: 17 }, // 12h-17h
  EVENING: { start: 17, end: 20 },   // 17h-20h
  NIGHT: { start: 20, end: 23 },     // 20h-23h
  MIDNIGHT: { start: 23, end: 5 },   // 23h-5h
  
  // Configurações de temperatura
  TEMPERATURE: {
    BASE_MIN: -30,
    BASE_MAX: 40,
    DAY_NIGHT_VARIANCE: 8, // Diferença entre dia e noite
    SEASON_VARIANCE: 15,   // Diferença entre estações
    BIOME_MODIFIERS: {
      forest: 0,
      desert: 15,
      mountain: -10,
      ocean: -5,
      cave: -8,
      special: 0
    }
  },
  
  // Meses por estação
  SEASONS: {
    spring: [3, 4, 5],    // Março, Abril, Maio
    summer: [6, 7, 8],    // Junho, Julho, Agosto
    autumn: [9, 10, 11],  // Setembro, Outubro, Novembro
    winter: [12, 1, 2]    // Dezembro, Janeiro, Fevereiro
  }
} as const;

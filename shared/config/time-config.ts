
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
    BASE_MIN: -40,
    BASE_MAX: 50,
    DAY_NIGHT_VARIANCE: 8, // Diferença entre dia e noite
    SEASON_VARIANCE: 15,   // Diferença entre estações
    BIOME_MODIFIERS: {
      forest: 2,     // Floresta temperada
      desert: 25,    // Deserto muito quente
      mountain: -15, // Montanha muito fria
      ocean: -3,     // Oceano fresco
      cave: -12,     // Caverna fria
      tundra: -20,   // Tundra gelada
      jungle: 8,     // Selva quente e úmida
      swamp: 5,      // Pântano úmido
      special: 0     // Área especial
    },
    // Modificadores de degradação baseados na temperatura
    DEGRADATION_MODIFIERS: {
      EXTREME_COLD_THRESHOLD: -15, // Abaixo disso: fome aumenta drasticamente
      COLD_THRESHOLD: -5,          // Abaixo disso: fome aumenta moderadamente
      HOT_THRESHOLD: 30,           // Acima disso: sede aumenta moderadamente
      EXTREME_HOT_THRESHOLD: 40,   // Acima disso: sede aumenta drasticamente
      MULTIPLIERS: {
        EXTREME_COLD_HUNGER: 2.5,  // 150% mais fome no frio extremo
        COLD_HUNGER: 1.5,          // 50% mais fome no frio
        HOT_THIRST: 1.5,           // 50% mais sede no calor
        EXTREME_HOT_THIRST: 2.5,   // 150% mais sede no calor extremo
      }
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

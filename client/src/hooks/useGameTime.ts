
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { GameTime, TemperatureSystem } from '@shared/types/time-types';

interface UseGameTimeReturn {
  gameTime: GameTime | null;
  temperature: TemperatureSystem | null;
  isLoading: boolean;
  error: Error | null;
}

export function useGameTime(playerId?: string, biomeType: string = 'forest'): UseGameTimeReturn {
  const [localTime, setLocalTime] = useState<GameTime | null>(null);

  // Buscar tempo inicial do servidor
  const { data: serverTime, isLoading, error } = useQuery({
    queryKey: ['gameTime'],
    queryFn: async () => {
      const response = await fetch('/api/time/current');
      if (!response.ok) throw new Error('Failed to fetch game time');
      return response.json();
    },
    refetchInterval: 30000, // Sincronizar com servidor a cada 30 segundos
    staleTime: 25000
  });

  // Buscar temperatura se tiver playerId
  const { data: temperature } = useQuery({
    queryKey: ['temperature', playerId, biomeType],
    queryFn: async () => {
      if (!playerId) return null;
      const response = await fetch(`/api/time/temperature?playerId=${playerId}&biome=${biomeType}`);
      if (!response.ok) throw new Error('Failed to fetch temperature');
      return response.json();
    },
    enabled: !!playerId,
    refetchInterval: 60000, // Atualizar temperatura a cada minuto
    staleTime: 55000
  });

  // Atualizar tempo local a cada segundo
  useEffect(() => {
    if (!serverTime) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = now - serverTime.timestamp;
      
      // Calcular novo progresso do dia
      const dayDurationMs = 24 * 60 * 1000; // 24 minutos
      const dayProgress = ((serverTime.dayProgress * dayDurationMs + elapsed) % dayDurationMs) / dayDurationMs;
      
      const hour = Math.floor(dayProgress * 24);
      const minute = Math.floor((dayProgress * 24 * 60) % 60);
      const isDay = hour >= 6 && hour < 20;

      // Determinar período do dia
      let timeOfDay: GameTime['timeOfDay'] = 'midnight';
      if (hour >= 5 && hour < 7) timeOfDay = 'dawn';
      else if (hour >= 7 && hour < 12) timeOfDay = 'morning';
      else if (hour >= 12 && hour < 17) timeOfDay = 'afternoon';
      else if (hour >= 17 && hour < 20) timeOfDay = 'evening';
      else if (hour >= 20 && hour < 23) timeOfDay = 'night';

      setLocalTime({
        ...serverTime,
        timestamp: now,
        hour,
        minute,
        timeOfDay,
        isDay,
        dayProgress
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [serverTime]);

  return {
    gameTime: localTime || serverTime,
    temperature: temperature || null,
    isLoading,
    error
  };
}

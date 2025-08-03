
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
      console.log('🕐 HOOK: Fetching game time from /api/time/current');
      try {
        const response = await fetch('/api/time/current', {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('🕐 HOOK: Failed to fetch game time, status:', response.status, 'Response:', errorText);
          throw new Error(`Failed to fetch game time: ${response.status}`);
        }
        
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const responseText = await response.text();
          console.error('🕐 HOOK: Expected JSON but got:', contentType, 'Response:', responseText);
          throw new Error('Server returned non-JSON response');
        }
        
        const data = await response.json();
        console.log('🕐 HOOK: Game time received:', data);
        return data;
      } catch (fetchError) {
        console.error('🕐 HOOK: Network or parsing error:', fetchError);
        throw fetchError;
      }
    },
    refetchInterval: 30000, // Sincronizar com servidor a cada 30 segundos
    staleTime: 25000,
    retry: 3,
    retryDelay: 1000
  });

  // Buscar temperatura se tiver playerId
  const { data: temperature } = useQuery({
    queryKey: ['temperature', playerId, biomeType],
    queryFn: async () => {
      if (!playerId) {
        console.log('🌡️ HOOK: No player ID provided');
        return null;
      }
      console.log('🌡️ HOOK: Fetching temperature for player:', playerId, 'biome:', biomeType);
      
      try {
        const response = await fetch(`/api/time/temperature?playerId=${playerId}&biome=${biomeType}`, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('🌡️ HOOK: Failed to fetch temperature, status:', response.status, 'Response:', errorText);
          throw new Error(`Failed to fetch temperature: ${response.status}`);
        }
        
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const responseText = await response.text();
          console.error('🌡️ HOOK: Expected JSON but got:', contentType, 'Response:', responseText);
          return null; // Retorna null em caso de erro para não quebrar a UI
        }
        
        const data = await response.json();
        console.log('🌡️ HOOK: Temperature received:', data);
        return data;
      } catch (fetchError) {
        console.error('🌡️ HOOK: Network or parsing error:', fetchError);
        return null; // Retorna null em caso de erro
      }
    },
    enabled: !!playerId,
    refetchInterval: 60000, // Atualizar temperatura a cada minuto
    staleTime: 55000,
    retry: 2,
    retryDelay: 1000
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

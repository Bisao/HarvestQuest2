import { useState, useEffect, useCallback, useRef } from 'react';
import type { Player, Biome } from '@shared/types';

export interface AutoRepeatSettings {
  [biomeId: string]: {
    enabled: boolean;
    resources: string[];
    countdown: number;
  };
}

interface UseAutoRepeatProps {
  player: Player | undefined;
  biomes: Biome[];
  activeExpedition: any;
  onStartExpedition: (biomeId: string, resources: string[]) => void;
}

export function useAutoRepeat({
  player,
  biomes,
  activeExpedition,
  onStartExpedition
}: UseAutoRepeatProps) {
  const [autoRepeatSettings, setAutoRepeatSettings] = useState<AutoRepeatSettings>({});
  const timersRef = useRef<{ [biomeId: string]: NodeJS.Timeout }>({});

  // Função para limpar timer
  const clearTimer = useCallback((biomeId: string) => {
    if (timersRef.current[biomeId]) {
      clearInterval(timersRef.current[biomeId]);
      delete timersRef.current[biomeId];
    }
  }, []);

  // Função para iniciar countdown
  const startCountdown = useCallback((biomeId: string) => {
    // Limpar timer existente se houver
    clearTimer(biomeId);

    const timer = setInterval(() => {
      setAutoRepeatSettings(prev => {
        const current = prev[biomeId];
        if (!current || !current.enabled || current.countdown <= 0) {
          clearTimer(biomeId);
          return prev;
        }

        return {
          ...prev,
          [biomeId]: {
            ...current,
            countdown: current.countdown - 1
          }
        };
      });
    }, 1000);

    timersRef.current[biomeId] = timer;
  }, [clearTimer]);

  // Função para toggle auto-repeat
  const toggleAutoRepeat = useCallback((biomeId: string) => {
    console.log('Toggle auto-repeat for biome:', biomeId);
    
    // Get last expedition resources
    const lastExpeditions = typeof window !== 'undefined' 
      ? JSON.parse(localStorage.getItem('lastExpeditionResources') || '{}')
      : {};
    
    setAutoRepeatSettings(prev => {
      const current = prev[biomeId];
      
      if (current) {
        // Toggle the enabled state
        const newEnabled = !current.enabled;
        
        if (newEnabled) {
          // Starting auto-repeat
          setTimeout(() => startCountdown(biomeId), 100);
          
          return {
            ...prev,
            [biomeId]: { 
              ...current, 
              enabled: true, 
              countdown: 10 
            }
          };
        } else {
          // Disabling auto-repeat
          clearTimer(biomeId);
          return {
            ...prev,
            [biomeId]: { 
              ...current, 
              enabled: false, 
              countdown: 0 
            }
          };
        }
      } else {
        // First time enabling - check for last expedition resources
        if (lastExpeditions[biomeId] && lastExpeditions[biomeId].length > 0) {
          setTimeout(() => startCountdown(biomeId), 100);
          
          return {
            ...prev,
            [biomeId]: { 
              enabled: true, 
              resources: lastExpeditions[biomeId], 
              countdown: 10
            }
          };
        } else {
          console.log('No last expedition resources found for biome:', biomeId);
          return prev;
        }
      }
    });
  }, [startCountdown, clearTimer]);

  // Função para reiniciar countdown após expedição
  const restartCountdown = useCallback((biomeId: string) => {
    setAutoRepeatSettings(prev => {
      const settings = prev[biomeId];
      if (settings && settings.enabled) {
        setTimeout(() => startCountdown(biomeId), 1000);
        return {
          ...prev,
          [biomeId]: { ...prev[biomeId], countdown: 10 }
        };
      }
      return prev;
    });
  }, [startCountdown]);

  // Effect para auto-iniciar expedições quando countdown chega a 0
  useEffect(() => {
    if (!player || !biomes.length) return;

    const enabledBiome = Object.entries(autoRepeatSettings).find(([_, settings]) => 
      settings.enabled && settings.countdown === 0 && !activeExpedition
    );
    
    if (enabledBiome) {
      const [biomeId, settings] = enabledBiome;
      const biome = biomes.find(b => b.id === biomeId);
      
      if (biome && player.hunger >= 5 && player.thirst >= 5) {
        console.log('Auto-starting expedition for biome:', biomeId);
        
        // Get last expedition resources
        const lastExpeditions = typeof window !== 'undefined' 
          ? JSON.parse(localStorage.getItem('lastExpeditionResources') || '{}')
          : {};
          
        if (lastExpeditions[biomeId] && lastExpeditions[biomeId].length > 0) {
          onStartExpedition(biomeId, lastExpeditions[biomeId]);
        }
      } else {
        // Disable auto-repeat if conditions aren't met
        setAutoRepeatSettings(prev => ({
          ...prev,
          [biomeId]: { ...prev[biomeId], enabled: false }
        }));
        clearTimer(biomeId);
      }
    }
  }, [autoRepeatSettings, activeExpedition, biomes, player, onStartExpedition, clearTimer]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      Object.values(timersRef.current).forEach(timer => {
        if (timer) {
          clearInterval(timer);
        }
      });
      timersRef.current = {};
    };
  }, []);

  return {
    autoRepeatSettings,
    toggleAutoRepeat,
    restartCountdown
  };
}
import { useState, useEffect, useCallback, useRef } from 'react';
import type { Player, Biome } from '@shared/types';

export interface AutoRepeatSettings {
  [biomeId: string]: {
    enabled: boolean;
    resources: string[];
    countdown: number;
    lastRun: number | null;
    totalRuns: number;
  };
}

interface UseAutoRepeatProps {
  player: Player | null;
  biomes: Biome[] | undefined;
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
  const timersRef = useRef<Record<string, NodeJS.Timeout>>({});
  const countdownTimersRef = useRef<Record<string, NodeJS.Timeout>>({});

  // Função para limpar todos os timers de um bioma
  const clearBiomeTimers = useCallback((biomeId: string) => {
    if (timersRef.current[biomeId]) {
      clearInterval(timersRef.current[biomeId]);
      delete timersRef.current[biomeId];
    }
    if (countdownTimersRef.current[biomeId]) {
      clearInterval(countdownTimersRef.current[biomeId]);
      delete countdownTimersRef.current[biomeId];
    }
  }, []);

  // Função para iniciar countdown de um bioma
  const startCountdown = useCallback((biomeId: string, initialTime: number = 15) => {
    clearBiomeTimers(biomeId);
    
    // Atualizar o countdown inicial
    setAutoRepeatSettings(prev => ({
      ...prev,
      [biomeId]: { ...prev[biomeId], countdown: initialTime }
    }));

    // Timer do countdown
    countdownTimersRef.current[biomeId] = setInterval(() => {
      setAutoRepeatSettings(prev => {
        const currentSettings = prev[biomeId];
        if (!currentSettings || !currentSettings.enabled) {
          clearBiomeTimers(biomeId);
          return prev;
        }

        const newCountdown = currentSettings.countdown - 1;
        
        if (newCountdown <= 0) {
          // Countdown chegou a zero - tentar iniciar expedição
          clearBiomeTimers(biomeId);
          
          // Verificar condições para iniciar expedição
          const biome = biomes?.find(b => b.id === biomeId);
          const canStart = player && 
                          player.hunger >= 5 && 
                          player.thirst >= 5 && 
                          !activeExpedition &&
                          biome &&
                          currentSettings.resources.length > 0;

          if (canStart) {
            console.log(`🔄 Auto-repetindo expedição para ${biome.name} (tentativa ${currentSettings.totalRuns + 1})`);
            
            // Iniciar a expedição
            onStartExpedition(biomeId, currentSettings.resources);
            
            return {
              ...prev,
              [biomeId]: {
                ...currentSettings,
                countdown: 0,
                lastRun: Date.now(),
                totalRuns: currentSettings.totalRuns + 1
              }
            };
          } else {
            // Condições não atendidas - desabilitar auto-repeat
            console.log(`❌ Auto-repeat desabilitado para ${biome?.name || biomeId}: condições não atendidas`);
            return {
              ...prev,
              [biomeId]: {
                ...currentSettings,
                enabled: false,
                countdown: 0
              }
            };
          }
        }

        return {
          ...prev,
          [biomeId]: { ...currentSettings, countdown: newCountdown }
        };
      });
    }, 1000);
  }, [biomes, player, activeExpedition, clearBiomeTimers, onStartExpedition]);

  // Função para habilitar/desabilitar auto-repeat
  const toggleAutoRepeat = useCallback((biomeId: string) => {
    const lastExpeditions = typeof window !== 'undefined' 
      ? JSON.parse(localStorage.getItem('lastExpeditionResources') || '{}')
      : {};

    setAutoRepeatSettings(prev => {
      const currentSettings = prev[biomeId];
      const newEnabled = !currentSettings?.enabled;

      if (newEnabled) {
        // Habilitando auto-repeat
        const resources = lastExpeditions[biomeId] || [];
        
        if (resources.length === 0) {
          console.log('❌ Não é possível habilitar auto-repeat: nenhuma expedição anterior encontrada');
          return prev;
        }

        const newSettings = {
          enabled: true,
          resources,
          countdown: 15,
          lastRun: null,
          totalRuns: 0
        };

        console.log(`✅ Auto-repeat habilitado para bioma ${biomeId} com recursos:`, resources);
        
        // Iniciar countdown
        setTimeout(() => startCountdown(biomeId, 15), 100);

        return {
          ...prev,
          [biomeId]: newSettings
        };
      } else {
        // Desabilitando auto-repeat
        clearBiomeTimers(biomeId);
        console.log(`🛑 Auto-repeat desabilitado para bioma ${biomeId}`);
        
        return {
          ...prev,
          [biomeId]: {
            ...currentSettings,
            enabled: false,
            countdown: 0
          }
        };
      }
    });
  }, [clearBiomeTimers, startCountdown]);

  // Função para resetar countdown após completar expedição
  const restartCountdown = useCallback((biomeId: string) => {
    const settings = autoRepeatSettings[biomeId];
    if (settings?.enabled) {
      console.log(`🔄 Reiniciando countdown para bioma ${biomeId}`);
      setTimeout(() => startCountdown(biomeId, 15), 2000); // 2 segundos de delay
    }
  }, [autoRepeatSettings, startCountdown]);

  // Limpar todos os timers quando o componente é desmontado
  useEffect(() => {
    return () => {
      Object.keys(timersRef.current).forEach(clearBiomeTimers);
      Object.keys(countdownTimersRef.current).forEach(clearBiomeTimers);
    };
  }, [clearBiomeTimers]);

  // Carregar configurações salvas do localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('autoRepeatSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setAutoRepeatSettings(parsed);
        
        // Reiniciar countdowns para configurações habilitadas
        Object.entries(parsed).forEach(([biomeId, settings]: [string, any]) => {
          if (settings.enabled && settings.countdown > 0) {
            startCountdown(biomeId, settings.countdown);
          }
        });
      } catch (error) {
        console.error('Erro ao carregar configurações de auto-repeat:', error);
      }
    }
  }, [startCountdown]);

  // Salvar configurações no localStorage
  useEffect(() => {
    localStorage.setItem('autoRepeatSettings', JSON.stringify(autoRepeatSettings));
  }, [autoRepeatSettings]);

  return {
    autoRepeatSettings,
    toggleAutoRepeat,
    restartCountdown,
    clearAllTimers: () => {
      Object.keys(timersRef.current).forEach(clearBiomeTimers);
      Object.keys(countdownTimersRef.current).forEach(clearBiomeTimers);
    }
  };
}
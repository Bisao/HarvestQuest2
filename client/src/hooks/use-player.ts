
import { useContext } from 'react';
import { GameContext } from '@/contexts/GameContext';

export function usePlayer() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('usePlayer must be used within a GameProvider');
  }
  return {
    player: context.player,
    isLoading: context.isLoading,
    error: context.error
  };
}

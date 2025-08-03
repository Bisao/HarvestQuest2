
import { useGameContext } from '@/contexts/GameContext';

export function usePlayer() {
  const context = useGameContext();
  return {
    player: context.player,
    isLoading: context.isLoading,
    error: context.error
  };
}

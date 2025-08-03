
import React, { createContext, useContext, ReactNode } from 'react';
import { useGameState } from '../hooks/useGameState';
import type { Player, Resource, Equipment, Biome, ActiveExpedition } from '@shared/types';

interface GameContextValue {
  player: Player | null;
  resources: Resource[];
  equipment: Equipment[];
  biomes: Biome[];
  activeExpedition: ActiveExpedition | null;
  isLoading: boolean;
  error: string | null;
  setActiveExpedition: (expedition: ActiveExpedition | null) => void;
  updatePlayer: (updates: Partial<Player>) => Promise<void>;
  invalidateCache: (keys?: string[]) => void;
}

const GameContext = createContext<GameContextValue | undefined>(undefined);

interface GameProviderProps {
  children: ReactNode;
  playerId: string;
}

export function GameProvider({ children, playerId }: GameProviderProps) {
  // Validate playerId
  if (!playerId || playerId.trim() === '') {
    throw new Error('GameProvider requires a valid playerId');
  }

  const gameState = useGameState({ playerId });

  return (
    <GameContext.Provider value={gameState}>
      {children}
    </GameContext.Provider>
  );
}

export function useGameContext() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
}

// Hook for accessing specific parts of game state
export function useGameData() {
  const { player, resources, equipment, biomes } = useGameContext();
  return { player, resources, equipment, biomes };
}

export function useGameActions() {
  const { updatePlayer, invalidateCache, setActiveExpedition } = useGameContext();
  return { updatePlayer, invalidateCache, setActiveExpedition };
}

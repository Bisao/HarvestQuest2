import { useState } from "react";

interface GameState {
  activeTab: string;
  expeditionModalOpen: boolean;
  selectedBiome: string | null;
}

export function useGameState() {
  const [gameState, setGameState] = useState<GameState>({
    activeTab: "biomes",
    expeditionModalOpen: false,
    selectedBiome: null,
  });

  const updateGameState = (updates: Partial<GameState>) => {
    setGameState(prev => ({ ...prev, ...updates }));
  };

  return {
    gameState,
    updateGameState,
  };
}

import { useState } from "react";

interface ActiveExpedition {
  id: string;
  biomeId: string;
  progress: number;
  selectedResources: string[];
}

interface GameState {
  activeTab: string;
  expeditionModalOpen: boolean;
  selectedBiome: string | null;
  activeExpedition: ActiveExpedition | null;
}

export function useGameState() {
  const [gameState, setGameState] = useState<GameState>({
    activeTab: "biomes",
    expeditionModalOpen: false,
    selectedBiome: null,
    activeExpedition: null,
  });

  const updateGameState = (updates: Partial<GameState>) => {
    setGameState(prev => ({ ...prev, ...updates }));
  };

  return {
    gameState,
    updateGameState,
  };
}

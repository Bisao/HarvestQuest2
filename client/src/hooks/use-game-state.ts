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
```

```
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Player, Resource, Biome, InventoryItem, StorageItem, Equipment, Recipe, Quest, PlayerQuest } from "@shared/types";
import { getAuthHeaders } from "@/lib/queryClient";

// Fetch player data
  const { data: player, isLoading: playerLoading, error: playerError } = useQuery({
    queryKey: ["/api/player", username],
    queryFn: async () => {
      const response = await fetch(`/api/player/${encodeURIComponent(username)}`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) {
        throw new Error("Failed to fetch player");
      }
      return response.json();
    },
    enabled: !!username,
  });
```

```
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Player, Resource, Biome, InventoryItem, StorageItem, Equipment, Recipe, Quest, PlayerQuest } from "@shared/types";
import { getAuthHeaders } from "@/lib/queryClient";

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

export function useGameState(username: string) {
  const [gameState, setGameState] = useState<GameState>({
    activeTab: "biomes",
    expeditionModalOpen: false,
    selectedBiome: null,
    activeExpedition: null,
  });

  const updateGameState = (updates: Partial<GameState>) => {
    setGameState(prev => ({ ...prev, ...updates }));
  };

  // Fetch player data
  const { data: player, isLoading: playerLoading, error: playerError } = useQuery({
    queryKey: ["/api/player", username],
    queryFn: async () => {
      const response = await fetch(`/api/player/${encodeURIComponent(username)}`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) {
        throw new Error("Failed to fetch player");
      }
      return response.json();
    },
    enabled: !!username,
  });

  return {
    gameState,
    updateGameState,
    player,
    playerLoading,
    playerError
  };
}
```

```
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Player, Resource, Biome, InventoryItem, StorageItem, Equipment, Recipe, Quest, PlayerQuest } from "@shared/types";
import { getAuthHeaders } from "@/lib/queryClient";
```

```
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Player, Resource, Biome, InventoryItem, StorageItem, Equipment, Recipe, Quest, PlayerQuest } from "@shared/types";
import { getAuthHeaders } from "@/lib/queryClient";
```

```
// Fetch player data
  const { data: player, isLoading: playerLoading, error: playerError } = useQuery({
    queryKey: ["/api/player", username],
    queryFn: async () => {
      const response = await fetch(`/api/player/${encodeURIComponent(username)}`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) {
        throw new Error("Failed to fetch player");
      }
      return response.json();
    },
    enabled: !!username,
  });
```

```
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Player, Resource, Biome, InventoryItem, StorageItem, Equipment, Recipe, Quest, PlayerQuest } from "@shared/types";
import { getAuthHeaders } from "@/lib/queryClient";

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

export function useGameState(username: string) {
  const [gameState, setGameState] = useState<GameState>({
    activeTab: "biomes",
    expeditionModalOpen: false,
    selectedBiome: null,
    activeExpedition: null,
  });

  const updateGameState = (updates: Partial<GameState>) => {
    setGameState(prev => ({ ...prev, ...updates }));
  };

  // Fetch player data
  const { data: player, isLoading: playerLoading, error: playerError } = useQuery({
    queryKey: ["/api/player", username],
    queryFn: async () => {
      const response = await fetch(`/api/player/${encodeURIComponent(username)}`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) {
        throw new Error("Failed to fetch player");
      }
      return response.json();
    },
    enabled: !!username,
  });

  return {
    gameState,
    updateGameState,
    player,
    playerLoading,
    playerError
  };
}
import { useQuery } from '@tanstack/react-query';

interface UseGameDataProps {
  playerId: string;
}

interface GameData {
  player?: any;
  inventory?: any[];
  storage?: any[];
  resources?: any[];
  equipment?: any[];
  biomes?: any[];
  recipes?: any[];
}

export function useGameData({ playerId }: UseGameDataProps): GameData {
  // Fetch player data
  const { data: player } = useQuery({
    queryKey: [`/api/player/${playerId}`],
    queryFn: async () => {
      const response = await fetch(`/api/player/${playerId}`);
      if (!response.ok) throw new Error('Failed to fetch player');
      return response.json();
    },
    refetchInterval: 2000,
    staleTime: 0,
  });

  // Fetch inventory data
  const { data: inventory = [] } = useQuery({
    queryKey: [`/api/inventory/${playerId}`],
    queryFn: async () => {
      const response = await fetch(`/api/inventory/${playerId}`);
      if (!response.ok) throw new Error('Failed to fetch inventory');
      return response.json();
    },
    refetchInterval: 2000,
    staleTime: 0,
  });

  // Fetch storage data
  const { data: storage = [] } = useQuery({
    queryKey: [`/api/storage/${playerId}`],
    queryFn: async () => {
      const response = await fetch(`/api/storage/${playerId}`);
      if (!response.ok) throw new Error('Failed to fetch storage');
      return response.json();
    },
    refetchInterval: 2000,
    staleTime: 0,
  });

  // Fetch resources data
  const { data: resources = [] } = useQuery({
    queryKey: ['/api/resources'],
    queryFn: async () => {
      const response = await fetch('/api/resources');
      if (!response.ok) throw new Error('Failed to fetch resources');
      return response.json();
    },
    staleTime: 300000, // 5 minutes
  });

  // Fetch equipment data
  const { data: equipment = [] } = useQuery({
    queryKey: ['/api/equipment'],
    queryFn: async () => {
      const response = await fetch('/api/equipment');
      if (!response.ok) throw new Error('Failed to fetch equipment');
      return response.json();
    },
    staleTime: 300000, // 5 minutes
  });

  // Fetch biomes data
  const { data: biomes = [] } = useQuery({
    queryKey: ['/api/biomes'],
    queryFn: async () => {
      const response = await fetch('/api/biomes');
      if (!response.ok) throw new Error('Failed to fetch biomes');
      return response.json();
    },
    staleTime: 300000, // 5 minutes
  });

  // Fetch recipes data
  const { data: recipes = [] } = useQuery({
    queryKey: ['/api/recipes'],
    queryFn: async () => {
      const response = await fetch('/api/recipes');
      if (!response.ok) throw new Error('Failed to fetch recipes');
      return response.json();
    },
    staleTime: 300000, // 5 minutes
  });

  return {
    player,
    inventory,
    storage,
    resources,
    equipment,
    biomes,
    recipes,
  };
}
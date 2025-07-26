import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import GameHeader from "@/components/game/game-header";
import BiomesTab from "@/components/game/biomes-tab";
import InventoryTab from "@/components/game/inventory-tab";
import StorageTab from "@/components/game/storage-tab";
import CraftingTab from "@/components/game/crafting-tab";
import ExpeditionModal from "@/components/game/expedition-modal";
import { useGameState } from "@/hooks/use-game-state";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Player, Biome, Resource, Equipment, Recipe } from "@shared/schema";

export default function Game() {
  const [activeTab, setActiveTab] = useState("biomes");
  const [expeditionModalOpen, setExpeditionModalOpen] = useState(false);
  const [selectedBiome, setSelectedBiome] = useState<Biome | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const { gameState, updateGameState } = useGameState();

  const { data: player } = useQuery<Player>({
    queryKey: ["/api/player/Player1"],
  });

  const { data: biomes = [] } = useQuery<Biome[]>({
    queryKey: ["/api/biomes"],
  });

  const { data: resources = [] } = useQuery<Resource[]>({
    queryKey: ["/api/resources"],
  });

  const { data: equipment = [] } = useQuery<Equipment[]>({
    queryKey: ["/api/equipment"],
  });

  const { data: recipes = [] } = useQuery<Recipe[]>({
    queryKey: ["/api/recipes"],
  });

  const tabs = [
    { id: "biomes", label: "Biomas", emoji: "🌍" },
    { id: "inventory", label: "Inventário", emoji: "🎒" },
    { id: "storage", label: "Armazém", emoji: "🏪" },
    { id: "crafting", label: "Crafting", emoji: "🔨" },
  ];

  // Expedição mutation
  const startExpeditionMutation = useMutation({
    mutationFn: async (expeditionData: { 
      playerId: string; 
      biomeId: string; 
      selectedResources: string[]; 
      equipment: string[] 
    }) => {
      const response = await apiRequest('POST', '/api/expeditions', expeditionData);
      return response.json();
    },
    onSuccess: (expedition) => {
      console.log('Expedition started:', expedition);
      
      // Define o estado da expedição ativa
      updateGameState({ 
        activeExpedition: {
          id: expedition.id,
          biomeId: expedition.biomeId,
          progress: 0,
          selectedResources: expedition.selectedResources
        },
        expeditionModalOpen: false
      });

      // Inicia a simulação de progresso
      startProgressSimulation(expedition.id);
      
      toast({
        title: "Expedição iniciada!",
        description: "Sua expedição está em andamento. Aguarde a coleta dos recursos.",
      });
    },
    onError: (error) => {
      console.error('Error starting expedition:', error);
      toast({
        title: "Erro",
        description: "Não foi possível iniciar a expedição. Tente novamente.",
        variant: "destructive"
      });
    }
  });

  const completeExpeditionMutation = useMutation({
    mutationFn: async (expeditionId: string) => {
      const response = await apiRequest('POST', `/api/expeditions/${expeditionId}/complete`);
      return response.json();
    },
    onSuccess: () => {
      // Limpar expedição ativa
      updateGameState({ activeExpedition: null });
      
      // Limpar intervalo se existir
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      // Atualizar dados do jogador
      queryClient.invalidateQueries({ queryKey: ['/api/player', 'Player1'] });
      
      toast({
        title: "Expedição concluída!",
        description: "Os recursos foram adicionados ao seu inventário.",
      });
    },
    onError: (error) => {
      console.error('Error completing expedition:', error);
      toast({
        title: "Erro",
        description: "Não foi possível finalizar a expedição.",
        variant: "destructive"
      });
    }
  });

  // Função para simular progresso da expedição
  const startProgressSimulation = (expeditionId: string) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    let progress = 0;
    intervalRef.current = setInterval(() => {
      progress += Math.random() * 15 + 10; // Incremento aleatório entre 10-25%
      
      if (progress >= 100) {
        progress = 100;
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }

      updateGameState({ 
        activeExpedition: gameState.activeExpedition ? {
          ...gameState.activeExpedition,
          progress: Math.floor(progress)
        } : null
      });
    }, 800); // Atualiza a cada 800ms
  };

  const handleExploreBiome = (biome: Biome) => {
    setSelectedBiome(biome);
    setExpeditionModalOpen(true);
  };

  const handleStartExpedition = (selectedResources: string[], equipment: string[]) => {
    if (!selectedBiome || !player) return;

    startExpeditionMutation.mutate({
      playerId: player.id,
      biomeId: selectedBiome.id,
      selectedResources,
      equipment
    });
  };

  const handleCompleteExpedition = (expeditionId: string) => {
    completeExpeditionMutation.mutate(expeditionId);
  };

  if (!player) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading game...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <GameHeader player={player} />
      
      <main className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-lg mb-6">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? "border-forest text-forest"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <span className="text-lg">{tab.emoji}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "biomes" && (
              <BiomesTab
                biomes={biomes}
                resources={resources}
                playerLevel={player.level}
                activeExpedition={gameState.activeExpedition}
                onExploreBiome={handleExploreBiome}
                onCompleteExpedition={handleCompleteExpedition}
              />
            )}

            {activeTab === "inventory" && (
              <InventoryTab
                playerId={player.id}
                resources={resources}
                currentWeight={player.inventoryWeight}
                maxWeight={player.maxInventoryWeight}
              />
            )}

            {activeTab === "storage" && (
              <StorageTab
                playerId={player.id}
                resources={resources}
                autoStorage={player.autoStorage}
              />
            )}

            {activeTab === "crafting" && (
              <CraftingTab
                recipes={recipes}
                resources={resources}
                playerLevel={player.level}
              />
            )}
          </div>
        </div>
      </main>

      <ExpeditionModal
        isOpen={expeditionModalOpen}
        onClose={() => setExpeditionModalOpen(false)}
        biome={selectedBiome}
        resources={resources}
        equipment={equipment}
        playerId={player.id}
        onStartExpedition={handleStartExpedition}
      />
    </div>
  );
}

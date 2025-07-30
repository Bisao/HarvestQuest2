import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import GameHeader from "@/components/game/game-header";
import BiomesTab from "@/components/game/biomes-tab";
import QuestsTab from "@/components/game/quests-tab";
import EnhancedInventoryWithTabs from "@/components/game/enhanced-inventory-with-tabs";
import EnhancedStorageTab from "@/components/game/enhanced-storage-tab";
import EnhancedCraftingTab from "@/components/game/enhanced-crafting-tab";
import ConsumptionTab from "@/components/game/consumption-tab";
import ExpeditionSystem from "@/components/game/expedition-system";
import { useGameState } from "@/hooks/use-game-state";
import { useAutoRepeat } from "@/hooks/use-auto-repeat";
import { queryClient } from "@/lib/queryClient";
import type { Player, Biome, Resource, Equipment, Recipe, InventoryItem } from "@shared/types";

export default function Game() {
  const [activeTab, setActiveTab] = useState("biomes");
  const [expeditionModalOpen, setExpeditionModalOpen] = useState(false);
  const [expeditionMinimized, setExpeditionMinimized] = useState(false);
  const [expeditionMinimizedExpanded, setExpeditionMinimizedExpanded] = useState(false);
  const [selectedBiome, setSelectedBiome] = useState<Biome | null>(null);
  const [activeExpedition, setActiveExpedition] = useState<any>(null);

  const { gameState, updateGameState } = useGameState();

  // Make setActiveExpedition available globally for expedition system
  useEffect(() => {
    (window as any).setActiveExpedition = setActiveExpedition;
    return () => {
      delete (window as any).setActiveExpedition;
    };
  }, []);

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

  const { data: inventoryItems = [] } = useQuery<InventoryItem[]>({
    queryKey: ["/api/inventory", player?.id],
    enabled: !!player?.id,
  });

  const { data: quests = [] } = useQuery<any[]>({
    queryKey: [`/api/player/${player?.id}/quests`],
    enabled: !!player?.id,
  });

  // Check if there are any completable quests
  const hasCompletableQuests = quests.some((quest: any) => quest.canComplete === true);

  // Função para iniciar expedição via auto-repeat 
  const handleAutoStartExpedition = (biomeId: string, resources: string[]) => {
    const biome = biomes.find(b => b.id === biomeId);
    if (!biome) return;

    setSelectedBiome(biome);
    setExpeditionModalOpen(true);
    setExpeditionMinimized(false);
    
    // Disparar evento para auto-iniciar a expedição
    setTimeout(() => {
      const event = new CustomEvent('autoStartExpedition', { 
        detail: { resources } 
      });
      window.dispatchEvent(event);
    }, 500);
  };

  // Hook de auto-repetição
  const { autoRepeatSettings, toggleAutoRepeat, restartCountdown } = useAutoRepeat({
    player,
    biomes,
    activeExpedition,
    onStartExpedition: handleAutoStartExpedition
  });

  const tabs = [
    { id: "biomes", label: "Biomas", emoji: "🌍" },
    { id: "quests", label: "Quests", emoji: "📋", hasNotification: hasCompletableQuests },
    { id: "inventory", label: "Inventário", emoji: "🎒" },
    { id: "storage", label: "Armazém", emoji: "🏪" },
    { id: "crafting", label: "Crafting", emoji: "🔨" },
    { id: "consumption", label: "Consumir", emoji: "🍖" },
  ];

  // Handler for exploring biomes
  const handleExploreBiome = (biome: Biome) => {
    // Don't allow new expeditions if one is already active
    if (activeExpedition) return;

    setSelectedBiome(biome);
    setExpeditionModalOpen(true);
    setExpeditionMinimized(false);
  };

  // Handler for minimizing expedition
  const handleMinimizeExpedition = () => {
    if (activeExpedition) {
      // If expedition is completed, toggle expanded state instead of opening modal
      if (activeExpedition.progress >= 100) {
        setExpeditionMinimizedExpanded(!expeditionMinimizedExpanded);
      } else {
        setExpeditionMinimized(!expeditionMinimized);
        if (expeditionMinimized) {
          setExpeditionModalOpen(true);
        } else {
          setExpeditionModalOpen(false);
        }
      }
    }
  };

  // Progress tracker effect for minimized expeditions
  useEffect(() => {
    if (activeExpedition && expeditionMinimized) {
      const interval = setInterval(() => {
        const now = Date.now();
        const elapsed = now - activeExpedition.startTime;
        const newProgress = Math.min(100, (elapsed / activeExpedition.estimatedDuration) * 100);

        setActiveExpedition((prev: any) => prev ? { ...prev, progress: newProgress } : null);

        // When expedition completes, make sure it's in minimized mode
        if (newProgress >= 100) {
          setExpeditionMinimized(true);
          setExpeditionModalOpen(false);
          clearInterval(interval);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [activeExpedition, expeditionMinimized]);

  // Handler for completing expeditions - this triggers the API call
  const handleCompleteExpedition = () => {
    if (!activeExpedition) return;
    
    // Make API call to complete expedition
    completeExpeditionMutation.mutate(activeExpedition.id);
  };

  // Mutation for completing expeditions
  const completeExpeditionMutation = useMutation({
    mutationFn: async (expeditionId: string) => {
      const response = await fetch(`/api/expeditions/${expeditionId}/complete`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to complete expedition');
      }
      return response.json();
    },
    onSuccess: (result: any) => {
      // Check if auto-repeat is enabled for current biome before clearing expedition
      const currentBiomeId = activeExpedition?.biomeId;
      
      setActiveExpedition(null);
      setExpeditionModalOpen(false);
      setExpeditionMinimized(false);
      setExpeditionMinimizedExpanded(false);
      queryClient.invalidateQueries({ queryKey: ["/api/player/Player1"] });
      
      // Restart auto-repeat countdown if it was enabled
      if (currentBiomeId) {
        console.log('Expedition completed - restarting auto-repeat countdown for biome:', currentBiomeId);
        restartCountdown(currentBiomeId);
      }
    }
  });

  // Load last expedition resources from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const lastExpeditions = JSON.parse(localStorage.getItem('lastExpeditionResources') || '{}');
      // This will be used in BiomesTab to show the repeat button
      (window as any).lastExpeditionResources = lastExpeditions;
    }
  }, []);

  // Listen for expedition started event to set minimized state
  useEffect(() => {
    const handleExpeditionStarted = (event: CustomEvent) => {
      console.log('Expedition started event received:', event.detail);
      if (event.detail.shouldMinimize) {
        setExpeditionModalOpen(false);
        setExpeditionMinimized(true);
        setActiveExpedition(event.detail.expedition);
      }
    };

    window.addEventListener('expeditionStarted', handleExpeditionStarted as EventListener);
    
    return () => {
      window.removeEventListener('expeditionStarted', handleExpeditionStarted as EventListener);
    };
  }, []);

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

      <main className="container mx-auto px-2 md:px-4 py-3 md:py-6">
        <div className="bg-white rounded-lg shadow-lg mb-4 md:mb-6">
          {/* Horizontal Category Tabs */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative flex items-center space-x-2 px-4 py-3 rounded-t-lg font-medium transition-all ${
                      isActive 
                        ? "bg-white border-t border-l border-r border-gray-300 text-gray-800 -mb-px" 
                        : "bg-gray-50 hover:bg-gray-100 text-gray-600 border-b border-gray-200"
                    }`}
                  >
                    <span className="text-lg">{tab.emoji}</span>
                    <span>{tab.label}</span>
                    {tab.hasNotification && (
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Tab Content */}
            <div className="px-6 pb-6">
              {activeTab === "biomes" && (
                <BiomesTab
                  biomes={biomes}
                  resources={resources}
                  equipment={equipment}
                  player={player}
                  onExpeditionStart={handleExploreBiome}
                  autoRepeatSettings={autoRepeatSettings}
                  onToggleAutoRepeat={toggleAutoRepeat}
                />
              )}
              {activeTab === "quests" && (
                <QuestsTab
                  quests={quests}
                  playerId={player.id}
                />
              )}
              {activeTab === "inventory" && (
                <EnhancedInventoryWithTabs
                  playerId={player.id}
                  resources={resources}
                  equipment={equipment}
                  player={player}
                  isBlocked={false}
                />
              )}
              {activeTab === "storage" && (
                <EnhancedStorageTab
                  playerId={player.id}
                  equipment={equipment}
                  resources={resources}
                />
              )}
              {activeTab === "crafting" && (
                <EnhancedCraftingTab
                  recipes={recipes}
                  playerId={player.id}
                  resources={resources}
                  equipment={equipment}
                />
              )}
              {activeTab === "consumption" && (
                <ConsumptionTab
                  player={player}
                  resources={resources}
                  equipment={equipment}
                />
              )}
            </div>
          </div>
        </div>

        {/* Minimized Expedition Window */}
        {activeExpedition && expeditionMinimized && (
          <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg border-2 z-50 max-w-sm">
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <h3 className="font-bold text-sm">Expedição Ativa</h3>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {biomes.find(b => b.id === activeExpedition.biomeId)?.name}
                  </span>
                </div>
                <button
                  onClick={handleMinimizeExpedition}
                  className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
                >
                  {expeditionMinimizedExpanded ? "▼" : "▲"}
                </button>
              </div>

              {expeditionMinimizedExpanded && (
                <div className="space-y-3 border-t pt-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progresso:</span>
                      <span>{Math.round(activeExpedition.progress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${activeExpedition.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {activeExpedition.progress >= 100 ? (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-green-600">Expedição Concluída!</p>
                      <button
                        onClick={handleCompleteExpedition}
                        className="w-full bg-green-600 text-white py-2 px-4 rounded text-sm hover:bg-green-700"
                        disabled={completeExpeditionMutation.isPending}
                      >
                        {completeExpeditionMutation.isPending ? "Finalizando..." : "Finalizar Expedição"}
                      </button>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-600">
                      Tempo restante: {Math.ceil(((activeExpedition.estimatedDuration - (Date.now() - activeExpedition.startTime)) / 1000) / 60)} min
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Expedition Modal */}
        <ExpeditionSystem
          isOpen={expeditionModalOpen}
          onClose={() => setExpeditionModalOpen(false)}
          onMinimize={handleMinimizeExpedition}
          biome={selectedBiome}
          resources={resources}
          equipment={equipment}
          playerId={player.id}
          player={player}
          onExpeditionComplete={handleCompleteExpedition}
          isMinimized={expeditionMinimized}
          activeExpedition={activeExpedition}
          onExpeditionUpdate={setActiveExpedition}
          onExpeditionStart={() => {
            setExpeditionModalOpen(false);
            setExpeditionMinimized(true);
          }}
        />
      </main>
    </div>
  );
}
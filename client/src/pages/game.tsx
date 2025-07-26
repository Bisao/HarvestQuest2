import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import GameHeader from "@/components/game/game-header";
import BiomesTab from "@/components/game/biomes-tab";
import EnhancedInventory from "@/components/game/enhanced-inventory";
import StorageTab from "@/components/game/storage-tab";
import EnhancedCraftingTab from "@/components/game/enhanced-crafting-tab";
import ExpeditionSystem from "@/components/game/expedition-system";
import { useGameState } from "@/hooks/use-game-state";
import { queryClient } from "@/lib/queryClient";
import type { Player, Biome, Resource, Equipment, Recipe } from "@shared/schema";

export default function Game() {
  const [activeTab, setActiveTab] = useState("biomes");
  const [expeditionModalOpen, setExpeditionModalOpen] = useState(false);
  const [expeditionMinimized, setExpeditionMinimized] = useState(false);
  const [selectedBiome, setSelectedBiome] = useState<Biome | null>(null);
  const [activeExpedition, setActiveExpedition] = useState<any>(null);
  const [autoRepeatSettings, setAutoRepeatSettings] = useState<{[biomeId: string]: {enabled: boolean, resources: string[], countdown: number}}>({});
  const [autoRepeatTimer, setAutoRepeatTimer] = useState<NodeJS.Timeout | null>(null);

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

  const tabs = [
    { id: "biomes", label: "Biomas", emoji: "🌍" },
    { id: "inventory", label: "Inventário", emoji: "🎒" },
    { id: "storage", label: "Armazém", emoji: "🏪" },
    { id: "crafting", label: "Crafting", emoji: "🔨" },
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
      setExpeditionMinimized(!expeditionMinimized);
      if (expeditionMinimized) {
        setExpeditionModalOpen(true);
      } else {
        setExpeditionModalOpen(false);
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

        // Auto-expand when expedition completes
        if (newProgress >= 100) {
          setExpeditionMinimized(false);
          setExpeditionModalOpen(true);
          clearInterval(interval);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [activeExpedition, expeditionMinimized]);

  // Handler for completing expeditions
  const handleCompleteExpedition = () => {
    setActiveExpedition(null);
    setExpeditionModalOpen(false);
    setExpeditionMinimized(false);
    queryClient.invalidateQueries({ queryKey: ["/api/player/Player1"] });
  };

  // Load last expedition resources from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const lastExpeditions = JSON.parse(localStorage.getItem('lastExpeditionResources') || '{}');
      // This will be used in BiomesTab to show the repeat button
      (window as any).lastExpeditionResources = lastExpeditions;
    }
  }, []);

  const handleToggleAutoRepeat = (biomeId: string) => {
    console.log('Toggle auto-repeat for biome:', biomeId);
    
    setAutoRepeatSettings(prev => {
      const newSettings = { ...prev };
      
      // Get last expedition resources
      const lastExpeditions = typeof window !== 'undefined' 
        ? JSON.parse(localStorage.getItem('lastExpeditionResources') || '{}')
        : {};
      
      console.log('Last expeditions:', lastExpeditions);
      console.log('Current settings:', newSettings[biomeId]);
      
      if (newSettings[biomeId]) {
        // Toggle the enabled state
        newSettings[biomeId].enabled = !newSettings[biomeId].enabled;
        
        // If we're enabling auto-repeat, start the countdown immediately
        if (newSettings[biomeId].enabled) {
          newSettings[biomeId].countdown = 10; // Start 10-second countdown
          console.log('Starting countdown for biome:', biomeId);
          
          // Start the countdown timer immediately
          const countdownInterval = setInterval(() => {
            setAutoRepeatSettings(prevSettings => {
              const currentCountdown = prevSettings[biomeId]?.countdown || 0;
              if (currentCountdown <= 1) {
                clearInterval(countdownInterval);
                return {
                  ...prevSettings,
                  [biomeId]: { ...prevSettings[biomeId], countdown: 0 }
                };
              }
              return {
                ...prevSettings,
                [biomeId]: { ...prevSettings[biomeId], countdown: currentCountdown - 1 }
              };
            });
          }, 1000);
          
          setAutoRepeatTimer(countdownInterval);
        } else {
          // If disabling, clear any existing timer and countdown
          if (autoRepeatTimer) {
            clearTimeout(autoRepeatTimer);
            setAutoRepeatTimer(null);
          }
          newSettings[biomeId].countdown = 0;
          console.log('Disabled auto-repeat for biome:', biomeId);
        }
      } else {
        // First time enabling - only if there are last expedition resources
        if (lastExpeditions[biomeId] && lastExpeditions[biomeId].length > 0) {
          newSettings[biomeId] = { 
            enabled: true, 
            resources: lastExpeditions[biomeId], 
            countdown: 10 // Start countdown immediately
          };
          console.log('First time enabling auto-repeat for biome:', biomeId);
          
          // Start the countdown timer immediately
          const countdownInterval = setInterval(() => {
            setAutoRepeatSettings(prevSettings => {
              const currentCountdown = prevSettings[biomeId]?.countdown || 0;
              if (currentCountdown <= 1) {
                clearInterval(countdownInterval);
                return {
                  ...prevSettings,
                  [biomeId]: { ...prevSettings[biomeId], countdown: 0 }
                };
              }
              return {
                ...prevSettings,
                [biomeId]: { ...prevSettings[biomeId], countdown: currentCountdown - 1 }
              };
            });
          }, 1000);
          
          setAutoRepeatTimer(countdownInterval);
        } else {
          console.log('No last expedition resources found for biome:', biomeId);
        }
      }
      
      console.log('New settings:', newSettings);
      return newSettings;
    });
  };

  // Auto-repeat expedition logic - watch for countdown reaching 0 and start expedition
  useEffect(() => {
    const enabledBiome = Object.entries(autoRepeatSettings).find(([_, settings]) => 
      settings.enabled && settings.countdown === 0 && !activeExpedition
    );
    
    if (enabledBiome) {
      const [biomeId, settings] = enabledBiome;
      const biome = biomes?.find(b => b.id === biomeId);
      
      if (biome && player && player.hunger < 90 && player.thirst < 90) {
        console.log('Auto-starting expedition for biome:', biomeId);
        
        // Get last expedition resources
        const lastExpeditions = typeof window !== 'undefined' 
          ? JSON.parse(localStorage.getItem('lastExpeditionResources') || '{}')
          : {};
          
        if (lastExpeditions[biomeId] && lastExpeditions[biomeId].length > 0) {
          // Start expedition automatically
          setSelectedBiome(biome);
          setExpeditionModalOpen(true);
          setExpeditionMinimized(false);
          
          // Auto-start expedition with last resources after modal opens
          setTimeout(() => {
            const event = new CustomEvent('autoStartExpedition', { 
              detail: { resources: lastExpeditions[biomeId] } 
            });
            window.dispatchEvent(event);
          }, 500);
        }
      } else {
        // Disable auto-repeat if conditions aren't met
        setAutoRepeatSettings(prev => ({
          ...prev,
          [biomeId]: { ...prev[biomeId], enabled: false }
        }));
      }
    }
  }, [autoRepeatSettings, activeExpedition, biomes, player]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (autoRepeatTimer) {
        clearTimeout(autoRepeatTimer);
      }
    };
  }, [autoRepeatTimer]);

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
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-1 overflow-x-auto scrollbar-hide">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-1 md:space-x-2 px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? "border-forest text-forest"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <span className="text-base md:text-lg">{tab.emoji}</span>
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.id === "biomes" ? "Biomas" : tab.id === "inventory" ? "Inv." : tab.id === "storage" ? "Arm." : "Craft"}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-3 md:p-6">
            {activeTab === "biomes" && (
              <BiomesTab
                biomes={biomes?.map(biome => {
                  // Get last expedition resources from localStorage
                  const lastExpeditions = typeof window !== 'undefined' 
                    ? JSON.parse(localStorage.getItem('lastExpeditionResources') || '{}')
                    : {};
                  
                  return {
                    ...biome,
                    autoRepeatEnabled: autoRepeatSettings[biome.id]?.enabled || false,
                    autoRepeatCountdown: autoRepeatSettings[biome.id]?.countdown || 0,
                    lastExpeditionResources: lastExpeditions[biome.id] || []
                  };
                }) || []}
                player={player}
                resources={resources}
                activeExpedition={activeExpedition ? {
                  biomeId: activeExpedition.biomeId,
                  progress: activeExpedition.progress || 0,
                  selectedResources: activeExpedition.selectedResources
                } : null}
                onExploreBiome={handleExploreBiome}
                onCompleteExpedition={(expeditionId) => {
                  if (activeExpedition) {
                    handleCompleteExpedition();
                  }
                }}
                onToggleAutoRepeat={handleToggleAutoRepeat}
              />
            )}

            {activeTab === "inventory" && (
              <EnhancedInventory
                playerId={player.id}
                resources={resources}
                equipment={equipment}
                player={player}
                isBlocked={!!activeExpedition}
              />
            )}

            {activeTab === "storage" && (
              <StorageTab
                playerId={player.id}
                resources={resources}
                equipment={equipment}
                autoStorage={player.autoStorage}
                player={player}
                isBlocked={!!activeExpedition}
              />
            )}

            {activeTab === "crafting" && (
              <EnhancedCraftingTab
                recipes={recipes}
                resources={resources}
                playerLevel={player.level}
                playerId={player.id}
                isBlocked={!!activeExpedition}
              />
            )}
          </div>
        </div>
      </main>

      <ExpeditionSystem
        isOpen={expeditionModalOpen}
        onClose={() => {
          setExpeditionModalOpen(false);
          setSelectedBiome(null);
          setActiveExpedition(null);
        }}
        onMinimize={handleMinimizeExpedition}
        biome={selectedBiome}
        resources={resources}
        equipment={equipment}
        playerId={player.id}
        player={player}
        isMinimized={expeditionMinimized}
        onExpeditionComplete={handleCompleteExpedition}
        activeExpedition={activeExpedition}
        onExpeditionUpdate={setActiveExpedition}
      />

      {/* Minimized Expedition Window */}
      {expeditionMinimized && activeExpedition && selectedBiome && (
        <div className="fixed bottom-4 left-4 z-50">
          <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 min-w-[280px]">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{selectedBiome.emoji}</span>
                <div>
                  <h4 className="font-semibold text-sm">Expedição na {selectedBiome.name}</h4>
                  <p className="text-xs text-gray-500">Em andamento...</p>
                </div>
              </div>
              <button
                onClick={handleMinimizeExpedition}
                className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-700"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              </button>
            </div>
            <div className="space-y-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-forest h-2 rounded-full transition-all duration-300"
                  style={{ width: `${activeExpedition.progress || 0}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-600 text-center">
                Progresso: {Math.floor(activeExpedition.progress || 0)}%
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
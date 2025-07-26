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

  // Handler for completing expeditions
  const handleCompleteExpedition = () => {
    setActiveExpedition(null);
    setExpeditionModalOpen(false);
    setExpeditionMinimized(false);
    queryClient.invalidateQueries({ queryKey: ["/api/player/Player1"] });
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
                equipment={equipment}
                player={player}
                playerLevel={player.level}
                activeExpedition={activeExpedition}
                onExploreBiome={handleExploreBiome}
                onCompleteExpedition={handleCompleteExpedition}
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
      />
    </div>
  );
}
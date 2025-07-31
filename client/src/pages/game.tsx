import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import GameHeader from "@/components/game/game-header";
import BiomesTab from "@/components/game/biomes-tab-new";
import QuestsTab from "@/components/game/quests-tab";
import EnhancedInventoryWithTabs from "@/components/game/enhanced-inventory-with-tabs";
import EnhancedStorageTab from "@/components/game/enhanced-storage-tab";
import EnhancedCraftingTab from "@/components/game/enhanced-crafting-tab";

import ExpeditionPanel, { type ActiveExpedition } from "@/components/game/expedition-panel";
import type { Player, Biome, Resource, Equipment, Recipe, InventoryItem } from "@shared/types";
import { useQuestStatus } from "@/hooks/use-quest-status";

export default function Game() {
  const [activeTab, setActiveTab] = useState("biomes");
  const [activeExpedition, setActiveExpedition] = useState<ActiveExpedition | null>(null);
  const [location, setLocation] = useLocation();

  // Get player from URL parameter or localStorage
  const urlParams = new URLSearchParams(location.split('?')[1] || '');
  let playerUsername = urlParams.get('player') || '';
  
  // Fallback to localStorage if no URL parameter
  if (!playerUsername) {
    try {
      const storedPlayer = localStorage.getItem('currentPlayer');
      if (storedPlayer) {
        const parsed = JSON.parse(storedPlayer);
        playerUsername = parsed.username || '';
      }
    } catch (e) {
      console.error("Error parsing stored player:", e);
    }
  }

  // If no player found, redirect to main menu
  if (!playerUsername) {
    setLocation('/');
    return null;
  }

  // Data queries
  const { data: player } = useQuery<Player>({
    queryKey: [`/api/player/${playerUsername}`],
    queryFn: async () => {
      const response = await fetch(`/api/player/${encodeURIComponent(playerUsername)}`);
      if (!response.ok) {
        if (response.status === 404) {
          // Player not found, redirect to main menu
          setLocation('/');
          throw new Error('Player not found');
        }
        throw new Error('Failed to fetch player');
      }
      return response.json();
    }
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

  const { hasCompletableQuests } = useQuestStatus(player?.id || "");


  if (!player) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando jogo...</p>
        </div>
      </div>
    );
  }

  // Handle expedition start from BiomesTab
  const handleExpeditionStart = (expeditionData: any) => {
    const newExpedition: ActiveExpedition = {
      id: expeditionData.id,
      biomeId: expeditionData.biomeId,
      progress: 0,
      selectedResources: expeditionData.selectedResources,
      startTime: Date.now(),
      estimatedDuration: expeditionData.estimatedDuration || 60000, // 1 minute default
      collectedResources: {},
    };
    setActiveExpedition(newExpedition);
  };

  // Handle expedition completion
  const handleExpeditionComplete = (shouldKeepActive = false) => {
    if (!shouldKeepActive) {
      setActiveExpedition(null);
    }
  };

  const tabs = [
    { id: "biomes", label: "Biomas", emoji: "🌍" },
    { id: "inventory", label: "Inventário", emoji: "🎒" },
    { id: "storage", label: "Armazém", emoji: "🏠" },
    { id: "crafting", label: "Crafting", emoji: "🔨" },
    { id: "quests", label: "Missões", emoji: "📜" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Game Header */}
      <GameHeader player={player} />

      <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 max-w-7xl">
        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-lg mb-4 sm:mb-6">
          <div className="flex border-b overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 px-3 sm:px-4 py-3 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-blue-50 text-blue-700 border-b-2 border-blue-500"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <span className="mr-1 sm:mr-2">{tab.emoji}</span>
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.slice(0, 3)}</span>
                 {tab.id === "quests" && hasCompletableQuests && (
                    <span className="absolute -top-1 -right-1 bg-yellow-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center animate-pulse">
                      !
                    </span>
                  )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-3 sm:p-6">
            {activeTab === "biomes" && (
              <BiomesTab
                biomes={biomes}
                resources={resources}
                equipment={equipment}
                player={player}
                onExpeditionStart={handleExpeditionStart}
              />
            )}
            {activeTab === "inventory" && (
              <EnhancedInventoryWithTabs
                playerId={player.id}
                player={player}
                resources={resources}
                equipment={equipment}
                isBlocked={false}
              />
            )}
            {activeTab === "quests" && (
              <QuestsTab
                player={player}
              />
            )}

            {activeTab === "storage" && (
              <EnhancedStorageTab
                playerId={player.id}
                equipment={equipment}
                resources={resources}
                player={player}
              />
            )}
            {activeTab === "crafting" && (
              <EnhancedCraftingTab
                recipes={recipes}
                playerId={player.id}
                resources={resources}
                playerLevel={player.level}
              />
            )}
          </div>
        </div>

        {/* Active Expedition Panel */}
        {activeExpedition && (
          <ExpeditionPanel
            expedition={activeExpedition}
            biomes={biomes}
            resources={resources}
            onExpeditionComplete={handleExpeditionComplete}
          />
        )}
      </main>
    </div>
  );
}
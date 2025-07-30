import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import GameHeader from "@/components/game/game-header";
import BiomesTab from "@/components/game/biomes-tab-new";
import QuestsTab from "@/components/game/quests-tab";
import EnhancedInventoryWithTabs from "@/components/game/enhanced-inventory-with-tabs";
import EnhancedStorageTab from "@/components/game/enhanced-storage-tab";
import EnhancedCraftingTab from "@/components/game/enhanced-crafting-tab";

import ExpeditionPanel, { type ActiveExpedition } from "@/components/game/expedition-panel";
import type { Player, Biome, Resource, Equipment, Recipe, InventoryItem } from "@shared/types";

export default function Game() {
  const [activeTab, setActiveTab] = useState("biomes");
  const [activeExpedition, setActiveExpedition] = useState<ActiveExpedition | null>(null);

  // Data queries
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
  const handleExpeditionComplete = () => {
    setActiveExpedition(null);
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
      {/* Game Header - Fixed at top */}
      <GameHeader player={player} />

      {/* Tab Navigation - Fixed below header */}
      <div className="fixed top-20 left-0 right-0 z-40 bg-white shadow-lg border-b">
        <div className="container mx-auto px-4">
          <div className="flex border-b">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-blue-50 text-blue-700 border-b-2 border-blue-500"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <span className="mr-2">{tab.emoji}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main content with top padding to account for fixed header and tabs */}
      <main className="container mx-auto px-4 py-6 pt-32">
        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-lg p-6">
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
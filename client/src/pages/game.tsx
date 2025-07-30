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
      <div className="fixed top-16 md:top-20 left-0 right-0 z-40 bg-gray-50 shadow-lg border-b border-gray-200">
        <div className="container mx-auto px-2 md:px-4">
          <div className="flex overflow-x-auto gap-2 md:gap-4 py-3 md:py-4 scrollbar-hide">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex flex-col items-center justify-center space-y-1 md:space-y-2 px-3 md:px-6 py-3 md:py-4 rounded-lg font-medium transition-all flex-shrink-0 text-xs md:text-sm min-w-[80px] md:min-w-[120px] h-16 md:h-20 ${
                    isActive 
                      ? "bg-white border-2 border-blue-300 text-blue-700 shadow-md transform scale-105" 
                      : "bg-white hover:bg-gray-50 text-gray-600 border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md"
                  }`}
                >
                  <span className="text-xl md:text-2xl">{tab.emoji}</span>
                  <span className="hidden sm:inline font-semibold">{tab.label}</span>
                  <span className="sm:hidden font-semibold">{
                    tab.id === "biomes" ? "Biom" :
                    tab.id === "inventory" ? "Inv." :
                    tab.id === "storage" ? "Arm." :
                    tab.id === "crafting" ? "Craft" :
                    tab.id === "quests" ? "Miss" :
                    tab.label.slice(0, 4)
                  }</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main content with fixed height and scrolling */}
      <main className="fixed top-24 md:top-32 left-0 right-0 bottom-0 overflow-hidden">
        <div className="container mx-auto px-2 md:px-4 h-full py-2 md:py-6">
          {/* Tab Content - Scrollable container */}
          <div className="bg-white rounded-lg shadow-lg h-full overflow-y-auto p-3 md:p-6">
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
        </div>
      </main>
    </div>
  );
}
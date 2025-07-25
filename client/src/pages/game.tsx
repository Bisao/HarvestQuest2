import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import GameHeader from "@/components/game/game-header";
import BiomesTab from "@/components/game/biomes-tab";
import InventoryTab from "@/components/game/inventory-tab";
import StorageTab from "@/components/game/storage-tab";
import CraftingTab from "@/components/game/crafting-tab";
import ExpeditionModal from "@/components/game/expedition-modal";
import { useGameState } from "@/hooks/use-game-state";
import type { Player, Biome, Resource, Equipment, Recipe } from "@shared/schema";

export default function Game() {
  const [activeTab, setActiveTab] = useState("biomes");
  const [expeditionModalOpen, setExpeditionModalOpen] = useState(false);
  const [selectedBiome, setSelectedBiome] = useState<Biome | null>(null);

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

  const handleExploreBiome = (biome: Biome) => {
    setSelectedBiome(biome);
    setExpeditionModalOpen(true);
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
                onExploreBiome={handleExploreBiome}
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
      />
    </div>
  );
}

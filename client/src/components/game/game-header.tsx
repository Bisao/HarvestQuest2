import { useState, useEffect } from "react";
import type { Player } from "@shared/types";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import PlayerSettings from "./player-settings";
import { useGamePolling } from "@/hooks/useGamePolling";

interface GameHeaderProps {
  player: Player;
}

const GameHeader = ({ player: initialPlayer }: GameHeaderProps) => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  
  // Use polling to get real-time updates
  const { player: polledPlayer } = useGamePolling({
    playerId: initialPlayer?.id || null,
    enabled: !!initialPlayer?.id,
    pollInterval: 1500 // 1.5 seconds for header updates
  });
  
  // Use polled data if available, fallback to initial player data
  const currentPlayer = polledPlayer || initialPlayer;
  
  // Ensure we have valid values for calculations
  const currentHunger = Math.max(0, currentPlayer.hunger || 0);
  const currentThirst = Math.max(0, currentPlayer.thirst || 0);
  const maxHunger = currentPlayer.maxHunger || 100;
  const maxThirst = currentPlayer.maxThirst || 100;
  
  // Calculate values directly to ensure real-time updates
  const experiencePercentage = Math.min(((currentPlayer.experience % 100) / 100) * 100, 100);
  const hungerPercentage = Math.min((currentHunger / maxHunger) * 100, 100);
  const thirstPercentage = Math.min((currentThirst / maxThirst) * 100, 100);

  return (
    <>
      <header className="bg-white shadow-md border-b-4 border-forest">
        <div className="container mx-auto px-4 py-3 md:py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3 md:gap-0">
            <div className="flex items-center space-x-2 md:space-x-3">
              <span className="text-2xl md:text-3xl">🎮</span>
              <h1 className="text-lg md:text-2xl font-bold text-gray-800">Coletor Adventures</h1>
            </div>
            <div className="flex items-center space-x-3 md:space-x-6 text-xs md:text-sm">
              <div className="flex flex-col items-center space-y-1">
                <div className="flex items-center space-x-1 md:space-x-2 min-w-0">
                  <span className="text-sm md:text-lg">⭐</span>
                  <span className="font-semibold whitespace-nowrap">Nível {currentPlayer.level}</span>
                </div>
                <div className="w-full">
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="bg-purple-500 h-1.5 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${experiencePercentage}%` 
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-center space-y-1">
                <div className="flex items-center space-x-1 md:space-x-2 min-w-0">
                  <span className="text-sm md:text-lg">🍖</span>
                  <span className="font-semibold whitespace-nowrap">{currentHunger}/{maxHunger}</span>
                </div>
                <div className="w-full">
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className={`h-1.5 rounded-full transition-all duration-500 ${
                        hungerPercentage <= 5 ? 'bg-red-600 animate-pulse' :
                        hungerPercentage <= 20 ? 'bg-red-400' :
                        hungerPercentage <= 50 ? 'bg-orange-500' :
                        'bg-green-500'
                      }`}
                      style={{ 
                        width: `${hungerPercentage}%` 
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-center space-y-1">
                <div className="flex items-center space-x-1 md:space-x-2 min-w-0">
                  <span className="text-sm md:text-lg">💧</span>
                  <span className="font-semibold whitespace-nowrap">{currentThirst}/{maxThirst}</span>
                </div>
                <div className="w-full">
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className={`h-1.5 rounded-full transition-all duration-500 ${
                        thirstPercentage <= 5 ? 'bg-red-600 animate-pulse' :
                        thirstPercentage <= 20 ? 'bg-red-400' :
                        thirstPercentage <= 50 ? 'bg-blue-400' :
                        'bg-blue-500'
                      }`}
                      style={{ 
                        width: `${thirstPercentage}%` 
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-1 md:space-x-2">
                <span className="text-sm md:text-lg">💰</span>
                <span className="font-semibold">{(currentPlayer.coins || 0).toLocaleString()}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSettingsOpen(true)}
                className="text-gray-600 hover:text-gray-800 p-1 md:p-2"
              >
                <Settings className="w-3 h-3 md:w-4 md:h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      <PlayerSettings 
        player={currentPlayer}
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </>
  );
};

export default GameHeader;

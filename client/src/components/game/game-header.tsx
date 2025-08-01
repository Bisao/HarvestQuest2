import { useState, memo, useMemo } from "react";
import type { Player } from "@shared/types";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import PlayerSettings from "./player-settings";

interface GameHeaderProps {
  player: Player;
}

const GameHeader = memo(({ player }: GameHeaderProps) => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  
  // Memoize calculated values to prevent unnecessary re-renders
  const playerStats = useMemo(() => ({
    level: player.level,
    experience: player.experience,
    hunger: player.hunger,
    maxHunger: player.maxHunger,
    thirst: player.thirst,
    maxThirst: player.maxThirst,
    coins: player.coins || 0,
    experiencePercentage: Math.min(((player.experience % 100) / 100) * 100, 100),
    hungerPercentage: Math.min((player.hunger / player.maxHunger) * 100, 100),
    thirstPercentage: Math.min((player.thirst / player.maxThirst) * 100, 100)
  }), [player.level, player.experience, player.hunger, player.maxHunger, player.thirst, player.maxThirst, player.coins]);

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
                  <span className="font-semibold whitespace-nowrap">Nível {playerStats.level}</span>
                </div>
                <div className="w-full">
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="bg-purple-500 h-1.5 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${playerStats.experiencePercentage}%` 
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-center space-y-1">
                <div className="flex items-center space-x-1 md:space-x-2 min-w-0">
                  <span className="text-sm md:text-lg">🍖</span>
                  <span className="font-semibold whitespace-nowrap">{playerStats.hunger}/{playerStats.maxHunger}</span>
                </div>
                <div className="w-full">
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="bg-orange-500 h-1.5 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${playerStats.hungerPercentage}%` 
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-center space-y-1">
                <div className="flex items-center space-x-1 md:space-x-2 min-w-0">
                  <span className="text-sm md:text-lg">💧</span>
                  <span className="font-semibold whitespace-nowrap">{playerStats.thirst}/{playerStats.maxThirst}</span>
                </div>
                <div className="w-full">
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="bg-blue-500 h-1.5 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${playerStats.thirstPercentage}%` 
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-1 md:space-x-2">
                <span className="text-sm md:text-lg">💰</span>
                <span className="font-semibold">{playerStats.coins.toLocaleString()}</span>
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
        player={player}
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </>
  );
});

GameHeader.displayName = 'GameHeader';

export default GameHeader;

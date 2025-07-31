import { useState } from "react";
import type { Player } from "@shared/types";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import PlayerSettings from "./player-settings";

interface GameHeaderProps {
  player: Player;
}

export default function GameHeader({ player }: GameHeaderProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);

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
                <div className="flex items-center space-x-1 md:space-x-2">
                  <span className="text-sm md:text-lg">⭐</span>
                  <span className="font-semibold">Nível {player.level}</span>
                </div>
                <div className="w-12 md:w-16">
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="bg-purple-500 h-1.5 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${Math.min(((player.experience % 100) / 100) * 100, 100)}%` 
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-center space-y-1">
                <div className="flex items-center space-x-1 md:space-x-2">
                  <span className="text-sm md:text-lg">🍖</span>
                  <span className="font-semibold">{player.hunger}/{player.maxHunger}</span>
                </div>
                <div className="w-12 md:w-16">
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="bg-orange-500 h-1.5 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${Math.min((player.hunger / player.maxHunger) * 100, 100)}%` 
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-center space-y-1">
                <div className="flex items-center space-x-1 md:space-x-2">
                  <span className="text-sm md:text-lg">💧</span>
                  <span className="font-semibold">{player.thirst}/{player.maxThirst}</span>
                </div>
                <div className="w-12 md:w-16">
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${Math.min((player.thirst / player.maxThirst) * 100, 100)}%` 
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-1 md:space-x-2">
                <span className="text-sm md:text-lg">💰</span>
                <span className="font-semibold">{(player.coins || 0).toLocaleString()}</span>
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
}

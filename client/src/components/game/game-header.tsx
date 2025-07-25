import type { Player } from "@shared/schema";

interface GameHeaderProps {
  player: Player;
}

export default function GameHeader({ player }: GameHeaderProps) {
  return (
    <header className="bg-white shadow-md border-b-4 border-forest">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">🎮</span>
            <h1 className="text-2xl font-bold text-gray-800">Coletor Adventures</h1>
          </div>
          <div className="flex items-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <span className="text-lg">⭐</span>
              <span className="font-semibold">Nível {player.level}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-lg">⚡</span>
              <span className="font-semibold">{player.energy}/{player.maxEnergy}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-lg">💰</span>
              <span className="font-semibold">{player.coins.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

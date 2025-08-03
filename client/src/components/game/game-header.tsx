import { useState } from "react";
import type { Player } from "@shared/types";
import { Button } from "@/components/ui/button";
import { Settings, Sun, Moon, Thermometer, Calendar } from "lucide-react";
import PlayerSettings from "./player-settings";
import { useGameTime } from "@/hooks/useGameTime";

interface GameHeaderProps {
  player: Player;
}

const GameHeader = ({ player }: GameHeaderProps) => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  
  // Usar hook de tempo do jogo
  const { gameTime, temperature } = useGameTime(player?.id);

  // Função para formatar hora
  const formatTime = (hour: number, minute: number) => {
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  };

  // Função para formatar data
  const formatDate = (day: number, month: number, year: number) => {
    return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;
  };

  // Emoji baseado no período do dia
  const getTimeEmoji = (timeOfDay: string) => {
    switch (timeOfDay) {
      case 'dawn': return '🌅';
      case 'morning': return '☀️';
      case 'afternoon': return '🌞';
      case 'evening': return '🌇';
      case 'night': return '🌙';
      case 'midnight': return '🌚';
      default: return '🕐';
    }
  };

  // Emoji baseado na estação
  const getSeasonEmoji = (season: string) => {
    switch (season) {
      case 'spring': return '🌸';
      case 'summer': return '☀️';
      case 'autumn': return '🍂';
      case 'winter': return '❄️';
      default: return '🌍';
    }
  };

  // Cor da temperatura
  const getTemperatureColor = (temp: number) => {
    if (temp < -10) return 'text-blue-600';
    if (temp < 5) return 'text-blue-400';
    if (temp < 15) return 'text-green-600';
    if (temp < 25) return 'text-yellow-600';
    if (temp < 35) return 'text-orange-500';
    return 'text-red-500';
  };

  return (
    <>
      <header className="bg-white shadow-md border-b-4 border-forest">
        <div className="container mx-auto px-4 py-3 md:py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3 md:gap-0">
            {/* Logo */}
            <div className="flex items-center space-x-2 md:space-x-3">
              <span className="text-2xl md:text-3xl">🎮</span>
              <h1 className="text-lg md:text-2xl font-bold text-gray-800">Coletor Adventures</h1>
            </div>
            
            {/* Informações de Tempo e Data */}
            <div className="flex items-center space-x-4 md:space-x-6 text-sm">
              {gameTime && (
                <>
                  {/* Data */}
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4 text-gray-600" />
                    <span className="font-medium text-gray-700">
                      {formatDate(gameTime.dayNumber, gameTime.monthNumber, gameTime.yearNumber)}
                    </span>
                  </div>

                  {/* Hora */}
                  <div className="flex items-center space-x-1">
                    <span className="text-lg">{getTimeEmoji(gameTime.timeOfDay)}</span>
                    <span className="font-medium text-gray-700">
                      {formatTime(gameTime.hour, gameTime.minute)}
                    </span>
                  </div>

                  {/* Estação */}
                  <div className="flex items-center space-x-1">
                    <span className="text-lg">{getSeasonEmoji(gameTime.season)}</span>
                    <span className="font-medium text-gray-600 capitalize">
                      {gameTime.season === 'spring' ? 'Primavera' :
                       gameTime.season === 'summer' ? 'Verão' :
                       gameTime.season === 'autumn' ? 'Outono' : 'Inverno'}
                    </span>
                  </div>

                  {/* Indicador Dia/Noite */}
                  <div className="flex items-center space-x-1">
                    {gameTime.isDay ? (
                      <Sun className="w-4 h-4 text-yellow-500" />
                    ) : (
                      <Moon className="w-4 h-4 text-blue-400" />
                    )}
                    <span className="text-xs text-gray-500">
                      {gameTime.isDay ? 'Dia' : 'Noite'}
                    </span>
                  </div>
                </>
              )}

              {/* Temperatura */}
              {temperature && (
                <div className="flex items-center space-x-1">
                  <Thermometer className="w-4 h-4 text-gray-600" />
                  <span className={`font-medium ${getTemperatureColor(temperature.current)}`}>
                    {temperature.current}°C
                  </span>
                </div>
              )}

              {/* Botão de Configurações */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSettingsOpen(true)}
                className="text-gray-600 hover:text-gray-800 p-2"
              >
                <Settings className="w-4 h-4" />
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
};

export default GameHeader;
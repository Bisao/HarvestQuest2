import { useLocation, useRoute } from 'wouter';
import { useEffect, useState } from 'react';
import { GameProvider } from '../contexts/GameContext';
import { ModernGameLayout } from '../components/game/modern-game-layout';
import LoadingScreen from '../components/game/loading-screen';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Home, AlertTriangle } from 'lucide-react';

function Game() {
  const [location] = useLocation();
  const [, params] = useRoute('/game');
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      // Extract player from URL params
      const urlParams = new URLSearchParams(location.split('?')[1] || '');
      const playerParam = urlParams.get('player');

      console.log('🎮 GAME: URL location:', location);
      console.log('🎮 GAME: Player param:', playerParam);

      if (!playerParam) {
        setError('Nenhum jogador especificado na URL');
        return;
      }

      if (playerParam.trim() === '') {
        setError('Nome do jogador não pode estar vazio');
        return;
      }

      setPlayerId(playerParam);
      setError(null);
    } catch (err) {
      console.error('🎮 GAME: Error parsing URL:', err);
      setError('Erro ao processar parâmetros da URL');
    }
  }, [location]);

  const handleGoHome = () => {
    window.location.href = '/';
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <AlertTriangle className="w-12 h-12 text-red-500" />
            </div>
            <CardTitle className="text-lg text-red-700">Erro de Navegação</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleGoHome} className="w-full flex items-center gap-2">
              <Home className="w-4 h-4" />
              Voltar ao Menu
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!playerId) {
    return <LoadingScreen />;
  }

  return (
    <GameProvider playerId={playerId}>
      <ModernGameLayout />
    </GameProvider>
  );
}

export default Game;
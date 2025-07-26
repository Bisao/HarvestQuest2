import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import type { Player } from "@shared/schema";

interface SaveSlot {
  id: string;
  username: string;
  level: number;
  lastPlayed: string;
  totalPlayTime?: string;
}

export default function MainMenu() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showNewGame, setShowNewGame] = useState(false);
  const [showLoadGame, setShowLoadGame] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Query for existing save slots
  const { data: saveSlots = [] } = useQuery<SaveSlot[]>({
    queryKey: ["/api/saves"],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', '/api/saves');
        const data = await response.json();
        return data;
      } catch {
        return []; // If API doesn't exist yet, return empty array
      }
    }
  });

  const handleNewGame = async () => {
    if (!newPlayerName.trim()) {
      toast({
        title: "Nome Necessário",
        description: "Por favor, digite um nome para o jogador.",
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);
    try {
      const response = await apiRequest('POST', '/api/player', {
        username: newPlayerName.trim()
      });
      
      if (response.ok) {
        const player = await response.json();
        // Store current player in localStorage for the game
        localStorage.setItem('currentPlayer', JSON.stringify(player));
        
        toast({
          title: "Jogador Criado!",
          description: `Bem-vindo, ${newPlayerName}! Sua aventura começou.`,
        });
        
        setLocation(`/game?player=${player.username}`);
      } else {
        const error = await response.json();
        toast({
          title: "Erro",
          description: error.message || "Falha ao criar jogador.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao conectar com o servidor.",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleLoadGame = (saveSlot: SaveSlot) => {
    // Store selected player in localStorage
    localStorage.setItem('currentPlayer', JSON.stringify({
      id: saveSlot.id,
      username: saveSlot.username
    }));
    
    setLocation(`/game?player=${saveSlot.username}`);
  };

  const handleContinueLastGame = () => {
    if (saveSlots.length > 0) {
      // Continue with the most recently played game
      const lastSave = saveSlots[0];
      handleLoadGame(lastSave);
    } else {
      setShowNewGame(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Game Title */}
        <div className="text-center space-y-4">
          <div className="text-6xl mb-4">🎮</div>
          <h1 className="text-4xl font-bold text-gray-800">Coletor Adventures</h1>
          <p className="text-lg text-gray-600">Explore, colete e construa sua aventura!</p>
        </div>

        {/* Main Menu Options */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-6 space-y-4">
            {saveSlots.length > 0 && (
              <Button 
                onClick={handleContinueLastGame}
                className="w-full h-12 text-lg bg-green-600 hover:bg-green-700"
              >
                🚀 Continuar Jogo
              </Button>
            )}
            
            <Button 
              onClick={() => setShowNewGame(true)}
              variant={saveSlots.length > 0 ? "outline" : "default"}
              className={`w-full h-12 text-lg ${saveSlots.length === 0 ? "bg-green-600 hover:bg-green-700" : ""}`}
            >
              ✨ Novo Jogo
            </Button>

            {saveSlots.length > 0 && (
              <Button 
                onClick={() => setShowLoadGame(true)}
                variant="outline"
                className="w-full h-12 text-lg"
              >
                📁 Carregar Jogo
              </Button>
            )}

            <Button 
              variant="outline"
              className="w-full h-12 text-lg"
              disabled
            >
              ⚙️ Configurações
            </Button>
          </CardContent>
        </Card>

        {/* Game Info */}
        <div className="text-center text-sm text-gray-500 space-y-1">
          <p>Versão 1.0 - Auto-Save Ativado</p>
          <p>Desenvolvido com ❤️ em Replit</p>
        </div>
      </div>

      {/* New Game Dialog */}
      <Dialog open={showNewGame} onOpenChange={setShowNewGame}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>✨ Criar Novo Jogador</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Nome do Jogador:</label>
              <Input
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                placeholder="Digite seu nome..."
                onKeyPress={(e) => e.key === 'Enter' && handleNewGame()}
                disabled={isCreating}
              />
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={() => setShowNewGame(false)}
                variant="outline"
                className="flex-1"
                disabled={isCreating}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleNewGame}
                className="flex-1 bg-green-600 hover:bg-green-700"
                disabled={isCreating || !newPlayerName.trim()}
              >
                {isCreating ? "Criando..." : "Começar Aventura"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Load Game Dialog */}
      <Dialog open={showLoadGame} onOpenChange={setShowLoadGame}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>📁 Carregar Jogo</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {saveSlots.map((save, index) => (
              <Card key={save.id} className="cursor-pointer hover:bg-gray-50 transition-colors">
                <CardContent className="p-4" onClick={() => handleLoadGame(save)}>
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold text-gray-800">{save.username}</h4>
                      <p className="text-sm text-gray-600">Nível {save.level}</p>
                      <p className="text-xs text-gray-500">
                        Última vez: {new Date(save.lastPlayed).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-2xl">
                      {index === 0 ? "🌟" : "👤"}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {saveSlots.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">📦</div>
                <p>Nenhum jogo salvo encontrado</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { User, Play, Trash2, Gamepad2, Compass, Hammer, Trophy, Wifi, WifiOff, RefreshCw, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { LocalStorageManager, type LocalSave } from "@/lib/local-storage";

interface SaveSlot {
  id: string;
  username: string;
  level: number;
  experience: number;
  lastPlayed: number;
}

async function apiRequest(method: string, path: string, body?: any) {
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  return fetch(path, options);
}

export default function MainMenu() {
  const [newPlayerName, setNewPlayerName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();
  const [location, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [localSaves, setLocalSaves] = useState<LocalSave[]>([]);
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);

  // Get saved games with local storage integration
  const { data: serverSaves = [], isLoading: isLoadingSaves } = useQuery({
    queryKey: ["/api/saves"],
    queryFn: async () => {
      const response = await fetch("/api/saves");
      if (!response.ok) {
        throw new Error("Failed to fetch saves");
      }
      return response.json();
    },
    retry: 1,
  });

  // Monitor online status only
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load local saves on initial mount only
  useEffect(() => {
    const saves = LocalStorageManager.getSaves();
    setLocalSaves(saves);
  }, []);

  // Create new player with local storage backup
  const createPlayerMutation = useMutation({
    mutationFn: async (username: string) => {
      // First, try to create on server if online
      if (isOnline) {
        const response = await fetch("/api/player", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to create player");
        }

        return response.json();
      } else {
        // Create offline player
        const localSave: LocalSave = {
          id: `local_${Date.now()}`,
          username,
          level: 1,
          experience: 0,
          lastPlayed: Date.now(),
          syncedWithServer: false
        };

        LocalStorageManager.addSave(localSave);
        return localSave;
      }
    },
    onSuccess: (data) => {
      toast({
        title: "Sucesso!",
        description: `Jogador ${data.username} criado ${isOnline ? 'com sucesso!' : 'offline!'}`,
      });

      // Store player data in localStorage
      LocalStorageManager.setCurrentPlayer(data.username, data.id);

      // Add to local saves if created online
      if (isOnline) {
        LocalStorageManager.addSave({
          id: data.id,
          username: data.username,
          level: data.level || 1,
          experience: data.experience || 0,
          lastPlayed: Date.now(),
          syncedWithServer: true
        });
        queryClient.invalidateQueries({ queryKey: ["/api/saves"] });
      }

      // Update local state
      setLocalSaves(LocalStorageManager.getSaves());
      setLocation(`/game?player=${encodeURIComponent(data.username)}`);
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });


  // Delete save with local storage support
  const deleteSaveMutation = useMutation({
    mutationFn: async (playerId: string) => {
      const response = await fetch(`/api/saves/${playerId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete save");
      }

      return response.json();
    },
    onSuccess: (_, playerId) => {
      toast({
        title: "Sucesso!",
        description: "Jogo deletado com sucesso!",
      });

      // Remove from local storage
      const save = localSaves.find(s => s.id === playerId);
      if (save) {
        LocalStorageManager.removeSave(save.username);
        setLocalSaves(LocalStorageManager.getSaves());
      }

      queryClient.invalidateQueries({ queryKey: ["/api/saves"] });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao deletar o jogo.",
        variant: "destructive",
      });
    },
  });

  const handleCreatePlayer = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPlayerName.trim()) {
      toast({
        title: "Nome inválido",
        description: "Por favor, insira um nome válido.",
        variant: "destructive"
      });
      return;
    }

    if (newPlayerName.trim().length < 2) {
      toast({
        title: "Nome muito curto",
        description: "O nome deve ter pelo menos 2 caracteres.",
        variant: "destructive"
      });
      return;
    }

    if (newPlayerName.length > 20) {
      toast({
        title: "Nome muito longo",
        description: "O nome não pode ter mais de 20 caracteres.",
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);
    createPlayerMutation.mutate(newPlayerName.trim());
  };

  const handleLoadGame = (username: string) => {
    setLocation(`/game?player=${encodeURIComponent(username)}`);
  };

  const handleDeleteSave = (playerId: string, username: string) => {
    if (window.confirm(`Tem certeza que deseja deletar o jogo de ${username}? Esta ação não pode ser desfeita.`)) {
      deleteSaveMutation.mutate(playerId);
    }
  };

  const formatLastPlayed = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Gamepad2 className="h-8 w-8 text-green-600" />
            <h1 className="text-4xl font-bold text-gray-800">Coletor Adventures</h1>
          </div>
          <p className="text-gray-600 text-lg">
            Explore biomas, colete recursos e construa seu império!
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Create New Game */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Novo Jogo
              </CardTitle>
              <CardDescription>
                Crie um novo personagem e comece sua aventura
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreatePlayer} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="playerName">Nome do Jogador</Label>
                  <Input
                    id="playerName"
                    type="text"
                    placeholder="Digite seu nome..."
                    value={newPlayerName}
                    onChange={(e) => setNewPlayerName(e.target.value)}
                    maxLength={20}
                    disabled={isCreating}
                    className="w-full"
                  />
                  <div className="text-sm text-gray-500">
                    {newPlayerName.length}/20 caracteres
                  </div>
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isCreating || !newPlayerName.trim()}
                >
                  {isCreating ? "Criando..." : "Criar Jogador"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Load Existing Game */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Jogos Salvos
              </CardTitle>
              <CardDescription>
                Continue sua aventura onde parou
              </CardDescription>
            </CardHeader>
            <CardContent>
             {isOnline ? (
                <Badge className="mb-2 w-full rounded-md" variant="outline">
                  <Wifi className="mr-2 h-4 w-4" /> Online
                </Badge>
              ) : (
                <Badge className="mb-2 w-full rounded-md" variant="destructive">
                  <WifiOff className="mr-2 h-4 w-4" /> Offline
                </Badge>
              )}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {isLoadingSaves ? (
                  <div className="text-center py-8 text-gray-500">
                    Carregando jogos salvos...
                  </div>
                ) : localSaves.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Nenhum jogo salvo encontrado.
                    <br />
                    Crie um novo jogo para começar!
                  </div>
                ) : (
                  localSaves.map((save) => (
                    <div
                      key={save.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-800">
                            {save.username}
                          </h3>
                          <Badge variant="secondary">
                            Nível {save.level}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          Última sessão: {formatLastPlayed(save.lastPlayed)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {save.experience} XP
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleLoadGame(save.username)}
                          className="flex items-center gap-1"
                        >
                          <Play className="h-4 w-4" />
                          Jogar
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteSave(save.id, save.username)}
                          disabled={deleteSaveMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Game Info */}
        <Card>
          <CardHeader>
            <CardTitle>Como Jogar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600">
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">🗺️ Explore</h4>
                <p>Descubra diferentes biomas e colete recursos únicos de cada região.</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">🔧 Construa</h4>
                <p>Use recursos coletados para criar ferramentas, armas e equipamentos.</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">📈 Evolua</h4>
                <p>Ganhe experiência, suba de nível e desbloqueie novas habilidades.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
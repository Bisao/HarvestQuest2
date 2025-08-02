import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Play, User, Plus, Trash2, Wifi, WifiOff, AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface SaveGame {
  id: string;
  username: string;
  level: number;
  experience: number;
  lastPlayed: number;
  offlineExpeditionActive?: boolean;
}

export default function MainMenu() {
  const [newPlayerName, setNewPlayerName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();
  const [location, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);
  const [playerToDelete, setPlayerToDelete] = useState<{ id: string; username: string } | null>(null);

  // Get saved games directly from server
  const { data: savedGames = [], isLoading: isLoadingSaves } = useQuery({
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

  // Monitor online status
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

  // Create new player
  const createPlayerMutation = useMutation({
    mutationFn: async (username: string) => {
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
    },
    onSuccess: (data) => {
      setNewPlayerName("");
      toast({
        title: "Jogador criado!",
        description: `${data.username} está pronto para aventura!`,
      });

      // Refresh saves list
      queryClient.invalidateQueries({ queryKey: ["/api/saves"] });
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

  // Delete save
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
    onSuccess: () => {
      toast({
        title: "Sucesso!",
        description: "Jogo deletado com sucesso!",
      });

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
    if (!newPlayerName.trim()) return;

    setIsCreating(true);
    try {
      await createPlayerMutation.mutateAsync(newPlayerName.trim());
    } finally {
      setIsCreating(false);
    }
  };

  const handleLoadGame = (username: string) => {
    console.log("Loading game for player:", username);
    const gameUrl = `/game?player=${encodeURIComponent(username)}`;
    console.log("Navigating to:", gameUrl);
    setLocation(gameUrl);
  };

  const handleDeleteSave = (playerId: string, username: string) => {
    setPlayerToDelete({ id: playerId, username });
  };

  const confirmDelete = () => {
    if (playerToDelete) {
      deleteSaveMutation.mutate(playerToDelete.id);
      setPlayerToDelete(null);
    }
  };

  const formatLastPlayed = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return "Agora mesmo";
    if (diffInHours < 24) return `${diffInHours}h atrás`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d atrás`;

    return date.toLocaleDateString('pt-BR');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-3">
            🎮 Coletor Adventures
          </h1>
          <p className="text-lg text-gray-600">
            Explore biomas, colete recursos e construa seu império!
          </p>
        </div>

        {/* Main Content */}
        <div className="grid md:grid-cols-2 gap-8">
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
                <div>
                  <label htmlFor="playerName" className="block text-sm font-medium text-gray-700 mb-2">
                    Nome do Jogador
                  </label>
                  <Input
                    id="playerName"
                    type="text"
                    value={newPlayerName}
                    onChange={(e) => setNewPlayerName(e.target.value)}
                    placeholder="Digite seu nome..."
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
                ) : savedGames.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Nenhum jogo salvo encontrado.
                    <br />
                    Crie um novo jogo para começar!
                  </div>
                ) : (
                  savedGames.map((save: SaveGame) => (
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
                          {save.offlineExpeditionActive && (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              🏃 Expedição Offline
                            </Badge>
                          )}
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
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="destructive"
                              disabled={deleteSaveMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-red-500" />
                                Confirmar Exclusão
                              </AlertDialogTitle>
                              <AlertDialogDescription asChild>
                                <div>
                                  <p>Tem certeza de que deseja deletar o jogador <strong>"{save.username}"</strong>?</p>
                                  <br />
                                  <p>Esta ação é permanente e não pode ser desfeita. Todos os dados do jogador, incluindo:</p>
                                  <ul className="list-disc list-inside mt-2 space-y-1">
                                    <li>Nível {save.level} e {save.experience} XP</li>
                                    <li>Inventário e recursos coletados</li>
                                    <li>Progresso de missões e conquistas</li>
                                    <li>Equipamentos e itens crafted</li>
                                  </ul>
                                  <br />
                                  <p>serão perdidos permanentemente.</p>
                                </div>
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteSaveMutation.mutate(save.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Sim, Deletar Permanentemente
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
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
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl mb-2">🌍</div>
                <h3 className="font-semibold text-green-700 mb-2">Explore</h3>
                <p className="text-sm text-gray-600">
                  Descubra diferentes biomas e colete recursos únicos de cada região.
                </p>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">🔨</div>
                <h3 className="font-semibold text-blue-700 mb-2">Construa</h3>
                <p className="text-sm text-gray-600">
                  Use recursos coletados para criar ferramentas, armas e equipamentos.
                </p>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">📈</div>
                <h3 className="font-semibold text-purple-700 mb-2">Evolua</h3>
                <p className="text-sm text-gray-600">
                  Ganhe experiência, suba de nível e desbloqueie novas habilidades.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
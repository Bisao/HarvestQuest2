
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Play, Wifi, WifiOff, Users, Clock, Star } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface SaveGame {
  id: string;
  username: string;
  level: number;
  experience: number;
  lastPlayed: number;
  offlineExpeditionActive?: boolean;
}

interface PlayerCardProps {
  save: SaveGame;
  isOnline: boolean;
  onPlay: (save: SaveGame) => void;
  onDelete: (save: SaveGame) => void;
}

function PlayerCard({ save, isOnline, onPlay, onDelete }: PlayerCardProps) {
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
    <Card className="group hover:shadow-lg transition-all duration-200 border-2 hover:border-blue-200">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-gray-800">
            {save.username}
          </CardTitle>
          <div className="flex items-center gap-2">
            {save.offlineExpeditionActive && (
              <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                <Star className="w-3 h-3 mr-1" />
                Expedição
              </Badge>
            )}
            {isOnline ? (
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                <Wifi className="w-3 h-3 mr-1" />
                Online
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                <WifiOff className="w-3 h-3 mr-1" />
                Offline
              </Badge>
            )}
          </div>
        </div>
        <CardDescription className="text-sm text-gray-600">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              Nível {save.level}
            </span>
            <span className="flex items-center gap-1">
              <Star className="w-4 h-4" />
              {save.experience} XP
            </span>
          </div>
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            Última sessão: {formatLastPlayed(save.lastPlayed)}
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={() => onPlay(save)}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
            disabled={!isOnline}
          >
            <Play className="w-4 h-4 mr-2" />
            Jogar
          </Button>
          
          <Button
            onClick={() => onDelete(save)}
            variant="outline"
            size="icon"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

interface CreatePlayerFormProps {
  newPlayerName: string;
  isCreating: boolean;
  isOnline: boolean;
  onNameChange: (name: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

function CreatePlayerForm({ newPlayerName, isCreating, isOnline, onNameChange, onSubmit }: CreatePlayerFormProps) {
  return (
    <Card className="border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors">
      <CardHeader>
        <CardTitle className="text-lg text-gray-700">Criar Novo Jogador</CardTitle>
        <CardDescription>
          Crie um novo personagem para começar sua aventura
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <Input
            type="text"
            placeholder="Nome do jogador"
            value={newPlayerName}
            onChange={(e) => onNameChange(e.target.value)}
            maxLength={20}
            className="border-2 focus:border-blue-400"
          />
          
          <Button 
            type="submit" 
            className="w-full bg-green-600 hover:bg-green-700"
            disabled={isCreating || !newPlayerName.trim() || !isOnline}
          >
            {isCreating ? "Criando..." : "Criar Jogador"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

interface DeleteConfirmationDialogProps {
  playerToDelete: { id: string; username: string } | null;
  onConfirm: () => void;
  onCancel: () => void;
}

function DeleteConfirmationDialog({ playerToDelete, onConfirm, onCancel }: DeleteConfirmationDialogProps) {
  return (
    <AlertDialog open={!!playerToDelete} onOpenChange={() => onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir Jogador</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir o jogador "{playerToDelete?.username}"? 
            Esta ação não pode ser desfeita e todos os dados serão perdidos permanentemente.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-red-600 hover:bg-red-700">
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default function MainMenu() {
  const [newPlayerName, setNewPlayerName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);
  const [playerToDelete, setPlayerToDelete] = useState<{ id: string; username: string } | null>(null);
  
  const { toast } = useToast();
  const [location, setLocation] = useLocation();
  const queryClient = useQueryClient();

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

  // Fetch saved games
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

  // Create player mutation
  const createPlayerMutation = useMutation({
    mutationFn: async (username: string) => {
      const response = await fetch("/api/saves", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Failed to create player");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/saves"] });
      setNewPlayerName("");
      setIsCreating(false);
      toast({
        title: "Sucesso!",
        description: "Jogador criado com sucesso!",
      });
    },
    onError: (error: Error) => {
      setIsCreating(false);
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete player mutation
  const deletePlayerMutation = useMutation({
    mutationFn: async (playerId: string) => {
      const response = await fetch(`/api/saves/${playerId}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete player");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/saves"] });
      setPlayerToDelete(null);
      toast({
        title: "Sucesso!",
        description: "Jogador excluído com sucesso!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCreatePlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlayerName.trim() || !isOnline) return;
    
    setIsCreating(true);
    createPlayerMutation.mutate(newPlayerName.trim());
  };

  const handlePlayGame = (save: SaveGame) => {
    if (!isOnline) return;
    
    console.log("Loading game for player:", save.username);
    const gameUrl = `/game?player=${encodeURIComponent(save.username)}`;
    console.log("Navigating to:", gameUrl);
    setLocation(gameUrl);
  };

  const handleDeletePlayer = (save: SaveGame) => {
    setPlayerToDelete({ id: save.id, username: save.username });
  };

  const confirmDeletePlayer = () => {
    if (playerToDelete) {
      deletePlayerMutation.mutate(playerToDelete.id);
    }
  };

  if (isLoadingSaves) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600">Carregando jogadores salvos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-800 tracking-tight">
            🎮 Coletor Adventures
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Continue sua aventura onde parou ou crie um novo personagem para explorar 
            um mundo cheio de recursos, crafting e expedições emocionantes!
          </p>
          
          {/* Connection Status */}
          <div className="flex justify-center">
            {isOnline ? (
              <Badge className="bg-green-100 text-green-700 border-green-200">
                <Wifi className="w-4 h-4 mr-2" />
                Conectado
              </Badge>
            ) : (
              <Badge variant="destructive" className="bg-red-100 text-red-700 border-red-200">
                <WifiOff className="w-4 h-4 mr-2" />
                Desconectado - Verifique sua conexão
              </Badge>
            )}
          </div>
        </div>

        {/* Players Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Existing Players */}
          {savedGames.map((save: SaveGame) => (
            <PlayerCard
              key={save.id}
              save={save}
              isOnline={isOnline}
              onPlay={handlePlayGame}
              onDelete={handleDeletePlayer}
            />
          ))}

          {/* Create New Player Form */}
          <CreatePlayerForm
            newPlayerName={newPlayerName}
            isCreating={isCreating}
            isOnline={isOnline}
            onNameChange={setNewPlayerName}
            onSubmit={handleCreatePlayer}
          />
        </div>

        {/* Empty State */}
        {savedGames.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎮</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Nenhum jogador encontrado
            </h3>
            <p className="text-gray-500">
              Crie seu primeiro personagem para começar a aventura!
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 border-t pt-8">
          <p>
            Coletor Adventures - Versão 2.0 | 
            {savedGames.length} jogador{savedGames.length !== 1 ? 'es' : ''} salvo{savedGames.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        playerToDelete={playerToDelete}
        onConfirm={confirmDeletePlayer}
        onCancel={() => setPlayerToDelete(null)}
      />
    </div>
  );
}

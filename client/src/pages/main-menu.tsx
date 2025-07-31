
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Gamepad2, Plus, User, Trash2, Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";

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
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  // Query for save slots
  const { data: saveSlots = [], isLoading: isLoadingSaves } = useQuery<SaveSlot[]>({
    queryKey: ['/api/saves'],
    queryFn: async () => {
      const response = await fetch('/api/saves');
      if (!response.ok) {
        throw new Error('Failed to fetch saves');
      }
      return response.json();
    }
  });

  // Create player mutation
  const createPlayerMutation = useMutation({
    mutationFn: async (username: string) => {
      const response = await apiRequest('POST', '/api/player', { username });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create player');
      }
      return response.json();
    },
    onSuccess: (player) => {
      toast({
        title: "Jogador Criado!",
        description: `Bem-vindo, ${player.username}! Sua aventura começou.`,
      });
      
      // Store current player in localStorage
      localStorage.setItem('currentPlayer', JSON.stringify(player));
      
      // Navigate to game
      setLocation(`/game?player=${encodeURIComponent(player.username)}`);
    },
    onError: (error: Error) => {
      if (error.message.includes('já existe')) {
        toast({
          title: "Jogador já existe!",
          description: "Esse nome já está em uso. Tente outro nome ou carregue o jogo existente.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Erro",
          description: error.message || "Falha ao criar jogador.",
          variant: "destructive"
        });
      }
    },
    onSettled: () => {
      setIsCreating(false);
      queryClient.invalidateQueries({ queryKey: ['/api/saves'] });
    }
  });

  // Delete save mutation
  const deleteSaveMutation = useMutation({
    mutationFn: async (playerId: string) => {
      const response = await apiRequest('DELETE', `/api/saves/${playerId}`);
      if (!response.ok) {
        throw new Error('Failed to delete save');
      }
    },
    onSuccess: () => {
      toast({
        title: "Jogo Deletado",
        description: "O jogo foi deletado com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/saves'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message || "Falha ao deletar o jogo.",
        variant: "destructive"
      });
    }
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
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {isLoadingSaves ? (
                  <div className="text-center py-8 text-gray-500">
                    Carregando jogos salvos...
                  </div>
                ) : saveSlots.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Nenhum jogo salvo encontrado.
                    <br />
                    Crie um novo jogo para começar!
                  </div>
                ) : (
                  saveSlots.map((save) => (
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
                          disabled={deleteSaveMutation.isLoading}
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

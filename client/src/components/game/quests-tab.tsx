import React from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import type { Player } from "@shared/schema";

interface Quest {
  id: string;
  name: string;
  description: string;
  emoji: string;
  type: string;
  requiredLevel: number;
  objectives: any[];
  rewards: {
    coins?: number;
    experience?: number;
    items?: Record<string, number>;
  };
  status: string;
  progress: Record<string, any>;
  playerQuest: any;
}

interface QuestsTabProps {
  player: Player;
}

export default function QuestsTab({ player }: QuestsTabProps) {
  const { toast } = useToast();

  const { data: quests = [], isLoading } = useQuery<Quest[]>({
    queryKey: [`/api/player/${player.id}/quests`],
  });

  const startQuestMutation = useMutation({
    mutationFn: async (questId: string) => {
      const response = await fetch(`/api/player/${player.id}/quests/${questId}/start`, {
        method: 'POST'
      });
      if (!response.ok) {
        throw new Error(await response.text());
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/player/${player.id}/quests`] });
      toast({
        title: "Quest iniciada!",
        description: "Você começou uma nova quest.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível iniciar a quest.",
      });
    },
  });

  const completeQuestMutation = useMutation({
    mutationFn: async (questId: string) => {
      const response = await fetch(`/api/player/${player.id}/quests/${questId}/complete`, {
        method: 'POST'
      });
      if (!response.ok) {
        throw new Error(await response.text());
      }
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [`/api/player/${player.id}/quests`] });
      queryClient.invalidateQueries({ queryKey: ["/api/player/Player1"] });
      
      let message = "Quest completada!";
      if (data.newLevel) {
        message += ` Parabéns, você subiu para o nível ${data.newLevel}!`;
      }
      
      toast({
        title: "Sucesso!",
        description: message,
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível completar a quest.",
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'secondary';
      case 'active':
        return 'default';
      case 'completed':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available':
        return 'Disponível';
      case 'active':
        return 'Ativa';
      case 'completed':
        return 'Completa';
      default:
        return 'Desconhecido';
    }
  };

  const canCompleteQuest = (quest: Quest) => {
    if (quest.status !== 'active') return false;
    
    // Basic completion logic - this would need to be enhanced
    // based on actual quest progress tracking
    return true;
  };

  const formatRewards = (rewards: Quest['rewards']) => {
    const parts = [];
    
    if (rewards.coins) {
      parts.push(`💰 ${rewards.coins} moedas`);
    }
    
    if (rewards.experience) {
      parts.push(`⭐ ${rewards.experience} XP`);
    }
    
    if (rewards.items) {
      for (const [item, quantity] of Object.entries(rewards.items)) {
        parts.push(`📦 ${quantity}x ${item}`);
      }
    }
    
    return parts.join(", ");
  };

  // Group quests by status
  const availableQuests = quests.filter(q => q.status === 'available');
  const activeQuests = quests.filter(q => q.status === 'active');
  const completedQuests = quests.filter(q => q.status === 'completed');

  if (isLoading) {
    return <div className="flex justify-center p-8">Carregando quests...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">📋 Missões</h1>
        <p className="text-muted-foreground">
          Complete missões para ganhar recompensas e experiência
        </p>
      </div>

      {/* Active Quests */}
      {activeQuests.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            🔥 Missões Ativas ({activeQuests.length})
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {activeQuests.map((quest) => (
              <Card key={quest.id} className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{quest.emoji}</span>
                      <div>
                        <CardTitle className="text-lg">{quest.name}</CardTitle>
                        <Badge variant={getStatusColor(quest.status)} className="mt-1">
                          {getStatusText(quest.status)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <CardDescription>{quest.description}</CardDescription>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Objetivos:</h4>
                    {quest.objectives.map((objective, idx) => (
                      <div key={idx} className="text-sm text-muted-foreground">
                        • {objective.description}
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Recompensas:</h4>
                    <p className="text-sm text-muted-foreground">
                      {formatRewards(quest.rewards)}
                    </p>
                  </div>

                  {canCompleteQuest(quest) && (
                    <Button 
                      onClick={() => completeQuestMutation.mutate(quest.id)}
                      disabled={completeQuestMutation.isPending}
                      className="w-full"
                    >
                      {completeQuestMutation.isPending ? "Completando..." : "Completar Quest"}
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Available Quests */}
      {availableQuests.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            ✨ Missões Disponíveis ({availableQuests.length})
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {availableQuests.map((quest) => (
              <Card key={quest.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{quest.emoji}</span>
                      <div>
                        <CardTitle className="text-lg">{quest.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={getStatusColor(quest.status)}>
                            {getStatusText(quest.status)}
                          </Badge>
                          <Badge variant="outline">
                            Nível {quest.requiredLevel}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <CardDescription>{quest.description}</CardDescription>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Objetivos:</h4>
                    {quest.objectives.map((objective, idx) => (
                      <div key={idx} className="text-sm text-muted-foreground">
                        • {objective.description}
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Recompensas:</h4>
                    <p className="text-sm text-muted-foreground">
                      {formatRewards(quest.rewards)}
                    </p>
                  </div>

                  <Button 
                    onClick={() => startQuestMutation.mutate(quest.id)}
                    disabled={startQuestMutation.isPending || player.level < quest.requiredLevel}
                    className="w-full"
                  >
                    {startQuestMutation.isPending ? "Iniciando..." : 
                     player.level < quest.requiredLevel ? `Requer Nível ${quest.requiredLevel}` :
                     "Iniciar Quest"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Completed Quests */}
      {completedQuests.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            ✅ Missões Completadas ({completedQuests.length})
          </h2>
          <ScrollArea className="h-96">
            <div className="space-y-2">
              {completedQuests.map((quest) => (
                <Card key={quest.id} className="bg-muted/50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg opacity-75">{quest.emoji}</span>
                        <div>
                          <h3 className="font-semibold">{quest.name}</h3>
                          <p className="text-sm text-muted-foreground">{quest.description}</p>
                        </div>
                      </div>
                      <Badge variant="outline">
                        ✅ Completa
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      {quests.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-4xl mb-4">📋</div>
            <h3 className="text-lg font-semibold mb-2">Nenhuma quest disponível</h3>
            <p className="text-muted-foreground">
              Continue explorando e subindo de nível para desbloquear novas missões!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
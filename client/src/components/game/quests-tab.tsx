
import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import type { Player } from "@shared/types";

interface Quest {
  id: string;
  name: string;
  description: string;
  emoji: string;
  type: string;
  category?: string;
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
  canComplete?: boolean;
}

interface QuestsTabProps {
  player: Player;
}

export default function QuestsTab({ player }: QuestsTabProps) {
  const { toast } = useToast();
  const [activeCategory, setActiveCategory] = useState<string>("active");

  const { data: quests = [], isLoading } = useQuery<Quest[]>({
    queryKey: [`/api/player/${player.id}/quests`],
  });

  // Get resources and equipment data to resolve names for rewards
  const { data: resources = [] } = useQuery({
    queryKey: ['/api/resources']
  });

  const { data: equipment = [] } = useQuery({
    queryKey: ['/api/equipment']
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

  const repeatQuestMutation = useMutation({
    mutationFn: async (questId: string) => {
      const response = await fetch(`/api/player/${player.id}/quests/${questId}/repeat`, {
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
        title: "Quest Reiniciada!",
        description: "A quest foi reiniciada e está pronta para ser completada novamente.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível reiniciar a quest.",
      });
    },
  });

  const resetAllCompletedMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/player/${player.id}/quests/reset`, {
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
        title: "Quests Resetadas!",
        description: "Todas as quests completadas foram resetadas.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível resetar as quests.",
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
    return quest.canComplete === true;
  };

  const getItemName = (itemId: string) => {
    // First check resources
    const resource = (resources as any[]).find((r: any) => r.id === itemId);
    if (resource) {
      return `${resource.emoji} ${resource.name}`;
    }

    // Then check equipment
    const equip = (equipment as any[]).find((e: any) => e.id === itemId);
    if (equip) {
      return `${equip.emoji} ${equip.name}`;
    }

    return "Item Desconhecido";
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
      for (const [itemId, quantity] of Object.entries(rewards.items)) {
        const itemName = getItemName(itemId);
        parts.push(`${quantity}x ${itemName}`);
      }
    }

    return parts.join(", ");
  };

  // Group quests by status
  const availableQuests = quests.filter(q => q.status === 'available');
  const activeQuests = quests.filter(q => q.status === 'active');
  const completedQuests = quests.filter(q => q.status === 'completed');

  const questCategories = {
    active: {
      label: "Missões Ativas",
      emoji: "🔥",
      quests: activeQuests,
      color: "border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800"
    },
    available: {
      label: "Missões Disponíveis",
      emoji: "✨",
      quests: availableQuests,
      color: ""
    },
    completed: {
      label: "Missões Completadas",
      emoji: "✅",
      quests: completedQuests,
      color: "bg-muted/50"
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Carregando quests...</div>;
  }

  const renderQuestCard = (quest: Quest, isActive = false) => (
    <Card key={quest.id} className={isActive ? questCategories.active.color : questCategories[quest.status as keyof typeof questCategories]?.color}>
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
                {quest.status === 'available' && (
                  <Badge variant="outline">
                    Nível {quest.requiredLevel}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <CardDescription>{quest.description}</CardDescription>

        <div className="space-y-2">
          <h4 className="font-semibold text-sm">Objetivos:</h4>
          {quest.objectives.map((objective, idx) => {
            if (quest.status === 'active') {
              const progressKey = objective.type + '_' + (objective.resourceId || objective.itemId || objective.creatureId || objective.biomeId);
              const objectiveProgress = quest.progress[progressKey];

              return (
                <div key={idx} className="text-sm">
                  <div className="flex justify-between items-center">
                    <span className={objectiveProgress?.completed ? "text-green-600" : "text-muted-foreground"}>
                      • {objective.description}
                    </span>
                    {objectiveProgress && (
                      <span className="text-xs font-medium">
                        {objectiveProgress.current}/{objectiveProgress.required}
                      </span>
                    )}
                  </div>
                  {objectiveProgress && (
                    <Progress 
                      value={(objectiveProgress.current / objectiveProgress.required) * 100} 
                      className="h-1 mt-1"
                    />
                  )}
                </div>
              );
            } else {
              return (
                <div key={idx} className="text-sm text-muted-foreground">
                  • {objective.description}
                </div>
              );
            }
          })}
        </div>

        <div className="space-y-2">
          <h4 className="font-semibold text-sm">Recompensas:</h4>
          <p className="text-sm text-muted-foreground">
            {formatRewards(quest.rewards)}
          </p>
        </div>

        {quest.status === 'available' && (
          <Button 
            onClick={() => startQuestMutation.mutate(quest.id)}
            disabled={startQuestMutation.isPending || player.level < quest.requiredLevel}
            className="w-full"
          >
            {startQuestMutation.isPending ? "Iniciando..." : 
             player.level < quest.requiredLevel ? `Requer Nível ${quest.requiredLevel}` :
             "Iniciar Quest"}
          </Button>
        )}

        {quest.status === 'active' && canCompleteQuest(quest) && (
          <Button 
            onClick={() => completeQuestMutation.mutate(quest.id)}
            disabled={completeQuestMutation.isPending}
            className="w-full"
          >
            {completeQuestMutation.isPending ? "Completando..." : "Completar Quest"}
          </Button>
        )}

        {quest.status === 'completed' && (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex-1 justify-center">
              ✅ Completa
            </Badge>
            <Button
              size="sm"
              variant="outline"
              onClick={() => repeatQuestMutation.mutate(quest.id)}
              disabled={repeatQuestMutation.isPending}
            >
              {repeatQuestMutation.isPending ? "Reiniciando..." : "🔄 Repetir"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">📋 Missões</h1>
        <p className="text-muted-foreground">
          Complete missões para ganhar recompensas e experiência
        </p>
      </div>

      {/* Horizontal Category Tabs */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200">
          {Object.entries(questCategories).map(([categoryKey, category]) => {
            if (category.quests.length === 0) return null;
            
            const isActive = activeCategory === categoryKey;
            
            return (
              <button
                key={categoryKey}
                onClick={() => setActiveCategory(categoryKey)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-t-lg font-medium transition-all ${
                  isActive 
                    ? "bg-white border-t border-l border-r border-gray-300 text-gray-800 -mb-px" 
                    : "bg-gray-50 hover:bg-gray-100 text-gray-600 border-b border-gray-200"
                }`}
              >
                <span className="text-lg">{category.emoji}</span>
                <span>{category.label}</span>
                <span className="text-sm text-gray-500">({category.quests.length})</span>
              </button>
            );
          })}
        </div>

        {/* Quest Content for Active Category */}
        <div className="bg-white border border-gray-300 border-t-0 rounded-b-lg p-6">
          {Object.entries(questCategories).map(([categoryKey, category]) => {
            if (activeCategory !== categoryKey || category.quests.length === 0) return null;

            return (
              <div key={categoryKey}>
                {categoryKey === 'completed' ? (
                  <ScrollArea className="h-96">
                    <div className="space-y-4">
                      {category.quests.map((quest) => renderQuestCard(quest))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {category.quests.map((quest) => renderQuestCard(quest, categoryKey === 'active'))}
                  </div>
                )}
              </div>
            );
          })}

          {activeCategory && questCategories[activeCategory as keyof typeof questCategories]?.quests.length === 0 && (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">📋</div>
              <h3 className="text-lg font-semibold mb-2">
                Nenhuma quest {
                  activeCategory === 'active' ? 'ativa' :
                  activeCategory === 'available' ? 'disponível' :
                  'completada'
                }
              </h3>
              <p className="text-muted-foreground">
                {activeCategory === 'available' && "Continue explorando e subindo de nível para desbloquear novas missões!"}
                {activeCategory === 'active' && "Inicie uma quest disponível para começar sua jornada!"}
                {activeCategory === 'completed' && "Complete algumas quests para vê-las aqui!"}
              </p>
            </div>
          )}
        </div>
      </div>

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

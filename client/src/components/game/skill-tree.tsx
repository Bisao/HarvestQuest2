// Skill Tree Component - Interface intuitiva para gerenciar skills
// Integrado com o design do projeto

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { SKILL_TREE_LAYOUT } from '@shared/data/skill-definitions';
import type { Player } from '@shared/types';

interface SkillTreeProps {
  player: Player;
}

interface SkillData {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  maxLevel: number;
  currentLevel: number;
  experience: number;
  experienceToNext: number;
  unlocked: boolean;
  prerequisites: any[];
  bonuses: any[];
  unlocks: any[];
  totalUsageCount: number;
}

export function SkillTree({ player }: SkillTreeProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  
  // Fetch skill tree data
  const { data: skillTreeData, isLoading } = useQuery({
    queryKey: ['/api/skills', player.id],
    enabled: !!player.id
  });

  // Level up skill mutation
  const levelUpMutation = useMutation({
    mutationFn: async ({ skillId, points }: { skillId: string; points: number }) => {
      return apiRequest(`/api/skills/${player.id}/level-up`, {
        method: 'POST',
        body: { skillId, points }
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/skills', player.id] });
      queryClient.invalidateQueries({ queryKey: ['/api/player', player.id] });
      toast({
        title: "Skill Melhorada!",
        description: data.message || "Skill foi aprimorada com sucesso"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível melhorar a skill",
        variant: "destructive"
      });
    }
  });

  // Reset skills mutation
  const resetSkillsMutation = useMutation({
    mutationFn: async () => {
      return apiRequest(`/api/skills/${player.id}/reset`, {
        method: 'POST',
        body: { confirm: true }
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/skills', player.id] });
      queryClient.invalidateQueries({ queryKey: ['/api/player', player.id] });
      toast({
        title: "Skills Resetadas",
        description: data.message || "Todas as skills foram resetadas"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível resetar as skills",
        variant: "destructive"
      });
    }
  });

  const handleLevelUp = (skillId: string, points: number = 1) => {
    levelUpMutation.mutate({ skillId, points });
  };

  const handleResetSkills = () => {
    if (confirm('Tem certeza que deseja resetar todas as skills? Isso custará moedas.')) {
      resetSkillsMutation.mutate();
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full h-96 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando árvore de skills...</p>
        </div>
      </Card>
    );
  }

  const skillTree = skillTreeData?.data;
  if (!skillTree) return null;

  const selectedSkillData = selectedSkill ? skillTree.skills[selectedSkill] : null;

  return (
    <div className="space-y-6">
      {/* Skill Points Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <span className="text-2xl">🎯</span>
            Árvore de Skills
          </CardTitle>
          <CardDescription>
            Desbloqueie e aprimore suas habilidades para se tornar mais eficiente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{skillTree.skillPoints}</div>
                <div className="text-sm text-muted-foreground">Pontos Disponíveis</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-secondary">{skillTree.totalSkillPoints}</div>
                <div className="text-sm text-muted-foreground">Total Conquistado</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">{player.level}</div>
                <div className="text-sm text-muted-foreground">Nível do Jogador</div>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={handleResetSkills}
              disabled={resetSkillsMutation.isPending}
            >
              Resetar Skills
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Skill Categories */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="gathering" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              {Object.entries(SKILL_TREE_LAYOUT).map(([categoryId, category]) => (
                <TabsTrigger key={categoryId} value={categoryId} className="text-xs">
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>

            {Object.entries(SKILL_TREE_LAYOUT).map(([categoryId, category]) => (
              <TabsContent key={categoryId} value={categoryId} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(category.skills).map(([skillId, skillPosition]) => {
                    const skill = skillTree.skills[skillId] as SkillData;
                    if (!skill) return null;

                    const isSelected = selectedSkill === skillId;
                    const canLevelUp = skill.unlocked && skillTree.skillPoints > 0 && skill.currentLevel < skill.maxLevel;
                    const progressPercent = skill.maxLevel > 0 ? (skill.currentLevel / skill.maxLevel) * 100 : 0;

                    return (
                      <Card 
                        key={skillId}
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          isSelected ? 'ring-2 ring-primary' : ''
                        } ${!skill.unlocked ? 'opacity-60' : ''}`}
                        onClick={() => setSelectedSkill(skillId)}
                        style={{ borderColor: category.color + '40' }}
                      >
                        <CardHeader className="pb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{skill.icon}</span>
                            <div className="flex-1">
                              <CardTitle className="text-sm">{skill.name}</CardTitle>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge 
                                  variant={skill.unlocked ? "default" : "secondary"}
                                  className="text-xs"
                                >
                                  Nível {skill.currentLevel}/{skill.maxLevel}
                                </Badge>
                                {!skill.unlocked && (
                                  <Badge variant="outline" className="text-xs">
                                    Bloqueado
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <Progress value={progressPercent} className="mb-2" />
                          {skill.unlocked && skill.experienceToNext > 0 && (
                            <div className="text-xs text-muted-foreground mb-2">
                              {skill.experience}/{skill.experience + skill.experienceToNext} XP
                            </div>
                          )}
                          {canLevelUp && (
                            <Button 
                              size="sm" 
                              className="w-full"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleLevelUp(skillId);
                              }}
                              disabled={levelUpMutation.isPending}
                            >
                              Melhorar (1 ponto)
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>

        {/* Skill Details Panel */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Detalhes da Skill</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedSkillData ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <span className="text-4xl">{selectedSkillData.icon}</span>
                    <h3 className="font-bold text-lg mt-2">{selectedSkillData.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedSkillData.description}
                    </p>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-semibold mb-2">Status</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Nível:</span>
                        <span>{selectedSkillData.currentLevel}/{selectedSkillData.maxLevel}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Vezes Usado:</span>
                        <span>{selectedSkillData.totalUsageCount}</span>
                      </div>
                      {selectedSkillData.experienceToNext > 0 && (
                        <div className="flex justify-between">
                          <span>Próximo Nível:</span>
                          <span>{selectedSkillData.experienceToNext} XP</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedSkillData.bonuses.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <h4 className="font-semibold mb-2">Bônus</h4>
                        <div className="space-y-1 text-sm">
                          {selectedSkillData.bonuses.map((bonus: any, index: number) => (
                            <div key={index} className="flex justify-between">
                              <span className="capitalize">{bonus.type.replace('_', ' ')}:</span>
                              <span className="text-green-600">+{bonus.value * selectedSkillData.currentLevel}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {selectedSkillData.unlocks.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <h4 className="font-semibold mb-2">Desbloqueios</h4>
                        <div className="space-y-2 text-sm">
                          {selectedSkillData.unlocks.map((unlock: any, index: number) => (
                            <div key={index} className="p-2 bg-muted rounded text-xs">
                              <span className="font-medium">{unlock.type}:</span>
                              <p className="mt-1">{unlock.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {!selectedSkillData.unlocked && selectedSkillData.prerequisites.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <h4 className="font-semibold mb-2">Requisitos</h4>
                        <div className="space-y-1 text-sm">
                          {selectedSkillData.prerequisites.map((prereq: any, index: number) => (
                            <div key={index} className="text-muted-foreground">
                              {prereq.type === 'skill' && `Skill: ${prereq.requirement} nível ${prereq.value}`}
                              {prereq.type === 'level' && `Nível do jogador: ${prereq.requirement}`}
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  Selecione uma skill para ver os detalhes
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Zap, TrendingUp, Award } from "lucide-react";
import type { Player } from "@shared/types";

interface SkillsTabProps {
  player: Player;
}

export default function SkillsTab({ player }: SkillsTabProps) {
  // Skills disponíveis no jogo
  const availableSkills = [
    {
      id: 'combat',
      name: 'Combate',
      emoji: '⚔️',
      description: 'Habilidade com armas e combate',
      category: 'Ação'
    },
    {
      id: 'gathering',
      name: 'Coleta',
      emoji: '🌿',
      description: 'Eficiência na coleta de recursos',
      category: 'Sobrevivência'
    },
    {
      id: 'crafting',
      name: 'Artesanato',
      emoji: '🔨',
      description: 'Habilidade em criar e melhorar itens',
      category: 'Criação'
    },
    {
      id: 'hunting',
      name: 'Caça',
      emoji: '🏹',
      description: 'Rastreamento e caça de animais',
      category: 'Sobrevivência'
    },
    {
      id: 'fishing',
      name: 'Pesca',
      emoji: '🎣',
      description: 'Habilidade em pescar',
      category: 'Sobrevivência'
    },
    {
      id: 'exploration',
      name: 'Exploração',
      emoji: '🗺️',
      description: 'Descoberta de novos locais',
      category: 'Aventura'
    },
    {
      id: 'cooking',
      name: 'Culinária',
      emoji: '🍳',
      description: 'Preparação de alimentos',
      category: 'Criação'
    },
    {
      id: 'mining',
      name: 'Mineração',
      emoji: '⛏️',
      description: 'Extração de minerais',
      category: 'Sobrevivência'
    }
  ];

  const getSkillLevel = (skillId: string) => {
    return player.skills?.[skillId] || 0;
  };

  const getSkillProgress = (level: number) => {
    // Cada nível requer mais XP: level * 100
    const currentLevelXP = level * 100;
    const nextLevelXP = (level + 1) * 100;
    return { current: currentLevelXP, max: nextLevelXP };
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Ação': return 'bg-red-100 text-red-800';
      case 'Sobrevivência': return 'bg-green-100 text-green-800';
      case 'Criação': return 'bg-blue-100 text-blue-800';
      case 'Aventura': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const groupedSkills = availableSkills.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, typeof availableSkills>);

  return (
    <div className="space-y-6">
      {/* Header com informações gerais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-purple-600" />
            Habilidades do Jogador
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {player.skillPoints || 0}
              </div>
              <div className="text-sm text-gray-600">Pontos Disponíveis</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {player.totalSkillPoints || 0}
              </div>
              <div className="text-sm text-gray-600">Pontos Totais</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {player.skillAchievements?.length || 0}
              </div>
              <div className="text-sm text-gray-600">Conquistas</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skills por categoria */}
      {Object.entries(groupedSkills).map(([category, skills]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              {category}
              <Badge className={getCategoryColor(category)}>
                {skills.length} habilidades
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {skills.map((skill) => {
                const level = getSkillLevel(skill.id);
                const progress = getSkillProgress(level);
                
                return (
                  <div key={skill.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{skill.emoji}</span>
                        <div>
                          <h4 className="font-medium">{skill.name}</h4>
                          <p className="text-sm text-gray-600">{skill.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-purple-600">
                          Nv. {level}
                        </div>
                        <div className="text-xs text-gray-500">
                          {progress.current}/{progress.max} XP
                        </div>
                      </div>
                    </div>
                    
                    {level > 0 && (
                      <Progress 
                        value={(progress.current / progress.max) * 100} 
                        className="h-2 mb-2"
                      />
                    )}
                    
                    {level === 0 && (
                      <div className="text-center text-gray-500 text-sm py-2">
                        Habilidade não desenvolvida
                      </div>
                    )}
                    
                    {player.skillPoints > 0 && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="w-full mt-2"
                        disabled={true} // Por enquanto desabilitado
                      >
                        Melhorar (+1 ponto)
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Conquistas */}
      {player.skillAchievements && player.skillAchievements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-600" />
              Conquistas de Habilidades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {player.skillAchievements.map((achievement, index) => (
                <div key={index} className="p-3 border rounded-lg bg-yellow-50">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🏆</span>
                    <div>
                      <h4 className="font-medium text-yellow-800">{achievement}</h4>
                      <p className="text-sm text-yellow-600">Conquista desbloqueada</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Clock, Users, Trophy, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import type { ExpeditionTemplate } from '@shared/types/expedition-types';
import type { Player, Biome } from '@shared/types';

interface NewExpeditionModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: Player;
  biome: Biome;
}

export function NewExpeditionModal({ isOpen, onClose, player, biome }: NewExpeditionModalProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<ExpeditionTemplate | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar templates disponíveis para o bioma
  const { data: templatesData, isLoading: templatesLoading } = useQuery<ExpeditionTemplate[]>({
    queryKey: ['/api/expeditions/templates/biome', biome.id],
    enabled: isOpen && !!biome.id
  });

  // Ensure templates is always an array
  const templates = Array.isArray(templatesData) ? templatesData : 
                   (templatesData?.data && Array.isArray(templatesData.data)) ? templatesData.data : [];

  // Buscar expedições ativas do jogador
  const { data: activeExpeditions = [] } = useQuery<any[]>({
    queryKey: ['/api/expeditions/player', player.id, 'active'],
    enabled: isOpen && !!player.id
  });

  // Validar requisitos da expedição
  const { data: validation } = useQuery<{ valid: boolean; errors: string[] }>({
    queryKey: ['/api/expeditions/validate', player.id, selectedTemplate?.id],
    enabled: !!selectedTemplate && !!player.id,
    select: (data: any) => data?.data || { valid: false, errors: [] }
  });

  // Mutation para iniciar expedição
  const startExpeditionMutation = useMutation({
    mutationFn: async (templateId: string) => {
      const response = await fetch('/api/expeditions/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId: player.id, templateId })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao iniciar expedição');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Expedição Iniciada!",
        description: `${selectedTemplate?.name} começou com sucesso.`,
      });
      
      // Invalidar caches relevantes
      queryClient.invalidateQueries({ queryKey: ['/api/expeditions/player', player.id] });
      queryClient.invalidateQueries({ queryKey: ['/api/player', player.username] });
      
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao Iniciar Expedição",
        description: error.message || "Erro desconhecido",
        variant: "destructive"
      });
    }
  });

  const handleStartExpedition = () => {
    if (!selectedTemplate) return;
    startExpeditionMutation.mutate(selectedTemplate.id);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 border-green-300';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'advanced': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'expert': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'gathering': return '🌾';
      case 'hunting': return '🏹';
      case 'exploration': return '🗺️';
      case 'quest': return '⚔️';
      default: return '📦';
    }
  };

  if (!biome) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 border-b bg-gradient-to-r from-blue-50 to-cyan-50">
          <DialogTitle className="text-2xl flex items-center gap-3">
            <span className="text-3xl">{biome.emoji}</span>
            <div>
              <div>Expedições em {biome.name}</div>
              <div className="text-sm font-normal text-gray-600 mt-1">
                Escolha uma expedição para começar sua aventura
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-1 overflow-hidden">
          {/* Lista de Templates */}
          <div className="w-1/2 p-6 overflow-y-auto border-r">
            <h3 className="text-lg font-semibold mb-4">Expedições Disponíveis</h3>
            
            {templatesLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-32 bg-gray-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : templates.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>Nenhuma expedição disponível neste bioma</p>
              </div>
            ) : (
              <div className="space-y-3">
                {templates.map((template: ExpeditionTemplate) => (
                  <Card 
                    key={template.id}
                    className={`cursor-pointer transition-all ${
                      selectedTemplate?.id === template.id 
                        ? 'ring-2 ring-blue-500 bg-blue-50' 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedTemplate(template)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{getCategoryIcon(template.category)}</span>
                          <div>
                            <CardTitle className="text-base">{template.name}</CardTitle>
                            <CardDescription className="text-sm mt-1">
                              {template.description}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge className={getDifficultyColor(template.difficulty)}>
                          {template.difficulty}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {template.duration.min}-{template.duration.max}min
                        </div>
                        <div className="flex items-center gap-1">
                          <Trophy className="w-4 h-4" />
                          {template.rewards.experience} XP
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Detalhes da Expedição Selecionada */}
          <div className="w-1/2 p-6 overflow-y-auto">
            {selectedTemplate ? (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                    <span className="text-2xl">{getCategoryIcon(selectedTemplate.category)}</span>
                    {selectedTemplate.name}
                  </h3>
                  <p className="text-gray-600 mb-4">{selectedTemplate.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-sm font-medium text-gray-700">Duração</div>
                      <div className="text-lg">{selectedTemplate.duration.min}-{selectedTemplate.duration.max} min</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-sm font-medium text-gray-700">Experiência</div>
                      <div className="text-lg text-blue-600">{selectedTemplate.rewards.experience} XP</div>
                    </div>
                  </div>
                </div>

                {/* Requisitos */}
                <div>
                  <h4 className="font-semibold mb-3">Requisitos</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Nível mínimo:</span>
                      <span className={player.level >= selectedTemplate.requirements.minLevel ? 'text-green-600' : 'text-red-600'}>
                        {selectedTemplate.requirements.minLevel} (Você: {player.level})
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Fome mínima:</span>
                      <span className={player.hunger >= selectedTemplate.requirements.minHunger ? 'text-green-600' : 'text-red-600'}>
                        {selectedTemplate.requirements.minHunger}% (Você: {player.hunger}%)
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Sede mínima:</span>
                      <span className={player.thirst >= selectedTemplate.requirements.minThirst ? 'text-green-600' : 'text-red-600'}>
                        {selectedTemplate.requirements.minThirst}% (Você: {player.thirst}%)
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Saúde mínima:</span>
                      <span className={(player.health || 0) >= selectedTemplate.requirements.minHealth ? 'text-green-600' : 'text-red-600'}>
                        {selectedTemplate.requirements.minHealth}% (Você: {player.health || 0}%)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Recompensas */}
                <div>
                  <h4 className="font-semibold mb-3">Recompensas</h4>
                  <div className="space-y-3">
                    {Object.keys(selectedTemplate.rewards.guaranteed).length > 0 && (
                      <div>
                        <div className="text-sm font-medium text-gray-700 mb-2">Garantidas:</div>
                        <div className="space-y-1">
                          {Object.entries(selectedTemplate.rewards.guaranteed).map(([resourceId, quantity]) => (
                            <div key={resourceId} className="text-sm flex justify-between">
                              <span>Item {resourceId.slice(-6)}:</span>
                              <span className="font-medium">{quantity}x</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {selectedTemplate.rewards.possible.length > 0 && (
                      <div>
                        <div className="text-sm font-medium text-gray-700 mb-2">Possíveis:</div>
                        <div className="space-y-1">
                          {selectedTemplate.rewards.possible.map((reward, index) => (
                            <div key={index} className="text-sm flex justify-between">
                              <span>Item {reward.resourceId.slice(-6)}:</span>
                              <span>{reward.quantity}x ({Math.round(reward.chance * 100)}%)</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status de Validação */}
                {validation && (
                  <div className={`p-4 rounded-lg ${validation.valid ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      {validation.valid ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                      <span className={`font-medium ${validation.valid ? 'text-green-800' : 'text-red-800'}`}>
                        {validation.valid ? 'Pronto para iniciar!' : 'Requisitos não atendidos'}
                      </span>
                    </div>
                    {!validation.valid && validation.errors.length > 0 && (
                      <ul className="text-sm text-red-700 space-y-1">
                        {validation.errors.map((error: string, index: number) => (
                          <li key={index} className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" />
                            {error}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                {/* Botões de Ação */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button 
                    variant="outline" 
                    onClick={onClose}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleStartExpedition}
                    disabled={!validation?.valid || startExpeditionMutation.isPending || (Array.isArray(activeExpeditions) && activeExpeditions.length > 0)}
                    className="flex-1"
                  >
                    {startExpeditionMutation.isPending ? 'Iniciando...' : 'Iniciar Expedição'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium">Selecione uma Expedição</p>
                  <p className="text-sm">Escolha uma expedição na lista para ver os detalhes</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Clock, Package, Zap, AlertTriangle, CheckCircle, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import type { Player, Biome, Resource } from '@shared/types';

interface ManualExpeditionModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: Player;
  biome: Biome;
  resources: Resource[];
}

interface SelectedResource {
  resourceId: string;
  quantity: number;
}

export function ManualExpeditionModal({ isOpen, onClose, player, biome, resources }: ManualExpeditionModalProps) {
  const [selectedResources, setSelectedResources] = useState<SelectedResource[]>([]);
  const [duration, setDuration] = useState([30]); // Duration in minutes
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Filter resources available in this biome
  const biomeResources = useMemo(() => {
    return resources.filter(resource => {
      if (!resource.biomes || resource.biomes.length === 0) return true;
      return resource.biomes.includes(biome.id);
    }).filter(resource => {
      if (!searchTerm) return true;
      return resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
             (resource.description && resource.description.toLowerCase().includes(searchTerm.toLowerCase()));
    });
  }, [resources, biome.id, searchTerm]);

  // Group resources by category
  const categorizedResources = useMemo(() => {
    const grouped: Record<string, Resource[]> = {};
    biomeResources.forEach(resource => {
      const category = resource.category || 'Outros';
      if (!grouped[category]) grouped[category] = [];
      grouped[category].push(resource);
    });
    return grouped;
  }, [biomeResources]);

  // Calculate estimated XP and requirements
  const expeditionStats = useMemo(() => {
    const totalResources = selectedResources.reduce((sum, sel) => sum + sel.quantity, 0);
    const estimatedXP = Math.floor(totalResources * 2 + duration[0] * 0.5);
    const hungerCost = Math.floor(duration[0] * 0.8);
    const thirstCost = Math.floor(duration[0] * 0.6);
    
    return {
      totalResources,
      estimatedXP,
      hungerCost,
      thirstCost,
      duration: duration[0]
    };
  }, [selectedResources, duration]);

  // Check if player meets requirements
  const canStartExpedition = useMemo(() => {
    return selectedResources.length > 0 && 
           player.hunger >= expeditionStats.hungerCost &&
           player.thirst >= expeditionStats.thirstCost;
  }, [selectedResources, player.hunger, player.thirst, expeditionStats]);

  // Mutation to start custom expedition
  const startExpeditionMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/expeditions/custom/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId: player.id,
          biomeId: biome.id,
          selectedResources: selectedResources.map(sel => ({
            resourceId: sel.resourceId,
            targetQuantity: sel.quantity
          })),
          duration: duration[0] * 60 * 1000, // Convert to milliseconds
          selectedEquipment: []
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao iniciar expedição');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Expedição Iniciada!",
        description: `Expedição customizada em ${biome.name} iniciada com sucesso.`,
      });
      
      // Invalidate relevant caches
      queryClient.invalidateQueries({ queryKey: ['/api/expeditions/player', player.id] });
      queryClient.invalidateQueries({ queryKey: ['/api/player', player.username] });
      
      // Reset form and close
      setSelectedResources([]);
      setDuration([30]);
      setSearchTerm('');
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

  const handleResourceToggle = (resourceId: string) => {
    setSelectedResources(prev => {
      const existing = prev.find(sel => sel.resourceId === resourceId);
      if (existing) {
        return prev.filter(sel => sel.resourceId !== resourceId);
      } else {
        return [...prev, { resourceId, quantity: 5 }];
      }
    });
  };

  const handleQuantityChange = (resourceId: string, quantity: number) => {
    setSelectedResources(prev => prev.map(sel => 
      sel.resourceId === resourceId 
        ? { ...sel, quantity: quantity }
        : sel
    ));
  };

  const getResourceIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'plantas': return '🌿';
      case 'animais': return '🐾';
      case 'minerais': return '⛏️';
      case 'líquidos': return '💧';
      case 'madeira': return '🌳';
      case 'pedra': return '🪨';
      default: return '📦';
    }
  };

  const getDurationColor = (mins: number) => {
    if (mins <= 15) return 'text-green-600 bg-green-50';
    if (mins <= 45) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getRequirementStatus = (current: number, required: number) => {
    if (current >= required) return { color: 'text-green-600', icon: CheckCircle };
    return { color: 'text-red-600', icon: AlertTriangle };
  };

  if (!biome) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] md:max-h-[90vh] overflow-hidden flex flex-col p-3 md:p-6" aria-describedby="manual-expedition-description">
        <DialogHeader className="shrink-0 border-b pb-2 md:pb-4">
          <DialogTitle className="text-lg md:text-2xl flex items-center gap-2 md:gap-3">
            <span className="text-2xl md:text-3xl">{biome.emoji}</span>
            <div>
              <div className="text-base md:text-xl">Expedição Personalizada</div>
              <div className="text-sm md:text-base text-gray-600">{biome.name}</div>
              <div className="text-xs md:text-sm font-normal text-gray-500 mt-1">
                Selecione os recursos que deseja coletar e defina a duração
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div id="manual-expedition-description" className="sr-only">
          Modal para criar expedições personalizadas em {biome.name}, permitindo selecionar recursos específicos e duração
        </div>

        <div className="flex-1 overflow-hidden flex flex-col md:flex-row gap-4 md:gap-6 pt-4">
          {/* Left Panel - Resource Selection */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 max-h-[45vh] md:max-h-none">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar recursos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Resource Categories */}
            {Object.entries(categorizedResources).map(([category, categoryResources]) => (
              <Card key={category} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <span>{getResourceIcon(category)}</span>
                    {category}
                    <Badge variant="secondary" className="ml-auto">
                      {categoryResources.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {categoryResources.map(resource => {
                    const isSelected = selectedResources.some(sel => sel.resourceId === resource.id);
                    const selectedData = selectedResources.find(sel => sel.resourceId === resource.id);

                    return (
                      <div key={resource.id} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => handleResourceToggle(resource.id)}
                        />
                        <div className="flex-1">
                          <div className="font-medium">{resource.name}</div>
                          {resource.description && (
                            <div className="text-sm text-gray-600">{resource.description}</div>
                          )}
                        </div>
                        {isSelected && (
                          <div className="flex items-center gap-2 min-w-[120px]">
                            <span className="text-sm font-medium">Qtd:</span>
                            <Slider
                              value={[selectedData?.quantity || 5]}
                              onValueChange={([value]) => handleQuantityChange(resource.id, value)}
                              max={50}
                              min={1}
                              step={1}
                              className="flex-1"
                            />
                            <span className="text-sm font-bold w-8 text-right">
                              {selectedData?.quantity || 5}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            ))}

            {Object.keys(categorizedResources).length === 0 && (
              <Card>
                <CardContent className="text-center py-8">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Nenhum recurso encontrado para "{searchTerm}"</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Panel - Expedition Summary */}
          <div className="w-full md:w-80 shrink-0 space-y-4 max-h-[45vh] md:max-h-none overflow-y-auto">
            {/* Duration Selector */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Clock className="w-4 h-4" />
                  Duração da Expedição
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Duração:</span>
                    <Badge className={getDurationColor(duration[0])}>
                      {duration[0]} min
                    </Badge>
                  </div>
                  <Slider
                    value={duration}
                    onValueChange={setDuration}
                    max={120}
                    min={5}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>5 min</span>
                    <span>120 min</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Expedition Stats */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Zap className="w-4 h-4" />
                  Resumo da Expedição
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>Recursos selecionados:</span>
                  <span className="font-bold">{selectedResources.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Quantidade total:</span>
                  <span className="font-bold">{expeditionStats.totalResources}</span>
                </div>
                <div className="flex justify-between">
                  <span>XP estimado:</span>
                  <Badge variant="outline" className="text-xs">{expeditionStats.estimatedXP} XP</Badge>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="text-sm font-medium">Requisitos:</div>
                  
                  {/* Hunger requirement */}
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Fome necessária:</span>
                    <div className="flex items-center gap-1">
                      {(() => {
                        const status = getRequirementStatus(player.hunger, expeditionStats.hungerCost);
                        const Icon = status.icon;
                        return (
                          <>
                            <span className={`text-sm ${status.color}`}>
                              {expeditionStats.hungerCost}%
                            </span>
                            <Icon className={`w-4 h-4 ${status.color}`} />
                          </>
                        );
                      })()}
                    </div>
                  </div>
                  
                  {/* Thirst requirement */}
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Sede necessária:</span>
                    <div className="flex items-center gap-1">
                      {(() => {
                        const status = getRequirementStatus(player.thirst, expeditionStats.thirstCost);
                        const Icon = status.icon;
                        return (
                          <>
                            <span className={`text-sm ${status.color}`}>
                              {expeditionStats.thirstCost}%
                            </span>
                            <Icon className={`w-4 h-4 ${status.color}`} />
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Selected Resources Summary */}
            {selectedResources.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Recursos Selecionados</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 max-h-40 overflow-y-auto">
                  {selectedResources.map(sel => {
                    const resource = resources.find(r => r.id === sel.resourceId);
                    return (
                      <div key={sel.resourceId} className="flex justify-between text-sm">
                        <span>{resource?.name || 'Desconhecido'}</span>
                        <span className="font-medium">{sel.quantity}x</span>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="space-y-2 pt-2 sticky bottom-0 bg-white dark:bg-gray-950 border-t md:border-t-0 -mx-3 md:mx-0 px-3 md:px-0 py-3 md:py-0">
              <Button
                onClick={() => startExpeditionMutation.mutate()}
                disabled={!canStartExpedition || startExpeditionMutation.isPending}
                className="w-full"
                size="lg"
              >
                {startExpeditionMutation.isPending ? 'Iniciando...' : 'Iniciar Expedição'}
              </Button>
              
              <Button
                variant="outline"
                onClick={onClose}
                className="w-full"
                disabled={startExpeditionMutation.isPending}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
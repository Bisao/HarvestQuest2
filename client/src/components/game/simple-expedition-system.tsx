import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  MapPin, 
  Clock, 
  Star, 
  Play, 
  Pause, 
  CheckCircle,
  X,
  TreePine,
  Mountain,
  Waves,
  Sun,
  Package
} from 'lucide-react';
import type { Biome, Resource, Player } from '@shared/types';
import { apiRequest } from '@/lib/queryClient';

interface SimpleExpeditionSystemProps {
  biomes: Biome[];
  resources: Resource[];
  player: Player;
  isVisible: boolean;
}

interface ActiveExpedition {
  id: string;
  biomeId: string;
  biomeName?: string;
  progress: number;
  startTime: number;
  endTime?: number;
  collectedResources: Record<string, number>;
  status: 'active' | 'completed';
}

// Temas visuais para cada bioma
const BIOME_THEMES = {
  floresta: { icon: TreePine, color: 'from-green-500 to-emerald-600', bgColor: 'bg-green-50' },
  deserto: { icon: Sun, color: 'from-yellow-500 to-orange-600', bgColor: 'bg-yellow-50' },
  montanha: { icon: Mountain, color: 'from-gray-500 to-slate-600', bgColor: 'bg-gray-50' },
  oceano: { icon: Waves, color: 'from-blue-500 to-cyan-600', bgColor: 'bg-blue-50' },
  default: { icon: MapPin, color: 'from-gray-400 to-gray-500', bgColor: 'bg-gray-50' }
};

function getBiomeTheme(biomeName: string | undefined) {
  if (!biomeName) return BIOME_THEMES.default;
  const normalizedName = biomeName.toLowerCase();
  for (const [key, theme] of Object.entries(BIOME_THEMES)) {
    if (normalizedName.includes(key)) return theme;
  }
  return BIOME_THEMES.default;
}

export default function SimpleExpeditionSystem({ 
  biomes, 
  resources, 
  player, 
  isVisible 
}: SimpleExpeditionSystemProps) {
  const [selectedBiome, setSelectedBiome] = useState<Biome | null>(null);
  const [selectedResources, setSelectedResources] = useState<string[]>([]);
  const [showResourceSelection, setShowResourceSelection] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar expedições ativas
  const { data: activeExpeditionsData, isLoading } = useQuery<ActiveExpedition[] | { data: ActiveExpedition[] }>({
    queryKey: ['/api/expeditions/player', player.id, 'active'],
    refetchInterval: 2000,
    enabled: isVisible && !!player.id
  });

  // Garantir que activeExpeditions seja sempre um array
  const activeExpeditions = Array.isArray(activeExpeditionsData) 
    ? activeExpeditionsData 
    : (activeExpeditionsData?.data && Array.isArray(activeExpeditionsData.data)) 
      ? activeExpeditionsData.data 
      : [];

  // Iniciar expedição
  const startExpeditionMutation = useMutation({
    mutationFn: async (data: { biomeId: string; selectedResources: string[] }) => {
      const response = await fetch(`/api/expeditions/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          playerId: player.id,
          templateId: 'gathering-basic', // Template padrão simples
          biomeId: data.biomeId,
          selectedResources: data.selectedResources
        })
      });
      if (!response.ok) throw new Error('Falha ao iniciar expedição');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Expedição Iniciada!",
        description: "Sua expedição começou com sucesso."
      });
      queryClient.invalidateQueries({ queryKey: ['/api/expeditions/player', player.id] });
      setSelectedBiome(null);
      setSelectedResources([]);
      setShowResourceSelection(false);
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao Iniciar Expedição",
        description: error.message || "Não foi possível iniciar a expedição.",
        variant: "destructive"
      });
    }
  });

  // Completar expedição
  const completeExpeditionMutation = useMutation({
    mutationFn: async (expeditionId: string) => {
      const response = await fetch(`/api/expeditions/${expeditionId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error('Falha ao completar expedição');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Expedição Concluída!",
        description: "Você coletou recursos com sucesso!"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/expeditions/player', player.id] });
      queryClient.invalidateQueries({ queryKey: ['/api/inventory', player.id] });
    }
  });

  // Cancelar expedição
  const cancelExpeditionMutation = useMutation({
    mutationFn: async (expeditionId: string) => {
      const response = await fetch(`/api/expeditions/${expeditionId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error('Falha ao cancelar expedição');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Expedição Cancelada",
        description: "A expedição foi cancelada."
      });
      queryClient.invalidateQueries({ queryKey: ['/api/expeditions/player', player.id] });
    }
  });

  // Formatar tempo restante
  const formatTimeRemaining = (endTime?: number) => {
    if (!endTime) return "Calculando...";
    const remaining = Math.max(0, endTime - Date.now());
    const minutes = Math.floor(remaining / (1000 * 60));
    const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
    
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  };

  // Auto-completar expedições quando o tempo acabar
  useEffect(() => {
    activeExpeditions.forEach(expedition => {
      if (expedition.progress >= 100 && expedition.status === 'active') {
        completeExpeditionMutation.mutate(expedition.id);
      }
    });
  }, [activeExpeditions, completeExpeditionMutation]);

  // Obter recursos disponíveis no bioma selecionado
  const getBiomeResources = (biome: Biome) => {
    if (!biome.availableResources) return [];
    return biome.availableResources
      .map(resourceId => resources.find(r => r.id === resourceId))
      .filter(Boolean) as typeof resources;
  };

  // Iniciar seleção de recursos
  const handleBiomeSelect = (biome: Biome) => {
    setSelectedBiome(biome);
    setSelectedResources([]);
    setShowResourceSelection(true);
  };

  // Confirmar expedição com recursos selecionados
  const handleConfirmExpedition = () => {
    if (!selectedBiome) return;
    
    if (selectedResources.length === 0) {
      toast({
        title: "Nenhum Recurso Selecionado",
        description: "Selecione pelo menos um recurso para coletar.",
        variant: "destructive"
      });
      return;
    }

    startExpeditionMutation.mutate({ 
      biomeId: selectedBiome.id, 
      selectedResources 
    });
  };

  // Cancelar seleção
  const handleCancelSelection = () => {
    setSelectedBiome(null);
    setSelectedResources([]);
    setShowResourceSelection(false);
  };

  if (!isVisible) return null;

  return (
    <div className="space-y-6">
      {/* Expedições Ativas */}
      {activeExpeditions.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Expedições Ativas
          </h3>
          
          {activeExpeditions.map(expedition => {
            const theme = getBiomeTheme(expedition.biomeName);
            const IconComponent = theme.icon;
            
            // Encontrar o bioma correspondente
            const biome = biomes.find(b => b.id === expedition.biomeId);
            const biomeName = expedition.biomeName || biome?.name || 'Bioma Desconhecido';
            
            return (
              <Card key={expedition.id} className="overflow-hidden">
                <CardHeader className={`pb-3 ${theme.bgColor}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-gradient-to-r ${theme.color} text-white`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{biomeName}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {formatTimeRemaining(expedition.endTime)} restantes
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      {expedition.progress >= 100 ? (
                        <Button
                          size="sm"
                          onClick={() => completeExpeditionMutation.mutate(expedition.id)}
                          disabled={completeExpeditionMutation.isPending}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Coletar
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => cancelExpeditionMutation.mutate(expedition.id)}
                          disabled={cancelExpeditionMutation.isPending}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Cancelar
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progresso</span>
                        <span>{Math.round(expedition.progress)}%</span>
                      </div>
                      <Progress value={expedition.progress} className="h-2" />
                    </div>
                    
                    {Object.keys(expedition.collectedResources || {}).length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2 flex items-center gap-1">
                          <Package className="w-4 h-4" />
                          Recursos Coletados
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(expedition.collectedResources || {}).map(([resourceId, quantity]) => {
                            const resource = resources.find(r => r.id === resourceId);
                            return (
                              <Badge key={resourceId} variant="secondary" className="text-xs">
                                {resource?.name || 'Recurso'} x{quantity}
                              </Badge>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Seleção de Biomas */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Iniciar Nova Expedição
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {biomes.map(biome => {
            const theme = getBiomeTheme(biome.name);
            const IconComponent = theme.icon;
            const hasActiveExpedition = activeExpeditions.some(exp => exp.biomeId === biome.id);
            
            return (
              <Card 
                key={biome.id} 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  hasActiveExpedition ? 'opacity-50' : 'hover:scale-105'
                } ${selectedBiome?.id === biome.id ? 'ring-2 ring-blue-500' : ''}`}
                onClick={() => !hasActiveExpedition && setSelectedBiome(biome)}
              >
                <CardHeader className={`pb-3 ${theme.bgColor}`}>
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-lg bg-gradient-to-r ${theme.color} text-white`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{biome.name}</CardTitle>
                      <p className="text-xs text-muted-foreground">
                        {biome.availableResources?.length || 0} recursos disponíveis
                      </p>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-4">
                  <p className="text-sm text-muted-foreground mb-3">
                    Explorar este bioma em busca de recursos.
                  </p>
                  
                  {hasActiveExpedition ? (
                    <Badge variant="secondary" className="w-full justify-center">
                      Expedição em Andamento
                    </Badge>
                  ) : (
                    <Button
                      className="w-full"
                      size="sm"
                      disabled={startExpeditionMutation.isPending}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBiomeSelect(biome);
                      }}
                    >
                      <Play className="w-4 h-4 mr-1" />
                      Selecionar Recursos
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Modal de Seleção de Recursos */}
      {showResourceSelection && selectedBiome && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Selecionar Recursos - {selectedBiome.name}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Escolha quais recursos você quer focar em coletar
              </p>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {getBiomeResources(selectedBiome).length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  Nenhum recurso disponível neste bioma
                </p>
              ) : (
                <div className="space-y-2">
                  {getBiomeResources(selectedBiome).map(resource => (
                    <label 
                      key={resource.id} 
                      className="flex items-center space-x-3 p-3 rounded-lg border cursor-pointer hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        checked={selectedResources.includes(resource.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedResources(prev => [...prev, resource.id]);
                          } else {
                            setSelectedResources(prev => prev.filter(id => id !== resource.id));
                          }
                        }}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <div className="flex-1">
                        <p className="font-medium">{resource.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {resource.description || 'Recurso disponível no bioma'}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </CardContent>
            
            <div className="flex gap-2 p-4 border-t">
              <Button
                variant="outline"
                onClick={handleCancelSelection}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleConfirmExpedition}
                disabled={selectedResources.length === 0 || startExpeditionMutation.isPending}
                className="flex-1"
              >
                {startExpeditionMutation.isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Iniciando...
                  </div>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-1" />
                    Iniciar ({selectedResources.length} recursos)
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>
      )}
      
      {/* Informações do Jogador */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Status do Jogador</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-muted-foreground">Fome</p>
              <p className="font-semibold">{player.hunger}%</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Sede</p>
              <p className="font-semibold">{player.thirst}%</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Saúde</p>
              <p className="font-semibold">{player.health}%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
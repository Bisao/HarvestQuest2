import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { 
  Hammer, 
  Flame, 
  Wrench, 
  Zap, 
  Clock, 
  Star, 
  AlertTriangle,
  Settings,
  TrendingUp,
  Battery,
  Gauge
} from 'lucide-react';
import type { Player, Resource } from '@shared/types';

interface RobustWorkshopsTabProps {
  player: Player;
  resources: Resource[];
  isBlocked?: boolean;
}

interface WorkshopState {
  id: string;
  workshopType: string;
  condition: {
    durability: number;
    cleanliness: number;
    organization: number;
  };
  energy: {
    current: number;
    maximum: number;
    regenerationRate: number;
  };
  activeProcesses: ActiveProcess[];
  upgrades: {
    efficiencyUpgrade: number;
    speedUpgrade: number;
    qualityUpgrade: number;
    capacityUpgrade: number;
  };
  statistics: {
    totalProcessed: number;
    successfulProcesses: number;
    failedProcesses: number;
    averageQuality: number;
  };
}

interface ActiveProcess {
  id: string;
  processId: string;
  status: 'preparing' | 'running' | 'paused' | 'completed' | 'failed';
  progress: number;
  startTime: string;
  estimatedCompletionTime: string;
  expectedOutputs: {
    resourceId: string;
    estimatedQuantity: number;
    qualityPrediction: string;
  }[];
  modifiers: {
    efficiencyBonus: number;
    qualityBonus: number;
    speedBonus: number;
  };
  batchNumber: number;
}

interface RobustProcess {
  id: string;
  name: string;
  emoji: string;
  description: string;
  category: string;
  requiredLevel: number;
  input: { resourceId: string; quantity: number; quality?: string };
  secondary?: { resourceId: string; quantity: number; optional?: boolean };
  fuel?: { resourceId: string; quantity: number; burnTime: number };
  outputs: {
    primary: { resourceId: string; baseQuantity: number; qualityMultiplier: number };
    secondary?: { resourceId: string; baseQuantity: number; chance: number };
  };
  requirements: {
    tools: { equipmentId: string; durabilityLoss: number; efficiencyBonus: number }[];
    workshop: { energyConsumption: number; maintenanceRequired: boolean };
    skill: { minimumLevel: number; experienceGained: number; failureChance: number };
  };
  timing: {
    baseProcessingTime: number;
    batchSize: number;
    cooldownTime: number;
  };
  costs: {
    setupCost: number;
    maintenanceCost: number;
    energyCost: number;
  };
  tags: string[];
}

export default function RobustWorkshopsTab({ player, resources, isBlocked }: RobustWorkshopsTabProps) {
  const [selectedWorkshop, setSelectedWorkshop] = useState<string>('bancada');
  const [selectedProcess, setSelectedProcess] = useState<RobustProcess | null>(null);
  const [batchSize, setBatchSize] = useState(1);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar estado das oficinas
  const { data: workshopStates = {}, isLoading: statesLoading } = useQuery({
    queryKey: [`/api/v3/workshops/${player.id}/states`],
    refetchInterval: 3000,
  });

  // Buscar processos disponíveis
  const { data: availableProcesses = [], isLoading: processesLoading } = useQuery({
    queryKey: [`/api/v3/workshops/processes`],
    select: (data: RobustProcess[]) => data.filter(p => p.requiredLevel <= player.level),
  });

  // Buscar processos ativos
  const { data: activeProcesses = [], isLoading: activeLoading } = useQuery({
    queryKey: [`/api/v3/workshops/${player.id}/active`],
    refetchInterval: 2000,
  });

  // Mutação para iniciar processo
  const startProcessMutation = useMutation({
    mutationFn: async ({ processId, quantity }: { processId: string; quantity: number }) => {
      const response = await fetch(`/api/v3/workshops/${player.id}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ processId, quantity }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [`/api/v3/workshops/${player.id}`] });
      toast({
        title: "Processo Iniciado!",
        description: data.message,
      });
      setSelectedProcess(null);
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao Iniciar Processo",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutação para manutenção
  const maintenanceMutation = useMutation({
    mutationFn: async (workshopType: string) => {
      const response = await fetch(`/api/v3/workshops/${player.id}/${workshopType}/maintenance`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/v3/workshops/${player.id}`] });
      toast({
        title: "Manutenção Realizada!",
        description: "Oficina restaurada com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro na Manutenção",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const currentWorkshop: WorkshopState = workshopStates[selectedWorkshop];
  const workshopProcesses = availableProcesses.filter(p => p.category === selectedWorkshop);
  const currentActiveProcesses = activeProcesses.filter(p => 
    p.processId && availableProcesses.find(ap => ap.id === p.processId)?.category === selectedWorkshop
  );

  const getConditionColor = (value: number) => {
    if (value >= 80) return 'text-green-600';
    if (value >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getQualityColor = (quality: string) => {
    const colors = {
      'baixa': 'bg-gray-500',
      'media': 'bg-blue-500', 
      'alta': 'bg-green-500',
      'superior': 'bg-purple-500',
      'lendaria': 'bg-yellow-500'
    };
    return colors[quality as keyof typeof colors] || 'bg-gray-500';
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}min`;
  };

  const canStartProcess = (process: RobustProcess) => {
    if (!currentWorkshop) return false;
    if (currentWorkshop.energy.current < process.requirements.workshop.energyConsumption) return false;
    if (currentActiveProcesses.length >= (1 + currentWorkshop.upgrades.capacityUpgrade)) return false;
    
    // Verificar recursos disponíveis
    const requiredResources = [
      { id: process.input.resourceId, qty: process.input.quantity * batchSize },
      ...(process.secondary ? [{ id: process.secondary.resourceId, qty: process.secondary.quantity * batchSize }] : []),
      ...(process.fuel ? [{ id: process.fuel.resourceId, qty: process.fuel.quantity * batchSize }] : [])
    ];

    return requiredResources.every(req => {
      const available = resources
        .filter(r => r.id === req.id)
        .reduce((sum, r) => sum + (r.quantity || 0), 0);
      return available >= req.qty;
    });
  };

  if (statesLoading || processesLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Carregando sistema de oficinas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com Status Geral */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Battery className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Energia Total</p>
                <p className="text-2xl font-bold">{Object.values(workshopStates).reduce((sum: number, ws: any) => sum + (ws?.energy?.current || 0), 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">Processos Ativos</p>
                <p className="text-2xl font-bold">{activeProcesses.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium">Taxa de Sucesso</p>
                <p className="text-2xl font-bold">
                  {Object.values(workshopStates).reduce((sum: number, ws: any) => {
                    const stats = ws?.statistics;
                    if (!stats || stats.totalProcessed === 0) return sum;
                    return sum + (stats.successfulProcesses / stats.totalProcessed);
                  }, 0) / Math.max(Object.keys(workshopStates).length, 1) * 100 || 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm font-medium">Qualidade Média</p>
                <p className="text-2xl font-bold">
                  {Object.values(workshopStates).reduce((sum: number, ws: any) => sum + (ws?.statistics?.averageQuality || 0), 0) / Math.max(Object.keys(workshopStates).length, 1) || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Seletor de Oficinas */}
      <Tabs value={selectedWorkshop} onValueChange={setSelectedWorkshop} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="bancada" className="flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            Bancada
          </TabsTrigger>
          <TabsTrigger value="madeira" className="flex items-center gap-2">
            <Hammer className="h-4 w-4" />
            Madeira
          </TabsTrigger>
          <TabsTrigger value="pedras" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Pedras
          </TabsTrigger>
          <TabsTrigger value="forja" className="flex items-center gap-2">
            <Flame className="h-4 w-4" />
            Forja
          </TabsTrigger>
          <TabsTrigger value="fogueira" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Fogueira
          </TabsTrigger>
        </TabsList>

        <TabsContent value={selectedWorkshop} className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Painel da Oficina */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Status da Oficina
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => maintenanceMutation.mutate(selectedWorkshop)}
                    disabled={maintenanceMutation.isPending || !currentWorkshop}
                  >
                    🔧 Manutenção
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentWorkshop ? (
                  <>
                    {/* Condições da Oficina */}
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Durabilidade</span>
                          <span className={getConditionColor(currentWorkshop.condition.durability)}>
                            {currentWorkshop.condition.durability}%
                          </span>
                        </div>
                        <Progress value={currentWorkshop.condition.durability} />
                      </div>

                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Limpeza</span>
                          <span className={getConditionColor(currentWorkshop.condition.cleanliness)}>
                            {currentWorkshop.condition.cleanliness}%
                          </span>
                        </div>
                        <Progress value={currentWorkshop.condition.cleanliness} />
                      </div>

                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Organização</span>
                          <span className={getConditionColor(currentWorkshop.condition.organization)}>
                            {currentWorkshop.condition.organization}%
                          </span>
                        </div>
                        <Progress value={currentWorkshop.condition.organization} />
                      </div>

                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Energia</span>
                          <span className="text-blue-600">
                            {currentWorkshop.energy.current}/{currentWorkshop.energy.maximum}
                          </span>
                        </div>
                        <Progress value={(currentWorkshop.energy.current / currentWorkshop.energy.maximum) * 100} />
                        <p className="text-xs text-gray-500 mt-1">
                          Regenera {currentWorkshop.energy.regenerationRate}/min
                        </p>
                      </div>
                    </div>

                    {/* Upgrades */}
                    <div className="pt-4 border-t">
                      <h4 className="font-medium mb-2">Melhorias</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex justify-between">
                          <span>Eficiência:</span>
                          <span>Nível {currentWorkshop.upgrades.efficiencyUpgrade}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Velocidade:</span>
                          <span>Nível {currentWorkshop.upgrades.speedUpgrade}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Qualidade:</span>
                          <span>Nível {currentWorkshop.upgrades.qualityUpgrade}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Capacidade:</span>
                          <span>Nível {currentWorkshop.upgrades.capacityUpgrade}</span>
                        </div>
                      </div>
                    </div>

                    {/* Estatísticas */}
                    <div className="pt-4 border-t">
                      <h4 className="font-medium mb-2">Estatísticas</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Total Processado:</span>
                          <span>{currentWorkshop.statistics.totalProcessed}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Taxa Sucesso:</span>
                          <span className="text-green-600">
                            {currentWorkshop.statistics.totalProcessed > 0 
                              ? Math.round((currentWorkshop.statistics.successfulProcesses / currentWorkshop.statistics.totalProcessed) * 100)
                              : 0}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500">Oficina não inicializada</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={() => {
                        // TODO: Implementar inicialização de oficina
                        toast({
                          title: "Oficina Inicializada!",
                          description: "Sua oficina está pronta para uso.",
                        });
                      }}
                    >
                      Inicializar Oficina
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Lista de Processos Disponíveis */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Processos Disponíveis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {workshopProcesses.map((process) => {
                    const canStart = canStartProcess(process);
                    const isRunning = currentActiveProcesses.some(ap => ap.processId === process.id);
                    
                    return (
                      <Card key={process.id} className={`cursor-pointer transition-colors ${selectedProcess?.id === process.id ? 'ring-2 ring-blue-500' : ''}`}>
                        <CardContent 
                          className="p-4"
                          onClick={() => setSelectedProcess(process)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-2xl">{process.emoji}</span>
                                <div>
                                  <h3 className="font-medium">{process.name}</h3>
                                  <p className="text-sm text-gray-600">{process.description}</p>
                                </div>
                              </div>
                              
                              <div className="flex flex-wrap gap-2 mb-2">
                                <Badge variant="outline">
                                  ⏱️ {formatTime(process.timing.baseProcessingTime)}
                                </Badge>
                                <Badge variant="outline">
                                  ⚡ {process.requirements.workshop.energyConsumption} energia
                                </Badge>
                                <Badge variant="outline">
                                  📊 {process.requirements.skill.experienceGained} XP
                                </Badge>
                                {process.tags.map(tag => (
                                  <Badge key={tag} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>

                              <div className="text-sm space-y-1">
                                <div className="flex items-center gap-1">
                                  <span className="font-medium">Entrada:</span>
                                  {process.input.quantity}x {resources.find(r => r.id === process.input.resourceId)?.name || process.input.resourceId}
                                </div>
                                {process.secondary && (
                                  <div className="flex items-center gap-1">
                                    <span className="font-medium">Adicional:</span>
                                    {process.secondary.quantity}x {resources.find(r => r.id === process.secondary.resourceId)?.name || process.secondary.resourceId}
                                    {process.secondary.optional && <Badge variant="outline" className="text-xs">Opcional</Badge>}
                                  </div>
                                )}
                                <div className="flex items-center gap-1">
                                  <span className="font-medium">Saída:</span>
                                  {process.outputs.primary.baseQuantity}x {resources.find(r => r.id === process.outputs.primary.resourceId)?.name || process.outputs.primary.resourceId}
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col items-end gap-2">
                              {isRunning && (
                                <Badge className="bg-yellow-500">
                                  🔄 Em Execução
                                </Badge>
                              )}
                              
                              <Button
                                size="sm"
                                disabled={!canStart || isRunning || isBlocked}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (selectedProcess?.id === process.id) {
                                    startProcessMutation.mutate({ processId: process.id, quantity: batchSize });
                                  } else {
                                    setSelectedProcess(process);
                                  }
                                }}
                              >
                                {selectedProcess?.id === process.id ? 'Iniciar' : 'Selecionar'}
                              </Button>
                            </div>
                          </div>

                          {selectedProcess?.id === process.id && (
                            <div className="mt-4 pt-4 border-t space-y-3">
                              <div>
                                <Label>Tamanho do Lote: {batchSize}</Label>
                                <Slider
                                  value={[batchSize]}
                                  onValueChange={(value) => setBatchSize(value[0])}
                                  max={Math.min(process.timing.batchSize, 10)}
                                  min={1}
                                  step={1}
                                  className="mt-2"
                                />
                              </div>

                              {!canStart && (
                                <Alert>
                                  <AlertTriangle className="h-4 w-4" />
                                  <AlertDescription>
                                    Requisitos não atendidos: energia insuficiente, recursos em falta ou capacidade máxima atingida.
                                  </AlertDescription>
                                </Alert>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Processos Ativos */}
          {currentActiveProcesses.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Processos em Execução</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {currentActiveProcesses.map((activeProcess) => {
                    const process = availableProcesses.find(p => p.id === activeProcess.processId);
                    const timeRemaining = new Date(activeProcess.estimatedCompletionTime).getTime() - Date.now();
                    const isCompleted = timeRemaining <= 0;

                    return (
                      <Card key={activeProcess.id} className={isCompleted ? 'border-green-500' : ''}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{process?.emoji}</span>
                              <div>
                                <h4 className="font-medium">{process?.name}</h4>
                                <p className="text-sm text-gray-600">
                                  Lote de {activeProcess.batchNumber} unidades
                                </p>
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <Badge className={isCompleted ? 'bg-green-500' : getQualityColor(activeProcess.expectedOutputs[0]?.qualityPrediction || 'media')}>
                                {isCompleted ? '✅ Concluído' : activeProcess.status}
                              </Badge>
                              <p className="text-sm text-gray-600 mt-1">
                                {isCompleted ? 'Pronto para coleta' : `${Math.max(0, Math.ceil(timeRemaining / (1000 * 60)))}min restantes`}
                              </p>
                            </div>
                          </div>

                          <Progress value={isCompleted ? 100 : activeProcess.progress} className="mb-2" />

                          <div className="flex justify-between text-sm text-gray-600">
                            <span>Iniciado: {new Date(activeProcess.startTime).toLocaleTimeString()}</span>
                            <span>
                              Qualidade Prevista: 
                              <Badge variant="outline" className={`ml-1 text-xs ${getQualityColor(activeProcess.expectedOutputs[0]?.qualityPrediction || 'media')}`}>
                                {activeProcess.expectedOutputs[0]?.qualityPrediction || 'média'}
                              </Badge>
                            </span>
                          </div>

                          {activeProcess.modifiers.efficiencyBonus > 0 && (
                            <div className="mt-2 text-sm">
                              <span className="text-green-600">
                                ⚡ Bonus de Eficiência: +{activeProcess.modifiers.efficiencyBonus}%
                              </span>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
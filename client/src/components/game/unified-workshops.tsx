import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SoundButton } from "@/components/ui/sound-button";
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
  Settings,
  TrendingUp,
  Clock,
  Star,
  AlertTriangle
} from 'lucide-react';
import type { Player, Resource, StorageItem } from '@shared/types';
import { RESOURCE_IDS } from '@shared/constants/game-ids';

interface UnifiedWorkshopsProps {
  player: Player;
  resources: Resource[];
  isBlocked?: boolean;
}

interface WorkshopProcess {
  id: string;
  name: string;
  emoji: string;
  description: string;
  category: "bancada" | "madeira" | "pedras" | "forja" | "fogueira";
  requiredLevel: number;
  input: { resourceId: string; quantity: number; };
  secondary?: { resourceId: string; quantity: number; };
  fuel?: { resourceId: string; quantity: number; };
  output: { resourceId: string; quantity: number; };
  processingTime: number;
  efficiency: number;
  experienceGained: number;
}

const WORKSHOP_CATEGORIES = {
  bancada: { name: "Bancada", emoji: "🔨", icon: Hammer, description: "Criação de itens e componentes" },
  madeira: { name: "Madeira", emoji: "🪵", icon: Wrench, description: "Processamento de madeira" },
  pedras: { name: "Pedras", emoji: "🪨", icon: Settings, description: "Trabalho com minerais" },
  forja: { name: "Forja", emoji: "⚒️", icon: Flame, description: "Metalurgia e fundição" },
  fogueira: { name: "Fogueira", emoji: "🔥", icon: Flame, description: "Culinária e preservação" }
};

const WORKSHOP_PROCESSES: WorkshopProcess[] = [
  // BANCADA
  {
    id: "proc-barbante-001",
    name: "Barbante",
    emoji: "🧵",
    description: "Processar fibras em barbante resistente",
    category: "bancada",
    requiredLevel: 1,
    input: { resourceId: RESOURCE_IDS.FIBRA, quantity: 4 },
    output: { resourceId: RESOURCE_IDS.BARBANTE, quantity: 3 },
    processingTime: 15,
    efficiency: 85,
    experienceGained: 5
  },
  {
    id: "proc-corda-resistente-001",
    name: "Corda Resistente",
    emoji: "🪢",
    description: "Trançar barbante em corda resistente",
    category: "bancada",
    requiredLevel: 2,
    input: { resourceId: RESOURCE_IDS.BARBANTE, quantity: 6 },
    output: { resourceId: RESOURCE_IDS.CORDA_RESIS, quantity: 2 },
    processingTime: 25,
    efficiency: 80,
    experienceGained: 12
  },
  // MADEIRA
  {
    id: "proc-madeira-processada-001",
    name: "Madeira Processada",
    emoji: "🪵",
    description: "Processar troncos em madeira utilizável",
    category: "madeira",
    requiredLevel: 1,
    input: { resourceId: RESOURCE_IDS.TRONCO, quantity: 2 },
    output: { resourceId: RESOURCE_IDS.MADEIRA, quantity: 4 },
    processingTime: 20,
    efficiency: 90,
    experienceGained: 8
  },
  // FORJA
  {
    id: "proc-ferro-fundido-001",
    name: "Ferro Fundido",
    emoji: "🔩",
    description: "Fundir minério de ferro em ferro puro",
    category: "forja",
    requiredLevel: 3,
    input: { resourceId: RESOURCE_IDS.MINERIO_FERRO, quantity: 3 },
    fuel: { resourceId: RESOURCE_IDS.CARVAO, quantity: 2 },
    output: { resourceId: RESOURCE_IDS.FERRO, quantity: 2 },
    processingTime: 45,
    efficiency: 75,
    experienceGained: 20
  },
  // FOGUEIRA
  {
    id: "proc-carne-cozida-001",
    name: "Carne Cozida",
    emoji: "🍖",
    description: "Cozinhar carne crua para consumo",
    category: "fogueira",
    requiredLevel: 1,
    input: { resourceId: RESOURCE_IDS.CARNE, quantity: 1 },
    fuel: { resourceId: RESOURCE_IDS.MADEIRA, quantity: 1 },
    output: { resourceId: RESOURCE_IDS.CARNE_COZIDA, quantity: 1 },
    processingTime: 10,
    efficiency: 95,
    experienceGained: 3
  }
];

export default function UnifiedWorkshops({ player, resources, isBlocked = false }: UnifiedWorkshopsProps) {
  const [activeCategory, setActiveCategory] = useState<keyof typeof WORKSHOP_CATEGORIES>("bancada");
  const [processQuantities, setProcessQuantities] = useState<Record<string, number>>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get storage items
  const { data: storageItems = [] } = useQuery<StorageItem[]>({
    queryKey: ["/api/storage", player.id],
    enabled: !!player.id,
  });

  // Process mutation
  const processMutation = useMutation({
    mutationFn: async ({ processId, quantity }: { processId: string; quantity: number }) => {
      const response = await fetch("/api/v3/workshop/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId: player.id, processId, quantity }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Erro no servidor" }));
        throw new Error(errorData.message || `Erro HTTP ${response.status}`);
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Processamento Concluído!",
        description: `${data.quantity}x ${data.outputItem} criado com sucesso!`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/storage"] });
      queryClient.invalidateQueries({ queryKey: ["/api/player"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro no Processamento",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Filter processes by category and level
  const availableProcesses = useMemo(() => {
    return WORKSHOP_PROCESSES.filter(
      process => process.category === activeCategory && player.level >= process.requiredLevel
    );
  }, [activeCategory, player.level]);

  // Check if player has required resources
  const canProcess = (process: WorkshopProcess, quantity: number) => {
    const inputItem = storageItems.find(item => item.resourceId === process.input.resourceId);
    const hasInput = inputItem && inputItem.quantity >= (process.input.quantity * quantity);

    let hasSecondary = true;
    if (process.secondary) {
      const secondaryItem = storageItems.find(item => item.resourceId === process.secondary!.resourceId);
      hasSecondary = secondaryItem && secondaryItem.quantity >= (process.secondary.quantity * quantity);
    }

    let hasFuel = true;
    if (process.fuel) {
      const fuelItem = storageItems.find(item => item.resourceId === process.fuel!.resourceId);
      hasFuel = fuelItem && fuelItem.quantity >= (process.fuel.quantity * quantity);
    }

    return hasInput && hasSecondary && hasFuel;
  };

  const getResourceName = (resourceId: string) => {
    const resource = resources.find(r => r.id === resourceId);
    return resource?.name || "Recurso Desconhecido";
  };

  const getResourceQuantity = (resourceId: string) => {
    const item = storageItems.find(item => item.resourceId === resourceId);
    return item?.quantity || 0;
  };

  const handleProcess = (processId: string) => {
    const quantity = processQuantities[processId] || 1;
    processMutation.mutate({ processId, quantity });
  };

  const setProcessQuantity = (processId: string, quantity: number) => {
    setProcessQuantities(prev => ({ ...prev, [processId]: quantity }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Hammer className="w-6 h-6 text-amber-600" />
        <h2 className="text-xl font-bold">Oficinas Unificadas</h2>
      </div>

      <Tabs value={activeCategory} onValueChange={(value) => setActiveCategory(value as keyof typeof WORKSHOP_CATEGORIES)}>
        <TabsList className="grid w-full grid-cols-5">
          {Object.entries(WORKSHOP_CATEGORIES).map(([key, category]) => (
            <TabsTrigger key={key} value={key} className="flex items-center space-x-1">
              <span>{category.emoji}</span>
              <span className="hidden sm:inline">{category.name}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.entries(WORKSHOP_CATEGORIES).map(([categoryKey, category]) => (
          <TabsContent key={categoryKey} value={categoryKey} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <category.icon className="w-5 h-5" />
                  <span>{category.name}</span>
                </CardTitle>
                <p className="text-sm text-muted-foreground">{category.description}</p>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {availableProcesses.filter(p => p.category === categoryKey).map((process) => {
                    const currentQuantity = processQuantities[process.id] || 1;
                    const canExecute = canProcess(process, currentQuantity);

                    return (
                      <Card key={process.id} className={`transition-all ${canExecute ? 'border-green-200 bg-green-50/50' : 'border-gray-200 bg-gray-50/50'}`}>
                        <CardContent className="p-4">
                          <div className="flex flex-col space-y-3">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center space-x-2">
                                <span className="text-2xl">{process.emoji}</span>
                                <div>
                                  <h4 className="font-semibold">{process.name}</h4>
                                  <p className="text-sm text-muted-foreground">{process.description}</p>
                                </div>
                              </div>
                              <Badge variant={canExecute ? "default" : "secondary"}>
                                Nível {process.requiredLevel}
                              </Badge>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                              <div>
                                <Label className="font-medium">Materiais Necessários:</Label>
                                <div className="space-y-1">
                                  <div className="flex justify-between">
                                    <span>{getResourceName(process.input.resourceId)}</span>
                                    <span className={getResourceQuantity(process.input.resourceId) >= (process.input.quantity * currentQuantity) ? 'text-green-600' : 'text-red-600'}>
                                      {process.input.quantity * currentQuantity} ({getResourceQuantity(process.input.resourceId)} disponível)
                                    </span>
                                  </div>
                                  {process.secondary && (
                                    <div className="flex justify-between">
                                      <span>{getResourceName(process.secondary.resourceId)}</span>
                                      <span className={getResourceQuantity(process.secondary.resourceId) >= (process.secondary.quantity * currentQuantity) ? 'text-green-600' : 'text-red-600'}>
                                        {process.secondary.quantity * currentQuantity} ({getResourceQuantity(process.secondary.resourceId)} disponível)
                                      </span>
                                    </div>
                                  )}
                                  {process.fuel && (
                                    <div className="flex justify-between">
                                      <span>🔥 {getResourceName(process.fuel.resourceId)}</span>
                                      <span className={getResourceQuantity(process.fuel.resourceId) >= (process.fuel.quantity * currentQuantity) ? 'text-green-600' : 'text-red-600'}>
                                        {process.fuel.quantity * currentQuantity} ({getResourceQuantity(process.fuel.resourceId)} disponível)
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div>
                                <Label className="font-medium">Resultado:</Label>
                                <div className="flex justify-between">
                                  <span>{getResourceName(process.output.resourceId)}</span>
                                  <span className="text-green-600">+{process.output.quantity * currentQuantity}</span>
                                </div>
                                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                  <span>Experiência:</span>
                                  <span>+{process.experienceGained * currentQuantity} XP</span>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <Label>Quantidade: {currentQuantity}</Label>
                                <Slider
                                  value={[currentQuantity]}
                                  onValueChange={(value) => setProcessQuantity(process.id, value[0])}
                                  max={10}
                                  min={1}
                                  step={1}
                                  className="w-full"
                                />
                                <SoundButton
                                  onClick={() => handleProcess(process.id)}
                                  disabled={!canExecute || isBlocked || processMutation.isPending}
                                  className="w-full"
                                  size="sm"
                                  soundType="craft"
                                >
                                  {processMutation.isPending ? "Processando..." : `Processar ${currentQuantity}x`}
                                </SoundButton>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}

                  {availableProcesses.filter(p => p.category === categoryKey).length === 0 && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Nenhum processo disponível para o seu nível atual. Continue explorando para desbloquear novas receitas!
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
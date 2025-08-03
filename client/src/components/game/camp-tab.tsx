import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Home,
  Package,
  Sprout,
  PiggyBank,
  Warehouse,
  TreePine,
  Wheat,
  Egg,
  Milk,
  Heart,
  Clock,
  Plus,
  Settings,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import type { Player, Resource, Equipment } from '@shared/types';
import EnhancedStorageTab from './enhanced-storage-tab';

interface CampTabProps {
  player: Player;
  resources: Resource[];
  equipment: Equipment[];
}

// Dados simulados para plantações e animais
const PLANT_TYPES = [
  {
    id: 'wheat',
    name: 'Trigo',
    emoji: '🌾',
    growTime: 120, // minutos
    yield: { min: 2, max: 4 },
    requiredLevel: 1,
    seeds: 'res-wheat-seeds',
    product: 'res-wheat'
  },
  {
    id: 'corn',
    name: 'Milho',
    emoji: '🌽',
    growTime: 180,
    yield: { min: 3, max: 6 },
    requiredLevel: 3,
    seeds: 'res-corn-seeds',
    product: 'res-corn'
  },
  {
    id: 'potato',
    name: 'Batata',
    emoji: '🥔',
    growTime: 90,
    yield: { min: 1, max: 3 },
    requiredLevel: 2,
    seeds: 'res-potato-seeds',
    product: 'res-potato'
  }
];

const ANIMAL_TYPES = [
  {
    id: 'chicken',
    name: 'Galinha',
    emoji: '🐔',
    feedCost: 1,
    productionTime: 60, // minutos
    requiredLevel: 2,
    feed: 'res-seeds',
    product: 'res-egg',
    maxAnimals: 5
  },
  {
    id: 'cow',
    name: 'Vaca',
    emoji: '🐄',
    feedCost: 3,
    productionTime: 180,
    requiredLevel: 5,
    feed: 'res-hay',
    product: 'res-milk',
    maxAnimals: 2
  },
  {
    id: 'pig',
    name: 'Porco',
    emoji: '🐷',
    feedCost: 2,
    productionTime: 120,
    requiredLevel: 4,
    feed: 'res-vegetables',
    product: 'res-meat',
    maxAnimals: 3
  }
];

export default function CampTab({ player, resources, equipment }: CampTabProps) {
  const [selectedTab, setSelectedTab] = useState('storage');
  const [plantations, setPlantations] = useState<any[]>([]);
  const [animals, setAnimals] = useState<any[]>([]);

  // Estatísticas do acampamento
  const campStats = {
    totalStorage: 50,
    usedStorage: 12,
    activePlantations: plantations.length,
    totalAnimals: animals.length,
    dailyProduction: 0
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho do Acampamento */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <Home className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-xl flex items-center space-x-2">
                  <span>Acampamento Base</span>
                  <span className="text-2xl">🏕️</span>
                </CardTitle>
                <CardDescription>
                  Gerencie seu armazém, plantações e criação de animais
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{campStats.usedStorage}/{campStats.totalStorage}</div>
                <div className="text-sm text-gray-600">Armazenamento</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{campStats.activePlantations}</div>
                <div className="text-sm text-gray-600">Plantações</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{campStats.totalAnimals}</div>
                <div className="text-sm text-gray-600">Animais</div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Abas do Acampamento */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="storage" className="flex items-center space-x-2">
            <Warehouse className="w-4 h-4" />
            <span>Armazém</span>
          </TabsTrigger>
          <TabsTrigger value="farming" className="flex items-center space-x-2">
            <Sprout className="w-4 h-4" />
            <span>Plantação</span>
          </TabsTrigger>
          <TabsTrigger value="animals" className="flex items-center space-x-2">
            <PiggyBank className="w-4 h-4" />
            <span>Animais</span>
          </TabsTrigger>
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <BarChart3 className="w-4 h-4" />
            <span>Visão Geral</span>
          </TabsTrigger>
        </TabsList>

        {/* Aba do Armazém */}
        <TabsContent value="storage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="w-5 h-5" />
                <span>Armazém do Acampamento</span>
              </CardTitle>
              <CardDescription>
                Armazenamento centralizado para recursos e equipamentos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EnhancedStorageTab 
                playerId={player.id}
                player={player}
                resources={resources}
                equipment={equipment}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba de Plantação */}
        <TabsContent value="farming" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Plantações Ativas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Wheat className="w-5 h-5 text-green-600" />
                  <span>Plantações Ativas</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {plantations.length === 0 ? (
                  <div className="text-center py-8">
                    <Sprout className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-600 mb-2">Nenhuma plantação ativa</h3>
                    <p className="text-gray-500 mb-4">
                      Comece plantando algumas sementes para produzir alimentos
                    </p>
                    <Button className="flex items-center space-x-2">
                      <Plus className="w-4 h-4" />
                      <span>Nova Plantação</span>
                    </Button>
                  </div>
                ) : (
                  <ScrollArea className="h-[300px]">
                    {/* Lista de plantações será implementada */}
                  </ScrollArea>
                )}
              </CardContent>
            </Card>

            {/* Tipos de Plantas Disponíveis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TreePine className="w-5 h-5 text-green-600" />
                  <span>Cultivos Disponíveis</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-3">
                    {PLANT_TYPES.map((plant) => (
                      <Card key={plant.id} className="border border-green-200">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <span className="text-2xl">{plant.emoji}</span>
                              <div>
                                <h4 className="font-medium">{plant.name}</h4>
                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                  <Clock className="w-3 h-3" />
                                  <span>{plant.growTime}min</span>
                                  <span>•</span>
                                  <span>Nível {plant.requiredLevel}+</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-gray-600">Produção</div>
                              <div className="font-medium">{plant.yield.min}-{plant.yield.max}</div>
                            </div>
                          </div>
                          <div className="mt-3">
                            <Button 
                              size="sm" 
                              disabled={player.level < plant.requiredLevel}
                              className="w-full"
                            >
                              {player.level < plant.requiredLevel ? 'Nível Insuficiente' : 'Plantar'}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Aba de Animais */}
        <TabsContent value="animals" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Animais Ativos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Heart className="w-5 h-5 text-red-500" />
                  <span>Animais do Acampamento</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {animals.length === 0 ? (
                  <div className="text-center py-8">
                    <PiggyBank className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-600 mb-2">Nenhum animal</h3>
                    <p className="text-gray-500 mb-4">
                      Comece criando alguns animais para produzir recursos
                    </p>
                    <Button className="flex items-center space-x-2">
                      <Plus className="w-4 h-4" />
                      <span>Adicionar Animal</span>
                    </Button>
                  </div>
                ) : (
                  <ScrollArea className="h-[300px]">
                    {/* Lista de animais será implementada */}
                  </ScrollArea>
                )}
              </CardContent>
            </Card>

            {/* Tipos de Animais Disponíveis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Egg className="w-5 h-5 text-yellow-600" />
                  <span>Criação Disponível</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-3">
                    {ANIMAL_TYPES.map((animal) => (
                      <Card key={animal.id} className="border border-blue-200">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <span className="text-2xl">{animal.emoji}</span>
                              <div>
                                <h4 className="font-medium">{animal.name}</h4>
                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                  <Clock className="w-3 h-3" />
                                  <span>{animal.productionTime}min</span>
                                  <span>•</span>
                                  <span>Máx: {animal.maxAnimals}</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-gray-600">Custo/dia</div>
                              <div className="font-medium">{animal.feedCost} ração</div>
                            </div>
                          </div>
                          <div className="mt-3">
                            <Button 
                              size="sm" 
                              disabled={player.level < animal.requiredLevel}
                              className="w-full"
                            >
                              {player.level < animal.requiredLevel ? 'Nível Insuficiente' : 'Adquirir'}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Aba de Visão Geral */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {/* Estatísticas de Produção */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <span>Produção Diária</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">0</div>
                  <div className="text-sm text-gray-600">Recursos/dia</div>
                </div>
                <Progress value={0} className="w-full" />
                <div className="text-sm text-gray-600 text-center">
                  Eficiência: 0%
                </div>
              </CardContent>
            </Card>

            {/* Status do Armazém */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Package className="w-5 h-5 text-blue-600" />
                  <span>Capacidade</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {Math.round((campStats.usedStorage / campStats.totalStorage) * 100)}%
                  </div>
                  <div className="text-sm text-gray-600">Ocupado</div>
                </div>
                <Progress 
                  value={(campStats.usedStorage / campStats.totalStorage) * 100} 
                  className="w-full" 
                />
                <div className="text-sm text-gray-600 text-center">
                  {campStats.usedStorage}/{campStats.totalStorage} slots
                </div>
              </CardContent>
            </Card>

            {/* Próximas Atividades */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-purple-600" />
                  <span>Próximas Colheitas</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <div className="text-sm text-gray-600">Nenhuma atividade agendada</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Dicas e Melhorias */}
          <Alert>
            <Settings className="h-4 w-4" />
            <AlertDescription>
              <strong>Dicas para melhorar seu acampamento:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Plante cultivos de diferentes tempos para ter produção constante</li>
                <li>Mantenha animais bem alimentados para máxima produção</li>
                <li>Expanda o armazém quando necessário para acomodar mais recursos</li>
                <li>Combine plantação e criação para ser autossuficiente</li>
              </ul>
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>
    </div>
  );
}
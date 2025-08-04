
import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  MapPin, 
  Clock, 
  Star, 
  TreePine, 
  Pickaxe, 
  Fish, 
  Rabbit, 
  Leaf,
  Mountain,
  Timer,
  Sun,
  Moon,
  Droplets,
  Wind
} from 'lucide-react';
import type { Player, Resource, Equipment } from '@shared/types';

interface BiomeResource {
  resourceId: string;
  spawnRate: number;
  rarity: "common" | "uncommon" | "rare" | "legendary";
  requiredLevel: number;
  requiredTool?: string;
  dailyLimit?: number;
}

interface BiomeData {
  id: string;
  displayName: string;
  description: string;
  emoji: string;
  difficulty: number;
  requiredLevel: number;
  dangerLevel: number;
  explorationTime: number;
  discoverable: boolean;
  category: "basic" | "advanced" | "special";
  resources: BiomeResource[];
  specialFeatures: string[];
  weatherEffects: string[];
  timeOfDayEffects: {
    day: { bonusMultiplier: number; description: string };
    night: { bonusMultiplier: number; description: string };
  };
}

interface BiomesTabProps {
  player: Player;
  resources: Resource[];
  equipment: Equipment[];
  onStartExpedition?: (biomeId: string) => void;
}

export default function BiomesTab({ 
  player, 
  resources, 
  equipment, 
  onStartExpedition 
}: BiomesTabProps) {
  const [selectedBiome, setSelectedBiome] = useState<string | null>(null);
  const [resourceFilter, setResourceFilter] = useState<string>('all');
  const { toast } = useToast();

  // Fetch biomes data
  const { data: biomes = [], isLoading } = useQuery({
    queryKey: ['biomes'],
    queryFn: async () => {
      const response = await fetch('/api/biomes');
      if (!response.ok) throw new Error('Failed to fetch biomes');
      return response.json() as BiomeData[];
    }
  });

  // Get available biomes for player level
  const availableBiomes = useMemo(() => {
    return biomes.filter(biome => 
      biome.requiredLevel <= player.level && biome.discoverable
    );
  }, [biomes, player.level]);

  // Get player tools
  const playerTools = useMemo(() => {
    const tools = [];
    if (player.equippedTool) tools.push(player.equippedTool);
    if (player.equippedWeapon) tools.push('weapon');
    // Add logic to check inventory for tools
    return tools;
  }, [player]);

  // Get resources for selected biome
  const biomeResources = useMemo(() => {
    if (!selectedBiome) return [];
    
    const biome = biomes.find(b => b.id === selectedBiome);
    if (!biome) return [];

    return biome.resources.filter(resource => {
      // Filter by player level
      if (resource.requiredLevel > player.level) return false;
      
      // Filter by category if selected
      if (resourceFilter !== 'all') {
        const resourceData = resources.find(r => r.id === resource.resourceId);
        if (!resourceData) return false;
        
        // Simple categorization logic
        if (resourceFilter === 'animals' && !['🐰', '🦌', '🐗'].includes(resourceData.emoji)) return false;
        if (resourceFilter === 'fish' && !['🐟', '🐠', '🍣'].includes(resourceData.emoji)) return false;
        if (resourceFilter === 'plants' && !['🍄', '🫐', '🌾'].includes(resourceData.emoji)) return false;
        if (resourceFilter === 'minerals' && !['🪨', '🗿', '🔩'].includes(resourceData.emoji)) return false;
      }
      
      return true;
    });
  }, [selectedBiome, biomes, player.level, resourceFilter, resources]);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-green-100 text-green-800 border-green-200';
      case 'uncommon': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'rare': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'legendary': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getResourceData = (resourceId: string) => {
    return resources.find(r => r.id === resourceId);
  };

  const canAccessResource = (resource: BiomeResource) => {
    if (resource.requiredLevel > player.level) return false;
    if (resource.requiredTool && !playerTools.includes(resource.requiredTool)) return false;
    return true;
  };

  const handleStartExpedition = (biomeId: string) => {
    const biome = biomes.find(b => b.id === biomeId);
    if (!biome) return;

    if (player.hunger < 30 || player.thirst < 30) {
      toast({
        title: "Recursos insuficientes",
        description: "Você precisa de pelo menos 30 de fome e sede para iniciar uma expedição.",
        variant: "destructive"
      });
      return;
    }

    onStartExpedition?.(biomeId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-4xl mb-4">🗺️</div>
          <div className="text-lg">Carregando biomas...</div>
        </div>
      </div>
    );
  }

  const selectedBiomeData = selectedBiome ? biomes.find(b => b.id === selectedBiome) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Exploração de Biomas</h2>
        <p className="text-gray-600">Explore diferentes ambientes e colete recursos únicos</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Biomes List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="w-5 h-5" />
                <span>Biomas Disponíveis</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {availableBiomes.map((biome) => (
                <div
                  key={biome.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedBiome === biome.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedBiome(biome.id)}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{biome.emoji}</span>
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">{biome.displayName}</div>
                      <div className="text-sm text-gray-600">Nível {biome.requiredLevel}</div>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <Badge variant="outline" className="text-xs">
                        {biome.category}
                      </Badge>
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>{biome.explorationTime}min</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Biome Details */}
        <div className="lg:col-span-2">
          {selectedBiomeData ? (
            <div className="space-y-6">
              {/* Biome Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3">
                    <span className="text-3xl">{selectedBiomeData.emoji}</span>
                    <div>
                      <div>{selectedBiomeData.displayName}</div>
                      <div className="text-sm font-normal text-gray-600">
                        {selectedBiomeData.description}
                      </div>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{selectedBiomeData.difficulty}</div>
                      <div className="text-sm text-gray-600">Dificuldade</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{selectedBiomeData.requiredLevel}</div>
                      <div className="text-sm text-gray-600">Nível Req.</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{selectedBiomeData.dangerLevel}</div>
                      <div className="text-sm text-gray-600">Perigo</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{selectedBiomeData.explorationTime}</div>
                      <div className="text-sm text-gray-600">Minutos</div>
                    </div>
                  </div>

                  {/* Special Features */}
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Características Especiais:</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedBiomeData.specialFeatures.map((feature, index) => (
                        <Badge key={index} variant="secondary">{feature}</Badge>
                      ))}
                    </div>
                  </div>

                  {/* Time Effects */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="border rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <Sun className="w-4 h-4 text-yellow-500" />
                        <span className="font-medium">Dia</span>
                        <Badge variant="outline">+{Math.round((selectedBiomeData.timeOfDayEffects.day.bonusMultiplier - 1) * 100)}%</Badge>
                      </div>
                      <p className="text-sm text-gray-600">{selectedBiomeData.timeOfDayEffects.day.description}</p>
                    </div>
                    <div className="border rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <Moon className="w-4 h-4 text-blue-500" />
                        <span className="font-medium">Noite</span>
                        <Badge variant="outline">{selectedBiomeData.timeOfDayEffects.night.bonusMultiplier < 1 ? '' : '+'}{Math.round((selectedBiomeData.timeOfDayEffects.night.bonusMultiplier - 1) * 100)}%</Badge>
                      </div>
                      <p className="text-sm text-gray-600">{selectedBiomeData.timeOfDayEffects.night.description}</p>
                    </div>
                  </div>

                  <Button 
                    onClick={() => handleStartExpedition(selectedBiomeData.id)}
                    className="w-full"
                    disabled={player.hunger < 30 || player.thirst < 30}
                  >
                    <TreePine className="w-4 h-4 mr-2" />
                    Iniciar Expedição
                  </Button>
                </CardContent>
              </Card>

              {/* Resources */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Recursos Disponíveis</CardTitle>
                    <select
                      value={resourceFilter}
                      onChange={(e) => setResourceFilter(e.target.value)}
                      className="px-3 py-1 border rounded-md text-sm"
                    >
                      <option value="all">Todos</option>
                      <option value="basic">Básicos</option>
                      <option value="animals">Animais</option>
                      <option value="fish">Peixes</option>
                      <option value="plants">Plantas</option>
                      <option value="minerals">Minerais</option>
                    </select>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {biomeResources.map((biomeResource) => {
                      const resourceData = getResourceData(biomeResource.resourceId);
                      const canAccess = canAccessResource(biomeResource);
                      
                      if (!resourceData) return null;

                      return (
                        <div
                          key={biomeResource.resourceId}
                          className={`border rounded-lg p-3 ${
                            canAccess ? 'border-gray-200' : 'border-gray-100 bg-gray-50'
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <span className="text-2xl">{resourceData.emoji}</span>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className={`font-medium ${canAccess ? 'text-gray-800' : 'text-gray-500'}`}>
                                  {resourceData.name}
                                </span>
                                <Badge className={getRarityColor(biomeResource.rarity)}>
                                  {biomeResource.rarity}
                                </Badge>
                              </div>
                              
                              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                                <div className="flex items-center space-x-1">
                                  <Star className="w-3 h-3" />
                                  <span>Lv.{biomeResource.requiredLevel}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Timer className="w-3 h-3" />
                                  <span>{Math.round(biomeResource.spawnRate * 100)}%</span>
                                </div>
                                {biomeResource.dailyLimit && (
                                  <div className="flex items-center space-x-1">
                                    <Clock className="w-3 h-3" />
                                    <span>{biomeResource.dailyLimit}/dia</span>
                                  </div>
                                )}
                              </div>

                              {biomeResource.requiredTool && (
                                <div className="flex items-center space-x-2 text-xs">
                                  <Pickaxe className="w-3 h-3" />
                                  <span className={canAccess ? 'text-green-600' : 'text-red-600'}>
                                    Requer: {biomeResource.requiredTool}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center text-gray-500">
                  <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Selecione um bioma para ver os detalhes</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

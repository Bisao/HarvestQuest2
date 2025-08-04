import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SoundButton } from "@/components/ui/sound-button";
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  MapPin, 
  Search, 
  Filter,
  Clock,
  Target,
  Star,
  Compass,
  TreePine,
  Mountain,
  Waves,
  Sun,
  CheckCircle
} from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import type { Biome, Resource, Equipment, Player } from '@shared/types';
import { NewExpeditionModal } from './new-expedition-modal';
import { ImprovedCustomExpeditionModal } from './improved-custom-expedition-modal';
import { ExpeditionTracker } from './expedition-tracker';
import { ExpeditionStatus } from './expedition-status';
import { useActiveExpeditions } from '@/hooks/use-active-expeditions';

interface EnhancedBiomesTabProps {
  biomes: Biome[];
  resources: Resource[];
  equipment: Equipment[];
  player: Player;
  onExpeditionStart: (expeditionData: any) => void;
}

// Sistema robusto de categorização usando o utilitário do servidor
const RESOURCE_CATEGORIES = {
  basic: { name: 'Básicos', icon: '🌿', color: 'bg-green-100 text-green-800 border-green-200' },
  wood: { name: 'Madeiras', icon: '🌳', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  stone: { name: 'Pedras', icon: '🪨', color: 'bg-gray-100 text-gray-800 border-gray-200' },
  fiber: { name: 'Fibras', icon: '🧵', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  animals: { name: 'Animais', icon: '🦌', color: 'bg-orange-100 text-orange-800 border-orange-200' },
  fish: { name: 'Peixes', icon: '🐟', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  plants: { name: 'Plantas', icon: '🌱', color: 'bg-green-100 text-green-800 border-green-200' },
  rare: { name: 'Raros', icon: '💎', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  processed: { name: 'Processados', icon: '⚙️', color: 'bg-slate-100 text-slate-800 border-slate-200' },
  special: { name: 'Especiais', icon: '✨', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' }
};

// Mapear biomas para seus ícones e cores
const BIOME_THEMES = {
  floresta: { icon: TreePine, color: 'from-green-500 to-emerald-600', bgColor: 'bg-green-50' },
  deserto: { icon: Sun, color: 'from-yellow-500 to-orange-600', bgColor: 'bg-yellow-50' },
  montanha: { icon: Mountain, color: 'from-gray-500 to-slate-600', bgColor: 'bg-gray-50' },
  oceano: { icon: Waves, color: 'from-blue-500 to-cyan-600', bgColor: 'bg-blue-50' }
};

export default function EnhancedBiomesTab({
  biomes,
  resources,
  equipment,
  player,
  onExpeditionStart
}: EnhancedBiomesTabProps) {
  const [selectedBiome, setSelectedBiome] = useState<Biome | null>(null);
  const [expeditionModalOpen, setExpeditionModalOpen] = useState(false);
  const [useManualSelection, setUseManualSelection] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Create expedition mutation
  const startExpedition = useMutation({
    mutationFn: async (expeditionData: { biomeId: string; selectedResources: string[]; duration: number }) => {
      return apiRequest('/api/expeditions/custom/start', {
        method: 'POST',
        body: JSON.stringify({
          playerId: player.id,
          biomeId: expeditionData.biomeId,
          selectedResources: expeditionData.selectedResources,
          duration: expeditionData.duration,
          selectedEquipment: []
        })
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Expedição Iniciada!",
        description: `Expedição ${data.data.id} iniciada com sucesso.`,
      });
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/expeditions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/player'] });
    },
    onError: (error: any) => {
      console.error('Erro ao iniciar expedição:', error);
      toast({
        title: "Erro ao Iniciar Expedição",
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "destructive"
      });
    }
  });

  // Sistema robusto de categorização de recursos
  const categorizeResource = (resource: Resource): string => {
    const name = resource.name.toLowerCase();

    // Madeiras e materiais lenhosos
    if (name.includes('madeira') || name.includes('tronco') || name.includes('galho') ||
        name.includes('carvalho') || name.includes('pinho') || name.includes('cedro') ||
        name.includes('eucalipto') || name.includes('mogno') || name.includes('bambu')) return 'wood';

    // Pedras, minerais e metais
    if (name.includes('pedra') || name.includes('mineral') || name.includes('ferro') || 
        name.includes('cobre') || name.includes('granito') || name.includes('calcaria') ||
        name.includes('quartzo') || name.includes('argila')) return 'stone';

    // Fibras naturais
    if (name.includes('fibra') || name.includes('linho') || name.includes('algodao') ||
        name.includes('algodão') || name.includes('juta') || name.includes('sisal') ||
        name.includes('canamo') || name.includes('cânamo')) return 'fiber';

    // Animais de caça
    if (name.includes('coelho') || name.includes('veado') || name.includes('urso') ||
        name.includes('javali') || name.includes('cervo') || name.includes('raposa') ||
        name.includes('esquilo') || name.includes('castor') || name.includes('cabra') ||
        name.includes('ovelha') || name.includes('alce') || name.includes('rena') ||
        name.includes('bisao') || name.includes('bisão') || name.includes('boi') ||
        name.includes('carne')) return 'animals';

    // Peixes e recursos aquáticos
    if (name.includes('peixe') || name.includes('salmao') || name.includes('salmão') ||
        name.includes('truta') || name.includes('carpa') || name.includes('bagre') ||
        name.includes('dourado') || name.includes('pintado') || name.includes('tucunare') ||
        name.includes('tucunaré') || name.includes('piranha') || name.includes('lambari') ||
        name.includes('tilapia') || name.includes('tilápia')) return 'fish';

    // Plantas e ervas
    if (name.includes('erva') || name.includes('flor') || name.includes('cogumelo') || 
        name.includes('planta') || name.includes('folha') || name.includes('raiz') ||
        name.includes('semente') || name.includes('fruto') || name.includes('baga')) return 'plants';

    // Recursos raros e preciosos
    if (name.includes('cristal') || name.includes('gema') || name.includes('ouro') || 
        name.includes('prata') || name.includes('diamante') || name.includes('rubi') ||
        name.includes('safira') || name.includes('esmeralda') || name.includes('ametista')) return 'rare';

    // Materiais processados
    if (name.includes('processado') || name.includes('refinado') || name.includes('trabalhado') ||
        name.includes('fundido') || name.includes('forjado') || name.includes('polido') ||
        name.includes('lapidado')) return 'processed';

    // Recursos especiais únicos
    if (name.includes('raro') || name.includes('lendario') || name.includes('lendário') ||
        name.includes('épico') || name.includes('epico') || name.includes('mistico') ||
        name.includes('místico') || name.includes('sagrado')) return 'special';

    return 'basic';
  };

  // Obter recursos categorizados para um bioma
  const getCategorizedResourcesForBiome = (biome: Biome) => {
    const resourceIds = biome.availableResources as string[];
    const biomeResources = resourceIds
      .map(id => resources.find(r => r.id === id))
      .filter(Boolean) as Resource[];

    const categorized: Record<string, Resource[]> = {};

    biomeResources.forEach(resource => {
      const category = categorizeResource(resource);
      if (!categorized[category]) categorized[category] = [];
      categorized[category].push(resource);
    });

    return categorized;
  };

  // Filtrar biomas baseado na busca
  const filteredBiomes = useMemo(() => {
    let filtered = biomes;

    if (searchTerm) {
      filtered = filtered.filter(biome => 
        biome.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        false
      );
    }

    return filtered.sort((a, b) => a.requiredLevel - b.requiredLevel);
  }, [biomes, searchTerm]);

  const isUnlocked = (biome: Biome) => player.level >= biome.requiredLevel;

  const getBiomeTheme = (biomeName: string) => {
    const key = biomeName.toLowerCase().replace(/[^a-z]/g, '');
    return BIOME_THEMES[key as keyof typeof BIOME_THEMES] || BIOME_THEMES.floresta;
  };

  const handleExploreBiome = (biome: Biome) => {
    if (!isUnlocked(biome)) return;
    setSelectedBiome(biome);
    setExpeditionModalOpen(true);
  };

  const handleExpeditionStart = (expeditionData: any) => {
    setExpeditionModalOpen(false);
    setSelectedBiome(null);
    onExpeditionStart(expeditionData);
  };

  const getResourceCountByCategory = (categorizedResources: Record<string, Resource[]>) => {
    return Object.entries(categorizedResources).reduce((acc, [category, resources]) => {
      acc[category] = resources.length;
      return acc;
    }, {} as Record<string, number>);
  };

  return (
    <div className="space-y-6">
      {/* Header com estatísticas */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Compass className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-bold">Exploração de Biomas</h2>
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant="outline" className="flex items-center space-x-1">
            <MapPin className="w-3 h-3" />
            <span>{filteredBiomes.filter(isUnlocked).length}/{filteredBiomes.length} desbloqueados</span>
          </Badge>
          <Badge variant="outline" className="flex items-center space-x-1">
            <Star className="w-3 h-3" />
            <span>Nível {player.level}</span>
          </Badge>
        </div>
      </div>

      {/* Barra de busca e filtros */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar biomas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 mr-4">
            <Button
              variant={useManualSelection ? 'default' : 'outline'}
              size="sm"
              onClick={() => setUseManualSelection(true)}
            >
              Manual
            </Button>
            <Button
              variant={!useManualSelection ? 'default' : 'outline'}
              size="sm"
              onClick={() => setUseManualSelection(false)}
            >
              Templates
            </Button>
          </div>
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            Grade
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            Lista
          </Button>
        </div>
      </div>

      {/* Grid/Lista de biomas */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' : 'space-y-4'}>
        {filteredBiomes.map((biome) => {
          const categorizedResources = getCategorizedResourcesForBiome(biome);
          const resourceCounts = getResourceCountByCategory(categorizedResources);
          const unlocked = isUnlocked(biome);
          const theme = getBiomeTheme(biome.name);
          const BiomeIcon = theme.icon;

          return (
            <Card 
              key={biome.id}
              className={`transition-all duration-300 ${
                unlocked 
                  ? 'hover:shadow-lg hover:scale-[1.02] cursor-pointer border-l-4 border-l-green-500' 
                  : 'opacity-60 border-l-4 border-l-gray-300'
              } ${theme.bgColor}`}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${theme.color}`}>
                      <BiomeIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg flex items-center space-x-2">
                        <span>{biome.name}</span>
                        <span className="text-xl">{biome.emoji}</span>
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {Object.values(resourceCounts).reduce((a, b) => a + b, 0)} recursos disponíveis
                      </p>
                    </div>
                  </div>
                  <Badge variant={unlocked ? "default" : "secondary"} className="flex items-center space-x-1">
                    <Star className="w-3 h-3" />
                    <span>Nível {biome.requiredLevel}</span>
                  </Badge>
                </div>

                <p className="text-sm text-gray-600 mt-2">Explore {biome.name} para descobrir recursos únicos.</p>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Barra de progresso para biomas bloqueados */}
                {!unlocked && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Progresso para desbloqueio</span>
                      <span className="font-medium">{player.level}/{biome.requiredLevel}</span>
                    </div>
                    <Progress 
                      value={Math.min((player.level / biome.requiredLevel) * 100, 100)} 
                      className="h-2"
                    />
                    <p className="text-xs text-gray-500">
                      {biome.requiredLevel - player.level} níveis restantes
                    </p>
                  </div>
                )}

                {/* Categorias de recursos */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Recursos por Categoria:</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {Object.entries(resourceCounts).map(([category, count]) => {
                      const categoryInfo = RESOURCE_CATEGORIES[category as keyof typeof RESOURCE_CATEGORIES];
                      if (!categoryInfo || count === 0) return null;

                      return (
                        <div
                          key={category}
                          className={`p-2 rounded-lg text-xs font-medium text-center ${categoryInfo.color}`}
                        >
                          <div className="flex items-center justify-center space-x-1">
                            <span>{categoryInfo.icon}</span>
                            <span>{count}</span>
                          </div>
                          <div className="mt-1">{categoryInfo.name}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Preview dos recursos principais */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Recursos Principais:</Label>
                  <div className="max-h-20 overflow-hidden">
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-1">
                      {Object.values(categorizedResources)
                        .flat()
                        .slice(0, 8)
                        .map((resource) => (
                          <div 
                            key={resource.id} 
                            className="flex items-center space-x-1 text-xs bg-white/50 rounded px-1 py-0.5"
                            title={resource.name}
                          >
                            <span>{resource.emoji}</span>
                            <span className="truncate">{resource.name}</span>
                          </div>
                        ))}
                    </div>
                    {Object.values(categorizedResources).flat().length > 8 && (
                      <p className="text-xs text-gray-500 mt-1 text-center">
                        +{Object.values(categorizedResources).flat().length - 8} recursos adicionais
                      </p>
                    )}
                  </div>
                </div>

                {/* Sistema de expedição em tempo real */}
                <ExpeditionStatus 
                  biome={biome}
                  player={player}
                  resources={resources}
                  unlocked={unlocked}
                  onExploreBiome={handleExploreBiome}
                />
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Estado vazio */}
      {filteredBiomes.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">Nenhum bioma encontrado</h3>
            <p className="text-gray-500">
              {searchTerm ? "Tente ajustar sua busca" : "Explore o mundo para descobrir novos biomas!"}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Estatísticas resumidas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="w-5 h-5" />
            <span>Estatísticas de Exploração</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">
                {filteredBiomes.filter(isUnlocked).length}
              </div>
              <div className="text-sm text-muted-foreground">Biomas Desbloqueados</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {filteredBiomes.filter(b => !isUnlocked(b)).length}
              </div>
              <div className="text-sm text-muted-foreground">Por Desbloquear</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {filteredBiomes.reduce((acc, biome) => {
                  const categorized = getCategorizedResourcesForBiome(biome);
                  return acc + Object.values(categorized).flat().length;
                }, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Total de Recursos</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {Math.round((filteredBiomes.filter(isUnlocked).length / filteredBiomes.length) * 100)}%
              </div>
              <div className="text-sm text-muted-foreground">Progresso Total</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tracker de expedições ativas */}
      <ExpeditionTracker player={player} />

      {/* Modal de expedição novo */}
      {selectedBiome && useManualSelection && (
        <ImprovedCustomExpeditionModal
          isOpen={expeditionModalOpen}
          onClose={() => {
            setExpeditionModalOpen(false);
            setSelectedBiome(null);
          }}
          onStartExpedition={async (selectedResources, duration) => {
            try {
              await startExpedition.mutateAsync({
                biomeId: selectedBiome.id,
                selectedResources: selectedResources.map(r => r.resourceId),
                duration
              });
              setExpeditionModalOpen(false);
              setSelectedBiome(null);
            } catch (error) {
              console.error('Erro ao iniciar expedição:', error);
            }
          }}
          resources={resources}
          selectedBiome={selectedBiome}
          player={player}
          equipment={equipment}
        />
      )}

      {selectedBiome && !useManualSelection && (
        <NewExpeditionModal
          isOpen={expeditionModalOpen}
          onClose={() => {
            setExpeditionModalOpen(false);
            setSelectedBiome(null);
          }}
          player={player}
          biome={selectedBiome}
        />
      )}
    </div>
  );
}
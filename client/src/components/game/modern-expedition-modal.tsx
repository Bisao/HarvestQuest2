import React, { useState, useEffect, useMemo } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Search,
  Filter,
  MapPin,
  Compass,
  Star,
  Clock,
  Target,
  Zap,
  AlertTriangle,
  CheckCircle,
  TreePine,
  Mountain,
  Waves,
  Sun,
  Package,
  Backpack
} from 'lucide-react';
import type { Biome, Resource, Equipment, Player } from '@shared/types';

interface ModernExpeditionModalProps {
  isOpen: boolean;
  onClose: () => void;
  biome: Biome | null;
  resources: Resource[];
  equipment: Equipment[];
  player: Player;
  onExpeditionStart: (expeditionData: any) => void;
}

// Categorias de recursos para organização
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

// Temas por bioma
const BIOME_THEMES = {
  floresta: { icon: TreePine, color: 'from-green-500 to-emerald-600', bgColor: 'bg-green-50' },
  deserto: { icon: Sun, color: 'from-yellow-500 to-orange-600', bgColor: 'bg-yellow-50' },
  montanha: { icon: Mountain, color: 'from-gray-500 to-slate-600', bgColor: 'bg-gray-50' },
  oceano: { icon: Waves, color: 'from-blue-500 to-cyan-600', bgColor: 'bg-blue-50' }
};

interface CollectableResource extends Resource {
  canCollect: boolean;
  requirementText: string;
  toolIcon: string;
  category: string;
}

export default function ModernExpeditionModal({
  isOpen,
  onClose,
  biome,
  resources,
  equipment,
  player,
  onExpeditionStart
}: ModernExpeditionModalProps) {
  const [selectedResources, setSelectedResources] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTab, setSelectedTab] = useState('resources');
  const { toast } = useToast();

  // Verificação de props essenciais
  if (!resources || !Array.isArray(resources)) {
    console.error('ModernExpeditionModal: resources prop is invalid:', resources);
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Erro</DialogTitle>
            <DialogDescription>Dados de recursos inválidos.</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  if (!equipment || !Array.isArray(equipment)) {
    console.error('ModernExpeditionModal: equipment prop is invalid:', equipment);
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Erro</DialogTitle>
            <DialogDescription>Dados de equipamentos inválidos.</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  if (!player || !player.id) {
    console.error('ModernExpeditionModal: player prop is invalid:', player);
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Erro</DialogTitle>
            <DialogDescription>Dados do jogador inválidos.</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  // Reset quando modal abre
  useEffect(() => {
    if (isOpen) {
      setSelectedResources([]);
      setSearchTerm('');
      setSelectedCategory('all');
      setSelectedTab('resources');
    }
  }, [isOpen]);

  // Categorizar recursos
  const categorizeResource = (resource: Resource): string => {
    if (!resource || !resource.name || typeof resource.name !== 'string') {
      console.warn('Invalid resource for categorization:', resource);
      return 'basic';
    }
    
    try {
      const name = resource.name.toLowerCase();

      if (name.includes('madeira') || name.includes('tronco') || name.includes('galho') ||
          name.includes('carvalho') || name.includes('pinho') || name.includes('cedro') ||
          name.includes('eucalipto') || name.includes('mogno') || name.includes('bambu')) return 'wood';

    if (name.includes('pedra') || name.includes('mineral') || name.includes('ferro') || 
        name.includes('cobre') || name.includes('granito') || name.includes('calcaria') ||
        name.includes('quartzo') || name.includes('argila')) return 'stone';

    if (name.includes('fibra') || name.includes('linho') || name.includes('algodao') ||
        name.includes('algodão') || name.includes('juta') || name.includes('sisal') ||
        name.includes('canamo') || name.includes('cânamo')) return 'fiber';

    if (name.includes('coelho') || name.includes('veado') || name.includes('urso') ||
        name.includes('javali') || name.includes('cervo') || name.includes('raposa') ||
        name.includes('esquilo') || name.includes('castor') || name.includes('cabra') ||
        name.includes('ovelha') || name.includes('alce') || name.includes('rena') ||
        name.includes('bisao') || name.includes('bisão') || name.includes('boi') ||
        name.includes('carne')) return 'animals';

    if (name.includes('peixe') || name.includes('salmao') || name.includes('salmão') ||
        name.includes('truta') || name.includes('carpa') || name.includes('bagre') ||
        name.includes('dourado') || name.includes('pintado') || name.includes('tucunare') ||
        name.includes('tucunaré') || name.includes('piranha') || name.includes('lambari') ||
        name.includes('tilapia') || name.includes('tilápia')) return 'fish';

    if (name.includes('erva') || name.includes('flor') || name.includes('cogumelo') || 
        name.includes('planta') || name.includes('folha') || name.includes('raiz') ||
        name.includes('semente') || name.includes('fruto') || name.includes('baga')) return 'plants';

    if (name.includes('cristal') || name.includes('gema') || name.includes('ouro') || 
        name.includes('prata') || name.includes('diamante') || name.includes('rubi') ||
        name.includes('safira') || name.includes('esmeralda') || name.includes('ametista')) return 'rare';

    if (name.includes('processado') || name.includes('refinado') || name.includes('trabalhado') ||
        name.includes('fundido') || name.includes('forjado') || name.includes('polido') ||
        name.includes('lapidado')) return 'processed';

    if (name.includes('raro') || name.includes('lendario') || name.includes('lendário') ||
        name.includes('épico') || name.includes('epico') || name.includes('mistico') ||
        name.includes('místico') || name.includes('sagrado')) return 'special';

      return 'basic';
    } catch (error) {
      console.error('Error categorizing resource:', resource, error);
      return 'basic';
    }
  };

  // Verificar coletabilidade
  const checkResourceCollectability = (resource: Resource) => {
    if (!resource || !resource.name || typeof resource.name !== 'string') {
      console.warn('Invalid resource for collectability check:', resource);
      return {
        canCollect: false,
        requirementText: "Recurso inválido",
        toolIcon: "❌",
      };
    }
    
    try {
      const resourceName = resource.name;

    // Recursos básicos (sem ferramentas)
    if (['Fibra', 'Pedras Soltas', 'Gravetos', 'Cogumelos', 'Frutas Silvestres', 'Conchas', 'Argila'].includes(resourceName)) {
      return {
        canCollect: true,
        requirementText: "Coletável à mão",
        toolIcon: "🤚",
      };
    }

    // Recursos que requerem ferramentas
    if (['Madeira', 'Bambu'].includes(resourceName)) {
      const hasAxe = equipment.some(eq => eq.toolType === "axe" && eq.id === player.equippedTool);
      return {
        canCollect: hasAxe,
        requirementText: hasAxe ? "Machado equipado" : "Requer machado",
        toolIcon: "🪓",
      };
    }

    if (['Pedra', 'Ferro Fundido', 'Cristais'].includes(resourceName)) {
      const hasPickaxe = equipment.some(eq => eq.toolType === "pickaxe" && eq.id === player.equippedTool);
      return {
        canCollect: hasPickaxe,
        requirementText: hasPickaxe ? "Picareta equipada" : "Requer picareta",
        toolIcon: "⛏️",
      };
    }

    if (resourceName === 'Água Fresca') {
      const hasBucket = equipment.some(eq => eq.toolType === "bucket" && eq.id === player.equippedTool);
      const hasBambooBottle = equipment.some(eq => eq.toolType === "bamboo_bottle" && eq.id === player.equippedTool);
      const canCollect = hasBucket || hasBambooBottle;
      return {
        canCollect,
        requirementText: canCollect ? "Recipiente equipado" : "Requer balde ou garrafa de bambu",
        toolIcon: "🪣",
      };
    }

    // Peixes
    if (['Peixe Pequeno', 'Peixe Grande', 'Salmão'].includes(resourceName) || resourceName.toLowerCase().includes('peixe')) {
      const hasFishingRod = equipment.some(eq => eq.toolType === "fishing_rod" && eq.id === player.equippedTool);
      return {
        canCollect: hasFishingRod,
        requirementText: hasFishingRod ? "Vara de pesca equipada" : "Requer vara de pesca",
        toolIcon: "🎣",
      };
    }

    // Animais
    if (['Coelho', 'Veado', 'Javali'].includes(resourceName) || resourceName.toLowerCase().includes('carne')) {
      const hasWeapon = player.equippedWeapon !== null;
      const hasKnife = equipment.some(eq => eq.toolType === "knife" && eq.id === player.equippedTool);
      const canCollect = hasWeapon && hasKnife;
      return {
        canCollect,
        requirementText: canCollect ? "Arma e faca equipadas" : "Requer arma e faca",
        toolIcon: "🗡️",
      };
    }

    // Padrão para outros recursos
      return {
        canCollect: true,
        requirementText: "Disponível para coleta",
        toolIcon: "🤚",
      };
    } catch (error) {
      console.error('Error checking resource collectability:', resource, error);
      return {
        canCollect: false,
        requirementText: "Erro na verificação",
        toolIcon: "❌",
      };
    }
  };

  // Obter recursos coletáveis
  const collectableResources = useMemo((): CollectableResource[] => {
    if (!biome || !biome.availableResources || !resources || !Array.isArray(resources)) {
      return [];
    }

    const resourceIds = Array.isArray(biome.availableResources) 
      ? biome.availableResources as string[]
      : [];
    
    if (resourceIds.length === 0) return [];

    const biomeResources = resourceIds
      .map(id => {
        if (!id || typeof id !== 'string') return null;
        return resources.find(r => r && r.id === id);
      })
      .filter(Boolean) as Resource[];

    return biomeResources
      .map(resource => {
        if (!resource || !resource.id || !resource.name) {
          console.warn('Invalid resource found:', resource);
          return null;
        }
        
        const collectabilityInfo = checkResourceCollectability(resource);
        const category = categorizeResource(resource);

        return {
          ...resource,
          canCollect: collectabilityInfo.canCollect,
          requirementText: collectabilityInfo.requirementText,
          toolIcon: collectabilityInfo.toolIcon,
          category
        };
      })
      .filter(Boolean) as CollectableResource[];
  }, [biome, resources, equipment, player]);

  // Filtrar recursos
  const filteredResources = useMemo(() => {
    if (!collectableResources || collectableResources.length === 0) return [];
    
    let filtered = collectableResources.filter(resource => 
      resource && 
      resource.id && 
      resource.name && 
      typeof resource.name === 'string'
    );

    if (searchTerm && typeof searchTerm === 'string' && searchTerm.trim()) {
      try {
        const searchLower = searchTerm.toLowerCase();
        filtered = filtered.filter(resource =>
          resource && 
          resource.name && 
          typeof resource.name === 'string' && 
          resource.name.toLowerCase().includes(searchLower)
        );
      } catch (error) {
        console.error('Error filtering resources by search term:', error);
      }
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(resource => 
        resource && 
        resource.category === selectedCategory
      );
    }

    return filtered;
  }, [collectableResources, searchTerm, selectedCategory]);

  // Agrupar por categoria
  const resourcesByCategory = useMemo(() => {
    const grouped: Record<string, CollectableResource[]> = {};

    if (!filteredResources || filteredResources.length === 0) {
      return grouped;
    }

    filteredResources.forEach(resource => {
      if (!resource || !resource.category || !resource.id || !resource.name) {
        console.warn('Invalid resource in grouping:', resource);
        return;
      }
      
      try {
        if (!grouped[resource.category]) {
          grouped[resource.category] = [];
        }
        grouped[resource.category].push(resource);
      } catch (error) {
        console.error('Error grouping resource:', resource, error);
      }
    });

    return grouped;
  }, [filteredResources]);

  // Obter tema do bioma
  const getBiomeTheme = (biomeName: string) => {
    const key = biomeName.toLowerCase().replace(/[^a-z]/g, '');
    return BIOME_THEMES[key as keyof typeof BIOME_THEMES] || BIOME_THEMES.floresta;
  };

  // Mutation para iniciar expedição
  const startExpeditionMutation = useMutation({
    mutationFn: async (expeditionData: {
      biomeId: string;
      playerId: string;
      selectedResources: string[];
      selectedEquipment: string[];
    }) => {
      try {
        // Validar dados antes de enviar
        if (!expeditionData.biomeId || !expeditionData.playerId || !expeditionData.selectedResources) {
          throw new Error('Dados de expedição incompletos');
        }

        if (expeditionData.selectedResources.length === 0) {
          throw new Error('Selecione pelo menos um recurso');
        }

        const response = await fetch('/api/expeditions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(expeditionData),
        });

        if (!response.ok) {
          const errorText = await response.text();
          let errorMessage = 'Erro ao iniciar expedição';
          
          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.message || errorMessage;
          } catch {
            errorMessage = errorText || errorMessage;
          }
          
          throw new Error(errorMessage);
        }

        const result = await response.json();
        
        if (!result || !result.id) {
          throw new Error('Resposta inválida do servidor');
        }
        
        return result;
      } catch (error) {
        console.error('Expedition creation error:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      if (!data || !data.id) {
        console.error('Invalid expedition data received:', data);
        toast({
          title: "Erro",
          description: "Dados de expedição inválidos recebidos.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Expedição iniciada!",
        description: `Expedição para ${biome?.name} iniciada com sucesso.`,
      });
      
      if (onExpeditionStart && typeof onExpeditionStart === 'function') {
        onExpeditionStart(data);
      }
      
      if (onClose && typeof onClose === 'function') {
        onClose();
      }
    },
    onError: (error: any) => {
      console.error('Expedition start error:', error);
      toast({
        title: "Erro ao iniciar expedição",
        description: error?.message || "Erro desconhecido. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const handleResourceToggle = (resourceId: string) => {
    setSelectedResources(prev => 
      prev.includes(resourceId) 
        ? prev.filter(id => id !== resourceId)
        : [...prev, resourceId]
    );
  };

  const handleStartExpedition = () => {
    // Validações essenciais
    if (!biome || !biome.id) {
      toast({
        title: "Erro",
        description: "Bioma inválido selecionado.",
        variant: "destructive",
      });
      return;
    }

    if (!player || !player.id) {
      toast({
        title: "Erro",
        description: "Dados do jogador inválidos.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedResources || selectedResources.length === 0) {
      toast({
        title: "Selecione recursos",
        description: "Você deve selecionar pelo menos um recurso para coletar.",
        variant: "destructive",
      });
      return;
    }

    // Validar que todos os recursos selecionados existem
    const invalidResources = selectedResources.filter(resourceId => 
      !collectableResources.find(r => r.id === resourceId)
    );

    if (invalidResources.length > 0) {
      console.error('Invalid resources selected:', invalidResources);
      toast({
        title: "Erro",
        description: "Recursos inválidos selecionados.",
        variant: "destructive",
      });
      return;
    }

    try {
      const expeditionData = {
        biomeId: biome.id,
        playerId: player.id,
        selectedResources: selectedResources.filter(id => id && typeof id === 'string'),
        selectedEquipment: [],
      };

      console.log('Starting expedition with data:', expeditionData);
      startExpeditionMutation.mutate(expeditionData);
    } catch (error) {
      console.error('Error preparing expedition data:', error);
      toast({
        title: "Erro",
        description: "Erro ao preparar dados da expedição.",
        variant: "destructive",
      });
    }
  };

  if (!biome) return null;

  const theme = getBiomeTheme(biome.name);
  const BiomeIcon = theme.icon;
  const collectableCount = collectableResources.filter(r => r.canCollect).length;
  const totalCount = collectableResources.length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className={`p-6 ${theme.bgColor} border-b`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-3 rounded-lg bg-gradient-to-r ${theme.color}`}>
                <BiomeIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl flex items-center space-x-2">
                  <span>Expedição: {biome.name}</span>
                  <span className="text-2xl">{biome.emoji}</span>
                </DialogTitle>
                <DialogDescription className="text-base">
                  Selecione os recursos que deseja coletar nesta expedição
                </DialogDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="flex items-center space-x-1">
                <Package className="w-3 h-3" />
                <span>{collectableCount}/{totalCount} coletáveis</span>
              </Badge>
              <Badge variant="outline" className="flex items-center space-x-1">
                <Star className="w-3 h-3" />
                <span>Nível {biome.requiredLevel}</span>
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="h-full">
            <div className="p-4 border-b">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="resources" className="flex items-center space-x-2">
                  <Target className="w-4 h-4" />
                  <span>Recursos ({filteredResources.length})</span>
                </TabsTrigger>
                <TabsTrigger value="selected" className="flex items-center space-x-2">
                  <Backpack className="w-4 h-4" />
                  <span>Selecionados ({selectedResources.length})</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="resources" className="p-4 space-y-4 h-full overflow-hidden">
              {/* Filtros e busca */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar recursos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Label>Categoria:</Label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-2 border rounded-md"
                  >
                    <option value="all">Todas</option>
                    {Object.entries(RESOURCE_CATEGORIES).map(([key, category]) => (
                      <option key={key} value={key}>
                        {category.icon} {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Lista de recursos por categoria */}
              <ScrollArea className="h-[400px]">
                <div className="space-y-6">
                  {Object.entries(resourcesByCategory || {}).map(([categoryId, categoryResources]) => {
                    const category = RESOURCE_CATEGORIES[categoryId as keyof typeof RESOURCE_CATEGORIES];
                    if (!category || !categoryResources || categoryResources.length === 0) return null;

                    return (
                      <div key={categoryId} className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <div className={`px-3 py-1 rounded-full text-sm font-medium ${category.color}`}>
                            <span className="mr-1">{category.icon}</span>
                            {category.name} ({categoryResources.length})
                          </div>
                        </div>

                        <div className="grid gap-3">
                          {categoryResources.map((resource) => (
                            <Card 
                              key={resource.id}
                              className={`transition-all cursor-pointer ${
                                selectedResources.includes(resource.id)
                                  ? 'ring-2 ring-blue-500 bg-blue-50'
                                  : resource.canCollect
                                  ? 'hover:shadow-md hover:bg-gray-50'
                                  : 'opacity-60 bg-gray-50'
                              }`}
                              onClick={() => resource.canCollect && handleResourceToggle(resource.id)}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3">
                                    <Checkbox
                                      checked={selectedResources.includes(resource.id)}
                                      disabled={!resource.canCollect}
                                      onChange={() => {}}
                                      className="pointer-events-none"
                                    />
                                    <div className="flex items-center space-x-2">
                                      <span className="text-xl">{resource.emoji}</span>
                                      <div>
                                        <h4 className="font-medium">{resource.name}</h4>
                                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                                          <span>{resource.toolIcon}</span>
                                          <span>{resource.requirementText}</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    {resource.canCollect ? (
                                      <CheckCircle className="w-5 h-5 text-green-500" />
                                    ) : (
                                      <AlertTriangle className="w-5 h-5 text-orange-500" />
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="selected" className="p-4 space-y-4">
              {selectedResources.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Backpack className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-600 mb-2">Nenhum recurso selecionado</h3>
                    <p className="text-gray-500">
                      Volte para a aba de recursos e selecione o que deseja coletar
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  <h3 className="text-lg font-medium">Recursos selecionados para coleta:</h3>
                  <div className="grid gap-2">
                    {selectedResources.map(resourceId => {
                      const resource = collectableResources.find(r => r.id === resourceId);
                      if (!resource) return null;

                      return (
                        <div 
                          key={resourceId}
                          className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg"
                        >
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{resource.emoji}</span>
                            <span className="font-medium">{resource.name}</span>
                            <span className="text-sm text-gray-600">({resource.requirementText})</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleResourceToggle(resourceId)}
                          >
                            Remover
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Rodapé com ações */}
        <div className="p-6 border-t bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {selectedResources.length > 0 ? (
                <span>{selectedResources.length} recursos selecionados</span>
              ) : (
                <span>Selecione recursos para iniciar a expedição</span>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button 
                onClick={handleStartExpedition}
                disabled={selectedResources.length === 0 || startExpeditionMutation.isPending}
                className="flex items-center space-x-2"
              >
                <Compass className="w-4 h-4" />
                <span>
                  {startExpeditionMutation.isPending ? 'Iniciando...' : 'Iniciar Expedição'}
                </span>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
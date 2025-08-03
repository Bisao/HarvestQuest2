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
import { Clock, Package, Zap, AlertTriangle, CheckCircle, Search, ArrowLeft, ArrowRight, Settings2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import type { Player, Biome, Resource } from '@shared/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ImprovedCustomExpeditionModalProps {
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

// Custom hook to detect mobile screen size
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  React.useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return isMobile;
};

export function ImprovedCustomExpeditionModal({ isOpen, onClose, player, biome, resources }: ImprovedCustomExpeditionModalProps) {
  const [selectedResources, setSelectedResources] = useState<SelectedResource[]>([]);
  const [duration, setDuration] = useState([30]); // Duration in minutes
  const [searchTerm, setSearchTerm] = useState('');
  const [currentStep, setCurrentStep] = useState<'selection' | 'configuration'>('selection');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();

  // Check if player has required tools for a resource
  const hasRequiredTools = (resource: Resource): boolean => {
    if (!resource.requiredTool) return true;

    // Check player's equipped tools
    const equippedTool = player.equippedTool;
    const equippedWeapon = player.equippedWeapon;

    switch (resource.requiredTool) {
      case 'axe':
        return equippedTool === 'machado' || (equippedTool?.includes('axe') || false);
      case 'pickaxe':
        return equippedTool === 'picareta' || (equippedTool?.includes('pickaxe') || false);
      case 'knife':
        return equippedTool === 'faca' || (equippedTool?.includes('knife') || false);
      case 'fishing_rod':
        return equippedTool === 'vara_pesca' || (equippedTool?.includes('fishing') || false);
      case 'weapon_and_knife':
        return (equippedWeapon && equippedTool === 'faca') || 
               ((equippedWeapon?.includes('weapon') || false) && (equippedTool?.includes('knife') || false));
      default:
        return true;
    }
  };

  // Filter out crafted items but show all collectible resources (even without tools)
  const filteredResources = useMemo(() => {
    // Lista exata dos itens cozidos/processados para excluir
    const excludedCookedItems = [
      'suco_frutas',
      'cogumelos_assados', 
      'carne_assada',
      'peixe_grelhado',
      'ensopado_carne'
    ];

    return resources.filter(resource => {
      // Exclude cooked/processed items
      if (excludedCookedItems.includes(resource.id)) {
        return false;
      }

      // Filter by search term
      if (searchTerm && !resource.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      return true;
    });
  }, [resources, searchTerm]);

  // Group resources by category
  const categorizedResources = useMemo(() => {
    const grouped: Record<string, Resource[]> = {};
    filteredResources.forEach(resource => {
      const category = resource.category || 'raw_materials';
      const categoryName = category === 'raw_materials' ? 'Materiais Básicos' : 
                          category === 'organic' ? 'Plantas' :
                          category === 'creatures' ? 'Animais' :
                          category === 'processed_materials' ? 'Minerais' : 'Outros';

      if (!grouped[categoryName]) grouped[categoryName] = [];
      grouped[categoryName].push(resource);
    });
    return grouped;
  }, [filteredResources]);

  // Calculate expedition stats with proper duration handling
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

  // Mutation to start custom expedition with correct duration
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
          duration: duration[0] * 60 * 1000, // Convert minutes to milliseconds
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
        description: `Expedição customizada em ${biome.name} iniciada com duração de ${duration[0]} minutos.`,
      });

      // Invalidate relevant caches
      queryClient.invalidateQueries({ queryKey: ['/api/expeditions/player', player.id] });
      queryClient.invalidateQueries({ queryKey: ['/api/player', player.username] });

      // Reset form and close
      setSelectedResources([]);
      setDuration([30]);
      setSearchTerm('');
      setCurrentStep('selection');
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
      const exists = prev.find(r => r.resourceId === resourceId);
      if (exists) {
        return prev.filter(r => r.resourceId !== resourceId);
      } else {
        return [...prev, { resourceId, quantity: 1 }];
      }
    });
  };

  const updateResourceQuantity = (resourceId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleResourceToggle(resourceId); // Remove if quantity is 0
      return;
    }

    setSelectedResources(prev => 
      prev.map(r => 
        r.resourceId === resourceId 
          ? { ...r, quantity: newQuantity }
          : r
      )
    );
  };

  const handleSelectAll = () => {
    const allResourceIds = filteredResources.map(r => r.id);
    setSelectedResources(allResourceIds.map(id => ({ resourceId: id, quantity: 5 })));
  };

  const handleDeselectAll = () => {
    setSelectedResources([]);
  };

  const getResourceIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'materiais básicos': return '🔨';
      case 'plantas': return '🌿';
      case 'animais': return '🐾';
      case 'minerais': return '⛏️';
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

  const getResourceById = (resourceId: string) => {
    return resources.find(resource => resource.id === resourceId);
  };

  if (!biome) return null;

  // Mobile two-step layout
  if (isMobile) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-[95vw] max-h-[90vh] overflow-hidden flex flex-col p-4">
          <DialogHeader className="shrink-0 border-b pb-3">
            <DialogTitle className="text-lg flex items-center gap-2">
              <span className="text-2xl">{biome.emoji}</span>
              <div className="flex-1">
                <div className="text-base">Expedição Personalizada</div>
                <div className="text-sm text-gray-600">{biome.name}</div>
              </div>
              {currentStep === 'configuration' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentStep('selection')}
                  className="ml-auto"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-hidden min-h-0">
            {currentStep === 'selection' ? (
              // Step 1: Resource Selection with Tabs
              <Tabs defaultValue="resources" className="flex flex-col h-full min-h-0">
                <TabsList className="shrink-0 grid w-full grid-cols-2">
                  <TabsTrigger value="resources">📦 Recursos</TabsTrigger>
                  <TabsTrigger value="selected">✅ Selecionados ({selectedResources.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="resources" className="flex flex-col flex-1 min-h-0 mt-4">
                  <div className="shrink-0 p-2 space-y-3">
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

                    {/* Quick Actions */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSelectAll}
                        className="flex-1"
                      >
                        Selecionar Tudo
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDeselectAll}
                        className="flex-1"
                      >
                        Limpar
                      </Button>
                    </div>
                  </div>

                  {/* Resource list */}
                  <div className="flex-1 overflow-y-auto space-y-3 p-2 min-h-0" style={{ WebkitOverflowScrolling: 'touch' }}>
                    {Object.entries(categorizedResources).map(([category, categoryResources]) => (
                      <Card key={category} className="overflow-hidden">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <span>{getResourceIcon(category)}</span>
                            {category}
                            <Badge variant="secondary" className="ml-auto text-xs">
                              {categoryResources.length}
                            </Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          {categoryResources.map(resource => {
                            const isSelected = selectedResources.some(sel => sel.resourceId === resource.id);

                            return (
                              <div key={resource.id} className="flex items-center gap-2 p-2 rounded border hover:bg-gray-50">
                                <Checkbox
                                  checked={isSelected}
                                  onCheckedChange={() => handleResourceToggle(resource.id)}
                                />
                                <span className="text-lg">{resource.emoji}</span>
                                <div className="flex-1">
                                  <p className="font-medium text-sm">{resource.name}</p>
                                  <p className="text-xs text-gray-500">
                                    Peso: {resource.weight}kg • Raridade: {
                                      resource.rarity === "common" ? "Comum" : 
                                      resource.rarity === "uncommon" ? "Incomum" : "Raro"
                                    }
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="selected" className="flex flex-col flex-1 min-h-0 mt-4">
                  <div className="shrink-0 p-2">
                    <div className="text-center text-sm text-gray-600 mb-4">
                      {selectedResources.length} recursos selecionados
                    </div>
                  </div>

                  {selectedResources.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <Package className="mx-auto h-12 w-12 mb-2 opacity-50" />
                        <p>Nenhum recurso selecionado</p>
                        <p className="text-sm">Vá para a aba "Recursos" para selecionar itens</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 overflow-y-auto space-y-2 p-2 min-h-0">
                      {selectedResources.map(selected => {
                        const resource = getResourceById(selected.resourceId);
                        if (!resource) return null;

                        return (
                          <div key={selected.resourceId} className="flex items-center gap-3 p-3 border rounded-lg bg-white">
                            <span className="text-2xl">{resource.emoji}</span>
                            <div className="flex-1">
                              <p className="font-medium">{resource.name}</p>
                              <p className="text-sm text-gray-500">
                                Quantidade: {selected.quantity} • Peso total: {(resource.weight * selected.quantity).toFixed(1)}kg
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateResourceQuantity(selected.resourceId, Math.max(1, selected.quantity - 1))}
                              >
                                -
                              </Button>
                              <span className="w-12 text-center">{selected.quantity}</span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateResourceQuantity(selected.resourceId, selected.quantity + 1)}
                              >
                                +
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleResourceToggle(selected.resourceId)}
                              >
                                ✕
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            ) : (
              // Step 2: Configuration and Start
              <div className="flex flex-col h-full space-y-4 p-2">
                {/* Selected resources summary */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Recursos Selecionados</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {selectedResources.map(sel => {
                      const resource = resources.find(r => r.id === sel.resourceId);
                      if (!resource) return null;

                      return (
                        <div key={sel.resourceId} className="flex items-center gap-2">
                          <span className="text-sm flex-1">{resource.name}</span>
                          <div className="flex items-center gap-2">
                            <Slider
                              value={[sel.quantity]}
                              onValueChange={([value]) => handleQuantityChange(sel.resourceId, value)}
                              max={20}
                              min={1}
                              step={1}
                              className="w-16"
                            />
                            <span className="text-sm font-bold w-6">{sel.quantity}</span>
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>

                {/* Duration Configuration */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Duração da Expedição
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Duração:</span>
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
                  </CardContent>
                </Card>

                {/* Requirements check */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Requisitos</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Fome necessária:</span>
                      <span className={player.hunger >= expeditionStats.hungerCost ? 'text-green-600' : 'text-red-600'}>
                        {expeditionStats.hungerCost}% (Você: {Math.floor(player.hunger)}%)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sede necessária:</span>
                      <span className={player.thirst >= expeditionStats.thirstCost ? 'text-green-600' : 'text-red-600'}>
                        {expeditionStats.thirstCost}% (Você: {Math.floor(player.thirst)}%)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>XP estimado:</span>
                      <Badge variant="outline">{expeditionStats.estimatedXP} XP</Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Start button */}
                <div className="flex-1 flex items-end">
                  <Button
                    onClick={() => startExpeditionMutation.mutate()}
                    disabled={!canStartExpedition || startExpeditionMutation.isPending}
                    className="w-full"
                  >
                    {startExpeditionMutation.isPending ? 'Iniciando...' : 'Iniciar Expedição'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Desktop layout (existing full layout)
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col p-6">
        <DialogHeader className="shrink-0 border-b pb-4">
          <DialogTitle className="text-2xl flex items-center gap-3">
            <span className="text-3xl">{biome.emoji}</span>
            <div>
              <div>Expedição Personalizada</div>
              <div className="text-sm font-normal text-gray-600 mt-1">{biome.name}</div>
              <div className="text-sm font-normal text-gray-500 mt-1">
                Selecione os recursos que deseja coletar e defina a duração
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex gap-6 pt-4">
          {/* Left Panel - Resource Selection */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {/* Search and Quick Actions */}
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar recursos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                >
                  Selecionar Tudo ({filteredResources.length})
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeselectAll}
                  disabled={selectedResources.length === 0}
                >
                  Limpar Seleção
                </Button>
              </div>
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
                          <div className="font-medium flex items-center gap-2">
                            {resource.name}
                            {resource.requiredTool && !hasRequiredTools(resource) && (
                              <Badge variant="outline" className="text-xs text-orange-600 border-orange-200">
                                🔧 Ferramenta necessária
                              </Badge>
                            )}
                          </div>
                          {resource.requiredTool && (
                            <div className="text-sm text-gray-600">
                              Precisa de: {resource.requiredTool}
                              {!hasRequiredTools(resource) && (
                                <span className="text-orange-600 ml-1">(não equipada)</span>
                              )}
                            </div>
                          )}
                        </div>
                        <span className="text-xl">{resource.emoji}</span>
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
                  <p className="text-gray-600">
                    {searchTerm ? `Nenhum recurso encontrado para "${searchTerm}"` : 'Nenhum recurso disponível'}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Panel - Expedition Configuration */}
          <div className="w-80 shrink-0 space-y-4 overflow-y-auto">
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
                  <div className="flex justify-between">
                    <span>Fome necessária:</span>
                    <span className={player.hunger >= expeditionStats.hungerCost ? 'text-green-600' : 'text-red-600'}>
                      {expeditionStats.hungerCost}% (Você: {Math.floor(player.hunger)}%)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sede necessária:</span>
                    <span className={player.thirst >= expeditionStats.thirstCost ? 'text-green-600' : 'text-red-600'}>
                      {expeditionStats.thirstCost}% (Você: {Math.floor(player.thirst)}%)
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Requirements Status */}
            {!canStartExpedition && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 text-red-600">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-sm font-medium">Requisitos não atendidos</span>
                  </div>
                  <div className="text-xs text-red-600 mt-1">
                    {selectedResources.length === 0 && "Selecione pelo menos um recurso"}
                    {player.hunger < expeditionStats.hungerCost && "Fome insuficiente"}
                    {player.thirst < expeditionStats.thirstCost && "Sede insuficiente"}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Start Button */}
            <Button
              onClick={() => startExpeditionMutation.mutate()}
              disabled={!canStartExpedition || startExpeditionMutation.isPending}
              className="w-full"
              size="lg"
            >
              {startExpeditionMutation.isPending ? 'Iniciando...' : 'Iniciar Expedição'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
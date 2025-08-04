import React, { useState, useMemo, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Package, Search, X, Plus, Minus } from "lucide-react";
import type { Resource, Biome } from "@shared/types";
import { useIsMobile } from "@/hooks/use-mobile";

interface SelectedResource {
  resourceId: string;
  quantity: number;
}

interface ImprovedCustomExpeditionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartExpedition: (resources: SelectedResource[], duration: number) => Promise<void>;
  resources: Resource[];
  selectedBiome: Biome | null;
}

export function ImprovedCustomExpeditionModal({
  isOpen,
  onClose,
  onStartExpedition,
  resources,
  selectedBiome
}: ImprovedCustomExpeditionModalProps) {
  const [selectedResources, setSelectedResources] = useState<SelectedResource[]>([]);
  const [duration, setDuration] = useState(30);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentStep, setCurrentStep] = useState<'selection' | 'configuration'>('selection');
  const [isLoading, setIsLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("");

  const isMobile = useIsMobile();

  // Categorizar recursos
  const categorizedResources = useMemo(() => {
    const filtered = resources.filter(resource =>
      resource.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const categories: { [key: string]: Resource[] } = {};

    filtered.forEach(resource => {
      const category = resource.category || 'Outros';
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(resource);
    });

    // Definir categoria ativa se não estiver definida
    if (!activeCategory && Object.keys(categories).length > 0) {
      setActiveCategory(Object.keys(categories)[0]);
    }

    return categories;
  }, [resources, searchTerm, activeCategory]);

  const getResourceIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      'Materiais Básicos': '🧱',
      'Alimentos': '🍎',
      'Ferramentas': '🔧',
      'Materiais de Construção': '🏗️',
      'Metais': '⚡',
      'Outros': '📦'
    };
    return icons[category] || '📦';
  };

  const handleResourceToggle = useCallback((resourceId: string) => {
    setSelectedResources(prev => {
      const exists = prev.find(r => r.resourceId === resourceId);
      if (exists) {
        return prev.filter(r => r.resourceId !== resourceId);
      } else {
        return [...prev, { resourceId, quantity: 5 }];
      }
    });
  }, []);

  const handleQuantityChange = useCallback((resourceId: string, quantity: number) => {
    setSelectedResources(prev => 
      prev.map(r => r.resourceId === resourceId ? { ...r, quantity } : r)
    );
  }, []);

  const updateResourceQuantity = useCallback((resourceId: string, quantity: number) => {
    setSelectedResources(prev => 
      prev.map(r => r.resourceId === resourceId ? { ...r, quantity: Math.max(1, quantity) } : r)
    );
  }, []);

  const getResourceById = (id: string) => resources.find(r => r.id === id);

  const handleSelectAll = () => {
    const categoryResources = categorizedResources[activeCategory] || [];
    const newSelections = categoryResources
      .filter(resource => !selectedResources.some(sel => sel.resourceId === resource.id))
      .map(resource => ({ resourceId: resource.id, quantity: 5 }));

    setSelectedResources(prev => [...prev, ...newSelections]);
  };

  const handleDeselectAll = () => {
    setSelectedResources([]);
  };

  const handleStart = async () => {
    if (selectedResources.length === 0) return;

    setIsLoading(true);
    try {
      await onStartExpedition(selectedResources, duration);
      onClose();
    } catch (error) {
      console.error('Erro ao iniciar expedição:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const totalWeight = selectedResources.reduce((total, sel) => {
    const resource = getResourceById(sel.resourceId);
    return total + (resource ? resource.weight * sel.quantity : 0);
  }, 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`${isMobile ? 'w-full h-full max-w-none max-h-none rounded-none' : 'max-w-4xl max-h-[90vh]'} flex flex-col`}>
        <DialogHeader className="shrink-0">
          <DialogTitle className="flex items-center gap-2">
            🎒 Expedição Personalizada
            {selectedBiome && <Badge variant="outline">{selectedBiome.name}</Badge>}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden min-h-0">
          {currentStep === 'selection' ? (
            // Step 1: Resource Selection with Mobile-Optimized Tabs
            <div className="flex flex-col h-full min-h-0">
              {/* Search */}
              <div className="shrink-0 p-2 space-y-3">
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
                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAll}
                    className="text-xs"
                  >
                    Selecionar Categoria ({categorizedResources[activeCategory]?.length || 0})
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDeselectAll}
                    disabled={selectedResources.length === 0}
                    className="text-xs"
                  >
                    Limpar ({selectedResources.length})
                  </Button>
                </div>
              </div>

              {/* Mobile-Optimized Category Tabs */}
              <div className="flex-1 overflow-hidden min-h-0">
                <Tabs value={activeCategory} onValueChange={setActiveCategory} className="flex flex-col h-full">
                  {/* Horizontal Scrollable Category Tabs */}
                  <div className="shrink-0 border-b">
                    <ScrollArea className="w-full">
                      <TabsList className="inline-flex w-auto min-w-full p-1 bg-muted">
                        {Object.entries(categorizedResources).map(([category, categoryResources]) => (
                          <TabsTrigger 
                            key={category} 
                            value={category}
                            className="whitespace-nowrap text-xs px-3 py-2 min-w-fit"
                          >
                            <span className="mr-1">{getResourceIcon(category)}</span>
                            {isMobile ? category.split(' ')[0] : category}
                            <Badge variant="secondary" className="ml-1 text-xs">
                              {categoryResources.length}
                            </Badge>
                          </TabsTrigger>
                        ))}
                      </TabsList>
                    </ScrollArea>
                  </div>

                  {/* Resource Content */}
                  {Object.entries(categorizedResources).map(([category, categoryResources]) => (
                    <TabsContent key={category} value={category} className="flex-1 overflow-hidden m-0 mt-2">
                      <ScrollArea className="h-full">
                        <div className="space-y-2 p-2">
                          {categoryResources.map(resource => {
                            const isSelected = selectedResources.some(sel => sel.resourceId === resource.id);
                            const selectedData = selectedResources.find(sel => sel.resourceId === resource.id);

                            return (
                              <Card key={resource.id} className="overflow-hidden">
                                <CardContent className="p-3">
                                  <div className="flex items-center gap-3">
                                    <Checkbox
                                      checked={isSelected}
                                      onCheckedChange={() => handleResourceToggle(resource.id)}
                                    />
                                    <span className="text-xl">{resource.emoji}</span>
                                    <div className="flex-1 min-w-0">
                                      <p className="font-medium text-sm truncate">{resource.name}</p>
                                      <p className="text-xs text-gray-500">
                                        Peso: {resource.weight}kg • {
                                          resource.rarity === "common" ? "Comum" : 
                                          resource.rarity === "uncommon" ? "Incomum" : "Raro"
                                        }
                                      </p>
                                    </div>
                                  </div>

                                  {/* Mobile-Optimized Quantity Controls */}
                                  {isSelected && (
                                    <div className="mt-3 pt-3 border-t">
                                      <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Quantidade:</span>
                                        <div className="flex items-center gap-2">
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => updateResourceQuantity(resource.id, (selectedData?.quantity || 5) - 1)}
                                            className="h-8 w-8 p-0"
                                          >
                                            <Minus className="h-3 w-3" />
                                          </Button>
                                          <span className="w-8 text-center text-sm font-bold">
                                            {selectedData?.quantity || 5}
                                          </span>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => updateResourceQuantity(resource.id, (selectedData?.quantity || 5) + 1)}
                                            className="h-8 w-8 p-0"
                                          >
                                            <Plus className="h-3 w-3" />
                                          </Button>
                                        </div>
                                      </div>

                                      {!isMobile && (
                                        <div className="mt-2">
                                          <Slider
                                            value={[selectedData?.quantity || 5]}
                                            onValueChange={([value]) => handleQuantityChange(resource.id, value)}
                                            max={50}
                                            min={1}
                                            step={1}
                                            className="w-full"
                                          />
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                      </ScrollArea>
                    </TabsContent>
                  ))}
                </Tabs>
              </div>

              {/* Bottom Actions */}
              <div className="shrink-0 p-4 border-t bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm">
                    <span className="font-medium">{selectedResources.length}</span> recursos selecionados
                    {totalWeight > 0 && (
                      <span className="text-gray-500 ml-2">• {totalWeight.toFixed(1)}kg</span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={onClose}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    onClick={() => setCurrentStep('configuration')}
                    disabled={selectedResources.length === 0}
                    className="flex-1"
                  >
                    Continuar →
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            // Step 2: Configuration
            <div className="flex flex-col h-full space-y-4 p-4">
              {/* Selected resources summary */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Recursos Selecionados</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 max-h-40 overflow-y-auto">
                  {selectedResources.map(sel => {
                    const resource = getResourceById(sel.resourceId);
                    if (!resource) return null;

                    return (
                      <div key={sel.resourceId} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span>{resource.emoji}</span>
                          <span>{resource.name}</span>
                        </div>
                        <span className="font-medium">{sel.quantity}x</span>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Duration */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Duração da Expedição</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Slider
                      value={[duration]}
                      onValueChange={([value]) => setDuration(value)}
                      max={180}
                      min={15}
                      step={15}
                      className="w-full"
                    />
                    <div className="text-center">
                      <span className="font-medium">{duration} minutos</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex gap-2 mt-auto pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentStep('selection')}
                  className="flex-1"
                >
                  ← Voltar
                </Button>
                <Button 
                  onClick={handleStart}
                  disabled={isLoading || selectedResources.length === 0}
                  className="flex-1"
                >
                  {isLoading ? 'Iniciando...' : 'Iniciar Expedição'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ImprovedCustomExpeditionModal;
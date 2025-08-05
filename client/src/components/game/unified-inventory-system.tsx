import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Package, Search, ArrowRight, ArrowLeft, Utensils, Droplets, Trash2 } from 'lucide-react';
import type { Resource, Equipment, Player, InventoryItem, StorageItem } from '@shared/types';

interface UnifiedInventorySystemProps {
  playerId: string;
  resources: Resource[];
  equipment: Equipment[];
  player: Player;
  isBlocked?: boolean;
}

interface InventoryData {
  inventory: InventoryItem[];
  storage: StorageItem[];
}

interface EnhancedItem {
  id: string;
  resourceId: string;
  quantity: number;
  location: 'inventory' | 'storage';
  itemData: Resource | Equipment;
  isConsumable: boolean;
  weight: number;
  totalWeight: number;
}

// Helper function to check if an item is consumable
const isItemConsumable = (item: Resource | Equipment): boolean => {
  return 'consumable' in item && item.consumable === true;
};

export const UnifiedInventorySystem: React.FC<UnifiedInventorySystemProps> = ({
  playerId,
  resources,
  equipment,
  player,
  isBlocked = false
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'consumables' | 'tools' | 'materials'>('all');

  // Fetch inventory data with aggressive cache invalidation
  const { data: inventoryData = [], isLoading: inventoryLoading, refetch: refetchInventory } = useQuery({
    queryKey: [`/api/inventory/${playerId}`],
    queryFn: async () => {
      const response = await fetch(`/api/inventory/${playerId}?t=${Date.now()}`);
      if (!response.ok) throw new Error('Failed to fetch inventory');
      return response.json();
    },
    refetchInterval: 2000,
    staleTime: 0,
    gcTime: 0
  });

  // Fetch storage data with aggressive cache invalidation
  const { data: storageData = [], isLoading: storageLoading, refetch: refetchStorage } = useQuery({
    queryKey: [`/api/storage/${playerId}`],
    queryFn: async () => {
      const response = await fetch(`/api/storage/${playerId}?t=${Date.now()}`);
      if (!response.ok) throw new Error('Failed to fetch storage');
      return response.json();
    },
    refetchInterval: 2000,
    staleTime: 0,
    gcTime: 0
  });

  // Combine and enhance inventory data
  const allItems = useMemo(() => {
    const combined: EnhancedItem[] = [];
    
    // Create lookup maps
    const resourceMap = new Map(resources.map(r => [r.id, r]));
    const equipmentMap = new Map(equipment.map(e => [e.id, e]));

    // Process inventory items
    for (const item of inventoryData) {
      const itemData = resourceMap.get(item.resourceId) || equipmentMap.get(item.resourceId);
      if (itemData && item.quantity > 0) {
        combined.push({
          id: item.id,
          resourceId: item.resourceId,
          quantity: item.quantity,
          location: 'inventory',
          itemData,
          isConsumable: isItemConsumable(itemData),
          weight: itemData.weight || 0,
          totalWeight: (itemData.weight || 0) * item.quantity
        });
      }
    }

    // Process storage items
    for (const item of storageData) {
      const itemData = resourceMap.get(item.resourceId) || equipmentMap.get(item.resourceId);
      if (itemData && item.quantity > 0) {
        combined.push({
          id: item.id,
          resourceId: item.resourceId,
          quantity: item.quantity,
          location: 'storage',
          itemData,
          isConsumable: isItemConsumable(itemData),
          weight: itemData.weight || 0,
          totalWeight: (itemData.weight || 0) * item.quantity
        });
      }
    }

    return combined;
  }, [inventoryData, storageData, resources, equipment]);

  // Filter items based on search and filter
  const filteredItems = useMemo(() => {
    let filtered = allItems;

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.itemData.name.toLowerCase().includes(searchLower) ||
        ('description' in item.itemData && typeof item.itemData.description === 'string' ? item.itemData.description.toLowerCase().includes(searchLower) : false)
      );
    }

    // Apply type filter
    switch (selectedFilter) {
      case 'consumables':
        filtered = filtered.filter(item => item.isConsumable);
        break;
      case 'tools':
        filtered = filtered.filter(item => 'toolType' in item.itemData);
        break;
      case 'materials':
        filtered = filtered.filter(item => !item.isConsumable && !('toolType' in item.itemData));
        break;
    }

    return filtered;
  }, [allItems, searchTerm, selectedFilter]);

  // Group items by resourceId for display
  const groupedItems = useMemo(() => {
    const groups = new Map<string, EnhancedItem[]>();
    
    for (const item of filteredItems) {
      const existing = groups.get(item.resourceId) || [];
      existing.push(item);
      groups.set(item.resourceId, existing);
    }

    return Array.from(groups.entries()).map(([resourceId, items]) => ({
      resourceId,
      items,
      itemData: items[0].itemData,
      totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
      inventoryQuantity: items.filter(item => item.location === 'inventory').reduce((sum, item) => sum + item.quantity, 0),
      storageQuantity: items.filter(item => item.location === 'storage').reduce((sum, item) => sum + item.quantity, 0),
      isConsumable: items[0].isConsumable
    }));
  }, [filteredItems]);

  // Calculate stats
  const stats = useMemo(() => {
    const inventoryItems = allItems.filter(item => item.location === 'inventory');
    const storageItems = allItems.filter(item => item.location === 'storage');
    
    return {
      inventoryWeight: inventoryItems.reduce((sum, item) => sum + item.totalWeight, 0),
      inventoryCount: inventoryItems.reduce((sum, item) => sum + item.quantity, 0),
      storageCount: storageItems.reduce((sum, item) => sum + item.quantity, 0),
      totalItems: allItems.reduce((sum, item) => sum + item.quantity, 0)
    };
  }, [allItems]);

  // Consume item mutation
  const consumeItemMutation = useMutation({
    mutationFn: async ({ resourceId, quantity }: { resourceId: string; quantity: number }) => {
      const response = await fetch(`/api/v2/player/${playerId}/consume`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: resourceId, quantity })
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to consume item');
      }
      return response.json();
    },
    onSuccess: () => {
      // Force immediate data refresh
      refetchInventory();
      refetchStorage();
      queryClient.invalidateQueries({ queryKey: [`/api/player/${playerId}`] });
      toast({ title: "Item consumido com sucesso!" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Erro ao consumir item", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  // Move item mutation
  const moveItemMutation = useMutation({
    mutationFn: async ({ itemId, quantity, from, to }: { 
      itemId: string; 
      quantity: number; 
      from: 'inventory' | 'storage';
      to: 'inventory' | 'storage';
    }) => {
      const endpoint = from === 'inventory' ? '/api/inventory/move-to-storage' : '/api/storage/move-to-inventory';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, itemId, quantity })
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to move item');
      }
      return response.json();
    },
    onSuccess: () => {
      // Force immediate data refresh
      refetchInventory();
      refetchStorage();
      toast({ title: "Item movido com sucesso!" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Erro ao mover item", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  function isItemConsumable(itemData: Resource | Equipment): boolean {
    if ('type' in itemData) {
      // Resource type
      return itemData.type === 'food' || itemData.type === 'drink' || 
             itemData.name.toLowerCase().includes('água') ||
             itemData.name.toLowerCase().includes('comida') ||
             itemData.name.toLowerCase().includes('carne') ||
             itemData.name.toLowerCase().includes('peixe');
    }
    return false;
  }

  if (inventoryLoading || storageLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5" />
          <span>Carregando inventário...</span>
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5" />
          <h2 className="text-lg font-semibold">Inventário</h2>
        </div>
        <Button 
          size="sm" 
          variant="outline"
          onClick={() => {
            refetchInventory();
            refetchStorage();
          }}
        >
          Atualizar
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-3">
          <div className="text-sm text-gray-600">Inventário</div>
          <div className="text-lg font-semibold">{stats.inventoryCount}</div>
          <div className="text-xs text-gray-500">{stats.inventoryWeight}g</div>
        </Card>
        <Card className="p-3">
          <div className="text-sm text-gray-600">Armazém</div>
          <div className="text-lg font-semibold">{stats.storageCount}</div>
        </Card>
        <Card className="p-3">
          <div className="text-sm text-gray-600">Peso</div>
          <div className="text-lg font-semibold">{stats.inventoryWeight}/{player.maxInventoryWeight}g</div>
          <Progress 
            value={(stats.inventoryWeight / player.maxInventoryWeight) * 100}
            className="h-1 mt-1"
          />
        </Card>
        <Card className="p-3">
          <div className="text-sm text-gray-600">Total</div>
          <div className="text-lg font-semibold">{stats.totalItems}</div>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar itens..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={selectedFilter}
          onChange={(e) => setSelectedFilter(e.target.value as any)}
          className="px-3 py-2 border rounded-md bg-white"
        >
          <option value="all">Todos</option>
          <option value="consumables">Consumíveis</option>
          <option value="tools">Ferramentas</option>
          <option value="materials">Materiais</option>
        </select>
      </div>

      {/* Items List */}
      <ScrollArea className="h-[400px]">
        <div className="space-y-2">
          {groupedItems.length === 0 ? (
            <Card className="p-8 text-center border-dashed">
              <Package className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <div className="text-gray-600">Nenhum item encontrado</div>
            </Card>
          ) : (
            groupedItems.map(({ resourceId, itemData, totalQuantity, inventoryQuantity, storageQuantity, isConsumable }) => (
              <Card key={resourceId} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Package className="w-6 h-6 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">{itemData.name}</h3>
                      <p className="text-sm text-gray-600">
                        {'description' in itemData && typeof itemData.description === 'string' 
                          ? itemData.description 
                          : 'No description'}
                      </p>
                      <div className="flex items-center gap-4 mt-1">
                        {inventoryQuantity > 0 && (
                          <Badge variant="secondary">
                            🎒 {inventoryQuantity}
                          </Badge>
                        )}
                        {storageQuantity > 0 && (
                          <Badge variant="outline">
                            📦 {storageQuantity}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {isConsumable && inventoryQuantity > 0 && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => consumeItemMutation.mutate({ resourceId, quantity: 1 })}
                        disabled={consumeItemMutation.isPending || isBlocked}
                      >
                        <Utensils className="w-4 h-4 mr-1" />
                        Usar
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default UnifiedInventorySystem;
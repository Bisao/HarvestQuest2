import React, { useState, useMemo, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useGameData } from '@/hooks/useGamePolling';
import { useIsMobile } from '@/hooks/use-mobile';
import { ItemFinder } from '@shared/utils/item-finder';
import { InventoryManager } from '@shared/utils/inventory-manager';
import { isConsumable } from '@shared/utils/consumable-utils';

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';

// Icons
import { 
  Package, 
  Search, 
  ArrowRight, 
  ArrowLeft,
  Shield, 
  Sword, 
  HardHat,
  Shirt,
  Crown,
  Utensils,
  Droplets,
  Trash2,
  Info,
  Plus,
  Minus,
  RotateCcw
} from 'lucide-react';

// Types
import type { Resource, Equipment, Player, InventoryItem } from '@shared/types';

interface NewInventorySystemProps {
  playerId: string;
  resources: Resource[];
  equipment: Equipment[];
  player: Player;
  isBlocked?: boolean;
}

interface EnhancedInventoryItem {
  item: InventoryItem;
  itemData: Resource | Equipment;
  type: 'resource' | 'equipment';
  totalWeight: number;
  totalValue: number;
  isConsumable: boolean;
  isEquipment: boolean;
  canStack: boolean;
  maxStackSize: number;
  rarity?: string;
}

interface InventoryStats {
  totalItems: number;
  totalWeight: number;
  totalValue: number;
  uniqueItems: number;
}

// Utility function to get item rarity color
const getRarityColor = (rarity?: string) => {
  switch (rarity?.toLowerCase()) {
    case 'common': return 'bg-gray-100 text-gray-800 border-gray-200';
    case 'uncommon': return 'bg-green-100 text-green-800 border-green-200';
    case 'rare': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'epic': return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'legendary': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

// Equipment slot configuration
const EQUIPMENT_SLOTS = {
  helmet: { name: 'Capacete', icon: HardHat, emoji: '🪖' },
  chestplate: { name: 'Peito', icon: Shirt, emoji: '👕' },
  leggings: { name: 'Pernas', icon: Shirt, emoji: '👖' },
  boots: { name: 'Botas', icon: Shirt, emoji: '👢' },
  weapon: { name: 'Arma', icon: Sword, emoji: '⚔️' },
  tool: { name: 'Ferramenta', icon: Crown, emoji: '🔧' },
  food: { name: 'Comida', icon: Utensils, emoji: '🍖' },
  drink: { name: 'Bebida', icon: Droplets, emoji: '💧' }
};

export const NewInventorySystem: React.FC<NewInventorySystemProps> = ({
  playerId,
  resources,
  equipment,
  player,
  isBlocked = false
}) => {
  // Hooks
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const { inventory: inventoryData = [], storage: storageData = [] } = useGameData({ playerId });

  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'resources' | 'equipment' | 'consumables'>('all');
  const [selectedItem, setSelectedItem] = useState<EnhancedInventoryItem | null>(null);
  const [showItemDetails, setShowItemDetails] = useState(false);
  const [activeTab, setActiveTab] = useState<'items' | 'equipment'>('items');

  // Initialize systems
  ItemFinder.initialize(resources, equipment);
  const inventoryManager = new InventoryManager(resources, equipment);

  // Process inventory data
  const enhancedInventory = useMemo(() => {
    return inventoryManager.processInventoryItems(inventoryData);
  }, [inventoryData, resources, equipment]);

  // Filter and search inventory
  const filteredInventory = useMemo(() => {
    let filtered = enhancedInventory;

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.itemData.name.toLowerCase().includes(searchLower) ||
        item.itemData.description?.toLowerCase().includes(searchLower)
      );
    }

    // Apply type filter
    if (selectedFilter !== 'all') {
      switch (selectedFilter) {
        case 'resources':
          filtered = filtered.filter(item => item.type === 'resource');
          break;
        case 'equipment':
          filtered = filtered.filter(item => item.type === 'equipment');
          break;
        case 'consumables':
          filtered = filtered.filter(item => item.isConsumable);
          break;
      }
    }

    return filtered;
  }, [enhancedInventory, searchTerm, selectedFilter]);

  // Calculate inventory stats
  const inventoryStats = useMemo((): InventoryStats => {
    return inventoryManager.calculateInventoryStats(enhancedInventory);
  }, [enhancedInventory]);

  // Equipment slots data
  const equippedItems = useMemo(() => {
    const equipped: Record<string, string | null> = {
      helmet: player.equippedHelmet,
      chestplate: player.equippedChestplate,
      leggings: player.equippedLeggings,
      boots: player.equippedBoots,
      weapon: player.equippedWeapon,
      tool: player.equippedTool,
      food: player.equippedFood || null,
      drink: player.equippedDrink || null
    };
    
    return equipped;
  }, [player]);

  // Mutations
  const moveToStorageMutation = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: string; quantity: number }) => {
      return apiRequest(`/api/inventory/move-to-storage`, {
        method: 'POST',
        body: JSON.stringify({ playerId, itemId, quantity })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/inventory`, playerId] });
      queryClient.invalidateQueries({ queryKey: [`/api/storage`, playerId] });
      toast({ title: "Item movido para o armazém com sucesso!" });
    },
    onError: () => {
      toast({ 
        title: "Erro ao mover item", 
        description: "Não foi possível mover o item para o armazém.",
        variant: "destructive"
      });
    }
  });

  const equipItemMutation = useMutation({
    mutationFn: async ({ slot, equipmentId }: { slot: string; equipmentId: string | null }) => {
      return apiRequest(`/api/player/equip`, {
        method: 'POST',
        body: JSON.stringify({ playerId, slot, equipmentId })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/player`, playerId] });
      queryClient.invalidateQueries({ queryKey: [`/api/inventory`, playerId] });
      toast({ title: "Equipamento alterado com sucesso!" });
    },
    onError: () => {
      toast({ 
        title: "Erro ao equipar item", 
        description: "Não foi possível equipar o item.",
        variant: "destructive"
      });
    }
  });

  const consumeItemMutation = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: string; quantity: number }) => {
      return apiRequest(`/api/v2/consume`, {
        method: 'POST',
        body: JSON.stringify({ playerId, itemId, quantity })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/player`, playerId] });
      queryClient.invalidateQueries({ queryKey: [`/api/inventory`, playerId] });
      toast({ title: "Item consumido com sucesso!" });
    },
    onError: () => {
      toast({ 
        title: "Erro ao consumir item", 
        description: "Não foi possível consumir o item.",
        variant: "destructive"
      });
    }
  });

  // Event handlers
  const handleItemClick = useCallback((item: EnhancedInventoryItem) => {
    setSelectedItem(item);
    setShowItemDetails(true);
  }, []);

  const handleMoveToStorage = useCallback((item: EnhancedInventoryItem, quantity: number) => {
    if (isBlocked) return;
    moveToStorageMutation.mutate({ itemId: item.item.resourceId, quantity });
  }, [isBlocked, moveToStorageMutation]);

  const handleEquipItem = useCallback((slot: string, equipmentId: string | null) => {
    if (isBlocked) return;
    equipItemMutation.mutate({ slot, equipmentId });
  }, [isBlocked, equipItemMutation]);

  const handleConsumeItem = useCallback((item: EnhancedInventoryItem, quantity: number) => {
    if (isBlocked) return;
    consumeItemMutation.mutate({ itemId: item.item.resourceId, quantity });
  }, [isBlocked, consumeItemMutation]);

  // Render components
  const renderInventoryItem = (item: EnhancedInventoryItem) => {
    const { itemData, item: inventoryItem, type, isConsumable: isConsumableItem, rarity } = item;
    const IconComponent = type === 'equipment' && 'slot' in itemData ? 
      EQUIPMENT_SLOTS[itemData.slot as keyof typeof EQUIPMENT_SLOTS]?.icon || Package : 
      Package;

    return (
      <Card 
        key={inventoryItem.id}
        className={`cursor-pointer transition-all hover:shadow-md ${isMobile ? 'p-2' : 'p-3'}`}
        onClick={() => handleItemClick(item)}
      >
        <CardContent className={`${isMobile ? 'p-3' : 'p-4'}`}>
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg bg-gray-100 flex-shrink-0`}>
              <IconComponent className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} text-gray-600`} />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className={`${isMobile ? 'text-sm' : 'text-base'} font-medium text-gray-900 truncate`}>
                  {itemData.name}
                </h3>
                <Badge variant="secondary" className={`${isMobile ? 'text-xs' : 'text-sm'} flex-shrink-0`}>
                  {inventoryItem.quantity}x
                </Badge>
              </div>
              
              <div className="flex items-center justify-between mt-1">
                <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-500 truncate`}>
                  {itemData.description || 'Sem descrição'}
                </p>
                
                <div className="flex items-center space-x-2 flex-shrink-0">
                  {rarity && (
                    <Badge 
                      variant="outline" 
                      className={`${isMobile ? 'text-xs px-1' : 'text-xs'} ${getRarityColor(rarity)}`}
                    >
                      {rarity}
                    </Badge>
                  )}
                  
                  {isConsumableItem && (
                    <Badge variant="outline" className={`${isMobile ? 'text-xs px-1' : 'text-xs'} bg-green-50 text-green-700`}>
                      Consumível
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderEquipmentSlot = (slotKey: string) => {
    const slot = EQUIPMENT_SLOTS[slotKey as keyof typeof EQUIPMENT_SLOTS];
    const equippedId = equippedItems[slotKey];
    const equippedItem = equippedId ? ItemFinder.getItemById(equippedId) : null;
    const IconComponent = slot.icon;
    
    return (
      <Card key={slotKey} className={`${isMobile ? 'p-2' : 'p-3'}`}>
        <CardContent className={`${isMobile ? 'p-3' : 'p-4'}`}>
          <div className="flex flex-col items-center space-y-2">
            <div className={`p-3 rounded-lg bg-gray-100 ${!equippedItem ? 'border-2 border-dashed border-gray-300' : ''}`}>
              <IconComponent className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} text-gray-600`} />
            </div>
            
            <div className="text-center">
              <p className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium text-gray-900`}>
                {slot.name}
              </p>
              {equippedItem ? (
                <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-500 mt-1 truncate max-w-20`}>
                  {equippedItem.name}
                </p>
              ) : (
                <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-400 mt-1`}>
                  Vazio
                </p>
              )}
            </div>
            
            {equippedItem && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEquipItem(slotKey, null)}
                disabled={isBlocked}
                className={`${isMobile ? 'text-xs px-2' : 'text-sm'}`}
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Desequipar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className={`space-y-4 ${isMobile ? 'p-2' : 'p-4'}`}>
      {/* Header with Stats */}
      <Card>
        <CardHeader className={`${isMobile ? 'pb-3' : 'pb-4'}`}>
          <CardTitle className={`flex items-center space-x-2 ${isMobile ? 'text-lg' : 'text-xl'}`}>
            <Package className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'}`} />
            <span>Inventário</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`grid ${isMobile ? 'grid-cols-2 gap-3' : 'grid-cols-4 gap-4'}`}>
            <div className="text-center">
              <p className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold text-gray-900`}>
                {inventoryStats.totalItems}
              </p>
              <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-500`}>
                Total de Itens
              </p>
            </div>
            
            <div className="text-center">
              <p className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold text-gray-900`}>
                {inventoryStats.uniqueItems}
              </p>
              <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-500`}>
                Itens Únicos
              </p>
            </div>
            
            {!isMobile && (
              <>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.round(inventoryStats.totalWeight)}kg
                  </p>
                  <p className="text-sm text-gray-500">
                    Peso Total
                  </p>
                </div>
                
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">
                    {inventoryStats.totalValue}
                  </p>
                  <p className="text-sm text-gray-500">
                    Valor Total
                  </p>
                </div>
              </>
            )}
          </div>
          
          {/* Weight Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <span className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-600`}>
                Peso do Inventário
              </span>
              <span className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-900 font-medium`}>
                {Math.round(inventoryStats.totalWeight)}kg / {player.maxInventoryWeight}kg
              </span>
            </div>
            <Progress 
              value={(inventoryStats.totalWeight / player.maxInventoryWeight) * 100} 
              className="h-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <Card>
        <CardContent className={`${isMobile ? 'p-3' : 'p-4'}`}>
          <div className={`flex ${isMobile ? 'flex-col space-y-3' : 'flex-row items-center space-x-4'}`}>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar itens..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className={`flex ${isMobile ? 'flex-wrap gap-2' : 'space-x-2'}`}>
              {(['all', 'resources', 'equipment', 'consumables'] as const).map((filter) => (
                <Button
                  key={filter}
                  variant={selectedFilter === filter ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedFilter(filter)}
                  className={`${isMobile ? 'text-xs px-3' : 'text-sm'}`}
                >
                  {filter === 'all' && 'Todos'}
                  {filter === 'resources' && 'Recursos'}
                  {filter === 'equipment' && 'Equipamentos'}
                  {filter === 'consumables' && 'Consumíveis'}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab as any}>
        <TabsList className={`grid w-full grid-cols-2 ${isMobile ? 'h-12' : 'h-10'}`}>
          <TabsTrigger value="items" className={`${isMobile ? 'text-sm' : ''}`}>
            <Package className="w-4 h-4 mr-2" />
            Itens ({filteredInventory.length})
          </TabsTrigger>
          <TabsTrigger value="equipment" className={`${isMobile ? 'text-sm' : ''}`}>
            <Shield className="w-4 h-4 mr-2" />
            Equipamentos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="items" className="mt-4">
          <ScrollArea className="h-[600px]">
            <div className={`space-y-3 ${isMobile ? 'pb-4' : 'pb-6'}`}>
              {filteredInventory.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Package className="w-12 h-12 text-gray-400 mb-4" />
                    <p className="text-gray-500 text-center">
                      {searchTerm || selectedFilter !== 'all' 
                        ? 'Nenhum item encontrado com os filtros aplicados'
                        : 'Inventário vazio'
                      }
                    </p>
                    {(searchTerm || selectedFilter !== 'all') && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSearchTerm('');
                          setSelectedFilter('all');
                        }}
                        className="mt-3"
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Limpar Filtros
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                filteredInventory.map(renderInventoryItem)
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="equipment" className="mt-4">
          <div className={`grid ${isMobile ? 'grid-cols-2 gap-3' : 'grid-cols-4 gap-4'}`}>
            {Object.keys(EQUIPMENT_SLOTS).map(renderEquipmentSlot)}
          </div>
        </TabsContent>
      </Tabs>

      {/* Item Details Modal */}
      <Dialog open={showItemDetails} onOpenChange={setShowItemDetails}>
        <DialogContent className={`${isMobile ? 'max-w-[95%] h-[90%] overflow-y-auto' : 'max-w-md'}`}>
          {selectedItem && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <Package className="w-5 h-5" />
                  <span>{selectedItem.itemData.name}</span>
                </DialogTitle>
                <DialogDescription>
                  {selectedItem.itemData.description || 'Sem descrição disponível'}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Quantidade:</span>
                    <p>{selectedItem.item.quantity}x</p>
                  </div>
                  <div>
                    <span className="font-medium">Tipo:</span>
                    <p>{selectedItem.type === 'resource' ? 'Recurso' : 'Equipamento'}</p>
                  </div>
                  <div>
                    <span className="font-medium">Peso Total:</span>
                    <p>{selectedItem.totalWeight.toFixed(1)}kg</p>
                  </div>
                  <div>
                    <span className="font-medium">Valor Total:</span>
                    <p>{selectedItem.totalValue} moedas</p>
                  </div>
                </div>

                <div className={`flex ${isMobile ? 'flex-col space-y-2' : 'flex-row space-x-2'}`}>
                  {selectedItem.isConsumable && (
                    <Button
                      onClick={() => {
                        handleConsumeItem(selectedItem, 1);
                        setShowItemDetails(false);
                      }}
                      disabled={isBlocked || consumeItemMutation.isPending}
                      className="flex-1"
                    >
                      <Utensils className="w-4 h-4 mr-2" />
                      Consumir
                    </Button>
                  )}
                  
                  <Button
                    variant="outline"
                    onClick={() => {
                      handleMoveToStorage(selectedItem, selectedItem.item.quantity);
                      setShowItemDetails(false);
                    }}
                    disabled={isBlocked || moveToStorageMutation.isPending}
                    className="flex-1"
                  >
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Para Armazém
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NewInventorySystem;
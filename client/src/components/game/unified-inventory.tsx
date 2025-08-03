import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useInventoryManager } from '@/hooks/useInventoryManager';
import { useInventoryUpdates } from '@/hooks/use-inventory-updates';
import { 
  Package, 
  Search, 
  Shirt, 
  Sword, 
  Hammer,
  Apple,
  Zap,
  Filter
} from 'lucide-react';
import type { Resource, Equipment, Player } from '@shared/types';
import type { EnhancedInventoryItem } from '@shared/types/inventory-types';
import { isConsumable, getConsumableDescription, getConsumableEffects } from '@shared/utils/consumable-utils';
import { EnhancedItemModal } from './enhanced-item-modal';
import EquipmentSelectorModal from './equipment-selector-modal';

interface UnifiedInventoryProps {
  playerId: string;
  resources: Resource[];
  equipment: Equipment[];
  player: Player;
  isBlocked?: boolean;
}

const ITEM_CATEGORIES = {
  all: { name: "Todos", icon: Package, filter: () => true },
  consumables: { name: "Consumíveis", icon: Apple, filter: (item: EnhancedInventoryItem) => isConsumable(item.item) },
  materials: { name: "Materiais", icon: Hammer, filter: (item: EnhancedInventoryItem) => item.type === 'resource' && !isConsumable(item.item) },
  equipment: { name: "Equipamentos", icon: Shirt, filter: (item: EnhancedInventoryItem) => item.type === 'equipment' },
  weapons: { name: "Armas", icon: Sword, filter: (item: EnhancedInventoryItem) => item.type === 'equipment' && (item.item as Equipment).type === 'weapon' },
  tools: { name: "Ferramentas", icon: Hammer, filter: (item: EnhancedInventoryItem) => item.type === 'equipment' && (item.item as Equipment).type === 'tool' }
};

export default function UnifiedInventory({
  playerId,
  resources,
  equipment,
  player,
  isBlocked = false
}: UnifiedInventoryProps) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState<EnhancedInventoryItem | null>(null);
  const [showItemModal, setShowItemModal] = useState(false);
  const [showEquipmentModal, setShowEquipmentModal] = useState(false);
  const [selectedEquipmentSlot, setSelectedEquipmentSlot] = useState<{
    id: string;
    name: string;
    equipped: string | null;
  } | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const inventoryManager = useInventoryManager(playerId, resources, equipment, player);
  const { invalidateInventoryData } = useInventoryUpdates(playerId);

  // Consume item mutation
  const consumeMutation = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: string; quantity: number }) => {
      const response = await fetch('/api/v2/consume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, itemId, quantity }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Erro no servidor" }));
        throw new Error(errorData.message || `Erro HTTP ${response.status}`);
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Item Consumido!",
        description: data.message || "Item consumido com sucesso!",
      });
      invalidateInventoryData();
      queryClient.invalidateQueries({ queryKey: ["/api/storage"] });
      queryClient.invalidateQueries({ queryKey: ["/api/player"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao Consumir Item",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Equipment slots
  const equipmentSlots = [
    { 
      id: "helmet", 
      name: "Capacete", 
      emoji: "🪖", 
      equipped: player.equippedHelmet
    },
    { 
      id: "chestplate", 
      name: "Peitoral", 
      emoji: "🦺", 
      equipped: player.equippedChestplate
    },
    { 
      id: "leggings", 
      name: "Calças", 
      emoji: "👖", 
      equipped: player.equippedLeggings
    },
    { 
      id: "boots", 
      name: "Botas", 
      emoji: "🥾", 
      equipped: player.equippedBoots
    },
    { 
      id: "weapon", 
      name: "Arma", 
      emoji: "⚔️", 
      equipped: player.equippedWeapon
    },
    { 
      id: "tool", 
      name: "Ferramenta", 
      emoji: "🔧", 
      equipped: player.equippedTool
    }
  ];

  // Filter and search items
  const filteredItems = useMemo(() => {
    let items = inventoryManager.enhancedInventory;
    
    // Apply category filter
    if (activeCategory !== "all") {
      const categoryFilter = ITEM_CATEGORIES[activeCategory as keyof typeof ITEM_CATEGORIES]?.filter;
      if (categoryFilter) {
        items = items.filter(categoryFilter);
      }
    }
    
    // Apply search filter
    if (searchTerm) {
      items = items.filter(item => 
        item.item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.item.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return items;
  }, [inventoryManager.enhancedInventory, activeCategory, searchTerm]);

  const handleItemClick = (item: EnhancedInventoryItem) => {
    setSelectedItem(item);
    setShowItemModal(true);
  };

  const handleConsumeItem = (itemId: string, quantity: number = 1) => {
    consumeMutation.mutate({ itemId, quantity });
  };

  const handleEquipmentSlotClick = (slot: typeof equipmentSlots[0]) => {
    setSelectedEquipmentSlot(slot);
    setShowEquipmentModal(true);
  };

  const getItemRarityColor = (item: EnhancedInventoryItem) => {
    if (item.type === 'equipment') {
      const eq = item.item as Equipment;
      switch (eq.rarity) {
        case 'legendary': return 'border-yellow-400 bg-yellow-50';
        case 'epic': return 'border-purple-400 bg-purple-50';
        case 'rare': return 'border-blue-400 bg-blue-50';
        case 'uncommon': return 'border-green-400 bg-green-50';
        default: return 'border-gray-200 bg-gray-50';
      }
    }
    return 'border-gray-200 bg-white';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Package className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-bold">Inventário Unificado</h2>
        </div>
        <Badge variant="outline">
          {filteredItems.length} / {inventoryManager.enhancedInventory.length} itens
        </Badge>
      </div>

      {/* Equipment Slots */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shirt className="w-5 h-5" />
            <span>Equipamentos</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {equipmentSlots.map((slot) => {
              const equippedItem = slot.equipped ? equipment.find(eq => eq.id === slot.equipped) : null;
              
              return (
                <div
                  key={slot.id}
                  className="flex flex-col items-center space-y-2 p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 cursor-pointer transition-colors"
                  onClick={() => handleEquipmentSlotClick(slot)}
                >
                  <span className="text-2xl">{slot.emoji}</span>
                  <span className="text-xs font-medium text-center">{slot.name}</span>
                  {equippedItem && (
                    <div className="text-center">
                      <span className="text-xs font-medium text-green-600">{equippedItem.name}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Search className="w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar itens..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
        </div>

        <Tabs value={activeCategory} onValueChange={setActiveCategory}>
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-6">
            {Object.entries(ITEM_CATEGORIES).map(([key, category]) => (
              <TabsTrigger key={key} value={key} className="flex items-center space-x-1">
                <category.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{category.name}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => (
          <Card 
            key={`${item.type}-${item.item.id}`} 
            className={`cursor-pointer hover:shadow-md transition-all ${getItemRarityColor(item)}`}
            onClick={() => handleItemClick(item)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <span className="text-2xl flex-shrink-0">{item.item.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold truncate">{item.item.name}</h4>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {item.item.description}
                    </p>
                    {isConsumable(item.item) && (
                      <p className="text-xs text-green-600 mt-1">
                        {getConsumableDescription(item.item)}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-1 flex-shrink-0">
                  <Badge variant="secondary">
                    {item.quantity}x
                  </Badge>
                  {item.type === 'equipment' && (
                    <Badge variant="outline" className="text-xs">
                      {(item.item as Equipment).rarity}
                    </Badge>
                  )}
                </div>
              </div>

              {isConsumable(item.item) && (
                <div className="mt-3">
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleConsumeItem(item.item.id);
                    }}
                    disabled={isBlocked || consumeMutation.isPending}
                    className="w-full"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Consumir
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">Nenhum item encontrado</h3>
            <p className="text-gray-500">
              {searchTerm ? "Tente ajustar sua busca" : "Explore o mundo para encontrar itens!"}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      {selectedItem && (
        <EnhancedItemModal
          item={selectedItem}
          isOpen={showItemModal}
          onClose={() => setShowItemModal(false)}
          playerId={playerId}
          isBlocked={isBlocked}
        />
      )}

      {selectedEquipmentSlot && (
        <EquipmentSelectorModal
          isOpen={showEquipmentModal}
          onClose={() => setShowEquipmentModal(false)}
          slotInfo={selectedEquipmentSlot}
          equipment={equipment}
          playerId={playerId}
          player={player}
        />
      )}
    </div>
  );
}
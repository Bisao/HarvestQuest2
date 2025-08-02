// Enhanced Item Modal - Detailed item information modal inspired by RPG item cards
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useQueryClient } from "@tanstack/react-query";
import { isConsumable, getConsumableEffects } from "@shared/utils/consumable-utils";
import type { Resource, Equipment, Player } from "@shared/types";

interface InventoryItem {
  id: string;
  resourceId: string;
  quantity: number;
}

interface StorageItem {
  id: string;
  resourceId: string;
  quantity: number;
  itemType?: 'resource' | 'equipment';
}

interface EnhancedItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: InventoryItem | StorageItem | null;
  itemData: (Resource | Equipment) | null;
  playerId: string;
  player: Player;
  location: 'inventory' | 'storage';
}

// Rarity configurations with colors and effects
const RARITY_CONFIG = {
  common: { 
    label: 'Comum', 
    bg: 'bg-gray-100', 
    border: 'border-gray-300', 
    text: 'text-gray-700',
    stars: 1,
    gradient: 'from-gray-400 to-gray-600'
  },
  uncommon: { 
    label: 'Incomum', 
    bg: 'bg-green-100', 
    border: 'border-green-300', 
    text: 'text-green-700',
    stars: 2,
    gradient: 'from-green-400 to-green-600'
  },
  rare: { 
    label: 'Raro', 
    bg: 'bg-blue-100', 
    border: 'border-blue-300', 
    text: 'text-blue-700',
    stars: 3,
    gradient: 'from-blue-400 to-blue-600'
  },
  epic: { 
    label: 'Épico', 
    bg: 'bg-purple-100', 
    border: 'border-purple-300', 
    text: 'text-purple-700',
    stars: 4,
    gradient: 'from-purple-400 to-purple-600'
  },
  legendary: { 
    label: 'Lendário', 
    bg: 'bg-orange-100', 
    border: 'border-orange-300', 
    text: 'text-orange-700',
    stars: 5,
    gradient: 'from-orange-400 to-orange-600'
  }
};

export function EnhancedItemModal({ 
  isOpen, 
  onClose, 
  item, 
  itemData, 
  playerId, 
  player,
  location
}: EnhancedItemModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [actionQuantity, setActionQuantity] = useState(1);

  // Get rarity configuration
  const rarity = (itemData as any)?.rarity || 'common';
  const rarityConfig = RARITY_CONFIG[rarity as keyof typeof RARITY_CONFIG] || RARITY_CONFIG.common;

  // Check if item is consumable
  const itemIsConsumable = itemData ? isConsumable(itemData) : false;
  const consumableEffects = itemData ? getConsumableEffects(itemData) : null;

  // Determine available actions based on location
  const canConsume = itemIsConsumable;
  const canMoveToStorage = location === 'inventory';
  const canMoveToInventory = location === 'storage';

  const moveToStorageMutation = useMutation({
    mutationFn: async () => {
      if (!item) throw new Error("Item não encontrado");

      const response = await apiRequest('POST', `/api/storage/store/${item.id}`, {
        playerId,
        quantity: actionQuantity
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory", playerId] });
      queryClient.invalidateQueries({ queryKey: ["/api/storage", playerId] });
      queryClient.invalidateQueries({ queryKey: ["/api/player", playerId] });
      onClose();
      toast({
        title: "Item movido",
        description: `${actionQuantity}x ${itemData?.name} transferido para o armazém.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível mover o item.",
        variant: "destructive"
      });
    }
  });

  const withdrawFromStorageMutation = useMutation({
    mutationFn: async () => {
      if (!item) throw new Error("Item não encontrado");

      const response = await apiRequest('POST', `/api/storage/withdraw/${item.id}`, {
        playerId,
        quantity: actionQuantity
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory", playerId] });
      queryClient.invalidateQueries({ queryKey: ["/api/storage", playerId] });
      queryClient.invalidateQueries({ queryKey: ["/api/player", playerId] });
      onClose();
      toast({
        title: "Item retirado",
        description: `${actionQuantity}x ${itemData?.name} movido para o inventário.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível retirar o item.",
        variant: "destructive"
      });
    }
  });

  const consumeMutation = useMutation({
    mutationFn: async () => {
      if (!item) throw new Error("Item não encontrado");
      if (!itemData) throw new Error("Dados do item não encontrados");

      const effects = getConsumableEffects(itemData);

      const response = await apiRequest('POST', `/api/player/${playerId}/consume`, {
        itemId: item.resourceId,
        inventoryItemId: item.id,
        quantity: actionQuantity,
        location,
        hungerRestore: effects.hungerRestore,
        thirstRestore: effects.thirstRestore
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Falha ao consumir item');
      }

      return response.json();
    },
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ["/api/inventory", playerId] });
      await queryClient.invalidateQueries({ queryKey: ["/api/storage", playerId] });
      await queryClient.invalidateQueries({ queryKey: [`/api/player/${playerId}`] });

      setActionQuantity(1);
      onClose();

      const hungerGain = data.hungerRestored || 0;
      const thirstGain = data.thirstRestored || 0;

      toast({
        title: "Item Consumido!",
        description: `${actionQuantity}x ${itemData?.name}${
          hungerGain > 0 || thirstGain > 0 ? 
          ` • Fome: +${hungerGain} • Sede: +${thirstGain}` : 
          ''
        }`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Falha ao consumir item.",
        variant: "destructive",
      });
    },
  });

  if (!item || !itemData) {
    return null;
  }

  const maxActionQuantity = item.quantity;

  // Check if item is equipment
  const isEquipment = 'slot' in itemData;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[480px] max-w-lg p-0 overflow-hidden">
        {/* Header with gradient background */}
        <div className={`bg-gradient-to-r ${rarityConfig.gradient} text-white p-6 relative overflow-hidden`}>
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12"></div>
          
          <DialogHeader className="relative z-10">
            <div className="flex items-center space-x-4">
              <div className="text-6xl drop-shadow-lg">
                {itemData.emoji || "❓"}
              </div>
              <div className="flex-1">
                <DialogTitle className="text-2xl font-bold text-white mb-2">
                  {itemData.name}
                </DialogTitle>
                
                {/* Rarity Badge with Stars */}
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                    {rarityConfig.label}
                  </Badge>
                  <div className="flex text-yellow-300">
                    {Array.from({ length: rarityConfig.stars }).map((_, i) => (
                      <span key={i} className="text-lg">★</span>
                    ))}
                    {Array.from({ length: 5 - rarityConfig.stars }).map((_, i) => (
                      <span key={i} className="text-lg opacity-30">☆</span>
                    ))}
                  </div>
                </div>

                {/* Item Type */}
                <div className="text-sm opacity-90 mt-1">
                  {isEquipment ? `Equipamento • ${(itemData as Equipment).slot}` : 
                   `Recurso • ${(itemData as Resource).category}`}
                </div>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="p-6 space-y-6">
          {/* Item Description & Stats */}
          <div className="space-y-4">
            {/* Basic Info Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className={`p-4 rounded-lg ${rarityConfig.bg} ${rarityConfig.border} border`}>
                <div className="text-sm text-gray-600 mb-1">Quantidade Possuída</div>
                <div className="text-2xl font-bold">{item.quantity.toLocaleString()}</div>
              </div>
              
              <div className={`p-4 rounded-lg ${rarityConfig.bg} ${rarityConfig.border} border`}>
                <div className="text-sm text-gray-600 mb-1">Valor Total</div>
                <div className="text-2xl font-bold text-green-600">
                  {((itemData.sellPrice || itemData.value || 0) * item.quantity).toLocaleString()}
                  <span className="text-sm font-normal ml-1">moedas</span>
                </div>
              </div>
            </div>

            {/* Detailed Stats */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-gray-800 mb-3">Informações Detalhadas</h3>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Peso unitário:</span>
                  <span className="font-medium">
                    {itemData.weight >= 1000 ? 
                      `${(itemData.weight / 1000).toFixed(2)}kg` : 
                      `${itemData.weight.toFixed(2)}g`}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Peso total:</span>
                  <span className="font-medium">
                    {(() => {
                      const totalWeight = itemData.weight * item.quantity;
                      return totalWeight >= 1000 ? 
                        `${(totalWeight / 1000).toFixed(2)}kg` : 
                        `${totalWeight.toFixed(2)}g`;
                    })()}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Valor unitário:</span>
                  <span className="font-medium text-green-600">
                    {(itemData.sellPrice || itemData.value || 0).toLocaleString()} moedas
                  </span>
                </div>

                {isEquipment && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Durabilidade:</span>
                      <span className="font-medium">
                        {(itemData as Equipment).attributes?.durability || 100}%
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Eficiência:</span>
                      <span className="font-medium">
                        {(itemData as Equipment).attributes?.efficiency || 100}%
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Consumable Effects */}
            {itemIsConsumable && consumableEffects && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 mb-3 flex items-center">
                  <span className="mr-2">🍃</span>
                  Efeitos de Consumo
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {consumableEffects.hungerRestore > 0 && (
                    <div className="flex items-center justify-between bg-white rounded p-2">
                      <span className="text-gray-600 flex items-center">
                        <span className="mr-2">🍖</span>Restaura Fome
                      </span>
                      <span className="font-bold text-green-600">+{consumableEffects.hungerRestore}</span>
                    </div>
                  )}
                  {consumableEffects.thirstRestore > 0 && (
                    <div className="flex items-center justify-between bg-white rounded p-2">
                      <span className="text-gray-600 flex items-center">
                        <span className="mr-2">💧</span>Restaura Sede
                      </span>
                      <span className="font-bold text-blue-600">+{consumableEffects.thirstRestore}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Actions Section */}
          <div className="space-y-4">
            <div className="border-t pt-4">
              <h3 className="font-semibold text-gray-800 mb-4">Ações Disponíveis</h3>
              
              {/* Quantity Slider */}
              <div className="space-y-3 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Quantidade: {actionQuantity}</span>
                  <span className="text-xs text-gray-500">Max: {maxActionQuantity}</span>
                </div>
                <Slider
                  min={1}
                  max={maxActionQuantity}
                  step={1}
                  value={[actionQuantity]}
                  onValueChange={(value) => setActionQuantity(value[0])}
                  className="w-full"
                />
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 gap-3">
                {/* Consume Action */}
                {canConsume && (
                  <Button 
                    onClick={() => consumeMutation.mutate()}
                    disabled={consumeMutation.isPending}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    {consumeMutation.isPending ? 
                      "Consumindo..." : 
                      `🍃 Consumir ${actionQuantity}x`
                    }
                  </Button>
                )}

                {/* Move to Storage */}
                {canMoveToStorage && (
                  <Button 
                    onClick={() => moveToStorageMutation.mutate()}
                    disabled={moveToStorageMutation.isPending}
                    variant="outline"
                    className="w-full"
                  >
                    {moveToStorageMutation.isPending ? 
                      "Movendo..." : 
                      `📦 Mover ${actionQuantity}x para Armazém`
                    }
                  </Button>
                )}

                {/* Move to Inventory */}
                {canMoveToInventory && (
                  <Button 
                    onClick={() => withdrawFromStorageMutation.mutate()}
                    disabled={withdrawFromStorageMutation.isPending}
                    variant="outline"
                    className="w-full"
                  >
                    {withdrawFromStorageMutation.isPending ? 
                      "Retirando..." : 
                      `🎒 Retirar ${actionQuantity}x para Inventário`
                    }
                  </Button>
                )}
              </div>

              {/* Quick Actions */}
              <div className="flex space-x-2 mt-3">
                {canConsume && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setActionQuantity(1);
                      consumeMutation.mutate();
                    }}
                    disabled={consumeMutation.isPending}
                    className="flex-1"
                  >
                    Consumir 1
                  </Button>
                )}
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setActionQuantity(item.quantity);
                    if (canMoveToStorage) {
                      moveToStorageMutation.mutate();
                    } else if (canMoveToInventory) {
                      withdrawFromStorageMutation.mutate();
                    }
                  }}
                  disabled={moveToStorageMutation.isPending || withdrawFromStorageMutation.isPending}
                  className="flex-1"
                >
                  {location === 'inventory' ? 'Mover Tudo' : 'Retirar Tudo'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
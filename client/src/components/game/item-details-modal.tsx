// Item Details Modal - Shows detailed information about an inventory item
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

interface ItemDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: InventoryItem | null;
  itemData: (Resource | Equipment) | null;
  playerId: string;
  player: Player;
}

export function ItemDetailsModal({ 
  isOpen, 
  onClose, 
  item, 
  itemData, 
  playerId, 
  player 
}: ItemDetailsModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [moveQuantity, setMoveQuantity] = useState(1);
  const [consumeQuantity, setConsumeQuantity] = useState(1);

  console.log("[ITEM_MODAL] Modal state:", { 
    isOpen, 
    hasItem: !!item, 
    hasItemData: !!itemData,
    itemId: item?.id,
    itemResourceId: item?.resourceId
  });

  // Check if item is consumable
  const itemIsConsumable = itemData ? isConsumable(itemData) : false;
  const consumableEffects = itemData ? getConsumableEffects(itemData) : null;

  const moveToStorageMutation = useMutation({
    mutationFn: async () => {
      if (!item) throw new Error("Item não encontrado");

      const response = await apiRequest('POST', `/api/storage/store/${item.id}`, {
        playerId,
        quantity: moveQuantity
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
        description: `${moveQuantity}x ${itemData?.name} transferido para o armazém.`,
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

  const consumeMutation = useMutation({
    mutationFn: async () => {
      if (!item) throw new Error("Item não encontrado");
      if (!itemData) throw new Error("Dados do item não encontrados");

      const effects = getConsumableEffects(itemData);

      const response = await apiRequest('POST', `/api/player/${playerId}/consume`, {
        itemId: item.resourceId,
        inventoryItemId: item.id,
        quantity: consumeQuantity,
        location: 'inventory',
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
      // Force refresh all related queries with correct keys
      await queryClient.invalidateQueries({ queryKey: ["/api/inventory", playerId] });
      await queryClient.invalidateQueries({ queryKey: ["/api/storage", playerId] });
      await queryClient.invalidateQueries({ queryKey: [`/api/player/${playerId}`] });

      // Force immediate refetch
      await queryClient.refetchQueries({ queryKey: [`/api/player/${playerId}`] });
      await queryClient.refetchQueries({ queryKey: ["/api/inventory", playerId] });

      // Reset consume quantity and close modal
      setConsumeQuantity(1);
      onClose();

      const hungerGain = data.hungerRestored || 0;
      const thirstGain = data.thirstRestored || 0;

      toast({
        title: "✅ Item Consumido!",
        description: `${consumeQuantity}x ${itemData?.name}${
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

  if (!item) {
    console.log("[ITEM_MODAL] No item provided, not rendering modal");
    return null;
  }

  if (!itemData) {
    console.log("[ITEM_MODAL] No item data provided for item:", item);
    // Still render modal but show error message
  }

  const maxMoveQuantity = item.quantity;
  const maxConsumeQuantity = item.quantity;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-96 max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-center flex items-center justify-center space-x-2">
            <span className="text-3xl">{itemData?.emoji || "❓"}</span>
            <span>{itemData?.name || "Item Desconhecido"}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!itemData && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 text-sm">
                ⚠️ Dados do item não encontrados. ID do recurso: {item.resourceId}
              </p>
            </div>
          )}
          
          {/* Item Information */}
          {itemData && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Quantidade:</span>
                <span className="font-semibold">{item.quantity}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Peso unitário:</span>
                <span className="font-semibold">
                  {itemData.weight >= 1000 ? `${(itemData.weight / 1000).toFixed(2)}kg` : `${itemData.weight.toFixed(2)}g`}
                </span>
              </div>

            <div className="flex justify-between">
                <span className="text-gray-600">Peso total:</span>
                <span className="font-semibold">
                  {(() => {
                    const totalWeight = itemData.weight * item.quantity;
                    return totalWeight >= 1000 ? `${(totalWeight / 1000).toFixed(2)}kg` : `${totalWeight.toFixed(2)}g`;
                  })()}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Valor unitário:</span>
                <span className="font-semibold">{itemData.sellPrice || itemData.value || 0} moedas</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Valor total:</span>
                <span className="font-semibold">{(itemData.sellPrice || itemData.value || 0) * item.quantity} moedas</span>
              </div>

              {/* Consumable Effects */}
              {itemIsConsumable && consumableEffects && (
                <div className="border-t pt-2 mt-2">
                  <div className="text-sm font-medium text-green-700 mb-1">Efeitos de Consumo:</div>
                  {consumableEffects.hungerRestore > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Restaura Fome:</span>
                      <span className="text-green-600">+{consumableEffects.hungerRestore}</span>
                    </div>
                  )}
                  {consumableEffects.thirstRestore > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Restaura Sede:</span>
                      <span className="text-blue-600">+{consumableEffects.thirstRestore}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            {/* Consume Action */}
            {itemIsConsumable && (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="consume-quantity">Consumir: {consumeQuantity}</Label>
                  <Slider
                    id="consume-quantity"
                    min={1}
                    max={maxConsumeQuantity}
                    step={1}
                    value={[consumeQuantity]}
                    onValueChange={(value) => setConsumeQuantity(value[0])}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>1</span>
                    <span>{maxConsumeQuantity}</span>
                  </div>
                </div>
                <Button 
                  onClick={() => consumeMutation.mutate()}
                  disabled={consumeMutation.isPending || consumeQuantity > maxConsumeQuantity}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {consumeMutation.isPending ? "Consumindo..." : `Consumir ${consumeQuantity}x`}
                </Button>
              </div>
            )}

            {/* Move to Storage Action */}
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="move-quantity">Mover para Armazém: {moveQuantity}</Label>
                <Slider
                  id="move-quantity"
                  min={1}
                  max={maxMoveQuantity}
                  step={1}
                  value={[moveQuantity]}
                  onValueChange={(value) => setMoveQuantity(value[0])}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>1</span>
                  <span>{maxMoveQuantity}</span>
                </div>
              </div>
              <Button 
                onClick={() => moveToStorageMutation.mutate()}
                disabled={moveToStorageMutation.isPending || moveQuantity > maxMoveQuantity}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {moveToStorageMutation.isPending ? "Movendo..." : `→ Armazém ${moveQuantity}x`}
              </Button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex space-x-2 pt-2 border-t">
            {itemIsConsumable && (
              <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                if (item && itemData && isConsumable(itemData)) {
                  setConsumeQuantity(1);
                  consumeMutation.mutate();
                }
              }}
              disabled={consumeMutation.isPending || !itemIsConsumable}
              className="flex-1"
            >
              {consumeMutation.isPending ? "..." : "Consumir 1"}
            </Button>
            )}
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                if (item) {
                  setMoveQuantity(item.quantity);
                  moveToStorageMutation.mutate();
                }
              }}
              disabled={moveToStorageMutation.isPending}
              className="flex-1"
            >
              {moveToStorageMutation.isPending ? "..." : "Mover Tudo"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
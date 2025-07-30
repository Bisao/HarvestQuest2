// Item Details Modal - Shows detailed information about an inventory item
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
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
  const [moveQuantity, setMoveQuantity] = useState(1);
  const [consumeQuantity, setConsumeQuantity] = useState(1);

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
      queryClient.invalidateQueries({ queryKey: ["/api/player/Player1"] });
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
      
      const response = await apiRequest('POST', `/api/player/${playerId}/consume`, {
        itemId: item.id,
        quantity: consumeQuantity
      });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory", playerId] });
      queryClient.invalidateQueries({ queryKey: ["/api/storage", playerId] });
      queryClient.invalidateQueries({ queryKey: ["/api/player/Player1"] });
      onClose();
      toast({
        title: "Item consumido",
        description: data.hungerRestored || data.thirstRestored ? 
          `Fome: +${data.hungerRestored || 0} | Sede: +${data.thirstRestored || 0}` :
          `${consumeQuantity}x ${itemData?.name} consumido com sucesso.`,
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

  if (!item || !itemData) return null;

  const maxMoveQuantity = item.quantity;
  const maxConsumeQuantity = item.quantity;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-96 max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-center flex items-center justify-center space-x-2">
            <span className="text-3xl">{itemData.emoji}</span>
            <span>{itemData.name}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Item Information */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Quantidade:</span>
              <span className="font-semibold">{item.quantity}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Peso unitário:</span>
              <span className="font-semibold">{itemData.weight}kg</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Peso total:</span>
              <span className="font-semibold">{(itemData.weight * item.quantity).toFixed(1)}kg</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Valor unitário:</span>
              <span className="font-semibold">{itemData.value} moedas</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Valor total:</span>
              <span className="font-semibold">{itemData.value * item.quantity} moedas</span>
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

          {/* Actions */}
          <div className="space-y-3">
            {/* Consume Action */}
            {itemIsConsumable && (
              <div className="space-y-2">
                <Label htmlFor="consume-quantity">Consumir</Label>
                <div className="flex space-x-2">
                  <Input
                    id="consume-quantity"
                    type="number"
                    min="1"
                    max={maxConsumeQuantity}
                    value={consumeQuantity}
                    onChange={(e) => setConsumeQuantity(Math.min(Math.max(1, parseInt(e.target.value) || 1), maxConsumeQuantity))}
                    className="flex-1"
                  />
                  <Button 
                    onClick={() => consumeMutation.mutate()}
                    disabled={consumeMutation.isPending || consumeQuantity > maxConsumeQuantity}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {consumeMutation.isPending ? "Consumindo..." : "Consumir"}
                  </Button>
                </div>
              </div>
            )}

            {/* Move to Storage Action */}
            <div className="space-y-2">
              <Label htmlFor="move-quantity">Mover para Armazém</Label>
              <div className="flex space-x-2">
                <Input
                  id="move-quantity"
                  type="number"
                  min="1"
                  max={maxMoveQuantity}
                  value={moveQuantity}
                  onChange={(e) => setMoveQuantity(Math.min(Math.max(1, parseInt(e.target.value) || 1), maxMoveQuantity))}
                  className="flex-1"
                />
                <Button 
                  onClick={() => moveToStorageMutation.mutate()}
                  disabled={moveToStorageMutation.isPending || moveQuantity > maxMoveQuantity}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {moveToStorageMutation.isPending ? "Movendo..." : "→ Armazém"}
                </Button>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex space-x-2 pt-2 border-t">
            {itemIsConsumable && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setConsumeQuantity(1);
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
                setMoveQuantity(item.quantity);
                moveToStorageMutation.mutate();
              }}
              disabled={moveToStorageMutation.isPending}
              className="flex-1"
            >
              Mover Tudo
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
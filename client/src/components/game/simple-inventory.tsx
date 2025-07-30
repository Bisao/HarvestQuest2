import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { isConsumable, getConsumableDescription } from "@shared/utils/consumable-utils";
import type { Resource, Equipment, Player } from "@shared/types";

interface InventoryItem {
  id: string;
  resourceId: string;
  quantity: number;
}

interface SimpleInventoryProps {
  playerId: string;
  resources: Resource[];
  equipment: Equipment[];
  player: Player;
  isBlocked?: boolean;
}

export default function SimpleInventory({
  playerId,
  resources,
  equipment,
  player,
  isBlocked = false
}: SimpleInventoryProps) {
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const { toast } = useToast();

  const { data: inventoryData = [] } = useQuery<InventoryItem[]>({
    queryKey: ["/api/inventory", playerId],
  });

  // Helper functions to get items by ID
  const getResourceById = (resourceId: string) => {
    return resources.find(r => r.id === resourceId);
  };
  
  const getItemById = (itemId: string) => {
    return resources.find(r => r.id === itemId) || equipment.find(e => e.id === itemId);
  };

  // Filter out water from inventory since it goes to special compartment
  const inventory = inventoryData.filter(item => {
    const resource = getResourceById(item.resourceId);
    return resource && resource.name !== "Água Fresca";
  });

  // Main inventory: 9x4 grid (36 slots)
  const inventoryRows = 4;
  const inventoryCols = 9;
  const totalSlots = inventoryRows * inventoryCols;

  const storeAllMutation = useMutation({
    mutationFn: () => apiRequest("POST", `/api/storage/store-all/${playerId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory", playerId] });
      queryClient.invalidateQueries({ queryKey: ["/api/storage", playerId] });
      queryClient.invalidateQueries({ queryKey: ["/api/player/Player1"] });
      toast({
        title: "Sucesso!",
        description: "Todos os itens foram armazenados.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao armazenar itens.",
        variant: "destructive",
      });
    },
  });

  const moveToStorageMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const item = inventory.find(i => i.id === itemId);
      if (!item) throw new Error("Item não encontrado");
      
      const response = await apiRequest('POST', `/api/storage/store/${itemId}`, {
        playerId,
        quantity: item.quantity
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory", playerId] });
      queryClient.invalidateQueries({ queryKey: ["/api/storage", playerId] });
      queryClient.invalidateQueries({ queryKey: ["/api/player/Player1"] });
      setSelectedItem(null);
      toast({
        title: "Item movido!",
        description: "Item transferido para o armazém.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao mover item.",
        variant: "destructive",
      });
    },
  });

  const consumeMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const response = await apiRequest('POST', `/api/player/${playerId}/consume`, {
        itemId,
        quantity: 1
      });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory", playerId] });
      queryClient.invalidateQueries({ queryKey: ["/api/storage", playerId] });
      queryClient.invalidateQueries({ queryKey: ["/api/player/Player1"] });
      setSelectedItem(null);
      toast({
        title: "Item consumido!",
        description: data.hungerRestored || data.thirstRestored ? 
          `Fome: +${data.hungerRestored || 0} | Sede: +${data.thirstRestored || 0}` :
          "Item foi consumido com sucesso.",
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

  const renderInventorySlot = (slotIndex: number) => {
    const item = inventory[slotIndex];
    const isSelected = selectedItem?.id === item?.id;
    
    return (
      <div
        key={slotIndex}
        className={`aspect-square border-2 rounded-lg flex flex-col items-center justify-center p-1 cursor-pointer transition-all relative ${
          item 
            ? isSelected 
              ? "border-blue-500 bg-blue-50 shadow-md" 
              : "border-gray-300 bg-white hover:border-gray-400 hover:shadow-sm"
            : "border-gray-200 bg-gray-50"
        }`}
        onClick={() => {
          if (item) {
            setSelectedItem(isSelected ? null : item);
          }
        }}
      >
        {item && (
          <>
            <span className="text-lg md:text-xl">{getItemById(item.resourceId)?.emoji}</span>
            <span className="text-xs font-semibold text-gray-700 absolute bottom-0 right-0 bg-white rounded-tl px-1">
              {item.quantity}
            </span>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Main Inventory */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>🎒</span>
              Inventário Principal
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => storeAllMutation.mutate()}
              disabled={inventory.length === 0 || isBlocked || storeAllMutation.isPending}
            >
              📦 Guardar Tudo
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Storage Capacity Bar */}
          <div className="mb-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-amber-800">Capacidade de Armazenamento</span>
              <span className="text-sm text-amber-700">{Math.round((player.inventoryWeight / player.maxInventoryWeight) * 100)}%</span>
            </div>
            <div className="w-full bg-amber-200 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-amber-400 to-amber-600 h-full transition-all duration-300"
                style={{ width: `${Math.min((player.inventoryWeight / player.maxInventoryWeight) * 100, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-amber-600 mt-1">
              <span>{player.inventoryWeight}kg</span>
              <span>{player.maxInventoryWeight}kg</span>
            </div>
          </div>
          
          {/* Inventory Grid */}
          <div className="grid grid-cols-6 md:grid-cols-9 gap-1 md:gap-2 mb-4">
            {Array.from({ length: totalSlots }, (_, i) => renderInventorySlot(i))}
          </div>

          {/* Item Details Panel */}
          {selectedItem && (
            <Card className="bg-gray-50">
              <CardContent className="pt-4">
                {(() => {
                  const itemData = getItemById(selectedItem.resourceId);
                  if (itemData) {
                    const isResource = 'rarity' in itemData;
                    const isEquipment = 'slot' in itemData;
                    return (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{itemData.emoji}</span>
                          <div>
                            <h4 className="font-semibold text-lg">{itemData.name}</h4>
                            <p className="text-sm text-gray-600">
                              Quantidade: {selectedItem.quantity} • Peso total: {itemData.weight * selectedItem.quantity}kg
                            </p>
                            {isResource && 'value' in itemData && (
                              <p className="text-sm text-gray-600">
                                Valor unitário: {itemData.value} moedas
                              </p>
                            )}
                            <div className="flex gap-2 mt-2">
                              {isResource && 'rarity' in itemData && (
                                <Badge variant={
                                  itemData.rarity === "rare" ? "destructive" : 
                                  itemData.rarity === "uncommon" ? "secondary" : "outline"
                                }>
                                  {itemData.rarity === "common" ? "Comum" : 
                                   itemData.rarity === "uncommon" ? "Incomum" : "Raro"}
                                </Badge>
                              )}
                              {isResource && 'type' in itemData && (
                                <Badge variant="outline">
                                  {itemData.type === "basic" ? "Básico" : "Único"}
                                </Badge>
                              )}
                              {isEquipment && (
                                <Badge variant="secondary">
                                  Equipamento
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          {/* Show consume button for consumable items */}
                          {itemData && isConsumable(itemData) && (
                            <div className="space-y-1">
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => consumeMutation.mutate(selectedItem.id)}
                                disabled={consumeMutation.isPending || isBlocked}
                                className="bg-green-600 hover:bg-green-700 w-full"
                                data-testid="button-consume-item"
                              >
                                {consumeMutation.isPending ? "Consumindo..." : "🍽️ Consumir"}
                              </Button>
                              <p className="text-xs text-gray-600 text-center">
                                {getConsumableDescription(itemData)}
                              </p>
                            </div>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => moveToStorageMutation.mutate(selectedItem.id)}
                            disabled={moveToStorageMutation.isPending || isBlocked}
                          >
                            {moveToStorageMutation.isPending ? "Movendo..." : isBlocked ? "🚫 Bloqueado" : "→ Armazém"}
                          </Button>
                          <Button variant="outline" size="sm" disabled>
                            🗑️ Descartar
                          </Button>
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import type { StorageItem, Resource, Equipment } from "@shared/schema";

interface StorageTabProps {
  playerId: string;
  resources: Resource[];
  equipment: Equipment[];
  autoStorage: boolean;
  player: any;
  isBlocked?: boolean;
}

export default function StorageTab({ playerId, resources, equipment, autoStorage, player, isBlocked = false }: StorageTabProps) {
  const { toast } = useToast();
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<{ storageItemId: string; resourceId: string; name: string; available: number } | null>(null);
  const [withdrawAmount, setWithdrawAmount] = useState(1);

  const { data: storage = [] } = useQuery<StorageItem[]>({
    queryKey: ["/api/storage", playerId],
  });



  const withdrawMutation = useMutation({
    mutationFn: ({ storageItemId, quantity }: { storageItemId: string; quantity: number }) =>
      apiRequest("POST", "/api/storage/withdraw", { playerId, storageItemId, quantity }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/storage", playerId] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory", playerId] });
      queryClient.invalidateQueries({ queryKey: ["/api/player/Player1"] });
      setWithdrawDialogOpen(false);
      setWithdrawAmount(1);
      toast({
        title: "Sucesso!",
        description: "Itens retirados do armazém.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Falha ao retirar itens.",
        variant: "destructive",
      });
    },
  });

  const equipMutation = useMutation({
    mutationFn: async ({ equipmentId, slot }: { equipmentId: string; slot: string }) => {
      const response = await apiRequest('POST', '/api/player/equip', {
        playerId,
        equipmentId,
        slot
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/storage", playerId] });
      queryClient.invalidateQueries({ queryKey: ["/api/player/Player1"] });
      toast({
        title: "Item equipado!",
        description: "Equipamento foi equipado com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível equipar o item.",
        variant: "destructive",
      });
    },
  });

  const consumeMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const response = await apiRequest("POST", `/api/player/${playerId}/consume`, { itemId, quantity: 1 });
      return response.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/storage", playerId] });
      queryClient.invalidateQueries({ queryKey: ["/api/player/Player1"] });
      toast({
        title: "Item consumido!",
        description: `Fome: +${data.hungerRestored} | Sede: +${data.thirstRestored}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível consumir o item.",
        variant: "destructive",
      });
    },
  });

  const consumeWaterMutation = useMutation({
    mutationFn: async (quantity: number) => {
      const response = await apiRequest("POST", `/api/player/${playerId}/consume-water`, { quantity });
      return response.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/player/Player1"] });
      toast({
        title: "Água consumida!",
        description: `Sede: +${data.thirstRestored}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível consumir água.",
        variant: "destructive",
      });
    },
  });

  const getResourceData = (resourceId: string) => {
    return resources.find(r => r.id === resourceId);
  };

  const getEquipmentData = (equipmentId: string) => {
    return equipment.find(e => e.id === equipmentId);
  };

  const getItemData = (itemId: string) => {
    const resource = getResourceData(itemId);
    const equip = getEquipmentData(itemId);
    
    if (resource) {
      return {
        type: 'resource' as const,
        name: resource.name,
        emoji: resource.emoji,
        value: resource.value,
        rarity: resource.rarity,
        weight: resource.weight
      };
    }
    
    if (equip) {
      return {
        type: 'equipment' as const,
        name: equip.name,
        emoji: equip.emoji,
        value: 0, // Equipment doesn't have value for now
        rarity: 'common' as const,
        weight: equip.weight
      };
    }
    
    return null;
  };

  const getStorageStats = () => {
    const totalItems = storage.reduce((sum, item) => sum + item.quantity, 0);
    const totalValue = storage.reduce((sum, item) => {
      const itemData = getItemData(item.resourceId);
      return sum + (itemData ? itemData.value * item.quantity : 0);
    }, 0);
    const uniqueTypes = storage.length;

    return { totalItems, totalValue, uniqueTypes };
  };

  const handleWithdraw = (storageItem: StorageItem) => {
    const itemData = getItemData(storageItem.resourceId);
    if (!itemData) return;

    setSelectedResource({
      storageItemId: storageItem.id,
      resourceId: storageItem.resourceId,
      name: itemData.name,
      available: storageItem.quantity,
    });
    setWithdrawAmount(1);
    setWithdrawDialogOpen(true);
  };

  const confirmWithdraw = () => {
    if (!selectedResource) return;
    withdrawMutation.mutate({
      storageItemId: selectedResource.storageItemId,
      quantity: withdrawAmount,
    });
  };

  const getEquipmentSlot = (equipment: Equipment) => {
    // Map equipment slots to player equipment fields
    switch (equipment.slot) {
      case "helmet": return "helmet";
      case "chestplate": return "chestplate";
      case "leggings": return "leggings";
      case "boots": return "boots";
      case "weapon": return "weapon";
      case "tool": return "tool";
      default: return null;
    }
  };

  const handleEquip = (equipmentId: string) => {
    const equipmentItem = getEquipmentData(equipmentId);
    if (!equipmentItem) return;
    
    const slot = getEquipmentSlot(equipmentItem);
    if (!slot) return;
    
    equipMutation.mutate({ equipmentId, slot });
  };

  const isEquipped = (equipmentId: string) => {
    return player?.equippedHelmet === equipmentId ||
           player?.equippedChestplate === equipmentId ||
           player?.equippedLeggings === equipmentId ||
           player?.equippedBoots === equipmentId ||
           player?.equippedWeapon === equipmentId ||
           player?.equippedTool === equipmentId;
  };

  const stats = getStorageStats();

  return (
    <div>


      {/* Water Storage Compartment */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">💧</span>
            <div>
              <h3 className="font-semibold text-blue-800">Armazenamento de Água</h3>
              <p className="text-sm text-blue-600">Compartimento especial para água coletada</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">
                {player?.waterStorage || 0} / {player?.maxWaterStorage || 500}
              </div>
              <div className="text-xs text-blue-500">unidades de água</div>
            </div>
            {player?.waterStorage > 0 && (
              <button
                onClick={() => consumeWaterMutation.mutate(1)}
                disabled={consumeWaterMutation.isPending || isBlocked}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors disabled:bg-gray-400"
              >
                {consumeWaterMutation.isPending ? "Bebendo..." : "💧 Beber Água"}
              </button>
            )}
          </div>
        </div>
        {/* Water storage progress bar */}
        <div className="mt-3">
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${Math.min(((player?.waterStorage || 0) / (player?.maxWaterStorage || 500)) * 100, 100)}%` 
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* Storage Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {storage.filter(item => {
          const itemData = getItemData(item.resourceId);
          return itemData && itemData.name !== "Água Fresca"; // Don't show water in regular storage
        }).map((storageItem) => {
          const itemData = getItemData(storageItem.resourceId);
          if (!itemData) return null;

          return (
            <div
              key={storageItem.id}
              className="storage-item bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">{itemData.emoji}</span>
                  <div>
                    <h4 className="font-semibold text-gray-800">{itemData.name}</h4>
                    <p className="text-sm text-gray-500">
                      {itemData.type === "equipment" ? "Equipamento" : 
                       itemData.type === "resource" && itemData.rarity === "common" ? "Recurso básico" : "Recurso único"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${
                    itemData.type === "equipment" ? "text-purple-600" :
                    itemData.type === "resource" && itemData.rarity === "common" ? "text-green-600" : "text-blue-600"
                  }`}>
                    {storageItem.quantity}
                  </div>
                  <div className="text-xs text-gray-500">unidades</div>
                </div>
              </div>
              <div className="flex space-x-2">
                {/* Show consume button for food items */}
                {itemData.type === "resource" && (
                  itemData.name === "Frutas Silvestres" || 
                  itemData.name === "Cogumelos" || 
                  itemData.name === "Suco de Frutas" ||
                  itemData.name === "Cogumelos Assados" ||
                  itemData.name === "Peixe Grelhado" ||
                  itemData.name === "Carne Assada" ||
                  itemData.name === "Ensopado de Carne" ||
                  itemData.name === "Água Fresca"
                ) && (
                  <button
                    onClick={() => consumeMutation.mutate(storageItem.id)}
                    disabled={consumeMutation.isPending || isBlocked}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm font-medium transition-colors disabled:bg-gray-400"
                  >
                    {consumeMutation.isPending ? "Consumindo..." : "🍽️ Consumir"}
                  </button>
                )}
                {itemData.type === "equipment" ? (
                  <button
                    onClick={() => handleEquip(storageItem.resourceId)}
                    disabled={equipMutation.isPending || isBlocked}
                    className={`flex-1 font-medium py-2 px-3 rounded text-sm transition-colors ${
                      isEquipped(storageItem.resourceId)
                        ? "bg-blue-100 text-blue-700 cursor-not-allowed"
                        : "bg-purple-100 hover:bg-purple-200 text-purple-700"
                    }`}
                  >
                    {isEquipped(storageItem.resourceId) ? "✓ Equipado" : "⚔️ Equipar"}
                  </button>
                ) : (
                  <button
                    onClick={() => handleWithdraw(storageItem)}
                    className="flex-1 bg-green-100 hover:bg-green-200 text-green-700 font-medium py-2 px-3 rounded text-sm transition-colors"
                  >
                    ⬅️ Retirar
                  </button>
                )}
                <button
                  disabled
                  className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium py-2 px-3 rounded text-sm transition-colors cursor-not-allowed opacity-50"
                >
                  💰 Vender
                </button>
              </div>
            </div>
          );
        })}

        {/* Empty slot */}
        <div className="storage-item bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <div className="text-4xl text-gray-400 mb-2">📦</div>
          <p className="text-sm text-gray-500">Mais recursos em breve...</p>
        </div>
      </div>

      {/* Storage Statistics */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-semibold text-gray-800 mb-3">📊 Estatísticas do Armazém</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">{stats.totalItems}</div>
            <div className="text-sm text-gray-600">Total de Itens</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">{stats.totalValue.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Valor Total 💰</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">{stats.uniqueTypes}</div>
            <div className="text-sm text-gray-600">Tipos Únicos</div>
          </div>
        </div>
      </div>

      {/* Withdraw Dialog */}
      <Dialog open={withdrawDialogOpen} onOpenChange={setWithdrawDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Retirar {selectedResource?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Disponível: {selectedResource?.available} unidades</p>
            <div>
              <label className="text-sm font-medium">Quantidade:</label>
              <Input
                type="number"
                min={1}
                max={selectedResource?.available || 1}
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(parseInt(e.target.value) || 1)}
              />
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setWithdrawDialogOpen(false)}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmWithdraw}
                disabled={withdrawMutation.isPending}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Confirmar
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

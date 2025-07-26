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
}

export default function StorageTab({ playerId, resources, equipment, autoStorage }: StorageTabProps) {
  const { toast } = useToast();
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<{ id: string; name: string; available: number } | null>(null);
  const [withdrawAmount, setWithdrawAmount] = useState(1);

  const { data: storage = [] } = useQuery<StorageItem[]>({
    queryKey: ["/api/storage", playerId],
  });

  const updateAutoStorageMutation = useMutation({
    mutationFn: (autoStorageEnabled: boolean) => 
      apiRequest("PATCH", `/api/player/${playerId}/auto-storage`, { autoStorage: autoStorageEnabled }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/player/Player1"] });
      toast({
        title: "Configuração atualizada",
        description: `Armazenamento ${autoStorage ? "manual" : "automático"} ativado.`,
      });
    },
  });

  const withdrawMutation = useMutation({
    mutationFn: ({ resourceId, quantity }: { resourceId: string; quantity: number }) =>
      apiRequest("POST", "/api/storage/withdraw", { playerId, resourceId, quantity }),
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
      id: storageItem.resourceId,
      name: itemData.name,
      available: storageItem.quantity,
    });
    setWithdrawAmount(1);
    setWithdrawDialogOpen(true);
  };

  const confirmWithdraw = () => {
    if (!selectedResource) return;
    withdrawMutation.mutate({
      resourceId: selectedResource.id,
      quantity: withdrawAmount,
    });
  };

  const stats = getStorageStats();

  return (
    <div>
      {/* Storage Configuration */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">⚙️</span>
            <div>
              <h3 className="font-semibold text-blue-800">Configurações de Armazenamento</h3>
              <p className="text-sm text-blue-600">Escolha como gerenciar seus recursos</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="storage-mode"
                checked={!autoStorage}
                onChange={() => updateAutoStorageMutation.mutate(false)}
                className="text-blue-600"
              />
              <span className="text-sm font-medium">Manual</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="storage-mode"
                checked={autoStorage}
                onChange={() => updateAutoStorageMutation.mutate(true)}
                className="text-blue-600"
              />
              <span className="text-sm font-medium">Automático</span>
            </label>
          </div>
        </div>
      </div>

      {/* Storage Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {storage.map((storageItem) => {
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
                       itemData.type === "basic" ? "Recurso básico" : "Recurso único"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${
                    itemData.type === "equipment" ? "text-purple-600" :
                    itemData.type === "basic" ? "text-green-600" : "text-blue-600"
                  }`}>
                    {storageItem.quantity}
                  </div>
                  <div className="text-xs text-gray-500">unidades</div>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleWithdraw(storageItem)}
                  className="flex-1 bg-green-100 hover:bg-green-200 text-green-700 font-medium py-2 px-3 rounded text-sm transition-colors"
                >
                  ⬅️ Retirar
                </button>
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

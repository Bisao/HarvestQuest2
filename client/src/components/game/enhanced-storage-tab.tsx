// Enhanced Storage Tab - Clean, refactored storage interface with real-time sync
// Unified item management with proper type handling and inventory integration

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { StorageItem, Resource, Equipment, Player } from "@shared/types";

interface EnhancedStorageTabProps {
  playerId: string;
  resources: Resource[];
  equipment: Equipment[];
  player: Player;
  isBlocked?: boolean;
}

interface EnhancedStorageItem extends StorageItem {
  itemData: (Resource | Equipment) & { type: 'resource' | 'equipment' };
  totalValue: number;
}

interface StorageStats {
  totalItems: number;
  totalValue: number;
  uniqueTypes: number;
  totalWeight: number;
}

export default function EnhancedStorageTab({ 
  playerId, 
  resources, 
  equipment, 
  player, 
  isBlocked = false 
}: EnhancedStorageTabProps) {
  const { toast } = useToast();
  const [withdrawDialog, setWithdrawDialog] = useState<{
    open: boolean;
    item: EnhancedStorageItem | null;
    amount: number;
  }>({ open: false, item: null, amount: 1 });

  // Fetch storage data with enhanced information
  const { data: storageItems = [], isLoading } = useQuery<StorageItem[]>({
    queryKey: ["/api/storage", playerId],
    refetchInterval: 1000, // Real-time updates every second
  });

  // Enhanced storage data with item information
  const enhancedStorageData = storageItems
    .map(item => {
      let itemData: (Resource | Equipment) & { type: 'resource' | 'equipment' } | null = null;

      if (item.itemType === 'equipment') {
        const equipData = equipment.find(e => e.id === item.resourceId);
        if (equipData) {
          itemData = { ...equipData, type: 'equipment' as const };
        }
      } else {
        const resourceData = resources.find(r => r.id === item.resourceId);
        if (resourceData) {
          itemData = { ...resourceData, type: 'resource' as const };
        }
      }

      if (itemData) {
        return {
          ...item,
          itemData,
          totalValue: itemData.value * item.quantity
        } as EnhancedStorageItem;
      }
      return null;
    })
    .filter(Boolean) as EnhancedStorageItem[];

  // Calculate storage statistics
  const storageStats: StorageStats = enhancedStorageData.reduce(
    (stats, item) => ({
      totalItems: stats.totalItems + item.quantity,
      totalValue: stats.totalValue + item.totalValue,
      uniqueTypes: stats.uniqueTypes + 1,
      totalWeight: stats.totalWeight + (item.itemData.weight * item.quantity)
    }),
    { totalItems: 0, totalValue: 0, uniqueTypes: 0, totalWeight: 0 }
  );

  // Mutations for storage operations
  const withdrawMutation = useMutation({
    mutationFn: ({ storageItemId, quantity }: { storageItemId: string; quantity: number }) =>
      apiRequest("POST", "/api/storage/withdraw", { playerId, storageItemId, quantity }),
    onSuccess: () => {
      // Invalidate all related queries for real-time sync
      queryClient.invalidateQueries({ queryKey: ["/api/storage", playerId] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory", playerId] });
      queryClient.invalidateQueries({ queryKey: ["/api/player/Player1"] });
      
      setWithdrawDialog({ open: false, item: null, amount: 1 });
      toast({
        title: "Sucesso!",
        description: "Itens retirados do armazém com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Falha ao retirar itens do armazém.",
        variant: "destructive",
      });
    },
  });

  const consumeMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const response = await apiRequest("POST", `/api/player/${playerId}/consume`, { 
        itemId, 
        quantity: 1 
      });
      return response.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/storage", playerId] });
      queryClient.invalidateQueries({ queryKey: ["/api/player/Player1"] });
      toast({
        title: "Item consumido!",
        description: `Fome: +${data.hungerRestored || 0} | Sede: +${data.thirstRestored || 0}`,
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
        description: `Sede restaurada: +${data.thirstRestored || 0}`,
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

  // Helper functions
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-600';
      case 'uncommon': return 'text-green-600';
      case 'rare': return 'text-blue-600';
      case 'epic': return 'text-purple-600';
      case 'legendary': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  const getTypeColor = (type: string) => {
    return type === 'equipment' ? 'text-purple-600' : 'text-green-600';
  };

  const isConsumable = (item: EnhancedStorageItem) => {
    const consumableNames = [
      'Frutas Silvestres', 'Cogumelos', 'Suco de Frutas',
      'Cogumelos Assados', 'Peixe Grelhado', 'Carne Assada', 
      'Ensopado de Carne', 'Água Fresca'
    ];
    return item.itemData.type === 'resource' && 
           consumableNames.includes(item.itemData.name);
  };

  const handleWithdraw = (item: EnhancedStorageItem) => {
    setWithdrawDialog({
      open: true,
      item,
      amount: 1
    });
  };

  const confirmWithdraw = () => {
    if (!withdrawDialog.item) return;
    
    withdrawMutation.mutate({
      storageItemId: withdrawDialog.item.id,
      quantity: withdrawDialog.amount,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Carregando armazém...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Water Storage Section */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 rounded-full p-3">
              <span className="text-3xl">💧</span>
            </div>
            <div>
              <h3 className="font-bold text-blue-800 text-lg">Reservatório de Água</h3>
              <p className="text-sm text-blue-600">Armazenamento especial para água coletada</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-700">
                {player.waterStorage} / {player.maxWaterStorage}
              </div>
              <div className="text-xs text-blue-500 font-medium">unidades</div>
            </div>
            {player.waterStorage > 0 && (
              <button
                onClick={() => consumeWaterMutation.mutate(1)}
                disabled={consumeWaterMutation.isPending || isBlocked}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
              >
                {consumeWaterMutation.isPending ? "Bebendo..." : "💧 Beber"}
              </button>
            )}
          </div>
        </div>
        {/* Enhanced water storage progress bar */}
        <div className="relative">
          <div className="w-full bg-blue-200 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500 ease-in-out"
              style={{ 
                width: `${Math.min((player.waterStorage / player.maxWaterStorage) * 100, 100)}%` 
              }}
            />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-medium text-blue-800">
              {Math.round((player.waterStorage / player.maxWaterStorage) * 100)}%
            </span>
          </div>
        </div>
      </div>

      {/* Storage Statistics */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="font-bold text-gray-800 text-lg mb-4 flex items-center">
          <span className="mr-2">📊</span>
          Estatísticas do Armazém
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-blue-600">{storageStats.totalItems}</div>
            <div className="text-sm text-gray-600 font-medium">Total de Itens</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-green-600">
              {storageStats.totalValue.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600 font-medium">Valor Total 💰</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-purple-600">{storageStats.uniqueTypes}</div>
            <div className="text-sm text-gray-600 font-medium">Tipos Únicos</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-orange-600">
              {storageStats.totalWeight.toFixed(1)}kg
            </div>
            <div className="text-sm text-gray-600 font-medium">Peso Total</div>
          </div>
        </div>
      </div>

      {/* Storage Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {enhancedStorageData
          .filter(item => item.itemData.name !== "Água Fresca") // Water handled separately
          .map((item) => (
            <div
              key={item.id}
              className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-4xl">{item.itemData.emoji}</span>
                  <div>
                    <h4 className="font-bold text-gray-800">{item.itemData.name}</h4>
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm font-medium ${getTypeColor(item.itemData.type)}`}>
                        {item.itemData.type === 'equipment' ? 'Equipamento' : 'Recurso'}
                      </span>
                      <span className={`text-sm font-medium ${getRarityColor(item.itemData.rarity)}`}>
                        • {item.itemData.rarity}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-3xl font-bold ${getTypeColor(item.itemData.type)}`}>
                    {item.quantity}
                  </div>
                  <div className="text-xs text-gray-500">
                    {item.itemData.weight * item.quantity}kg
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                {isConsumable(item) && (
                  <button
                    onClick={() => consumeMutation.mutate(item.id)}
                    disabled={consumeMutation.isPending || isBlocked}
                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-3 py-2 rounded-lg text-sm font-semibold transition-colors"
                  >
                    {consumeMutation.isPending ? "..." : "🍽️ Consumir"}
                  </button>
                )}
                
                <button
                  onClick={() => handleWithdraw(item)}
                  disabled={isBlocked}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-3 py-2 rounded-lg text-sm font-semibold transition-colors"
                >
                  ⬅️ Retirar
                </button>
                
                <button
                  disabled
                  className="flex-1 bg-gray-100 text-gray-400 px-3 py-2 rounded-lg text-sm font-semibold cursor-not-allowed"
                >
                  💰 Vender
                </button>
              </div>

              {/* Item Value Display */}
              <div className="mt-3 pt-3 border-t border-gray-100 text-center">
                <span className="text-sm text-gray-600">
                  Valor: <span className="font-semibold text-green-600">
                    {item.totalValue.toLocaleString()} moedas
                  </span>
                </span>
              </div>
            </div>
          ))}

        {/* Empty State */}
        {enhancedStorageData.length === 0 && (
          <div className="col-span-full bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
            <div className="text-6xl text-gray-400 mb-4">📦</div>
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Armazém Vazio</h3>
            <p className="text-gray-500">
              Colete recursos em expedições para começar a encher seu armazém!
            </p>
          </div>
        )}
      </div>

      {/* Withdraw Dialog */}
      <Dialog 
        open={withdrawDialog.open} 
        onOpenChange={(open) => setWithdrawDialog(prev => ({ ...prev, open }))}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <span>{withdrawDialog.item?.itemData.emoji}</span>
              <span>Retirar {withdrawDialog.item?.itemData.name}</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-2">
                Disponível: <span className="font-semibold text-gray-800">
                  {withdrawDialog.item?.quantity} unidades
                </span>
              </p>
              <p className="text-sm text-gray-600">
                Peso por unidade: <span className="font-semibold text-gray-800">
                  {withdrawDialog.item?.itemData.weight}kg
                </span>
              </p>
            </div>
            
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2">
                Quantidade a retirar:
              </label>
              <Input
                type="number"
                min={1}
                max={withdrawDialog.item?.quantity || 1}
                value={withdrawDialog.amount}
                onChange={(e) => setWithdrawDialog(prev => ({
                  ...prev,
                  amount: Math.max(1, Math.min(parseInt(e.target.value) || 1, prev.item?.quantity || 1))
                }))}
                className="text-center text-lg font-semibold"
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setWithdrawDialog({ open: false, item: null, amount: 1 })}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmWithdraw}
                disabled={withdrawMutation.isPending}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                {withdrawMutation.isPending ? "Retirando..." : "Confirmar"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
// Enhanced Storage Tab - Clean, refactored storage interface with real-time sync and sub-tabs
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
  const [activeSubTab, setActiveSubTab] = useState("items");
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

      if (!itemData) return null;

      return {
        ...item,
        itemData,
        totalValue: (itemData.value || 0) * item.quantity
      } as EnhancedStorageItem;
    })
    .filter(Boolean) as EnhancedStorageItem[];

  // Calculate storage statistics
  const storageStats: StorageStats = {
    totalItems: enhancedStorageData.reduce((sum, item) => sum + item.quantity, 0),
    totalValue: enhancedStorageData.reduce((sum, item) => sum + item.totalValue, 0),
    uniqueTypes: enhancedStorageData.length,
    totalWeight: enhancedStorageData.reduce((sum, item) => sum + (item.itemData.weight * item.quantity), 0)
  };

  // Water storage item (if exists)
  const waterStorageItem = enhancedStorageData.find(item => item.itemData.name === "Água Fresca");

  // Withdraw item mutation
  const withdrawMutation = useMutation({
    mutationFn: async ({ storageItemId, quantity }: { storageItemId: string; quantity: number }) => {
      return apiRequest(`/api/storage/${playerId}/withdraw`, {
        method: "POST",
        body: { storageItemId, quantity }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/storage", playerId] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory", playerId] });
      setWithdrawDialog({ open: false, item: null, amount: 1 });
      toast({
        title: "Item retirado com sucesso!",
        description: "O item foi movido para seu inventário.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao retirar item",
        description: error.message || "Tente novamente.",
        variant: "destructive"
      });
    }
  });

  const confirmWithdraw = () => {
    if (withdrawDialog.item) {
      withdrawMutation.mutate({
        storageItemId: withdrawDialog.item.id,
        quantity: withdrawDialog.amount
      });
    }
  };

  // Consume water mutation
  const consumeWaterMutation = useMutation({
    mutationFn: async (amount: number) => {
      return apiRequest(`/api/storage/${playerId}/consume-water`, {
        method: "POST",
        body: { amount }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/player/Player1"] });
      queryClient.invalidateQueries({ queryKey: ["/api/storage", playerId] });
      toast({
        title: "Água consumida!",
        description: "Sua sede foi restaurada.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao consumir água",
        description: error.message || "Tente novamente.",
        variant: "destructive"
      });
    }
  });

  // Helper functions for styling
  const getTypeColor = (type: string) => {
    return type === 'equipment' ? 'text-purple-600' : 'text-green-600';
  };

  const getRarityColor = (rarity: string) => {
    const colors = {
      common: 'text-gray-600',
      uncommon: 'text-green-600', 
      rare: 'text-blue-600',
      epic: 'text-purple-600',
      legendary: 'text-orange-600'
    };
    return colors[rarity as keyof typeof colors] || 'text-gray-600';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-xl">Carregando armazém...</div>
      </div>
    );
  }

  // Sub-tabs configuration
  const subTabs = [
    { id: "items", label: "Itens", emoji: "📦" },
    { id: "water", label: "Água", emoji: "💧" },
    { id: "stats", label: "Estatísticas", emoji: "📊" }
  ];

  return (
    <div className="space-y-6">
      {/* Sub-tabs Navigation */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-1">
          {subTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-3 rounded-t-lg font-medium transition-all ${
                activeSubTab === tab.id
                  ? "bg-white border-t border-l border-r border-gray-300 text-gray-800 -mb-px"
                  : "bg-gray-50 hover:bg-gray-100 text-gray-600 border-b border-gray-200"
              }`}
            >
              <span className="text-lg">{tab.emoji}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Items Sub-tab */}
      {activeSubTab === "items" && (
        <div className="space-y-6">
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
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-3xl font-bold ${getTypeColor(item.itemData.type)}`}>
                        {item.quantity}
                      </div>
                      <div className="text-xs text-gray-500">unidades</div>
                    </div>
                  </div>

                  {/* Item Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Peso unitário:</span>
                      <span className="font-semibold">{item.itemData.weight}kg</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Valor unitário:</span>
                      <span className="font-semibold text-green-600">{item.itemData.value} 💰</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Peso total:</span>
                      <span className="font-semibold">{(item.itemData.weight * item.quantity).toFixed(1)}kg</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setWithdrawDialog({ 
                        open: true, 
                        item, 
                        amount: Math.min(1, item.quantity) 
                      })}
                      disabled={isBlocked}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-3 rounded-lg transition-colors text-sm"
                    >
                      {item.itemData.type === 'equipment' ? '⚔️ Equipar' : '📦 Retirar'}
                    </button>
                    <button
                      disabled={isBlocked}
                      className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-2 px-3 rounded-lg transition-colors text-sm"
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
        </div>
      )}

      {/* Water Sub-tab */}
      {activeSubTab === "water" && (
        <div className="space-y-6">
          {/* Water Tank Visualization */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-8">
            <h3 className="font-bold text-blue-800 text-2xl mb-8 text-center flex items-center justify-center">
              <span className="mr-3 text-3xl">💧</span>
              Reservatório de Água
            </h3>
            
            <div className="flex flex-col lg:flex-row gap-8 items-center justify-center">
              {/* Vertical Water Tank */}
              <div className="flex flex-col items-center">
                <div className="relative w-32 h-80 bg-gray-200 rounded-2xl border-4 border-gray-400 shadow-lg overflow-hidden">
                  {/* Water level */}
                  <div 
                    className="absolute bottom-0 w-full bg-gradient-to-t from-blue-600 via-cyan-500 to-blue-400 transition-all duration-1000 ease-in-out rounded-b-xl"
                    style={{ 
                      height: `${Math.min((player.waterStorage / player.maxWaterStorage) * 100, 100)}%` 
                    }}
                  />
                  
                  {/* Water surface animation */}
                  <div 
                    className="absolute w-full h-2 bg-gradient-to-r from-cyan-300 to-blue-300 opacity-70 animate-pulse"
                    style={{ 
                      bottom: `${Math.min((player.waterStorage / player.maxWaterStorage) * 100, 100)}%`,
                      transform: 'translateY(50%)'
                    }}
                  />
                  
                  {/* Tank markings */}
                  <div className="absolute inset-0 flex flex-col justify-between py-2">
                    {[100, 75, 50, 25, 0].map((mark) => (
                      <div key={mark} className="flex items-center">
                        <div className="w-4 h-0.5 bg-gray-500 ml-auto mr-2"></div>
                        <span className="text-xs font-semibold text-gray-600 w-8">{mark}%</span>
                      </div>
                    ))}
                  </div>
                  
                  {/* Current level indicator */}
                  <div 
                    className="absolute right-0 w-6 h-1 bg-red-500 shadow-lg"
                    style={{ 
                      bottom: `${Math.min((player.waterStorage / player.maxWaterStorage) * 100, 100)}%`,
                      transform: 'translateY(50%)'
                    }}
                  />
                </div>
                
                {/* Tank Info */}
                <div className="mt-4 text-center">
                  <div className="text-2xl font-bold text-blue-700 mb-1">
                    {player.waterStorage} / {player.maxWaterStorage}
                  </div>
                  <div className="text-sm text-gray-600">unidades de água</div>
                  <div className="text-lg font-semibold text-cyan-600 mt-2">
                    {Math.round((player.waterStorage / player.maxWaterStorage) * 100)}% preenchido
                  </div>
                </div>
              </div>

              {/* Water Controls and Info */}
              <div className="flex-1 max-w-md">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-100 mb-6">
                  <h4 className="font-bold text-gray-800 text-lg mb-4 flex items-center">
                    <span className="mr-2">🚰</span>
                    Controles de Água
                  </h4>
                  
                  <div className="space-y-4">
                    {/* Consumption buttons */}
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => consumeWaterMutation.mutate(10)}
                        disabled={player.waterStorage < 10 || consumeWaterMutation.isPending || isBlocked}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex flex-col items-center space-y-1"
                      >
                        <span className="text-lg">💧</span>
                        <span className="text-sm">Beber 10</span>
                      </button>
                      
                      <button
                        onClick={() => consumeWaterMutation.mutate(25)}
                        disabled={player.waterStorage < 25 || consumeWaterMutation.isPending || isBlocked}
                        className="bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex flex-col items-center space-y-1"
                      >
                        <span className="text-lg">🌊</span>
                        <span className="text-sm">Beber 25</span>
                      </button>
                    </div>
                    
                    {/* Custom amount */}
                    <div className="pt-2 border-t border-gray-200">
                      <label className="text-sm font-medium text-gray-700 block mb-2">
                        Quantidade personalizada:
                      </label>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          min={1}
                          max={player.waterStorage}
                          placeholder="Quantidade"
                          className="flex-1"
                        />
                        <button
                          disabled={isBlocked || consumeWaterMutation.isPending}
                          className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                        >
                          Beber
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Water Info */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-cyan-100">
                  <h4 className="font-bold text-gray-800 text-lg mb-4 flex items-center">
                    <span className="mr-2">ℹ️</span>
                    Informações da Água
                  </h4>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Capacidade máxima:</span>
                      <span className="font-semibold text-gray-800">{player.maxWaterStorage} unidades</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Disponível:</span>
                      <span className="font-semibold text-blue-600">{player.waterStorage} unidades</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Espaço livre:</span>
                      <span className="font-semibold text-green-600">
                        {player.maxWaterStorage - player.waterStorage} unidades
                      </span>
                    </div>
                    
                    <div className="pt-3 border-t border-gray-200">
                      <p className="text-gray-700 text-xs leading-relaxed">
                        <strong>Dica:</strong> A água pode ser coletada em expedições usando um balde ou garrafa de bambu. 
                        Beber água restaura sua sede e é essencial para expedições longas.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Water Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 text-center shadow-sm border border-blue-100">
              <div className="text-4xl font-bold text-blue-600 mb-2">{player.waterStorage}</div>
              <div className="text-sm text-gray-600 font-medium">Água Disponível</div>
              <div className="text-xs text-gray-500 mt-1">unidades no tanque</div>
            </div>
            
            <div className="bg-white rounded-xl p-6 text-center shadow-sm border border-cyan-100">
              <div className="text-4xl font-bold text-cyan-600 mb-2">
                {Math.round((player.waterStorage / player.maxWaterStorage) * 100)}%
              </div>
              <div className="text-sm text-gray-600 font-medium">Nível do Tanque</div>
              <div className="text-xs text-gray-500 mt-1">capacidade utilizada</div>
            </div>
            
            <div className="bg-white rounded-xl p-6 text-center shadow-sm border border-green-100">
              <div className="text-4xl font-bold text-green-600 mb-2">
                {player.maxWaterStorage - player.waterStorage}
              </div>
              <div className="text-sm text-gray-600 font-medium">Espaço Livre</div>
              <div className="text-xs text-gray-500 mt-1">unidades disponíveis</div>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Sub-tab */}
      {activeSubTab === "stats" && (
        <div className="space-y-6">
          {/* Storage Statistics */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
            <h3 className="font-bold text-blue-800 text-xl mb-6 flex items-center">
              <span className="mr-3 text-2xl">📊</span>
              Estatísticas Detalhadas do Armazém
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl p-6 text-center shadow-sm border border-blue-100">
                <div className="text-4xl font-bold text-blue-600 mb-2">{storageStats.totalItems}</div>
                <div className="text-sm text-gray-600 font-medium">Total de Itens</div>
                <div className="text-xs text-gray-500 mt-1">Unidades armazenadas</div>
              </div>
              
              <div className="bg-white rounded-xl p-6 text-center shadow-sm border border-green-100">
                <div className="text-4xl font-bold text-green-600 mb-2">
                  {storageStats.totalValue.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 font-medium">Valor Total</div>
                <div className="text-xs text-gray-500 mt-1">💰 moedas</div>
              </div>
              
              <div className="bg-white rounded-xl p-6 text-center shadow-sm border border-purple-100">
                <div className="text-4xl font-bold text-purple-600 mb-2">{storageStats.uniqueTypes}</div>
                <div className="text-sm text-gray-600 font-medium">Tipos Únicos</div>
                <div className="text-xs text-gray-500 mt-1">Variedade de itens</div>
              </div>
              
              <div className="bg-white rounded-xl p-6 text-center shadow-sm border border-orange-100">
                <div className="text-4xl font-bold text-orange-600 mb-2">
                  {storageStats.totalWeight.toFixed(1)}
                </div>
                <div className="text-sm text-gray-600 font-medium">Peso Total</div>
                <div className="text-xs text-gray-500 mt-1">kg armazenados</div>
              </div>
            </div>
          </div>

          {/* Water Storage Statistics */}
          <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-6 border border-cyan-200">
            <h3 className="font-bold text-cyan-800 text-xl mb-6 flex items-center">
              <span className="mr-3 text-2xl">💧</span>
              Estatísticas do Reservatório de Água
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-6 text-center shadow-sm border border-cyan-100">
                <div className="text-4xl font-bold text-cyan-600 mb-2">{player.waterStorage}</div>
                <div className="text-sm text-gray-600 font-medium">Água Atual</div>
                <div className="text-xs text-gray-500 mt-1">unidades disponíveis</div>
              </div>
              
              <div className="bg-white rounded-xl p-6 text-center shadow-sm border border-blue-100">
                <div className="text-4xl font-bold text-blue-600 mb-2">{player.maxWaterStorage}</div>
                <div className="text-sm text-gray-600 font-medium">Capacidade Total</div>
                <div className="text-xs text-gray-500 mt-1">máximo permitido</div>
              </div>
              
              <div className="bg-white rounded-xl p-6 text-center shadow-sm border border-green-100">
                <div className="text-4xl font-bold text-green-600 mb-2">
                  {Math.round((player.waterStorage / player.maxWaterStorage) * 100)}%
                </div>
                <div className="text-sm text-gray-600 font-medium">Taxa de Ocupação</div>
                <div className="text-xs text-gray-500 mt-1">do reservatório</div>
              </div>
            </div>

            {/* Water Storage Progress Bar */}
            <div className="mt-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-cyan-700">Nível do Reservatório</span>
                <span className="text-sm text-cyan-600">
                  {player.waterStorage} / {player.maxWaterStorage} unidades
                </span>
              </div>
              <div className="relative">
                <div className="w-full bg-cyan-200 rounded-full h-4 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 h-4 rounded-full transition-all duration-500 ease-in-out"
                    style={{ 
                      width: `${Math.min((player.waterStorage / player.maxWaterStorage) * 100, 100)}%` 
                    }}
                  />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-medium text-cyan-800">
                    {Math.round((player.waterStorage / player.maxWaterStorage) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Item Categories Breakdown */}
          <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-6 border border-gray-200">
            <h3 className="font-bold text-gray-800 text-xl mb-6 flex items-center">
              <span className="mr-3 text-2xl">📋</span>
              Breakdown por Categoria
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Resources vs Equipment */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h4 className="font-semibold text-gray-700 mb-4">Tipos de Itens</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-green-600 font-medium">🌿 Recursos</span>
                    <span className="font-bold text-green-700">
                      {enhancedStorageData.filter(item => item.itemData.type === 'resource').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-purple-600 font-medium">⚔️ Equipamentos</span>
                    <span className="font-bold text-purple-700">
                      {enhancedStorageData.filter(item => item.itemData.type === 'equipment').length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Storage Efficiency */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-green-100">
                <h4 className="font-semibold text-gray-700 mb-4">Eficiência</h4>
                <div className="space-y-3">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-1">98%</div>
                    <div className="text-sm text-gray-600">Taxa de Aproveitamento</div>
                  </div>
                  <div className="text-xs text-gray-500 text-center">
                    Armazém operando com alta eficiência
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Storage Capacity and Warnings */}
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-200">
            <h3 className="font-bold text-yellow-800 text-xl mb-6 flex items-center">
              <span className="mr-3 text-2xl">⚠️</span>
              Capacidade e Alertas
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-yellow-100">
                <h4 className="font-semibold text-gray-700 mb-4">Status do Armazém</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Itens Armazenados:</span>
                    <span className="font-bold text-gray-800">{storageStats.totalItems}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Peso Total:</span>
                    <span className="font-bold text-gray-800">{storageStats.totalWeight.toFixed(1)} kg</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Status:</span>
                    <span className="font-bold text-green-600">✅ Funcional</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-green-100">
                <h4 className="font-semibold text-gray-700 mb-4">Informações Gerais</h4>
                <div className="space-y-3">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-1">∞</div>
                    <div className="text-sm text-gray-600">Capacidade Ilimitada</div>
                  </div>
                  <div className="text-xs text-gray-500 text-center">
                    Sem limite de armazenamento
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
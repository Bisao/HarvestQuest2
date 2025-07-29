import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Resource, Equipment } from "@shared/types";

interface InventoryItem {
  id: string;
  resourceId: string;
  quantity: number;
}

interface EquippedItem {
  slot: string;
  equipmentId: string | null;
}

interface MinecraftInventoryProps {
  playerId: string;
  resources: Resource[];
  equipment: Equipment[];
  isBlocked?: boolean;
}

interface WeightStatus {
  currentWeight: number;
  maxWeight: number;
  percentage: number;
  level: number;
  levelRange: string;
}

export default function MinecraftInventory({
  playerId,
  resources,
  equipment,
  isBlocked = false
}: MinecraftInventoryProps) {
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: inventory = [] } = useQuery<InventoryItem[]>({
    queryKey: ["/api/inventory", playerId],
  });

  const { data: weightStatus } = useQuery<WeightStatus>({
    queryKey: ["/api/player", playerId, "weight"],
    refetchInterval: 1000, // Refetch every second to ensure fresh data
  });

  // Equipment slots organized in a symmetrical layout
  const armorSlots = [
    { id: "helmet", name: "Capacete", emoji: "🪖", position: "head" },
    { id: "backpack", name: "Mochila", emoji: "🎒", position: "back" },
    { id: "chestplate", name: "Peitoral", emoji: "🦺", position: "chest" },
    { id: "leggings", name: "Calças", emoji: "👖", position: "legs" },
    { id: "foodbag", name: "Bolsa de Comida", emoji: "🥘", position: "side" },
    { id: "boots", name: "Botas", emoji: "🥾", position: "feet" },
  ];

  const toolSlots = [
    { id: "weapon", name: "Arma", emoji: "⚔️", position: "hand" },
    { id: "tool", name: "Ferramenta", emoji: "⛏️", position: "hand" },
  ];

  // Main inventory: 9x4 grid (36 slots like Minecraft)
  const inventorySlots = Array.from({ length: 36 }, (_, i) => i);

  const getResourceById = (id: string) => resources.find(r => r.id === id);
  const getEquipmentById = (id: string) => equipment.find(e => e.id === id);

  const storeAllMutation = useMutation({
    mutationFn: () => apiRequest("POST", `/api/storage/store-all/${playerId}`),
    onSuccess: () => {
      // CRITICAL: Force immediate cache removal and refetch for real-time sync
      queryClient.removeQueries({ queryKey: ["/api/inventory", playerId] });
      queryClient.removeQueries({ queryKey: ["/api/storage", playerId] });
      queryClient.removeQueries({ queryKey: ["/api/player", playerId] });
      queryClient.removeQueries({ queryKey: ["/api/player/Player1"] });
      
      // Force fresh data fetch
      queryClient.invalidateQueries({ queryKey: ["/api/inventory", playerId] });
      queryClient.invalidateQueries({ queryKey: ["/api/storage", playerId] });
      queryClient.invalidateQueries({ queryKey: ["/api/player", playerId, "weight"] });
      queryClient.invalidateQueries({ queryKey: ["/api/player/Player1"] });
      
      // Additional forced refetch to ensure UI updates immediately
      queryClient.refetchQueries({ queryKey: ["/api/inventory", playerId] });
      queryClient.refetchQueries({ queryKey: ["/api/storage", playerId] });
      
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
      const response = await apiRequest('POST', `/api/storage/store/${itemId}`);
      return response.json();
    },
    onSuccess: () => {
      // CRITICAL: Force immediate cache removal and refetch for real-time sync
      queryClient.removeQueries({ queryKey: ["/api/inventory", playerId] });
      queryClient.removeQueries({ queryKey: ["/api/storage", playerId] });
      queryClient.removeQueries({ queryKey: ["/api/player", playerId] });
      queryClient.removeQueries({ queryKey: ["/api/player/Player1"] });
      
      // Force fresh data fetch
      queryClient.invalidateQueries({ queryKey: ["/api/inventory", playerId] });
      queryClient.invalidateQueries({ queryKey: ["/api/storage", playerId] });
      queryClient.invalidateQueries({ queryKey: ["/api/player", playerId, "weight"] });
      queryClient.invalidateQueries({ queryKey: ["/api/player/Player1"] });
      
      // Additional forced refetch to ensure UI updates immediately
      queryClient.refetchQueries({ queryKey: ["/api/inventory", playerId] });
      queryClient.refetchQueries({ queryKey: ["/api/storage", playerId] });
      
      toast({
        title: "Item movido",
        description: "Item transferido para o armazém.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível mover o item.",
        variant: "destructive"
      });
    }
  });

  const handleSlotClick = (slotId: string, slotType: "inventory" | "equipment") => {
    setSelectedSlot(slotId);
  };

  const handleMoveToStorage = (itemId: string) => {
    moveToStorageMutation.mutate(itemId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-900 via-amber-800 to-amber-900 p-4">
      {/* Medieval Frame Border */}
      <div className="relative w-full max-w-7xl mx-auto">
        {/* Ornate Border */}
        <div className="border-8 border-amber-600 rounded-lg bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 shadow-2xl">
          <div className="border-4 border-amber-500 rounded bg-gradient-to-br from-slate-800 to-slate-900 p-6">
            
            {/* Main Layout Grid */}
            <div className="grid grid-cols-4 gap-6 h-[800px]">
              
              {/* Left Side - Equipment Slots */}
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-amber-700 to-amber-800 rounded-lg p-3 text-center border-2 border-amber-500">
                  <h2 className="text-amber-100 font-bold text-lg tracking-wide">Equipment</h2>
                </div>
                
                {/* Vertical Equipment Slots */}
                <div className="space-y-3">
                  {[...armorSlots, ...toolSlots].map((slot, index) => (
                    <div
                      key={slot.id}
                      onClick={() => handleSlotClick(slot.id, "equipment")}
                      className={`
                        w-16 h-16 border-4 border-amber-600 rounded bg-gradient-to-br from-slate-700 to-slate-800
                        flex items-center justify-center cursor-pointer transition-all duration-200
                        hover:border-amber-400 hover:shadow-lg hover:scale-105
                        ${selectedSlot === slot.id ? "border-amber-300 shadow-amber-400/50 shadow-lg" : ""}
                      `}
                    >
                      <span className="text-2xl">{slot.emoji}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Center - Character Display */}
              <div className="col-span-2 flex flex-col">
                {/* Character Avatar Area */}
                <div className="flex-1 bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg border-4 border-amber-600 p-4 mb-4">
                  <div className="h-full flex items-center justify-center relative">
                    {/* Character Silhouette */}
                    <div className="w-40 h-72 bg-gradient-to-b from-amber-600 to-amber-700 opacity-20 relative">
                      <div className="absolute inset-0 bg-amber-500/10 rounded-lg border-2 border-amber-600/30"></div>
                      {/* Character outline */}
                      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full bg-amber-600/40"></div>
                      <div className="absolute top-12 left-1/2 transform -translate-x-1/2 w-12 h-20 bg-amber-600/40 rounded-t-lg"></div>
                      <div className="absolute top-32 left-1/2 transform -translate-x-1/2 w-16 h-24 bg-amber-600/40"></div>
                      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-6 h-16 bg-amber-600/40"></div>
                      <div className="absolute bottom-8 right-6 w-6 h-16 bg-amber-600/40"></div>
                    </div>
                    
                    {/* Character Stats Overlay */}
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="bg-black/60 rounded-lg p-3 text-amber-100">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm">Peso:</span>
                          <span className="text-sm font-bold">
                            {weightStatus?.currentWeight || 0}kg / {weightStatus?.maxWeight || 20}kg
                          </span>
                        </div>
                        <div className="w-full bg-slate-600 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${
                              (weightStatus?.percentage || 0) > 90 ? 'bg-red-500' :
                              (weightStatus?.percentage || 0) > 70 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${weightStatus?.percentage || 0}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Item Details Panel */}
                {selectedSlot && selectedSlot.startsWith('inv-') && (
                  <div className="bg-gradient-to-br from-amber-700 to-amber-800 rounded-lg border-4 border-amber-500 p-4">
                    {(() => {
                      const slotIndex = parseInt(selectedSlot.replace('inv-', ''));
                      const item = inventory[slotIndex];
                      const resource = item ? getResourceById(item.resourceId) : null;
                      
                      if (resource && item) {
                        return (
                          <div className="text-amber-100">
                            <div className="flex items-center gap-3 mb-3">
                              <span className="text-3xl">{resource.emoji}</span>
                              <div>
                                <h3 className="font-bold text-lg">{resource.name}</h3>
                                <p className="text-sm opacity-80">
                                  Quantidade: {item.quantity} • Peso: {resource.weight * item.quantity}kg
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleMoveToStorage(item.id)}
                              disabled={moveToStorageMutation.isPending}
                              className="w-full bg-amber-600 border-amber-500 hover:bg-amber-500 text-white"
                            >
                              {moveToStorageMutation.isPending ? "Movendo..." : "→ Armazém"}
                            </Button>
                          </div>
                        );
                      }
                      
                      return (
                        <div className="text-center text-amber-200">
                          <p>Slot vazio</p>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>

              {/* Right Side - Backpack */}
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-amber-700 to-amber-800 rounded-lg p-3 text-center border-2 border-amber-500">
                  <h2 className="text-amber-100 font-bold text-lg tracking-wide">Backpack</h2>
                </div>
                
                {/* Inventory Grid */}
                <div className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg border-4 border-amber-600 p-4">
                  <div className="grid grid-cols-5 gap-2 mb-4">
                    {inventorySlots.slice(0, 25).map((slotIndex) => {
                      const item = inventory[slotIndex];
                      const resource = item ? getResourceById(item.resourceId) : null;
                      
                      return (
                        <div
                          key={slotIndex}
                          onClick={() => handleSlotClick(`inv-${slotIndex}`, "inventory")}
                          className={`
                            aspect-square border-2 border-amber-600 rounded bg-gradient-to-br from-slate-600 to-slate-700
                            flex flex-col items-center justify-center cursor-pointer transition-all duration-200
                            hover:border-amber-400 hover:shadow-lg hover:scale-105 relative
                            ${selectedSlot === `inv-${slotIndex}` ? "border-amber-300 shadow-amber-400/50 shadow-lg" : ""}
                          `}
                        >
                          {resource && item ? (
                            <>
                              <span className="text-lg">{resource.emoji}</span>
                              <span className="text-xs font-bold text-amber-200 absolute bottom-0 right-0 bg-slate-800/80 rounded px-1">
                                {item.quantity}
                              </span>
                            </>
                          ) : (
                            <div className="w-6 h-6 border border-amber-700/50 rounded bg-slate-800/30"></div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => storeAllMutation.mutate()}
                    disabled={inventory.length === 0 || storeAllMutation.isPending}
                    className="w-full bg-amber-600 border-amber-500 hover:bg-amber-500 text-white"
                  >
                    Guardar Tudo
                  </Button>
                </div>
              </div>
            </div>

            {/* Bottom Belt Section */}
            <div className="mt-6">
              <div className="bg-gradient-to-br from-amber-700 to-amber-800 rounded-lg p-3 text-center border-2 border-amber-500 mb-4">
                <h2 className="text-amber-100 font-bold text-lg tracking-wide">Belt</h2>
              </div>
              
              <div className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg border-4 border-amber-600 p-4">
                <div className="grid grid-cols-10 gap-3 justify-center">
                  {inventorySlots.slice(25, 35).map((slotIndex) => {
                    const item = inventory[slotIndex];
                    const resource = item ? getResourceById(item.resourceId) : null;
                    
                    return (
                      <div
                        key={slotIndex}
                        onClick={() => handleSlotClick(`inv-${slotIndex}`, "inventory")}
                        className={`
                          aspect-square border-2 border-amber-600 rounded bg-gradient-to-br from-slate-600 to-slate-700
                          flex flex-col items-center justify-center cursor-pointer transition-all duration-200
                          hover:border-amber-400 hover:shadow-lg hover:scale-105 relative
                          ${selectedSlot === `inv-${slotIndex}` ? "border-amber-300 shadow-amber-400/50 shadow-lg" : ""}
                        `}
                      >
                        {resource && item ? (
                          <>
                            <span className="text-lg">{resource.emoji}</span>
                            <span className="text-xs font-bold text-amber-200 absolute bottom-0 right-0 bg-slate-800/80 rounded px-1">
                              {item.quantity}
                            </span>
                          </>
                        ) : (
                          <div className="w-6 h-6 border border-amber-700/50 rounded bg-slate-800/30"></div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
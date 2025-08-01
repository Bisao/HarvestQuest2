import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { isConsumable, getConsumableEffects, getConsumableDescription } from "@shared/utils/consumable-utils";
import type { Player, Equipment, StorageItem } from "@shared/types";
import { resources } from "@/lib/game-data";

interface EquipmentTabProps {
  player: Player;
  equipment: Equipment[];
}

// Helper function to get item data by ID
const getItemById = (id: string) => {
  return resources.find(r => r.id === id);
};

export default function EquipmentTab({ player, equipment }: EquipmentTabProps) {
  const { toast } = useToast();
  const [equipModalOpen, setEquipModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  // Get player's storage to see available equipment
  const { data: storageData = [] } = useQuery<StorageItem[]>({
    queryKey: ["/api/storage", player.id],
  });

  // Equipment slot definitions following RPG-style layout
  const equipmentSlots = [
    // Row 0
    { slot: "bag", name: "Bag", emoji: "🎒", equippedId: null, position: { row: 0, col: 0 } },
    { slot: "helmet", name: "Head Slot", emoji: "⛑️", equippedId: player.equippedHelmet, position: { row: 0, col: 1 } },
    { slot: "cape", name: "Cape", emoji: "🧥", equippedId: null, position: { row: 0, col: 2 } },

    // Row 1  
    { slot: "weapon", name: "Main Hand", emoji: "⚔️", equippedId: player.equippedWeapon, position: { row: 1, col: 0 } },
    { slot: "chestplate", name: "Chest Slot", emoji: "👕", equippedId: player.equippedChestplate, position: { row: 1, col: 1 } },
    { slot: "tool", name: "Off-Hand", emoji: "🔧", equippedId: player.equippedTool, position: { row: 1, col: 2 } },

    // Row 2
    { slot: "drink", name: "Drink", emoji: "🥤", equippedId: player.equippedDrink, position: { row: 2, col: 0 } },
    { slot: "boots", name: "Foot Slot", emoji: "🥾", equippedId: player.equippedBoots, position: { row: 2, col: 1 } },
    { slot: "food", name: "Food", emoji: "🍖", equippedId: player.equippedFood, position: { row: 2, col: 2 } },

    // Row 3
    { slot: "leggings", name: "Mount", emoji: "🐎", equippedId: player.equippedLeggings, position: { row: 3, col: 1 } },
  ];

  const equipMutation = useMutation({
    mutationFn: async ({ slot, equipmentId }: { slot: string; equipmentId: string }) => {
      const response = await apiRequest("POST", `/api/player/equip`, { 
        playerId: player.id, 
        slot, 
        equipmentId 
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to equip item");
      }
      return response.json();
    },
    onSuccess: (data) => {
      // Force refetch of player data to update equipped items
      queryClient.invalidateQueries({ queryKey: [`/api/player/${player.id}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/storage", player.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory", player.id] });
      
      // Force immediate refetch
      queryClient.refetchQueries({ queryKey: [`/api/player/${player.id}`] });
      
      setEquipModalOpen(false);
      toast({
        title: "Item equipado",
        description: data.message || "Item equipado com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Falha ao equipar item.",
        variant: "destructive",
      });
    },
  });

  const unequipMutation = useMutation({
    mutationFn: async (slot: string) => {
      const response = await apiRequest("POST", `/api/player/equip`, { 
        playerId: player.id, 
        slot, 
        equipmentId: null 
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to unequip item");
      }
      return response.json();
    },
    onSuccess: (data) => {
      // Force refetch of player data to update equipped items
      queryClient.invalidateQueries({ queryKey: [`/api/player/${player.id}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/storage", player.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory", player.id] });
      
      // Force immediate refetch
      queryClient.refetchQueries({ queryKey: [`/api/player/${player.id}`] });
      
      toast({
        title: "Item desequipado",
        description: data.message || "Item removido com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Falha ao desequipar item.",
        variant: "destructive",
      });
    },
  });

  const getEquippedItem = (equippedId: string | null) => {
    if (!equippedId) return null;
    return equipment.find(eq => eq.id === equippedId);
  };

  const handleUnequip = (slot: string) => {
    unequipMutation.mutate(slot);
  };

  const handleEquipSlotClick = (slotKey: string, hasEquippedItem: boolean) => {
    if (["helmet", "chestplate", "leggings", "boots", "weapon", "tool", "food", "drink"].includes(slotKey)) {
      setSelectedSlot(slotKey);
      setEquipModalOpen(true);
    }
  };

  const getAvailableEquipmentForSlot = (slotType: string) => {
    // For food and drink slots, look at consumables in storage
    if (slotType === 'food' || slotType === 'drink') {
      console.log('Looking for', slotType, 'items in storage:', storageData);
      
      const filteredItems = storageData
        .filter(item => {
          if (item.quantity <= 0) return false;
          
          // Get the actual resource data
          const resourceData = getItemById(item.resourceId);
          if (!resourceData) {
            console.log('No resource data found for:', item.resourceId);
            return false;
          }

          console.log('✅ Found resource data:', {
            id: resourceData.id,
            name: resourceData.name,
            category: resourceData.category,
            subcategory: resourceData.subcategory,
            type: resourceData.type,
            isConsumable: isConsumable(resourceData),
            slotType: slotType
          });

          // Primary check: Direct consumable identification by ID
          const consumableIds = {
            food: [
              'res-cogumelos-001',
              'res-frutas-silvestres-001', 
              'res-cogumelos-assados-001',
              'res-carne-assada-001',
              'res-peixe-grelhado-001',
              'res-ensopado-carne-001'
            ],
            drink: [
              'res-agua-fresca-001',
              'res-suco-frutas-001'
            ]
          };

          if (consumableIds[slotType]?.includes(item.resourceId)) {
            console.log('✅ Found consumable by ID:', resourceData.name);
            return true;
          }

          // Secondary check: Check if it's a consumable using the utility function
          if (!isConsumable(resourceData)) {
            console.log('❌ Not consumable:', resourceData.name);
            return false;
          }

          // Tertiary check: For modern consumables, check category and subcategory
          if (resourceData.category === 'consumable') {
            const matches = resourceData.subcategory === slotType;
            console.log('Modern consumable check:', resourceData.name, 'subcategory:', resourceData.subcategory, 'matches:', matches);
            return matches;
          }

          // Legacy check: For legacy consumables, check by type
          if (resourceData.type === 'consumable') {
            const matches = resourceData.category === slotType;
            console.log('Legacy consumable check:', resourceData.name, 'category:', resourceData.category, 'matches:', matches);
            return matches;
          }

          // Fallback: Name-based matching
          const itemName = resourceData.name.toLowerCase();
          if (slotType === 'food') {
            const isFoodItem = itemName.includes('carne') || 
                             itemName.includes('cogumelos') || 
                             itemName.includes('fruta') || 
                             itemName.includes('peixe') || 
                             itemName.includes('ensopado');
            if (isFoodItem) {
              console.log('🍖 Food item by name match:', resourceData.name);
              return true;
            }
          }

          if (slotType === 'drink') {
            const isDrinkItem = itemName.includes('água') || itemName.includes('suco');
            if (isDrinkItem) {
              console.log('🥤 Drink item by name match:', resourceData.name);
              return true;
            }
          }

          return false;
        })
        .map(item => {
          const resourceData = getItemById(item.resourceId);
          return resourceData ? { ...resourceData, quantity: item.quantity } : null;
        })
        .filter((item): item is any => item !== null);

      console.log('Filtered items for', slotType, ':', filteredItems);
      return filteredItems;
    }

    // Filter storage items that are equipment and match the slot type
    const availableEquipment = storageData
      .filter(item => item.itemType === 'equipment')
      .map(item => {
        const equipmentItem = equipment.find(eq => eq.id === item.resourceId);
        return equipmentItem ? { ...equipmentItem, quantity: item.quantity } : null;
      })
      .filter((item): item is Equipment & { quantity: number } => item !== null);

    // Enhanced filtering by equipment category and slot compatibility
    return availableEquipment.filter(eq => {
      // Primary slot matching
      if (eq.slot === slotType) return true;

      // Special handling for knife - can be equipped in both weapon and tool slots
      if (eq.name === "Faca") {
        return (slotType === "weapon" && eq.slot === "tool") || (slotType === "tool" && eq.slot === "weapon");
      }

      // Category-based matching for better compatibility
      switch (slotType) {
        case 'helmet':
        case 'chestplate':
        case 'leggings':
        case 'boots':
          return eq.category === 'armor' && eq.slot === slotType;
        case 'weapon':
          return eq.category === 'weapons';
        case 'tool':
          return eq.category === 'tools' || eq.category === 'containers';
        default:
          return false;
      }
    });
  };

  const handleEquipItem = (equipmentId: string) => {
    if (selectedSlot) {
      // For consumables (food/drink), we can equip directly from storage
      if (selectedSlot === 'food' || selectedSlot === 'drink') {
        equipMutation.mutate({ slot: selectedSlot, equipmentId });
      } else {
        // For regular equipment, need to move to inventory first
        equipMutation.mutate({ slot: selectedSlot, equipmentId });
      }
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>⚔️</span>
            <span>Equipamentos</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* RPG-style Equipment Layout */}
          <div className="max-w-xs mx-auto bg-amber-50 p-4 rounded-lg border-2 border-amber-200">
            <div className="grid grid-cols-3 gap-2">
              {/* Create a 4x3 grid following the RPG layout */}
              {Array.from({ length: 4 }, (_, row) => 
                Array.from({ length: 3 }, (_, col) => {
                  const slot = equipmentSlots.find(s => s.position.row === row && s.position.col === col);

                  if (!slot) {
                    return <div key={`${row}-${col}`} className="aspect-square"></div>;
                  }

                  const { slot: slotKey, name, emoji, equippedId } = slot;
                  const equippedItem = getEquippedItem(equippedId || null);
                  const isDisabled = equippedId === null && !["helmet", "chestplate", "leggings", "boots", "weapon", "tool", "food", "drink"].includes(slotKey);

                  return (
                    <div 
                      key={slotKey} 
                      onClick={() => !isDisabled && handleEquipSlotClick(slotKey, !!equippedItem)}
                      className={`aspect-square border-2 rounded-lg flex flex-col items-center justify-center p-2 text-center transition-all ${
                        isDisabled 
                          ? "border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed" 
                          : "cursor-pointer " + (equippedItem 
                          ? "border-green-300 bg-green-50 hover:bg-green-100" 
                          : "border-amber-300 bg-amber-100 hover:bg-amber-200")
                      }`}>
                      {equippedItem ? (
                        // When equipped, show only the item icon
                        <div className="text-3xl">{equippedItem.emoji}</div>
                      ) : (
                        // When empty, show slot info
                        <>
                          <div className="text-lg">{emoji}</div>
                          <div className="font-medium text-xs">{name}</div>
                          <div className="text-xs text-gray-500">
                            {isDisabled ? "Em Breve" : "Clique para equipar"}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Currency/Resource Bars */}
          <div className="mt-4 space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-amber-700">Gold</span>
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div className="bg-yellow-500 h-2 rounded-full" style={{ width: "0%" }}></div>
              </div>
            </div>

          </div>

        </CardContent>
      </Card>



      {/* Equipment Selection Modal */}
      <Dialog open={equipModalOpen} onOpenChange={setEquipModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              Equipar {selectedSlot === 'helmet' ? 'Capacete' : 
                     selectedSlot === 'chestplate' ? 'Peitoral' :
                     selectedSlot === 'leggings' ? 'Calças' :
                     selectedSlot === 'boots' ? 'Botas' :
                     selectedSlot === 'weapon' ? 'Arma' :
                     selectedSlot === 'tool' ? 'Ferramenta' :
                     selectedSlot === 'food' ? 'Comida' :
                     selectedSlot === 'drink' ? 'Bebida' : 'Item'}
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="max-h-80">
            <div className="space-y-2">
              {/* Current equipped item with unequip option */}
              {selectedSlot && (() => {
                const slotData = equipmentSlots.find(s => s.slot === selectedSlot);
                const currentEquippedId = slotData?.equippedId;
                const currentEquippedItem = currentEquippedId ? getEquippedItem(currentEquippedId) : null;

                return currentEquippedItem ? (
                  <div className="p-3 border-2 border-blue-300 rounded-lg bg-blue-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{currentEquippedItem.emoji}</span>
                        <div>
                          <p className="font-medium">{currentEquippedItem.name}</p>
                          <p className="text-sm text-blue-600">Equipado atualmente</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleUnequip(selectedSlot)}
                        disabled={unequipMutation.isPending}
                      >
                        Desequipar
                      </Button>
                    </div>
                  </div>
                ) : null;
              })()}

              {/* Available equipment */}
              {selectedSlot && getAvailableEquipmentForSlot(selectedSlot).length > 0 ? (
                getAvailableEquipmentForSlot(selectedSlot).map((eq) => (
                  <div
                    key={eq.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{eq.emoji}</span>
                      <div>
                        <p className="font-medium">{eq.name}</p>
                        <p className="text-sm text-gray-600">
                          {isConsumable(eq) ? getConsumableDescription(eq) : eq.effect}
                        </p>
                        <p className="text-xs text-gray-500">
                          Peso: {eq.weight}kg • {eq.quantity}x
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleEquipItem(eq.id)}
                      disabled={equipMutation.isPending}
                    >
                      {selectedSlot === 'food' || selectedSlot === 'drink' ? 'Equipar Consumível' : 'Equipar'}
                    </Button>
                  </div>
                ))
              ) : (
                selectedSlot && !(() => {
                  const slotData = equipmentSlots.find(s => s.slot === selectedSlot);
                  return slotData?.equippedId;
                })() && (
                  <div className="text-center p-6 text-gray-500">
                    <p>Nenhum item disponível para este slot.</p>
                    <p className="text-sm mt-2">
                      {selectedSlot === 'weapon' ? 'Crie armas no sistema de crafting.' :
                       selectedSlot === 'tool' ? 'Crie ferramentas no sistema de crafting.' :
                       'Crie equipamentos no sistema de crafting.'}
                    </p>
                  </div>
                )
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
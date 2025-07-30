import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Player, Equipment, StorageItem } from "@shared/types";

interface EquipmentTabProps {
  player: Player;
  equipment: Equipment[];
}

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
    { slot: "potion", name: "Potion", emoji: "🧪", equippedId: null, position: { row: 2, col: 0 } },
    { slot: "boots", name: "Foot Slot", emoji: "🥾", equippedId: player.equippedBoots, position: { row: 2, col: 1 } },
    { slot: "food", name: "Food", emoji: "🍖", equippedId: null, position: { row: 2, col: 2 } },
    
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
      if (!response.ok) throw new Error("Failed to equip item");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/player/Player1"] });
      queryClient.invalidateQueries({ queryKey: ["/api/storage", player.id] });
      setEquipModalOpen(false);
      toast({
        title: "Item equipado",
        description: "Item equipado com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao equipar item.",
        variant: "destructive",
      });
    },
  });

  const unequipMutation = useMutation({
    mutationFn: async (slot: string) => {
      const response = await apiRequest("POST", `/api/player/${player.id}/unequip`, { slot });
      if (!response.ok) throw new Error("Failed to unequip item");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/player/Player1"] });
      queryClient.invalidateQueries({ queryKey: ["/api/storage", player.id] });
      toast({
        title: "Item desequipado",
        description: "Item removido com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao desequipar item.",
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
    if (!hasEquippedItem && ["helmet", "chestplate", "leggings", "boots", "weapon", "tool"].includes(slotKey)) {
      setSelectedSlot(slotKey);
      setEquipModalOpen(true);
    }
  };

  const getAvailableEquipmentForSlot = (slotType: string) => {
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
      equipMutation.mutate({ slot: selectedSlot, equipmentId });
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
                  const equippedItem = getEquippedItem(equippedId);
                  const isDisabled = equippedId === null && !["helmet", "chestplate", "leggings", "boots", "weapon", "tool"].includes(slotKey);
                  
                  return (
                    <div 
                      key={slotKey} 
                      onClick={() => handleEquipSlotClick(slotKey, !!equippedItem)}
                      className={`aspect-square border-2 rounded-lg flex flex-col items-center justify-center p-2 text-center transition-all cursor-pointer ${
                        isDisabled 
                          ? "border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed" 
                          : equippedItem 
                          ? "border-green-300 bg-green-50 hover:bg-green-100" 
                          : "border-amber-300 bg-amber-100 hover:bg-amber-200"
                      }`}>
                      <div className="text-lg">{emoji}</div>
                      <div className="font-medium text-xs">{name}</div>
                      
                      {equippedItem ? (
                        <div className="space-y-1">
                          <div className="text-xs text-green-700">Equipado</div>
                          {!isDisabled && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUnequip(slotKey)}
                              disabled={unequipMutation.isPending}
                              className="text-xs h-6 px-2"
                            >
                              Remover
                            </Button>
                          )}
                        </div>
                      ) : (
                        <div className="text-xs text-gray-500">
                          {isDisabled ? "Em Breve" : (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="text-xs h-6 px-2 mt-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEquipSlotClick(slotKey, false);
                              }}
                            >
                              Equipar
                            </Button>
                          )}
                        </div>
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
                     selectedSlot === 'tool' ? 'Ferramenta' : 'Item'}
            </DialogTitle>
          </DialogHeader>
          
          <ScrollArea className="max-h-80">
            <div className="space-y-2">
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
                          Disponível: {eq.quantity}x
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleEquipItem(eq.id)}
                      disabled={equipMutation.isPending}
                    >
                      Equipar
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-center p-6 text-gray-500">
                  <p>Nenhum item disponível para este slot.</p>
                  <p className="text-sm mt-2">
                    {selectedSlot === 'weapon' ? 'Crie armas no sistema de crafting.' :
                     selectedSlot === 'tool' ? 'Crie ferramentas no sistema de crafting.' :
                     'Crie equipamentos no sistema de crafting.'}
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
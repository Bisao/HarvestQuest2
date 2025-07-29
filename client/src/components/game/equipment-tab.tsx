import React from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Player, Equipment } from "@shared/types";

interface EquipmentTabProps {
  player: Player;
  equipment: Equipment[];
}

export default function EquipmentTab({ player, equipment }: EquipmentTabProps) {
  const { toast } = useToast();

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

  const unequipMutation = useMutation({
    mutationFn: async (slot: string) => {
      const response = await apiRequest("POST", `/api/player/${player.id}/unequip`, { slot });
      if (!response.ok) throw new Error("Failed to unequip item");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/player/Player1"] });
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
                    <div key={slotKey} className={`aspect-square border-2 rounded-lg flex flex-col items-center justify-center p-2 text-center transition-all ${
                      isDisabled 
                        ? "border-gray-300 bg-gray-100 text-gray-400" 
                        : equippedItem 
                        ? "border-green-300 bg-green-50 hover:bg-green-100 cursor-pointer" 
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
                          {isDisabled ? "Em Breve" : "Vazio"}
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
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-600">Silver</span>
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div className="bg-gray-400 h-2 rounded-full" style={{ width: "0%" }}></div>
              </div>
            </div>
          </div>
          
          {/* Mount and Action Buttons */}
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-amber-700">Mount</span>
              <div className="flex space-x-1">
                <Button size="sm" variant="outline" className="h-6 px-2 text-xs bg-amber-100">
                  Stock
                </Button>
                <Button size="sm" variant="outline" className="h-6 px-2 text-xs bg-amber-100">
                  Sort
                </Button>
              </div>
            </div>
          </div>
          
        </CardContent>
      </Card>

      {/* Equipment Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>📋</span>
            <span>Details</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Slots:</span>
              <span>10</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Equipped:</span>
              <span>{equipmentSlots.filter(s => s.equippedId).length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Available:</span>
              <span>{equipmentSlots.filter(s => !s.equippedId && !["bag", "cape", "potion", "food"].includes(s.slot)).length}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
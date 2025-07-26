import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { Resource, Equipment } from "@shared/schema";

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
  currentWeight: number;
  maxWeight: number;
}

export default function MinecraftInventory({
  playerId,
  resources,
  equipment,
  currentWeight,
  maxWeight
}: MinecraftInventoryProps) {
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: inventory = [] } = useQuery<InventoryItem[]>({
    queryKey: ["/api/inventory", playerId],
  });

  // Equipment slots: helmet, chestplate, leggings, boots, weapon, tool
  const equipmentSlots = [
    { id: "helmet", name: "Capacete", emoji: "🪖", position: "head" },
    { id: "chestplate", name: "Peitoral", emoji: "🦺", position: "chest" },
    { id: "leggings", name: "Calças", emoji: "👖", position: "legs" },
    { id: "boots", name: "Botas", emoji: "🥾", position: "feet" },
    { id: "weapon", name: "Arma", emoji: "⚔️", position: "hand" },
    { id: "tool", name: "Ferramenta", emoji: "⛏️", position: "hand" },
  ];

  // Main inventory: 9x4 grid (36 slots like Minecraft)
  const inventorySlots = Array.from({ length: 36 }, (_, i) => i);

  const getResourceById = (id: string) => resources.find(r => r.id === id);
  const getEquipmentById = (id: string) => equipment.find(e => e.id === id);

  const moveToStorageMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const response = await apiRequest('POST', `/api/storage/store/${itemId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory", playerId] });
      queryClient.invalidateQueries({ queryKey: ["/api/storage", playerId] });
      queryClient.invalidateQueries({ queryKey: ["/api/player/Player1"] });
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
    <div className="space-y-6">
      {/* Player Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>📊 Status do Jogador</span>
            <div className="text-sm">
              <Badge variant="outline">
                Peso: {currentWeight}kg / {maxWeight}kg
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Capacidade do Inventário:</span>
              <span>{Math.round((currentWeight / maxWeight) * 100)}%</span>
            </div>
            <Progress value={(currentWeight / maxWeight) * 100} className="w-full" />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Equipment Slots */}
        <Card>
          <CardHeader>
            <CardTitle>⚔️ Equipamentos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {equipmentSlots.map((slot) => (
                <div
                  key={slot.id}
                  onClick={() => handleSlotClick(slot.id, "equipment")}
                  className={`
                    aspect-square border-2 border-dashed border-gray-300 rounded-lg
                    flex flex-col items-center justify-center cursor-pointer
                    hover:border-forest hover:bg-green-50 transition-all
                    ${selectedSlot === slot.id ? "border-forest bg-green-50" : ""}
                  `}
                >
                  <span className="text-2xl mb-1">{slot.emoji}</span>
                  <span className="text-xs text-gray-600 text-center">{slot.name}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                💡 Dica: Equipe itens para melhorar suas expedições!
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Main Inventory */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>🎒 Inventário Principal</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {/* TODO: Store all items */}}
                disabled={inventory.length === 0}
              >
                Guardar Tudo
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-9 gap-2 mb-4">
              {inventorySlots.map((slotIndex) => {
                const item = inventory[slotIndex];
                const resource = item ? getResourceById(item.resourceId) : null;
                
                return (
                  <div
                    key={slotIndex}
                    onClick={() => handleSlotClick(`inv-${slotIndex}`, "inventory")}
                    className={`
                      aspect-square border-2 border-gray-300 rounded-lg
                      flex flex-col items-center justify-center cursor-pointer
                      hover:border-forest hover:bg-green-50 transition-all
                      ${selectedSlot === `inv-${slotIndex}` ? "border-forest bg-green-50" : ""}
                      ${item ? "bg-white" : "bg-gray-50 border-dashed"}
                    `}
                  >
                    {resource && item ? (
                      <>
                        <span className="text-lg">{resource.emoji}</span>
                        <span className="text-xs font-semibold text-center">
                          {item.quantity}
                        </span>
                      </>
                    ) : (
                      <span className="text-gray-400 text-xs">•</span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Item Details */}
            {selectedSlot && selectedSlot.startsWith('inv-') && (
              <div className="border-t pt-4">
                {(() => {
                  const slotIndex = parseInt(selectedSlot.replace('inv-', ''));
                  const item = inventory[slotIndex];
                  const resource = item ? getResourceById(item.resourceId) : null;
                  
                  if (resource && item) {
                    return (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{resource.emoji}</span>
                          <div>
                            <h4 className="font-semibold">{resource.name}</h4>
                            <p className="text-sm text-gray-600">
                              Quantidade: {item.quantity} • Peso: {resource.weight * item.quantity}kg
                            </p>
                            <Badge variant={
                              resource.rarity === "rare" ? "destructive" : 
                              resource.rarity === "uncommon" ? "secondary" : "outline"
                            }>
                              {resource.rarity === "common" ? "Comum" : 
                               resource.rarity === "uncommon" ? "Incomum" : "Raro"}
                            </Badge>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMoveToStorage(item.id)}
                          disabled={moveToStorageMutation.isPending}
                        >
                          {moveToStorageMutation.isPending ? "Movendo..." : "→ Armazém"}
                        </Button>
                      </div>
                    );
                  }
                  
                  return (
                    <div className="text-center text-gray-500">
                      <p>Slot vazio</p>
                    </div>
                  );
                })()}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>⚡ Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button variant="outline" className="flex items-center gap-2">
              <span>🏪</span>
              Armazém
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <span>🔨</span>
              Crafting
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <span>🛡️</span>
              Equipar
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <span>🗑️</span>
              Descartar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
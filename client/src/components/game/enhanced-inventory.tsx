import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import EquipmentSelectorModal from "./equipment-selector-modal";
import type { Resource, Equipment, Player } from "@shared/schema";

interface InventoryItem {
  id: string;
  resourceId: string;
  quantity: number;
}

interface EnhancedInventoryProps {
  playerId: string;
  resources: Resource[];
  equipment: Equipment[];
  player: Player;
  isBlocked?: boolean;
}

export default function EnhancedInventory({
  playerId,
  resources,
  equipment,
  player,
  isBlocked = false
}: EnhancedInventoryProps) {
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [equipmentModalOpen, setEquipmentModalOpen] = useState(false);
  const [selectedEquipmentSlot, setSelectedEquipmentSlot] = useState<{
    id: string;
    name: string;
    equipped: string | null;
  } | null>(null);
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

  // Equipment slots configuration
  const equipmentSlots = [
    { 
      id: "helmet", 
      name: "Capacete", 
      emoji: "🪖", 
      position: { row: 0, col: 1 },
      equipped: player.equippedHelmet
    },
    { 
      id: "backpack", 
      name: "Mochila", 
      emoji: "🎒", 
      position: { row: 0, col: 2 },
      equipped: player.equippedBackpack
    },
    { 
      id: "chestplate", 
      name: "Peitoral", 
      emoji: "🦺", 
      position: { row: 1, col: 1 },
      equipped: player.equippedChestplate
    },
    { 
      id: "leggings", 
      name: "Calças", 
      emoji: "👖", 
      position: { row: 2, col: 1 },
      equipped: player.equippedLeggings
    },
    { 
      id: "foodbag", 
      name: "Bolsa de Comida", 
      emoji: "🥘", 
      position: { row: 2, col: 2 },
      equipped: player.equippedFoodbag
    },
    { 
      id: "boots", 
      name: "Botas", 
      emoji: "🥾", 
      position: { row: 3, col: 1 },
      equipped: player.equippedBoots
    },
    { 
      id: "weapon", 
      name: "Arma", 
      emoji: "⚔️", 
      position: { row: 1, col: 0 },
      equipped: player.equippedWeapon
    },
    { 
      id: "tool", 
      name: "Ferramenta", 
      emoji: "⛏️", 
      position: { row: 1, col: 2 },
      equipped: player.equippedTool
    },
  ];

  // Main inventory: 9x4 grid (36 slots)
  const inventoryRows = 4;
  const inventoryCols = 9;
  const totalSlots = inventoryRows * inventoryCols;

  const getEquipmentById = (id: string) => equipment.find(e => e.id === id);

  const equipItemMutation = useMutation({
    mutationFn: async ({ slot, equipmentId }: { slot: string; equipmentId: string | null }) => {
      const response = await apiRequest('POST', '/api/player/equip', {
        playerId,
        slot,
        equipmentId
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/player/Player1"] });
      toast({
        title: "Item equipado",
        description: "Equipamento atualizado com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível equipar o item.",
        variant: "destructive"
      });
    }
  });

  const storeAllMutation = useMutation({
    mutationFn: () => apiRequest("POST", `/api/storage/store-all/${playerId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory", playerId] });
      queryClient.invalidateQueries({ queryKey: ["/api/storage", playerId] });
      queryClient.invalidateQueries({ queryKey: ["/api/player/Player1"] });
      setSelectedItem(null);
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
        playerId: player.id,
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
        description: `Fome: +${data.hungerRestored} | Sede: +${data.thirstRestored}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível consumir o item.",
        variant: "destructive"
      });
    }
  });

  const handleSlotClick = (slotId: string, slotType: "inventory" | "equipment") => {
    if (slotType === "inventory") {
      const slotIndex = parseInt(slotId.replace('inv-', ''));
      const item = inventory[slotIndex];
      setSelectedItem(item || null);
      setSelectedSlot(slotId);
    } else if (slotType === "equipment") {
      // Find the equipment slot data
      const slot = equipmentSlots.find(s => s.id === slotId);
      if (slot) {
        setSelectedEquipmentSlot({
          id: slot.id,
          name: slot.name,
          equipped: slot.equipped
        });
        setEquipmentModalOpen(true);
      }
    }
  };

  const handleEquipItem = (slot: string, equipmentId: string | null) => {
    equipItemMutation.mutate({ slot, equipmentId });
  };

  const renderEquipmentSlot = (slot: typeof equipmentSlots[0]) => {
    const equippedItem = slot.equipped ? getEquipmentById(slot.equipped) : null;
    
    return (
      <TooltipProvider key={slot.id}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              onClick={() => handleSlotClick(slot.id, "equipment")}
              className={`
                aspect-square border-2 rounded-lg flex flex-col items-center justify-center
                cursor-pointer transition-all hover:scale-105 hover:border-blue-400
                ${equippedItem ? "bg-blue-50 border-blue-300" : "bg-gray-50 border-dashed border-gray-300"}
              `}
            >
              {equippedItem ? (
                <>
                  <span className="text-2xl mb-1">{equippedItem.emoji}</span>
                  <span className="text-xs font-semibold text-center px-1">
                    {equippedItem.name}
                  </span>
                </>
              ) : (
                <>
                  <span className="text-2xl mb-1 opacity-50">{slot.emoji}</span>
                  <span className="text-xs text-gray-500 text-center">{slot.name}</span>
                </>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-center">
              <p className="font-semibold">{slot.name}</p>
              {equippedItem ? (
                <div>
                  <p className="text-sm">{equippedItem.effect}</p>
                  <p className="text-xs text-gray-500">Peso: {equippedItem.weight}kg</p>
                </div>
              ) : (
                <p className="text-sm text-gray-500">Slot vazio</p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  const renderInventorySlot = (slotIndex: number) => {
    const item = inventory[slotIndex];
    const itemData = item ? getItemById(item.resourceId) : null;
    
    return (
      <TooltipProvider key={slotIndex}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              onClick={() => handleSlotClick(`inv-${slotIndex}`, "inventory")}
              className={`
                aspect-square border-2 rounded-lg flex flex-col items-center justify-center
                cursor-pointer transition-all hover:scale-105 relative
                ${selectedSlot === `inv-${slotIndex}` ? "border-forest bg-green-50 shadow-lg" : "border-gray-300"}
                ${item ? "bg-white border-solid" : "bg-gray-50 border-dashed"}
              `}
            >
              {itemData && item ? (
                <>
                  <span className="text-xl">{itemData.emoji}</span>
                  <span className="absolute bottom-1 right-1 text-xs font-bold bg-gray-800 text-white rounded px-1">
                    {item.quantity}
                  </span>
                  {'rarity' in itemData && itemData.rarity === "rare" && (
                    <div className="absolute top-0 right-0 w-2 h-2 bg-purple-500 rounded-full"></div>
                  )}
                  {'rarity' in itemData && itemData.rarity === "uncommon" && (
                    <div className="absolute top-0 right-0 w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                </>
              ) : (
                <span className="text-gray-300 text-lg">•</span>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            {itemData && item ? (
              <div>
                <p className="font-semibold">{itemData.name}</p>
                <p className="text-sm">Quantidade: {item.quantity}</p>
                <p className="text-sm">Peso: {itemData.weight * item.quantity}kg</p>
                {'rarity' in itemData && (
                  <Badge variant={
                    itemData.rarity === "rare" ? "destructive" : 
                    itemData.rarity === "uncommon" ? "secondary" : "outline"
                  } className="text-xs">
                    {itemData.rarity === "common" ? "Comum" : 
                     itemData.rarity === "uncommon" ? "Incomum" : "Raro"}
                  </Badge>
                )}
              </div>
            ) : (
              <p>Slot vazio</p>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <div className="space-y-6">
      {/* Player Stats */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">👤</span>
              <div>
                <h3 className="text-lg">Status do Jogador</h3>
                <p className="text-sm text-gray-600">Nível {player.level} • {player.experience} XP</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-yellow-600">💰</span>
                <span className="font-bold">{player.coins}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-red-600">🍖</span>
                <span className="font-bold">{player.hunger}/{player.maxHunger}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-blue-600">💧</span>
                <span className="font-bold">{player.thirst}/{player.maxThirst}</span>
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Capacidade do Inventário:</span>
                <span>{player.inventoryWeight}kg / {player.maxInventoryWeight}kg</span>
              </div>
              <Progress 
                value={(player.inventoryWeight / player.maxInventoryWeight) * 100} 
                className="w-full h-2"
              />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Fome:</span>
                <span>{Math.round((player.hunger / player.maxHunger) * 100)}%</span>
              </div>
              <Progress 
                value={(player.hunger / player.maxHunger) * 100} 
                className="w-full h-2"
              />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Sede:</span>
                <span>{Math.round((player.thirst / player.maxThirst) * 100)}%</span>
              </div>
              <Progress 
                value={(player.thirst / player.maxThirst) * 100} 
                className="w-full h-2"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6">
        {/* Equipment Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>⚔️</span>
              Equipamentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Equipment Layout (Minecraft style) */}
            <div className="grid grid-cols-3 gap-2 md:gap-3 max-w-[140px] md:max-w-[180px] mx-auto">
              {/* Row 0: Empty, Helmet, Backpack */}
              <div></div>
              {renderEquipmentSlot(equipmentSlots[0])} {/* Helmet */}
              {renderEquipmentSlot(equipmentSlots[1])} {/* Backpack */}
              
              {/* Row 1: Weapon, Chestplate, Tool */}
              {renderEquipmentSlot(equipmentSlots[6])} {/* Weapon */}
              {renderEquipmentSlot(equipmentSlots[2])} {/* Chestplate */}
              {renderEquipmentSlot(equipmentSlots[7])} {/* Tool */}
              
              {/* Row 2: Empty, Leggings, Foodbag */}
              <div></div>
              {renderEquipmentSlot(equipmentSlots[3])} {/* Leggings */}
              {renderEquipmentSlot(equipmentSlots[4])} {/* Foodbag */}
              
              {/* Row 3: Empty, Boots, Empty */}
              <div></div>
              {renderEquipmentSlot(equipmentSlots[5])} {/* Boots */}
              <div></div>
            </div>
            
            <Separator className="my-4" />
            
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">💡 Equipamentos ativos:</p>
              <div className="space-y-1">
                {equipmentSlots.filter(slot => slot.equipped).map(slot => {
                  const equippedItem = getEquipmentById(slot.equipped!);
                  return equippedItem ? (
                    <Badge key={slot.id} variant="outline" className="block">
                      {equippedItem.emoji} {equippedItem.name}
                    </Badge>
                  ) : null;
                })}
                {equipmentSlots.filter(slot => slot.equipped).length === 0 && (
                  <p className="text-xs text-gray-500">Nenhum equipamento ativo</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Inventory */}
        <Card className="lg:col-span-3">
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
                            {/* Show consume button for food items */}
                            {itemData && (itemData.name === "Frutas Silvestres" || 
                              itemData.name === "Cogumelos" || 
                              itemData.name === "Suco de Frutas" ||
                              itemData.name === "Cogumelos Assados" ||
                              itemData.name === "Peixe Grelhado" ||
                              itemData.name === "Carne Assada" ||
                              itemData.name === "Ensopado de Carne" ||
                              itemData.name === "Água Fresca") && (
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => consumeMutation.mutate(selectedItem.id)}
                                disabled={consumeMutation.isPending || isBlocked}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                {consumeMutation.isPending ? "Consumindo..." : "🍽️ Consumir"}
                              </Button>
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

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>⚡ Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 md:gap-3">
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
              Auto-Equipar
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <span>💰</span>
              Vender Tudo
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <span>🔄</span>
              Organizar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Equipment Selector Modal */}
      {selectedEquipmentSlot && (
        <EquipmentSelectorModal
          isOpen={equipmentModalOpen}
          onClose={() => {
            setEquipmentModalOpen(false);
            setSelectedEquipmentSlot(null);
          }}
          playerId={playerId}
          slotType={selectedEquipmentSlot.id}
          slotName={selectedEquipmentSlot.name}
          equipment={equipment}
          currentEquipped={selectedEquipmentSlot.equipped}
        />
      )}
    </div>
  );
}
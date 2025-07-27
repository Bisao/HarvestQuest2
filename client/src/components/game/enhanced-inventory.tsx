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
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, SortAsc, Package, Star } from "lucide-react";
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
  
  // New filter and search states
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterRarity, setFilterRarity] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  
  const { toast } = useToast();

  const { data: inventoryData = [] } = useQuery<InventoryItem[]>({
    queryKey: ["/api/inventory", playerId],
  });

  // Get weight status from new API
  const { data: weightStatus } = useQuery<{
    currentWeight: number;
    maxWeight: number;
    percentage: number;
    level: number;
    levelRange: string;
  }>({
    queryKey: ["/api/player", playerId, "weight"],
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

  // Enhanced filtering and searching functions
  const getFilteredAndSortedInventory = () => {
    let filtered = inventory.filter(item => {
      const itemData = getItemById(item.resourceId);
      if (!itemData) return false;

      // Search filter
      if (searchTerm && !itemData.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      // Type filter
      if (filterType !== "all") {
        if (filterType === "resources" && !('type' in itemData)) return false;
        if (filterType === "equipment" && 'type' in itemData) return false;
        if (filterType === "food" && (!('type' in itemData) || !itemData.name.toLowerCase().includes('carne') && !itemData.name.toLowerCase().includes('cogumelo') && !itemData.name.toLowerCase().includes('peixe'))) return false;
      }

      // Rarity filter
      if (filterRarity !== "all" && 'rarity' in itemData) {
        if (itemData.rarity !== filterRarity) return false;
      }

      return true;
    });

    // Sort items
    filtered.sort((a, b) => {
      const itemA = getItemById(a.resourceId);
      const itemB = getItemById(b.resourceId);
      if (!itemA || !itemB) return 0;

      switch (sortBy) {
        case "name":
          return itemA.name.localeCompare(itemB.name);
        case "quantity":
          return b.quantity - a.quantity;
        case "weight":
          return (itemB.weight * b.quantity) - (itemA.weight * a.quantity);
        case "rarity":
          const rarityOrder = { common: 0, uncommon: 1, rare: 2 };
          const rarityA = 'rarity' in itemA ? rarityOrder[itemA.rarity as keyof typeof rarityOrder] || 0 : 0;
          const rarityB = 'rarity' in itemB ? rarityOrder[itemB.rarity as keyof typeof rarityOrder] || 0 : 0;
          return rarityB - rarityA;
        default:
          return 0;
      }
    });

    return filtered;
  };

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
    const filteredInventory = getFilteredAndSortedInventory();
    const item = filteredInventory[slotIndex];
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

  // Weight capacity warnings
  const getWeightWarningLevel = () => {
    if (!weightStatus) return null;
    if (weightStatus.percentage >= 90) return "critical";
    if (weightStatus.percentage >= 75) return "warning";
    if (weightStatus.percentage >= 60) return "info";
    return null;
  };

  const weightWarning = getWeightWarningLevel();

  return (
    <div className="space-y-6">
      {/* Weight Capacity Warning */}
      {weightWarning && (
        <Card className={`border-2 ${
          weightWarning === "critical" ? "bg-red-50 border-red-300" :
          weightWarning === "warning" ? "bg-yellow-50 border-yellow-300" :
          "bg-blue-50 border-blue-300"
        }`}>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">
                  {weightWarning === "critical" ? "⚠️" : 
                   weightWarning === "warning" ? "⚡" : "💡"}
                </span>
                <div>
                  <h4 className="font-semibold">
                    {weightWarning === "critical" ? "Capacidade Crítica!" :
                     weightWarning === "warning" ? "Capacidade Quase Cheia" :
                     "Dica de Organização"}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {weightWarning === "critical" ? "Inventário quase cheio! Armazene itens urgentemente." :
                     weightWarning === "warning" ? "Considere armazenar alguns itens no armazém." :
                     "Use 'Guardar Tudo' para liberar espaço automaticamente."}
                  </p>
                </div>
              </div>
              {weightWarning !== "info" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => storeAllMutation.mutate()}
                  disabled={inventory.length === 0 || isBlocked || storeAllMutation.isPending}
                >
                  📦 Armazenar Agora
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Simple Search and Quick Filters */}
      <Card className="mb-4">
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <Search className="h-4 w-4 text-gray-500" />
              <Input
                placeholder="Buscar itens..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
            </div>
            <Button
              variant={filterType === "resources" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType(filterType === "resources" ? "all" : "resources")}
            >
              📦 Recursos
            </Button>
            <Button
              variant={filterType === "equipment" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType(filterType === "equipment" ? "all" : "equipment")}
            >
              ⚔️ Equipamentos
            </Button>
            <Button
              variant={filterRarity === "rare" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterRarity(filterRarity === "rare" ? "all" : "rare")}
            >
              ⭐ Raros
            </Button>
            {(searchTerm || filterType !== "all" || filterRarity !== "all") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setFilterType("all");
                  setFilterRarity("all");
                }}
              >
                Limpar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6">
        {/* Equipment & Player Status Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span>⚔️</span>
                Equipamentos
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="text-xs">
                  Nv.{player.level}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  💰{player.coins}
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Player Status Bars */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-sm">🍖</span>
                <Progress value={(player.hunger / player.maxHunger) * 100} className="flex-1 h-2" />
                <span className="text-xs text-gray-500">{player.hunger}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">💧</span>
                <Progress value={(player.thirst / player.maxThirst) * 100} className="flex-1 h-2" />
                <span className="text-xs text-gray-500">{player.thirst}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">🎒</span>
                <Progress value={weightStatus?.percentage || 0} className="flex-1 h-2" />
                <span className="text-xs text-gray-500">{weightStatus?.currentWeight || 0}/{weightStatus?.maxWeight || 20}kg</span>
              </div>
            </div>

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
          </CardContent>
        </Card>

        {/* Main Inventory */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span>🎒</span>
                Inventário Principal
                <Badge variant="outline" className="ml-2">
                  {getFilteredAndSortedInventory().length} itens
                </Badge>
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
            {/* Inventory Grid (Minecraft 9x4) */}
            <div className="grid grid-cols-6 md:grid-cols-9 gap-1 md:gap-2 mb-4">
              {Array.from({ length: totalSlots }, (_, i) => renderInventorySlot(i))}
            </div>

            {/* Empty State */}
            {getFilteredAndSortedInventory().length === 0 && inventory.length > 0 && (
              <div className="text-center py-8 text-gray-500">
                <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Nenhum item encontrado com os filtros aplicados</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => {
                    setSearchTerm("");
                    setFilterType("all");
                    setFilterRarity("all");
                  }}
                >
                  Limpar filtros
                </Button>
              </div>
            )}

            {getFilteredAndSortedInventory().length === 0 && inventory.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Inventário vazio</p>
                <p className="text-sm">Explore biomas para encontrar recursos!</p>
              </div>
            )}

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

      {/* Item Details Panel */}
      {selectedItem && (
        <Card className="mt-4">
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
                          className="bg-green-600 hover:bg-green-700"
                        >
                          🍽️ Consumir
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => moveToStorageMutation.mutate(selectedItem.id)}
                        disabled={isBlocked || moveToStorageMutation.isPending}
                      >
                        📦 Armazenar
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
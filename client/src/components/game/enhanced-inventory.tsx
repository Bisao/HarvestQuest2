import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useInventoryManager } from "@/hooks/useInventoryManager";
import { ItemFinder } from "@shared/utils/item-finder";
import { CacheManager } from "@shared/utils/cache-manager";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import EquipmentSelectorModal from "./equipment-selector-modal";
import { EnhancedItemModal } from "./enhanced-item-modal";
import InventoryToolbar from "./inventory-toolbar";
import InventoryGrid from "./inventory-grid";
import { isConsumable, getConsumableDescription, getConsumableEffects } from "@shared/utils/consumable-utils";
import type { Resource, Equipment, Player } from "@shared/types";
import type { EnhancedInventoryItem } from "@shared/types/inventory-types";

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
  const [selectedEquipmentSlot, setSelectedEquipmentSlot] = useState<{
    id: string;
    name: string;
    equipped: string | null;
  } | null>(null);
  const [equipmentModalOpen, setEquipmentModalOpen] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [modalItem, setModalItem] = useState<EnhancedInventoryItem | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  const { toast } = useToast();

  // Initialize ItemFinder with current data
  ItemFinder.initialize(resources, equipment);

  // Use the new inventory manager hook
  const inventoryManager = useInventoryManager(playerId, resources, equipment, player);

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
      queryClient.invalidateQueries({ queryKey: ["/api/player", playerId] });
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
    onSuccess: async () => {
      await CacheManager.updateAfterMutation(playerId);
      setSelectedItemId(null);
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
      const item = inventoryManager.rawInventory.find(i => i.id === itemId);
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
      queryClient.invalidateQueries({ queryKey: ["/api/player", playerId] });
      setSelectedItemId(null);
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
    mutationFn: async (item: EnhancedInventoryItem) => {
      const effects = getConsumableEffects(item.itemData);

      const response = await apiRequest('POST', `/api/player/${playerId}/consume`, {
        itemId: item.item.resourceId,
        inventoryItemId: item.item.id,
        quantity: 1,
        location: 'inventory',
        hungerRestore: effects.hungerRestore,
        thirstRestore: effects.thirstRestore
      });
      return response.json();
    },
    onSuccess: async (data) => {
      await CacheManager.updateAfterMutation(playerId);
      setSelectedItemId(null);
      toast({
        title: "Item consumido!",
        description: data.hungerRestored || data.thirstRestored ? 
          `Fome: +${data.hungerRestored || 0} | Sede: +${data.thirstRestored || 0}` :
          "Item foi consumido com sucesso.",
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

  const handleEquipmentSlotClick = (slotId: string) => {
    const slot = equipmentSlots.find(s => s.id === slotId);
    if (slot) {
      setSelectedEquipmentSlot({
        id: slot.id,
        name: slot.name,
        equipped: slot.equipped || null
      });
      setEquipmentModalOpen(true);
    }
  };

  const handleItemClick = (item: EnhancedInventoryItem) => {
    setSelectedItemId(item.item.id);
  };

  const handleItemDoubleClick = (item: EnhancedInventoryItem) => {
    setModalItem(item);
    setShowItemModal(true);
  };

  const handleEquipItem = (slot: string, equipmentId: string | null) => {
    equipItemMutation.mutate({ slot, equipmentId });
  };

  const selectedItem = inventoryManager.findItemById(selectedItemId || '');

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
              {/* Row 0: Helmet */}
              <div></div>
              {renderEquipmentSlot(equipmentSlots[0])}
              <div></div>

              {/* Row 1: Weapon, Chestplate, Tool */}
              {renderEquipmentSlot(equipmentSlots[4])}
              {renderEquipmentSlot(equipmentSlots[1])}
              {renderEquipmentSlot(equipmentSlots[5])}

              {/* Row 2: Leggings */}
              <div></div>
              {renderEquipmentSlot(equipmentSlots[2])}
              <div></div>

              {/* Row 3: Boots */}
              <div></div>
              {renderEquipmentSlot(equipmentSlots[3])}
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
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Inventory Toolbar */}
            <InventoryToolbar
              filters={inventoryManager.filters}
              sorting={inventoryManager.sorting}
              stats={{
                totalCount: inventoryManager.totalCount,
                filteredCount: inventoryManager.filteredCount,
                hasActiveFilters: inventoryManager.hasActiveFilters
              }}
              onFiltersChange={inventoryManager.updateFilters}
              onSortingChange={inventoryManager.updateSorting}
              onClearFilters={inventoryManager.clearFilters}
              onBulkActions={{
                onStoreAll: () => storeAllMutation.mutate()
              }}
            />

            {/* Inventory Grid */}
            <InventoryGrid
              items={inventoryManager.inventory}
              constraints={inventoryManager.constraints}
              selectedItemId={selectedItemId}
              onItemClick={handleItemClick}
              onItemDoubleClick={handleItemDoubleClick}
              isBlocked={isBlocked}
            />

            {/* Item Details Panel */}
            {selectedItem && (
              <Card className="bg-gray-50 mt-4">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{selectedItem.itemData.emoji}</span>
                      <div>
                        <h4 className="font-semibold text-lg">{selectedItem.itemData.name}</h4>
                        <p className="text-sm text-gray-600">
                          Quantidade: {selectedItem.item.quantity} • Peso total: {selectedItem.totalWeight.toFixed(1)}g
                        </p>
                        <p className="text-sm text-gray-600">
                          Valor total: {selectedItem.totalValue} moedas
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      {selectedItem.isConsumable && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => consumeMutation.mutate(selectedItem)}
                          disabled={consumeMutation.isPending || isBlocked}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {consumeMutation.isPending ? "Consumindo..." : "🍽️ Consumir"}
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => moveToStorageMutation.mutate(selectedItem.item.id)}
                        disabled={moveToStorageMutation.isPending || isBlocked}
                      >
                        {moveToStorageMutation.isPending ? "Movendo..." : "→ Armazém"}
                      </Button>
                    </div>
                  </div>
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

      {/* Enhanced Item Modal */}
      <EnhancedItemModal
        isOpen={showItemModal}
        onClose={() => {
          setShowItemModal(false);
          setModalItem(null);
        }}
        item={modalItem?.item || null}
        itemData={modalItem?.itemData || null}
        playerId={playerId}
        player={player}
        location="inventory"
      />
    </div>
  );
}

import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Package, Sword, Shield, Shirt, Crown, Hammer, ShoppingBag } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import type { Resource, Equipment, Player, InventoryItem } from '@shared/types';

interface NewInventoryInterfaceProps {
  playerId: string;
  resources: Resource[];
  equipment: Equipment[];
  player: Player;
  isBlocked?: boolean;
}

interface EquipmentSlot {
  id: string;
  name: string;
  emoji: string;
  icon: React.ComponentType<any>;
  position: { row: number; col: number };
}

interface InventorySlot {
  id: string;
  item: InventoryItem | null;
  isEmpty: boolean;
}

const EQUIPMENT_SLOTS: EquipmentSlot[] = [
  { id: 'helmet', name: 'Capacete', emoji: '⛑️', icon: Crown, position: { row: 0, col: 1 } },
  { id: 'weapon', name: 'Arma', emoji: '⚔️', icon: Sword, position: { row: 1, col: 0 } },
  { id: 'chestplate', name: 'Peitoral', emoji: '🦺', icon: Shirt, position: { row: 1, col: 1 } },
  { id: 'tool', name: 'Ferramenta', emoji: '🔧', icon: Hammer, position: { row: 1, col: 2 } },
  { id: 'leggings', name: 'Calças', emoji: '👖', icon: Shield, position: { row: 2, col: 1 } },
  { id: 'boots', name: 'Botas', emoji: '🥾', icon: Shield, position: { row: 3, col: 1 } },
];

export default function NewInventoryInterface({
  playerId,
  resources,
  equipment,
  player,
  isBlocked = false
}: NewInventoryInterfaceProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const isMobile = useIsMobile();

  // Buscar dados do inventário
  const { data: inventoryData = [] } = useQuery<InventoryItem[]>({
    queryKey: ['/api/inventory', playerId],
    enabled: !!playerId,
  });

  // Buscar equipamentos do jogador
  const { data: playerEquipmentData } = useQuery({
    queryKey: ['/api/equipment/player', playerId],
    enabled: !!playerId,
  });

  // Mutations para equipar/desequipar
  const equipMutation = useMutation({
    mutationFn: async ({ equipmentId, slot }: { equipmentId: string; slot: string }) => {
      const response = await fetch('/api/equipment/equip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, equipmentId, slot }),
      });
      if (!response.ok) throw new Error('Falha ao equipar item');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/equipment/player', playerId] });
      queryClient.invalidateQueries({ queryKey: ['/api/inventory', playerId] });
      toast({ title: 'Item equipado com sucesso!' });
    },
    onError: () => {
      toast({ title: 'Erro ao equipar item', variant: 'destructive' });
    },
  });

  const unequipMutation = useMutation({
    mutationFn: async ({ slot }: { slot: string }) => {
      const response = await fetch('/api/equipment/unequip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, slot }),
      });
      if (!response.ok) throw new Error('Falha ao desequipar item');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/equipment/player', playerId] });
      queryClient.invalidateQueries({ queryKey: ['/api/inventory', playerId] });
      toast({ title: 'Item desequipado com sucesso!' });
    },
    onError: () => {
      toast({ title: 'Erro ao desequipar item', variant: 'destructive' });
    },
  });

  // Processar dados do inventário
  const processedInventory = useMemo(() => {
    const slots: InventorySlot[] = [];
    
    // Criar 48 slots (6x8 grid como na imagem)
    for (let i = 0; i < 48; i++) {
      const item = inventoryData.find((_, index) => index === i) || null;
      slots.push({
        id: `slot-${i}`,
        item,
        isEmpty: !item
      });
    }
    
    return slots;
  }, [inventoryData]);

  // Obter item por ID
  const getItemById = (itemId: string): Resource | Equipment | null => {
    return resources.find(r => r.id === itemId) || equipment.find(e => e.id === itemId) || null;
  };

  // Obter equipamento equipado em um slot
  const getEquippedInSlot = (slotId: string): Equipment | null => {
    if (!playerEquipmentData?.data?.equipment) return null;
    
    const equippedId = playerEquipmentData.data.equipment[slotId];
    if (!equippedId) return null;
    
    return equipment.find(e => e.id === equippedId) || null;
  };

  // Renderizar slot de equipamento
  const renderEquipmentSlot = (slot: EquipmentSlot) => {
    const equippedItem = getEquippedInSlot(slot.id);
    const isEmpty = !equippedItem;

    return (
      <div
        key={slot.id}
        className={`
          aspect-square border-2 rounded-lg flex flex-col items-center justify-center
          cursor-pointer transition-all hover:scale-105 relative
          ${isEmpty 
            ? 'bg-gray-50 border-dashed border-gray-300 hover:border-gray-400' 
            : 'bg-blue-50 border-blue-300 hover:border-blue-400'
          }
          ${selectedSlot === slot.id ? 'ring-2 ring-blue-500' : ''}
        `}
        onClick={() => setSelectedSlot(selectedSlot === slot.id ? null : slot.id)}
      >
        {equippedItem ? (
          <>
            <span className="text-2xl mb-1">{equippedItem.emoji}</span>
            <span className="text-xs font-medium text-center px-1 truncate w-full">
              {equippedItem.name}
            </span>
            <Button
              size="sm"
              variant="outline"
              className="absolute -top-2 -right-2 h-6 w-6 p-0"
              onClick={(e) => {
                e.stopPropagation();
                unequipMutation.mutate({ slot: slot.id });
              }}
              disabled={isBlocked || unequipMutation.isPending}
            >
              ×
            </Button>
          </>
        ) : (
          <>
            <span className="text-2xl mb-1 opacity-50">{slot.emoji}</span>
            <span className="text-xs text-gray-500 text-center">{slot.name}</span>
          </>
        )}
      </div>
    );
  };

  // Renderizar slot do inventário
  const renderInventorySlot = (slot: InventorySlot, index: number) => {
    if (slot.isEmpty) {
      return (
        <div
          key={slot.id}
          className="aspect-square border border-gray-200 rounded bg-gray-50 hover:bg-gray-100 transition-colors"
        />
      );
    }

    const item = getItemById(slot.item!.resourceId);
    if (!item) return null;

    const isEquipment = equipment.some(e => e.id === item.id);

    return (
      <div
        key={slot.id}
        className={`
          aspect-square border border-gray-300 rounded bg-white hover:bg-gray-50 
          cursor-pointer transition-all flex flex-col items-center justify-center p-1
          ${isEquipment ? 'hover:border-blue-400' : 'hover:border-green-400'}
        `}
        onClick={() => {
          if (isEquipment && selectedSlot) {
            const equipmentItem = item as Equipment;
            if (equipmentItem.slot === selectedSlot) {
              equipMutation.mutate({ equipmentId: equipmentItem.id, slot: selectedSlot });
              setSelectedSlot(null);
            }
          }
        }}
      >
        <span className="text-lg mb-1">{item.emoji}</span>
        {slot.item!.quantity > 1 && (
          <Badge variant="secondary" className="text-xs px-1">
            {slot.item!.quantity}
          </Badge>
        )}
      </div>
    );
  };

  // Criar grid de equipamentos (3x4 como na imagem)
  const createEquipmentGrid = () => {
    const grid = Array(4).fill(null).map(() => Array(3).fill(null));
    
    EQUIPMENT_SLOTS.forEach(slot => {
      grid[slot.position.row][slot.position.col] = slot;
    });

    return grid.map((row, rowIndex) => (
      <div key={rowIndex} className="flex gap-2">
        {row.map((slot, colIndex) => (
          <div key={`${rowIndex}-${colIndex}`} className={isMobile ? "w-12 h-12" : "w-16 h-16"}>
            {slot ? renderEquipmentSlot(slot) : <div />}
          </div>
        ))}
      </div>
    ));
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">
          <Package className="h-6 w-6" />
          Inventário
        </h2>
        <p className="text-sm text-gray-600">Itens carregados e equipamentos</p>
      </div>

      <Tabs defaultValue="equipments" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="equipments" className="flex items-center gap-2">
            <Sword className="h-4 w-4" />
            Equipamentos
          </TabsTrigger>
          <TabsTrigger value="inventory" className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4" />
            Inventário Principal
          </TabsTrigger>
        </TabsList>

        {/* Tab de Equipamentos */}
        <TabsContent value="equipments" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              {/* Grid de equipamentos */}
              <div className="flex flex-col items-center gap-2 mb-6">
                {createEquipmentGrid()}
              </div>

              <Separator className="my-4" />

              {/* Status dos equipamentos */}
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-yellow-500">💡</span>
                  <span className="font-medium">Equipamentos ativos:</span>
                </div>
                <div className="text-sm text-gray-600">
                  {selectedSlot ? (
                    <Badge variant="outline">
                      Slot selecionado: {EQUIPMENT_SLOTS.find(s => s.id === selectedSlot)?.name}
                    </Badge>
                  ) : (
                    "Nenhum equipamento ativo"
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab do Inventário Principal */}
        <TabsContent value="inventory" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-red-500" />
                Inventário Principal
              </CardTitle>
              <Button variant="outline" size="sm">
                Guardar Tudo
              </Button>
            </CardHeader>
            <CardContent>
              {/* Grid do inventário (6x8 desktop, 4x12 mobile) */}
              <div className={`grid gap-1 ${isMobile ? 'grid-cols-4' : 'grid-cols-8'}`}>
                {processedInventory.map((slot, index) => renderInventorySlot(slot, index))}
              </div>

              {/* Informações do inventário */}
              <div className="mt-4 flex justify-between text-sm text-gray-600">
                <span>Peso: {player.inventoryWeight}/{player.maxInventoryWeight}</span>
                <span>Slots: {inventoryData.length}/48</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import EquipmentSelectorModal from "@/components/game/equipment-selector-modal";
import type { Player, Equipment, StorageItem } from "@shared/types";

interface EquipmentTabProps {
  player: Player;
  equipment: Equipment[];
}

export default function EquipmentTab({ player, equipment }: EquipmentTabProps) {
  const [selectedEquipmentSlot, setSelectedEquipmentSlot] = useState<any>(null);
  const [equipmentModalOpen, setEquipmentModalOpen] = useState(false);

  const { data: storageItems = [] } = useQuery<StorageItem[]>({
    queryKey: ["/api/storage", player.id],
    enabled: !!player.id,
  });

  const equipmentSlots = [
    { id: "helmet", name: "Capacete", emoji: "⛑️", equipped: player.equippedHelmet },
    { id: "chestplate", name: "Peitoral", emoji: "🦺", equipped: player.equippedChestplate },
    { id: "leggings", name: "Calças", emoji: "👖", equipped: player.equippedLeggings },
    { id: "boots", name: "Botas", emoji: "🥾", equipped: player.equippedBoots },
    { id: "weapon", name: "Arma", emoji: "⚔️", equipped: player.equippedWeapon },
    { id: "tool", name: "Ferramenta", emoji: "🔧", equipped: player.equippedTool },
  ];

  const getEquipmentById = (equipmentId: string) => {
    return equipment.find(eq => eq.id === equipmentId);
  };

  const handleSlotClick = (slotId: string, type: string) => {
    if (type !== "equipment") return;

    const slot = equipmentSlots.find(s => s.id === slotId);
    if (!slot) return;

    setSelectedEquipmentSlot(slot);
    setEquipmentModalOpen(true);
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
                  <p className="text-sm">{equippedItem.name}</p>
                  <p className="text-xs text-gray-500">Clique para trocar</p>
                </div>
              ) : (
                <p className="text-xs text-gray-500">Clique para equipar</p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">⚔️ Equipamentos</h3>
        <p className="text-sm text-gray-600">
          Gerencie seus equipamentos ativos
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
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

      {/* Equipment Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">📊 Estatísticas dos Equipamentos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Equipamentos ativos:</p>
              <p className="font-semibold">{equipmentSlots.filter(slot => slot.equipped).length}/6</p>
            </div>
            <div>
              <p className="text-gray-600">Slots disponíveis:</p>
              <p className="font-semibold">{equipmentSlots.filter(slot => !slot.equipped).length}/6</p>
            </div>
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
          playerId={player.id}
          slotType={selectedEquipmentSlot.id}
          slotName={selectedEquipmentSlot.name}
          equipment={equipment}
          currentEquipped={selectedEquipmentSlot.equipped}
        />
      )}
    </div>
  );
}
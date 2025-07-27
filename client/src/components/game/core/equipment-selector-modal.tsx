import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Equipment, StorageItem } from "@shared/schema";

interface EquipmentSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerId: string;
  slotType: string;
  slotName: string;
  equipment: Equipment[];
  currentEquipped: string | null;
}

export default function EquipmentSelectorModal({
  isOpen,
  onClose,
  playerId,
  slotType,
  slotName,
  equipment,
  currentEquipped
}: EquipmentSelectorModalProps) {
  const { toast } = useToast();

  const { data: storageItems = [] } = useQuery<StorageItem[]>({
    queryKey: ["/api/storage", playerId],
    enabled: !!playerId,
  });

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
      onClose();
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível equipar o item.",
        variant: "destructive"
      });
    }
  });

  // Filter equipment by slot type and check if available in storage
  // Special handling for knife - it can be equipped in both weapon and tool slots
  const availableEquipment = equipment
    .filter(eq => {
      // Allow knife to appear in both weapon and tool slots
      if (eq.name === "Faca") {
        return eq.slot === slotType || (slotType === "weapon" && eq.slot === "tool") || (slotType === "tool" && eq.slot === "weapon");
      }
      return eq.slot === slotType;
    })
    .map(eq => {
      const storageItem = storageItems.find(item => item.resourceId === eq.id);
      return {
        ...eq,
        quantity: storageItem?.quantity || 0,
        available: (storageItem?.quantity || 0) > 0
      };
    })
    .filter(eq => eq.available)
    // Remove duplicates if knife appears multiple times
    .filter((eq, index, self) => 
      index === self.findIndex(item => item.id === eq.id)
    );

  const handleEquip = (equipmentId: string) => {
    equipItemMutation.mutate({ slot: slotType, equipmentId });
  };

  const handleUnequip = () => {
    equipItemMutation.mutate({ slot: slotType, equipmentId: null });
  };

  // Get slot emoji based on slot type
  const getSlotEmoji = (slot: string) => {
    switch (slot) {
      case "helmet": return "🪖";
      case "backpack": return "🎒";
      case "chestplate": return "🦺";
      case "leggings": return "👖";
      case "foodbag": return "🥘";
      case "boots": return "🥾";
      case "weapon": return "⚔️";
      case "tool": return "⛏️";
      default: return "📦";
    }
  };

  // Get equipment tier color
  const getTierColor = (equipmentName: string) => {
    if (equipmentName.includes("Improvisado") || equipmentName.includes("Simples") || equipmentName.includes("Couro")) {
      return "border-amber-300 bg-amber-50";
    } else if (equipmentName.includes("Ferro") || equipmentName.includes("Composto") || equipmentName.includes("Reforçada")) {
      return "border-blue-300 bg-blue-50";
    } else if (equipmentName.includes("Élfico") || equipmentName.includes("Avançado") || equipmentName.includes("Dimensional") || equipmentName.includes("Mágica")) {
      return "border-purple-300 bg-purple-50";
    }
    return "border-gray-300 bg-gray-50";
  };

  // Get tier badge
  const getTierBadge = (equipmentName: string) => {
    if (equipmentName.includes("Improvisado") || equipmentName.includes("Simples") || equipmentName.includes("Couro")) {
      return <Badge className="bg-amber-100 text-amber-800">Básico</Badge>;
    } else if (equipmentName.includes("Ferro") || equipmentName.includes("Composto") || equipmentName.includes("Reforçada")) {
      return <Badge className="bg-blue-100 text-blue-800">Ferro</Badge>;
    } else if (equipmentName.includes("Élfico") || equipmentName.includes("Avançado") || equipmentName.includes("Dimensional") || equipmentName.includes("Mágica")) {
      return <Badge className="bg-purple-100 text-purple-800">Elite</Badge>;
    }
    return <Badge variant="outline">Normal</Badge>;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md" aria-describedby="equipment-modal-description">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl">{getSlotEmoji(slotType)}</span>
            Selecionar {slotName}
          </DialogTitle>
        </DialogHeader>
        <div id="equipment-modal-description" className="sr-only">
          Modal para selecionar equipamentos do armazém para equipar no slot {slotName}
        </div>

        <div className="space-y-4">
          {/* Current equipped item */}
          {currentEquipped && (
            <div className="p-3 border rounded-lg bg-blue-50 dark:bg-blue-950">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">
                    {equipment.find(eq => eq.id === currentEquipped)?.emoji}
                  </span>
                  <div>
                    <p className="font-medium">
                      {equipment.find(eq => eq.id === currentEquipped)?.name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Equipado atualmente
                    </p>
                  </div>
                </div>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={handleUnequip}
                  disabled={equipItemMutation.isPending}
                >
                  Desequipar
                </Button>
              </div>
            </div>
          )}

          {/* Available equipment */}
          <div>
            <h4 className="font-medium mb-2">Disponível no Armazém:</h4>
            <ScrollArea className="max-h-60">
              <div className="space-y-2">
                {availableEquipment.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">
                    Nenhum {slotName.toLowerCase()} disponível no armazém
                  </p>
                ) : (
                  availableEquipment.map((eq) => (
                    <div
                      key={eq.id}
                      className={`flex items-center justify-between p-4 border-2 rounded-lg transition-all hover:shadow-md ${getTierColor(eq.name)}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{eq.emoji}</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold">{eq.name}</p>
                            {getTierBadge(eq.name)}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                            {eq.effect}
                          </p>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                              {eq.quantity}x disponível
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {eq.weight}kg
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleEquip(eq.id)}
                        disabled={equipItemMutation.isPending || eq.id === currentEquipped}
                        className={
                          eq.id === currentEquipped 
                            ? "bg-green-500 hover:bg-green-600" 
                            : ""
                        }
                      >
                        {eq.id === currentEquipped ? "Equipado" : "Equipar"}
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
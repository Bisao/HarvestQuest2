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

  // Equipment slot definitions with their respective emojis and names
  const equipmentSlots = [
    { slot: "helmet", name: "Capacete", emoji: "⛑️", equippedId: player.equippedHelmet },
    { slot: "chestplate", name: "Peitoral", emoji: "👕", equippedId: player.equippedChestplate },
    { slot: "leggings", name: "Calças", emoji: "👖", equippedId: player.equippedLeggings },
    { slot: "boots", name: "Botas", emoji: "🥾", equippedId: player.equippedBoots },
    { slot: "weapon", name: "Arma", emoji: "⚔️", equippedId: player.equippedWeapon },
    { slot: "tool", name: "Ferramenta", emoji: "🔧", equippedId: player.equippedTool },
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
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {equipmentSlots.map(({ slot, name, emoji, equippedId }) => {
              const equippedItem = getEquippedItem(equippedId);
              
              return (
                <div key={slot} className="border rounded-lg p-4 text-center space-y-3">
                  <div className="text-2xl">{emoji}</div>
                  <div className="font-medium text-sm">{name}</div>
                  
                  {equippedItem ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-center space-x-2">
                        <span className="text-lg">{equippedItem.emoji}</span>
                        <span className="text-xs font-medium">{equippedItem.name}</span>
                      </div>
                      
                      {equippedItem.effect && (
                        <div className="text-xs text-muted-foreground">
                          {equippedItem.effect}
                        </div>
                      )}
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUnequip(slot)}
                        disabled={unequipMutation.isPending}
                        className="w-full text-xs"
                      >
                        Desequipar
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="text-xs text-muted-foreground">Vazio</div>
                      <div className="h-8"></div> {/* Spacer for alignment */}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Equipment Stats Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>📊</span>
            <span>Bônus dos Equipamentos</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="font-medium">⚔️ Ataque</div>
              <div className="text-muted-foreground">+0</div>
            </div>
            <div className="text-center">
              <div className="font-medium">🛡️ Defesa</div>
              <div className="text-muted-foreground">+0</div>
            </div>
            <div className="text-center">
              <div className="font-medium">⚡ Velocidade</div>
              <div className="text-muted-foreground">+0</div>
            </div>
            <div className="text-center">
              <div className="font-medium">🎯 Precisão</div>
              <div className="text-muted-foreground">+0</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
import React from "react";
import { useQuery } from "@tanstack/react-query";
import ConsumptionSystem from "@/components/game/consumption-system";
import type { Player, Resource, Equipment } from "@shared/types";

interface ConsumptionTabProps {
  player: Player;
  resources: Resource[];
  equipment: Equipment[];
}

export default function ConsumptionTab({ player, resources, equipment }: ConsumptionTabProps) {
  // Get inventory items
  const { data: inventoryItems = [] } = useQuery<any[]>({
    queryKey: ["/api/inventory", player.id],
  });

  // Get storage items  
  const { data: storageItems = [] } = useQuery<any[]>({
    queryKey: ["/api/storage", player.id],
  });

  return (
    <ConsumptionSystem
      player={player}
      resources={resources}
      inventoryItems={inventoryItems}
      storageItems={storageItems}
    />
  );
}
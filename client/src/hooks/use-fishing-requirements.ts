import { useQuery } from "@tanstack/react-query";
import type { Player, Equipment, InventoryItem } from "@shared/schema";

interface FishingRequirementsHook {
  hasRequirements: boolean;
  hasFishingRod: boolean;
  hasBait: boolean;
  baitCount: number;
  isLoading: boolean;
}

export function useFishingRequirements(
  player: Player | null,
  equipment: Equipment[],
  inventoryItems: InventoryItem[]
): FishingRequirementsHook {
  
  // Check if player has fishing rod equipped
  const hasFishingRod = !!(
    player?.equippedTool && 
    equipment.find(eq => eq.id === player.equippedTool && eq.toolType === "fishing_rod")
  );

  // Check for bait in inventory (bait is now a resource, not equipment)
  // Using the same ID but looking in inventory items, not equipment
  const baitItem = inventoryItems.find(item => item.resourceId === "eq-tool-9a8b7c6d-5e4f-3210-fedc-ba0987654321"); // ISCA_PESCA ID
  
  const hasBait = !!(baitItem && baitItem.quantity > 0);
  const baitCount = baitItem?.quantity || 0;

  const hasRequirements = hasFishingRod && hasBait;

  return {
    hasRequirements,
    hasFishingRod,
    hasBait,
    baitCount,
    isLoading: false
  };
}

// Hook para verificar se um resource específico pode ser coletado via API
export function useCanCollectResource(playerId: string, resourceId: string) {
  return useQuery({
    queryKey: ["/api/player", playerId, "can-collect", resourceId],
    queryFn: async () => {
      const response = await fetch(`/api/player/${playerId}/can-collect/${resourceId}`);
      if (!response.ok) throw new Error('Failed to check collection ability');
      return response.json();
    },
    enabled: !!(playerId && resourceId),
    staleTime: 30000, // Cache por 30 segundos
  });
}
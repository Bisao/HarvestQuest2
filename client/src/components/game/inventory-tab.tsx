import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { InventoryItem, Resource } from "@shared/schema";

interface InventoryTabProps {
  playerId: string;
  resources: Resource[];
  currentWeight: number;
  maxWeight: number;
}

export default function InventoryTab({ playerId, resources, currentWeight, maxWeight }: InventoryTabProps) {
  const { toast } = useToast();

  const { data: inventory = [] } = useQuery<InventoryItem[]>({
    queryKey: ["/api/inventory", playerId],
  });

  const storeAllMutation = useMutation({
    mutationFn: () => apiRequest("POST", `/api/storage/store-all/${playerId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory", playerId] });
      queryClient.invalidateQueries({ queryKey: ["/api/storage", playerId] });
      queryClient.invalidateQueries({ queryKey: ["/api/player/Player1"] });
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

  const getResourceData = (resourceId: string) => {
    return resources.find(r => r.id === resourceId);
  };

  const getWeightPercentage = () => {
    return Math.min((currentWeight / maxWeight) * 100, 100);
  };

  const getWeightColor = () => {
    const percentage = getWeightPercentage();
    if (percentage >= 90) return "from-red-400 to-red-600";
    if (percentage >= 70) return "from-orange-400 to-red-500";
    return "from-green-400 to-orange-500";
  };

  // Create inventory grid (24 slots)
  const inventorySlots = Array.from({ length: 24 }, (_, index) => {
    const item = inventory[index];
    const resource = item ? getResourceData(item.resourceId) : null;
    
    return {
      index,
      item,
      resource,
      isEmpty: !item || item.quantity === 0,
    };
  });

  return (
    <div>
      {/* Weight Indicator */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-800">🎒 Inventário</h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Peso:</span>
            <span className="font-bold text-orange-600">{currentWeight}</span>
            <span className="text-gray-500">/</span>
            <span className="font-bold text-gray-700">{maxWeight} kg</span>
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className={`bg-gradient-to-r ${getWeightColor()} h-3 rounded-full transition-all duration-300`}
            style={{ width: `${getWeightPercentage()}%` }}
          />
        </div>
      </div>

      {/* Inventory Grid */}
      <div className="grid grid-cols-8 gap-3 mb-6">
        {inventorySlots.map((slot) => (
          <div
            key={slot.index}
            className={`inventory-slot rounded-lg p-3 text-center transition-colors cursor-pointer ${
              slot.isEmpty
                ? "bg-gray-50 border-2 border-dashed border-gray-300"
                : `border-2 hover:opacity-80 ${
                    slot.resource?.type === "basic"
                      ? "bg-green-100 border-green-300 hover:bg-green-200"
                      : "bg-blue-100 border-blue-300 hover:bg-blue-200"
                  }`
            }`}
          >
            {slot.isEmpty ? (
              <div className="text-2xl text-gray-400 mb-1">⬜</div>
            ) : (
              <>
                <div className="text-2xl mb-1">{slot.resource?.emoji}</div>
                <div className={`text-xs font-semibold ${
                  slot.resource?.type === "basic" ? "text-green-800" : "text-blue-800"
                }`}>
                  {slot.item?.quantity}
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Inventory Actions */}
      <div className="flex space-x-4">
        <button
          onClick={() => storeAllMutation.mutate()}
          disabled={storeAllMutation.isPending || inventory.length === 0}
          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
        >
          📦 Armazenar Tudo
        </button>
        <button
          disabled
          className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors cursor-not-allowed"
        >
          🗑️ Descartar Selecionados
        </button>
      </div>
    </div>
  );
}

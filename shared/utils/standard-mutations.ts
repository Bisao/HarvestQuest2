
/**
 * STANDARDIZED MUTATIONS
 * Eliminates duplicate mutation logic across components
 */

import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { CacheManager } from "./cache-manager";
import { useToast } from "@/hooks/use-toast";

export function useStoreAllMutation(playerId: string) {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: () => apiRequest("POST", `/api/storage/store-all/${playerId}`),
    onSuccess: async () => {
      await CacheManager.updateAfterMutation(playerId);
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
}

export function useMoveToStorageMutation(playerId: string) {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (itemId: string) => {
      const response = await apiRequest('POST', `/api/storage/store/${itemId}`, {
        playerId,
        quantity: 1 // Default quantity
      });
      return response.json();
    },
    onSuccess: async () => {
      await CacheManager.updateAfterMutation(playerId);
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
}

export function useConsumeMutation(playerId: string) {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ itemId, location = 'inventory' }: { 
      itemId: string; 
      location?: 'inventory' | 'storage' 
    }) => {
      const response = await apiRequest('POST', `/api/player/${playerId}/consume`, {
        itemId,
        quantity: 1,
        location,
        hungerRestore: 0, // Will be calculated server-side
        thirstRestore: 0
      });
      return response.json();
    },
    onSuccess: async (data) => {
      await CacheManager.updateAfterMutation(playerId);
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
}

export function useWithdrawMutation(playerId: string) {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ storageItemId, quantity }: { 
      storageItemId: string; 
      quantity: number 
    }) => {
      return apiRequest("POST", "/api/storage/withdraw", {
        playerId,
        storageItemId, 
        quantity
      });
    },
    onSuccess: async () => {
      await CacheManager.updateAfterMutation(playerId);
      toast({
        title: "Item retirado com sucesso!",
        description: "O item foi movido para seu inventário.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao retirar item",
        description: error.message || "Tente novamente.",
        variant: "destructive"
      });
    }
  });
}

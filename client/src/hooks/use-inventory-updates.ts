
import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

export function useInventoryUpdates(playerId: string) {
  const queryClient = useQueryClient();

  const invalidateInventoryData = useCallback(() => {
    // Invalida todas as queries relacionadas ao inventário e dados do player
    queryClient.invalidateQueries({ queryKey: ["/api/inventory", playerId] });
    queryClient.invalidateQueries({ queryKey: ["/api/storage", playerId] });
    queryClient.invalidateQueries({ queryKey: [`/api/player/${playerId}`] });
    queryClient.invalidateQueries({ queryKey: ["/api/storage"] });
    queryClient.invalidateQueries({ queryKey: ["/api/player"] });
  }, [queryClient, playerId]);

  const updateInventoryItem = useCallback((resourceId: string, quantity: number) => {
    // Atualiza otimisticamente o cache do inventário
    queryClient.setQueryData(["/api/inventory", playerId], (oldData: any) => {
      if (!oldData || !Array.isArray(oldData)) return oldData;
      
      const existingItemIndex = oldData.findIndex(
        (item: any) => item.resourceId === resourceId
      );
      
      if (existingItemIndex >= 0) {
        // Item já existe, atualiza quantidade
        const newData = [...oldData];
        newData[existingItemIndex] = {
          ...newData[existingItemIndex],
          quantity: newData[existingItemIndex].quantity + quantity
        };
        return newData;
      } else {
        // Novo item, adiciona ao inventário
        return [
          ...oldData,
          {
            id: `temp-${Date.now()}`,
            playerId,
            resourceId,
            quantity
          }
        ];
      }
    });

    // Invalida queries para garantir sincronização
    invalidateInventoryData();
  }, [queryClient, playerId, invalidateInventoryData]);

  const removeInventoryItem = useCallback((resourceId: string, quantity: number) => {
    // Atualiza otimisticamente o cache removendo/reduzindo quantidade
    queryClient.setQueryData(["/api/inventory", playerId], (oldData: any) => {
      if (!oldData || !Array.isArray(oldData)) return oldData;
      
      return oldData
        .map((item: any) => {
          if (item.resourceId === resourceId) {
            const newQuantity = item.quantity - quantity;
            return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
          }
          return item;
        })
        .filter(Boolean);
    });

    // Invalida queries para garantir sincronização
    invalidateInventoryData();
  }, [queryClient, playerId, invalidateInventoryData]);

  return {
    invalidateInventoryData,
    updateInventoryItem,
    removeInventoryItem
  };
}
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

export function useInventoryUpdates(playerId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!playerId) return;

    // Invalidar cache do inventário periodicamente para pegar atualizações
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ 
        queryKey: ['/api/player', playerId.toLowerCase()] 
      });
    }, 3000); // A cada 3 segundos

    return () => clearInterval(interval);
  }, [playerId, queryClient]);

  // Função para forçar atualização do inventário
  const forceInventoryUpdate = () => {
    queryClient.invalidateQueries({ 
      queryKey: ['/api/player', playerId.toLowerCase()] 
    });
  };

  return { forceInventoryUpdate };
}

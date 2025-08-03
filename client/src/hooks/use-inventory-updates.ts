import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

export function useInventoryUpdates(playerId: string) {
  const queryClient = useQueryClient();

  const invalidateInventoryData = useCallback(() => {
    if (!playerId || playerId.trim() === '') {
      console.warn('useInventoryUpdates: No valid playerId provided');
      return;
    }

    try {
      // Invalidate all inventory-related queries
      queryClient.invalidateQueries({ queryKey: ['/api/inventory', playerId] });
      queryClient.invalidateQueries({ queryKey: [`/api/inventory/${playerId}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/storage', playerId] });
      queryClient.invalidateQueries({ queryKey: [`/api/storage/${playerId}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/player', playerId] });
      queryClient.invalidateQueries({ queryKey: [`/api/player/${playerId}`] });

      console.log(`🔄 Invalidated inventory data for player ${playerId}`);
    } catch (error) {
      console.error('Error invalidating inventory queries:', error);
    }
  }, [playerId, queryClient]);

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

  // Função para forçar atualização do inventário
  const forceInventoryUpdate = useCallback(() => {
    queryClient.invalidateQueries({ 
      queryKey: ['/api/player', playerId.toLowerCase()] 
    });
  }, [playerId, queryClient]);

  return {
    invalidateInventoryData,
    updateInventoryItem,
    removeInventoryItem,
    forceInventoryUpdate
  };
}

/**
 * ENHANCED STORAGE SERVICE
 * Modern storage service with improved performance and features
 */

import type { IStorage } from "../storage";
import type { 
  StorageItem, 
  EnhancedStorageItem,
  StorageOperation,
  StorageOperationResult,
  StorageStats,
  StorageConstraints,
  BatchStorageOperation,
  BatchOperationResult
} from "@shared/types/storage-types";
import type { Resource, Equipment, Player } from "@shared/types";
import { storageManager } from "@shared/utils/storage-manager";

export class EnhancedStorageService {
  constructor(private storage: IStorage) {}

  // Initialize the storage manager
  async initialize(): Promise<void> {
    const resources = await this.storage.getAllResources();
    const equipment = await this.storage.getAllEquipment();
    storageManager.initialize(resources, equipment);
  }

  // Get enhanced storage data for a player
  async getEnhancedStorageData(playerId: string): Promise<{
    items: EnhancedStorageItem[];
    stats: StorageStats;
    constraints: StorageConstraints;
  }> {
    const rawItems = await this.storage.getPlayerStorage(playerId);
    const enhancedItems = storageManager.processStorageItems(rawItems);
    const stats = storageManager.calculateStorageStats(enhancedItems);
    const constraints = storageManager.checkStorageConstraints(enhancedItems);

    return { items: enhancedItems, stats, constraints };
  }

  // Add item to storage with validation
  async addItemToStorage(
    playerId: string,
    resourceId: string,
    quantity: number,
    itemType: 'resource' | 'equipment' = 'resource'
  ): Promise<StorageOperationResult> {
    try {
      const { items, constraints } = await this.getEnhancedStorageData(playerId);
      
      const operation: StorageOperation = {
        itemId: resourceId,
        quantity,
        operation: 'add'
      };

      const validation = storageManager.validateStorageOperation(items, operation, constraints);
      if (!validation.success) {
        return validation;
      }

      // Check if item already exists
      const existingItems = await this.storage.getPlayerStorage(playerId);
      const existingItem = existingItems.find(item => 
        item.resourceId === resourceId && item.itemType === itemType
      );

      let result: StorageItem;

      if (existingItem) {
        result = await this.storage.updateStorageItem(existingItem.id, {
          quantity: existingItem.quantity + quantity,
          lastModified: Date.now()
        });
      } else {
        result = await this.storage.addStorageItem({
          playerId,
          resourceId,
          quantity,
          itemType,
          createdAt: Date.now(),
          lastModified: Date.now()
        });
      }

      return {
        success: true,
        message: `${quantity} itens adicionados ao armazém`,
        data: result
      };

    } catch (error) {
      return {
        success: false,
        message: "Erro ao adicionar item ao armazém",
        error: error instanceof Error ? error.message : "Erro desconhecido"
      };
    }
  }

  // Remove item from storage with validation
  async removeItemFromStorage(
    playerId: string,
    resourceId: string,
    quantity: number,
    itemType: 'resource' | 'equipment' = 'resource'
  ): Promise<StorageOperationResult> {
    try {
      const { items } = await this.getEnhancedStorageData(playerId);
      
      const operation: StorageOperation = {
        itemId: resourceId,
        quantity,
        operation: 'remove'
      };

      const validation = storageManager.validateStorageOperation(items, operation, {
        maxItems: 1000,
        maxWeight: 10000,
        currentItems: items.length,
        currentWeight: items.reduce((sum, item) => sum + item.totalWeight, 0),
        canAddItems: true,
        availableSlots: 1000 - items.length
      });

      if (!validation.success) {
        return validation;
      }

      const existingItems = await this.storage.getPlayerStorage(playerId);
      const existingItem = existingItems.find(item => 
        item.resourceId === resourceId && item.itemType === itemType
      );

      if (!existingItem) {
        return {
          success: false,
          message: "Item não encontrado no armazém",
          error: "ITEM_NOT_FOUND"
        };
      }

      const newQuantity = existingItem.quantity - quantity;

      if (newQuantity <= 0) {
        await this.storage.removeStorageItem(existingItem.id);
      } else {
        await this.storage.updateStorageItem(existingItem.id, {
          quantity: newQuantity,
          lastModified: Date.now()
        });
      }

      return {
        success: true,
        message: `${quantity} itens removidos do armazém`,
        data: { removedQuantity: quantity, remainingQuantity: Math.max(0, newQuantity) }
      };

    } catch (error) {
      return {
        success: false,
        message: "Erro ao remover item do armazém",
        error: error instanceof Error ? error.message : "Erro desconhecido"
      };
    }
  }

  // Transfer item from storage to inventory
  async transferToInventory(
    playerId: string,
    storageItemId: string,
    quantity: number
  ): Promise<StorageOperationResult> {
    try {
      // Get storage item
      const storageItems = await this.storage.getPlayerStorage(playerId);
      const storageItem = storageItems.find(item => item.id === storageItemId);
      
      if (!storageItem) {
        return {
          success: false,
          message: "Item não encontrado no armazém",
          error: "ITEM_NOT_FOUND"
        };
      }

      // Validate with storage manager
      const { items, constraints } = await this.getEnhancedStorageData(playerId);
      const operation: StorageOperation = {
        itemId: storageItem.resourceId,
        quantity,
        operation: 'transfer',
        sourceLocation: 'storage',
        targetLocation: 'inventory'
      };

      const validation = storageManager.validateStorageOperation(items, operation, constraints);
      if (!validation.success) {
        return validation;
      }

      // Get player for inventory validation
      const player = await this.storage.getPlayer(playerId);
      if (!player) {
        return {
          success: false,
          message: "Jogador não encontrado",
          error: "PLAYER_NOT_FOUND"
        };
      }

      // Get resource data for weight calculation
      const resource = await this.storage.getResource(storageItem.resourceId);
      if (!resource) {
        return {
          success: false,
          message: "Dados do recurso não encontrados",
          error: "RESOURCE_NOT_FOUND"
        };
      }

      const totalWeight = resource.weight * quantity;
      
      if (player.inventoryWeight + totalWeight > player.maxInventoryWeight) {
        return {
          success: false,
          message: "Espaço insuficiente no inventário",
          error: "INVENTORY_WEIGHT_EXCEEDED"
        };
      }

      // Perform the transfer
      const inventoryItems = await this.storage.getPlayerInventory(playerId);
      const existingInventoryItem = inventoryItems.find(item => 
        item.resourceId === storageItem.resourceId
      );

      if (existingInventoryItem) {
        await this.storage.updateInventoryItem(existingInventoryItem.id, {
          quantity: existingInventoryItem.quantity + quantity
        });
      } else {
        await this.storage.addInventoryItem({
          playerId,
          resourceId: storageItem.resourceId,
          quantity
        });
      }

      // Update storage item
      const newStorageQuantity = storageItem.quantity - quantity;
      if (newStorageQuantity <= 0) {
        await this.storage.removeStorageItem(storageItem.id);
      } else {
        await this.storage.updateStorageItem(storageItem.id, {
          quantity: newStorageQuantity,
          lastModified: Date.now()
        });
      }

      // Update player inventory weight
      await this.storage.updatePlayer(playerId, {
        inventoryWeight: player.inventoryWeight + totalWeight
      });

      return {
        success: true,
        message: `${quantity} itens transferidos para o inventário`,
        data: {
          transferredQuantity: quantity,
          remainingInStorage: Math.max(0, newStorageQuantity),
          newInventoryWeight: player.inventoryWeight + totalWeight
        }
      };

    } catch (error) {
      return {
        success: false,
        message: "Erro na transferência",
        error: error instanceof Error ? error.message : "Erro desconhecido"
      };
    }
  }

  // Batch operations
  async processBatchOperation(batchOperation: BatchStorageOperation): Promise<BatchOperationResult> {
    try {
      const { items, constraints } = await this.getEnhancedStorageData(batchOperation.playerId);
      
      // Validate batch operation
      const validation = storageManager.validateBatchOperation(items, batchOperation, constraints);
      
      if (batchOperation.validateOnly) {
        return validation;
      }

      if (!validation.success && validation.totalFailed > 0) {
        return validation;
      }

      // Execute operations
      const results: StorageOperationResult[] = [];
      
      for (const operation of batchOperation.operations) {
        let result: StorageOperationResult;
        
        switch (operation.operation) {
          case 'add':
            result = await this.addItemToStorage(
              batchOperation.playerId,
              operation.itemId,
              operation.quantity
            );
            break;
          case 'remove':
            result = await this.removeItemFromStorage(
              batchOperation.playerId,
              operation.itemId,
              operation.quantity
            );
            break;
          default:
            result = {
              success: false,
              message: "Operação não suportada em lote",
              error: "UNSUPPORTED_BATCH_OPERATION"
            };
        }
        
        results.push(result);
      }

      const successful = results.filter(r => r.success).length;
      const failed = results.length - successful;

      return {
        success: failed === 0,
        message: failed === 0 ? 
          `Todas as ${successful} operações executadas com sucesso` :
          `${successful} operações bem-sucedidas, ${failed} falharam`,
        results,
        totalProcessed: successful,
        totalFailed: failed
      };

    } catch (error) {
      return {
        success: false,
        message: "Erro na operação em lote",
        results: [],
        totalProcessed: 0,
        totalFailed: batchOperation.operations.length
      };
    }
  }

  // Storage analytics and optimization
  async getStorageAnalytics(playerId: string): Promise<{
    stats: StorageStats;
    recommendations: string[];
    optimization: {
      duplicateItems: number;
      lowValueItems: number;
      heavyItems: number;
      suggestions: string[];
    };
  }> {
    const { items, stats } = await this.getEnhancedStorageData(playerId);
    
    const recommendations: string[] = [];
    const optimization = {
      duplicateItems: 0,
      lowValueItems: 0,
      heavyItems: 0,
      suggestions: [] as string[]
    };

    // Analyze storage efficiency
    if (stats.storageCapacity.percentage > 80) {
      recommendations.push("Armazém quase cheio - considere vender ou usar itens");
    }

    if (stats.totalWeight > 8000) {
      recommendations.push("Peso alto no armazém - organize itens pesados");
    }

    // Find optimization opportunities
    items.forEach(item => {
      if (item.totalValue < 10 && item.quantity > 50) {
        optimization.lowValueItems++;
      }
      
      if (item.totalWeight > 100) {
        optimization.heavyItems++;
      }
    });

    if (optimization.lowValueItems > 0) {
      optimization.suggestions.push(`${optimization.lowValueItems} tipos de itens de baixo valor podem ser vendidos`);
    }

    if (optimization.heavyItems > 0) {
      optimization.suggestions.push(`${optimization.heavyItems} tipos de itens pesados ocupam muito espaço`);
    }

    return { stats, recommendations, optimization };
  }

  // Cleanup and maintenance
  async cleanupStorage(playerId: string): Promise<StorageOperationResult> {
    try {
      const items = await this.storage.getPlayerStorage(playerId);
      let cleaned = 0;

      for (const item of items) {
        // Remove items with 0 quantity
        if (item.quantity <= 0) {
          await this.storage.removeStorageItem(item.id);
          cleaned++;
        }
        
        // Validate item references
        const itemData = await (item.itemType === 'equipment' ? 
          this.storage.getEquipment(item.resourceId) : 
          this.storage.getResource(item.resourceId));
        
        if (!itemData) {
          await this.storage.removeStorageItem(item.id);
          cleaned++;
        }
      }

      return {
        success: true,
        message: cleaned > 0 ? 
          `Armazém limpo - ${cleaned} itens inválidos removidos` :
          "Armazém já está limpo",
        data: { itemsRemoved: cleaned }
      };

    } catch (error) {
      return {
        success: false,
        message: "Erro na limpeza do armazém",
        error: error instanceof Error ? error.message : "Erro desconhecido"
      };
    }
  }
}

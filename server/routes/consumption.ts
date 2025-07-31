// Consumption system routes for food and drink
import { Router } from 'express';
import type { IStorage } from '../storage';

export function createConsumptionRoutes(storage: IStorage): Router {
  const router = Router();

  // POST /api/player/:playerId/consume - Consume food or drink item
  router.post('/player/:playerId/consume', async (req, res) => {
    try {
      const { playerId } = req.params;
      const { itemId, location, hungerRestore, thirstRestore } = req.body;

      // Get quantity from request, default to 1
      const quantity = parseInt(req.body.quantity) || 1;

      // Enhanced validation with modern system support
      if (!itemId || !location) {
        return res.status(400).json({ error: 'Missing required fields: itemId and location' });
      }

      if (typeof hungerRestore !== 'number' || typeof thirstRestore !== 'number') {
        return res.status(400).json({ error: 'hungerRestore and thirstRestore must be numbers' });
      }

      if (hungerRestore < 0 || thirstRestore < 0) {
        return res.status(400).json({ error: 'Restoration values cannot be negative' });
      }

      if (hungerRestore === 0 && thirstRestore === 0) {
        return res.status(400).json({ error: 'Item must provide at least some hunger or thirst restoration' });
      }

      if (quantity <= 0) {
        return res.status(400).json({ error: 'Quantity must be greater than 0' });
      }

      if (!['inventory', 'storage'].includes(location)) {
        return res.status(400).json({ error: 'Invalid location. Must be inventory or storage' });
      }

      // Get player
      const player = await storage.getPlayer(playerId);
      if (!player) {
        return res.status(404).json({ error: 'Player not found' });
      }

      // Check if item exists in specified location with improved ID handling
      let hasItem = false;
      let itemQuantity = 0;
      let inventoryItemId = req.body.inventoryItemId;
      let targetItem: any = null;

      if (location === 'inventory') {
        const inventoryItems = await storage.getPlayerInventory(playerId);
        
        // Priority 1: Try to find by inventory item ID (direct record ID)
        targetItem = inventoryItems.find((item: any) => item.id === itemId);
        
        // Priority 2: Try by resource ID (modern system)
        if (!targetItem) {
          targetItem = inventoryItems.find((item: any) => item.resourceId === itemId);
        }
        
        // Priority 3: Try by item data matching (legacy support)
        if (!targetItem) {
          const resources = await storage.getAllResources();
          const matchingResource = resources.find((r: any) => r.id === itemId);
          if (matchingResource) {
            targetItem = inventoryItems.find((item: any) => item.resourceId === matchingResource.id);
          }
        }
        
        if (targetItem && targetItem.quantity > 0) {
          hasItem = true;
          itemQuantity = targetItem.quantity;
          inventoryItemId = targetItem.id; // Ensure we have the inventory record ID
        }
      } else if (location === 'storage') {
        const storageItems = await storage.getPlayerStorage(playerId);
        
        // Priority 1: Direct resource ID match
        targetItem = storageItems.find((item: any) => item.resourceId === itemId);
        
        // Priority 2: Handle legacy records and ensure consumable type
        if (!targetItem) {
          targetItem = storageItems.find((item: any) => 
            item.resourceId === itemId && 
            (item.itemType === 'resource' || item.itemType === 'consumable' || !item.itemType)
          );
        }
        
        if (targetItem && targetItem.quantity > 0) {
          hasItem = true;
          itemQuantity = targetItem.quantity;
        }
      }

      if (!hasItem) {
        return res.status(400).json({ error: 'Item not found in specified location or insufficient quantity' });
      }

      // Validate quantity available
      if (quantity > itemQuantity) {
        return res.status(400).json({ error: 'Insufficient quantity available' });
      }

      // Calculate new hunger and thirst (don't exceed max values)
      const totalHungerRestore = hungerRestore * quantity;
      const totalThirstRestore = thirstRestore * quantity;
      const newHunger = Math.min(player.hunger + totalHungerRestore, player.maxHunger);
      const newThirst = Math.min(player.thirst + totalThirstRestore, player.maxThirst);

      // Update player stats
      await storage.updatePlayer(playerId, {
        hunger: newHunger,
        thirst: newThirst
      });

      // Remove consumed quantity of the item
      if (location === 'inventory' && targetItem) {
        const newQuantity = targetItem.quantity - quantity;
        if (newQuantity <= 0) {
          await storage.removeInventoryItem(targetItem.id);
        } else {
          await storage.updateInventoryItem(targetItem.id, { quantity: newQuantity });
        }
      } else if (location === 'storage' && targetItem) {
        const newQuantity = targetItem.quantity - quantity;
        if (newQuantity <= 0) {
          await storage.removeStorageItem(targetItem.id);
        } else {
          await storage.updateStorageItem(targetItem.id, { quantity: newQuantity });
        }
      }

      // Return updated player data
      const updatedPlayer = await storage.getPlayer(playerId);
      
      // Invalidate cache to ensure frontend sees updated data
      try {
        const { invalidateStorageCache, invalidateInventoryCache, invalidatePlayerCache } = await import("../cache/memory-cache");
        invalidateStorageCache(playerId);
        invalidateInventoryCache(playerId);
        invalidatePlayerCache(playerId);
      } catch (error) {
        console.warn('Cache invalidation failed:', error);
      }
      
      res.json({
        success: true,
        player: updatedPlayer,
        consumed: {
          itemId,
          location,
          quantity: quantity,
          hungerRestored: newHunger - player.hunger,
          thirstRestored: newThirst - player.thirst
        },
        // Return values for frontend display
        hungerRestored: newHunger - player.hunger,
        thirstRestored: newThirst - player.thirst
      });

    } catch (error) {
      console.error('Error consuming item:', error);
      res.status(500).json({ error: 'Failed to consume item' });
    }
  });

  return router;
}
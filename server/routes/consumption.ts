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

      // Validate input
      if (!itemId || !location || typeof hungerRestore !== 'number' || typeof thirstRestore !== 'number') {
        return res.status(400).json({ error: 'Missing required fields or invalid types' });
      }

      if (!['inventory', 'storage'].includes(location)) {
        return res.status(400).json({ error: 'Invalid location. Must be inventory or storage' });
      }

      // Get player
      const player = await storage.getPlayer(playerId);
      if (!player) {
        return res.status(404).json({ error: 'Player not found' });
      }

      // Check if item exists in specified location
      let hasItem = false;
      let itemQuantity = 0;

      if (location === 'inventory') {
        const inventoryItems = await storage.getPlayerInventory(playerId);
        const inventoryItem = inventoryItems.find((item: any) => item.resourceId === itemId);
        if (inventoryItem && inventoryItem.quantity > 0) {
          hasItem = true;
          itemQuantity = inventoryItem.quantity;
        }
      } else {
        const storageItems = await storage.getPlayerStorage(playerId);
        const storageItem = storageItems.find((item: any) => item.resourceId === itemId && item.itemType === 'resource');
        if (storageItem && storageItem.quantity > 0) {
          hasItem = true;
          itemQuantity = storageItem.quantity;
        }
      }

      if (!hasItem) {
        return res.status(400).json({ error: 'Item not found in specified location or insufficient quantity' });
      }

      // Calculate new hunger and thirst (don't exceed max values)
      const newHunger = Math.min(player.hunger + hungerRestore, player.maxHunger);
      const newThirst = Math.min(player.thirst + thirstRestore, player.maxThirst);

      // Update player stats
      await storage.updatePlayer(playerId, {
        hunger: newHunger,
        thirst: newThirst
      });

      // Remove one unit of the consumed item
      if (location === 'inventory') {
        const inventoryItems = await storage.getPlayerInventory(playerId);
        const inventoryItem = inventoryItems.find((item: any) => item.resourceId === itemId);
        if (inventoryItem) {
          if (inventoryItem.quantity === 1) {
            await storage.removeInventoryItem(inventoryItem.id);
          } else {
            await storage.updateInventoryItem(inventoryItem.id, { quantity: inventoryItem.quantity - 1 });
          }
        }
      } else {
        const storageItems = await storage.getPlayerStorage(playerId);
        const storageItem = storageItems.find((item: any) => item.resourceId === itemId && item.itemType === 'resource');
        if (storageItem) {
          if (storageItem.quantity === 1) {
            await storage.removeStorageItem(storageItem.id);
          } else {
            await storage.updateStorageItem(storageItem.id, { quantity: storageItem.quantity - 1 });
          }
        }
      }

      // Return updated player data
      const updatedPlayer = await storage.getPlayer(playerId);
      
      res.json({
        success: true,
        player: updatedPlayer,
        consumed: {
          itemId,
          location,
          hungerRestored: newHunger - player.hunger,
          thirstRestored: newThirst - player.thirst
        }
      });

    } catch (error) {
      console.error('Error consuming item:', error);
      res.status(500).json({ error: 'Failed to consume item' });
    }
  });

  return router;
}
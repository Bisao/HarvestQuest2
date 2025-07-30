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

      // Validate input
      if (!itemId || !location || typeof hungerRestore !== 'number' || typeof thirstRestore !== 'number') {
        return res.status(400).json({ error: 'Missing required fields or invalid types' });
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

      // Check if item exists in specified location
      let hasItem = false;
      let itemQuantity = 0;
      let inventoryItemId = req.body.inventoryItemId;

      if (location === 'inventory') {
        const inventoryItems = await storage.getPlayerInventory(playerId);
        const inventoryItem = inventoryItems.find((item: any) => 
          item.resourceId === itemId || (inventoryItemId && item.id === inventoryItemId)
        );
        if (inventoryItem && inventoryItem.quantity > 0) {
          hasItem = true;
          itemQuantity = inventoryItem.quantity;
          inventoryItemId = inventoryItem.id; // Ensure we have the correct ID
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
      if (location === 'inventory') {
        const inventoryItems = await storage.getPlayerInventory(playerId);
        const inventoryItem = inventoryItems.find((item: any) => 
          item.resourceId === itemId || (inventoryItemId && item.id === inventoryItemId)
        );
        if (inventoryItem) {
          const newQuantity = inventoryItem.quantity - quantity;
          if (newQuantity <= 0) {
            await storage.removeInventoryItem(inventoryItem.id);
          } else {
            await storage.updateInventoryItem(inventoryItem.id, { quantity: newQuantity });
          }
        }
      } else {
        const storageItems = await storage.getPlayerStorage(playerId);
        const storageItem = storageItems.find((item: any) => item.resourceId === itemId && item.itemType === 'resource');
        if (storageItem) {
          const newQuantity = storageItem.quantity - quantity;
          if (newQuantity <= 0) {
            await storage.removeStorageItem(storageItem.id);
          } else {
            await storage.updateStorageItem(storageItem.id, { quantity: newQuantity });
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
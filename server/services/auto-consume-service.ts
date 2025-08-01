
import type { IStorage } from "../storage";
import { getAllGameItems } from "../data/items-modern";

export class AutoConsumeService {
  private checkTimer: NodeJS.Timeout | null = null;
  private isRunning = false;

  constructor(private storage: IStorage) {}

  /**
   * Start auto consume system
   */
  startAutoConsume(): void {
    if (this.isRunning) {
      console.log('⚠️ Auto consume already running');
      return;
    }

    this.isRunning = true;
    console.log('🍖💧 Starting auto consume system');

    // Check every 30 seconds
    this.checkTimer = setInterval(async () => {
      await this.checkAllPlayersForAutoConsume();
    }, 30000);
  }

  /**
   * Stop auto consume system
   */
  stopAutoConsume(): void {
    if (this.checkTimer) {
      clearInterval(this.checkTimer);
      this.checkTimer = null;
    }
    this.isRunning = false;
    console.log('🛑 Stopped auto consume system');
  }

  /**
   * Check all players for auto consume triggers
   */
  private async checkAllPlayersForAutoConsume(): Promise<void> {
    try {
      const players = await this.storage.getAllPlayers();

      for (const player of players) {
        if (!player.autoConsume) continue;

        const hungerPercentage = (player.hunger / player.maxHunger) * 100;
        const thirstPercentage = (player.thirst / player.maxThirst) * 100;

        // Auto consume food if hunger is 15% or below and we have food equipped
        if (hungerPercentage <= 15 && player.equippedFood && player.hunger < player.maxHunger * 0.75) {
          await this.autoConsumeItem(player.id, player.equippedFood, 'food');
        }

        // Auto consume drink if thirst is 15% or below and we have drink equipped
        if (thirstPercentage <= 15 && player.equippedDrink && player.thirst < player.maxThirst * 0.75) {
          await this.autoConsumeItem(player.id, player.equippedDrink, 'drink');
        }
      }
    } catch (error) {
      console.error('Error in auto consume check:', error);
    }
  }

  /**
   * Auto consume an equipped item
   */
  private async autoConsumeItem(playerId: string, itemId: string, type: 'food' | 'drink'): Promise<void> {
    try {
      const player = await this.storage.getPlayer(playerId);
      if (!player) return;

      // Get item data from modern items system
      const allItems = getAllGameItems();
      const itemData = allItems.find(item => item.id === itemId);
      if (!itemData || itemData.category !== 'consumable') return;

      // Check if we have the item in storage
      const storageItems = await this.storage.getPlayerStorage(playerId);
      const storageItem = storageItems.find(item => item.resourceId === itemId);
      
      if (!storageItem || storageItem.quantity <= 0) {
        // Unequip the item if we don't have it anymore
        const updateData = type === 'food' ? { equippedFood: null } : { equippedDrink: null };
        await this.storage.updatePlayer(playerId, updateData);
        console.log(`📦 Auto-unequipped ${type} for player ${playerId} - no items in storage`);
        return;
      }

      // Consume the item - get restoration values from attributes
      const hungerRestore = itemData.attributes?.hunger_restore || 0;
      const thirstRestore = itemData.attributes?.thirst_restore || 0;

      // Don't over-consume - check if we really need it
      const currentHungerPercentage = (player.hunger / player.maxHunger) * 100;
      const currentThirstPercentage = (player.thirst / player.maxThirst) * 100;

      if (type === 'food' && currentHungerPercentage >= 75) return;
      if (type === 'drink' && currentThirstPercentage >= 75) return;

      const newHunger = Math.min(player.hunger + hungerRestore, player.maxHunger);
      const newThirst = Math.min(player.thirst + thirstRestore, player.maxThirst);

      // Update player stats
      await this.storage.updatePlayer(playerId, {
        hunger: newHunger,
        thirst: newThirst
      });

      // Remove one item from storage
      const newQuantity = storageItem.quantity - 1;
      if (newQuantity <= 0) {
        await this.storage.removeStorageItem(storageItem.id);
        // Unequip the item since we're out
        const updateData = type === 'food' ? { equippedFood: null } : { equippedDrink: null };
        await this.storage.updatePlayer(playerId, updateData);
        console.log(`📦 Auto-unequipped ${type} for player ${playerId} - consumed last item`);
      } else {
        await this.storage.updateStorageItem(storageItem.id, { quantity: newQuantity });
      }

      console.log(`🍽️ Auto-consumed ${itemData.displayName} for player ${playerId}: H:${player.hunger}→${newHunger}, T:${player.thirst}→${newThirst}`);

      // Invalidate cache
      try {
        const { invalidatePlayerCache, invalidateStorageCache } = await import("../cache/memory-cache");
        invalidatePlayerCache(playerId);
        invalidateStorageCache(playerId);
      } catch (error) {
        console.warn('Cache invalidation failed during auto consume:', error);
      }

    } catch (error) {
      console.error(`Error auto-consuming ${type} for player ${playerId}:`, error);
    }
  }

  /**
   * Get status of auto consume system
   */
  getStatus(): { isRunning: boolean; intervalMs: number } {
    return {
      isRunning: this.isRunning,
      intervalMs: 30000 // 30 seconds
    };
  }
}

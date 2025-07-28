// Migration helper to preserve player data during database migrations
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

export interface PlayerBackup {
  id: string;
  username: string;
  level: number;
  experience: number;
  hunger: number;
  maxHunger: number;
  thirst: number;
  maxThirst: number;
  coins: number;
  inventoryWeight: number;
  maxInventoryWeight: number;
  autoStorage: boolean;
  craftedItemsDestination: string;
  equippedHelmet?: string;
  equippedChestplate?: string;
  equippedLeggings?: string;
  equippedBoots?: string;
  equippedWeapon?: string;
  equippedTool?: string;
  inventory: Array<{
    id: string;
    resourceId: string;
    quantity: number;
  }>;
  storage: Array<{
    id: string;
    resourceId: string;
    quantity: number;
  }>;
}

const BACKUP_FILE = join(process.cwd(), 'player-backup.json');

export class MigrationHelper {
  
  // Save player data before migration
  static savePlayerData(players: PlayerBackup[]): void {
    try {
      writeFileSync(BACKUP_FILE, JSON.stringify(players, null, 2));
      console.log(`✓ Saved ${players.length} player(s) data to backup file`);
    } catch (error) {
      console.error('Failed to save player data:', error);
    }
  }
  
  // Load player data after migration
  static loadPlayerData(): PlayerBackup[] {
    try {
      if (existsSync(BACKUP_FILE)) {
        const data = readFileSync(BACKUP_FILE, 'utf8');
        const players = JSON.parse(data) as PlayerBackup[];
        console.log(`✓ Loaded ${players.length} player(s) data from backup file`);
        return players;
      }
    } catch (error) {
      console.error('Failed to load player data:', error);
    }
    return [];
  }
  
  // Clean up backup file after successful restoration
  static cleanupBackup(): void {
    try {
      if (existsSync(BACKUP_FILE)) {
        const { unlinkSync } = require('fs');
        unlinkSync(BACKUP_FILE);
        console.log('✓ Cleaned up backup file');
      }
    } catch (error) {
      console.error('Failed to cleanup backup file:', error);
    }
  }
  
  // Check if this is a migration (backup file exists)
  static isMigration(): boolean {
    return existsSync(BACKUP_FILE);
  }
}
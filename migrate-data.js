#!/usr/bin/env node

// Migration script to preserve player data during database migrations
// Run this BEFORE deleting the database to backup player data

const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const DB_PATH = path.join(__dirname, 'database.sqlite');
const BACKUP_FILE = path.join(__dirname, 'player-backup.json');

function backupPlayerData() {
  if (!fs.existsSync(DB_PATH)) {
    console.log('No database found, nothing to backup');
    return;
  }

  try {
    const db = new Database(DB_PATH);
    
    // Get all players
    const players = db.prepare('SELECT * FROM players').all();
    
    if (players.length === 0) {
      console.log('No players found in database');
      db.close();
      return;
    }
    
    const playerBackups = [];
    
    for (const player of players) {
      console.log(`Backing up data for player: ${player.username}`);
      
      // Get player's inventory
      const inventory = db.prepare('SELECT * FROM inventory_items WHERE player_id = ?').all(player.id);
      
      // Get player's storage
      const storage = db.prepare('SELECT * FROM storage_items WHERE player_id = ?').all(player.id);
      
      playerBackups.push({
        ...player,
        inventory: inventory.map(item => ({
          id: item.id,
          resourceId: item.resource_id,
          quantity: item.quantity
        })),
        storage: storage.map(item => ({
          id: item.id,
          resourceId: item.resource_id,
          quantity: item.quantity
        }))
      });
    }
    
    // Save to backup file
    fs.writeFileSync(BACKUP_FILE, JSON.stringify(playerBackups, null, 2));
    console.log(`✓ Successfully backed up ${playerBackups.length} player(s) to ${BACKUP_FILE}`);
    console.log('You can now safely delete the database and restart the application');
    
    db.close();
    
  } catch (error) {
    console.error('Failed to backup player data:', error);
    process.exit(1);
  }
}

// Run the backup
console.log('Starting player data backup...');
backupPlayerData();
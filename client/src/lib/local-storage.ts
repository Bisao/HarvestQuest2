
// Local Storage Management for Game Saves
// Provides backup storage in browser for better user experience

export interface LocalSave {
  id: string;
  username: string;
  level: number;
  experience: number;
  lastPlayed: number;
  syncedWithServer: boolean;
}

const SAVES_KEY = 'coletor_adventures_saves';
const CURRENT_PLAYER_KEY = 'coletor_current_player';

export class LocalStorageManager {
  static getSaves(): LocalSave[] {
    try {
      const saves = localStorage.getItem(SAVES_KEY);
      return saves ? JSON.parse(saves) : [];
    } catch (error) {
      console.error('Error loading saves from localStorage:', error);
      return [];
    }
  }

  static addSave(save: LocalSave): void {
    try {
      const saves = this.getSaves();
      const existingIndex = saves.findIndex(s => s.username === save.username);
      
      if (existingIndex >= 0) {
        saves[existingIndex] = save;
      } else {
        saves.push(save);
      }
      
      localStorage.setItem(SAVES_KEY, JSON.stringify(saves));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  static removeSave(username: string): void {
    try {
      const saves = this.getSaves();
      const filtered = saves.filter(s => s.username !== username);
      localStorage.setItem(SAVES_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error removing save from localStorage:', error);
    }
  }

  static getCurrentPlayer(): { username: string; id: string } | null {
    try {
      const player = localStorage.getItem(CURRENT_PLAYER_KEY);
      return player ? JSON.parse(player) : null;
    } catch (error) {
      console.error('Error loading current player:', error);
      return null;
    }
  }

  static setCurrentPlayer(username: string, id: string): void {
    try {
      localStorage.setItem(CURRENT_PLAYER_KEY, JSON.stringify({ username, id }));
    } catch (error) {
      console.error('Error setting current player:', error);
    }
  }

  static clearCurrentPlayer(): void {
    try {
      localStorage.removeItem(CURRENT_PLAYER_KEY);
    } catch (error) {
      console.error('Error clearing current player:', error);
    }
  }

  static syncSaves(serverSaves: any[]): LocalSave[] {
    try {
      const localSaves = this.getSaves();
      const mergedSaves: LocalSave[] = [];

      // Add server saves (marked as synced)
      for (const serverSave of serverSaves) {
        mergedSaves.push({
          id: serverSave.id,
          username: serverSave.username,
          level: serverSave.level,
          experience: serverSave.experience,
          lastPlayed: serverSave.lastPlayed || Date.now(),
          syncedWithServer: true
        });
      }

      // Add local saves that aren't on server (marked as not synced)
      for (const localSave of localSaves) {
        const existsOnServer = serverSaves.some(s => s.username === localSave.username);
        if (!existsOnServer) {
          mergedSaves.push({
            ...localSave,
            syncedWithServer: false
          });
        }
      }

      // Update localStorage with merged data
      localStorage.setItem(SAVES_KEY, JSON.stringify(mergedSaves));
      return mergedSaves;
    } catch (error) {
      console.error('Error syncing saves:', error);
      return this.getSaves();
    }
  }

  static markAsSynced(username: string): void {
    try {
      const saves = this.getSaves();
      const save = saves.find(s => s.username === username);
      if (save) {
        save.syncedWithServer = true;
        localStorage.setItem(SAVES_KEY, JSON.stringify(saves));
      }
    } catch (error) {
      console.error('Error marking save as synced:', error);
    }
  }

  static getUnsyncedSaves(): LocalSave[] {
    return this.getSaves().filter(save => !save.syncedWithServer);
  }

  static clear(): void {
    try {
      localStorage.removeItem(SAVES_KEY);
      localStorage.removeItem(CURRENT_PLAYER_KEY);
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }
}


import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { LocalStorageManager, type LocalSave } from '@/lib/local-storage';

export function useLocalSaves() {
  const [localSaves, setLocalSaves] = useState<LocalSave[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const queryClient = useQueryClient();

  // Server saves query
  const { data: serverSaves = [], isLoading: isLoadingServerSaves } = useQuery({
    queryKey: ["/api/saves"],
    queryFn: async () => {
      const response = await fetch("/api/saves");
      if (!response.ok) {
        throw new Error("Failed to fetch saves");
      }
      return response.json();
    },
    retry: 1,
    enabled: isOnline,
  });

  // Sync saves when server data changes
  useEffect(() => {
    if (serverSaves.length >= 0) {
      const synced = LocalStorageManager.syncSaves(serverSaves);
      setLocalSaves(synced);
    }
  }, [serverSaves]);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      queryClient.invalidateQueries({ queryKey: ["/api/saves"] });
    };
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [queryClient]);

  // Load local saves on mount
  useEffect(() => {
    const saves = LocalStorageManager.getSaves();
    setLocalSaves(saves);
  }, []);

  const updateLocalSaves = () => {
    setLocalSaves(LocalStorageManager.getSaves());
  };

  const getUnsyncedCount = () => {
    return LocalStorageManager.getUnsyncedSaves().length;
  };

  return {
    localSaves,
    isOnline,
    isLoading: isLoadingServerSaves && localSaves.length === 0,
    updateLocalSaves,
    getUnsyncedCount,
  };
}

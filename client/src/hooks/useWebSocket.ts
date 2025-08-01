// WebSocket Hook for Real-time Updates in Coletor Adventures
import { useEffect, useRef, useState } from 'react';
import { queryClient } from '@/lib/queryClient';

interface WebSocketMessage {
  type: string;
  data?: any;
  timestamp: number;
}

export function useWebSocket(playerId: string | null) {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const connect = () => {
    if (!playerId) return;

    try {
      // Determine WebSocket protocol based on current location
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('🔌 WebSocket connected');
        setIsConnected(true);
        setConnectionError(null);

        // Register with server
        ws.send(JSON.stringify({
          type: 'register',
          playerId: playerId
        }));

        // Start heartbeat
        heartbeatIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping' }));
          }
        }, 30000);
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          handleMessage(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.onclose = (event) => {
        console.log('🔌 WebSocket disconnected:', event.code, event.reason);
        setIsConnected(false);
        cleanup();

        // Reconnect after delay unless it was a clean close
        if (event.code !== 1000) {
          reconnectTimeoutRef.current = setTimeout(connect, 5000);
        }
      };

      ws.onerror = (error) => {
        console.error('🔌 WebSocket error:', error);
        setConnectionError('Connection failed');
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setConnectionError('Failed to connect');
    }
  };

  const handleMessage = (message: WebSocketMessage) => {
    switch (message.type) {
      case 'player_update':
        // Update player data in cache
        if (playerId && message.data) {
          queryClient.setQueryData(["/api/player", playerId], message.data);
        }
        break;

      case 'inventory_update':
        // Update inventory data in cache
        if (playerId && message.data) {
          queryClient.setQueryData(["/api/inventory", playerId], message.data);
        }
        break;

      case 'storage_update':
        // Update storage data in cache
        if (playerId && message.data) {
          queryClient.setQueryData(["/api/storage", playerId], message.data);
        }
        break;

      case 'expedition_update':
        // Update expedition data in cache
        if (playerId && message.data) {
          queryClient.setQueryData(["/api/expeditions", playerId], message.data);
        }
        break;

      case 'connection':
      case 'registered':
        console.log('🔌 WebSocket registration confirmed');
        break;

      case 'ping':
        // Respond to server ping
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ type: 'pong' }));
        }
        break;

      case 'pong':
        // Server responded to our ping
        break;
      case 'player_update':
      case 'player_updated':
        console.log('📡 Real-time player update received:', message.data);
        // Force refresh player data when receiving real-time updates
        queryClient.invalidateQueries({ queryKey: [`/api/player/${message.data.id}`] });
        queryClient.refetchQueries({ queryKey: [`/api/player/${message.data.id}`] });
        break;

      case 'item_consumed':
        console.log('📡 Item consumption update received:', message.data);
        // Force refresh inventory and storage when item is consumed
        queryClient.invalidateQueries({ queryKey: ["/api/inventory", message.data.playerId] });
        queryClient.invalidateQueries({ queryKey: ["/api/storage", message.data.playerId] });
        break;

      default:
        console.log('Unknown WebSocket message type:', message.type);
    }
  };

  const cleanup = () => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  };

  const disconnect = () => {
    cleanup();
    if (wsRef.current) {
      wsRef.current.close(1000, 'Client disconnecting');
      wsRef.current = null;
    }
    setIsConnected(false);
  };

  useEffect(() => {
    if (playerId) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [playerId]);

  // Send message to server
  const sendMessage = (message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
      return true;
    }
    return false;
  };

  return {
    isConnected,
    connectionError,
    sendMessage,
    disconnect
  };
}
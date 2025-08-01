
// WebSocket Service for Real-time Updates in Coletor Adventures
import { WebSocketServer, WebSocket } from 'ws';
import type { Server } from 'http';

interface ConnectedClient {
  ws: WebSocket;
  playerId: string;
  lastPing: number;
}

let globalWebSocketService: WebSocketService | null = null;

export class WebSocketService {
  private wss: WebSocketServer;
  private clients: Map<string, ConnectedClient> = new Map();
  private heartbeatInterval: NodeJS.Timeout;

  constructor(server: Server) {
    // Create WebSocket server on a distinct path to avoid conflicts with Vite HMR
    this.wss = new WebSocketServer({ server, path: '/ws' });
    
    this.wss.on('connection', (ws, request) => {
      this.handleConnection(ws, request);
    });

    // Start heartbeat to keep connections alive
    this.heartbeatInterval = setInterval(() => {
      this.heartbeat();
    }, 30000); // 30 seconds

    // Set global reference
    globalWebSocketService = this;

    console.log('🔌 WebSocket server initialized on /ws');
  }

  private handleConnection(ws: WebSocket, request: any) {
    console.log('🔌 New WebSocket connection');

    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        this.handleMessage(ws, message);
      } catch (error) {
        console.error('Invalid WebSocket message:', error);
      }
    });

    ws.on('close', () => {
      this.handleDisconnection(ws);
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    // Send initial connection confirmation
    this.sendToClient(ws, {
      type: 'connection',
      status: 'connected',
      timestamp: Date.now()
    });
  }

  private handleMessage(ws: WebSocket, message: any) {
    switch (message.type) {
      case 'register':
        if (message.playerId) {
          this.registerClient(ws, message.playerId);
        }
        break;
      case 'ping':
        this.sendToClient(ws, { type: 'pong', timestamp: Date.now() });
        break;
      default:
        console.log('Unknown WebSocket message type:', message.type);
    }
  }

  private registerClient(ws: WebSocket, playerId: string) {
    // Remove any existing connection for this player
    const existingClient = this.clients.get(playerId);
    if (existingClient && existingClient.ws.readyState === WebSocket.OPEN) {
      existingClient.ws.close();
    }

    // Register new client
    this.clients.set(playerId, {
      ws,
      playerId,
      lastPing: Date.now()
    });

    console.log(`🔌 Player ${playerId} registered for real-time updates`);
    
    this.sendToClient(ws, {
      type: 'registered',
      playerId,
      timestamp: Date.now()
    });
  }

  private handleDisconnection(ws: WebSocket) {
    // Find and remove the disconnected client
    const clientsArray = Array.from(this.clients.entries());
    for (const [playerId, client] of clientsArray) {
      if (client.ws === ws) {
        this.clients.delete(playerId);
        console.log(`🔌 Player ${playerId} disconnected`);
        break;
      }
    }
  }

  private heartbeat() {
    const now = Date.now();
    const clientsArray = Array.from(this.clients.entries());
    for (const [playerId, client] of clientsArray) {
      if (client.ws.readyState === WebSocket.OPEN) {
        // Check if client is still alive (hasn't responded to ping in 60 seconds)
        if (now - client.lastPing > 60000) {
          console.log(`🔌 Removing stale connection for player ${playerId}`);
          client.ws.terminate();
          this.clients.delete(playerId);
        } else {
          // Send ping
          this.sendToClient(client.ws, { type: 'ping', timestamp: now });
        }
      } else {
        // Remove dead connections
        this.clients.delete(playerId);
      }
    }
  }

  private sendToClient(ws: WebSocket, data: any) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data));
    }
  }

  // Public methods for broadcasting updates
  public broadcastPlayerUpdate(playerId: string, playerData: any) {
    const client = this.clients.get(playerId);
    if (client && client.ws.readyState === WebSocket.OPEN) {
      this.sendToClient(client.ws, {
        type: 'player_update',
        data: playerData,
        playerId: playerId,
        timestamp: Date.now()
      });
      console.log(`📡 Player update sent to ${playerId}`);
    } else {
      console.log(`🔌 No active connection for player ${playerId}`);
    }
  }

  public broadcastInventoryUpdate(playerId: string, inventoryData: any) {
    const client = this.clients.get(playerId);
    if (client && client.ws.readyState === WebSocket.OPEN) {
      this.sendToClient(client.ws, {
        type: 'inventory_update',
        data: inventoryData,
        timestamp: Date.now()
      });
    }
  }

  public broadcastStorageUpdate(playerId: string, storageData: any) {
    const client = this.clients.get(playerId);
    if (client && client.ws.readyState === WebSocket.OPEN) {
      this.sendToClient(client.ws, {
        type: 'storage_update',
        data: storageData,
        timestamp: Date.now()
      });
    }
  }

  public broadcastExpeditionUpdate(playerId: string, expeditionData: any) {
    const client = this.clients.get(playerId);
    if (client && client.ws.readyState === WebSocket.OPEN) {
      this.sendToClient(client.ws, {
        type: 'expedition_update',
        data: expeditionData,
        timestamp: Date.now()
      });
    }
  }

  public getConnectedClients(): number {
    return this.clients.size;
  }

  public isPlayerConnected(playerId: string): boolean {
    const client = this.clients.get(playerId);
    return client ? client.ws.readyState === WebSocket.OPEN : false;
  }

  public shutdown() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    
    // Close all client connections
    const clientsArray = Array.from(this.clients.values());
    for (const client of clientsArray) {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.close();
      }
    }
    
    this.clients.clear();
    this.wss.close();
    globalWebSocketService = null;
    console.log('🔌 WebSocket service shut down');
  }
}

// Global broadcast functions
export function broadcastToPlayer(playerId: string, message: any) {
  if (globalWebSocketService) {
    const client = globalWebSocketService['clients'].get(playerId);
    if (client && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify({
        ...message,
        timestamp: Date.now()
      }));
      console.log(`📡 Message sent to player ${playerId}:`, message.type);
    }
  }
}

export function broadcastPlayerUpdate(playerId: string, playerData: any) {
  if (globalWebSocketService) {
    globalWebSocketService.broadcastPlayerUpdate(playerId, playerData);
  }
}

export function broadcastInventoryUpdate(playerId: string, inventoryData: any) {
  if (globalWebSocketService) {
    globalWebSocketService.broadcastInventoryUpdate(playerId, inventoryData);
  }
}

export function broadcastStorageUpdate(playerId: string, storageData: any) {
  if (globalWebSocketService) {
    globalWebSocketService.broadcastStorageUpdate(playerId, storageData);
  }
}

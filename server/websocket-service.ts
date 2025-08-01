
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

    // Set connection timeout
    const connectionTimeout = setTimeout(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close(1000, 'Connection timeout - no registration');
      }
    }, 30000); // 30 seconds to register

    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        this.handleMessage(ws, message);
        
        // Clear timeout on first valid message
        if (message.type === 'register') {
          clearTimeout(connectionTimeout);
        }
      } catch (error) {
        console.error('Invalid WebSocket message:', error);
        ws.close(1003, 'Invalid message format');
      }
    });

    ws.on('close', (code, reason) => {
      clearTimeout(connectionTimeout);
      this.handleDisconnection(ws);
      console.log(`🔌 WebSocket closed: ${code} - ${reason}`);
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      clearTimeout(connectionTimeout);
      this.handleDisconnection(ws);
    });

    // Send initial connection confirmation with retry logic
    try {
      this.sendToClient(ws, {
        type: 'connection',
        status: 'connected',
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Failed to send connection confirmation:', error);
      ws.close(1011, 'Server error');
    }
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
      case 'pong':
        // Update last ping time for this client
        const clientsArray = Array.from(this.clients.entries());
        for (const [playerId, client] of clientsArray) {
          if (client.ws === ws) {
            client.lastPing = Date.now();
            break;
          }
        }
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
      try {
        if (client.ws.readyState === WebSocket.OPEN) {
          // Check if client is still alive (hasn't responded to ping in 90 seconds)
          if (now - client.lastPing > 90000) {
            console.log(`🔌 Removing stale connection for player ${playerId}`);
            client.ws.terminate();
            this.clients.delete(playerId);
          } else {
            // Send ping with error handling
            try {
              this.sendToClient(client.ws, { type: 'ping', timestamp: now });
            } catch (error) {
              console.warn(`Failed to ping client ${playerId}:`, error);
              this.clients.delete(playerId);
            }
          }
        } else {
          // Remove dead connections
          this.clients.delete(playerId);
        }
      } catch (error) {
        console.error(`Error in heartbeat for player ${playerId}:`, error);
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

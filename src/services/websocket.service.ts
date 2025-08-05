// src/services/websocket.service.ts

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;
  private readonly reconnectDelay = 1000; // 1 second
  private readonly listeners: Map<string, ((data: unknown) => void)[]> = new Map();
  private currentUserId: string | null = null;
  private _isPolling = false;
  private pollingInterval: NodeJS.Timeout | null = null;
  private readonly pollingDelay = 5000; // 5 seconds
  private lastWalletUpdate = 0;

  connect(userId: string) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return; // Already connected
    }

    this.currentUserId = userId;
    const wsUrl = `${import.meta.env.VITE_WS_URL || 'ws://localhost:5050'}?userId=${userId}`;
    
    try {
      this.ws = new WebSocket(wsUrl);
      
      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
        console.log('WebSocket connected successfully');
        // Stop polling if WebSocket is working
        this.stopPolling();
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('WebSocket connection closed, starting polling fallback');
        this.handleReconnect(userId);
        // Start polling when WebSocket fails
        this.startPolling(userId);
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        // Start polling when WebSocket fails
        this.startPolling(userId);
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      // Start polling when WebSocket fails
      this.startPolling(userId);
    }
  }

  private startPolling(userId: string) {
    if (this._isPolling) return;
    
    this._isPolling = true;
    console.log('Starting polling fallback for wallet updates');
    
    this.pollingInterval = setInterval(async () => {
      try {
        // Poll for wallet updates
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5050'}/api/wallet/info`, {
          headers: {
            'Authorization': `Bearer ${this.getAuthToken()}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.wallet) {
            // Check if we have a new update (simple timestamp check)
            const currentTime = Date.now();
            if (currentTime - this.lastWalletUpdate > 1000) { // At least 1 second difference
              this.lastWalletUpdate = currentTime;
              
              // Emit wallet update event
              this.emit('wallet_update', {
                type: 'wallet_update',
                userId: userId,
                balance: data.wallet.balance,
                recentTransactions: data.wallet.recentTransactions
              });
            }
          }
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, this.pollingDelay);
  }

  private stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
    this._isPolling = false;
    console.log('Stopped polling fallback');
  }

  private getAuthToken(): string {
    // Get token from cookies or localStorage
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('authToken='))
      ?.split('=')[1];
    
    return token || '';
  }

  private handleReconnect(userId: string) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      
      setTimeout(() => {
        this.connect(userId);
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error('Max reconnection attempts reached, using polling fallback');
      // Ensure polling is started when WebSocket fails completely
      this.startPolling(userId);
    }
  }

  private handleMessage(data: { type: string; data?: unknown; userId?: string; balance?: number; recentTransactions?: unknown[] }) {
    switch (data.type) {
      case 'notification':
        this.emit('notification', data.data);
        break;
      case 'wallet_update':
        this.lastWalletUpdate = Date.now();
        this.emit('wallet_update', {
          type: 'wallet_update',
          userId: data.userId,
          balance: data.balance,
          recentTransactions: data.recentTransactions
        });
        break;
      case 'order_update':
        this.emit('order_update', data.data);
        break;
      case 'transaction_update':
        this.emit('transaction_update', data.data);
        break;
      default:
        console.log('Unknown WebSocket message type:', data.type);
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.stopPolling();
    this.currentUserId = null;
  }

  // Event listener methods
  on(event: string, callback: (data: unknown) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback: (data: unknown) => void) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: unknown) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in WebSocket callback:', error);
        }
      });
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  isPolling(): boolean {
    return this._isPolling;
  }

  getCurrentUserId(): string | null {
    return this.currentUserId;
  }
}

export const websocketService = new WebSocketService(); 
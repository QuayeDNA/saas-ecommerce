// src/services/websocket.service.ts

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;
  private readonly reconnectDelay = 1000; // 1 second
  private readonly listeners: Map<string, ((data: unknown) => void)[]> =
    new Map();
  private currentUserId: string | null = null;
  // (polling support removed)
  connect(userId: string) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return; // Already connected
    }

    this.currentUserId = userId;

    // Check if we're in production (Vercel) or if WebSocket URL is not available
    const isProduction =
      import.meta.env.PROD || window.location.hostname !== "localhost";
    const wsUrl = import.meta.env.VITE_API_URL;

    // If we're in production and no WebSocket URL is configured, we used to fall back to polling.
    // Polling has been removed and real-time updates now require a working WebSocket connection.
    if (isProduction && !wsUrl) {
      console.warn("WebSocket not configured; real-time updates unavailable.");
      return;
    }

    // Use WebSocket URL or fallback to localhost for development
    const finalWsUrl = `${wsUrl || "ws://localhost:5050"}?userId=${userId}`;

    try {
      this.ws = new WebSocket(finalWsUrl);

      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch {
          // Failed to parse WebSocket message
        }
      };

      this.ws.onclose = () => {
        this.handleReconnect(userId);
        // no polling fallback
      };

      this.ws.onerror = () => {
        // no polling fallback
      };
    } catch {
      // polling has been removed; nothing to do
      // this.startPolling(userId);
    }
  }



  private handleReconnect(userId: string) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;

      setTimeout(() => {
        this.connect(userId);
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      // polling has been removed; nothing to do
      // this.startPolling(userId);
    }
  }

  private handleMessage(data: {
    type: string;
    data?: unknown;
    userId?: string;
    balance?: number;
    recentTransactions?: unknown[];
    commission?: unknown;
  }) {
    switch (data.type) {
      case "notification":
        this.emit("notification", data.data);
        break;
      case "wallet_update":
        this.emit("wallet_update", {
          type: "wallet_update",
          userId: data.userId,
          balance: data.balance,
          recentTransactions: data.recentTransactions,
        });
        break;
      case "order_update":
        this.emit("order_update", data.data);
        break;
      case "order_created":
        this.emit("order_created", data.data);
        break;
      case "order_status_updated":
        this.emit("order_status_updated", data.data);
        break;
      case "transaction_update":
        this.emit("transaction_update", data.data);
        break;
      case "commission_update":
        this.emit("commission", {
          type: "commission_update",
          commission: data.commission,
        });
        break;
      case "commission_created":
        this.emit("commission", {
          type: "commission_created",
          commission: data.commission,
        });
        break;
      case "commission_paid":
        this.emit("commission", {
          type: "commission_paid",
          commission: data.commission,
        });
        break;
      case "commission_updated":
        this.emit("commission_updated", data.commission);
        break;
      case "commission_finalized":
        this.emit("commission_finalized", data.commission);
        break;
      case "announcement":
        this.emit("announcement", data.data);
        break;
      case "site_status_update":
        this.emit("site_status_update", data.data);
        break;
      default:
        // Unknown WebSocket message type
        break;
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
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
      callbacks.forEach((callback) => {
        try {
          callback(data);
        } catch {
          // Error in WebSocket callback
        }
      });
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }


  getCurrentUserId(): string | null {
    return this.currentUserId;
  }
}

export const websocketService = new WebSocketService();

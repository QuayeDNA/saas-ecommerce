// src/services/websocket.service.ts

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;
  private readonly reconnectDelay = 1000; // 1 second
  private readonly listeners: Map<string, ((data: unknown) => void)[]> =
    new Map();
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

    // Check if we're in production (Vercel) or if WebSocket URL is not available
    const isProduction =
      import.meta.env.PROD || window.location.hostname !== "localhost";
    const wsUrl = import.meta.env.VITE_API_URL;

    // If we're in production and no WebSocket URL is configured, skip WebSocket and use polling only
    if (isProduction && !wsUrl) {
      this.startPolling(userId);
      return;
    }

    // Use WebSocket URL or fallback to localhost for development
    const finalWsUrl = `${wsUrl || "ws://localhost:5050"}?userId=${userId}`;

    try {
      this.ws = new WebSocket(finalWsUrl);

      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
        // Stop polling if WebSocket is working
        this.stopPolling();
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
        // Start polling when WebSocket fails
        this.startPolling(userId);
      };

      this.ws.onerror = () => {
        // Start polling when WebSocket fails
        this.startPolling(userId);
      };
    } catch {
      // Start polling when WebSocket fails
      this.startPolling(userId);
    }
  }

  private startPolling(userId: string) {
    if (this._isPolling) return;

    this._isPolling = true;

    this.pollingInterval = setInterval(async () => {
      try {
        // Poll for wallet updates
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5050";
        const response = await fetch(`${apiUrl}/api/wallet/info`, {
          headers: {
            Authorization: `Bearer ${this.getAuthToken()}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.wallet) {
            // Check if we have a new update (simple timestamp check)
            const currentTime = Date.now();
            if (currentTime - this.lastWalletUpdate > 1000) {
              // At least 1 second difference
              this.lastWalletUpdate = currentTime;

              // Emit wallet update event
              this.emit("wallet_update", {
                type: "wallet_update",
                userId: userId,
                balance: data.wallet.balance,
                recentTransactions: data.wallet.recentTransactions,
              });
            }
          }
        }

        // Poll for commission updates
        try {
          const commissionResponse = await fetch(
            `${apiUrl}/api/commissions/agent?status=pending`,
            {
              headers: {
                Authorization: `Bearer ${this.getAuthToken()}`,
                "Content-Type": "application/json",
              },
            }
          );

          if (commissionResponse.ok) {
            const commissionData = await commissionResponse.json();
            if (commissionData.success && commissionData.data) {
              // Emit commission updates for any new or updated commissions
              commissionData.data.forEach((commission: unknown) => {
                this.emit("commission", {
                  type: "commission_update",
                  commission: commission,
                });
              });
            }
          }
        } catch {
          // Commission polling error - continue with other polling
        }
      } catch {
        // Polling error
      }
    }, this.pollingDelay);
  }

  private stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
    this._isPolling = false;
  }

  private getAuthToken(): string {
    // Get token from cookies or localStorage
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("authToken="))
      ?.split("=")[1];

    return token || "";
  }

  private handleReconnect(userId: string) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;

      setTimeout(() => {
        this.connect(userId);
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      // Ensure polling is started when WebSocket fails completely
      this.startPolling(userId);
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
        this.lastWalletUpdate = Date.now();
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

  isPolling(): boolean {
    return this._isPolling;
  }

  getCurrentUserId(): string | null {
    return this.currentUserId;
  }
}

export const websocketService = new WebSocketService();

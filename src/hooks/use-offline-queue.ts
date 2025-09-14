/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from "react";

export interface QueuedRequest {
  id: string;
  url: string;
  method: string;
  body?: any;
  headers?: Record<string, string>;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
  priority: "low" | "medium" | "high";
}

export interface OfflineQueueState {
  queue: QueuedRequest[];
  isProcessing: boolean;
  lastSyncAttempt: number | null;
}

class OfflineQueueManager {
  private queue: QueuedRequest[] = [];
  private listeners: ((state: OfflineQueueState) => void)[] = [];
  private isProcessing = false;
  private lastSyncAttempt: number | null = null;

  constructor() {
    this.loadFromStorage();
    this.setupPeriodicSync();
  }

  private setupPeriodicSync() {
    // Check for network connectivity every 30 seconds
    setInterval(() => {
      if (navigator.onLine && this.queue.length > 0 && !this.isProcessing) {
        this.processQueue();
      }
    }, 30000);
  }

  private async loadFromStorage() {
    try {
      const stored = localStorage.getItem("offline-queue");
      if (stored) {
        this.queue = JSON.parse(stored);
        this.notifyListeners();
      }
    } catch (error) {
      console.error("Failed to load offline queue from storage:", error);
    }
  }

  private async saveToStorage() {
    try {
      localStorage.setItem("offline-queue", JSON.stringify(this.queue));
    } catch (error) {
      console.error("Failed to save offline queue to storage:", error);
    }
  }

  private notifyListeners() {
    const state: OfflineQueueState = {
      queue: [...this.queue],
      isProcessing: this.isProcessing,
      lastSyncAttempt: this.lastSyncAttempt,
    };

    this.listeners.forEach((listener) => listener(state));
  }

  addRequest(request: Omit<QueuedRequest, "id" | "timestamp" | "retryCount">) {
    const queuedRequest: QueuedRequest = {
      ...request,
      id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      retryCount: 0,
    };

    // Add to queue with priority ordering (high priority first)
    const insertIndex = this.queue.findIndex(
      (item) => item.priority < request.priority
    );
    if (insertIndex === -1) {
      this.queue.push(queuedRequest);
    } else {
      this.queue.splice(insertIndex, 0, queuedRequest);
    }

    this.saveToStorage();
    this.notifyListeners();

    // Try to process immediately if online
    if (navigator.onLine && !this.isProcessing) {
      this.processQueue();
    }

    return queuedRequest.id;
  }

  removeRequest(id: string) {
    const index = this.queue.findIndex((item) => item.id === id);
    if (index !== -1) {
      this.queue.splice(index, 1);
      this.saveToStorage();
      this.notifyListeners();
    }
  }

  private async processQueue() {
    if (this.isProcessing || !navigator.onLine || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;
    this.lastSyncAttempt = Date.now();
    this.notifyListeners();

    try {
      const request = this.queue[0]; // Process highest priority first

      const response = await fetch(request.url, {
        method: request.method,
        headers: {
          "Content-Type": "application/json",
          ...request.headers,
        },
        body: request.body ? JSON.stringify(request.body) : undefined,
      });

      if (response.ok) {
        // Success - remove from queue
        this.queue.shift();
        this.saveToStorage();
      } else if (response.status >= 500) {
        // Server error - retry later
        request.retryCount++;
        if (request.retryCount >= request.maxRetries) {
          this.queue.shift(); // Remove after max retries
        }
        this.saveToStorage();
      } else {
        // Client error - don't retry
        this.queue.shift();
        this.saveToStorage();
      }
    } catch (error) {
      console.error("Failed to process queued request:", error);
      const request = this.queue[0];
      request.retryCount++;
      if (request.retryCount >= request.maxRetries) {
        this.queue.shift(); // Remove after max retries
      }
      this.saveToStorage();
    }

    this.isProcessing = false;
    this.notifyListeners();

    // Continue processing if there are more items and we're still online
    if (this.queue.length > 0 && navigator.onLine) {
      setTimeout(() => this.processQueue(), 1000); // Small delay between requests
    }
  }

  subscribe(listener: (state: OfflineQueueState) => void) {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index !== -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  forceSync() {
    if (navigator.onLine && !this.isProcessing) {
      this.processQueue();
    }
  }

  clearQueue() {
    this.queue = [];
    this.saveToStorage();
    this.notifyListeners();
  }
}

// Singleton instance
const offlineQueueManager = new OfflineQueueManager();

export const useOfflineQueue = () => {
  const [state, setState] = useState<OfflineQueueState>({
    queue: [],
    isProcessing: false,
    lastSyncAttempt: null,
  });

  useEffect(() => {
    const unsubscribe = offlineQueueManager.subscribe(setState);
    return unsubscribe;
  }, []);

  const addRequest = useCallback(
    (request: Omit<QueuedRequest, "id" | "timestamp" | "retryCount">) => {
      return offlineQueueManager.addRequest(request);
    },
    []
  );

  const removeRequest = useCallback((id: string) => {
    offlineQueueManager.removeRequest(id);
  }, []);

  const forceSync = useCallback(() => {
    offlineQueueManager.forceSync();
  }, []);

  const clearQueue = useCallback(() => {
    offlineQueueManager.clearQueue();
  }, []);

  return {
    ...state,
    addRequest,
    removeRequest,
    forceSync,
    clearQueue,
  };
};

/**
 * Comprehensive WebSocket Service for Real-time Data Updates
 * Handles all real-time connections: prices, suppliers, logistics, notifications
 */

export type WebSocketEvent =
  | 'price:update'
  | 'price:alert'
  | 'supplier:update'
  | 'supplier:new'
  | 'logistics:update'
  | 'logistics:tracking'
  | 'notification:new'
  | 'market:trend'
  | 'demand:update'
  | 'risk:alert'
  | 'connected'
  | 'disconnected'
  | 'error';

export interface WebSocketMessage {
  type: WebSocketEvent;
  data: any;
  timestamp: number;
  id?: string;
}

export type WebSocketListener = (message: WebSocketMessage) => void;

export class WebSocketService {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectDelay = 1000;
  private listeners: Map<WebSocketEvent, Set<WebSocketListener>> = new Map();
  private isConnecting = false;
  private shouldReconnect = true;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private heartbeatTimeout: NodeJS.Timeout | null = null;
  private readonly HEARTBEAT_INTERVAL = 30000; // 30 seconds
  private readonly HEARTBEAT_TIMEOUT = 10000; // 10 seconds

  constructor(url?: string) {
    this.url = url || import.meta.env.VITE_WS_URL || 'ws://localhost:3001';
  }

  /**
   * Connect to WebSocket server
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }

      if (this.isConnecting) {
        reject(new Error('Connection already in progress'));
        return;
      }

      this.isConnecting = true;

      try {
        const token = localStorage.getItem('qivook_access_token');
        const wsUrl = token
          ? `${this.url}?token=${encodeURIComponent(token)}`
          : this.url;

        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.startHeartbeat();
          this.emit('connected', { connected: true });
          resolve();
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event);
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.isConnecting = false;
          this.emit('error', { error: 'WebSocket connection error' });
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('WebSocket disconnected');
          this.isConnecting = false;
          this.stopHeartbeat();
          this.emit('disconnected', { connected: false });

          if (this.shouldReconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.scheduleReconnect();
          }
        };
      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    this.shouldReconnect = false;
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  /**
   * Send message to server
   */
  send(type: string, data: any): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      const message: WebSocketMessage = {
        type: type as WebSocketEvent,
        data,
        timestamp: Date.now(),
      };
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected. Message not sent:', type);
    }
  }

  /**
   * Subscribe to specific event type
   */
  on(event: WebSocketEvent, listener: WebSocketListener): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);

    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(event);
      if (listeners) {
        listeners.delete(listener);
      }
    };
  }

  /**
   * Unsubscribe from specific event type
   */
  off(event: WebSocketEvent, listener: WebSocketListener): void {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.delete(listener);
    }
  }

  /**
   * Subscribe to specific data channel (e.g., price updates for specific material)
   */
  subscribe(channel: string, params?: Record<string, any>): void {
    this.send('subscribe', { channel, params });
  }

  /**
   * Unsubscribe from specific data channel
   */
  unsubscribe(channel: string): void {
    this.send('unsubscribe', { channel });
  }

  /**
   * Check if WebSocket is connected
   */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  /**
   * Get connection state
   */
  getState(): 'connecting' | 'connected' | 'disconnected' | 'error' {
    if (!this.ws) return 'disconnected';
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return 'connecting';
      case WebSocket.OPEN:
        return 'connected';
      case WebSocket.CLOSING:
      case WebSocket.CLOSED:
        return 'disconnected';
      default:
        return 'error';
    }
  }

  /**
   * Handle incoming messages
   */
  private handleMessage(event: MessageEvent): void {
    try {
      const message: WebSocketMessage = JSON.parse(event.data);

      // Handle heartbeat pong
      if (message.type === 'pong') {
        this.handlePong();
        return;
      }

      // Emit message to listeners
      this.emit(message.type, message.data);
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
    }
  }

  /**
   * Emit event to all listeners
   */
  private emit(event: WebSocketEvent, data: any): void {
    const listeners = this.listeners.get(event);
    if (listeners) {
      const message: WebSocketMessage = {
        type: event,
        data,
        timestamp: Date.now(),
      };
      listeners.forEach((listener) => {
        try {
          listener(message);
        } catch (error) {
          console.error('Error in WebSocket listener:', error);
        }
      });
    }
  }

  /**
   * Schedule reconnection attempt
   */
  private scheduleReconnect(): void {
    this.reconnectAttempts++;
    const delay = Math.min(
      this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1),
      30000
    );

    setTimeout(() => {
      if (this.shouldReconnect && !this.isConnected()) {
        console.log(`Reconnecting... Attempt ${this.reconnectAttempts}`);
        this.connect().catch((error) => {
          console.error('Reconnection failed:', error);
        });
      }
    }, delay);
  }

  /**
   * Start heartbeat to keep connection alive
   */
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected()) {
        this.send('ping', {});
        
        // Set timeout for pong response
        this.heartbeatTimeout = setTimeout(() => {
          console.warn('Heartbeat timeout, reconnecting...');
          this.ws?.close();
        }, this.HEARTBEAT_TIMEOUT);
      }
    }, this.HEARTBEAT_INTERVAL);
  }

  /**
   * Stop heartbeat
   */
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    if (this.heartbeatTimeout) {
      clearTimeout(this.heartbeatTimeout);
      this.heartbeatTimeout = null;
    }
  }

  /**
   * Handle pong response
   */
  private handlePong(): void {
    if (this.heartbeatTimeout) {
      clearTimeout(this.heartbeatTimeout);
      this.heartbeatTimeout = null;
    }
  }
}

// Create singleton instance
export const websocketService = new WebSocketService();

// Export convenience functions
export const connectWebSocket = () => websocketService.connect();
export const disconnectWebSocket = () => websocketService.disconnect();
export const sendWebSocketMessage = (type: string, data: any) =>
  websocketService.send(type, data);
export const subscribeToChannel = (channel: string, params?: Record<string, any>) =>
  websocketService.subscribe(channel, params);
export const unsubscribeFromChannel = (channel: string) =>
  websocketService.unsubscribe(channel);
export const isWebSocketConnected = () => websocketService.isConnected();





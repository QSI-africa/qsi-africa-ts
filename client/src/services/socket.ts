// client/src/services/socket.ts
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 
  (window.location.hostname === 'localhost' ? 'http://localhost:3001' : 'https://api.qsi.africa');

class SocketService {
  private socket: Socket | null = null;

  connect(token?: string) {
    // If socket exists and token matches, do nothing (Socket.io will handle reconnects automatically)
    // @ts-ignore - access internal auth for comparison
    if (this.socket && this.socket.auth?.token === token) return;

    // If token changed, disconnect existing and reconnect
    if (this.socket) {
      this.socket.disconnect();
    }
    
    this.socket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling'], // Use websocket as primary, fallback to polling
      auth: { token },
      path: '/api/socket.io'
    });

    this.socket.on('connect', () => {
      console.log('Connected to signaling server:', this.socket?.id);
    });

    this.socket.on('connect_error', (error) => {
      console.warn('Socket connection error:', error.message);
      // Re-trigger auth if needed
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket() {
    return this.socket;
  }

  emit(event: string, ...args: any[]) {
    this.socket?.emit(event, ...args);
  }

  on(event: string, callback: (...args: any[]) => void) {
    this.socket?.on(event, callback);
  }

  off(event: string, callback?: (...args: any[]) => void) {
    this.socket?.off(event, callback);
  }
}

export const socketService = new SocketService();

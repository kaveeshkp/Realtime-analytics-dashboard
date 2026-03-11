import { io, Socket } from "socket.io-client";

/**
 * Singleton socket.io client.
 *
 * Usage:
 *   import { getSocket, disconnectSocket } from "./socketClient";
 *   const socket = getSocket("wss://your-server");
 */

let _socket: Socket | null = null;
let _url: string | null = null;

export interface SocketOptions {
  autoConnect?: boolean;
  reconnectionAttempts?: number;
  reconnectionDelay?: number;
  auth?: Record<string, string>;
  transports?: ("websocket" | "polling")[];
}

/**
 * Returns the existing socket if the URL matches, otherwise creates a new one.
 */
export function getSocket(url: string, options: SocketOptions = {}): Socket {
  if (_socket && _url === url) return _socket;

  // Tear down any old connection to a different URL
  if (_socket) {
    _socket.disconnect();
    _socket = null;
  }

  _url = url;
  _socket = io(url, {
    autoConnect: options.autoConnect ?? true,
    reconnectionAttempts: options.reconnectionAttempts ?? 10,
    reconnectionDelay: options.reconnectionDelay ?? 2000,
    auth: options.auth,
    transports: options.transports ?? ["websocket"],
  });

  return _socket;
}

/**
 * Disconnect and destroy the current socket.
 */
export function disconnectSocket(): void {
  if (_socket) {
    _socket.disconnect();
    _socket = null;
    _url = null;
  }
}

/**
 * Check whether a socket is connected.
 */
export function isConnected(): boolean {
  return _socket?.connected ?? false;
}

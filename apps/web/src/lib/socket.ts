import { io, Socket } from "socket.io-client";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:8080";

const g = globalThis as typeof globalThis & { __appSocket?: Socket };

export function getSocket(): Socket {
  if (g.__appSocket) return g.__appSocket;

  if (typeof window === "undefined") {
    throw new Error("getSocket() must be called in the browser");
  }

  g.__appSocket = io(SOCKET_URL, {
    withCredentials: true,
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 3000,
    reconnectionDelayMax: 10000,
    autoConnect: true,
  });


  return g.__appSocket;
}

export function isSocketConnected(): boolean {
  return g.__appSocket?.connected ?? false;
}

export function disconnectSocket() {
  if (g.__appSocket) {
    g.__appSocket.disconnect();
    g.__appSocket = undefined;
  }
}

export function reconnectSocket() {
  if (g.__appSocket) return g.__appSocket;
  return getSocket();
}

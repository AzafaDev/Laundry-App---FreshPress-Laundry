import { Server as IOServer, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import { env } from "../config/env.js";
import { verifyAccessToken } from "../utils/jwt.util.js";

let io: IOServer | null = null;

export function initSocketServer(httpServer: HttpServer): IOServer {
  io = new IOServer(httpServer, {
    cors: {
      origin: env.CLIENT_URL,
      credentials: true,
    },
    pingInterval: 25000,
    pingTimeout: 20000,
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) {
        return next(new Error("Unauthorized: no token"));
      }
      const payload = verifyAccessToken(token);
      (socket as any).data.user = payload;
      next();
    } catch (error) {
      next(new Error("Unauthorized: invalid token"));
    }
  });

  io.on("connection", (socket: Socket) => {
    const user = (socket as any).data.user as {
      userId: string;
      role: string;
      email: string;
    };

    console.log(`[socket] connected: ${user.email} (${user.role})`);

    socket.join(`user:${user.userId}`);

    socket.join(`role:${user.role}`);

    socket.join(`online:${user.role}`);

    socket.on("disconnect", (reason) => {
      console.log(`[socket] disconnected: ${user.email} - ${reason}`);
    });
  });

  return io;
}

export function getIO(): IOServer {
  if (!io) {
    throw new Error("socket.io belum di inisialisasi");
  }
  return io;
}

export function emitToUser(userId: string, event: string, data: any) {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, data);
}

export function emitToRole(role: string, event: string, data: any) {
  if (!io) return;
  io.to(`role:${role}`).emit(event, data);
}

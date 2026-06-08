import { Server as IOServer, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import { env } from "../config/env.js";
import { verifyAccessToken } from "../utils/jwt.util.js";
import { prisma } from "./prisma.js";

function parseCookieHeader(cookieHeader: string): Record<string, string> {
  return Object.fromEntries(
    cookieHeader.split(";").map((pair) => {
      const [key, ...rest] = pair.trim().split("=");
      return [key.trim(), decodeURIComponent(rest.join("="))];
    }),
  );
}

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
      const rawCookie = socket.handshake.headers.cookie ?? "";
      const token = parseCookieHeader(rawCookie)["accessToken"];
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
      outletId?: string;
    };

    console.log(`[socket] connected: ${user.email} (${user.role})`);

    socket.join(`user:${user.userId}`);

    socket.join(`role:${user.role}`);

    socket.join(`online:${user.role}`);

    if (user.role !== "customer" && user.outletId) {
      socket.join(`outlet:${user.outletId}`);
    }

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

export function emitToRoom(room: string, event: string, data: any) {
  if (!io) return;
  io.to(room).emit(event, data);
}

export function emitToUser(userId: string, event: string, data: any) {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, data);
}

export function emitToRole(role: string, event: string, data: any) {
  if (!io) return;
  io.to(`role:${role}`).emit(event, data);
}

export async function emitStationNewOrder(orderId: string, newStatus: string) {
  const STATION_STATUSES = ["washing", "ironing", "packing"];
  if (!STATION_STATUSES.includes(newStatus)) return;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      outlet_id: true,
      customer: { select: { full_name: true } },
    },
  });

  if (order?.outlet_id) {
    emitToRoom(`outlet:${order.outlet_id}`, "station:new-order", {
      orderId,
      station: newStatus,
      customerName: order.customer?.full_name,
      timestamp: new Date(),
    });
  }
}

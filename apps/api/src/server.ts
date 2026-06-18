import app from "./app.js";
import http from "http";
import { initSocketServer } from "./lib/socket.js";
import "./cron/markAbsentAttendance.js";
import "./cron/cleanupExpiredTokens.js";
import "./cron/autoCompleteOrders.js";
import { env } from "./config/env.js";

const httpServer = http.createServer(app);

initSocketServer(httpServer);

httpServer.listen(env.PORT, () => {
  console.log(`[server]: Server is running at http://localhost:${env.PORT}`);
});

export default app;

import "dotenv/config";
process.env.TZ = "Asia/Jakarta";
import cookieParser from "cookie-parser";
import express, { type Application } from "express";
import cors from "cors";
import http from "http";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import router from "./routes/index.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import { env } from "./config/env.js";
import { initSocketServer } from "./lib/socket.js";
import "./cron/markAbsentAttendance.js";
import "./cron/releaseDriverTasks.js";
import "./cron/cleanupExpiredTokens.js";

const app: Application = express();

app.set("trust proxy", 1);
app.use(helmet());
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === "production" ? 500 : 1000,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (_req, res) => {
  res.json({ success: true, message: "OK" });
});

app.use("/api", router);
app.use(errorHandler);

const httpServer = http.createServer(app);

initSocketServer(httpServer);

httpServer.listen(env.PORT, () => {
  console.log(`[server]: Server is running at http://localhost:${env.PORT}`);
});

export default app;

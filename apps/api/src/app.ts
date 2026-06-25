import "dotenv/config";
process.env.TZ = "Asia/Jakarta";
import cookieParser from "cookie-parser";
import express, { type Application } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import router from "./routes/index.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import { env } from "./config/env.js";

const app: Application = express();

app.set("trust proxy", 1);
app.use(helmet());
const allowedOrigins = env.ALLOWED_ORIGINS
  ? env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
  : [env.CLIENT_URL];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin ${origin} not allowed`));
      }
    },
    credentials: true,
  })
);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === "test" ? 100_000 : process.env.NODE_ENV === "production" ? 500 : 1000,
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

export default app;

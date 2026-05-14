import express, { type Application } from "express";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import cors from "cors";

import { errorHandler } from "./middlewares/error.middleware.js";
import router from "./routes/index.js";
import { env } from "./config/env.js";

const app: Application = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN }));
app.use(limiter);
app.use(express.json({ limit: "10mb" }));

app.get("/health", (_req, res) => {
  res.json({ success: true, message: "OK" });
});

app.use("/api", router);
app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`[server]: Server is running at http://localhost:${env.PORT}`);
});

export default app;

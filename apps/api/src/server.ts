import express, { type Application } from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import routes from "./routes/index.js";
import { errorHandler } from "./middlewares/error.middleware.js";

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT ?? 8080;
const CLIENT_URL = process.env.CLIENT_URL ?? "http://localhost:3000";

app.use(helmet());
app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/api", routes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[server]: Server is running at http://localhost:${PORT}`);
});

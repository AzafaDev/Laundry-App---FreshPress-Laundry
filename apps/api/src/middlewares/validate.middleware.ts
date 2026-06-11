import type { Request, Response, NextFunction } from "express";
import type { ZodSchema } from "zod";
import { AppError } from "./error.middleware.js";

export const validate =
  (schema: ZodSchema, source: "body" | "query" = "body") =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const message = result.error.issues.map((e) => e.message).join(", ");
      return next(new AppError(message, 422));
    }
    if (source === "query") {
      Object.defineProperty(req, "query", { value: result.data, writable: true, configurable: true });
    } else {
      req[source] = result.data;
    }
    next();
  };

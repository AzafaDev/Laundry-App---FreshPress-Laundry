// Global error handler middleware
import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import jwt from "jsonwebtoken";
import { Prisma } from "../../generated/prisma/client.js";

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 400,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let statusCode = 500;
  let message = "Internal Server Error";
  let errors: any = undefined;

  if (err instanceof ZodError) {
    statusCode = 400;
    message = "Validation Error";
    errors = err.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));
  } else if (err instanceof jwt.JsonWebTokenError) {
    statusCode = 401;
    message = "Invalid or expired token";
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2025") {
      statusCode = 404;
      message = "Record not found";
    } else {
      statusCode = 400;
      message = "Database error";
    }
  } else if (err instanceof Error) {
    switch (err.message) {
      case "Sudah check-in hari ini":
        statusCode = 409;
        break;
      case "attendance record not found":
        statusCode = 404;
        break;
      case "Already checked out":
        statusCode = 409;
        break;
      case "Unauthorized":
        statusCode = 403;
        break;
      default:
        statusCode = 500;
        break;
    }
  }

  if (process.env.NODE_ENV === "development") {
    console.error(err);
  }

  const response: {
    success: boolean;
    message: string;
    errors?: Array<{ field: string; message: string }>;
  } = {
    success: false,
    message,
  };
  if (errors) {
    response.errors = errors;
  }

  res.status(statusCode).json(response);
};

import type { Request, Response, NextFunction } from "express";
import multer from "multer";

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 400,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ message: err.message });
    return;
  }
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      res.status(422).json({ message: "Ukuran foto melebihi batas maksimum 5 MB." });
      return;
    }
    res.status(422).json({ message: `Upload gagal: ${err.message}` });
    return;
  }
  console.error(err);
  res.status(500).json({ message: "Terjadi kesalahan server." });
};

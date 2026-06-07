import type { Request, Response, NextFunction, RequestHandler } from 'express';
import { AppError } from '../middlewares/error.middleware.js';

type AsyncRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<unknown>;

export const asyncHandler =
  (fn: AsyncRequestHandler): RequestHandler =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

export function requireUserId(req: Request): string {
  const userId = req.user?.userId;
  if (!userId) throw new AppError("Unauthorized", 401);
  return userId;
}

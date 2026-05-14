// Auth middleware

import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/jwt.util.js";
import { JwtPayload } from "../types/express.js";

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        success: false,
        message: "Missing or invalid authorization header",
      });
      return;
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);
    
    (req as Request & { user: JwtPayload }).user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

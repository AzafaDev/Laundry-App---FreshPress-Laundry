// Role-based middleware
import { Request, Response, NextFunction } from "express";
import { UserRole } from "../../generated/prisma/enums.js";

export const allowRoles = (...allowed: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as any).user;

    if (!user) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    if (!allowed.includes(user.role)) {
      res.status(403).json({
        success: false,
        message: "Access denied: insufficient permissions",
      });
      return;
    }

    next();
  };
};

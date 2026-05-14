import { UserRole } from "../../generated/prisma/enums.js";

export interface JwtPayload {
  id: string;
  email: string;
  role: UserRole;
  outlet_id: string | null;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

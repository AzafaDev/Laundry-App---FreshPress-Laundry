import "express";
import { File } from "multer";

declare module "express" {
  interface Request {
    user?: {
      userId: string;
      role: string;
      email: string;
      outletId?: string | null;
    };
    file?: File;
    files?: File[] | Record<string, File[]>;
  }
}

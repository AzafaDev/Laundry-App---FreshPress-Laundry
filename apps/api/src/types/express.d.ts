import "express";
import { File } from "multer";

declare module "express" {
  interface Request {
    user?: {
      userId: string;
      role: string;
      email: string;
    };
    file?: File;
    files?: File[] | Record<string, File[]>;
  }
}

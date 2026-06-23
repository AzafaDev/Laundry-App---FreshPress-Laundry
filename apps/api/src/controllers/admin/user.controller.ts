// Admin user controller — paginated list + CRUD + soft-delete
import type { Request, Response, NextFunction } from "express";
import * as UserService from "../../services/admin/user.service.js";
import { listUserQuerySchema } from "../../validations/user.validation.js";
import { AppError } from "../../middlewares/error.middleware.js";

export const listUsers = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const query = listUserQuerySchema.parse(req.query);
    const result = await UserService.listUsers(query);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

export const getUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const user = await UserService.getUserById(req.params.id as string);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const user = await UserService.createUser(req.body);
    res.status(201).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const user = await UserService.updateUser(req.params.id as string, req.body);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

export const resendInvite = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await UserService.resendInvite(req.params.id as string);
    res.json({ success: true, data: result, message: `Email verifikasi dikirim ke ${result.email}.` });
  } catch (err) {
    next(err);
  }
};

export const hardDeleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) throw new AppError("Autentikasi diperlukan.", 401);
    const result = await UserService.hardDeleteUser(req.params.id as string, req.user.userId);
    res.json({ success: true, data: result, message: "User dihapus permanen." });
  } catch (err) {
    next(err);
  }
};

export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) throw new AppError("Autentikasi diperlukan.", 401);
    const user = await UserService.softDeleteUser(
      req.params.id as string,
      req.user.userId,
    );
    res.json({ success: true, data: user, message: "User dihapus." });
  } catch (err) {
    next(err);
  }
};

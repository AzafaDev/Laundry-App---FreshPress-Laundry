import type { Request, Response, NextFunction } from "express";
import * as AuthService from "../../services/customer/auth.service.js";

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await AuthService.registerCustomer(req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

export const resendVerification = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await AuthService.resendVerification(req.body.email);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const verifyEmail = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { token, password } = req.body;
    const result = await AuthService.verifyEmailAndSetPassword(token, password);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { email, password } = req.body;
    const result = await AuthService.loginCustomer(email, password);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await AuthService.forgotPassword(req.body.email);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { token, password } = req.body;
    const result = await AuthService.resetPassword(token, password);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

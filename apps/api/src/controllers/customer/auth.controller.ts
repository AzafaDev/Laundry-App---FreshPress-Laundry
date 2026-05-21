import type { Request, Response, NextFunction } from "express";
import * as AuthService from "../../services/customer/auth.service.js";
import { env } from "../../config/env.js";

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

export const googleRedirect = (
  _req: Request,
  res: Response,
  next: NextFunction,
): void => {
  try {
    const url = AuthService.getGoogleAuthUrl();
    res.redirect(url);
  } catch (err) {
    next(err);
  }
};

export const googleCallback = async (
  req: Request,
  res: Response,
  _next: NextFunction,
): Promise<void> => {
  const { code, error } = req.query;

  if (error || !code) {
    const msg = encodeURIComponent("Login dengan Google dibatalkan.");
    res.redirect(`${env.CLIENT_URL}/login?error=${msg}`);
    return;
  }

  try {
    const result = await AuthService.googleLogin(code as string);
    const userEncoded = Buffer.from(JSON.stringify(result.user)).toString("base64url");
    res.redirect(
      `${env.CLIENT_URL}/auth/callback?token=${result.accessToken}&user=${userEncoded}`,
    );
  } catch (err) {
    const msg = encodeURIComponent(
      (err as { message?: string })?.message ?? "Login Google gagal.",
    );
    res.redirect(`${env.CLIENT_URL}/login?error=${msg}`);
  }
};

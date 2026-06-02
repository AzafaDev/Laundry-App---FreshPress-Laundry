import { NextFunction, Request, Response } from "express";
import {
  loginEmployeeSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from "../../validations/employee.validation.js";
import {
  loginEmployee,
  logoutEmployee,
  refreshEmployeeToken,
  forgotPassword,
  resetPassword,
  changePassword,
} from "../../services/employee/auth.service.js";

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { email, password } = loginEmployeeSchema.parse(req.body);
    const result = await loginEmployee(email, password, res);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await refreshEmployeeToken(req, res);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await logoutEmployee(req, res);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const forgotPasswordHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { email } = forgotPasswordSchema.parse(req.body);
    const result = await forgotPassword(email);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const resetPasswordHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { token, newPassword } = resetPasswordSchema.parse(req.body);
    const result = await resetPassword(token, newPassword);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const changePasswordHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { oldPassword, newPassword } = changePasswordSchema.parse(req.body);
    const result = await changePassword(req.user!.userId, oldPassword, newPassword, res);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

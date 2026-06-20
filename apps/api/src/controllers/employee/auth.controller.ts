import { Request, Response } from "express";
import {
  loginEmployee,
  logoutEmployee,
  refreshEmployeeToken,
  forgotPassword,
  resetPassword,
  changePassword,
} from "../../services/employee/auth.service.js";

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  const result = await loginEmployee(email, password, res);
  res.status(200).json({ success: true, data: result });
};

export const refresh = async (req: Request, res: Response): Promise<void> => {
  const result = await refreshEmployeeToken(req, res);
  res.status(200).json({ success: true, data: result });
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  const result = await logoutEmployee(req, res);
  res.status(200).json({ success: true, data: result });
};

export const forgotPasswordHandler = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;
  const result = await forgotPassword(email);
  res.status(200).json({ success: true, data: result });
};

export const resetPasswordHandler = async (req: Request, res: Response): Promise<void> => {
  const { token, newPassword } = req.body;
  const result = await resetPassword(token, newPassword, res);
  res.status(200).json({ success: true, data: result });
};

export const changePasswordHandler = async (req: Request, res: Response): Promise<void> => {
  const { oldPassword, newPassword } = req.body;
  const result = await changePassword(req.user!.userId, oldPassword, newPassword, res);
  res.status(200).json({ success: true, data: result });
};

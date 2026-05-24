import { NextFunction, Request, Response } from "express";
import { loginEmployeeSchema } from "../../validations/employee.validation.js";
import {
  loginEmployee,
  logoutEmployee,
  refreshEmployeeToken,
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



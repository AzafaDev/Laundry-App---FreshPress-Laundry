import { NextFunction, Request, Response } from "express";
import { loginEmployeeSchema } from "../../validations/employee.validation.js";
import { loginEmployee } from "../../services/employee/auth.service.js";

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { email, password } = loginEmployeeSchema.parse(req.body);
    const result = await loginEmployee(email, password);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

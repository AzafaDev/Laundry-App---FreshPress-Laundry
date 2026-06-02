import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { created, ok } from "../../utils/apiResponse.js";
import * as OrderService from "../../services/customer/order.service.js";

function getParamId(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  const customerId = req.user!.userId;
  const order = await OrderService.createCustomerOrder(customerId, req.body);
  created(res, order, "Order pickup berhasil dibuat.");
});

export const listOrders = asyncHandler(async (req: Request, res: Response) => {
  const customerId = req.user!.userId;
  const orders = await OrderService.listCustomerOrders(customerId);
  ok(res, orders, "Daftar order berhasil diambil.");
});

export const getOrderById = asyncHandler(async (req: Request, res: Response) => {
  const customerId = req.user!.userId;
  const orderId = getParamId(req.params.id);
  const order = await OrderService.getCustomerOrderById(customerId, orderId);
  ok(res, order, "Detail order berhasil diambil.");
});
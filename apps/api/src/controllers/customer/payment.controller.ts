import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ok } from "../../utils/apiResponse.js";
import * as PaymentService from "../../services/customer/payment.service.js";

function getParamId(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

export const createTransaction = asyncHandler(async (req: Request, res: Response) => {
  const customerId = req.user!.userId;
  const orderId = getParamId(req.params.orderId);
  const result = await PaymentService.createPaymentTransaction(customerId, orderId);
  ok(res, result, "Transaksi pembayaran berhasil dibuat.");
});

export const getStatus = asyncHandler(async (req: Request, res: Response) => {
  const customerId = req.user!.userId;
  const orderId = getParamId(req.params.orderId);
  const payment = await PaymentService.getPaymentStatus(customerId, orderId);
  ok(res, payment, "Status pembayaran berhasil diambil.");
});

export const syncStatus = asyncHandler(async (req: Request, res: Response) => {
  const customerId = req.user!.userId;
  const orderId = getParamId(req.params.orderId);
  const payment = await PaymentService.syncPaymentStatus(customerId, orderId);
  ok(res, payment, "Status pembayaran berhasil disinkronkan.");
});

export const handleNotification = asyncHandler(async (req: Request, res: Response) => {
  const result = await PaymentService.handlePaymentNotification(req.body);
  ok(res, result, "Notifikasi pembayaran berhasil diproses.");
});

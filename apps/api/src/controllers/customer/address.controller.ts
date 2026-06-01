// Customer address controller
import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ok, created, noContent } from "../../utils/apiResponse.js";
import * as AddressService from "../../services/customer/address.service.js";

export const listAddresses = asyncHandler(async (req: Request, res: Response) => {
  const customerId = req.user!.userId;
  const addresses = await AddressService.listAddresses(customerId);
  ok(res, addresses, "Daftar alamat berhasil diambil.");
});

export const createAddress = asyncHandler(async (req: Request, res: Response) => {
  const customerId = req.user!.userId;
  const address = await AddressService.createAddress(customerId, req.body);
  created(res, address, "Alamat berhasil ditambahkan.");
});

export const updateAddress = asyncHandler(async (req: Request, res: Response) => {
  const customerId = req.user!.userId;
  const { id } = req.params;
  const address = await AddressService.updateAddress(customerId, id, req.body);
  ok(res, address, "Alamat berhasil diperbarui.");
});

export const setPrimaryAddress = asyncHandler(async (req: Request, res: Response) => {
  const customerId = req.user!.userId;
  const { id } = req.params;
  const address = await AddressService.setPrimaryAddress(customerId, id);
  ok(res, address, "Alamat utama berhasil diatur.");
});

export const deleteAddress = asyncHandler(async (req: Request, res: Response) => {
  const customerId = req.user!.userId;
  const { id } = req.params;
  await AddressService.deleteAddress(customerId, id);
  noContent(res);
});

export const geocodeSearch = asyncHandler(async (req: Request, res: Response) => {
  const { q } = req.query as { q?: string };
  if (!q || q.trim().length < 3) {
    ok(res, null, "Query terlalu pendek.");
    return;
  }
  const result = await AddressService.geocodeForCustomer(q.trim());
  ok(res, result, "Geocoding berhasil.");
});

export const estimateDeliveryFee = asyncHandler(async (req: Request, res: Response) => {
  const customerId = req.user!.userId;
  const { id } = req.params;
  const estimate = await AddressService.estimateDeliveryFee(customerId, id);
  ok(res, estimate, "Estimasi ongkos kirim berhasil dihitung.");
});

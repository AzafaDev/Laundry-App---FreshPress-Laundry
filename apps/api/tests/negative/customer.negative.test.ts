import request from "supertest";
import app from "../../src/app";
import { getAuthCookie } from "../helpers/auth.helper";
import { testPrisma, createTestCustomer, deleteTestCustomerByEmail } from "../helpers/data.helper";

const TS = Date.now();
const DUP_EMAIL = `test-dup-${TS}@freshpress-test.com`;

describe("Customer — Negative Cases", () => {
  let authCookie: string;

  beforeAll(async () => {
    authCookie = await getAuthCookie("customer");
    // Pre-create duplicate email for duplicate-register test
    await createTestCustomer({ email: DUP_EMAIL });
  });

  afterAll(async () => {
    await deleteTestCustomerByEmail(DUP_EMAIL);
    await testPrisma.$disconnect();
  });

  // ── Register validation ────────────────────────────────────────────────────

  describe("POST /api/v1/customer/auth/register", () => {
    it("harus 400 jika full_name tidak disertakan", async () => {
      const res = await request(app)
        .post("/api/v1/customer/auth/register")
        .send({ email: `no-name-${TS}@freshpress-test.com` });

      expect([400, 422]).toContain(res.status);
    });

    it("harus 400 jika format email tidak valid", async () => {
      const res = await request(app)
        .post("/api/v1/customer/auth/register")
        .send({ full_name: "Test User", email: "bukan-email" });

      expect([400, 422]).toContain(res.status);
    });

    it("harus 409 jika email sudah terdaftar", async () => {
      const res = await request(app)
        .post("/api/v1/customer/auth/register")
        .send({ full_name: "Duplicate User", email: DUP_EMAIL });

      expect([409, 400]).toContain(res.status);
    });
  });

  // ── Address validation ─────────────────────────────────────────────────────

  describe("POST /api/v1/customer/addresses", () => {
    it("harus 400 jika label tidak disertakan", async () => {
      const res = await request(app)
        .post("/api/v1/customer/addresses")
        .set("Cookie", authCookie)
        .send({
          address: "Jl. Test No. 1",
          province: "DKI Jakarta",
          city: "Jakarta Pusat",
          district: "Menteng",
          latitude: -6.2,
          longitude: 106.8167,
        });

      expect([400, 422]).toContain(res.status);
    });

    it("harus 400 jika latitude melebihi batas (> 90)", async () => {
      const res = await request(app)
        .post("/api/v1/customer/addresses")
        .set("Cookie", authCookie)
        .send({
          label: "Test Invalid Lat",
          address: "Jl. Test No. 1",
          province: "DKI Jakarta",
          city: "Jakarta Pusat",
          district: "Menteng",
          latitude: 95,
          longitude: 106.8167,
        });

      expect([400, 422]).toContain(res.status);
    });

    it("harus 400 jika longitude kurang dari batas (< -180)", async () => {
      const res = await request(app)
        .post("/api/v1/customer/addresses")
        .set("Cookie", authCookie)
        .send({
          label: "Test Invalid Lng",
          address: "Jl. Test No. 1",
          province: "DKI Jakarta",
          city: "Jakarta Pusat",
          district: "Menteng",
          latitude: -6.2,
          longitude: -200,
        });

      expect([400, 422]).toContain(res.status);
    });
  });

  // ── Order validation ───────────────────────────────────────────────────────

  describe("POST /api/v1/customer/orders", () => {
    it("harus 400 jika pickup_address_id tidak disertakan", async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const res = await request(app)
        .post("/api/v1/customer/orders")
        .set("Cookie", authCookie)
        .send({
          pickup_date: tomorrow.toISOString().split("T")[0],
        });

      expect([400, 422]).toContain(res.status);
    });

    it("harus 400 atau 422 jika pickup_date adalah tanggal lampau", async () => {
      const res = await request(app)
        .post("/api/v1/customer/orders")
        .set("Cookie", authCookie)
        .send({
          pickup_address_id: "00000000-0000-0000-0000-000000000001",
          pickup_date: "2020-01-01",
        });

      expect([400, 422]).toContain(res.status);
    });

    it("harus 400 jika pickup_date lebih dari 7 hari ke depan", async () => {
      const farFuture = new Date();
      farFuture.setDate(farFuture.getDate() + 30);

      const res = await request(app)
        .post("/api/v1/customer/orders")
        .set("Cookie", authCookie)
        .send({
          pickup_address_id: "00000000-0000-0000-0000-000000000001",
          pickup_date: farFuture.toISOString().split("T")[0],
        });

      expect([400, 422]).toContain(res.status);
    });

    it("harus 400 atau 404 jika pickup_address_id bukan UUID valid", async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const res = await request(app)
        .post("/api/v1/customer/orders")
        .set("Cookie", authCookie)
        .send({
          pickup_address_id: "bukan-uuid",
          pickup_date: tomorrow.toISOString().split("T")[0],
        });

      expect([400, 422]).toContain(res.status);
    });
  });

  // ── Access other customer's resources ──────────────────────────────────────

  describe("Access resource milik customer lain", () => {
    it("DELETE /api/v1/customer/addresses/:id — harus 404/403 jika alamat bukan milik customer ini", async () => {
      const res = await request(app)
        .delete("/api/v1/customer/addresses/00000000-0000-0000-0000-000000000099")
        .set("Cookie", authCookie);

      expect([403, 404]).toContain(res.status);
    });
  });
});

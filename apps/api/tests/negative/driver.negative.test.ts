import request from "supertest";
import app from "../../src/app";
import { getAuthCookie } from "../helpers/auth.helper";
import { testPrisma } from "../helpers/data.helper";

describe("Driver — Negative Cases", () => {
  let driverCookie: string;
  let customerCookie: string;
  let workerCookie: string;

  beforeAll(async () => {
    [driverCookie, customerCookie, workerCookie] = await Promise.all([
      getAuthCookie("driver"),
      getAuthCookie("customer"),
      getAuthCookie("washing_worker"),
    ]);
  });

  afterAll(async () => {
    await testPrisma.$disconnect();
  });

  // ── Driver-only endpoints tidak boleh diakses role lain ──────────────────

  describe("Role violations — driver endpoints", () => {
    it("customer tidak boleh GET /api/v1/driver/pickups/available → 403", async () => {
      const res = await request(app)
        .get("/api/v1/driver/pickups/available")
        .set("Cookie", customerCookie);

      expect(res.status).toBe(403);
    });

    it("washing_worker tidak boleh GET /api/v1/driver/deliveries/available → 403", async () => {
      const res = await request(app)
        .get("/api/v1/driver/deliveries/available")
        .set("Cookie", workerCookie);

      expect(res.status).toBe(403);
    });

    it("customer tidak boleh GET /api/v1/driver/tasks/active → 403", async () => {
      const res = await request(app)
        .get("/api/v1/driver/tasks/active")
        .set("Cookie", customerCookie);

      expect(res.status).toBe(403);
    });
  });

  // ── Non-existent resource ────────────────────────────────────────────────

  describe("Driver claim non-existent task", () => {
    it("POST /api/v1/driver/tasks/non-existent/claim → 404 atau 403 jika shift tidak aktif", async () => {
      const res = await request(app)
        .post("/api/v1/driver/tasks/00000000-0000-0000-0000-000000000099/claim")
        .set("Cookie", driverCookie);

      // 403 jika shift guard menolak (shift tidak aktif), 404 jika shift aktif tapi task tidak ada
      expect([400, 403, 404]).toContain(res.status);
    });
  });

  // ── Driver tidak boleh akses admin routes ────────────────────────────────

  describe("Driver access to admin routes", () => {
    it("driver tidak boleh GET /api/v1/admin/orders → 403", async () => {
      const res = await request(app)
        .get("/api/v1/admin/orders")
        .set("Cookie", driverCookie);

      expect(res.status).toBe(403);
    });

    it("driver tidak boleh GET /api/v1/admin/users → 403", async () => {
      const res = await request(app)
        .get("/api/v1/admin/users")
        .set("Cookie", driverCookie);

      expect(res.status).toBe(403);
    });
  });

  // ── Driver tidak boleh akses worker station ──────────────────────────────

  describe("Driver access to worker routes", () => {
    it("driver tidak boleh GET /api/v1/worker/station/washing → 403", async () => {
      const res = await request(app)
        .get("/api/v1/worker/station/washing")
        .set("Cookie", driverCookie);

      expect(res.status).toBe(403);
    });
  });

  // ── Driver tidak boleh akses customer routes ─────────────────────────────

  describe("Driver access to customer routes", () => {
    it("driver tidak boleh GET /api/v1/customer/profile → bukan 200", async () => {
      const res = await request(app)
        .get("/api/v1/customer/profile")
        .set("Cookie", driverCookie);

      // Employee token tidak valid di customer endpoint (401, 403, atau 404)
      expect(res.status).not.toBe(200);
    });
  });
});

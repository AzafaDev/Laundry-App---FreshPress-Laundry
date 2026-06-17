import request from "supertest";
import app from "../../src/app";
import { getAuthCookie } from "../helpers/auth.helper";
import { testPrisma } from "../helpers/data.helper";

describe("Outlet Admin — Negative Cases", () => {
  let outletAdminCookie: string;

  beforeAll(async () => {
    outletAdminCookie = await getAuthCookie("outlet_admin");
  });

  afterAll(async () => {
    await testPrisma.$disconnect();
  });

  // ── Endpoint super_admin only → 403 untuk outlet_admin ───────────────────

  describe("Super admin-only endpoints → 403", () => {
    it("POST /api/v1/admin/users (super_admin only) → 403", async () => {
      const res = await request(app)
        .post("/api/v1/admin/users")
        .set("Cookie", outletAdminCookie)
        .send({
          full_name: "Test User",
          email: "test-forbidden@freshpress-test.com",
          role: "driver",
          password: "Password123",
        });

      expect(res.status).toBe(403);
    });

    it("DELETE /api/v1/admin/users/:id (super_admin only) → 403", async () => {
      const res = await request(app)
        .delete("/api/v1/admin/users/00000000-0000-0000-0000-000000000001")
        .set("Cookie", outletAdminCookie);

      expect(res.status).toBe(403);
    });

    it("POST /api/v1/admin/outlets (super_admin only) → 403", async () => {
      const res = await request(app)
        .post("/api/v1/admin/outlets")
        .set("Cookie", outletAdminCookie)
        .send({
          name: "Forbidden Outlet",
          address: "Jl. Test",
          province: "DKI Jakarta",
          city: "Jakarta",
          district: "Menteng",
          service_radius_km: 5,
        });

      expect(res.status).toBe(403);
    });

    it("POST /api/v1/admin/shifts (super_admin only) → 403", async () => {
      const res = await request(app)
        .post("/api/v1/admin/shifts")
        .set("Cookie", outletAdminCookie)
        .send({ name: "Shift Forbidden", start_time: "08:00", end_time: "16:00" });

      expect(res.status).toBe(403);
    });

    it("POST /api/v1/admin/laundry-items (super_admin only) → 403", async () => {
      const res = await request(app)
        .post("/api/v1/admin/laundry-items")
        .set("Cookie", outletAdminCookie)
        .send({ name: "Item Forbidden", unit: "pcs", base_price: 5000 });

      expect(res.status).toBe(403);
    });
  });

  // ── Non-existent resources ────────────────────────────────────────────────

  describe("Non-existent resource lookups", () => {
    it("GET /api/v1/admin/orders/:id dengan id tidak valid → 400 atau 404", async () => {
      const res = await request(app)
        .get("/api/v1/admin/orders/00000000-0000-0000-0000-000000000099")
        .set("Cookie", outletAdminCookie);

      expect([400, 404]).toContain(res.status);
    });

    it("GET /api/v1/admin/complaints/:id dengan id tidak ada → 400 atau 404", async () => {
      const res = await request(app)
        .get("/api/v1/admin/complaints/00000000-0000-0000-0000-000000000099")
        .set("Cookie", outletAdminCookie);

      expect([400, 404]).toContain(res.status);
    });

    it("GET /api/v1/admin/bypass-requests/:id dengan id tidak ada → 400 atau 404", async () => {
      const res = await request(app)
        .get("/api/v1/admin/bypass-requests/00000000-0000-0000-0000-000000000099")
        .set("Cookie", outletAdminCookie);

      expect([400, 404]).toContain(res.status);
    });
  });

  // ── Outlet admin tidak boleh akses customer / driver / worker routes ──────

  describe("Outlet admin access to other role routes", () => {
    it("outlet_admin tidak boleh GET /api/v1/customer/profile → bukan 200", async () => {
      const res = await request(app)
        .get("/api/v1/customer/profile")
        .set("Cookie", outletAdminCookie);

      // Employee token tidak valid di customer endpoint
      expect(res.status).not.toBe(200);
    });

    it("outlet_admin tidak boleh GET /api/v1/driver/pickups/available → 403", async () => {
      const res = await request(app)
        .get("/api/v1/driver/pickups/available")
        .set("Cookie", outletAdminCookie);

      expect(res.status).toBe(403);
    });

    it("outlet_admin tidak boleh GET /api/v1/worker/station/washing → 403", async () => {
      const res = await request(app)
        .get("/api/v1/worker/station/washing")
        .set("Cookie", outletAdminCookie);

      expect(res.status).toBe(403);
    });
  });
});

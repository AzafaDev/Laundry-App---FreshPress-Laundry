import request from "supertest";
import app from "../../src/app";
import { getAuthCookie } from "../helpers/auth.helper";
import { testPrisma } from "../helpers/data.helper";

describe("Worker (washing_worker) — Negative Cases", () => {
  let washingWorkerCookie: string;
  let driverCookie: string;
  let customerCookie: string;

  beforeAll(async () => {
    [washingWorkerCookie, driverCookie, customerCookie] = await Promise.all([
      getAuthCookie("washing_worker"),
      getAuthCookie("driver"),
      getAuthCookie("customer"),
    ]);
  });

  afterAll(async () => {
    await testPrisma.$disconnect();
  });

  // ── Worker tidak boleh akses driver routes ───────────────────────────────

  describe("Worker access to driver routes", () => {
    it("washing_worker tidak boleh GET /api/v1/driver/pickups/available → 403", async () => {
      const res = await request(app)
        .get("/api/v1/driver/pickups/available")
        .set("Cookie", washingWorkerCookie);

      expect(res.status).toBe(403);
    });

    it("washing_worker tidak boleh GET /api/v1/driver/deliveries/available → 403", async () => {
      const res = await request(app)
        .get("/api/v1/driver/deliveries/available")
        .set("Cookie", washingWorkerCookie);

      expect(res.status).toBe(403);
    });

    it("washing_worker tidak boleh POST /api/v1/driver/tasks/:id/claim → 403", async () => {
      const res = await request(app)
        .post("/api/v1/driver/tasks/00000000-0000-0000-0000-000000000001/claim")
        .set("Cookie", washingWorkerCookie);

      expect(res.status).toBe(403);
    });
  });

  // ── Worker tidak boleh akses admin routes ────────────────────────────────

  describe("Worker access to admin routes", () => {
    it("washing_worker tidak boleh GET /api/v1/admin/users → 403", async () => {
      const res = await request(app)
        .get("/api/v1/admin/users")
        .set("Cookie", washingWorkerCookie);

      expect(res.status).toBe(403);
    });

    it("washing_worker tidak boleh GET /api/v1/admin/orders → 403", async () => {
      const res = await request(app)
        .get("/api/v1/admin/orders")
        .set("Cookie", washingWorkerCookie);

      expect(res.status).toBe(403);
    });

    it("washing_worker tidak boleh POST /api/v1/admin/laundry-items → 403", async () => {
      const res = await request(app)
        .post("/api/v1/admin/laundry-items")
        .set("Cookie", washingWorkerCookie)
        .send({ name: "Forbidden Item", unit: "pcs", base_price: 5000 });

      expect(res.status).toBe(403);
    });
  });

  // ── Worker station: non-existent order ───────────────────────────────────

  describe("Submit items pada order yang tidak ada", () => {
    it("POST /api/v1/worker/station/washing/orders/:orderId/submit-items dengan orderId tidak valid → 400/403/404", async () => {
      const res = await request(app)
        .post("/api/v1/worker/station/washing/orders/00000000-0000-0000-0000-000000000099/submit-items")
        .set("Cookie", washingWorkerCookie)
        .send({ items: [] });

      // 403 jika shift guard menolak, 404 jika shift aktif tapi order tidak ada
      expect([400, 403, 404]).toContain(res.status);
    });

    it("PATCH /api/v1/worker/station/washing/orders/:orderId/complete dengan orderId tidak ada → 400/403/404", async () => {
      const res = await request(app)
        .patch("/api/v1/worker/station/washing/orders/00000000-0000-0000-0000-000000000099/complete")
        .set("Cookie", washingWorkerCookie);

      // 403 jika shift guard menolak, 404 jika shift aktif tapi order tidak ada
      expect([400, 403, 404]).toContain(res.status);
    });
  });

  // ── Role lain tidak boleh akses worker station ───────────────────────────

  describe("Non-worker access to worker routes", () => {
    it("driver tidak boleh GET /api/v1/worker/station/washing → 403", async () => {
      const res = await request(app)
        .get("/api/v1/worker/station/washing")
        .set("Cookie", driverCookie);

      expect(res.status).toBe(403);
    });

    it("customer tidak boleh GET /api/v1/worker/station/washing → 403", async () => {
      const res = await request(app)
        .get("/api/v1/worker/station/washing")
        .set("Cookie", customerCookie);

      expect(res.status).toBe(403);
    });
  });
});

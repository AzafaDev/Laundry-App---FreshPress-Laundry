import request from "supertest";
import app from "../../src/app";
import { getAuthCookie } from "../helpers/auth.helper";
import { testPrisma } from "../helpers/data.helper";

describe("Outlet Admin — Positive Cases", () => {
  let adminCookie: string;

  beforeAll(async () => {
    adminCookie = await getAuthCookie("outlet_admin");
  });

  afterAll(async () => {
    await testPrisma.$disconnect();
  });

  // ── Auth ───────────────────────────────────────────────────────────────────

  describe("Auth cookie", () => {
    it("harus berhasil login outlet_admin dan mendapat accessToken cookie", () => {
      expect(adminCookie).toBeTruthy();
      expect(adminCookie).toMatch(/^accessToken=/);
    });
  });

  // ── Profile ────────────────────────────────────────────────────────────────

  describe("GET /api/v1/employee/profile", () => {
    it("harus return profile outlet_admin", async () => {
      const res = await request(app)
        .get("/api/v1/employee/profile")
        .set("Cookie", adminCookie);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
    });
  });

  // ── Orders ─────────────────────────────────────────────────────────────────

  describe("GET /api/v1/admin/orders", () => {
    it("harus return daftar order di outlet admin", async () => {
      const res = await request(app)
        .get("/api/v1/admin/orders")
        .set("Cookie", adminCookie);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
    });
  });

  describe("GET /api/v1/admin/orders/:id", () => {
    it("harus return detail order jika ada (skip jika tidak ada order)", async () => {
      const listRes = await request(app)
        .get("/api/v1/admin/orders")
        .set("Cookie", adminCookie);

      const orders = listRes.body.data?.orders ?? listRes.body.data ?? [];
      if (!Array.isArray(orders) || orders.length === 0) {
        console.warn("  [SKIP] Tidak ada order — jalankan seed dulu");
        return;
      }

      const res = await request(app)
        .get(`/api/v1/admin/orders/${orders[0].id}`)
        .set("Cookie", adminCookie);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty("id", orders[0].id);
    });
  });

  // ── Bypass Requests ─────────────────────────────────────────────────────────

  describe("GET /api/v1/admin/bypass-requests", () => {
    it("harus return daftar bypass request", async () => {
      const res = await request(app)
        .get("/api/v1/admin/bypass-requests")
        .set("Cookie", adminCookie);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
    });
  });

  // ── Complaints ─────────────────────────────────────────────────────────────

  describe("GET /api/v1/admin/complaints", () => {
    it("harus return daftar complaint", async () => {
      const res = await request(app)
        .get("/api/v1/admin/complaints")
        .set("Cookie", adminCookie);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
    });
  });

  describe("GET /api/v1/admin/complaints/stats", () => {
    it("harus return statistik complaint", async () => {
      const res = await request(app)
        .get("/api/v1/admin/complaints/stats")
        .set("Cookie", adminCookie);

      expect(res.status).toBe(200);
    });
  });

  // ── Reports ────────────────────────────────────────────────────────────────

  describe("GET /api/v1/reports/attendance", () => {
    it("harus return laporan kehadiran", async () => {
      const res = await request(app)
        .get("/api/v1/reports/attendance")
        .set("Cookie", adminCookie);

      expect(res.status).toBe(200);
    });
  });

  describe("GET /api/v1/reports/sales", () => {
    it("harus return laporan penjualan", async () => {
      const res = await request(app)
        .get("/api/v1/reports/sales")
        .set("Cookie", adminCookie);

      expect(res.status).toBe(200);
    });
  });

  describe("GET /api/v1/reports/employees", () => {
    it("harus return laporan performa karyawan", async () => {
      const res = await request(app)
        .get("/api/v1/reports/employees")
        .set("Cookie", adminCookie);

      expect(res.status).toBe(200);
    });
  });

  // ── Shifts (read-only for outlet_admin) ────────────────────────────────────

  describe("GET /api/v1/admin/shifts", () => {
    it("harus return daftar shift", async () => {
      const res = await request(app)
        .get("/api/v1/admin/shifts")
        .set("Cookie", adminCookie);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
    });
  });

  // ── Laundry Items (read-only for outlet_admin) ─────────────────────────────

  describe("GET /api/v1/admin/laundry-items", () => {
    it("harus return daftar laundry items", async () => {
      const res = await request(app)
        .get("/api/v1/admin/laundry-items")
        .set("Cookie", adminCookie);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
    });
  });

  // ── Notifications ─────────────────────────────────────────────────────────

  describe("GET /api/v1/admin/notifications", () => {
    it("harus return daftar notifikasi admin", async () => {
      const res = await request(app)
        .get("/api/v1/admin/notifications")
        .set("Cookie", adminCookie);

      expect(res.status).toBe(200);
    });
  });

  describe("GET /api/v1/admin/notifications/unread-count", () => {
    it("harus return jumlah notifikasi belum dibaca", async () => {
      const res = await request(app)
        .get("/api/v1/admin/notifications/unread-count")
        .set("Cookie", adminCookie);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty("count");
    });
  });
});

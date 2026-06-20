import request from "supertest";
import app from "../../src/app";
import { getAuthCookie } from "../helpers/auth.helper";
import { testPrisma } from "../helpers/data.helper";

describe("Driver — Positive Cases", () => {
  let driverCookie: string;

  beforeAll(async () => {
    driverCookie = await getAuthCookie("driver");
  });

  afterAll(async () => {
    await testPrisma.$disconnect();
  });

  // ── Auth ───────────────────────────────────────────────────────────────────

  describe("Auth cookie", () => {
    it("harus berhasil login driver dan mendapat accessToken cookie", () => {
      expect(driverCookie).toBeTruthy();
      expect(driverCookie).toMatch(/^accessToken=/);
    });
  });

  // ── Profile ────────────────────────────────────────────────────────────────

  describe("GET /api/v1/employee/profile", () => {
    it("harus return profile driver", async () => {
      const res = await request(app)
        .get("/api/v1/employee/profile")
        .set("Cookie", driverCookie);

      expect(res.status).toBe(200);
      expect(res.body.data?.role ?? res.body.data?.employee?.role).toBe("driver");
    });
  });

  // ── Attendance ─────────────────────────────────────────────────────────────

  describe("POST /api/v1/attendance/check-in", () => {
    it("harus check-in dengan koordinat lokasi (201 jika belum, 400 jika sudah)", async () => {
      const res = await request(app)
        .post("/api/v1/attendance/check-in")
        .set("Cookie", driverCookie)
        .send({ lat: -6.229383828043414, lng: 106.56748566704175 });

      expect([200, 201, 400]).toContain(res.status);
    });
  });

  describe("GET /api/v1/attendance/today", () => {
    it("harus return status kehadiran hari ini", async () => {
      const res = await request(app)
        .get("/api/v1/attendance/today")
        .set("Cookie", driverCookie);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
    });
  });

  // ── Driver Tasks ───────────────────────────────────────────────────────────

  describe("GET /api/v1/driver/pickups/available", () => {
    it("harus return daftar pickup atau 403 jika shift tidak aktif", async () => {
      const res = await request(app)
        .get("/api/v1/driver/pickups/available")
        .set("Cookie", driverCookie);

      // 200 jika shift aktif & sudah check-in, 403 jika shift belum aktif (business guard)
      expect([200, 403]).toContain(res.status);
    });
  });

  describe("GET /api/v1/driver/deliveries/available", () => {
    it("harus return daftar delivery atau 403 jika shift tidak aktif", async () => {
      const res = await request(app)
        .get("/api/v1/driver/deliveries/available")
        .set("Cookie", driverCookie);

      expect([200, 403]).toContain(res.status);
    });
  });

  describe("GET /api/v1/driver/tasks/active", () => {
    it("harus return task aktif saat ini atau null", async () => {
      const res = await request(app)
        .get("/api/v1/driver/tasks/active")
        .set("Cookie", driverCookie);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
    });
  });

  describe("GET /api/v1/driver/tasks/history", () => {
    it("harus return riwayat task dengan pagination", async () => {
      const res = await request(app)
        .get("/api/v1/driver/tasks/history")
        .query({ page: 1, limit: 5 })
        .set("Cookie", driverCookie);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("data");
    });
  });

  describe("Driver Task Claim (kondisional — butuh seed data)", () => {
    it("POST /api/v1/driver/tasks/:taskId/claim — harus klaim task tersedia", async () => {
      const pickupsRes = await request(app)
        .get("/api/v1/driver/pickups/available")
        .set("Cookie", driverCookie);

      const tasks = pickupsRes.body.data?.tasks ?? pickupsRes.body.data ?? [];
      if (!Array.isArray(tasks) || tasks.length === 0) {
        console.warn("  [SKIP] Tidak ada pickup task tersedia — jalankan seed dulu");
        return;
      }

      const taskId = tasks[0].id;
      const res = await request(app)
        .post(`/api/v1/driver/tasks/${taskId}/claim`)
        .set("Cookie", driverCookie);

      // 200 sukses claim, 409 jika sudah diklaim driver lain
      expect([200, 409]).toContain(res.status);
    });
  });

  // ── Driver Notifications ───────────────────────────────────────────────────

  describe("GET /api/v1/driver/notifications", () => {
    it("harus return daftar notifikasi driver", async () => {
      const res = await request(app)
        .get("/api/v1/driver/notifications")
        .set("Cookie", driverCookie);

      expect(res.status).toBe(200);
    });
  });

  describe("GET /api/v1/driver/notifications/unread-count", () => {
    it("harus return jumlah notifikasi belum dibaca", async () => {
      const res = await request(app)
        .get("/api/v1/driver/notifications/unread-count")
        .set("Cookie", driverCookie);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty("count");
    });
  });
});

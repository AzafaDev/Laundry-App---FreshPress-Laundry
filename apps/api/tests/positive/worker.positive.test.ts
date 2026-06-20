import request from "supertest";
import app from "../../src/app";
import { getAuthCookie } from "../helpers/auth.helper";
import { testPrisma } from "../helpers/data.helper";

describe("Worker (washing_worker) — Positive Cases", () => {
  let workerCookie: string;

  beforeAll(async () => {
    workerCookie = await getAuthCookie("washing_worker");
  });

  afterAll(async () => {
    await testPrisma.$disconnect();
  });

  // ── Auth ───────────────────────────────────────────────────────────────────

  describe("Auth cookie", () => {
    it("harus berhasil login washing_worker dan mendapat accessToken cookie", () => {
      expect(workerCookie).toBeTruthy();
      expect(workerCookie).toMatch(/^accessToken=/);
    });
  });

  // ── Profile ────────────────────────────────────────────────────────────────

  describe("GET /api/v1/employee/profile", () => {
    it("harus return profile worker", async () => {
      const res = await request(app)
        .get("/api/v1/employee/profile")
        .set("Cookie", workerCookie);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
    });
  });

  // ── Attendance ─────────────────────────────────────────────────────────────

  describe("POST /api/v1/attendance/check-in", () => {
    it("harus check-in worker (201 jika belum, 400 jika sudah)", async () => {
      const res = await request(app)
        .post("/api/v1/attendance/check-in")
        .set("Cookie", workerCookie)
        .send({ lat: -6.229383828043414, lng: 106.56748566704175 });

      expect([200, 201, 400]).toContain(res.status);
    });
  });

  describe("GET /api/v1/attendance/today", () => {
    it("harus return status kehadiran hari ini", async () => {
      const res = await request(app)
        .get("/api/v1/attendance/today")
        .set("Cookie", workerCookie);

      expect(res.status).toBe(200);
    });
  });

  // ── Station ────────────────────────────────────────────────────────────────

  describe("GET /api/v1/worker/station/washing", () => {
    it("harus return daftar order atau 403 jika shift tidak aktif", async () => {
      const res = await request(app)
        .get("/api/v1/worker/station/washing")
        .set("Cookie", workerCookie);

      // 200 jika shift aktif & sudah check-in, 403 jika shift tidak aktif (business guard)
      expect([200, 403]).toContain(res.status);
    });
  });

  describe("GET /api/v1/worker/tasks/history", () => {
    it("harus return riwayat task worker", async () => {
      const res = await request(app)
        .get("/api/v1/worker/tasks/history")
        .set("Cookie", workerCookie);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
    });
  });
});

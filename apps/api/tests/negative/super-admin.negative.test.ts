import request from "supertest";
import app from "../../src/app";
import { getAuthCookie } from "../helpers/auth.helper";
import { testPrisma } from "../helpers/data.helper";

describe("Super Admin — Negative Cases", () => {
  let adminCookie: string;

  beforeAll(async () => {
    adminCookie = await getAuthCookie("super_admin");
  });

  afterAll(async () => {
    await testPrisma.$disconnect();
  });

  // ── User creation validation ───────────────────────────────────────────────

  describe("POST /api/v1/admin/users — validasi input", () => {
    it("harus 400 jika role bukan enum valid", async () => {
      const res = await request(app)
        .post("/api/v1/admin/users")
        .set("Cookie", adminCookie)
        .send({ full_name: "Test", email: "x@test.com", role: "cashier", password: "Password123" });

      expect([400, 422]).toContain(res.status);
    });

    it("harus 400 jika email format tidak valid", async () => {
      const res = await request(app)
        .post("/api/v1/admin/users")
        .set("Cookie", adminCookie)
        .send({ full_name: "Test", email: "bukan-email", role: "driver", password: "Password123" });

      expect([400, 422]).toContain(res.status);
    });

    it("harus 400 jika password kurang dari 8 karakter", async () => {
      const res = await request(app)
        .post("/api/v1/admin/users")
        .set("Cookie", adminCookie)
        .send({ full_name: "Test", email: "test@test.com", role: "driver", password: "abc" });

      expect([400, 422]).toContain(res.status);
    });

    it("harus 400 jika full_name tidak disertakan", async () => {
      const res = await request(app)
        .post("/api/v1/admin/users")
        .set("Cookie", adminCookie)
        .send({ email: "test@test.com", role: "driver", password: "Password123" });

      expect([400, 422]).toContain(res.status);
    });
  });

  // ── PATCH user validation ─────────────────────────────────────────────────

  describe("PATCH /api/v1/admin/users/:id — validasi input", () => {
    it("harus 400 jika body kosong (tidak ada field yang diubah)", async () => {
      const res = await request(app)
        .patch("/api/v1/admin/users/00000000-0000-0000-0000-000000000001")
        .set("Cookie", adminCookie)
        .send({});

      expect([400, 422]).toContain(res.status);
    });
  });

  // ── Non-existent user ─────────────────────────────────────────────────────

  describe("GET/PATCH/DELETE user tidak ada", () => {
    it("GET /api/v1/admin/users/:id tidak ada → 404", async () => {
      const res = await request(app)
        .get("/api/v1/admin/users/00000000-0000-0000-0000-000000000099")
        .set("Cookie", adminCookie);

      expect([404, 400]).toContain(res.status);
    });
  });

  // ── Outlet creation validation ────────────────────────────────────────────

  describe("POST /api/v1/admin/outlets — validasi input", () => {
    it("harus 400 jika name tidak disertakan", async () => {
      const res = await request(app)
        .post("/api/v1/admin/outlets")
        .set("Cookie", adminCookie)
        .send({
          address: "Jl. Test",
          province: "DKI Jakarta",
          city: "Jakarta",
          district: "Menteng",
          service_radius_km: 5,
        });

      expect([400, 422]).toContain(res.status);
    });

    it("harus 400 jika service_radius_km = 0", async () => {
      const res = await request(app)
        .post("/api/v1/admin/outlets")
        .set("Cookie", adminCookie)
        .send({
          name: "Bad Outlet",
          address: "Jl. Test",
          province: "DKI Jakarta",
          city: "Jakarta",
          district: "Menteng",
          service_radius_km: 0,
        });

      expect([400, 422]).toContain(res.status);
    });
  });

  // ── Shift creation validation ─────────────────────────────────────────────

  describe("POST /api/v1/admin/shifts — validasi input", () => {
    it("harus 400 jika format start_time salah (bukan HH:MM)", async () => {
      const res = await request(app)
        .post("/api/v1/admin/shifts")
        .set("Cookie", adminCookie)
        .send({ name: "Bad Shift", start_time: "8am", end_time: "16:00" });

      expect([400, 422]).toContain(res.status);
    });

    it("harus 400 jika name shift terlalu pendek (< 2 karakter)", async () => {
      const res = await request(app)
        .post("/api/v1/admin/shifts")
        .set("Cookie", adminCookie)
        .send({ name: "A", start_time: "08:00", end_time: "16:00" });

      expect([400, 422]).toContain(res.status);
    });
  });

  // ── Laundry item creation validation ─────────────────────────────────────

  describe("POST /api/v1/admin/laundry-items — validasi input", () => {
    it("harus 400 jika base_price = 0", async () => {
      const res = await request(app)
        .post("/api/v1/admin/laundry-items")
        .set("Cookie", adminCookie)
        .send({ name: "Bad Item", unit: "pcs", base_price: 0 });

      expect([400, 422]).toContain(res.status);
    });

    it("harus 400 jika name tidak disertakan", async () => {
      const res = await request(app)
        .post("/api/v1/admin/laundry-items")
        .set("Cookie", adminCookie)
        .send({ unit: "pcs", base_price: 10000 });

      expect([400, 422]).toContain(res.status);
    });
  });

  // ── Non-existent laundry item ─────────────────────────────────────────────

  describe("PATCH /api/v1/admin/laundry-items/:id tidak ada", () => {
    it("harus 404 jika id tidak ditemukan", async () => {
      const res = await request(app)
        .patch("/api/v1/admin/laundry-items/00000000-0000-0000-0000-000000000099")
        .set("Cookie", adminCookie)
        .send({ base_price: 15000 });

      expect([404, 400]).toContain(res.status);
    });
  });

  // ── Non-existent shift ────────────────────────────────────────────────────

  describe("PATCH /api/v1/admin/shifts/:id tidak ada", () => {
    it("harus 404 jika shift tidak ditemukan", async () => {
      const res = await request(app)
        .patch("/api/v1/admin/shifts/00000000-0000-0000-0000-000000000099")
        .set("Cookie", adminCookie)
        .send({ name: "Ghost Shift" });

      expect([404, 400]).toContain(res.status);
    });
  });
});

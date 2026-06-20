import request from "supertest";
import app from "../../src/app";
import { getAuthCookie } from "../helpers/auth.helper";
import { testPrisma } from "../helpers/data.helper";

describe("Auth — Negative Cases (cross-role)", () => {
  let customerCookie: string;
  let driverCookie: string;
  let workerCookie: string;
  let outletAdminCookie: string;

  beforeAll(async () => {
    [customerCookie, driverCookie, workerCookie, outletAdminCookie] = await Promise.all([
      getAuthCookie("customer"),
      getAuthCookie("driver"),
      getAuthCookie("washing_worker"),
      getAuthCookie("outlet_admin"),
    ]);
  });

  afterAll(async () => {
    await testPrisma.$disconnect();
  });

  // ── Login failures ─────────────────────────────────────────────────────────

  describe("POST /api/v1/customer/auth/login", () => {
    it("harus 401 jika password salah", async () => {
      const res = await request(app)
        .post("/api/v1/customer/auth/login")
        .send({ email: "testcustomer@freshpress.com", password: "WrongPass999" });

      expect(res.status).toBe(401);
    });

    it("harus 401 jika email tidak terdaftar", async () => {
      const res = await request(app)
        .post("/api/v1/customer/auth/login")
        .send({ email: "nobody@nowhere.com", password: "Password123" });

      expect(res.status).toBe(401);
    });
  });

  describe("POST /api/v1/employee/auth/login", () => {
    it("harus 401 jika password employee salah", async () => {
      const res = await request(app)
        .post("/api/v1/employee/auth/login")
        .send({ email: "driver.morning.1@freshpress.com", password: "BadPass99" });

      expect(res.status).toBe(401);
    });

    it("harus 401 jika email employee tidak ada", async () => {
      const res = await request(app)
        .post("/api/v1/employee/auth/login")
        .send({ email: "ghost@freshpress.com", password: "Password123" });

      expect(res.status).toBe(401);
    });
  });

  // ── No token (Unauthenticated) ─────────────────────────────────────────────

  describe("Protected routes tanpa token", () => {
    it("GET /api/v1/customer/profile tanpa token → 401", async () => {
      const res = await request(app).get("/api/v1/customer/profile");
      expect(res.status).toBe(401);
    });

    it("GET /api/v1/employee/profile tanpa token → 401", async () => {
      const res = await request(app).get("/api/v1/employee/profile");
      expect(res.status).toBe(401);
    });

    it("GET /api/v1/admin/users tanpa token → 401", async () => {
      const res = await request(app).get("/api/v1/admin/users");
      expect(res.status).toBe(401);
    });
  });

  // ── Malformed token ────────────────────────────────────────────────────────

  describe("Protected routes dengan token malformat", () => {
    it("harus 401 jika accessToken adalah string random", async () => {
      const res = await request(app)
        .get("/api/v1/customer/profile")
        .set("Cookie", "accessToken=this-is-not-a-jwt");

      expect(res.status).toBe(401);
    });
  });

  // ── Cross-role authorization failures ─────────────────────────────────────

  describe("Role-based access control (403 Forbidden)", () => {
    it("customer tidak boleh GET /api/v1/admin/users → 403", async () => {
      const res = await request(app)
        .get("/api/v1/admin/users")
        .set("Cookie", customerCookie);

      expect(res.status).toBe(403);
    });

    it("driver tidak boleh GET /api/v1/admin/users → 403", async () => {
      const res = await request(app)
        .get("/api/v1/admin/users")
        .set("Cookie", driverCookie);

      expect(res.status).toBe(403);
    });

    it("washing_worker tidak boleh GET /api/v1/admin/users → 403", async () => {
      const res = await request(app)
        .get("/api/v1/admin/users")
        .set("Cookie", workerCookie);

      expect(res.status).toBe(403);
    });

    it("outlet_admin tidak boleh POST /api/v1/admin/users (super_admin only) → 403", async () => {
      const res = await request(app)
        .post("/api/v1/admin/users")
        .set("Cookie", outletAdminCookie)
        .send({ full_name: "X", email: "x@x.com", role: "driver", password: "Password123" });

      expect(res.status).toBe(403);
    });

    it("customer tidak boleh GET /api/v1/admin/orders → 403", async () => {
      const res = await request(app)
        .get("/api/v1/admin/orders")
        .set("Cookie", customerCookie);

      expect(res.status).toBe(403);
    });

    it("driver tidak boleh GET /api/v1/worker/station/washing → 403", async () => {
      const res = await request(app)
        .get("/api/v1/worker/station/washing")
        .set("Cookie", driverCookie);

      expect(res.status).toBe(403);
    });

    it("customer tidak boleh GET /api/v1/driver/pickups/available → 403", async () => {
      const res = await request(app)
        .get("/api/v1/driver/pickups/available")
        .set("Cookie", customerCookie);

      expect(res.status).toBe(403);
    });
  });
});

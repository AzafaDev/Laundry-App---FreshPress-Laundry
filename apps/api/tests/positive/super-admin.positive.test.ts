import request from "supertest";
import app from "../../src/app";
import { getAuthCookie } from "../helpers/auth.helper";
import { testPrisma } from "../helpers/data.helper";

const TS = Date.now();

describe("Super Admin — Positive Cases", () => {
  let adminCookie: string;

  // IDs created during tests — cleaned up in afterAll
  let createdUserId: string | null = null;
  let createdOutletId: string | null = null;
  let createdShiftId: string | null = null;
  let createdLaundryItemId: string | null = null;

  beforeAll(async () => {
    adminCookie = await getAuthCookie("super_admin");
  });

  afterAll(async () => {
    // Best-effort cleanup in reverse dependency order
    if (createdShiftId) {
      await testPrisma.employeeShift.deleteMany({ where: { shift_id: createdShiftId } });
      await testPrisma.workShift.delete({ where: { id: createdShiftId } }).catch(() => {});
    }
    if (createdLaundryItemId) {
      await testPrisma.laundryItem.delete({ where: { id: createdLaundryItemId } }).catch(() => {});
    }
    if (createdUserId) {
      await testPrisma.attendance.deleteMany({ where: { employee_id: createdUserId } });
      await testPrisma.employeeShift.deleteMany({ where: { employee_id: createdUserId } });
      await testPrisma.employee.delete({ where: { id: createdUserId } }).catch(() => {});
    }
    if (createdOutletId) {
      await testPrisma.employee.updateMany({
        where: { outlet_id: createdOutletId },
        data: { outlet_id: null },
      });
      await testPrisma.outlet.delete({ where: { id: createdOutletId } }).catch(() => {});
    }
    await testPrisma.$disconnect();
  });

  // ── Auth ───────────────────────────────────────────────────────────────────

  describe("Auth cookie", () => {
    it("harus berhasil login dan mendapat accessToken cookie", () => {
      expect(adminCookie).toBeTruthy();
      expect(adminCookie).toMatch(/^accessToken=/);
    });
  });

  // ── Users CRUD ─────────────────────────────────────────────────────────────

  describe("GET /api/v1/admin/users", () => {
    it("harus return daftar users dengan pagination", async () => {
      const res = await request(app)
        .get("/api/v1/admin/users")
        .set("Cookie", adminCookie)
        .query({ page: 1, limit: 5 });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
    });
  });

  describe("POST /api/v1/admin/users", () => {
    it("harus buat driver baru dan return 201 + id", async () => {
      const res = await request(app)
        .post("/api/v1/admin/users")
        .set("Cookie", adminCookie)
        .send({
          full_name: `Test Driver ${TS}`,
          email: `test-driver-${TS}@freshpress-test.com`,
          role: "driver",
          password: "Password123",
          is_active: true,
        });

      expect(res.status).toBe(201);
      expect(res.body.data).toHaveProperty("id");
      createdUserId = res.body.data.id;
    });
  });

  describe("GET /api/v1/admin/users/:id", () => {
    it("harus return detail user yang baru dibuat", async () => {
      if (!createdUserId) return;

      const res = await request(app)
        .get(`/api/v1/admin/users/${createdUserId}`)
        .set("Cookie", adminCookie);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty("id", createdUserId);
    });
  });

  describe("PATCH /api/v1/admin/users/:id", () => {
    it("harus update full_name user", async () => {
      if (!createdUserId) return;

      const res = await request(app)
        .patch(`/api/v1/admin/users/${createdUserId}`)
        .set("Cookie", adminCookie)
        .send({ full_name: `Test Driver Updated ${TS}` });

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty("full_name", `Test Driver Updated ${TS}`);
    });
  });

  describe("DELETE /api/v1/admin/users/:id", () => {
    it("harus delete (soft/hard) user berhasil", async () => {
      if (!createdUserId) return;

      const res = await request(app)
        .delete(`/api/v1/admin/users/${createdUserId}`)
        .set("Cookie", adminCookie);

      expect(res.status).toBe(200);
      createdUserId = null;
    });
  });

  // ── Outlets CRUD ───────────────────────────────────────────────────────────

  describe("GET /api/v1/admin/outlets", () => {
    it("harus return daftar outlet", async () => {
      const res = await request(app)
        .get("/api/v1/admin/outlets")
        .set("Cookie", adminCookie);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
    });
  });

  describe("POST /api/v1/admin/outlets", () => {
    it("harus buat outlet baru dan return 201", async () => {
      const res = await request(app)
        .post("/api/v1/admin/outlets")
        .set("Cookie", adminCookie)
        .send({
          name: `Test Outlet ${TS}`,
          address: "Jl. Test Outlet No. 1, Jakarta",
          province: "DKI Jakarta",
          city: "Jakarta Pusat",
          district: "Menteng",
          latitude: -6.2,
          longitude: 106.8167,
          service_radius_km: 5,
          is_active: true,
        });

      expect(res.status).toBe(201);
      expect(res.body.data).toHaveProperty("id");
      createdOutletId = res.body.data.id;
    });
  });

  describe("PATCH /api/v1/admin/outlets/:id", () => {
    it("harus update service_radius_km outlet", async () => {
      if (!createdOutletId) return;

      const res = await request(app)
        .patch(`/api/v1/admin/outlets/${createdOutletId}`)
        .set("Cookie", adminCookie)
        .send({ service_radius_km: 8 });

      expect(res.status).toBe(200);
    });
  });

  describe("DELETE /api/v1/admin/outlets/:id", () => {
    it("harus deaktivasi outlet (soft delete)", async () => {
      if (!createdOutletId) return;

      const res = await request(app)
        .delete(`/api/v1/admin/outlets/${createdOutletId}`)
        .set("Cookie", adminCookie);

      expect(res.status).toBe(200);
      createdOutletId = null;
    });
  });

  // ── Shifts CRUD ────────────────────────────────────────────────────────────

  describe("GET /api/v1/admin/shifts", () => {
    it("harus return daftar shift", async () => {
      const res = await request(app)
        .get("/api/v1/admin/shifts")
        .set("Cookie", adminCookie);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
    });
  });

  describe("POST /api/v1/admin/shifts", () => {
    it("harus buat shift baru dan return 201", async () => {
      const res = await request(app)
        .post("/api/v1/admin/shifts")
        .set("Cookie", adminCookie)
        .send({
          name: `Shift Test ${TS}`,
          start_time: "07:00",
          end_time: "15:00",
          is_active: true,
        });

      expect(res.status).toBe(201);
      expect(res.body.data).toHaveProperty("id");
      createdShiftId = res.body.data.id;
    });
  });

  describe("PATCH /api/v1/admin/shifts/:id", () => {
    it("harus update end_time shift", async () => {
      if (!createdShiftId) return;

      const res = await request(app)
        .patch(`/api/v1/admin/shifts/${createdShiftId}`)
        .set("Cookie", adminCookie)
        .send({ end_time: "16:00" });

      expect(res.status).toBe(200);
    });
  });

  describe("DELETE /api/v1/admin/shifts/:id", () => {
    it("harus delete shift", async () => {
      if (!createdShiftId) return;

      const res = await request(app)
        .delete(`/api/v1/admin/shifts/${createdShiftId}`)
        .set("Cookie", adminCookie);

      expect(res.status).toBe(200);
      createdShiftId = null;
    });
  });

  // ── Laundry Items CRUD ─────────────────────────────────────────────────────

  describe("GET /api/v1/admin/laundry-items", () => {
    it("harus return daftar laundry items", async () => {
      const res = await request(app)
        .get("/api/v1/admin/laundry-items")
        .set("Cookie", adminCookie);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
    });
  });

  describe("POST /api/v1/admin/laundry-items", () => {
    it("harus buat laundry item baru dan return 201", async () => {
      const res = await request(app)
        .post("/api/v1/admin/laundry-items")
        .set("Cookie", adminCookie)
        .send({
          name: `Item Test ${TS}`,
          unit: "pcs",
          base_price: 10000,
          is_active: true,
        });

      expect(res.status).toBe(201);
      expect(res.body.data).toHaveProperty("id");
      createdLaundryItemId = res.body.data.id;
    });
  });

  describe("PATCH /api/v1/admin/laundry-items/:id", () => {
    it("harus update base_price laundry item", async () => {
      if (!createdLaundryItemId) return;

      const res = await request(app)
        .patch(`/api/v1/admin/laundry-items/${createdLaundryItemId}`)
        .set("Cookie", adminCookie)
        .send({ base_price: 12000 });

      expect(res.status).toBe(200);
    });
  });

  describe("DELETE /api/v1/admin/laundry-items/:id", () => {
    it("harus delete laundry item", async () => {
      if (!createdLaundryItemId) return;

      const res = await request(app)
        .delete(`/api/v1/admin/laundry-items/${createdLaundryItemId}`)
        .set("Cookie", adminCookie);

      expect(res.status).toBe(200);
      createdLaundryItemId = null;
    });
  });

  // ── Notifications ─────────────────────────────────────────────────────────

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

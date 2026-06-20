import request from "supertest";
import app from "../../src/app";
import { getAuthCookie } from "../helpers/auth.helper";
import {
  testPrisma,
  createTestAddress,
  deleteTestCustomerByEmail,
} from "../helpers/data.helper";

const TEST_EMAIL = `test-reg-${Date.now()}@freshpress-test.com`;

describe("Customer — Positive Cases", () => {
  let authCookie: string;
  let customerId: string;

  beforeAll(async () => {
    authCookie = await getAuthCookie("customer");
    const c = await testPrisma.customer.findUnique({
      where: { email: "testcustomer@freshpress.com" },
    });
    if (!c) throw new Error("Seed customer tidak ditemukan — jalankan seed terlebih dahulu");
    customerId = c.id;
  });

  afterAll(async () => {
    await deleteTestCustomerByEmail(TEST_EMAIL);
    await testPrisma.$disconnect();
  });

  // ── Auth ───────────────────────────────────────────────────────────────────

  describe("POST /api/v1/customer/auth/register", () => {
    it("harus berhasil register customer baru dan return 201", async () => {
      const res = await request(app)
        .post("/api/v1/customer/auth/register")
        .send({ full_name: "New Test User", email: TEST_EMAIL });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("message");
    });
  });

  describe("Auth cookie", () => {
    it("harus berhasil login dan mendapat accessToken cookie", () => {
      expect(authCookie).toBeTruthy();
      expect(authCookie).toMatch(/^accessToken=/);
    });
  });

  // ── Profile ────────────────────────────────────────────────────────────────

  describe("GET /api/v1/customer/profile", () => {
    it("harus return profile customer ketika authenticated", async () => {
      const res = await request(app)
        .get("/api/v1/customer/profile")
        .set("Cookie", authCookie);

      expect(res.status).toBe(200);
      // Customer profile controller returns raw object (no data wrapper)
      expect(res.body).toHaveProperty("email", "testcustomer@freshpress.com");
    });
  });

  // ── Addresses ─────────────────────────────────────────────────────────────

  describe("Customer Addresses", () => {
    let createdAddressId: string;

    afterEach(async () => {
      if (createdAddressId) {
        await testPrisma.customerAddress
          .delete({ where: { id: createdAddressId } })
          .catch(() => {});
        createdAddressId = "";
      }
    });

    it("POST /api/v1/customer/addresses — harus buat alamat dan return 201", async () => {
      const res = await request(app)
        .post("/api/v1/customer/addresses")
        .set("Cookie", authCookie)
        .send({
          label: "Rumah Test Positive",
          address: "Jl. Merdeka No. 10, Jakarta Pusat",
          province: "DKI Jakarta",
          city: "Jakarta Pusat",
          district: "Menteng",
          postal_code: "10110",
          latitude: -6.2,
          longitude: 106.8167,
        });

      expect(res.status).toBe(201);
      expect(res.body.data).toHaveProperty("id");
      createdAddressId = res.body.data.id;
    });

    it("GET /api/v1/customer/addresses — harus return array alamat", async () => {
      const addr = await createTestAddress(customerId);
      createdAddressId = addr.id;

      const res = await request(app)
        .get("/api/v1/customer/addresses")
        .set("Cookie", authCookie);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it("PATCH /api/v1/customer/addresses/:id/primary — harus set alamat sebagai primary", async () => {
      const addr = await createTestAddress(customerId);
      createdAddressId = addr.id;

      const res = await request(app)
        .patch(`/api/v1/customer/addresses/${addr.id}/primary`)
        .set("Cookie", authCookie);

      expect(res.status).toBe(200);
    });

    it("DELETE /api/v1/customer/addresses/:id — harus hapus alamat", async () => {
      const addr = await createTestAddress(customerId);

      const res = await request(app)
        .delete(`/api/v1/customer/addresses/${addr.id}`)
        .set("Cookie", authCookie);

      // DELETE uses noContent() helper → 204
      expect(res.status).toBe(204);
      createdAddressId = "";
    });
  });

  // ── Orders ─────────────────────────────────────────────────────────────────

  describe("GET /api/v1/customer/orders", () => {
    it("harus return daftar orders dengan pagination", async () => {
      const res = await request(app)
        .get("/api/v1/customer/orders")
        .query({ page: 1, limit: 5 })
        .set("Cookie", authCookie);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("data");
    });
  });

  describe("POST /api/v1/customer/orders", () => {
    it("harus buat order ketika alamat dalam radius outlet dan tanggal valid", async () => {
      // Buat alamat dekat outlet Rumah Akmal (-6.229383828043414, 106.56748566704175)
      const addr = await createTestAddress(customerId, { latitude: -6.229383828043414, longitude: 106.56748566704175 });
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateStr = tomorrow.toISOString().split("T")[0];

      const res = await request(app)
        .post("/api/v1/customer/orders")
        .set("Cookie", authCookie)
        .send({
          pickup_address_id: addr.id,
          pickup_date: dateStr,
          service_type: "wash-and-fold",
          estimated_weight_kg: 3,
        });

      // Cleanup order jika berhasil
      if (res.status === 201 && res.body.data?.id) {
        const orderId = res.body.data.id;
        await testPrisma.driverTask.deleteMany({ where: { order_id: orderId } });
        await testPrisma.orderStatusHistory.deleteMany({ where: { order_id: orderId } });
        await testPrisma.order.delete({ where: { id: orderId } });
      }
      await testPrisma.customerAddress.delete({ where: { id: addr.id } });

      expect(res.status).toBe(201);
      expect(res.body.data).toHaveProperty("invoice_number");
    });
  });

  // ── Notifications ─────────────────────────────────────────────────────────

  describe("GET /api/v1/customer/notifications", () => {
    it("harus return daftar notifikasi", async () => {
      const res = await request(app)
        .get("/api/v1/customer/notifications")
        .set("Cookie", authCookie);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("data");
    });
  });

  describe("GET /api/v1/customer/notifications/unread-count", () => {
    it("harus return jumlah notifikasi belum dibaca", async () => {
      const res = await request(app)
        .get("/api/v1/customer/notifications/unread-count")
        .set("Cookie", authCookie);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty("count");
      expect(typeof res.body.data.count).toBe("number");
    });
  });
});

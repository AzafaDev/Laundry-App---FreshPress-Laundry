import request from "supertest";
import app from "../../src/app";

export const SEED_CREDENTIALS = {
  customer: {
    email: "testcustomer@freshpress.com",
    password: "Password123",
    endpoint: "/api/v1/customer/auth/login",
  },
  driver: {
    email: "driver.morning@freshpress.com",
    password: "Password123",
    endpoint: "/api/v1/employee/auth/login",
  },
  washing_worker: {
    email: "washing_worker.morning@freshpress.com",
    password: "Password123",
    endpoint: "/api/v1/employee/auth/login",
  },
  ironing_worker: {
    email: "ironing_worker.morning@freshpress.com",
    password: "Password123",
    endpoint: "/api/v1/employee/auth/login",
  },
  packing_worker: {
    email: "packing_worker.morning@freshpress.com",
    password: "Password123",
    endpoint: "/api/v1/employee/auth/login",
  },
  outlet_admin: {
    email: "outletadmin@freshpress.com",
    password: "Password123",
    endpoint: "/api/v1/employee/auth/login",
  },
  super_admin: {
    email: "superadmin@freshpress.com",
    password: "Password123",
    endpoint: "/api/v1/employee/auth/login",
  },
} as const;

type Role = keyof typeof SEED_CREDENTIALS;

const tokenCache = new Map<Role, string>();

export async function getAuthCookie(role: Role, forceRefresh = false): Promise<string> {
  if (!forceRefresh && tokenCache.has(role)) {
    return tokenCache.get(role)!;
  }

  const cred = SEED_CREDENTIALS[role];
  const res = await request(app)
    .post(cred.endpoint)
    .send({ email: cred.email, password: cred.password });

  if (res.status !== 200) {
    throw new Error(
      `[auth.helper] Login failed for role="${role}" (${res.status}): ${JSON.stringify(res.body)}`
    );
  }

  const cookies: string[] = (res.headers["set-cookie"] as string[]) ?? [];
  const accessTokenCookie = cookies.find((c) => c.startsWith("accessToken="));
  if (!accessTokenCookie) {
    throw new Error(`[auth.helper] No accessToken cookie returned for role="${role}"`);
  }

  const cookieValue = accessTokenCookie.split(";")[0];
  tokenCache.set(role, cookieValue);
  return cookieValue;
}

export function clearTokenCache(role?: Role) {
  if (role) {
    tokenCache.delete(role);
  } else {
    tokenCache.clear();
  }
}

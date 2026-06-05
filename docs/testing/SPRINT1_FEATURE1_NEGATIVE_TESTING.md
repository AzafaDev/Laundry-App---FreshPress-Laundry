# Sprint 1 · Feature 1 (Orang A — Customer) · Negative Testing Guide

> **Scope:** Auth API (Register, Verify, Login, Reset Password, Google OAuth) + Frontend Auth Pages  
> **Base URL:** `http://localhost:3000/api/v1`  
> **Tool:** Postman / Thunder Client / curl

---

## Prerequisites

- Server running, database migrated & seeded
- At least one verified customer already exists: `budi@example.com`

---

## 1. POST /auth/register — Registration Failures

### TC-NEG-01 · Register with duplicate email

**Request**
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "full_name": "Budi Lain",
  "email": "budi@example.com",
  "phone": "089999999999"
}
```

**Expected Response**
```json
{
  "status": "error",
  "message": "Email already registered."
}
```
**HTTP Status:** `409 Conflict`

**Database check:** No new `Customer` or `EmailToken` row created.

---

### TC-NEG-02 · Register with missing required fields

**Request** (missing `full_name`)
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "newuser@example.com",
  "phone": "081111111111"
}
```

**Expected Response**
```json
{
  "status": "error",
  "message": "Validation error.",
  "errors": [{ "field": "full_name", "message": "full_name is required" }]
}
```
**HTTP Status:** `400 Bad Request`

---

### TC-NEG-03 · Register with invalid email format

**Request**
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "full_name": "Test User",
  "email": "not-an-email",
  "phone": "081111111111"
}
```

**Expected:**  
**HTTP Status:** `400 Bad Request` with email format error

---

### TC-NEG-04 · Register with invalid phone number format

**Request**
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "full_name": "Test User",
  "email": "test@example.com",
  "phone": "abc-not-a-phone"
}
```

**Expected:**  
**HTTP Status:** `400 Bad Request` with phone format error

---

## 2. POST /auth/verify — Verification Failures

### TC-NEG-05 · Verify with expired token

**Setup:** Manually set `EmailToken.expires_at = now() - 1 hour` in DB for a valid token

**Request**
```http
POST /api/v1/auth/verify
Content-Type: application/json

{
  "token": "<expired_token>",
  "password": "SecurePass123!",
  "password_confirmation": "SecurePass123!"
}
```

**Expected Response**
```json
{
  "status": "error",
  "message": "Verification token has expired."
}
```
**HTTP Status:** `400 Bad Request`

**Database check:** `Customer.is_verified` remains `false`, `EmailToken.is_used` remains `false`.

---

### TC-NEG-06 · Verify with already-used token

**Setup:** Use the token from TC-POS-02 (already used)

**Request**
```http
POST /api/v1/auth/verify
Content-Type: application/json

{
  "token": "<already_used_token>",
  "password": "SecurePass123!",
  "password_confirmation": "SecurePass123!"
}
```

**Expected Response**
```json
{
  "status": "error",
  "message": "Verification token has already been used."
}
```
**HTTP Status:** `400 Bad Request`

---

### TC-NEG-07 · Verify with non-existent / tampered token

**Request**
```http
POST /api/v1/auth/verify
Content-Type: application/json

{
  "token": "totally-fake-token-12345",
  "password": "SecurePass123!",
  "password_confirmation": "SecurePass123!"
}
```

**Expected Response**
```json
{
  "status": "error",
  "message": "Invalid verification token."
}
```
**HTTP Status:** `400 Bad Request`

---

### TC-NEG-08 · Verify with password confirmation mismatch

**Request**
```http
POST /api/v1/auth/verify
Content-Type: application/json

{
  "token": "<valid_unused_token>",
  "password": "SecurePass123!",
  "password_confirmation": "DifferentPass999!"
}
```

**Expected:**  
**HTTP Status:** `400 Bad Request` with password mismatch error

---

### TC-NEG-09 · Verify with weak password

**Request**
```http
POST /api/v1/auth/verify
Content-Type: application/json

{
  "token": "<valid_unused_token>",
  "password": "123",
  "password_confirmation": "123"
}
```

**Expected:**  
**HTTP Status:** `400 Bad Request` with password strength error (minimum length / complexity)

---

### TC-NEG-10 · Verify using a reset_password token (wrong type)

**Setup:** Use a token from a forgot-password request (`type = "reset_password"`)

**Request**
```http
POST /api/v1/auth/verify
Content-Type: application/json

{
  "token": "<reset_password_token>",
  "password": "SecurePass123!",
  "password_confirmation": "SecurePass123!"
}
```

**Expected:**  
**HTTP Status:** `400 Bad Request` — token type mismatch

---

## 3. POST /auth/login — Login Failures

### TC-NEG-11 · Login with wrong password

**Request**
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "budi@example.com",
  "password": "WrongPassword!"
}
```

**Expected Response**
```json
{
  "status": "error",
  "message": "Invalid email or password."
}
```
**HTTP Status:** `401 Unauthorized`

> **Security note:** Message must NOT distinguish between "wrong email" vs "wrong password" (prevents user enumeration).

---

### TC-NEG-12 · Login with non-existent email

**Request**
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "ghost@example.com",
  "password": "AnyPassword!"
}
```

**Expected:**  
**HTTP Status:** `401 Unauthorized` — same generic message as TC-NEG-11 (no user enumeration)

---

### TC-NEG-13 · Login with unverified account

**Setup:** Register a new account (TC-POS-01) but do NOT verify it

**Request**
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "unverified@example.com",
  "password": "SecurePass123!"
}
```

**Expected Response**
```json
{
  "status": "error",
  "message": "Please verify your email before logging in."
}
```
**HTTP Status:** `403 Forbidden`

---

### TC-NEG-14 · Login with missing fields

**Request**
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "budi@example.com"
}
```

**Expected:**  
**HTTP Status:** `400 Bad Request` — password is required

---

## 4. POST /auth/forgot-password — Reset Request Failures

### TC-NEG-15 · Forgot password with non-existent email

**Request**
```http
POST /api/v1/auth/forgot-password
Content-Type: application/json

{
  "email": "doesnotexist@example.com"
}
```

**Expected Response**
```json
{
  "status": "success",
  "message": "Password reset email sent if the account exists."
}
```
**HTTP Status:** `200 OK`

> **Security note:** Must return the same response as a valid email to prevent user enumeration. No `EmailToken` should be created for non-existent emails.

---

### TC-NEG-16 · Forgot password with invalid email format

**Request**
```http
POST /api/v1/auth/forgot-password
Content-Type: application/json

{
  "email": "not-valid"
}
```

**Expected:**  
**HTTP Status:** `400 Bad Request` — invalid email format

---

## 5. POST /auth/reset-password — Reset Failures

### TC-NEG-17 · Reset password with expired reset token

**Setup:** Manually set `EmailToken.expires_at = now() - 1 hour` for a `reset_password` token

**Request**
```http
POST /api/v1/auth/reset-password
Content-Type: application/json

{
  "token": "<expired_reset_token>",
  "new_password": "NewPass123!",
  "new_password_confirmation": "NewPass123!"
}
```

**Expected Response**
```json
{
  "status": "error",
  "message": "Reset token has expired."
}
```
**HTTP Status:** `400 Bad Request`

---

### TC-NEG-18 · Reset password with already-used reset token

**Setup:** Use the reset token from TC-POS-05 (already used)

**Expected:**  
**HTTP Status:** `400 Bad Request` — token already used

---

### TC-NEG-19 · Reset password using an email_verification token (wrong type)

**Setup:** Use a token where `type = "email_verification"`

**Expected:**  
**HTTP Status:** `400 Bad Request` — token type mismatch

---

### TC-NEG-20 · Reset password with confirmation mismatch

**Request**
```http
POST /api/v1/auth/reset-password
Content-Type: application/json

{
  "token": "<valid_reset_token>",
  "new_password": "NewPass123!",
  "new_password_confirmation": "MismatchPass!"
}
```

**Expected:**  
**HTTP Status:** `400 Bad Request` — passwords do not match

---

## 6. Auth — Middleware & Token Security

### TC-NEG-21 · Access protected route without token

**Request**
```http
GET /api/v1/customer/profile
(no Authorization header)
```

**Expected:**  
**HTTP Status:** `401 Unauthorized`

---

### TC-NEG-22 · Access protected route with tampered JWT

**Request**
```http
GET /api/v1/customer/profile
Authorization: Bearer <valid_jwt_but_with_last_char_changed>
```

**Expected:**  
**HTTP Status:** `401 Unauthorized` — invalid signature

---

### TC-NEG-23 · Access customer route with employee JWT

**Setup:** Login as an admin employee, use that JWT

**Request**
```http
GET /api/v1/customer/profile
Authorization: Bearer <employee_jwt>
```

**Expected:**  
**HTTP Status:** `403 Forbidden` — insufficient role

---

## 7. Rate Limiting

### TC-NEG-24 · Exceed login rate limit

**Steps:** Send more than the allowed number of `POST /auth/login` requests in a short window (e.g., 10 requests in 1 minute if limit is 5)

**Expected:**  
**HTTP Status:** `429 Too Many Requests`

```json
{
  "status": "error",
  "message": "Too many requests. Please try again later."
}
```

---

## 8. Frontend — Validation & UX Failures

### TC-NEG-25 · Register form — empty submission

**Steps:**
1. Navigate to `/register`
2. Click Submit without filling any fields

**Expected:**
- Inline validation errors appear on all required fields
- No API request is made (client-side validation)
- No toast error from server

---

### TC-NEG-26 · Login form — invalid email format (client-side)

**Steps:**
1. Navigate to `/login`
2. Enter `budi@` in email field, any password
3. Submit

**Expected:**
- Client-side validation shows "Invalid email format"
- No API call made

---

### TC-NEG-27 · Verify page — no token in URL

**Steps:**
1. Navigate to `/verify` (no `?token=` query param)

**Expected:**
- Page shows error message: "Invalid or missing verification token"
- Form is disabled or not shown
- No crash / no blank page

---

### TC-NEG-28 · Reset password page — no token in URL

**Steps:**
1. Navigate to `/reset-password` (no `?token=` query param)

**Expected:**
- Page shows error message: "Invalid or missing reset token"
- No form rendered

---

### TC-NEG-29 · Next.js middleware — authenticated customer accessing /login

**Steps:**
1. Log in as customer (valid session in `authStore`)
2. Manually navigate to `/login`

**Expected:**
- Next.js middleware redirects away from `/login` to `/customer` (or appropriate dashboard)
- `/login` page is NOT shown to already-authenticated users

---

### TC-NEG-30 · Geolocation denied — locationStore behavior

**Steps:**
1. Navigate to `/`
2. When prompted for geolocation, click **Block/Deny**

**Expected:**
- No crash
- `locationStore` has `null` coordinates or shows a graceful fallback message
- User can still use the app (geolocation is optional for landing page)

---

## Summary Checklist

| ID | Test Case | Area | Pass |
|----|-----------|------|------|
| TC-NEG-01 | Register duplicate email | Backend | ☐ |
| TC-NEG-02 | Register missing required fields | Backend | ☐ |
| TC-NEG-03 | Register invalid email format | Backend | ☐ |
| TC-NEG-04 | Register invalid phone format | Backend | ☐ |
| TC-NEG-05 | Verify expired token | Backend | ☐ |
| TC-NEG-06 | Verify already-used token | Backend | ☐ |
| TC-NEG-07 | Verify fake/tampered token | Backend | ☐ |
| TC-NEG-08 | Verify password confirmation mismatch | Backend | ☐ |
| TC-NEG-09 | Verify weak password | Backend | ☐ |
| TC-NEG-10 | Verify using wrong token type | Backend | ☐ |
| TC-NEG-11 | Login wrong password | Backend | ☐ |
| TC-NEG-12 | Login non-existent email | Backend | ☐ |
| TC-NEG-13 | Login unverified account | Backend | ☐ |
| TC-NEG-14 | Login missing fields | Backend | ☐ |
| TC-NEG-15 | Forgot password non-existent email | Backend | ☐ |
| TC-NEG-16 | Forgot password invalid email format | Backend | ☐ |
| TC-NEG-17 | Reset with expired token | Backend | ☐ |
| TC-NEG-18 | Reset with already-used token | Backend | ☐ |
| TC-NEG-19 | Reset using wrong token type | Backend | ☐ |
| TC-NEG-20 | Reset password confirmation mismatch | Backend | ☐ |
| TC-NEG-21 | Access protected route without token | Backend | ☐ |
| TC-NEG-22 | Tampered JWT | Backend | ☐ |
| TC-NEG-23 | Wrong role accessing customer route | Backend | ☐ |
| TC-NEG-24 | Rate limit exceeded on login | Backend | ☐ |
| TC-NEG-25 | Register form empty submission | Frontend | ☐ |
| TC-NEG-26 | Login invalid email format client-side | Frontend | ☐ |
| TC-NEG-27 | Verify page — no token in URL | Frontend | ☐ |
| TC-NEG-28 | Reset page — no token in URL | Frontend | ☐ |
| TC-NEG-29 | Authenticated user accessing /login | Frontend | ☐ |
| TC-NEG-30 | Geolocation denied — graceful fallback | Frontend | ☐ |

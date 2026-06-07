# Sprint 1 · Feature 1 (Orang A — Customer) · Positive Testing Guide

> **Scope:** Auth API (Register, Verify, Login, Reset Password, Google OAuth) + Landing Page & Frontend Auth Pages  
> **Base URL:** `http://localhost:3000/api/v1`  
> **Tool:** Postman / Thunder Client / curl

---

## Prerequisites

- Server running, database migrated & seeded
- Mailtrap (or equivalent) configured for email capture
- Valid Google OAuth credentials for OAuth tests

---

## 1. POST /auth/register — Customer Registration

### TC-POS-01 · Register with valid data

**Given** a new unique email address

**Request**
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "full_name": "Budi Santoso",
  "email": "budi@example.com",
  "phone": "081234567890"
}
```

**Expected Response**
```json
{
  "status": "success",
  "message": "Registration successful. Please check your email to verify your account.",
  "data": {
    "customer_id": "<uuid>",
    "email": "budi@example.com"
  }
}
```
**HTTP Status:** `201 Created`

**Database checks:**
- `Customer` row created with `is_verified = false`, `password_hash = null`
- `EmailToken` row created:
  - `type = "email_verification"`
  - `is_used = false`
  - `expires_at` ≈ now + 1 hour
  - `customer_id` matches the new customer

**Email check:**
- Verification email received in Mailtrap with token in URL

---

## 2. POST /auth/verify — Email Verification

### TC-POS-02 · Verify email with valid token + set password

**Given** a token from TC-POS-01 that is unused and not expired

**Request**
```http
POST /api/v1/auth/verify
Content-Type: application/json

{
  "token": "<token_from_email>",
  "password": "SecurePass123!",
  "password_confirmation": "SecurePass123!"
}
```

**Expected Response**
```json
{
  "status": "success",
  "message": "Email verified successfully.",
  "data": {
    "customer_id": "<uuid>",
    "email": "budi@example.com",
    "is_verified": true
  }
}
```
**HTTP Status:** `200 OK`

**Database checks:**
- `EmailToken.is_used = true`
- `Customer.is_verified = true`
- `Customer.password_hash` is now set (bcrypt hash, not plain text)

---

## 3. POST /auth/login — Customer Login

### TC-POS-03 · Login with valid credentials (verified account)

**Given** the verified customer from TC-POS-02

**Request**
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "budi@example.com",
  "password": "SecurePass123!"
}
```

**Expected Response**
```json
{
  "status": "success",
  "message": "Login successful.",
  "data": {
    "access_token": "<jwt_token>",
    "customer": {
      "customer_id": "<uuid>",
      "email": "budi@example.com",
      "full_name": "Budi Santoso",
      "is_verified": true
    }
  }
}
```
**HTTP Status:** `200 OK`

**JWT payload checks** (decode token):
- Contains `userId`, `role = "customer"`, `email`
- `exp` is set correctly (not expired)

---

## 4. POST /auth/forgot-password — Request Password Reset

### TC-POS-04 · Request reset for existing verified account

**Request**
```http
POST /api/v1/auth/forgot-password
Content-Type: application/json

{
  "email": "budi@example.com"
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

**Database checks:**
- New `EmailToken` row created:
  - `type = "reset_password"`
  - `is_used = false`
  - `expires_at` ≈ now + 1 hour
  - `customer_id` matches

**Email check:**
- Reset password email received in Mailtrap with token in URL

---

## 5. POST /auth/reset-password — Reset Password

### TC-POS-05 · Reset password with valid reset token

**Given** the reset token from TC-POS-04

**Request**
```http
POST /api/v1/auth/reset-password
Content-Type: application/json

{
  "token": "<reset_token_from_email>",
  "new_password": "NewSecurePass456!",
  "new_password_confirmation": "NewSecurePass456!"
}
```

**Expected Response**
```json
{
  "status": "success",
  "message": "Password has been reset successfully."
}
```
**HTTP Status:** `200 OK`

**Database checks:**
- `EmailToken.is_used = true`
- `Customer.password_hash` updated to new hash

**Follow-up verification:**
- Login with `budi@example.com` + `NewSecurePass456!` returns `200 OK` ✅
- Login with old password `SecurePass123!` returns `401` ✅

---

## 6. GET /auth/google — Google OAuth

### TC-POS-06 · New customer registers via Google OAuth

**Flow**
1. Navigate to `GET /api/v1/auth/google` in browser
2. Complete Google OAuth consent screen
3. Callback is processed

**Expected Outcome**
- `Customer` row created (or found if email exists)
- `SocialAccount` row created:
  - `provider = "google"`
  - `provider_uid` = Google UID
  - `customer_id` = linked customer
- Response contains JWT or redirect to frontend with token

**Database checks:**
- `SocialAccount.customer_id` links correctly to `Customer`
- `SocialAccount.provider_uid` is not null

### TC-POS-07 · Existing customer links Google account

**Given** customer `budi@example.com` already exists (email matches Google account)

**Expected Outcome**
- No duplicate `Customer` created
- New `SocialAccount` linked to existing `Customer`
- Login succeeds, returns existing customer data

---

## 7. Frontend — Landing Page

### TC-POS-08 · Landing page loads correctly

**Steps**
1. Navigate to `http://localhost:3001/`
2. Page renders navbar, hero carousel (Swiper), services section, footer
3. Browser prompts for geolocation permission
4. Accept geolocation permission

**Expected:**
- Swiper carousel auto-plays or has navigation arrows
- `locationStore` in Zustand DevTools contains `{ lat, lng }` after permission grant
- No console errors

---

## 8. Frontend — Auth Pages

### TC-POS-09 · Register page — valid form submission

**Steps**
1. Navigate to `/register`
2. Fill in `full_name`, `email`, `phone`
3. Submit

**Expected:**
- Success toast appears ("Check your email to verify")
- Form is cleared or redirect occurs

### TC-POS-10 · Login page — valid credentials redirect by role

**Steps**
1. Navigate to `/login`
2. Enter `budi@example.com` + `NewSecurePass456!`
3. Submit

**Expected:**
- `authStore.role = "customer"` in Zustand
- Next.js middleware redirects to `/customer` dashboard (or correct customer route)
- No redirect to `/login` again

### TC-POS-11 · Verify page — token from URL pre-populated

**Steps**
1. Click verification link from email: `/verify?token=<token>`
2. Page loads with token already bound (hidden or visible)
3. Fill in `password` + `password_confirmation`
4. Submit

**Expected:**
- Success toast appears
- Redirect to `/login`

### TC-POS-12 · Forgot password page — valid email submission

**Steps**
1. Navigate to `/forgot-password`
2. Enter `budi@example.com`
3. Submit

**Expected:**
- Success message displayed (same message whether email exists or not — security best practice)
- No error toast

### TC-POS-13 · Reset password page — valid token + new password

**Steps**
1. Click reset link from email: `/reset-password?token=<reset_token>`
2. Enter `NewSecurePass789!` + confirmation
3. Submit

**Expected:**
- Success toast
- Redirect to `/login`

### TC-POS-14 · Next.js middleware — unauthenticated redirect

**Steps**
1. Clear all cookies/localStorage
2. Navigate to `/customer` (protected route)

**Expected:**
- Redirected to `/login` by Next.js middleware
- No customer content visible

---

## Summary Checklist

| ID | Test Case | Area | Pass |
|----|-----------|------|------|
| TC-POS-01 | Register with valid data | Backend | ☐ |
| TC-POS-02 | Verify email with valid token | Backend | ☐ |
| TC-POS-03 | Login with valid credentials | Backend | ☐ |
| TC-POS-04 | Request password reset | Backend | ☐ |
| TC-POS-05 | Reset password with valid token | Backend | ☐ |
| TC-POS-06 | Google OAuth — new customer | Backend | ☐ |
| TC-POS-07 | Google OAuth — existing customer | Backend | ☐ |
| TC-POS-08 | Landing page + geolocation | Frontend | ☐ |
| TC-POS-09 | Register form — valid submission | Frontend | ☐ |
| TC-POS-10 | Login + role-based redirect | Frontend | ☐ |
| TC-POS-11 | Verify page — token from URL | Frontend | ☐ |
| TC-POS-12 | Forgot password form | Frontend | ☐ |
| TC-POS-13 | Reset password form | Frontend | ☐ |
| TC-POS-14 | Middleware redirect unauthenticated | Frontend | ☐ |

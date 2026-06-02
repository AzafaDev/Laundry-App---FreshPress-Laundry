# FreshPress Laundry — Manual Testing Guide Sprint 1
**Date:** June 2026
**Covers:** Feature 1 (Customer Auth) · Feature 2 (Admin) · Feature 3 (Driver/Worker Attendance)
**Method:** Browser-based manual testing only (no Postman/curl required)

---

## Legend

| Label | Description |
|---|---|
| POSITIVE | System behaves correctly with valid input / happy path |
| NEGATIVE | System handles invalid / edge-case input gracefully |

---

## Prerequisites (Global)

- Server running: `apps/api` on `http://localhost:3000`
- Frontend running: `apps/web` on `http://localhost:3001`
- Database migrated & seeded
- Mailtrap (or equivalent) open in browser for email capture
- Browser: Chrome / Edge (DevTools available)

---

---

# Feature 1 — Customer Auth & Landing Page
**Owner:** Orang A
**Scope:** Register · Verify · Login · Reset Password · Google OAuth · Landing Page · Frontend Auth Pages

---

## Positive Tests

### 1. Register

**TC-A-POS-01 · Register with valid data**

1. Navigate to `http://localhost:3001/register`
2. Fill in: Nama Lengkap, Email (new unique email), No. HP
3. Click Submit

Expected:
- Success toast appears ("Check your email to verify your account" or similar)
- Form cleared or redirect occurs
- Verification email received in Mailtrap with a link containing `?token=`

---

### 2. Verify Email

**TC-A-POS-02 · Verify email with valid token + set password**

1. Open Mailtrap · Click verification link from TC-A-POS-01
2. Page `/verify?token=<token>` loads
3. Fill in Password + Password Confirmation
4. Click Submit

Expected:
- Success toast ("Email verified successfully" or similar)
- Redirected to `/login`

---

### 3. Login

**TC-A-POS-03 · Login with valid credentials**

1. Navigate to `/login`
2. Enter email + password from TC-A-POS-02
3. Click Masuk

Expected:
- Redirected to `/customer` dashboard
- User is logged in (name/email visible in UI)

---

### 4. Forgot Password

**TC-A-POS-04 · Request password reset**

1. Navigate to `/forgot-password`
2. Enter the email from TC-A-POS-01
3. Click Submit

Expected:
- Success message shown ("Password reset email sent if the account exists")
- Reset email received in Mailtrap with link containing `?token=`

---

### 5. Reset Password

**TC-A-POS-05 · Reset password with valid reset token**

1. Open Mailtrap · Click reset link from TC-A-POS-04
2. Page `/reset-password?token=<token>` loads
3. Enter new password + confirmation
4. Click Submit

Expected:
- Success toast ("Password has been reset successfully")
- Redirected to `/login`

Follow-up verification:
- Login with new password → succeeds ✅
- Login with old password → fails with error ✅

---

### 6. Google OAuth

**TC-A-POS-06 · New customer registers via Google OAuth**

1. Navigate to `/login` or `/register`
2. Click "Login with Google" / "Register with Google"
3. Complete Google OAuth consent screen

Expected:
- Redirected to `/customer` dashboard after consent
- User logged in with Google account name/email visible

**TC-A-POS-07 · Existing customer login via Google (same email)**

1. Use a Google account whose email is already registered
2. Click "Login with Google" · Complete consent

Expected:
- Logged in to existing account (no duplicate account created)
- Redirected to `/customer` dashboard

---

### 7. Landing Page

**TC-A-POS-08 · Landing page loads correctly**

1. Navigate to `http://localhost:3001/`
2. When browser prompts for geolocation — click Allow

Expected:
- Navbar, hero carousel (Swiper), services section, footer all render
- Carousel auto-plays or navigation arrows visible
- No console errors (open DevTools → Console to verify)

---

### 8. Middleware & Auth Flow

**TC-A-POS-09 · Unauthenticated user redirected from protected route**

1. Clear all cookies/localStorage (DevTools → Application → Clear site data)
2. Navigate to `http://localhost:3001/customer`

Expected: Redirected to `/login` · No customer content visible

---

## Negative Tests

### 1. Register

**TC-A-NEG-01 · Register with duplicate email**

1. Navigate to `/register`
2. Enter an email that is already registered
3. Click Submit

Expected: Error toast/message "Email already registered" or similar · No new account created

**TC-A-NEG-02 · Register with missing required fields**

1. Navigate to `/register` · Click Submit without filling any fields

Expected: Inline validation errors on all required fields · No API request made · No server toast

**TC-A-NEG-03 · Register with invalid email format**

1. Enter `notanemail` in the email field · Click Submit

Expected: Validation error "Invalid email format" · Submission blocked

**TC-A-NEG-04 · Register with invalid phone format**

1. Enter `abcdef` in the phone field · Click Submit

Expected: Validation error for phone format · Submission blocked

---

### 2. Verify

**TC-A-NEG-05 · Verify page — no token in URL**

1. Navigate to `/verify` (no `?token=` in URL)

Expected: Error message "Invalid or missing verification token" · Form disabled or not shown · No crash

**TC-A-NEG-06 · Verify with password confirmation mismatch**

1. Open a valid verify link
2. Enter Password: `SecurePass123!` · Confirmation: `DifferentPass!`
3. Click Submit

Expected: Validation error "Passwords do not match" · Submission blocked

**TC-A-NEG-07 · Verify with weak password**

1. Open a valid verify link · Enter password `123` + same confirmation
2. Click Submit

Expected: Error "Password too weak" / minimum length error · Submission blocked

---

### 3. Login

**TC-A-NEG-08 · Login with wrong password**

1. Navigate to `/login`
2. Enter valid email + wrong password · Click Masuk

Expected: Error toast "Invalid email or password" · Stays on login page

**TC-A-NEG-09 · Login with non-existent email**

1. Enter unregistered email + any password · Click Masuk

Expected: Same generic error as TC-A-NEG-08 (no hint about whether email exists)

**TC-A-NEG-10 · Login with unverified account**

1. Register a new account (TC-A-POS-01) but do NOT verify it
2. Navigate to `/login` · Enter that email + any password · Click Masuk

Expected: Error "Please verify your email before logging in"

**TC-A-NEG-11 · Already-logged-in user visits /login**

1. Log in as customer · Manually navigate to `/login`

Expected: Auto-redirected to `/customer` dashboard · Login page not shown

---

### 4. Reset Password

**TC-A-NEG-12 · Reset password page — no token in URL**

1. Navigate to `/reset-password` (no `?token=` param)

Expected: Error "Invalid or missing reset token" · No form rendered · No crash

**TC-A-NEG-13 · Reset password with confirmation mismatch**

1. Open valid reset link · Enter mismatched passwords · Click Submit

Expected: Validation error "Passwords do not match"

---

### 5. Landing Page

**TC-A-NEG-14 · Geolocation denied — graceful fallback**

1. Navigate to `http://localhost:3001/`
2. When prompted for geolocation — click Block/Deny

Expected: No crash · App still usable · No blank page · Graceful fallback message or null location state

---

## Summary Checklist — Feature 1

| ID | Test Case | Type | Pass |
|---|---|---|---|
| TC-A-POS-01 | Register with valid data | POSITIVE | ☐ |
| TC-A-POS-02 | Verify email with valid token | POSITIVE | ☐ |
| TC-A-POS-03 | Login with valid credentials | POSITIVE | ☐ |
| TC-A-POS-04 | Request password reset | POSITIVE | ☐ |
| TC-A-POS-05 | Reset password with valid token | POSITIVE | ☐ |
| TC-A-POS-06 | Google OAuth — new customer | POSITIVE | ☐ |
| TC-A-POS-07 | Google OAuth — existing customer | POSITIVE | ☐ |
| TC-A-POS-08 | Landing page + geolocation | POSITIVE | ☐ |
| TC-A-POS-09 | Unauthenticated redirect | POSITIVE | ☐ |
| TC-A-NEG-01 | Register duplicate email | NEGATIVE | ☐ |
| TC-A-NEG-02 | Register empty form | NEGATIVE | ☐ |
| TC-A-NEG-03 | Register invalid email format | NEGATIVE | ☐ |
| TC-A-NEG-04 | Register invalid phone format | NEGATIVE | ☐ |
| TC-A-NEG-05 | Verify page — no token in URL | NEGATIVE | ☐ |
| TC-A-NEG-06 | Verify password mismatch | NEGATIVE | ☐ |
| TC-A-NEG-07 | Verify weak password | NEGATIVE | ☐ |
| TC-A-NEG-08 | Login wrong password | NEGATIVE | ☐ |
| TC-A-NEG-09 | Login non-existent email | NEGATIVE | ☐ |
| TC-A-NEG-10 | Login unverified account | NEGATIVE | ☐ |
| TC-A-NEG-11 | Logged-in user visits /login | NEGATIVE | ☐ |
| TC-A-NEG-12 | Reset page — no token in URL | NEGATIVE | ☐ |
| TC-A-NEG-13 | Reset password mismatch | NEGATIVE | ☐ |
| TC-A-NEG-14 | Geolocation denied | NEGATIVE | ☐ |

---

---

# Feature 2 — Admin Panel
**Owner:** Orang B
**Scope:** Employee Login · User Management · Outlet Management · Work Shift Management

**Seed accounts:**

| Role | Email | Password |
|---|---|---|
| Super Admin | superadmin@freshpress.com | Password123 |
| Outlet Admin | outletadmin@freshpress.com | Password123 |

---

## Positive Tests

### 1. Authentication & Login

**TC-B-POS-01 · Super Admin login**

1. Navigate to `http://localhost:3001/employee/login`
2. Enter email: `superadmin@freshpress.com` · Password: `Password123`
3. Click Masuk

Expected: Redirected to `/dashboard/admin` · Admin sidebar visible with full navigation

**TC-B-POS-02 · Outlet Admin login**

1. Navigate to `/employee/login`
2. Enter email: `outletadmin@freshpress.com` · Password: `Password123` · Click Masuk

Expected: Redirected to `/dashboard/outlet-admin`

**TC-B-POS-03 · Worker login redirects to worker dashboard**

1. Login as `washing_worker` / `ironing_worker` / `packing_worker` employee

Expected: Redirected to `/dashboard/worker`

**TC-B-POS-04 · Driver login redirects to driver dashboard**

1. Login as `driver` role employee

Expected: Redirected to `/dashboard/driver`

**TC-B-POS-05 · Already-logged-in user visits /employee/login**

1. Log in as Super Admin
2. Manually navigate to `/employee/login`

Expected: Auto-redirected to `/dashboard/admin` · Login page not shown

---

### 2. User Management

**TC-B-POS-06 · Create new employee — invite email sent**

1. Go to User Management · Click Tambah User
2. Fill Nama Lengkap, Email, Role · Leave password blank
3. Click Buat & Kirim Undangan

Expected: Employee appears in table · Invite email received in Mailtrap

**TC-B-POS-07 · Employee activates account via invite link**

1. Open invite email in Mailtrap · Click 'Buat Password & Aktifkan Akun'
2. Enter & confirm new password · Click Simpan & Masuk

Expected: Auto-logged in · Redirected to role-specific dashboard

**TC-B-POS-08 · Edit employee — change role**

1. Find employee in table · Click Edit
2. Change Role · Click Simpan

Expected: Role updated in table immediately

**TC-B-POS-09 · Edit employee — reset password**

1. Click Edit on employee
2. Enter new password in 'Password Baru' field · Click Simpan

Expected: Success · Employee can log in with new password

**TC-B-POS-10 · Soft-delete employee**

1. Find active employee · Click delete icon · Confirm

Expected: Employee disappears from default list · No error shown

**TC-B-POS-11 · Filter users by role**

1. On User Management page · Select role from dropdown filter (e.g. Driver)

Expected: Table shows only employees with that role

**TC-B-POS-12 · Search users by name**

1. Type partial name in search box

Expected: Table filters to matching employees in real time

---

### 3. Outlet Management

**TC-B-POS-13 · Create outlet with all fields + map pin**

1. Go to Outlet Management · Click + New Outlet
2. Fill all text fields · Pin location on map · Set Radius Layanan
3. Click Simpan

Expected: Outlet appears in table · No error shown

**TC-B-POS-14 · Edit outlet — update name and radius**

1. Find outlet · Click Edit · Change Name · Change Radius Layanan · Click Simpan

Expected: Changes reflected in table immediately

**TC-B-POS-15 · Edit outlet — repin location on map**

1. Click Edit on outlet · Map loads with existing pin
2. Click new location on map · Click Simpan

Expected: Save succeeds · No `toFixed()` runtime error in console

**TC-B-POS-16 · Deactivate outlet**

1. Click Edit on outlet · Uncheck Aktif toggle · Click Simpan

Expected: Status badge in table changes to inactive

**TC-B-POS-17 · Create outlet without map pin**

1. Fill all required text fields · Do NOT pin on map · Click Simpan

Expected: Outlet saved successfully · No crash

**TC-B-POS-18 · Search outlets by name**

1. Type partial outlet name in search box

Expected: Table filters in real time

---

### 4. Work Shift Management

**TC-B-POS-19 · Create work shift with valid times**

1. Go to Work Shift page · Click Tambah Shift
2. Enter name `Shift Pagi` · Set start `08:00` end `16:00` · Click Simpan

Expected: Shift appears in list · No error

**TC-B-POS-20 · Edit existing shift — change end time**

1. Find shift · Click Edit · Change end time to `17:00` · Click Simpan

Expected: End time updated in list

**TC-B-POS-21 · Delete shift not assigned to any employee**

1. Find unassigned shift · Click Delete · Confirm

Expected: Shift removed from list

**TC-B-POS-22 · Create overnight shift**

1. Click Tambah Shift · Set start `22:00` end `06:00` · Click Simpan

Expected: Shift created · Appears in list without error

---

## Negative Tests

### 1. Authentication & Login

**TC-B-NEG-01 · Login with incorrect password**

1. Navigate to `/employee/login` · Enter valid email + wrong password · Click Masuk

Expected: Error 'Email atau password salah.' · Stays on login page

**TC-B-NEG-02 · Login with unregistered email**

1. Enter unregistered email + any password · Click Masuk

Expected: Error 'Akun tidak ditemukan.'

**TC-B-NEG-03 · Login with deactivated account**

1. Enter email of inactive employee + correct password · Click Masuk

Expected: Error 'Akun Anda tidak aktif.'

**TC-B-NEG-04 · Access admin dashboard without auth**

1. Clear cookies/localStorage · Navigate to `/dashboard/admin`

Expected: Redirected to `/employee/login`

---

### 2. User Management

**TC-B-NEG-05 · Create user with duplicate email**

1. Click Tambah User · Enter already-registered email · Click Buat & Kirim Undangan

Expected: Error 'Email sudah terdaftar.' · User NOT created

**TC-B-NEG-06 · Create user with invalid email format**

1. Enter `notanemail` in Email field · Click Buat & Kirim Undangan

Expected: Validation error shown · Submission blocked

**TC-B-NEG-07 · Admin cannot delete their own account**

1. Log in as Super Admin · Find own account in user list · Click delete

Expected: Error 'Tidak dapat menghapus akun sendiri.' · Account not deleted

**TC-B-NEG-08 · Invite link expires after 24 hours**

1. Create new user (invite sent) · Wait 24+ hours · Click invite link

Expected: Error 'Token tidak valid atau sudah kadaluarsa.'

**TC-B-NEG-09 · Create user with invalid phone format**

1. Click Tambah User · Enter phone: `abcdef` · Click Buat & Kirim Undangan

Expected: Validation error for phone format · User NOT created

---

### 3. Outlet Management

**TC-B-NEG-10 · Create outlet — missing required Name field**

1. Click + New Outlet · Leave Name empty · Click Simpan

Expected: Validation error shown · Outlet NOT created

**TC-B-NEG-11 · Create outlet — duplicate name**

1. Enter name identical to existing outlet · Fill other fields · Click Simpan

Expected: Error for duplicate name · Outlet NOT created

---

### 4. Work Shift Management

**TC-B-NEG-12 · Create shift with duplicate name**

1. Click Tambah Shift · Enter name identical to existing shift · Click Simpan

Expected: Error duplicate shift name · Shift NOT created

**TC-B-NEG-13 · Create shift with empty name**

1. Click Tambah Shift · Leave name blank · Click Simpan

Expected: Validation error: name is required · Shift NOT created

---

## Summary Checklist — Feature 2

| ID | Test Case | Type | Pass |
|---|---|---|---|
| TC-B-POS-01 | Super Admin login | POSITIVE | ☐ |
| TC-B-POS-02 | Outlet Admin login | POSITIVE | ☐ |
| TC-B-POS-03 | Worker login redirect | POSITIVE | ☐ |
| TC-B-POS-04 | Driver login redirect | POSITIVE | ☐ |
| TC-B-POS-05 | Already-logged-in redirect | POSITIVE | ☐ |
| TC-B-POS-06 | Create employee + invite email | POSITIVE | ☐ |
| TC-B-POS-07 | Activate account via invite | POSITIVE | ☐ |
| TC-B-POS-08 | Edit employee — change role | POSITIVE | ☐ |
| TC-B-POS-09 | Edit employee — reset password | POSITIVE | ☐ |
| TC-B-POS-10 | Soft-delete employee | POSITIVE | ☐ |
| TC-B-POS-11 | Filter users by role | POSITIVE | ☐ |
| TC-B-POS-12 | Search users by name | POSITIVE | ☐ |
| TC-B-POS-13 | Create outlet + map pin | POSITIVE | ☐ |
| TC-B-POS-14 | Edit outlet name + radius | POSITIVE | ☐ |
| TC-B-POS-15 | Repin outlet location | POSITIVE | ☐ |
| TC-B-POS-16 | Deactivate outlet | POSITIVE | ☐ |
| TC-B-POS-17 | Create outlet without map pin | POSITIVE | ☐ |
| TC-B-POS-18 | Search outlets by name | POSITIVE | ☐ |
| TC-B-POS-19 | Create work shift | POSITIVE | ☐ |
| TC-B-POS-20 | Edit shift end time | POSITIVE | ☐ |
| TC-B-POS-21 | Delete unassigned shift | POSITIVE | ☐ |
| TC-B-POS-22 | Create overnight shift | POSITIVE | ☐ |
| TC-B-NEG-01 | Login wrong password | NEGATIVE | ☐ |
| TC-B-NEG-02 | Login unregistered email | NEGATIVE | ☐ |
| TC-B-NEG-03 | Login deactivated account | NEGATIVE | ☐ |
| TC-B-NEG-04 | Access dashboard without auth | NEGATIVE | ☐ |
| TC-B-NEG-05 | Create user duplicate email | NEGATIVE | ☐ |
| TC-B-NEG-06 | Create user invalid email format | NEGATIVE | ☐ |
| TC-B-NEG-07 | Admin delete own account | NEGATIVE | ☐ |
| TC-B-NEG-08 | Invite link expired | NEGATIVE | ☐ |
| TC-B-NEG-09 | Create user invalid phone format | NEGATIVE | ☐ |
| TC-B-NEG-10 | Create outlet missing name | NEGATIVE | ☐ |
| TC-B-NEG-11 | Create outlet duplicate name | NEGATIVE | ☐ |
| TC-B-NEG-12 | Create shift duplicate name | NEGATIVE | ☐ |
| TC-B-NEG-13 | Create shift empty name | NEGATIVE | ☐ |

---

---

# Feature 3 — Driver & Worker Attendance
**Owner:** Orang C
**Scope:** Attendance (Check-in/Check-out) · Attendance Logs · Driver & Worker Dashboard + Absensi UI

> **Note — Socket.IO:** Real-time events verified implicitly through the UI (attendance status updates live on dashboard). No separate Socket.IO tooling required.

---

## Time Simulation Setup (MOCK_NOW)

Attendance is time-sensitive — check-in only opens 15 minutes before shift start. To test without waiting for real clock times, set `MOCK_NOW` in `apps/api/.env` before each relevant test:

```bash
# apps/api/.env
MOCK_NOW=2026-06-02T01:00:00Z   # = 08:00 WIB
```

Remove or comment out `MOCK_NOW` to return to real time.

**WIB → UTC conversion:** subtract 7 hours (`WIB - 7h = UTC`)

| Scenario | MOCK_NOW value | WIB equivalent |
|---|---|---|
| 15 min before shift (earliest check-in) | `2026-06-02T00:45:00Z` | 07:45 WIB |
| Exactly at shift start | `2026-06-02T01:00:00Z` | 08:00 WIB |
| 20 min after start — still on time (≤30 min) | `2026-06-02T01:20:00Z` | 08:20 WIB |
| 35 min after start — late (>30 min) | `2026-06-02T01:35:00Z` | 08:35 WIB |
| 5 min after shift end — check-out window | `2026-06-02T09:05:00Z` | 16:05 WIB |
| 30 min before shift — too early to check-in | `2026-06-02T00:30:00Z` | 07:30 WIB |

**Prerequisites:**
- At least one seeded employee per role: `driver`, `washing_worker`, `ironing_worker`, `packing_worker`
- Each employee has an assigned outlet
- Each employee has an `EmployeeShift` for today's day of week (`is_active = true`)
- Example shift: `Shift Pagi` — start `08:00`, end `16:00`

---

## Positive Tests

### 1. Check-in

**TC-C-POS-01 · Check-in on time (within 15 min before shift)**

Setup: Set `MOCK_NOW=2026-06-02T00:45:00Z` in `.env` · Restart server

1. Login as driver/worker at `/employee/login`
2. Navigate to dashboard · Click tombol Check-in

Expected:
- Success message/toast shown
- Status label changes to "On Time" atau "Tepat Waktu"
- Check-in button replaced by Check-out button or disabled

**TC-C-POS-02 · Check-in exactly at shift start**

Setup: `MOCK_NOW=2026-06-02T01:00:00Z`

1. Login · Navigate to dashboard · Click Check-in

Expected: Success · Status "On Time"

**TC-C-POS-03 · Check-in late (>30 min after shift start)**

Setup: `MOCK_NOW=2026-06-02T01:35:00Z`

1. Login · Navigate to dashboard · Click Check-in

Expected: Success · Status shows "Late" / "Terlambat"

**TC-C-POS-04 · Check-in works for all four roles**

Repeat TC-C-POS-01 for each role: `driver`, `washing_worker`, `ironing_worker`, `packing_worker`

Expected: All four roles can check-in successfully

---

### 2. Check-out

**TC-C-POS-05 · Check-out after shift ends**

Setup: `MOCK_NOW=2026-06-02T09:05:00Z` · Employee has already checked in (run TC-C-POS-01 first)

1. Navigate to dashboard · Click tombol Check-out

Expected:
- Success message/toast shown
- Check-out time displayed in UI
- Attendance record shows both check-in and check-out times

---

### 3. Attendance Status

**TC-C-POS-06 · Today's attendance status shown after check-in**

After completing TC-C-POS-01:

1. Refresh dashboard or navigate to Absensi section

Expected: Today's record visible — check-in time shown, status displayed, check-out time null/empty

**TC-C-POS-07 · Attendance log shows history**

After completing TC-C-POS-05:

1. Navigate to attendance history/log section on dashboard

Expected: At least one record visible with date, check-in time, check-out time, status

---

### 4. Current Shift Info

**TC-C-POS-08 · Current shift displayed on dashboard**

1. Login as worker · Navigate to dashboard

Expected: Shift name, start time, end time visible in Absensi UI (e.g. "Shift Pagi · 08:00 – 16:00")

---

### 5. Dashboard Load

**TC-C-POS-09 · Driver dashboard loads after login**

1. Login as driver employee at `/employee/login`

Expected: Redirected to `/dashboard/driver` · Dashboard renders without error · Absensi section visible

**TC-C-POS-10 · Worker dashboard loads after login**

1. Login as `washing_worker` at `/employee/login`

Expected: Redirected to `/dashboard/worker` · Dashboard renders without error · Absensi section visible

---

## Negative Tests

### 1. Check-in Failures

**TC-C-NEG-01 · Check-in too early (>15 min before shift)**

Setup: `MOCK_NOW=2026-06-02T00:30:00Z` (07:30 WIB — 30 min before shift)

1. Login as worker · Navigate to dashboard · Click Check-in

Expected: Error message shown "Check-in hanya dapat dilakukan maksimal 15 menit sebelum shift dimulai" · Status does not change

**TC-C-NEG-02 · Check-in twice in the same day**

Prerequisites: Employee already checked in today (TC-C-POS-01 done)

Setup: `MOCK_NOW=2026-06-02T01:00:00Z`

1. Navigate to dashboard · Click Check-in again

Expected: Error "Anda sudah melakukan check-in hari ini." · UI reflects already-checked-in state

**TC-C-NEG-03 · Check-in with no active shift today**

Prerequisites: Use an employee account that has no `EmployeeShift` for today's day of week

1. Login as that employee · Navigate to dashboard · Click Check-in

Expected: Error "Anda tidak memiliki shift yang aktif hari ini" · Check-in blocked

**TC-C-NEG-04 · Dashboard inaccessible without login**

1. Clear all cookies/localStorage (DevTools → Application → Clear site data)
2. Navigate to `/dashboard/driver` or `/dashboard/worker`

Expected: Redirected to `/employee/login` · No dashboard content shown

---

### 2. Check-out Failures

**TC-C-NEG-05 · Check-out without having checked in**

Prerequisites: Employee has NOT checked in today (fresh day or use a different account)

Setup: `MOCK_NOW=2026-06-02T09:05:00Z`

1. Login · Navigate to dashboard · Attempt check-out

Expected: Error shown · Check-out blocked · UI does not update to checked-out state

**TC-C-NEG-06 · Check-out twice**

Prerequisites: Employee already checked out today (TC-C-POS-05 done)

1. Navigate to dashboard · Attempt check-out again

Expected: Error "Anda sudah check-out hari ini" · UI reflects already-checked-out state

---

## Summary Checklist — Feature 3

| ID | Test Case | Type | Pass |
|---|---|---|---|
| TC-C-POS-01 | Check-in on time (15 min early) | POSITIVE | ☐ |
| TC-C-POS-02 | Check-in at shift start | POSITIVE | ☐ |
| TC-C-POS-03 | Check-in late (>30 min) | POSITIVE | ☐ |
| TC-C-POS-04 | Check-in all four roles | POSITIVE | ☐ |
| TC-C-POS-05 | Check-out after shift ends | POSITIVE | ☐ |
| TC-C-POS-06 | Today attendance status after check-in | POSITIVE | ☐ |
| TC-C-POS-07 | Attendance log shows history | POSITIVE | ☐ |
| TC-C-POS-08 | Current shift info on dashboard | POSITIVE | ☐ |
| TC-C-POS-09 | Driver dashboard loads | POSITIVE | ☐ |
| TC-C-POS-10 | Worker dashboard loads | POSITIVE | ☐ |
| TC-C-NEG-01 | Check-in too early | NEGATIVE | ☐ |
| TC-C-NEG-02 | Check-in twice same day | NEGATIVE | ☐ |
| TC-C-NEG-03 | Check-in no active shift | NEGATIVE | ☐ |
| TC-C-NEG-04 | Dashboard without login | NEGATIVE | ☐ |
| TC-C-NEG-05 | Check-out without check-in | NEGATIVE | ☐ |
| TC-C-NEG-06 | Check-out twice | NEGATIVE | ☐ |

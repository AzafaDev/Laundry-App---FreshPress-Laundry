## Sprint 1 – Foundation, Auth & Base Dashboards (Day 1-4)

| Owner | Deliverable | Libraries |
|-------|-------------|-----------|
| Shared | Monorepo setup, Neon DB, Prisma schema + migration, shared types, ENV config | @neondatabase/serverless, @prisma/adapter-neon, @prisma/client, prisma, pg, dotenv, zod |
| A | Landing page (navbar, hero carousel, footer) | next, tailwindcss, swiper, lucide-react |
| A | Register (email + Google OAuth), login, JWT, redirect middleware | express, jsonwebtoken, bcrypt, zod, @prisma/client, axios, @tanstack/react-query, passport, passport-google-oauth20 |
| A | Send verification + reset password emails, set password after verify (1h token) | nodemailer, jsonwebtoken, crypto, @prisma/client |
| B | Role-based middleware, user management CRUD + paginated table, security headers + rate limiting | express, jsonwebtoken, @prisma/client, zod, @tanstack/react-query, axios, helmet, express-rate-limit |
| B | Outlet CRUD, assign users to outlets, map view | react-leaflet, leaflet, opencage-api-client, @prisma/client, zod |
| C | Attendance clock-in/out API, history per user, outlet admin attendance report | express, @prisma/client, date-fns, zod |
| C | Socket.IO server inside Express, driver + worker dashboard base layout | socket.io, socket.io-client, express, next, tailwindcss |

## Sprint 2 – Profile, Address, Order Management & Driver Flow (Day 5-8)

| Owner | Deliverable | Libraries |
|-------|-------------|-----------|
| A | Edit profile, upload + validate photo (max 1MB), update email with re-verify | cloudinary, multer, nodemailer, zod, @tanstack/react-query |
| A | Address CRUD, geocode to coordinates, map picker UI | opencage-api-client, react-leaflet, leaflet, @prisma/client, zod, @tanstack/react-query |
| B | View + filter all orders, order tracking by status/worker/date | @prisma/client, date-fns, @tanstack/react-query, zustand, tailwindcss |
| B | Laundry item master data CRUD | @prisma/client, zod, @tanstack/react-query |
| C | Driver: request list, real-time notifications, update status, history | socket.io-client, @prisma/client, @tanstack/react-query, date-fns, axios |
| C | Worker: arrival notification, pending task list per station | socket.io-client, @tanstack/react-query, next, tailwindcss |

## Sprint 3 – Pickup, Create Order, Bypass & Worker Processing (Day 9-12)

| Owner | Deliverable | Libraries |
|-------|-------------|-----------|
| A | Pickup request: select address + schedule, find nearest outlet, assign to driver via socket | geolib, socket.io-client, @prisma/client, zod, @tanstack/react-query, react-leaflet |
| A | Order list with pagination + search, realtime status tracking UI | socket.io-client, @tanstack/react-query, date-fns, zustand |
| B | Create order from pickup request: input kg + item quantities, generate invoice | @prisma/client, zod, date-fns, @tanstack/react-query |
| B | Bypass flow: worker requests bypass → admin approves/rejects with PIN, log reason | bcrypt, @prisma/client, socket.io-client, zod |
| C | Worker: re-input item quantities, validate vs previous station, block if mismatch, request bypass | @prisma/client, zod, socket.io-client, @tanstack/react-query |
| C | Packing station: check payment status, auto-create delivery request when all stations done | @prisma/client, socket.io, date-fns |

## Sprint 4 – Payment, Reports, Polish & Deployment (Day 13-16)

| Owner | Deliverable | Libraries |
|-------|-------------|-----------|
| A | Midtrans Snap payment integration + webhook handler | midtrans-client, express, @prisma/client, crypto |
| A | Payment deadline cron + email notify, auto-confirm order after 2×24h | node-cron, nodemailer, @prisma/client, date-fns |
| A | Complaint submission (with photo), order confirmation UI, responsive polish | cloudinary, multer, @prisma/client, zod, tailwindcss |
| B | Sales report: income per day/month/year, filter by outlet + date, export PDF/CSV | recharts, papaparse, pdf-lib, @prisma/client, date-fns |
| B | Employee performance report: total jobs per worker/driver, export PDF/CSV, responsive polish | recharts, papaparse, pdf-lib, @prisma/client, date-fns, tailwindcss |
| C | Worker job history, driver pickup/delivery history, responsive polish | @tanstack/react-query, date-fns, tailwindcss |
| Shared | Input sanitization (XSS), final security audit, code cleanup (max 200 lines/file, max 15 lines/function) | xss, helmet, express-rate-limit, eslint, prettier |
| Shared | Backend deployment (Railway), frontend deployment (Vercel), logging setup | winston, railway, vercel |
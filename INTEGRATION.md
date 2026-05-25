# Catatan Integrasi Antar Fitur

- **Orang A (Customer) perlu data outlet** → Orang B harus menyediakan endpoint `GET /api/v1/outlets/nearby?lat=&lng=&maxDistance=`.
- **Orang C (Driver) perlu data customer dan alamat** → Orang A sudah menyediakan di `Order` (pickup address via `CustomerAddress`) dan `DriverTask`.
- **Orang A (Payment) perlu order yang sudah dibuat** → Orang B menyediakan endpoint `GET /api/v1/orders/:id` dan `PATCH /api/v1/orders/:id/payment-status`.
- **Orang C (Worker) perlu validasi mismatch** — membandingkan `ProcessLog.input_items` (station sebelumnya) dengan input worker saat ini. Jika mismatch, worker membuat `BypassRequest` dengan `expected_items` dan `actual_items`.
- **Semua notifikasi real-time** menggunakan Socket.IO (server socket events dikerjakan Orang C di Sprint 2, klien socket dikerjakan masing-masing role di frontend).

# Catatan Integrasi Antar Fitur

- **Orang A (Customer) perlu data outlet** → Orang B harus menyediakan endpoint `GET /api/v1/outlets/nearby?lat=&lng=&maxDistance=`.
- **Orang C (Driver) perlu data customer dan alamat** → Orang A sudah menyediakan di `PickupRequest` dan `UserAddress`.
- **Orang A (Payment) perlu order yang sudah dibuat** → Orang B menyediakan endpoint `GET /api/v1/orders/:id` dan `PATCH /api/v1/orders/:id/payment-status`.
- **Orang C (Worker) perlu validasi mismatch** — menggunakan data `OrderItem.expected_quantity` dan membandingkan dengan input worker.
- **Semua notifikasi real-time** menggunakan Socket.IO (Orang C yang mengimplementasikan klien, Orang B yang menyiapkan server socket events).

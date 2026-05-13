# Panduan Menjalankan Project (Local Development)

## Prasyarat

- Node.js 20+
- PostgreSQL (bisa menggunakan Neon gratis)
- Akun Midtrans sandbox, Cloudinary, OpenCage

## Langkah

```bash
# Clone repo
git clone <repo-url>
cd laundry-app

# Setup Backend
cd apps/api
cp .env.example .env   # isi DATABASE_URL, JWT_SECRET, dll
pnpm install
pnpx prisma migrate dev --name init
pnpx prisma db seed
pnpm dev  # running di http://localhost:8080

# Setup Frontend (terminal baru)
cd ../web
cp .env.example .env.local   # isi NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
pnpm install
pnpm dev  # running di http://localhost:3000
```

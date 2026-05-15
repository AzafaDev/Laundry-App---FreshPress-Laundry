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
cp .env.example .env   # hanya jika .env belum ada. Isi DATABASE_URL, JWT_SECRET, dll
npm install
npx prisma generate
npx prisma migrate dev
npm run dev  # running di http://localhost:8080

# Setup Frontend (terminal baru)
cd ../web
cp .env.example .env.local   # isi NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
npm install
npm run dev  # running di http://localhost:3000
```

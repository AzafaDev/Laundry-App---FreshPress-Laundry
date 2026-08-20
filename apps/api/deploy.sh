#!/usr/bin/env bash
set -euo pipefail

HOST=akmaldz@103.127.98.216
APP=/opt/laundry-api-v2
REL=$APP/releases/$(date +%Y%m%d%H%M%S)

echo "==> build lokal"
npm run build                    # prebuild menjalankan prisma generate

echo "==> migrasi ke Neon"
npx prisma migrate deploy        # Neon publik, jadi bisa dari lokal

echo "==> kirim artifact"
ssh "$HOST" "mkdir -p $REL"
rsync -az --delete dist/ "$HOST:$REL/dist/"
rsync -az package.json package-lock.json "$HOST:$REL/"

echo "==> install deps produksi"
# --ignore-scripts wajib: postinstall memanggil `prisma generate`,
# tapi prisma CLI itu devDependency dan tidak ikut --omit=dev.
# Aman karena generated/prisma sudah ter-compile ke dalam dist/.
ssh "$HOST" "cd $REL && npm ci --omit=dev --ignore-scripts"

echo "==> aktifkan release"
ssh "$HOST" "ln -sfn $APP/shared/.env $REL/.env && ln -sfn $REL $APP/current"
ssh "$HOST" "sudo systemctl restart laundry-api-v2"

echo "==> bersihkan release lama (sisakan 3)"
ssh "$HOST" "ls -dt $APP/releases/* | tail -n +4 | xargs -r rm -rf"

echo "==> status"
# Route semuanya di bawah /api/v1 dan tidak ada route "/", jadi 404 dari "/"
# tetap berarti server hidup. Yang diuji: ada respons HTTP, bukan status 2xx.
ssh "$HOST" "sleep 3; systemctl is-active laundry-api-v2 >/dev/null \
  && curl -s -o /dev/null -w 'HTTP %{http_code}\n' --max-time 5 localhost:8090/api/v1 \
  || echo 'GAGAL: journalctl -u laundry-api-v2 -n 50 --no-pager'"

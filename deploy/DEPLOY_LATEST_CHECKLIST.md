# Deploy Latest App – Checklist

Use this when deploying the current `unified-home-page` (or main) branch to production.

---

## Quick reference: All commands (for SSH, status, diagnostics, build, push, deploy)

Replace `YOUR_KEY.pem` with your key path (e.g. `~/Downloads/everything-umass-key.pem`) and `EC2_IP` with your VM IP (e.g. `100.50.19.17`).

### 1. SSH into the VM

```bash
ssh -i YOUR_KEY.pem ubuntu@EC2_IP
```

### 2. On the VM: check status and run diagnostics

```bash
# Container status
docker ps -a

# Compose project (from deploy dir)
cd ~/umass-marketplace/deploy
docker compose -f docker-compose.ecr.yml ps -a

# API health (from VM; omit | jq if jq not installed)
curl -s http://localhost:8080/health

# Frontend (from VM)
curl -s -o /dev/null -w "%{http_code}" http://localhost:5173

# API logs (last 200 lines)
docker logs umass-marketplace-api-prod --tail 200

# API logs follow (Ctrl+C to stop)
docker logs -f umass-marketplace-api-prod

# DB container logs
docker logs umass-marketplace-db-prod --tail 100

# Deploy log (written by deploy.sh)
tail -100 ~/umass-marketplace/deploy/deploy.log
```

### 3. Listings not showing in prod (Explore / Dashboard empty, but Saved Items still show)

- **Saved Items (Cart)** are stored in the browser’s **localStorage** (full listing snapshot). They can still appear even when the listings API is failing or the DB has no rows.
- **Explore and Dashboard** load from **GET /api/listings** and **GET /api/listings/seller/:id**. If those return an error or empty data, you’ll see “0 items” or “Failed to load listings” with the API error message in the UI.
- **Quick checks:**
  - From the VM: `curl -s -w "\n%{http_code}" http://localhost:8080/api/listings?page=0&size=10` (expect 200 and JSON with `content`, `totalElements`, etc.).
  - Browser: open DevTools → Network, reload Explore; inspect the `/api/listings` request for status and response body.
  - If the UI shows “Failed to load listings” it will now display the API error message to help debug.
- If the API returns 200 but `totalElements` is 0, the DB may be empty or filtered; use the DB diagnostics below to confirm.

### 4. On the VM: database diagnostics (DB dropping / not showing data)

Password comes from `deploy/.env` (`POSTGRES_PASSWORD`). Set it once: `export PGPASSWORD=$(grep POSTGRES_PASSWORD ~/umass-marketplace/deploy/.env | cut -d= -f2)` (then unset with `unset PGPASSWORD` when done).

```bash
# List tables
docker exec -it umass-marketplace-db-prod psql -U umarket -d umarket -c "\dt"

# Row counts for main tables
docker exec -it umass-marketplace-db-prod psql -U umarket -d umarket -c "
SELECT 'users' AS tbl, COUNT(*) FROM users
UNION ALL SELECT 'listings', COUNT(*) FROM listings
UNION ALL SELECT 'chats', COUNT(*) FROM chats
UNION ALL SELECT 'messages', COUNT(*) FROM messages;
"

# Flyway migrations (if Flyway is enabled in prod)
docker exec -it umass-marketplace-db-prod psql -U umarket -d umarket -c "SELECT version, description, installed_on, success FROM flyway_schema_history ORDER BY installed_rank;" 2>/dev/null || echo "Flyway table may not exist (Hibernate ddl-auto)."

# Recent listings
docker exec -it umass-marketplace-db-prod psql -U umarket -d umarket -c "SELECT id, title, status, created_at FROM listings ORDER BY created_at DESC LIMIT 10;"

# Listings table schema
docker exec -it umass-marketplace-db-prod psql -U umarket -d umarket -c "\d listings"
```

### 5. On your Mac: build images and push to ECR

```bash
cd /path/to/umass-marketplace

# Build API + Web for linux/amd64 and push to ECR (requires AWS CLI configured)
./deploy/build-and-push.sh
```

Then add the printed `ECR_URI_API` and `ECR_URI_WEB` to `deploy/.env` if not already there.

### 6. Copy deploy files to VM (if you changed .env or deploy.sh)

```bash
# From your Mac (repo root)
scp -i YOUR_KEY.pem deploy/.env ubuntu@EC2_IP:~/umass-marketplace/deploy/.env
scp -i YOUR_KEY.pem deploy/deploy.sh ubuntu@EC2_IP:~/umass-marketplace/deploy/deploy.sh
```

### 7. On the VM: pull and deploy (full down + pull + up)

```bash
cd ~/umass-marketplace
./deploy/deploy.sh
```

(`deploy.sh` loads `deploy/.env`, logs into ECR, runs `docker compose down`, `pull`, then `up -d`.)

### 8. After deploy: verify again

```bash
curl -s http://localhost:8080/health
docker ps -a
docker logs umass-marketplace-api-prod --tail 50
```

---

## 1. Pre-deploy: Code & config

- [ ] **Branch**: Deploy from `unified-home-page` (or merge into `aws-deployment`). Latest fixes include:
  - **Bulk create**: Use passed `principal` (not SecurityContext); upload images **after** save so S3 keys use real listing IDs.
  - Auth NPE fix in bulk create; S3 client only when `aws.s3.enabled=true`; optional S3 credentials when S3 disabled.
  - Platform stats: `GET /api/stats/**` is public (landing/layout).
- [ ] **Secrets**: Never commit `.env`, `*.pem`, or `*.key`. Ensure `deploy/.env` is in `.gitignore` and not tracked.
- [ ] **S3**:
  - If using S3: set `AWS_S3_ENABLED=true`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_S3_BUCKET_NAME`, `AWS_REGION` in `deploy/.env`. Prefer EC2 IAM role over long‑lived keys.
  - If not using S3: set `AWS_S3_ENABLED=false`. You do **not** need to set `AWS_ACCESS_KEY_ID` or `AWS_SECRET_ACCESS_KEY`; images will use base64 fallback.

## 2. Environment variables (`deploy/.env`)

Required for prod:

- `POSTGRES_PASSWORD` – strong password.
- `JWT_SECRET` – e.g. `openssl rand -base64 32`.
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` – OAuth for @umass.edu (or your domain).
- `FRONTEND_URL`, `VITE_API_BASE_URL` – production URL (e.g. `https://everything-umass.tech`).

Optional / S3:

- `AWS_S3_ENABLED` – `true` or `false` (defaults in app: `true` in prod compose).
- `AWS_S3_BUCKET_NAME`, `AWS_REGION` – only if S3 enabled.
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` – only if S3 enabled and not using IAM role.

For ECR-based deploy (recommended on EC2):

- `ECR_URI_API`, `ECR_URI_WEB` – set after running `./deploy/build-and-push.sh` (script prints these).

See `deploy/env.prod.example` for a full template.

## 3. Build and push (from Mac/laptop)

```bash
# From repo root
./deploy/build-and-push.sh
```

- Ensures `deploy/.env` exists and has `VITE_API_BASE_URL` (and optionally other vars).
- Builds API and web for `linux/amd64`, pushes to ECR.
- Add the printed `ECR_URI_API` and `ECR_URI_WEB` to `deploy/.env`.

## 4. Deploy on EC2

- Copy updated `deploy/.env` to EC2 if you changed it (e.g. `scp -i your-key.pem deploy/.env ubuntu@EC2_IP:~/umass-marketplace/deploy/.env`).
- On EC2:

```bash
cd ~/umass-marketplace
./deploy/deploy.sh
```

- Use **only** `deploy.sh` with ECR images on EC2. Do **not** run `docker compose -f deploy/docker-compose.prod.yml` on the server (that builds on the server and is slow).

## 5. Post-deploy checks

- [ ] `curl http://localhost:8080/health` (or via nginx) returns healthy.
- [ ] Frontend loads at your domain.
- [ ] Login (OAuth) works; nginx proxies `/oauth2/` and `/login/oauth2/` to the API.
- [ ] Create listing (single and bulk) works; if S3 disabled, images use base64 path without errors.
- [ ] Saved Items / cart and dashboard behave as expected (UI changes from this branch).

## 6. Nginx / SSL

- If OAuth or HTTPS is broken, ensure [deploy/nginx-host.conf](nginx-host.conf) proxies `location /oauth2/` and `location /login/oauth2/` to `http://127.0.0.1:8080`, and that the 443 server block (after Certbot) includes those and `location /ws/` if you use websockets.
- Certbot: `sudo certbot renew --dry-run` to test renewal.

## Summary of changes relevant to deploy

| Area | Change | Deploy impact |
|------|--------|----------------|
| Auth | Null-check on `getAuthentication()` in bulk create | No config change; avoids NPE when unauthenticated. |
| S3 | `S3Client` bean only when `aws.s3.enabled=true` | Set `AWS_S3_ENABLED=false` to run without S3 or AWS credentials. |
| S3 | ImageService accepts optional `S3Client` | No config change. |
| Prod YAML | S3 credentials have empty default | `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` optional when S3 disabled. |

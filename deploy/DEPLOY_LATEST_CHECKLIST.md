# Deploy Latest App – Checklist

Use this when deploying the current `unified-home-page` (or main) branch to production.

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

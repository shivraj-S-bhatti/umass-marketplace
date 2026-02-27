# Push and deployment plan

Use this for the next push and deploy (unified-home-page → aws-deployment → production).

---

## 1. Commit and push (on your Mac)

### 1.1 Commit local changes

You have uncommitted fixes:

- **ListingService.java** – use `principal` in `createListingsBulk`, upload bulk images after save (real listing IDs for S3).
- **ListingServiceTest.java** – mock principal in bulk test.

```bash
cd /Users/apple/Projects/umass-marketplace
git add api/src/main/java/edu/umass/marketplace/marketplace/service/ListingService.java \
        api/src/test/java/edu/umass/marketplace/service/ListingServiceTest.java
git commit -m "fix: use principal in createListingsBulk; S3 keys use actual listing IDs in bulk"
```

### 1.2 Push branch and update aws-deployment (if you deploy from aws-deployment)

Option A – deploy from **unified-home-page**:

```bash
git push origin unified-home-page
# Then use unified-home-page when building (see step 2). EC2 can pull this branch.
```

Option B – deploy from **aws-deployment** (merge first):

```bash
git push origin unified-home-page
git checkout aws-deployment
git pull origin aws-deployment
git merge unified-home-page -m "Merge unified-home-page: landing redesign, platform stats, auth/deploy fixes"
git push origin aws-deployment
git checkout unified-home-page   # optional, back to dev branch
```

Use one branch consistently for **build-and-push** and for **git pull** on EC2 so compose files and scripts match the images.

---

## 2. Nginx – no config changes needed

Current **deploy/nginx-host.conf** already has:

- `location /` → frontend (5173)
- `location /api/` → API (8080), including **GET /api/stats/platform**
- `location /ws/` → WebSocket (8080)
- `location /oauth2/` and `location /login/oauth2/` → API (8080)
- `location /health` → API (8080)

No updates required for this deploy.

**If you overwrite nginx config on the server** with the repo file, the repo file only has `listen 80`. Certbot adds `listen 443 ssl`. So either:

- **Do not** overwrite the live nginx config with the repo file; or
- After copying, run:  
  `sudo certbot --nginx -d everything-umass.tech`  
  and choose “Attempt to reinstall this existing certificate”, then **add the same `location` blocks** (e.g. `/api/`, `/ws/`, `/oauth2/`, `/login/oauth2/`, `/health`) inside the `server { listen 443 ssl; ... }` block.

---

## 3. Build and push images (on your Mac)

From repo root, on the branch you will deploy (e.g. `unified-home-page` or `aws-deployment`):

```bash
# Ensure deploy/.env has production URL so the web image gets correct API/WS URL
# VITE_API_BASE_URL=https://everything-umass.tech
# FRONTEND_URL=https://everything-umass.tech
./deploy/build-and-push.sh
```

- Builds API and web for `linux/amd64` and pushes to ECR.
- Add the printed **ECR_URI_API** and **ECR_URI_WEB** to **deploy/.env** if not already there (values usually only change if you recreated ECR repos).

---

## 4. Deploy on EC2

### 4.1 Copy updated deploy files (if you changed .env or compose)

If you changed **deploy/.env** (e.g. new ECR URIs or URLs):

```bash
scp -i YOUR_KEY.pem deploy/.env ubuntu@YOUR_EC2_IP:~/umass-marketplace/deploy/.env
```

### 4.2 On EC2: run deploy (images come from ECR, not git)

SSH in, then:

```bash
cd ~/umass-marketplace
./deploy/deploy.sh
```

**deploy.sh** pulls the latest API and web **images** from ECR (`:latest`) and restarts the containers. You do **not** need to `git fetch` or `git pull` for a normal app-only deploy—the new code is in the images you built and pushed from your Mac.

**Only run `git pull` on EC2** when you changed something under `deploy/` (e.g. `deploy.sh`, `docker-compose.ecr.yml`, or other deploy config in the repo). Then:

```bash
git pull origin aws-deployment
./deploy/deploy.sh
```

No need to copy **nginx-host.conf** to the server unless you intentionally want to change nginx (see section 2).

---

## 5. Post-deploy checks

- [ ] `https://everything-umass.tech` loads (landing with stats).
- [ ] `https://everything-umass.tech/health` or `curl` to API health returns OK.
- [ ] Login (Google OAuth) works; redirect back to site works.
- [ ] Create listing (single) works; image upload works (S3 or base64).
- [ ] Bulk create works; images use real listing IDs in S3 (no random UUID paths).
- [ ] Real-time chat (WebSocket) works if you use it.
- [ ] Dashboard, directory, marketplace navigation work.

---

## 6. Summary

| Step | Where | Action |
|------|--------|--------|
| 1 | Mac | Commit ListingService + test changes → push `unified-home-page`; optionally merge into `aws-deployment` and push. |
| 2 | - | Nginx: no change. Repo **nginx-host.conf** is already correct; avoid overwriting live 443 block. |
| 3 | Mac | Run `./deploy/build-and-push.sh` (with `VITE_API_BASE_URL` and `FRONTEND_URL` in deploy/.env). |
| 4 | EC2 | `./deploy/deploy.sh` (pulls images from ECR). `git pull` only if deploy scripts changed. |
| 5 | Browser | Smoke-test URL, health, login, create/bulk listing, WebSocket. |

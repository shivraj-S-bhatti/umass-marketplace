# Verify app on EC2 (before domain / Google login)

Use this to confirm the app runs on EC2 before setting up domain forwarding or Google OAuth.

## 0. Test locally first (recommended)

Run the same stack on your Mac to confirm the build and app work **before** waiting 45–60+ minutes on EC2. You get full visibility (terminal + `deploy/deploy.log`) in ~10–20 minutes.

1. From the project root, ensure `deploy/.env` exists and has at least: `POSTGRES_PASSWORD`, `JWT_SECRET`, and for local testing set `VITE_API_BASE_URL=http://localhost:8080` and `FRONTEND_URL=http://localhost`.
2. Run the deploy script (builds and starts everything with Docker):
   ```bash
   ./deploy/deploy.sh
   ```
3. In the browser open **http://localhost** (frontend) and **http://localhost:8080/health** (API). If both work, the stack is valid.
4. Check **deploy/deploy.log** for a written record of build/up/health and recent container logs.
5. When done testing locally: `docker-compose -f deploy/docker-compose.prod.yml down` (from repo root: `cd deploy` first if needed).

If the local run fails, fix it first; then deploy to EC2. If it succeeds locally but the site can’t be reached on EC2, the problem is EC2-specific (e.g. security group, UFW, or IP in `.env`).

---

## 1. Copy .env to EC2 (from your Mac)

```bash
scp -i /path/to/your-key.pem deploy/.env ubuntu@<EC2_PUBLIC_IP>:~/umass-marketplace/deploy/
```

(Use your key path and EC2 public IP.)

## 2. SSH in and deploy

```bash
ssh -i /path/to/your-key.pem ubuntu@<EC2_PUBLIC_IP>
cd ~/umass-marketplace
git fetch origin && git checkout aws-deployment
git pull origin aws-deployment
./deploy/deploy.sh
```

**Note:** First deploy builds both images on EC2 and can take **45–60+ minutes** on a t3.micro. For a **fast deploy** (build on Mac, pull on EC2), use the commands below.

### Fast deploy: ECR via CLI (recommended)

Run these **on your Mac** from the project root. Ensure `aws configure` is done and `deploy/.env` has `VITE_API_BASE_URL` and `FRONTEND_URL` set (e.g. `https://everything-umass.tech`).

1. **Create ECR repos (one-time, via CLI):**
   ```bash
   ./deploy/create-ecr-repos.sh
   ```
   Or manually:
   ```bash
   aws ecr create-repository --repository-name umass-marketplace-api --region us-east-1
   aws ecr create-repository --repository-name umass-marketplace-web --region us-east-1
   ```
   (Use your `AWS_REGION` if different from `us-east-1`.)

2. **Build images and push to ECR:**
   ```bash
   ./deploy/build-and-push.sh
   ```
   When it finishes, it prints two lines. Add them to `deploy/.env`:
   ```
   ECR_URI_API=<printed value>
   ECR_URI_WEB=<printed value>
   ```

3. **Copy .env to EC2** (step 1 in this doc), then **SSH and deploy** (step 2). On EC2, `./deploy/deploy.sh` will pull the images and start the stack (no build).

## 3. Verify

**On EC2 (in SSH):**

```bash
# API health
curl -s http://localhost:8080/health

# Frontend (web container on localhost:5173)
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:5173
```

**From your Mac (browser or curl):** After you run **section 4 (SSL setup)**, host nginx will listen on 80/443 and the site will be reachable at:

- Frontend: http://<EC2_PUBLIC_IP> and https://everything-umass.tech
- API health: http://<EC2_PUBLIC_IP>/health or https://everything-umass.tech/health

Until then, the app is only reachable from the EC2 host (containers bind to localhost).

You should see the app and a healthy API. Google login will not work until you add the domain in OAuth and point DNS to this IP.

---

## 4. SSL (HTTPS) with Certbot + host nginx

After the app is reachable over HTTP:

1. **DNS:** Ensure the domain (e.g. everything-umass.tech) A record points to this instance. Using an Elastic IP is recommended so the IP does not change on restart.
2. **On EC2:** Run the one-time SSL setup:
   ```bash
   cd ~/umass-marketplace && ./deploy/ssl-setup.sh
   ```
   (Or `./deploy/ssl-setup.sh your-email@example.com` for non-interactive.)
3. **App config:** Set `FRONTEND_URL` and `VITE_API_BASE_URL` to `https://everything-umass.tech` in `deploy/.env`. Rebuild and push the web image on your Mac (`./deploy/build-and-push.sh`), copy `.env` to EC2, then run `./deploy/deploy.sh` on EC2.
4. **Google OAuth:** Add `https://everything-umass.tech` as authorized origin and redirect URI in the Google Cloud Console.

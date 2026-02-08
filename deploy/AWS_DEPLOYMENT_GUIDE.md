# AWS Free Tier Deployment Guide

This guide walks you through deploying UMass Marketplace to AWS free tier using a single EC2 instance.

**Production URL:** [https://everything-umass.tech](https://everything-umass.tech) (landing at `/lander`).

## Prerequisites

- AWS account with free tier eligibility
- Domain name (optional)
- SSH key pair for EC2 access
- Basic knowledge of AWS console

## If You Don't Have Money for a Domain

You can ship without a domain by using the EC2 public DNS name (or public IP). This is the cheapest option.

- **What works without a domain**: HTTP access to your site, API access, SSH access.
- **What is limited without a domain**:
  - **HTTPS with Let's Encrypt**: generally requires a domain (Let's Encrypt typically does not issue certs for raw IPs).
  - **Google OAuth**: you must register exact redirect URLs; using a raw IP can be awkward and may be blocked/warned in some setups.

If you can spare a few dollars, a cheap domain can be worth it even for an alpha. You do not need Route 53; you can use your registrar's free DNS to point the domain to your EC2 address.

## Architecture

**Single EC2 Instance Setup:**
- EC2 t2.micro/t3.micro (750 hours/month free)
- PostgreSQL in Docker container
- Spring Boot API in Docker container
- Nginx serving React frontend
- S3 bucket for image storage (free tier includes 5GB storage, plus free-tier request quotas)

## Cost Reality Check (Read This First)

These are the common surprise costs to avoid:

- **Public IPv4 address charges**: AWS charges **$0.005/hour per public IPv4**. AWS Free Tier includes **750 hours/month of public IPv4 usage** for 12 months. If you go beyond free tier, one public IPv4 is roughly \(0.005 * 730 \approx $3.65/month\).
- **NAT Gateway**: avoid. It can be \(\sim$32/month\) baseline even with low traffic.
- **Application Load Balancer (ALB)**: avoid for alpha. Baseline can be \(\sim$18/month\) plus usage.
- **Route 53**: hosted zone is **$0.50/month** (plus per-query charges). Optional.
- **Data transfer out**: AWS offers a **100 GB/month free data transfer out to the internet** (aggregated). After that, you pay per GB.

## Step 1: AWS Account Setup & Cost Controls

### 1.1 Enable Billing Alerts

**CRITICAL:** Set up billing alerts to prevent unexpected charges.

1. Go to AWS Billing Dashboard
2. Navigate to "Billing Preferences"
3. Enable "Receive Billing Alerts"
4. Go to CloudWatch → Alarms → Billing
5. Create alarms:
   - **$0.01 threshold** - Immediate notification
   - **$1.00 threshold** - Warning
   - **$5.00 threshold** - Hard limit (consider auto-shutdown)

### 1.2 Set Up AWS Budget

1. Go to AWS Budgets
2. Create budget:
   - Budget type: Cost budget
   - Amount: $5/month
   - Alert at 50%, 80%, 100%
3. Enable email notifications

### 1.3 Create IAM User

Prefer **no long-term AWS keys on the server**.

**Recommended (safer): use an EC2 IAM Role**

1. Create an IAM policy that only allows what the app needs (least privilege), for example:
   - `s3:PutObject`, `s3:GetObject`, `s3:DeleteObject` on `arn:aws:s3:::YOUR_BUCKET/listings/*`
   - `s3:ListBucket` on `arn:aws:s3:::YOUR_BUCKET` with a prefix restriction to `listings/`
2. Create an IAM role for EC2 and attach that policy.
3. Attach the role to your EC2 instance.

**Optional (for provisioning): create a small “deploy/admin” user**

- If you do create a user, avoid attaching `AmazonEC2FullAccess` / `AmazonS3FullAccess` unless you accept the risk.
- Store access keys locally (not in `.env` on the server) and rotate them.

## Step 2: Create S3 Bucket

1. Go to S3 → Create bucket
2. Bucket name: `umass-marketplace-images` (must be globally unique)
3. Region: choose a region **closest to your users** (latency matters more than tiny price differences).
4. Block public access: **Keep enabled** (recommended)
5. Enable versioning: Optional (costs extra)
6. Create bucket

### Public vs Private S3 (Pick One)

Your backend uploads images to S3. The browser only needs to **read** images.

**Option A (fastest, acceptable for alpha): public read, no public write**

- Keep bucket private for writes (only your EC2 IAM role can upload/delete).
- Allow public read for a specific prefix only (e.g., `listings/`).
- This requires allowing a public read policy; if you keep “Block public access” fully enabled, AWS will prevent public bucket policies.

**Option B (safer): private bucket + signed/proxied reads**

- Keep the bucket fully private.
- Serve images through your API (proxy) or issue short-lived presigned GET URLs.
- This is more secure but requires backend work (recommended later).

### Configure CORS

1. Select bucket → Permissions → CORS
2. Add CORS configuration:
```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET"],
        "AllowedOrigins": ["https://everything-umass.tech"],
        "ExposeHeaders": []
    }
]
```

### Set Lifecycle Policy (Optional)

1. Management → Lifecycle rules → Create rule
2. Rule name: `delete-old-versions`
3. Apply to: All objects
4. Delete versions older than: 30 days
5. Save

## Step 3: Launch EC2 Instance

### 3.1 Launch Instance

1. Go to EC2 → Launch Instance
2. Name: `umass-marketplace`
3. AMI: **Ubuntu Server 22.04 LTS** (free tier eligible)
4. Instance type: **t2.micro** or **t3.micro** (free tier)
5. Key pair: Create new or use existing
6. Network settings:
   - Allow SSH from your IP
   - Allow HTTP (port 80)
   - Allow HTTPS (port 443)
7. Configure storage: 8GB gp3 (within 20GB free tier)
8. Launch instance

### 3.2 Allocate Elastic IP (Optional)

1. EC2 → Elastic IPs → Allocate
2. Associate with your instance
3. **Important cost note:** AWS charges **$0.005/hour per public IPv4**, including Elastic IPs. Free tier includes **750 hours/month** of public IPv4 usage for 12 months; after that, one public IPv4 is about **$3.65/month**.
4. **If you stop the instance** and keep an Elastic IP allocated, you may keep paying for the public IPv4 even while stopped. If you want strict cost control, skip Elastic IP at first and use the instance public DNS/IP (it can change when you stop/start).

### 3.3 Configure Security Group

1. EC2 → Security Groups
2. Edit inbound rules:
   - SSH (22): Your IP only
   - HTTP (80): 0.0.0.0/0
   - HTTPS (443): 0.0.0.0/0

## Step 4: Initial EC2 Setup

### 4.1 Connect to EC2

```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
```

### 4.2 Run Setup Script

```bash
# Clone repository
git clone <your-repo-url> ~/umass-marketplace
cd ~/umass-marketplace

# Run setup script
chmod +x deploy/ec2-setup.sh
./deploy/ec2-setup.sh
```

**Important:** Log out and back in for Docker group changes:
```bash
exit
ssh -i your-key.pem ubuntu@your-ec2-ip
```

### 4.3 Basic Hardening (Recommended)

These are simple steps that reduce the chance of random internet scanners causing trouble:

- **Disable password SSH**: key-only login prevents brute-force password attempts.
- **Restrict SSH to your IP**: only your home/dev IP can reach port 22.
- **Enable UFW firewall**: allow only 22/80/443.
- **Optional: fail2ban**: auto-blocks abusive IPs hammering SSH.

You already restrict access to UMass logins, but bots will still scan your public IP. This is normal; hardening reduces noise and risk.

## Step 5: Configure Environment Variables

### 5.1 Create .env File

```bash
cd ~/umass-marketplace/deploy
cp env.prod.example .env
nano .env
```

**Secrets hygiene**

- Ensure `deploy/.env` is never committed.
- On the server: `chmod 600 deploy/.env`

### 5.2 Fill in Values

```bash
# Database
POSTGRES_PASSWORD=$(openssl rand -base64 32)

# AWS S3
# Recommended: use an EC2 IAM Role and omit long-term keys entirely.
# If you must use keys for an alpha, scope them to only your bucket/prefix.
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET_NAME=umass-marketplace-images

# JWT Secret
JWT_SECRET=$(openssl rand -base64 32)

# OAuth2 (see "Where to get Google OAuth keys" below)
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret

# Frontend / API base URL (production: https://everything-umass.tech)
FRONTEND_URL=https://everything-umass.tech
VITE_API_BASE_URL=https://everything-umass.tech
```

### 5.2 Where to get Google OAuth keys

1. Open [Google Cloud Console](https://console.cloud.google.com/) → **APIs & Services** → **Credentials**.
2. Under **OAuth 2.0 Client IDs**, click your web client (e.g. **Web client 1**).
3. **Client ID**: Copy the long value (e.g. `…apps.googleusercontent.com`). Put it in `deploy/.env` as `GOOGLE_CLIENT_ID`.
4. **Client secret**: In the **Client secrets** section, use the copy icon or **Download JSON** to get the secret. Put it in `deploy/.env` as `GOOGLE_CLIENT_SECRET` (no quotes).
5. Ensure **Authorized JavaScript origins** includes `https://everything-umass.tech` and **Authorized redirect URIs** includes `https://everything-umass.tech/login/oauth2/code/google`. For local testing, also add `http://localhost:8080` to origins and `http://localhost:8080/login/oauth2/code/google` to redirect URIs.

### 5.3 Local API run (with OAuth)

The API needs `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in the environment. Maven does not load `api/.env` by default. Use the run script so env vars are set:

```bash
cd api
./run.sh
```

This sources `api/.env` and runs `mvn spring-boot:run`. Ensure `api/.env` has the same OAuth client ID/secret as `deploy/.env` (the Web client that has your redirect URIs).

## Step 6: Deploy Application

### 6.1 Run Deployment

On EC2 **always use the deploy script** so the server pulls pre-built images from ECR and does not build locally. Do **not** run `docker compose -f deploy/docker-compose.prod.yml` on EC2—that file builds on the server and is very slow.

```bash
cd ~/umass-marketplace
./deploy/deploy.sh
```

The script uses `deploy/docker-compose.ecr.yml` and requires `ECR_URI_API` and `ECR_URI_WEB` in `deploy/.env` (set after running `./deploy/build-and-push.sh` on your Mac).

#### Build images and push to ECR (from your Mac)

When you change code or need to update production:

1. Ensure `deploy/.env` has `VITE_API_BASE_URL=https://everything-umass.tech` (and other vars).
2. From project root: `./deploy/build-and-push.sh` (builds API + web for linux/amd64, pushes to ECR).
3. Copy updated `deploy/.env` to EC2 if you changed env (e.g. `scp -i your-key.pem deploy/.env ubuntu@YOUR_EC2_IP:~/umass-marketplace/deploy/.env`).
4. On EC2: `cd ~/umass-marketplace && ./deploy/deploy.sh` (pulls new images and restarts containers).

### 6.2 Verify Services

```bash
# Check containers
docker ps

# Check API health
curl http://localhost:8080/health

# Check frontend
curl http://localhost
```

## Step 7: SSL Certificate (Host nginx + Certbot)

The stack uses **host nginx** as the public entrypoint (ports 80/443); Docker web and api containers bind to localhost only. Certbot obtains and configures the Let's Encrypt certificate.

**Prerequisites:** Domain (e.g. everything-umass.tech) A record must point to this instance (Elastic IP recommended so the IP does not change on restart).

### 7.1 One-time SSL setup on EC2

After the stack is running and DNS points here:

```bash
cd ~/umass-marketplace
./deploy/ssl-setup.sh
```

You will be prompted for a contact email (for Let's Encrypt). For non-interactive use:

```bash
./deploy/ssl-setup.sh your-email@example.com
```

The script installs nginx, deploys [deploy/nginx-host.conf](deploy/nginx-host.conf) to the host, and runs `certbot --nginx -d everything-umass.tech`. Certbot adds the HTTPS server block and certificate paths automatically.

### 7.2 Login does nothing / page blanks (OAuth)

If clicking "Sign in with Google" leaves the page blank or returns 304, nginx may be sending OAuth paths to the frontend instead of the API. **Only** `/oauth2/` (OAuth start) and `/login/oauth2/` (OAuth callback) must be proxied to the API; the API returns a 302 redirect to Google for those. The path `/login` is **served by the SPA** (React login page), so do **not** add a broad `location /login` that proxies to the API. Ensure [deploy/nginx-host.conf](deploy/nginx-host.conf) includes `location /oauth2/` and `location /login/oauth2/` that `proxy_pass` to `http://127.0.0.1:8080`. Then on EC2:

```bash
sudo cp ~/umass-marketplace/deploy/nginx-host.conf /etc/nginx/sites-available/umass-marketplace
# If Certbot created a separate server { listen 443 ssl; } block, add the same /oauth2/ and /login/oauth2/ blocks into it
sudo nginx -t && sudo systemctl reload nginx
```

**If the site already had HTTPS (Certbot was run before):** the repo file only has `listen 80`. Copying it overwrites the live config and removes the `listen 443` block, so HTTPS will break. Either merge only the `location /oauth2/` and `location /login/oauth2/` blocks into the existing 443 server block, or after copying run `sudo certbot --nginx -d everything-umass.tech`, choose "Attempt to reinstall this existing certificate", then add those two location blocks to the new 443 block if needed.

### 7.3 "Not Secure" in the browser

If the site loads but the browser shows "Not Secure", you are on **HTTP** instead of **HTTPS**. Open **https://everything-umass.tech** (with `https://`) in the address bar. Certbot usually configures nginx to redirect HTTP to HTTPS; if not, add a `server { listen 80; return 301 https://$host$request_uri; }` block on the server.

### 7.4 After HTTPS works

1. Set in `deploy/.env`: `FRONTEND_URL=https://everything-umass.tech`, `VITE_API_BASE_URL=https://everything-umass.tech`.
2. On your Mac: rebuild and push the web image (`./deploy/build-and-push.sh`), then copy `.env` to EC2 and run `./deploy/deploy.sh` on EC2.
3. In Google OAuth, set authorized origins and redirect URIs to `https://everything-umass.tech`.

### 7.5 Auto-Renewal

Certbot configures a systemd timer for renewal. Test with:

```bash
sudo certbot renew --dry-run
```

## Step 8: Configure Domain (Optional)

### 8.1 Route 53 (Paid)

1. Create hosted zone
2. Add A record pointing to Elastic IP
3. Update nameservers at domain registrar

Route 53 costs **$0.50/month per hosted zone** (plus per-query charges). If you are on a strict budget, you can avoid Route 53 and use your registrar's free DNS.

### 8.2 Alternative: Use EC2 IP

- Update `FRONTEND_URL` and `VITE_API_BASE_URL` in `.env`
- Update Google OAuth callback URLs
- Redeploy

## Step 9: Monitoring & Maintenance

### 9.1 View Logs

If you deploy with `deploy.sh` (ECR), view logs with:

```bash
cd ~/umass-marketplace
docker compose -f deploy/docker-compose.ecr.yml logs -f
```

**CloudWatch Logs note (cost control):**

- If you later ship logs to CloudWatch, set **log group retention** (e.g., 7–14 days) so storage doesn’t grow forever.
- CloudWatch has a small free tier for logs; beyond that, ingestion/storage can add cost.

### 9.2 Check Resource Usage

```bash
# CPU and memory
htop

# Disk usage
df -h

# Docker stats
docker stats
```

### 9.3 Backup Database

```bash
# Manual backup
docker exec umass-marketplace-db-prod pg_dump -U umarket umarket > backup.sql

# Automated backup script (create cron job)
0 2 * * * docker exec umass-marketplace-db-prod pg_dump -U umarket umarket | gzip > /backups/backup-$(date +\%Y\%m\%d).sql.gz
```

## Step 10: Cost Optimization

### 10.1 Monitor Costs Daily

- Check AWS Cost Explorer
- Set up daily cost reports
- Review CloudWatch metrics

### 10.2 Resource Limits

- **EC2:** Only 1 instance, t2.micro/t3.micro
- **EBS:** Max 20GB total
- **S3:** Monitor storage (5GB free)
- **Data Transfer:** AWS provides **100 GB/month free data transfer out to the internet** (aggregated). After that, charges apply.

### 10.3 Avoid These Services (They Break a $50 Budget Fast)

- **NAT Gateway**: can be \(\sim$32/month\) baseline even with low traffic.
- **Load Balancers (ALB/NLB)**: \(\sim$18+/month\) baseline plus usage.
- **RDS**: convenient, but can exceed free tier if you’re not careful. For alpha, single-instance Postgres on EC2 is OK if you accept data-loss risk.

### 10.4 Auto-Shutdown Script (Optional)

Create Lambda function to stop EC2 if cost exceeds threshold (advanced).

## Troubleshooting

### Services Won't Start

```bash
# Check logs (use same compose file as deploy.sh: docker-compose.ecr.yml)
docker compose -f deploy/docker-compose.ecr.yml logs

# Restart services
docker compose -f deploy/docker-compose.ecr.yml restart
```

### Database Connection Issues

```bash
# Check database container
docker exec -it umass-marketplace-db-prod psql -U umarket -d umarket

# Verify environment variables
docker exec umass-marketplace-api-prod env | grep SPRING_DATASOURCE
```

### Image Upload Fails

1. Verify S3 bucket exists
2. Check AWS credentials in `.env`
3. Verify bucket CORS configuration
4. Check S3 bucket policy (public read)

### High Costs

1. Check EC2 instance type (must be t2.micro/t3.micro)
2. Verify only 1 instance running
3. Check EBS volume size (max 20GB)
4. Review S3 storage usage
5. Check data transfer costs

## FAQ: “Could I get doxed / DDoS’d?”

- Any public server will be scanned by bots. This is normal.
- That does not mean they can log in. Your UMass-only login helps.
- Still do the basics:
  - only expose ports 22/80/443
  - rate limit key endpoints (Nginx and/or app-level)
  - never allow public write access to S3

## Portability

All services are containerized, making migration easy:

1. **Export database:** `pg_dump` to SQL file
2. **Export S3 data:** `aws s3 sync` to local
3. **Deploy elsewhere:** Use same Docker Compose files
4. **Update environment variables:** Point to new resources

## Faster deploys (build on Mac, pull on EC2)

**First deploy on EC2** builds both images on the t3.micro and can take **45–60+ minutes**. To deploy without building on EC2:

1. **On your Mac:** Ensure `deploy/.env` has `VITE_API_BASE_URL` and `FRONTEND_URL` set for production (e.g. `https://everything-umass.tech` or your EC2 URL). AWS CLI must be configured (`aws configure`).
2. **Build and push to ECR:** From the project root run:
   ```bash
   ./deploy/build-and-push.sh
   ```
   The script builds the API and web images, creates ECR repositories if needed, and pushes them. It prints two lines like:
   ```
   ECR_URI_API=123456789012.dkr.ecr.us-east-1.amazonaws.com/umass-marketplace-api:latest
   ECR_URI_WEB=123456789012.dkr.ecr.us-east-1.amazonaws.com/umass-marketplace-web:latest
   ```
3. **Add to .env:** Paste those two lines into `deploy/.env` (or add them on EC2 after copying .env).
4. **EC2 IAM:** The EC2 instance must be able to pull from ECR. Attach a role with policy `AmazonEC2ContainerRegistryReadOnly`, or ensure AWS credentials on EC2 can call `ecr:GetDownloadUrlForLayer` and `ecr:BatchGetImage`.
5. **Deploy on EC2:** Copy the updated `.env` to EC2, then run `./deploy/deploy.sh`. The script detects `ECR_URI_API` and `ECR_URI_WEB`, logs in to ECR, pulls the images, and starts the stack. No build; deploy finishes in a few minutes.

## Next Steps

- Set up automated backups
- Configure CloudFront CDN (optional, free tier available)
- Set up monitoring dashboards
- Configure auto-scaling (when needed, will cost)

## Support

For issues:
1. Check logs: `docker-compose logs`
2. Verify environment variables
3. Check AWS service health
4. Review CloudWatch metrics

---

**Remember:** Always monitor costs and stay within free tier limits!

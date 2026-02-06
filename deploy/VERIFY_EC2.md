# Verify app on EC2 (before domain / Google login)

Use this to confirm the app runs on EC2 at `http://52.91.131.15` before setting up domain forwarding or Google OAuth.

## 1. Copy .env to EC2 (from your Mac)

```bash
scp -i ~/Downloads/everything-umass-key.pem deploy/.env ubuntu@52.91.131.15:~/umass-marketplace/deploy/
```

(Use your key path and EC2 IP if different.)

## 2. SSH in and deploy

```bash
ssh -i ~/Downloads/everything-umass-key.pem ubuntu@52.91.131.15
cd ~/umass-marketplace
git fetch origin && git checkout aws-deployment
git pull origin aws-deployment
./deploy/deploy.sh
```

Deploy may take several minutes (npm install, Docker builds).

## 3. Verify

**On EC2 (in SSH):**

```bash
# API health
curl -s http://localhost:8080/health

# Frontend (should return 200)
curl -s -o /dev/null -w "%{http_code}\n" http://localhost
```

**From your Mac (browser or curl):**

- Frontend: http://52.91.131.15
- API health: http://52.91.131.15/health (proxied via nginx)

You should see the app and a healthy API. Google login will not work until you add the domain in OAuth and point DNS to this IP.

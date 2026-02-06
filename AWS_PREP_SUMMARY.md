# AWS Deployment Preparation - Summary

## What's Been Done

I've prepared the codebase for AWS deployment on the `aws-deployment` branch. Here's what was added:

### ✅ Backend Changes

1. **Dependencies Added** (`api/pom.xml`):
   - AWS SDK for S3 (v2.20.26)
   - Thumbnailator for image compression (v0.4.20)

2. **New Services**:
   - `ImageService.java` - Handles image compression and S3 upload/download
   - `ListingRetentionService.java` - Auto-deletes listings older than 14 days (runs daily at 2 AM)
   - `AwsConfig.java` - Configures S3 client with credentials

3. **Updated Services**:
   - `ListingService.java` - Now uses `ImageService` for compression and S3 upload
     - Compresses images before storing
     - Uploads to S3 if enabled, falls back to base64 if disabled
     - Deletes images from S3 when listings are deleted

4. **Configuration** (`application-prod.yaml`):
   - AWS S3 settings (bucket, region, credentials)
   - Image compression settings (max dimensions, quality, size)
   - Listing retention days (default: 14)

### ✅ Infrastructure Files

1. **Docker Compose** (`deploy/docker-compose.prod.yml`):
   - Production-ready configuration
   - PostgreSQL, Spring Boot API, Nginx frontend
   - Resource limits to stay within free tier
   - Health checks and auto-restart

2. **Deployment Scripts**:
   - `ec2-setup.sh` - Initial EC2 instance setup (Docker, AWS CLI, Certbot)
   - `deploy.sh` - Builds and deploys all services
   - Both scripts are executable

3. **Configuration Templates**:
   - `env.prod.example` - Environment variables template
   - `AWS_DEPLOYMENT_GUIDE.md` - Complete deployment guide

### ✅ Frontend Changes

1. **Vite Config** (`web/vite.config.ts`):
   - Added support for `VITE_API_BASE_URL` environment variable
   - Frontend already uses this (no code changes needed)

## What You Need to Do Next

### 1. Review the Code

```bash
# Check what changed
git diff main

# Review new files
git status
```

### 2. Test Locally (Optional)

Before deploying to AWS, you can test the new features locally:

```bash
# Set S3 to disabled in application.yaml for local testing
# The code will fall back to base64 storage

# Run the application
make dev

# Test image upload - should see compression logs
# Test listing deletion - should see retention service logs
```

### 3. AWS Setup Checklist

Follow the `deploy/AWS_DEPLOYMENT_GUIDE.md` step by step:

- [ ] Set up AWS billing alerts ($0.01, $1, $5 thresholds)
- [ ] Create S3 bucket with CORS configuration
- [ ] Launch EC2 t2.micro instance
- [ ] Run `ec2-setup.sh` on EC2
- [ ] Configure `.env` file with your credentials
- [ ] Run `deploy.sh` to deploy
- [ ] Set up SSL certificate (optional)
- [ ] Configure domain (optional)

### 4. Environment Variables to Configure

You'll need to set these in `deploy/.env`:

**Required:**
- `POSTGRES_PASSWORD` - Strong database password
- `AWS_ACCESS_KEY_ID` - From IAM user
- `AWS_SECRET_ACCESS_KEY` - From IAM user
- `JWT_SECRET` - Generate with `openssl rand -base64 32`
- `GOOGLE_CLIENT_ID` - From Google Cloud Console
- `GOOGLE_CLIENT_SECRET` - From Google Cloud Console

**Optional (have defaults):**
- `AWS_S3_BUCKET_NAME` - Default: `umass-marketplace-images`
- `LISTING_RETENTION_DAYS` - Default: 14
- `IMAGE_MAX_SIZE_KB` - Default: 100
- `FRONTEND_URL` - Your domain or EC2 IP

### 5. Known Issues to Address

1. **ImageService S3 Key Generation**: Currently uses random UUID. Consider using listing ID for better organization.

2. **Database Backups**: Set up automated backups to S3 (not included yet).

3. **Monitoring**: Add CloudWatch metrics/alarms for application health.

4. **CORS Configuration**: Update `SecurityConfig.java` to allow your production domain.

## Testing the New Features

### Image Compression

1. Upload a listing with a large image
2. Check logs for compression messages
3. Verify image size is reduced
4. Check S3 bucket (if enabled) for uploaded image

### Listing Retention

1. Create a test listing
2. Manually set `createdAt` to 15 days ago in database
3. Wait for scheduled task (or trigger manually via admin endpoint)
4. Verify listing is deleted

## Cost Monitoring

**Critical:** Set up billing alerts before deploying!

- AWS Free Tier includes:
  - 750 hours/month EC2 t2.micro
  - 20GB EBS storage
  - 5GB S3 storage
  - 1GB data transfer out

**Stay within limits:**
- Only 1 EC2 instance
- Monitor S3 storage usage
- Watch data transfer costs

## Next Steps

1. **Review the code changes**
2. **Test locally** (optional but recommended)
3. **Follow AWS_DEPLOYMENT_GUIDE.md** for deployment
4. **Monitor costs** daily initially
5. **Set up backups** after deployment

## Questions?

- Check `deploy/AWS_DEPLOYMENT_GUIDE.md` for detailed instructions
- Review code comments in new service files
- Test locally first to understand the flow

---

**Ready to deploy?** Follow the guide in `deploy/AWS_DEPLOYMENT_GUIDE.md`!

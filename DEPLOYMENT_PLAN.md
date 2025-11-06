# UMass Marketplace - Free Tier Deployment Plan

## Current Status
- **No production hosting configured** - Currently only local Docker Compose setup
- **Stack**: Spring Boot API + React Frontend + PostgreSQL
- **Requirements**: Free tier that supports both application AND database

---

## 🎯 Recommended Solution: Railway (Best Free Tier Option)

**Why Railway?**
- ✅ **Free $5/month credit** (enough for small apps)
- ✅ **PostgreSQL included** (managed database)
- ✅ **Spring Boot support** (Docker-based)
- ✅ **React frontend** (static hosting)
- ✅ **Single platform** (everything in one place)
- ✅ **Easy setup** (connects to GitHub)
- ✅ **Auto-deployments** (CI/CD built-in)

**Free Tier Limits:**
- $5/month credit (shared resource pool)
- ~500 hours of runtime/month
- 1GB storage
- Enough for small-medium traffic

---

## 🔄 Alternative Solutions

### Option 2: Render (Most Generous Free Tier)

**Pros:**
- ✅ **Truly free** (no credit card initially)
- ✅ PostgreSQL included (free tier)
- ✅ Spring Boot support
- ✅ Static site hosting for React
- ✅ Auto-deployments

**Cons:**
- ❌ Services **spin down after 15 min inactivity** (free tier)
- ❌ Slower cold starts (15-30 seconds)
- ❌ Limited to 750 hours/month

**Free Tier:**
- PostgreSQL: 1GB storage, 90 connections
- Web Service: Shared CPU, 512MB RAM
- Static Sites: Unlimited

---

### Option 3: Fly.io (Developer-Friendly)

**Pros:**
- ✅ Free tier includes PostgreSQL
- ✅ Fast deployments
- ✅ Good Docker support
- ✅ Global edge network

**Cons:**
- ❌ More complex setup
- ❌ Limited free tier (3 shared-cpu VMs)

---

### Option 4: Split Approach (Vercel + External DB)

**Frontend:** Vercel (free, unlimited)
**Backend:** Railway/Render (free tier)
**Database:** Neon/Supabase (free PostgreSQL)

**Pros:**
- ✅ Vercel excellent for React
- ✅ Can use best service for each component

**Cons:**
- ❌ More complex setup (3 services)
- ❌ CORS configuration needed
- ❌ Database separate from backend

---

## 📋 Recommended Implementation: Railway

### Phase 1: Database Setup (Railway)

1. **Create Railway account** (free)
2. **Create PostgreSQL database:**
   ```bash
   # Via Railway dashboard:
   # New Project > PostgreSQL > Deploy
   ```
3. **Get connection string:**
   - Format: `postgresql://postgres:password@hostname:5432/railway`
   - Copy credentials for API configuration

### Phase 2: Backend Deployment (Railway)

1. **Connect GitHub repository**
2. **Create new service from Dockerfile:**
   ```bash
   # Railway will detect api/Dockerfile automatically
   ```
3. **Set environment variables:**
   ```
   SPRING_PROFILES_ACTIVE=prod
   PROD_DB_URL=${DATABASE_URL}  # Railway auto-provides this
   PROD_DB_USER=${PGUSER}
   PROD_DB_PASSWORD=${PGPASSWORD}
   PORT=8080
   ```

### Phase 3: Frontend Deployment (Railway Static)

1. **Build React app** (handled by Vite)
2. **Deploy static files** to Railway Static
3. **Set environment variables:**
   ```
   VITE_API_BASE_URL=https://your-api.railway.app
   ```

---

## 🔧 Required Configuration Changes

### 1. Update `application-prod.yaml`
Already configured to use environment variables ✅

### 2. Create Railway Configuration

**`railway.json`** (optional):
```json
{
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "api/Dockerfile"
  },
  "deploy": {
    "startCommand": "java -jar app.jar",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 100
  }
}
```

### 3. Database Migration Strategy

**Option A: Run migrations on startup** (current setup)
```yaml
# application.yaml already has Hibernate creating schema
spring.jpa.hibernate.ddl-auto=update
```

**Option B: Use Flyway** (recommended for production)
```yaml
spring.flyway.enabled=true
spring.flyway.locations=classpath:db/migration
```

### 4. Frontend Build Configuration

**`vite.config.ts`** should use production API URL:
```typescript
export default defineConfig({
  define: {
    'import.meta.env.VITE_API_BASE_URL': JSON.stringify(
      process.env.VITE_API_BASE_URL || 'http://localhost:8080'
    ),
  },
})
```

---

## 🚀 Deployment Steps (Railway)

### Backend Setup
```bash
# 1. Install Railway CLI (optional)
npm i -g @railway/cli

# 2. Login
railway login

# 3. Initialize project
cd api
railway init

# 4. Link to existing project (created via dashboard)
railway link

# 5. Add PostgreSQL service
railway add postgresql

# 6. Set environment variables
railway variables set SPRING_PROFILES_ACTIVE=prod
railway variables set PORT=8080

# 7. Deploy
railway up
```

### Frontend Setup
```bash
# 1. Build locally first (to test)
cd web
npm run build

# 2. Deploy static files via Railway dashboard
# OR use Railway CLI:
railway init
railway up --service web
```

---

## 🔐 Environment Variables Checklist

**Backend (Railway):**
- [ ] `SPRING_PROFILES_ACTIVE=prod`
- [ ] `PROD_DB_URL` (auto-set by Railway PostgreSQL)
- [ ] `PROD_DB_USER` (auto-set)
- [ ] `PROD_DB_PASSWORD` (auto-set)
- [ ] `PORT=8080`
- [ ] `JWT_SECRET` (generate new for production)
- [ ] `MAIL_HOST`, `MAIL_USERNAME`, `MAIL_PASSWORD` (if using email)

**Frontend (Railway Static):**
- [ ] `VITE_API_BASE_URL=https://your-api.railway.app`

---

## 📊 Cost Comparison (Free Tiers)

| Platform | Database | Backend | Frontend | Restrictions |
|----------|----------|---------|----------|--------------|
| **Railway** | ✅ Free ($5 credit) | ✅ Free | ✅ Free | Limited hours |
| **Render** | ✅ Free | ✅ Free | ✅ Free | 15min sleep timeout |
| **Fly.io** | ✅ Free | ✅ Free | ❌ | 3 shared VMs |
| **Vercel** | ❌ | ❌ | ✅ Free | Frontend only |

---

## ✅ Recommended Action Plan

### Step 1: Set Up Railway (This Week)
1. Create Railway account
2. Deploy PostgreSQL database
3. Test connection from local API

### Step 2: Deploy Backend (Next Week)
1. Connect GitHub repo to Railway
2. Deploy Spring Boot API
3. Configure environment variables
4. Test API endpoints

### Step 3: Deploy Frontend (Next Week)
1. Build React app
2. Deploy to Railway Static
3. Configure API URL
4. Test full stack

### Step 4: Domain & SSL (Optional)
1. Add custom domain (free on Railway)
2. SSL automatically configured
3. Update CORS settings if needed

---

## 🔍 Monitoring & Maintenance

**Free Tier Monitoring:**
- Railway: Check usage dashboard regularly
- Render: Monitor spin-down times
- Set up health checks
- Configure email alerts for downtime

**Database Backup:**
- Railway: Automatic daily backups (free tier)
- Consider manual exports for critical data

---

## 🆘 Troubleshooting

### Common Issues:

1. **Database Connection Failed**
   - Check `DATABASE_URL` format
   - Verify PostgreSQL service is running
   - Check firewall/network settings

2. **Build Failures**
   - Verify Dockerfile syntax
   - Check Maven build locally first
   - Review Railway build logs

3. **CORS Errors**
   - Update `SecurityConfig.java` to allow frontend domain
   - Check `VITE_API_BASE_URL` is correct

---

## 📝 Next Steps

1. **Immediate**: Review this plan with team
2. **Short-term**: Set up Railway account and PostgreSQL
3. **Medium-term**: Deploy backend and frontend
4. **Long-term**: Monitor usage and plan for scaling

---

## 🔗 Useful Links

- [Railway Documentation](https://docs.railway.app/)
- [Render Documentation](https://render.com/docs)
- [Spring Boot Production Guide](https://spring.io/guides/gs/spring-boot-for-azure/)
- [React Deployment Guide](https://react.dev/learn/deploying)

---

**Recommendation**: Start with **Railway** for simplicity and full-stack support. If free tier becomes limiting, migrate to Render which has better free tier longevity.


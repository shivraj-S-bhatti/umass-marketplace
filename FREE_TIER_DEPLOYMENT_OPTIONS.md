# Free Tier Deployment Options for UMass Marketplace

## Quick Answer: Yes, Free Tier is Possible! 🎉

Your stack (Spring Boot + React + PostgreSQL) can be deployed on free tiers, but **Supabase, Vercel, and Firebase have limitations** for your specific architecture.

---

## ❌ Why Supabase/Vercel/Firebase Won't Work (As-Is)

### **Supabase** 
- ✅ **PostgreSQL**: Excellent free tier (500MB, unlimited API requests)
- ❌ **Backend**: Only supports serverless functions (Node.js/Python), **NOT Spring Boot**
- ❌ **Frontend**: Can host static sites, but not ideal for React SPA

**Verdict**: Can use Supabase for database, but you'd need to rewrite your Spring Boot API as serverless functions.

### **Vercel**
- ✅ **Frontend**: Perfect for React (unlimited free deployments)
- ❌ **Backend**: Only supports serverless functions (Node.js/Python/Go), **NOT Spring Boot**
- ❌ **Database**: No database hosting

**Verdict**: Great for frontend, but you'd need to host backend elsewhere and rewrite API as serverless.

### **Firebase**
- ✅ **Frontend**: Can host static sites
- ❌ **Database**: Firestore (NoSQL), **NOT PostgreSQL** - would require complete rewrite
- ❌ **Backend**: Only Cloud Functions (Node.js/Python), **NOT Spring Boot**

**Verdict**: Would require significant architecture changes.

---

## ✅ **Recommended Free Tier Solutions**

### **Option 1: Railway (Best for Full-Stack) ⭐ RECOMMENDED**

**Free Tier:**
- $5/month credit (enough for small apps)
- PostgreSQL included (managed database)
- Spring Boot support (Docker-based)
- React frontend (static hosting)
- Auto-deployments from GitHub

**Limits:**
- ~500 hours runtime/month
- 1GB storage
- Enough for small-medium traffic

**Setup:**
- Single platform for everything
- Easy Docker deployment
- Automatic SSL certificates

**Cost:** Free (within $5 credit limit)

---

### **Option 2: Render (Most Generous Free Tier)**

**Free Tier:**
- PostgreSQL: 1GB storage, 90 connections
- Web Service: Shared CPU, 512MB RAM
- Static Sites: Unlimited
- Auto-deployments

**Limits:**
- ⚠️ Services **spin down after 15 min inactivity** (free tier)
- Slower cold starts (15-30 seconds)
- 750 hours/month limit

**Cost:** Free (no credit card initially)

**Best For:** Projects that can tolerate cold starts

---

### **Option 3: Split Approach (Hybrid)**

**Frontend:** Vercel (free, unlimited)
**Backend:** Railway/Render (free tier)
**Database:** Supabase/Neon (free PostgreSQL)

**Pros:**
- ✅ Vercel excellent for React
- ✅ Can use best service for each component
- ✅ Supabase has great PostgreSQL free tier

**Cons:**
- ❌ More complex setup (3 services)
- ❌ CORS configuration needed
- ❌ Database separate from backend

**Cost:** Free

---

### **Option 4: Fly.io (Developer-Friendly)**

**Free Tier:**
- PostgreSQL included
- Fast deployments
- Good Docker support
- Global edge network

**Limits:**
- 3 shared-cpu VMs
- More complex setup

**Cost:** Free (limited resources)

---

## 📊 Comparison Table

| Platform | Database | Backend | Frontend | Restrictions |
|----------|----------|---------|----------|--------------|
| **Railway** | ✅ Free ($5 credit) | ✅ Free | ✅ Free | Limited hours |
| **Render** | ✅ Free | ✅ Free | ✅ Free | 15min sleep timeout |
| **Fly.io** | ✅ Free | ✅ Free | ❌ | 3 shared VMs |
| **Vercel** | ❌ | ❌ | ✅ Free | Frontend only |
| **Supabase** | ✅ Free | ❌ | ⚠️ Limited | Backend functions only |
| **Firebase** | ❌ (NoSQL only) | ❌ | ⚠️ Limited | No PostgreSQL |

---

## 🎯 **Recommended Approach: Railway**

### Why Railway?
1. **Single Platform**: Everything in one place
2. **Spring Boot Support**: Native Docker support
3. **PostgreSQL Included**: Managed database
4. **Easy Setup**: Connect GitHub, auto-deploy
5. **No Cold Starts**: Services stay running

### Setup Steps:

#### 1. Database Setup
```bash
# Via Railway dashboard:
# New Project > PostgreSQL > Deploy
# Get connection string automatically
```

#### 2. Backend Deployment
```bash
# Connect GitHub repo
# Railway detects api/Dockerfile automatically
# Set environment variables:
# - SPRING_PROFILES_ACTIVE=prod
# - PROD_DB_URL=${DATABASE_URL}  # Auto-provided
# - PROD_DB_USER=${PGUSER}      # Auto-provided
# - PROD_DB_PASSWORD=${PGPASSWORD} # Auto-provided
# - PORT=8080
```

#### 3. Frontend Deployment
```bash
# Build React app
cd web
npm run build

# Deploy static files to Railway Static
# Set environment variable:
# - VITE_API_BASE_URL=https://your-api.railway.app
```

---

## 🔄 Alternative: Hybrid Approach (Vercel + Supabase + Railway)

If you want to use Vercel for frontend:

### Architecture:
```
Frontend (Vercel) → Backend (Railway) → Database (Supabase PostgreSQL)
```

### Benefits:
- ✅ Vercel's excellent React hosting
- ✅ Supabase's generous PostgreSQL free tier (500MB)
- ✅ Railway for Spring Boot backend

### Setup:
1. **Frontend on Vercel:**
   - Connect GitHub repo
   - Build command: `cd web && npm run build`
   - Output directory: `web/dist`
   - Environment: `VITE_API_BASE_URL=https://your-api.railway.app`

2. **Database on Supabase:**
   - Create project
   - Get connection string
   - Run migrations via Supabase SQL editor

3. **Backend on Railway:**
   - Deploy Spring Boot API
   - Use Supabase connection string
   - Configure CORS for Vercel domain

---

## 💰 Cost Breakdown (All Free Tier)

### Railway Only:
- Database: Included in $5 credit
- Backend: Included in $5 credit
- Frontend: Included in $5 credit
- **Total: $0/month** (within credit limit)

### Hybrid (Vercel + Supabase + Railway):
- Vercel Frontend: Free (unlimited)
- Supabase Database: Free (500MB)
- Railway Backend: Free ($5 credit)
- **Total: $0/month**

---

## 🚀 Quick Start: Railway (Recommended)

1. **Sign up**: [railway.app](https://railway.app) (free)
2. **Create project**: New Project
3. **Add PostgreSQL**: New → Database → PostgreSQL
4. **Deploy backend**: New → GitHub Repo → Select `api/` directory
5. **Deploy frontend**: New → Static Site → Upload `web/dist` after build

**Time to deploy: ~15 minutes**

---

## 📝 Next Steps

1. **Choose your approach:**
   - ✅ **Railway** (simplest, recommended)
   - ⚠️ **Hybrid** (Vercel + Supabase + Railway) if you want best-of-breed

2. **Set up environment variables** (see `DEPLOYMENT_PLAN.md`)

3. **Test locally first** with Docker Compose

4. **Deploy to production** using chosen platform

---

## 🔗 Useful Links

- [Railway Documentation](https://docs.railway.app/)
- [Render Documentation](https://render.com/docs)
- [Supabase PostgreSQL](https://supabase.com/docs/guides/database)
- [Vercel Deployment](https://vercel.com/docs)
- [Neon PostgreSQL](https://neon.tech/) (alternative to Supabase)

---

## ⚠️ Important Notes

1. **Spring Boot requires JVM**: Only platforms with Docker/container support work
2. **PostgreSQL is required**: Your app uses JPA/Hibernate with PostgreSQL-specific features
3. **Free tiers have limits**: Monitor usage and plan for scaling
4. **CORS configuration**: If using split deployment, configure CORS in `SecurityConfig.java`

---

**Recommendation**: Start with **Railway** for simplicity. If you hit limits, consider the hybrid approach (Vercel + Supabase + Railway).

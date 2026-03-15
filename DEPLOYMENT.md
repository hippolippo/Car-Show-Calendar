# 🚀 CarCalendar Deployment Guide

This guide walks you through deploying CarCalendar using **free services** with simple, step-by-step instructions. The setup can handle **5,000+ events** without issues.

---

## 📋 Deployment Overview

**Free Tier Services Used:**
- **Frontend**: Vercel (free tier)
- **Backend**: Railway.app (free trial, then $5/month)
- **Database**: Railway PostgreSQL with PostGIS (included with backend)
- **Image Storage**: Cloudflare R2 (10GB free)

**Estimated Monthly Cost After Free Trials:**
- Railway: $5/month (covers backend + database)
- Cloudflare R2: Free (under 10GB)
- Vercel: Free
- **Total: ~$5/month**

---

## 🎯 Quick Deployment Checklist

- [ ] Deploy PostgreSQL database on Railway
- [ ] Deploy backend API on Railway
- [ ] Set up Cloudflare R2 for images
- [ ] Deploy frontend on Vercel
- [ ] Run database migrations
- [ ] Test the deployment

**Time Required:** 30-45 minutes

---

## Step 1: Deploy Database (Railway)

### 1.1 Create Railway Account

1. Go to https://railway.app
2. Click "Sign in with GitHub"
3. Authorize Railway to access your GitHub account

### 1.2 Create PostgreSQL Database

1. Click "New Project"
2. Select "Provision PostgreSQL"
3. Railway will create a PostgreSQL database
4. Click on the PostgreSQL service
5. Go to "Variables" tab
6. **Copy these values** (you'll need them later):
   - `DATABASE_URL` (full connection string)
   - Or individual values: `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`

### 1.3 Enable PostGIS Extension

1. In Railway, click on your PostgreSQL service
2. Click "Connect" tab and copy the "Connect via psql" command
3. Open your terminal and run that command to connect
4. Once connected, run:
   ```sql
   CREATE EXTENSION IF NOT EXISTS postgis;
   \q
   ```

**✅ Database Ready!**

---

## Step 2: Deploy Backend API (Railway)

### 2.1 Prepare Backend for Deployment

1. In your local terminal, navigate to the project:
   ```bash
   cd /Users/hippolippo/Development/OpenCode/CarCalendar
   ```

2. Create a `Procfile` in the `backend/` directory:
   ```bash
   echo "web: node src/index.js" > backend/Procfile
   ```

3. Commit this change:
   ```bash
   git add backend/Procfile
   git commit -m "Add Procfile for Railway deployment"
   git push origin main
   ```

### 2.2 Deploy Backend to Railway

1. In Railway dashboard, click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your repository: `hippolippo/Car-Show-Calendar`
4. Railway will detect it's a Node.js app
5. Click on the deployed service
6. Go to "Settings" → "General"
7. Set **Root Directory** to: `backend`
8. Click "Update"

### 2.3 Configure Environment Variables

1. In Railway, click on your backend service
2. Go to "Variables" tab
3. Click "New Variable" and add each of these:

```bash
NODE_ENV=production
PORT=3000

# Database (use the DATABASE_URL from Step 1.2)
DATABASE_URL=postgresql://postgres:password@host:5432/railway

# JWT Configuration
JWT_SECRET=your-super-secret-random-string-change-this-to-something-long-and-random
JWT_EXPIRES_IN=7d
JWT_COOKIE_MAX_AGE=604800000

# CORS (you'll update this after deploying frontend)
CORS_ORIGIN=https://your-frontend-url.vercel.app

# Storage (we'll configure R2 in Step 3)
STORAGE_TYPE=local
PUBLIC_URL_BASE=https://your-backend-url.railway.app

# Upload Settings
MAX_FILE_SIZE=5242880
```

4. **Important**: Generate a secure JWT_SECRET:
   ```bash
   # Run this in your terminal to generate a random secret:
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```
   Copy the output and use it as your JWT_SECRET value.

5. Click "Deploy" to restart with new variables

### 2.4 Get Backend URL

1. In Railway, click on your backend service
2. Go to "Settings" → "Networking"
3. Click "Generate Domain"
4. Railway will give you a URL like: `https://your-app-name.up.railway.app`
5. **Copy this URL** - you'll need it for the frontend

### 2.5 Run Database Migrations

1. In Railway, click on your backend service
2. Click "Deployments" tab
3. Click the three dots (•••) on the latest deployment
4. Select "View Logs"
5. Wait for the app to start
6. In your local terminal, connect to the Railway database:
   ```bash
   # Use the connection string from Step 1.2
   psql "postgresql://postgres:password@host:5432/railway"
   ```
7. Run the migrations manually:
   ```sql
   -- Copy and paste the contents of each migration file:
   -- backend/migrations/001_initial_schema.sql
   -- backend/migrations/002_triggers.sql
   -- backend/migrations/003_organizer_reputation.sql
   ```

**Alternative: SSH into Railway and run migrations**
```bash
# From your local terminal in the backend directory:
railway run node scripts/migrate.js
```

**✅ Backend Deployed!** Test it: `https://your-backend-url.railway.app/health`

---

## Step 3: Set Up Image Storage (Cloudflare R2)

### 3.1 Create Cloudflare Account

1. Go to https://cloudflare.com
2. Sign up for a free account
3. Verify your email

### 3.2 Create R2 Bucket

1. Log in to Cloudflare dashboard
2. Click "R2" in the left sidebar
3. Click "Create bucket"
4. Name it: `car-calendar-images`
5. Click "Create bucket"

### 3.3 Get R2 Credentials

1. In R2 dashboard, click "Manage R2 API Tokens"
2. Click "Create API Token"
3. Set permissions:
   - **Token name**: `car-calendar-backend`
   - **Permissions**: Object Read & Write
   - **Specify bucket**: `car-calendar-images`
4. Click "Create API Token"
5. **Copy and save**:
   - Access Key ID
   - Secret Access Key
   - Endpoint URL (looks like: `https://abcd1234.r2.cloudflarestorage.com`)

### 3.4 Enable Public Access

1. Go to your R2 bucket: `car-calendar-images`
2. Click "Settings"
3. Under "Public Access", click "Allow Access"
4. Click "Connect Domain" (optional - or use R2.dev subdomain)
5. Cloudflare will give you a public URL like: `https://pub-xxxxx.r2.dev`
6. **Copy this URL** - this is your public image URL

### 3.5 Update Backend Environment Variables

1. Go back to Railway
2. Click on your backend service
3. Go to "Variables" tab
4. Update/add these variables:

```bash
# Storage Configuration
STORAGE_TYPE=r2

# R2 Configuration
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-access-key-id-from-step-3.3
R2_SECRET_ACCESS_KEY=your-secret-access-key-from-step-3.3
R2_BUCKET_NAME=car-calendar-images
R2_ENDPOINT=https://abcd1234.r2.cloudflarestorage.com
R2_PUBLIC_URL=https://pub-xxxxx.r2.dev

# Update this too:
PUBLIC_URL_BASE=https://your-backend-url.railway.app
```

5. Click "Deploy" to restart

### 3.6 Install R2 SDK in Backend

Since we need the AWS SDK for R2, add it to your backend:

1. In your local terminal:
   ```bash
   cd backend
   npm install @aws-sdk/client-s3
   ```

2. Commit and push:
   ```bash
   git add package.json package-lock.json
   git commit -m "Add AWS SDK for R2 storage"
   git push origin main
   ```

3. Railway will automatically redeploy

**✅ Image Storage Ready!**

---

## Step 4: Deploy Frontend (Vercel)

### 4.1 Create Vercel Account

1. Go to https://vercel.com
2. Click "Sign Up"
3. Choose "Continue with GitHub"
4. Authorize Vercel

### 4.2 Import Project

1. Click "Add New..." → "Project"
2. Import your repository: `hippolippo/Car-Show-Calendar`
3. Vercel will detect it's a Vite app

### 4.3 Configure Build Settings

1. **Framework Preset**: Vite
2. **Root Directory**: `frontend`
3. **Build Command**: `npm run build`
4. **Output Directory**: `dist`
5. **Install Command**: `npm install`

### 4.4 Set Environment Variables

1. Click "Environment Variables"
2. Add this variable:

```bash
VITE_API_URL=https://your-backend-url.railway.app/api/v1
```

Replace `your-backend-url.railway.app` with your actual Railway backend URL from Step 2.4

3. Click "Deploy"

### 4.5 Get Frontend URL

1. Vercel will deploy your app
2. You'll get a URL like: `https://car-show-calendar.vercel.app`
3. **Copy this URL**

### 4.6 Update Backend CORS

1. Go back to Railway
2. Click on your backend service
3. Go to "Variables"
4. Update `CORS_ORIGIN`:
   ```bash
   CORS_ORIGIN=https://your-frontend-url.vercel.app
   ```
5. Click "Deploy" to restart

**✅ Frontend Deployed!**

---

## Step 5: Finalize & Test

### 5.1 Verify Deployment

**Test Backend:**
```bash
# Health check
curl https://your-backend-url.railway.app/health

# Should return: {"status":"ok","timestamp":"..."}
```

**Test Frontend:**
1. Open: `https://your-frontend-url.vercel.app`
2. You should see the CarCalendar homepage
3. Try registering a new account
4. Try creating an event with an image

### 5.2 Test Full Flow

1. **Register**: Create a new user account
2. **Create Event**: 
   - Fill in event details
   - Upload an image
   - Use "Find Coordinates" for location
   - Submit
3. **View Event**: Check that the event appears
4. **RSVP**: Try attending the event
5. **Image Load**: Verify the event image loads from R2

### 5.3 Monitor Performance

**For 5,000+ Events:**
- Railway's PostgreSQL free tier: Up to 512MB storage (should handle 5K+ events easily)
- Each event ~1KB = 5,000 events ≈ 5MB data
- Images in R2: 10GB free = ~2,000 images at 5MB each

**If you hit limits:**
- Railway: Upgrade to $5/month plan (8GB database)
- R2: $0.015/GB over 10GB (very cheap)

---

## 🔧 Troubleshooting

### Issue: "Cannot connect to database"

**Solution:**
1. Check Railway database is running
2. Verify `DATABASE_URL` in backend environment variables
3. Ensure PostGIS extension is installed

### Issue: "CORS Error" in browser console

**Solution:**
1. Check `CORS_ORIGIN` in Railway backend variables
2. Make sure it matches your Vercel URL exactly (no trailing slash)
3. Redeploy backend after updating

### Issue: Images not uploading

**Solution:**
1. Verify R2 credentials in Railway variables
2. Check `STORAGE_TYPE=r2` is set
3. Ensure `@aws-sdk/client-s3` is installed
4. Check backend logs in Railway for errors

### Issue: Frontend shows blank page

**Solution:**
1. Open browser console (F12)
2. Check for API connection errors
3. Verify `VITE_API_URL` in Vercel is correct
4. Make sure it includes `/api/v1` at the end

### Issue: "Not Found" errors

**Solution:**
1. Check that migrations were run successfully
2. Verify database connection
3. Check Railway backend logs for errors

---

## 🎛️ Optional: Custom Domain

### For Frontend (Vercel)

1. In Vercel project, go to "Settings" → "Domains"
2. Add your custom domain: `carcalendar.com`
3. Follow Vercel's DNS instructions
4. Update backend `CORS_ORIGIN` to match new domain

### For Backend (Railway)

1. In Railway backend service, go to "Settings" → "Networking"
2. Add custom domain: `api.carcalendar.com`
3. Follow Railway's DNS instructions
4. Update frontend `VITE_API_URL` in Vercel

---

## 📊 Scaling Considerations

**Current Setup Handles:**
- ✅ 5,000+ events
- ✅ 1,000+ users
- ✅ 2,000+ images (10GB)
- ✅ ~10,000 requests/day

**When to Upgrade:**
- **10,000+ events**: Upgrade Railway to $20/month (better database)
- **Heavy traffic**: Enable Vercel's Edge Network (automatic)
- **More images**: R2 pricing is very cheap (~$0.015/GB/month)
- **Multiple regions**: Consider Railway's multi-region (paid feature)

---

## 🔐 Security Checklist

Before going live:

- [ ] Change `JWT_SECRET` to a strong random value
- [ ] Set `NODE_ENV=production` in backend
- [ ] Enable HTTPS only (Railway and Vercel do this automatically)
- [ ] Set strong database password (Railway does this automatically)
- [ ] Review R2 bucket permissions (only backend should have write access)
- [ ] Set up rate limiting (optional, can add later)
- [ ] Configure environment-specific CORS origins

---

## 📝 Deployment Summary

**What You've Deployed:**

1. **PostgreSQL Database** (Railway)
   - PostGIS enabled for geospatial queries
   - Can handle 5,000+ events easily

2. **Backend API** (Railway)
   - Node.js + Express
   - JWT authentication
   - Image upload to R2
   - Auto-scaling

3. **Image Storage** (Cloudflare R2)
   - 10GB free storage
   - Cheap overage pricing
   - Global CDN

4. **Frontend App** (Vercel)
   - React + Vite
   - Auto-deployed on push
   - Global edge network
   - Zero-config HTTPS

**Total Cost:** ~$5/month (after free trials)

**Maintenance:** Minimal - all services auto-update and auto-scale

---

## 🚀 Next Steps

**After Deployment:**

1. **Add Content**: Create some initial events to test
2. **Share**: Give the URL to friends to test
3. **Monitor**: Check Railway and Vercel dashboards for usage
4. **Iterate**: Add features from the roadmap in README.md

**Optional Enhancements:**

- Set up custom domain
- Add Google Analytics
- Enable Vercel Analytics
- Set up error monitoring (Sentry free tier)
- Add email notifications (SendGrid free tier)

---

## 📞 Support Resources

**Railway:**
- Docs: https://docs.railway.app
- Discord: https://discord.gg/railway

**Vercel:**
- Docs: https://vercel.com/docs
- Discord: https://vercel.com/discord

**Cloudflare R2:**
- Docs: https://developers.cloudflare.com/r2

**Issues with this app:**
- GitHub: https://github.com/hippolippo/Car-Show-Calendar/issues

---

**Congratulations! Your app is now live! 🎉**

Visit your deployed app at: `https://your-frontend-url.vercel.app`

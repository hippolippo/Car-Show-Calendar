# Fix R2 Upload - Endpoint Issue

## Problem Found

Your `R2_ENDPOINT` environment variable includes the bucket name, which is incorrect.

**Current (wrong):**
```bash
R2_ENDPOINT="https://d289f1146fbacb164e77912db9c5ccfd.r2.cloudflarestorage.com/car-calendar-images"
```

**Should be:**
```bash
R2_ENDPOINT="https://d289f1146fbacb164e77912db9c5ccfd.r2.cloudflarestorage.com"
```

## Why This Breaks Upload

The AWS S3 SDK (which R2 uses) constructs the full upload path as:
```
{R2_ENDPOINT}/{R2_BUCKET_NAME}/{file_key}
```

With your current config, it's trying to upload to:
```
https://...cloudflarestorage.com/car-calendar-images/car-calendar-images/fliers/image.jpg
                                 ^^^^^^^^^^^^^^^^^^^^ ^^^^^^^^^^^^^^^^^^^
                                 From R2_ENDPOINT     From R2_BUCKET_NAME
```

This creates a double-nested path that doesn't exist, causing the upload to fail.

## How to Fix

### Step 1: Update Railway Environment Variable

1. Go to Railway dashboard: https://railway.app
2. Click on your **backend service**
3. Click **"Variables"** tab
4. Find `R2_ENDPOINT`
5. Change the value from:
   ```
   https://d289f1146fbacb164e77912db9c5ccfd.r2.cloudflarestorage.com/car-calendar-images
   ```
   To:
   ```
   https://d289f1146fbacb164e77912db9c5ccfd.r2.cloudflarestorage.com
   ```
6. Click **"Save"** or press Enter
7. Railway will automatically redeploy (watch the "Deployments" tab)

### Step 2: Wait for Deployment

- Railway takes **2-3 minutes** to redeploy
- Watch the "Deployments" tab for status
- Wait for green checkmark ✅

### Step 3: Test Upload

Run the test script:

```bash
node test-upload.js
```

Expected output:
```
✅ Upload successful: https://pub-cd87a781cd6e47cd86b236b2540f0c3a.r2.dev/fliers/1234567890-silo.jpg
```

### Step 4: Verify in Cloudflare R2

1. Go to Cloudflare R2 dashboard
2. Click on `car-calendar-images` bucket
3. You should see a `fliers/` folder
4. Inside should be the uploaded images

## Correct Environment Variable Reference

Here's what all your R2 variables should look like:

```bash
STORAGE_TYPE=r2
R2_ACCOUNT_ID=d289f1146fbacb164e77912db9c5ccfd
R2_ACCESS_KEY_ID=47793bc3e9cb30473387aabf4c1065b1
R2_SECRET_ACCESS_KEY=d989bee40b896a0c6ef700e99c015975e223a1c9756ca9853ecafcf2f8849d3c
R2_BUCKET_NAME=car-calendar-images
R2_ENDPOINT=https://d289f1146fbacb164e77912db9c5ccfd.r2.cloudflarestorage.com  # ✅ No bucket name!
R2_PUBLIC_URL=https://pub-cd87a781cd6e47cd86b236b2540f0c3a.r2.dev
```

**Key Points:**
- ✅ `R2_ENDPOINT` = Just the base URL (account endpoint)
- ✅ `R2_BUCKET_NAME` = Bucket name separately
- ✅ `R2_PUBLIC_URL` = The R2.dev subdomain for public access
- ❌ Don't put bucket name in endpoint
- ❌ Don't put R2.dev URL as endpoint

## After Fix

Once fixed, your upload flow will work:
1. User uploads image in frontend
2. Frontend calls backend `/api/v1/upload/image`
3. Backend uses StorageService to upload to R2
4. R2 stores file at: `fliers/{timestamp}-{filename}.jpg`
5. Backend returns public URL: `https://pub-xxxxx.r2.dev/fliers/{timestamp}-{filename}.jpg`
6. Frontend displays image using public URL

---

**Status:** Waiting for you to update Railway variable and redeploy
**Time to fix:** ~5 minutes (1 min to change variable + 3 min deploy + 1 min test)

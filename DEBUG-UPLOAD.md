# Debug Image Upload - Step by Step Guide

The upload is failing with a 500 error. I've added detailed logging to help diagnose the issue.

## Step 1: Wait for Railway Deployment

1. Go to Railway dashboard: https://railway.app
2. Navigate to your CarCalendar backend service
3. Click on "Deployments" tab
4. Wait for the latest deployment (commit: "Add detailed logging...") to finish deploying (2-3 minutes)
5. Status should show "Success" with a green checkmark

## Step 2: Check Railway Logs

1. In Railway dashboard, click on the backend service
2. Click on "Logs" or "Deployments" → Click on latest deployment → "View Logs"
3. Clear the logs or scroll to bottom
4. Run the upload test from your local machine:
   ```bash
   node test-upload.js
   ```
5. Watch the Railway logs - you should see output like:
   ```
   📤 Upload attempt: { filename: 'silo.jpg', size: 821564, ... }
   ```

6. If you see an error, it will now show detailed information about what went wrong

## Step 3: Check R2 Environment Variables

The logs will show the R2 configuration. Check if these are set in Railway:

**Required environment variables:**
- `STORAGE_TYPE=r2`
- `R2_ACCOUNT_ID=<your-account-id>`
- `R2_ACCESS_KEY_ID=<your-access-key>`
- `R2_SECRET_ACCESS_KEY=<your-secret-key>`
- `R2_BUCKET_NAME=car-calendar-images`
- `R2_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com`
- `R2_PUBLIC_URL=https://pub-<id>.r2.dev`

**To set/verify in Railway:**
1. Railway dashboard → Backend service → "Variables" tab
2. Check each variable is set correctly
3. If any are missing or wrong, add/update them
4. Railway will auto-redeploy when you save

## Step 4: Common Issues & Solutions

### Issue: Missing environment variables
**Symptom:** Logs show `hasAccessKey: false` or similar
**Solution:** Add the missing variables in Railway → Variables tab

### Issue: Invalid R2 endpoint format
**Symptom:** Error like "Invalid endpoint" or "Connection refused"
**Solution:** 
- Endpoint format should be: `https://<account-id>.r2.cloudflarestorage.com`
- Find your account ID in Cloudflare dashboard URL or R2 settings
- Do NOT use the R2.dev URL as the endpoint

### Issue: Invalid credentials
**Symptom:** Error like "Access Denied" or "Invalid access key"
**Solution:**
- Go to Cloudflare R2 → Manage R2 API Tokens
- Create a new **API Token** (not Account API Token)
- Scope: Admin Read & Write for your bucket
- Copy the Access Key ID and Secret Access Key
- Update Railway environment variables

### Issue: Bucket doesn't exist or wrong name
**Symptom:** Error like "NoSuchBucket" or "Bucket not found"
**Solution:**
- Go to Cloudflare R2 → Buckets
- Verify bucket name is exactly `car-calendar-images`
- If different, update `R2_BUCKET_NAME` in Railway

### Issue: Bucket permissions
**Symptom:** Upload succeeds but image not accessible at public URL
**Solution:**
- Go to Cloudflare R2 → Bucket settings
- Enable "Public Access" → "Allow Access"
- Select "R2.dev subdomain"
- Copy the public URL (e.g., `https://pub-xxxxx.r2.dev`)
- Update `R2_PUBLIC_URL` in Railway

## Step 5: Re-test After Fixes

After making any changes to Railway environment variables:
1. Wait for auto-redeploy (1-2 minutes)
2. Run test again:
   ```bash
   node test-upload.js
   ```
3. Check Railway logs for new output
4. Upload should succeed with output like:
   ```
   ✅ Upload successful: https://pub-xxxxx.r2.dev/fliers/1234567890-silo.jpg
   ```

## Step 6: Verify Image is Accessible

If upload succeeds:
1. Copy the image URL from test output
2. Open it in a browser
3. You should see the uploaded image
4. If you get "Access Denied", check bucket public access settings (Step 4, Bucket permissions)

## Need More Help?

If you're still stuck, share:
1. The exact error message from Railway logs
2. Screenshot of Railway environment variables (hide the actual secret values)
3. The R2 configuration section from the error logs (it's already sanitized to show only booleans)

---

**Current Status:** Waiting for Railway to deploy logging improvements, then check logs for detailed error information.

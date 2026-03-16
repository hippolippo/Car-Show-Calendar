# Image Upload Fix

## Issue Found

The image upload endpoint was returning 500 errors because **the R2 storage implementation was commented out**.

The backend had `STORAGE_TYPE=r2` in environment variables, but the actual R2 upload code in `StorageService.js` was just throwing an error saying "not implemented".

## What Was Fixed

### File: `backend/src/services/StorageService.js`

**Before:**
```javascript
static async _saveR2(fileBuffer, filename, mimetype) {
  // TODO: Implement R2 upload
  throw new Error('R2 storage not yet implemented. Set STORAGE_TYPE=local');
}
```

**After:**
```javascript
static async _saveR2(fileBuffer, filename, mimetype) {
  const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3');
  
  // Generate unique filename
  const timestamp = Date.now();
  const ext = path.extname(filename);
  const basename = path.basename(filename, ext);
  const safeBasename = basename.replace(/[^a-zA-Z0-9-_]/g, '_');
  const uniqueFilename = `${timestamp}-${safeBasename}${ext}`;
  const key = `fliers/${uniqueFilename}`;
  
  const client = new S3Client({
    region: 'auto',
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY
    }
  });
  
  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
    Body: fileBuffer,
    ContentType: mimetype
  });
  
  await client.send(command);
  
  // Return public URL
  return `${process.env.R2_PUBLIC_URL}/${key}`;
}
```

## Deployment

The fix has been committed and pushed to GitHub. Railway will automatically redeploy.

**Wait 2-3 minutes** for Railway to finish deploying, then test again.

## Testing

### Test Upload Endpoint

```bash
# Wait for deployment
# Check Railway dashboard → Backend → Deployments to see status

# Then test
node test-upload.js https://car-show-calendar-production.up.railway.app ./secrets/silo.jpg
```

Expected result: ✅ Image upload test PASSED

### Test via Frontend

1. Go to https://car-show-calendar-one.vercel.app
2. Register/login
3. Click "Create Event"
4. Fill in event details
5. Upload an image
6. Submit

The image should now upload to R2 successfully.

## Verify R2

After uploading, check your R2 bucket:

1. Go to Cloudflare dashboard → R2
2. Click on `car-calendar-images` bucket
3. You should see a `fliers/` folder
4. Inside should be your uploaded images with filenames like: `1773629527267-silo.jpg`

## Environment Variables Required

Make sure these are set in Railway:

```bash
STORAGE_TYPE=r2
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-access-key
R2_SECRET_ACCESS_KEY=your-secret-key
R2_BUCKET_NAME=car-calendar-images
R2_ENDPOINT=https://[account-id].r2.cloudflarestorage.com
R2_PUBLIC_URL=https://pub-xxxxx.r2.dev
```

All these should already be set from the deployment guide.

## If Still Failing

Check Railway logs:

1. Go to Railway dashboard
2. Click on Backend service
3. Click "Deployments" tab
4. Click latest deployment
5. Look for errors in logs

Common issues:
- R2 credentials incorrect
- R2 bucket doesn't exist
- R2 bucket name mismatch
- AWS SDK not installed (should be fixed by auto-deploy)

## Files Modified

- `backend/src/services/StorageService.js` - Implemented R2 upload and delete
- Committed to main branch
- Railway will auto-deploy

---

**Status**: Fix deployed, waiting for Railway auto-deployment to complete (~2-3 minutes)

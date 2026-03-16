// Upload routes
import express from 'express';
import { uploadImage, uploadMiddleware } from '../controllers/uploadController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Diagnostic endpoint to check R2 configuration
router.get('/config', (req, res) => {
  res.json({
    storageType: process.env.STORAGE_TYPE,
    r2Config: {
      hasAccountId: !!process.env.R2_ACCOUNT_ID,
      hasAccessKey: !!process.env.R2_ACCESS_KEY_ID,
      hasSecretKey: !!process.env.R2_SECRET_ACCESS_KEY,
      hasBucketName: !!process.env.R2_BUCKET_NAME,
      hasEndpoint: !!process.env.R2_ENDPOINT,
      hasPublicUrl: !!process.env.R2_PUBLIC_URL,
      endpoint: process.env.R2_ENDPOINT,
      bucketName: process.env.R2_BUCKET_NAME,
      publicUrl: process.env.R2_PUBLIC_URL
    }
  });
});

// Upload image (authentication required)
router.post('/image', authenticate, uploadMiddleware, uploadImage);

export default router;

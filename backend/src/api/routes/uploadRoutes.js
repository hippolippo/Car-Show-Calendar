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

// Test R2 connection
router.get('/test-r2', async (req, res) => {
  try {
    const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3');
    
    const client = new S3Client({
      region: 'auto',
      endpoint: process.env.R2_ENDPOINT,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY
      }
    });
    
    const testContent = Buffer.from('Test from CarCalendar - ' + new Date().toISOString());
    const testKey = `test/${Date.now()}-test.txt`;
    
    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: testKey,
      Body: testContent,
      ContentType: 'text/plain'
    });
    
    await client.send(command);
    
    res.json({
      success: true,
      message: 'R2 connection successful',
      fileKey: testKey,
      publicUrl: `${process.env.R2_PUBLIC_URL}/${testKey}`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: error.message,
        code: error.code,
        name: error.name,
        stack: error.stack
      }
    });
  }
});

// Debug upload endpoint - simplified version
router.post('/image-debug', authenticate, async (req, res) => {
  try {
    // Check if multer processed the file
    console.log('Debug upload - headers:', req.headers['content-type']);
    console.log('Debug upload - body type:', typeof req.body);
    console.log('Debug upload - has file:', !!req.file);
    
    res.json({
      success: true,
      message: 'Upload endpoint reached',
      hasFile: !!req.file,
      bodyType: typeof req.body,
      contentType: req.headers['content-type']
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      stack: error.stack
    });
  }
});

// Upload image (authentication required)
router.post('/image', authenticate, (req, res, next) => {
  // Wrap multer to catch its errors
  uploadMiddleware(req, res, (err) => {
    if (err) {
      console.error('❌ Multer error:', {
        message: err.message,
        code: err.code,
        name: err.name,
        stack: err.stack
      });
      return res.status(400).json({
        error: {
          code: 'UPLOAD_ERROR',
          message: err.message,
          details: {
            name: err.name,
            code: err.code
          }
        }
      });
    }
    next();
  });
}, uploadImage);

export default router;

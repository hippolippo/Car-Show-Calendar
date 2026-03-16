// Upload controller for image uploads
import multer from 'multer';
import { StorageService } from '../../services/StorageService.js';

// Configure multer for memory storage (we'll handle file storage ourselves)
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Only allow images
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

/**
 * Upload a single image
 * POST /api/v1/upload/image
 */
export async function uploadImage(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: {
          code: 'NO_FILE',
          message: 'No file uploaded'
        }
      });
    }

    // Log upload attempt for debugging
    console.log('📤 Upload attempt:', {
      filename: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      storageType: process.env.STORAGE_TYPE
    });

    // Save file using StorageService
    const fileUrl = await StorageService.saveFile(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );

    console.log('✅ Upload successful:', fileUrl);

    res.status(200).json({
      url: fileUrl,
      filename: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
  } catch (error) {
    // Log detailed error for debugging
    console.error('❌ Upload error:', {
      message: error.message,
      stack: error.stack,
      r2Config: {
        endpoint: process.env.R2_ENDPOINT,
        bucket: process.env.R2_BUCKET_NAME,
        hasAccessKey: !!process.env.R2_ACCESS_KEY_ID,
        hasSecretKey: !!process.env.R2_SECRET_ACCESS_KEY,
        publicUrl: process.env.R2_PUBLIC_URL
      }
    });
    
    // Return detailed error in development/for debugging
    return res.status(500).json({
      error: {
        code: 'UPLOAD_FAILED',
        message: error.message,
        details: {
          name: error.name,
          code: error.code
        }
      }
    });
  }
}

// Export the multer middleware
export const uploadMiddleware = upload.single('image');

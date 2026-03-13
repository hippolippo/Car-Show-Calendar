// Upload routes
import express from 'express';
import { uploadImage, uploadMiddleware } from '../controllers/uploadController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Upload image (authentication required)
router.post('/image', authenticate, uploadMiddleware, uploadImage);

export default router;

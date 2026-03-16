// T055: Auth routes
import express from 'express';
import { register, login, logout, me } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout); // No auth required - just clears cookie

// Protected routes
router.get('/me', authenticate, me);

export default router;

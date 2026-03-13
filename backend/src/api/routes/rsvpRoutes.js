// T118: RSVP routes
import express from 'express';
import { createRSVP, cancelRSVP, getMyRSVPs } from '../controllers/rsvpController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All RSVP routes require authentication
router.post('/', authenticate, createRSVP);
router.delete('/:eventId', authenticate, cancelRSVP);
router.get('/me', authenticate, getMyRSVPs);

export default router;

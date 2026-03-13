// T059 & T081: Event routes
import express from 'express';
import { createEvent, updateEvent, deleteEvent, getEventById, listEvents } from '../controllers/eventController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', listEvents); // List events (must be before /:id)
router.get('/:id', getEventById);

// Protected routes
router.post('/', authenticate, createEvent);
router.put('/:id', authenticate, updateEvent);
router.delete('/:id', authenticate, deleteEvent);

export default router;

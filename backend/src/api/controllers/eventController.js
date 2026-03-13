// T056-T058: Event API controllers
import { EventService } from '../../services/EventService.js';

/**
 * Create a new event
 * POST /api/v1/events
 */
export async function createEvent(req, res, next) {
  try {
    const { name, description, eventDate, location, flierUrl } = req.body;
    const userId = req.user.userId;

    const event = await EventService.createEvent(userId, {
      name,
      description,
      eventDate,
      location,
      flierUrl
    });

    // Fetch full event details with location
    const fullEvent = await EventService.getEventById(event.id, userId);

    res.status(201).json(fullEvent);
  } catch (error) {
    if (error.validationErrors) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request data',
          details: error.validationErrors.map(err => ({
            message: err
          }))
        }
      });
    }

    next(error);
  }
}

/**
 * Update an event
 * PUT /api/v1/events/:id
 */
export async function updateEvent(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const updates = req.body;

    const event = await EventService.updateEvent(id, userId, updates);

    // Fetch full event details with location
    const fullEvent = await EventService.getEventById(event.id, userId);

    res.status(200).json(fullEvent);
  } catch (error) {
    if (error.message === 'Event not found') {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: error.message
        }
      });
    }

    if (error.message === 'Only the event organizer can update this event') {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: error.message
        }
      });
    }

    if (error.validationErrors) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request data',
          details: error.validationErrors.map(err => ({
            message: err
          }))
        }
      });
    }

    next(error);
  }
}

/**
 * Delete an event
 * DELETE /api/v1/events/:id
 */
export async function deleteEvent(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    await EventService.deleteEvent(id, userId);

    res.status(204).send();
  } catch (error) {
    if (error.message === 'Event not found') {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: error.message
        }
      });
    }

    if (error.message === 'Only the event organizer can delete this event') {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: error.message
        }
      });
    }

    next(error);
  }
}

/**
 * List events with filtering and sorting (T079)
 * GET /api/v1/events
 */
export async function listEvents(req, res, next) {
  try {
    const params = {
      lat: req.query.lat ? parseFloat(req.query.lat) : undefined,
      lon: req.query.lon ? parseFloat(req.query.lon) : undefined,
      radius: req.query.radius ? parseInt(req.query.radius) : undefined,
      sortBy: req.query.sortBy || 'distance',
      includePast: req.query.includePast === 'true',
      page: req.query.page ? parseInt(req.query.page) : 1,
      limit: req.query.limit ? parseInt(req.query.limit) : 50
    };

    const result = await EventService.listEvents(params);

    res.status(200).json(result);
  } catch (error) {
    if (error.message.includes('required')) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: error.message
        }
      });
    }

    next(error);
  }
}

/**
 * Get event by ID (T080)
 * GET /api/v1/events/:id
 */
export async function getEventById(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user?.userId; // Optional - may not be authenticated

    const event = await EventService.getEventById(id, userId);

    if (!event) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Event not found'
        }
      });
    }

    res.status(200).json(event);
  } catch (error) {
    next(error);
  }
}

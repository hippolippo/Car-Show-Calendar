// T115-T117: RSVP API controllers
import { RSVPService } from '../../services/RSVPService.js';

/**
 * Create RSVP
 * POST /api/v1/rsvps
 */
export async function createRSVP(req, res, next) {
  try {
    const { eventId } = req.body;
    const userId = req.user.userId;

    if (!eventId) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Event ID is required'
        }
      });
    }

    const rsvp = await RSVPService.createRSVP(userId, eventId);

    res.status(201).json(rsvp);
  } catch (error) {
    if (error.message === 'Event not found') {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: error.message
        }
      });
    }

    if (error.message === 'Already RSVP\'d to this event') {
      return res.status(409).json({
        error: {
          code: 'CONFLICT',
          message: error.message
        }
      });
    }

    if (error.message === 'Cannot RSVP to past events') {
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
 * Cancel RSVP
 * DELETE /api/v1/rsvps/:eventId
 */
export async function cancelRSVP(req, res, next) {
  try {
    const { eventId } = req.params;
    const userId = req.user.userId;

    await RSVPService.cancelRSVP(userId, eventId);

    res.status(204).send();
  } catch (error) {
    if (error.message === 'RSVP not found') {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: error.message
        }
      });
    }

    next(error);
  }
}

/**
 * Get current user's RSVPs
 * GET /api/v1/rsvps/me
 */
export async function getMyRSVPs(req, res, next) {
  try {
    const userId = req.user.userId;

    const rsvps = await RSVPService.getUserRSVPs(userId);

    res.status(200).json({
      rsvps
    });
  } catch (error) {
    next(error);
  }
}

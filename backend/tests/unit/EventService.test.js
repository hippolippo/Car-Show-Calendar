import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { EventService } from '../../src/services/EventService.js';
import { Event } from '../../src/models/Event.js';
import { Location } from '../../src/models/Location.js';
import { User } from '../../src/models/User.js';
import pool from '../../src/config/database.js';
import { setupTestDatabase, cleanupTestDatabase } from '../setup.js';

describe('EventService', () => {
  let testUserId;

  beforeEach(async () => {
    await setupTestDatabase();
    
    // Create test user
    const user = await User.create({
      email: 'organizer@example.com',
      passwordHash: 'hashed_password',
      displayName: 'Test Organizer'
    });
    testUserId = user.id;
  });

  afterEach(async () => {
    await cleanupTestDatabase();
  });

  describe('createEvent', () => {
    it('should create event with location', async () => {
      const eventData = {
        name: 'Spring Car Show',
        description: 'Annual car show',
        eventDate: new Date('2026-06-15T14:00:00Z'),
        location: {
          address: '123 Main St',
          city: 'Charlotte',
          state: 'NC',
          zipCode: '28202',
          country: 'USA',
          coordinates: {
            lat: 35.2271,
            lon: -80.8431
          }
        },
        flierUrl: null
      };

      const event = await EventService.createEvent(testUserId, eventData);

      expect(event).toBeDefined();
      expect(event.id).toBeDefined();
      expect(event.name).toBe('Spring Car Show');
      expect(event.description).toBe('Annual car show');
      expect(event.organizerId).toBe(testUserId);
      expect(event.locationId).toBeDefined();
      expect(event.rsvpCount).toBe(0);
    });

    it('should throw error if name is too short', async () => {
      const eventData = {
        name: 'Ab',
        description: 'Test event',
        eventDate: new Date('2026-06-15T14:00:00Z'),
        location: {
          address: '123 Main St',
          city: 'Charlotte',
          state: 'NC',
          zipCode: '28202',
          country: 'USA',
          coordinates: { lat: 35.2271, lon: -80.8431 }
        }
      };

      await expect(EventService.createEvent(testUserId, eventData))
        .rejects
        .toThrow('Event name must be at least 3 characters');
    });

    it('should throw error if name is too long', async () => {
      const eventData = {
        name: 'A'.repeat(201),
        description: 'Test event',
        eventDate: new Date('2026-06-15T14:00:00Z'),
        location: {
          address: '123 Main St',
          city: 'Charlotte',
          state: 'NC',
          zipCode: '28202',
          country: 'USA',
          coordinates: { lat: 35.2271, lon: -80.8431 }
        }
      };

      await expect(EventService.createEvent(testUserId, eventData))
        .rejects
        .toThrow('Event name must be at most 200 characters');
    });

    it('should throw error if description is too short', async () => {
      const eventData = {
        name: 'Valid Name',
        description: 'Short',
        eventDate: new Date('2026-06-15T14:00:00Z'),
        location: {
          address: '123 Main St',
          city: 'Charlotte',
          state: 'NC',
          zipCode: '28202',
          country: 'USA',
          coordinates: { lat: 35.2271, lon: -80.8431 }
        }
      };

      await expect(EventService.createEvent(testUserId, eventData))
        .rejects
        .toThrow('Event description must be at least 10 characters');
    });

    it('should throw error if event date is in the past', async () => {
      const pastDate = new Date('2020-01-01T14:00:00Z');
      const eventData = {
        name: 'Past Event',
        description: 'This event is in the past',
        eventDate: pastDate,
        location: {
          address: '123 Main St',
          city: 'Charlotte',
          state: 'NC',
          zipCode: '28202',
          country: 'USA',
          coordinates: { lat: 35.2271, lon: -80.8431 }
        }
      };

      await expect(EventService.createEvent(testUserId, eventData))
        .rejects
        .toThrow('Event date must be in the future');
    });

    it('should throw error if latitude is invalid', async () => {
      const eventData = {
        name: 'Invalid Coords Event',
        description: 'Event with invalid coordinates',
        eventDate: new Date('2026-06-15T14:00:00Z'),
        location: {
          address: '123 Main St',
          city: 'Charlotte',
          state: 'NC',
          zipCode: '28202',
          country: 'USA',
          coordinates: { lat: 95.0, lon: -80.8431 }
        }
      };

      await expect(EventService.createEvent(testUserId, eventData))
        .rejects
        .toThrow('Latitude must be between -90 and 90');
    });

    it('should throw error if longitude is invalid', async () => {
      const eventData = {
        name: 'Invalid Coords Event',
        description: 'Event with invalid coordinates',
        eventDate: new Date('2026-06-15T14:00:00Z'),
        location: {
          address: '123 Main St',
          city: 'Charlotte',
          state: 'NC',
          zipCode: '28202',
          country: 'USA',
          coordinates: { lat: 35.2271, lon: -185.0 }
        }
      };

      await expect(EventService.createEvent(testUserId, eventData))
        .rejects
        .toThrow('Longitude must be between -180 and 180');
    });
  });

  describe('updateEvent', () => {
    let eventId;

    beforeEach(async () => {
      const eventData = {
        name: 'Original Event',
        description: 'Original description',
        eventDate: new Date('2026-06-15T14:00:00Z'),
        location: {
          address: '123 Main St',
          city: 'Charlotte',
          state: 'NC',
          zipCode: '28202',
          country: 'USA',
          coordinates: { lat: 35.2271, lon: -80.8431 }
        }
      };
      const event = await EventService.createEvent(testUserId, eventData);
      eventId = event.id;
    });

    it('should update event name', async () => {
      const updates = { name: 'Updated Event Name' };
      const updatedEvent = await EventService.updateEvent(eventId, testUserId, updates);

      expect(updatedEvent.name).toBe('Updated Event Name');
      expect(updatedEvent.description).toBe('Original description');
    });

    it('should update event description', async () => {
      const updates = { description: 'Updated description here' };
      const updatedEvent = await EventService.updateEvent(eventId, testUserId, updates);

      expect(updatedEvent.description).toBe('Updated description here');
      expect(updatedEvent.name).toBe('Original Event');
    });

    it('should throw error if user is not the organizer', async () => {
      // Create different user
      const otherUser = await User.create({
        email: 'other@example.com',
        passwordHash: 'hashed',
        displayName: 'Other User'
      });

      const updates = { name: 'Unauthorized Update' };

      await expect(EventService.updateEvent(eventId, otherUser.id, updates))
        .rejects
        .toThrow('Only the event organizer can update this event');
    });

    it('should throw error if event does not exist', async () => {
      const fakeEventId = '00000000-0000-0000-0000-000000000000';
      const updates = { name: 'Updated Name' };

      await expect(EventService.updateEvent(fakeEventId, testUserId, updates))
        .rejects
        .toThrow('Event not found');
    });

    it('should validate updated fields', async () => {
      const updates = { name: 'AB' }; // Too short

      await expect(EventService.updateEvent(eventId, testUserId, updates))
        .rejects
        .toThrow('Event name must be at least 3 characters');
    });
  });

  describe('deleteEvent', () => {
    let eventId;

    beforeEach(async () => {
      const eventData = {
        name: 'Event To Delete',
        description: 'This event will be deleted',
        eventDate: new Date('2026-06-15T14:00:00Z'),
        location: {
          address: '123 Main St',
          city: 'Charlotte',
          state: 'NC',
          zipCode: '28202',
          country: 'USA',
          coordinates: { lat: 35.2271, lon: -80.8431 }
        }
      };
      const event = await EventService.createEvent(testUserId, eventData);
      eventId = event.id;
    });

    it('should delete event', async () => {
      await EventService.deleteEvent(eventId, testUserId);

      // Verify event is deleted
      const event = await Event.findById(eventId);
      expect(event).toBeNull();
    });

    it('should throw error if user is not the organizer', async () => {
      const otherUser = await User.create({
        email: 'other@example.com',
        passwordHash: 'hashed',
        displayName: 'Other User'
      });

      await expect(EventService.deleteEvent(eventId, otherUser.id))
        .rejects
        .toThrow('Only the event organizer can delete this event');
    });

    it('should throw error if event does not exist', async () => {
      const fakeEventId = '00000000-0000-0000-0000-000000000000';

      await expect(EventService.deleteEvent(fakeEventId, testUserId))
        .rejects
        .toThrow('Event not found');
    });
  });

  describe('getEventById', () => {
    let eventId;

    beforeEach(async () => {
      const eventData = {
        name: 'Test Event',
        description: 'Test description',
        eventDate: new Date('2026-06-15T14:00:00Z'),
        location: {
          address: '123 Main St',
          city: 'Charlotte',
          state: 'NC',
          zipCode: '28202',
          country: 'USA',
          coordinates: { lat: 35.2271, lon: -80.8431 }
        }
      };
      const event = await EventService.createEvent(testUserId, eventData);
      eventId = event.id;
    });

    it('should return event with location', async () => {
      const event = await EventService.getEventById(eventId);

      expect(event).toBeDefined();
      expect(event.id).toBe(eventId);
      expect(event.name).toBe('Test Event');
      expect(event.location).toBeDefined();
      expect(event.location.city).toBe('Charlotte');
    });

    it('should return null if event does not exist', async () => {
      const fakeEventId = '00000000-0000-0000-0000-000000000000';
      const event = await EventService.getEventById(fakeEventId);

      expect(event).toBeNull();
    });
  });
});

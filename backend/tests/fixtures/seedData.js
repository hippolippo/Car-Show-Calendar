// T039: Seed data fixtures for testing
import bcrypt from 'bcrypt';

/**
 * Test user fixtures
 */
export const testUsers = [
  {
    email: 'john@example.com',
    password: 'password123',
    passwordHash: await bcrypt.hash('password123', 12),
    displayName: 'John Doe'
  },
  {
    email: 'jane@example.com',
    password: 'password123',
    passwordHash: await bcrypt.hash('password123', 12),
    displayName: 'Jane Smith'
  },
  {
    email: 'organizer@example.com',
    password: 'password123',
    passwordHash: await bcrypt.hash('password123', 12),
    displayName: 'Event Organizer'
  }
];

/**
 * Test location fixtures
 */
export const testLocations = [
  {
    address: '123 Main St',
    city: 'Charlotte',
    state: 'NC',
    zipCode: '28202',
    country: 'USA',
    coordinates: { lat: 35.2271, lon: -80.8431 }
  },
  {
    address: '456 Oak Ave',
    city: 'Raleigh',
    state: 'NC',
    zipCode: '27601',
    country: 'USA',
    coordinates: { lat: 35.7796, lon: -78.6382 }
  }
];

/**
 * Test event fixtures
 */
export const testEvents = [
  {
    name: 'Spring Car Show 2026',
    description: 'Annual spring car show featuring classic cars and hot rods. Free admission, family-friendly event.',
    eventDate: new Date('2026-04-15T14:00:00Z'),
  },
  {
    name: 'Summer Meet & Greet',
    description: 'Casual summer car meet. Bring your ride and hang out with fellow car enthusiasts.',
    eventDate: new Date('2026-06-20T18:00:00Z'),
  }
];

export default { testUsers, testLocations, testEvents };

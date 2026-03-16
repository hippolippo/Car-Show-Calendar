#!/usr/bin/env node
/**
 * CarCalendar Deployment Test Script v2
 * 
 * Tests the deployed backend API with proper cookie handling.
 * Cleans up after itself.
 * 
 * Usage: node test-deployment-v2.js [API_URL]
 * Example: node test-deployment-v2.js https://car-show-calendar-production.up.railway.app
 */

const API_URL = process.argv[2] || 'https://car-show-calendar-production.up.railway.app';
const API_BASE = `${API_URL}/api/v1`;

// Test data
const timestamp = Date.now();
const testUser = {
  email: `test-${timestamp}@example.com`,
  password: 'TestPassword123!',
  displayName: `Test User ${timestamp}`
};

const testEvent = {
  name: `Test Event ${timestamp}`,
  description: 'This is a test event that will be automatically cleaned up',
  eventDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  location: {
    address: '1600 Pennsylvania Avenue NW',
    city: 'Washington',
    state: 'DC',
    zipCode: '20500',
    country: 'USA',
    coordinates: {
      lat: 38.8977,
      lon: -77.0365
    }
  }
};

// State
let cookies = '';
let eventId = null;
let userId = null;

// Helper functions
function log(emoji, message, data = null) {
  console.log(`${emoji} ${message}`);
  if (data) {
    console.log(`   ${JSON.stringify(data, null, 2).split('\n').join('\n   ')}`);
  }
}

function logError(message, error) {
  console.error(`❌ ${message}`);
  if (error.message) console.error(`   Error: ${error.message}`);
  if (error.response) console.error(`   Response: ${JSON.stringify(error.response)}`);
}

async function makeRequest(method, endpoint, data = null, requiresAuth = false) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json'
  };

  // Send cookies if we have them
  if (requiresAuth && cookies) {
    headers['Cookie'] = cookies;
  }

  const options = {
    method,
    headers,
    credentials: 'include'
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(url, options);
  
  // Store cookies from response
  const setCookieHeader = response.headers.get('set-cookie');
  if (setCookieHeader) {
    // Parse and store cookies
    const cookieParts = setCookieHeader.split(',').map(c => c.split(';')[0].trim());
    cookies = cookieParts.join('; ');
  }

  const contentType = response.headers.get('content-type');
  let responseData = null;
  
  if (contentType && contentType.includes('application/json')) {
    responseData = await response.json();
  } else {
    responseData = await response.text();
  }

  if (!response.ok) {
    const error = new Error(`HTTP ${response.status}`);
    error.response = responseData;
    error.status = response.status;
    throw error;
  }

  return responseData;
}

// Test functions
async function testHealthCheck() {
  log('🏥', 'Testing health check...');
  try {
    const response = await fetch(`${API_URL}/health`);
    const data = await response.json();
    if (data.status === 'ok') {
      log('✅', 'Health check passed', data);
      return true;
    }
    throw new Error('Health check returned non-ok status');
  } catch (error) {
    logError('Health check failed', error);
    return false;
  }
}

async function testRegister() {
  log('📝', 'Testing user registration...');
  try {
    const response = await makeRequest('POST', '/auth/register', testUser);
    userId = response.user?.id;
    log('✅', 'Registration successful', { userId, email: testUser.email });
    return true;
  } catch (error) {
    logError('Registration failed', error);
    return false;
  }
}

async function testLogin() {
  log('🔐', 'Testing user login...');
  try {
    const response = await makeRequest('POST', '/auth/login', {
      email: testUser.email,
      password: testUser.password
    });
    
    log('✅', 'Login successful', { 
      hasCookies: cookies.length > 0,
      cookiePreview: cookies.substring(0, 50) + '...'
    });
    return true;
  } catch (error) {
    logError('Login failed', error);
    return false;
  }
}

async function testCreateEvent() {
  log('📅', 'Testing event creation...');
  try {
    const response = await makeRequest('POST', '/events', testEvent, true);
    // Response is the event object directly, not wrapped
    eventId = response.id || response.event?.id;
    log('✅', 'Event created successfully', { eventId, name: response.name || testEvent.name });
    return true;
  } catch (error) {
    logError('Event creation failed', error);
    return false;
  }
}

async function testGetEvents() {
  log('📋', 'Testing get events list...');
  try {
    const response = await makeRequest('GET', '/events?lat=38.8977&lon=-77.0365&radius=50');
    // Response might be { events: [...] } or just [...]
    const events = response.events || response;
    const eventCount = Array.isArray(events) ? events.length : 0;
    const foundTestEvent = Array.isArray(events) && events.some(e => e.id === eventId);
    log('✅', 'Get events successful', { 
      totalEvents: eventCount, 
      foundTestEvent 
    });
    return true;
  } catch (error) {
    logError('Get events failed', error);
    return false;
  }
}

async function testGetEventById() {
  log('🔍', 'Testing get event by ID...');
  try {
    const response = await makeRequest('GET', `/events/${eventId}`);
    const event = response.event || response;
    log('✅', 'Get event by ID successful', { 
      eventId, 
      name: event.name,
      rsvpCount: event.rsvpCount
    });
    return true;
  } catch (error) {
    logError('Get event by ID failed', error);
    return false;
  }
}

async function testRSVP() {
  log('✋', 'Testing RSVP...');
  try {
    const response = await makeRequest('POST', `/rsvps`, { eventId }, true);
    const rsvp = response.rsvp || response;
    log('✅', 'RSVP successful', { 
      eventId,
      status: rsvp.status 
    });
    return true;
  } catch (error) {
    logError('RSVP failed', error);
    return false;
  }
}

async function testGetEventWithRSVP() {
  log('👥', 'Testing get event with RSVP count...');
  try {
    const response = await makeRequest('GET', `/events/${eventId}`);
    const event = response.event || response;
    const rsvpCount = event.rsvpCount || 0;
    log('✅', 'Event has RSVP count', { 
      eventId,
      rsvpCount,
      expectedAtLeast: 1
    });
    return rsvpCount >= 1;
  } catch (error) {
    logError('Get event with RSVP failed', error);
    return false;
  }
}

async function testUnRSVP() {
  log('🚫', 'Testing un-RSVP...');
  try {
    await makeRequest('DELETE', `/rsvps/${eventId}`, null, true);
    log('✅', 'Un-RSVP successful', { eventId });
    return true;
  } catch (error) {
    logError('Un-RSVP failed', error);
    return false;
  }
}

// Cleanup functions
async function cleanupEvent() {
  if (!eventId) {
    log('ℹ️', 'No event to clean up');
    return true;
  }
  
  log('🧹', 'Cleaning up test event...');
  try {
    await makeRequest('DELETE', `/events/${eventId}`, null, true);
    log('✅', 'Event deleted successfully', { eventId });
    return true;
  } catch (error) {
    if (error.status === 404) {
      log('ℹ️', 'Event already deleted or not found');
      return true;
    }
    logError('Event cleanup failed', error);
    return false;
  }
}

async function cleanupUser() {
  if (!userId) {
    log('ℹ️', 'No user to clean up');
    return true;
  }
  
  log('🧹', 'Cleaning up test user...');
  try {
    await makeRequest('DELETE', `/users/${userId}`, null, true);
    log('✅', 'User deleted successfully', { userId });
    return true;
  } catch (error) {
    if (error.status === 404 || error.status === 405) {
      log('⚠️', 'User cleanup endpoint not available (this is okay)', { 
        note: 'User will remain with unique email',
        email: testUser.email 
      });
      return true;
    }
    logError('User cleanup failed', error);
    return false;
  }
}

// Main test runner
async function runTests() {
  console.log('\n🚀 CarCalendar Deployment Test Suite v2');
  console.log('==========================================');
  console.log(`Testing API: ${API_URL}\n`);

  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };

  const tests = [
    { name: 'Health Check', fn: testHealthCheck },
    { name: 'User Registration', fn: testRegister },
    { name: 'User Login', fn: testLogin },
    { name: 'Create Event', fn: testCreateEvent },
    { name: 'Get Events List', fn: testGetEvents },
    { name: 'Get Event by ID', fn: testGetEventById },
    { name: 'RSVP to Event', fn: testRSVP },
    { name: 'Verify RSVP Count', fn: testGetEventWithRSVP },
    { name: 'Un-RSVP from Event', fn: testUnRSVP }
  ];

  // Run all tests
  for (const test of tests) {
    try {
      const passed = await test.fn();
      results.tests.push({ name: test.name, passed });
      if (passed) {
        results.passed++;
      } else {
        results.failed++;
      }
    } catch (error) {
      logError(`Unexpected error in ${test.name}`, error);
      results.tests.push({ name: test.name, passed: false });
      results.failed++;
    }
    console.log('');
  }

  // Cleanup
  console.log('🧹 Cleaning up test data...');
  console.log('==========================================\n');
  
  await cleanupEvent();
  await cleanupUser();

  // Summary
  console.log('\n📊 Test Summary');
  console.log('==========================================');
  console.log(`Total tests: ${results.passed + results.failed}`);
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log('\nTest Results:');
  results.tests.forEach(test => {
    console.log(`  ${test.passed ? '✅' : '❌'} ${test.name}`);
  });

  if (results.failed === 0) {
    console.log('\n🎉 All tests passed! Deployment is working correctly.\n');
    process.exit(0);
  } else {
    console.log('\n⚠️ Some tests failed. Please check the errors above.\n');
    process.exit(1);
  }
}

// Run tests
runTests().catch(error => {
  console.error('\n💥 Fatal error running tests:', error);
  process.exit(1);
});

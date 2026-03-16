// Quick test for logout endpoint
const API_URL = 'https://car-show-calendar-production.up.railway.app';

async function testLogout() {
  console.log('🧪 Testing logout without authentication');
  console.log('=========================================\n');
  
  try {
    console.log('Calling POST /api/v1/auth/logout without auth...');
    const response = await fetch(`${API_URL}/api/v1/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (response.status === 200) {
      console.log('\n✅ SUCCESS: Logout works without authentication!');
      console.log('Users can now logout even with invalid/expired tokens.');
    } else {
      console.log('\n❌ FAILED: Logout requires authentication');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testLogout();

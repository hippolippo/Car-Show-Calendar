#!/usr/bin/env node
/**
 * Test R2 Configuration
 * Checks if Railway has the correct R2 environment variables configured
 */

const API_URL = process.argv[2] || 'https://car-show-calendar-production.up.railway.app';

async function testR2Config() {
  console.log('🔍 R2 Configuration Test');
  console.log('==========================================');
  console.log('API:', API_URL);
  console.log('');

  try {
    // Test health endpoint to see storage info
    console.log('📡 Fetching storage configuration...');
    const response = await fetch(`${API_URL}/api/v1/health`);
    const data = await response.json();
    
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (data.storage) {
      console.log('');
      console.log('Storage Type:', data.storage.type);
      console.log('');
      
      if (data.storage.type === 'r2') {
        console.log('✅ R2 storage is configured');
        
        // Check for R2 env vars (backend should expose this for debugging)
        const hasEndpoint = !!process.env.R2_ENDPOINT;
        const hasAccessKey = !!process.env.R2_ACCESS_KEY_ID;
        const hasBucket = !!process.env.R2_BUCKET_NAME;
        const hasPublicUrl = !!process.env.R2_PUBLIC_URL;
        
        console.log('Environment variables check:');
        console.log('  R2_ENDPOINT:', hasEndpoint ? '✅' : '❌');
        console.log('  R2_ACCESS_KEY_ID:', hasAccessKey ? '✅' : '❌');
        console.log('  R2_BUCKET_NAME:', hasBucket ? '✅' : '❌');
        console.log('  R2_PUBLIC_URL:', hasPublicUrl ? '✅' : '❌');
      } else {
        console.log('❌ Expected R2 storage but got:', data.storage.type);
      }
    } else {
      console.log('❌ No storage info in health response');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testR2Config();

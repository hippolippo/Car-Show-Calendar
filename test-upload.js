#!/usr/bin/env node
/**
 * Test Image Upload to Deployed Backend
 * 
 * Tests the /api/v1/upload/image endpoint
 * 
 * Usage: node test-upload.js [API_URL] [IMAGE_PATH]
 */

const fs = require('fs');
const path = require('path');

const API_URL = process.argv[2] || 'https://car-show-calendar-production.up.railway.app';
const IMAGE_PATH = process.argv[3] || './secrets/silo.jpg';
const API_BASE = `${API_URL}/api/v1`;

// Test data for auth
const timestamp = Date.now();
const testUser = {
  email: `upload-test-${timestamp}@example.com`,
  password: 'TestPassword123!',
  displayName: `Upload Test ${timestamp}`
};

let cookies = '';

async function makeRequest(method, endpoint, body = null, isFormData = false, requiresAuth = false) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {};

  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  if (requiresAuth && cookies) {
    headers['Cookie'] = cookies;
  }

  const options = {
    method,
    headers,
    credentials: 'include'
  };

  if (body) {
    options.body = body;
  }

  const response = await fetch(url, options);
  
  // Store cookies
  const setCookieHeader = response.headers.get('set-cookie');
  if (setCookieHeader) {
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

  return { response, data: responseData };
}

async function testRegisterAndLogin() {
  console.log('📝 Registering test user...');
  
  try {
    const { data: registerData } = await makeRequest('POST', '/auth/register', 
      JSON.stringify(testUser)
    );
    console.log('✅ Registration successful:', registerData.user?.email);
  } catch (error) {
    console.error('❌ Registration failed:', error.message);
    return false;
  }

  console.log('\n🔐 Logging in...');
  try {
    const { data: loginData } = await makeRequest('POST', '/auth/login',
      JSON.stringify({
        email: testUser.email,
        password: testUser.password
      })
    );
    console.log('✅ Login successful, cookies stored');
    return true;
  } catch (error) {
    console.error('❌ Login failed:', error.message);
    return false;
  }
}

async function testImageUpload() {
  console.log('\n📸 Testing image upload...');
  console.log(`Image: ${IMAGE_PATH}`);

  // Check if file exists
  if (!fs.existsSync(IMAGE_PATH)) {
    console.error(`❌ Image file not found: ${IMAGE_PATH}`);
    return false;
  }

  const stats = fs.statSync(IMAGE_PATH);
  console.log(`File size: ${(stats.size / 1024).toFixed(2)} KB`);

  // Check file size
  if (stats.size > 5 * 1024 * 1024) {
    console.error('❌ File too large (max 5MB)');
    return false;
  }

  // Read file
  const fileBuffer = fs.readFileSync(IMAGE_PATH);
  const fileName = path.basename(IMAGE_PATH);

  // Create FormData (Node.js doesn't have FormData, we'll use multipart manually)
  // Actually, we need to use a library or construct it manually
  // For testing, let's use a simple approach with fetch

  try {
    // Use https.request instead of fetch for better form-data compatibility
    const https = require('https');
    const FormData = require('form-data');
    
    const form = new FormData();
    form.append('image', fileBuffer, {
      filename: fileName,
      contentType: 'image/jpeg'
    });

    const url = `${API_BASE}/upload/image`;
    console.log('Uploading to:', url);
    console.log('Authenticated:', cookies.length > 0);

    // Use https.request for proper multipart/form-data streaming
    const uploadResult = await new Promise((resolve, reject) => {
      const urlParts = new URL(url);
      const options = {
        method: 'POST',
        hostname: urlParts.hostname,
        path: urlParts.pathname,
        headers: {
          ...form.getHeaders(),
          'Cookie': cookies
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            resolve({ status: res.statusCode, data: json });
          } catch (e) {
            resolve({ status: res.statusCode, data: data });
          }
        });
      });

      req.on('error', reject);
      form.pipe(req);
    });

    if (uploadResult.status !== 200) {
      console.error('❌ Upload failed');
      console.error('Status:', uploadResult.status);
      console.error('Response:', JSON.stringify(uploadResult.data, null, 2));
      return false;
    }

    console.log('✅ Upload successful!');
    console.log('Response:', JSON.stringify(uploadResult.data, null, 2));
    return true;

  } catch (error) {
    console.error('❌ Upload error:', error.message);
    if (error.response) {
      console.error('Response:', error.response);
    }
    return false;
  }
}

async function run() {
  console.log('\n🧪 Image Upload Test');
  console.log('==========================================');
  console.log(`API: ${API_URL}`);
  console.log(`Image: ${IMAGE_PATH}\n`);

  // Step 1: Register and login
  const authenticated = await testRegisterAndLogin();
  if (!authenticated) {
    console.error('\n❌ Authentication failed, cannot test upload');
    process.exit(1);
  }

  // Step 2: Test upload
  const uploadSuccess = await testImageUpload();

  console.log('\n==========================================');
  if (uploadSuccess) {
    console.log('🎉 Image upload test PASSED');
    process.exit(0);
  } else {
    console.log('❌ Image upload test FAILED');
    process.exit(1);
  }
}

// Check if form-data is installed
try {
  require.resolve('form-data');
  run();
} catch (e) {
  console.error('❌ Missing dependency: form-data');
  console.error('\nPlease install it first:');
  console.error('  npm install form-data');
  process.exit(1);
}

#!/usr/bin/env node
/**
 * Test R2 Connection Directly
 * Tests if we can connect to R2 with the configured credentials
 */

import { S3Client, PutObjectCommand, ListBucketsCommand } from '@aws-sdk/client-s3';

// R2 configuration from environment
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;
const R2_ENDPOINT = process.env.R2_ENDPOINT;
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL;

console.log('🔍 R2 Direct Connection Test');
console.log('==========================================');
console.log('Configuration:');
console.log('  R2_ACCOUNT_ID:', R2_ACCOUNT_ID ? '✅ Set' : '❌ Missing');
console.log('  R2_ACCESS_KEY_ID:', R2_ACCESS_KEY_ID ? '✅ Set' : '❌ Missing');
console.log('  R2_SECRET_ACCESS_KEY:', R2_SECRET_ACCESS_KEY ? '✅ Set' : '❌ Missing');
console.log('  R2_BUCKET_NAME:', R2_BUCKET_NAME ? `✅ ${R2_BUCKET_NAME}` : '❌ Missing');
console.log('  R2_ENDPOINT:', R2_ENDPOINT ? `✅ ${R2_ENDPOINT}` : '❌ Missing');
console.log('  R2_PUBLIC_URL:', R2_PUBLIC_URL ? `✅ ${R2_PUBLIC_URL}` : '❌ Missing');
console.log('');

if (!R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_ENDPOINT || !R2_BUCKET_NAME) {
  console.error('❌ Missing required R2 environment variables');
  console.log('');
  console.log('Please set the following in your .env file:');
  console.log('  R2_ACCOUNT_ID=<your-account-id>');
  console.log('  R2_ACCESS_KEY_ID=<your-access-key-id>');
  console.log('  R2_SECRET_ACCESS_KEY=<your-secret-access-key>');
  console.log('  R2_BUCKET_NAME=car-calendar-images');
  console.log('  R2_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com');
  console.log('  R2_PUBLIC_URL=https://pub-<id>.r2.dev');
  process.exit(1);
}

async function testR2() {
  try {
    console.log('📡 Creating R2 client...');
    const client = new S3Client({
      region: 'auto',
      endpoint: R2_ENDPOINT,
      credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY
      }
    });
    console.log('✅ Client created');
    console.log('');

    // Test 1: List buckets (this verifies auth works)
    console.log('📋 Test 1: Listing buckets...');
    try {
      const listCommand = new ListBucketsCommand({});
      const listResult = await client.send(listCommand);
      console.log('✅ Successfully connected to R2');
      console.log('Buckets:', listResult.Buckets?.map(b => b.Name).join(', ') || 'None');
    } catch (error) {
      console.error('❌ Failed to list buckets:', error.message);
      console.log('This usually means invalid credentials or endpoint');
      return;
    }
    console.log('');

    // Test 2: Upload a test file
    console.log('📤 Test 2: Uploading test file...');
    const testContent = Buffer.from('Test upload from CarCalendar - ' + new Date().toISOString());
    const testKey = `test/${Date.now()}-test.txt`;
    
    try {
      const uploadCommand = new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: testKey,
        Body: testContent,
        ContentType: 'text/plain'
      });
      
      await client.send(uploadCommand);
      console.log('✅ Successfully uploaded test file');
      console.log('Key:', testKey);
      console.log('Public URL:', `${R2_PUBLIC_URL}/${testKey}`);
      console.log('');
      console.log('🎉 R2 is working correctly!');
    } catch (error) {
      console.error('❌ Failed to upload:', error.message);
      console.log('This might mean:');
      console.log('  - Bucket name is incorrect');
      console.log('  - Bucket permissions are not set correctly');
      console.log('  - API token doesn\'t have write permissions');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  }
}

testR2();

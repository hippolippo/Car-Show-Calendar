# Testing Scripts

This directory contains deployment and integration testing scripts.

## Scripts

### test-deployment.js
Comprehensive deployment test that verifies all backend functionality:
- Health check
- User registration and authentication
- Event CRUD operations
- RSVP functionality
- Database triggers

**Usage:**
```bash
node scripts/testing/test-deployment.js https://your-backend-url.railway.app
```

**Expected:** All 9 tests should pass ✅

### test-upload.js
Tests image upload functionality with R2 storage:
- User authentication
- Image file upload
- R2 storage integration

**Usage:**
```bash
node scripts/testing/test-upload.js https://your-backend-url.railway.app ./path/to/image.jpg
```

**Expected:** Upload successful with public R2 URL ✅

## Dependencies

These scripts require `form-data` package (installed in root `package.json`) for multipart form uploads.

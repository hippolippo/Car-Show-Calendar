# Manual Migration Instructions

If the migrations didn't work the first time, here's a step-by-step guide.

## Step 1: Check Current Database State

Run the diagnostic script:

```bash
psql "YOUR_RAILWAY_CONNECTION_STRING" -f diagnose-database.sql
```

This will show you:
- ✓ What tables exist
- ✓ If PostGIS is installed
- ✗ What's missing

## Step 2: Connect to Database

```bash
psql "YOUR_RAILWAY_CONNECTION_STRING"
```

You should see a prompt like:
```
railway=>
```

## Step 3: Enable PostGIS (If Not Already)

```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

Expected output:
```
CREATE EXTENSION
```

Or if already installed:
```
NOTICE: extension "postgis" already exists, skipping
CREATE EXTENSION
```

## Step 4: Run Migration 001 (Initial Schema)

Copy and paste the **entire contents** of `backend/migrations/001_initial_schema.sql`:

**Important**: Make sure you're copying from the correct file. Let me show you what should be in it:

```sql
-- Should start with:
-- CarCalendar Database Schema
-- Version: 1.0.0

-- And create these tables:
-- 1. users
-- 2. locations  
-- 3. events
-- 4. rsvps
-- 5. follows
-- 6. notifications
```

After running, you should see output like:
```
CREATE TABLE
CREATE TABLE
CREATE TABLE
...
CREATE INDEX
CREATE INDEX
```

## Step 5: Verify Migration 001 Worked

```sql
\dt
```

You should see:
```
          List of relations
 Schema |      Name       | Type  |  Owner   
--------+-----------------+-------+----------
 public | events          | table | postgres
 public | follows         | table | postgres
 public | locations       | table | postgres
 public | notifications   | table | postgres
 public | rsvps           | table | postgres
 public | users           | table | postgres
```

## Step 6: Run Migration 002 (Triggers)

Copy and paste the **entire contents** of `backend/migrations/002_triggers.sql`

Expected output:
```
CREATE FUNCTION
CREATE TRIGGER
CREATE FUNCTION
CREATE TRIGGER
```

## Step 7: Run Migration 003 (Reputation)

Copy and paste the **entire contents** of `backend/migrations/003_organizer_reputation.sql`

Expected output:
```
ALTER TABLE
CREATE INDEX
```

## Step 8: Verify Everything

```sql
-- Check tables
\dt

-- Check functions
\df

-- Check triggers
SELECT 
    trigger_name, 
    event_object_table 
FROM information_schema.triggers 
WHERE trigger_schema = 'public';

-- Exit
\q
```

## Step 9: Test the Deployment

```bash
node test-deployment.js https://car-show-calendar-production.up.railway.app
```

Expected: All 9 tests should pass ✅

---

## Common Issues

### Issue: "permission denied to create extension"

**Solution**: Your database user doesn't have superuser permissions. 

**Options**:
1. Use a different database (Supabase has PostGIS pre-installed)
2. Contact Railway support to enable PostGIS
3. Use Railway's PostGIS Docker image: `postgis/postgis:16-3.4`

### Issue: "syntax error" when running migrations

**Solution**: 
- Make sure you're copying the ENTIRE file
- Don't copy it line by line
- Use `\i /path/to/file.sql` instead of copy-paste

### Issue: Some tables exist but not all

**Solution**: 
```sql
-- Drop all tables and start fresh
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS follows CASCADE;
DROP TABLE IF EXISTS rsvps CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS locations CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Then re-run migrations
```

### Issue: "relation does not exist" error persists

**Possible causes**:
1. Migrations ran on wrong database
2. Backend is connected to different database
3. Schema is in different namespace

**Check**:
```sql
-- What database are you in?
SELECT current_database();

-- What schema?
SELECT current_schema();

-- Should be: database=railway, schema=public
```

---

## Alternative: Use the Migration Script

If you have the Railway CLI installed:

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to your project
railway link

# Run migrations
railway run npm run migrate --prefix backend
```

---

## Quick Diagnostic Commands

```sql
-- Do tables exist?
SELECT tablename FROM pg_tables WHERE schemaname = 'public';

-- Is PostGIS installed?
SELECT extname, extversion FROM pg_extension WHERE extname = 'postgis';

-- What's the connection string being used?
-- Check in Railway dashboard -> Backend service -> Variables -> DATABASE_URL
```

---

## After Running Migrations

The test script should show:
```
✅ Health Check
✅ User Registration  
✅ User Login
✅ Create Event
✅ Get Events List
✅ Get Event by ID
✅ RSVP to Event
✅ Verify RSVP Count
✅ Un-RSVP from Event

🎉 All tests passed!
```

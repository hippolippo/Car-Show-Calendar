-- Database Diagnostic Script for CarCalendar
-- Run this with: psql "your-connection-string" -f diagnose-database.sql

\echo '======================================'
\echo 'CarCalendar Database Diagnostics'
\echo '======================================'
\echo ''

-- Check if we're connected
\echo '1. Connection Info:'
\conninfo
\echo ''

-- Check PostGIS extension
\echo '2. PostGIS Extension:'
SELECT 
    extname as extension_name,
    extversion as version,
    CASE 
        WHEN extname = 'postgis' THEN '✓ PostGIS is installed'
        ELSE extname
    END as status
FROM pg_extension 
WHERE extname = 'postgis';
\echo ''

-- List all tables
\echo '3. Tables in Database:'
SELECT 
    schemaname,
    tablename,
    CASE 
        WHEN tablename IN ('users', 'events', 'locations', 'rsvps', 'follows', 'notifications') 
        THEN '✓ CarCalendar table'
        ELSE '  Other table'
    END as status
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;
\echo ''

-- Check for CarCalendar tables specifically
\echo '4. CarCalendar Tables Status:'
SELECT 
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') 
        THEN '✓ users table exists' 
        ELSE '✗ users table MISSING' 
    END as users_table;

SELECT 
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'events') 
        THEN '✓ events table exists' 
        ELSE '✗ events table MISSING' 
    END as events_table;

SELECT 
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'locations') 
        THEN '✓ locations table exists' 
        ELSE '✗ locations table MISSING' 
    END as locations_table;

SELECT 
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'rsvps') 
        THEN '✓ rsvps table exists' 
        ELSE '✗ rsvps table MISSING' 
    END as rsvps_table;

SELECT 
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'follows') 
        THEN '✓ follows table exists' 
        ELSE '✗ follows table MISSING' 
    END as follows_table;

SELECT 
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications') 
        THEN '✓ notifications table exists' 
        ELSE '✗ notifications table MISSING' 
    END as notifications_table;
\echo ''

-- Check database schema
\echo '5. Database Schema:'
\dt
\echo ''

-- Check if PostGIS geometry columns exist
\echo '6. PostGIS Geometry Columns (should have locations.coordinates):'
SELECT 
    f_table_name as table_name,
    f_geometry_column as geometry_column,
    type as geometry_type,
    srid
FROM geometry_columns
WHERE f_table_name = 'locations';
\echo ''

-- Summary
\echo '======================================'
\echo 'Diagnostic Complete'
\echo '======================================'
\echo ''
\echo 'Expected Tables: users, events, locations, rsvps, follows, notifications'
\echo 'Expected Extension: postgis'
\echo ''
\echo 'If tables are MISSING, migrations have not run successfully.'
\echo 'Check the migration files in backend/migrations/ and run them again.'
\echo ''

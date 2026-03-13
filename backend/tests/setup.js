// T036: Test database setup utility
import pool from '../src/config/database.js';
import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Setup test database before each test suite
export async function setupTestDatabase() {
  try {
    // Clean first to ensure fresh state
    await pool.query('DROP SCHEMA IF EXISTS public CASCADE');
    await pool.query('CREATE SCHEMA public');
    await pool.query('GRANT ALL ON SCHEMA public TO public');
    
    // Run migrations
    const migrations = [
      '001_initial_schema.sql',
      '002_triggers.sql',
      '003_organizer_reputation.sql'
    ];
    
    for (const migration of migrations) {
      const sql = await readFile(
        join(__dirname, '../migrations', migration),
        'utf-8'
      );
      await pool.query(sql);
    }
    
    console.log('✓ Test database setup complete');
  } catch (error) {
    console.error('✗ Test database setup failed:', error);
    throw error;
  }
}

// Clean up test database after each test suite
export async function cleanupTestDatabase() {
  try {
    await pool.query('DROP SCHEMA public CASCADE');
    await pool.query('CREATE SCHEMA public');
    await pool.query('GRANT ALL ON SCHEMA public TO public');
    console.log('✓ Test database cleaned');
  } catch (error) {
    console.error('✗ Test database cleanup failed:', error);
  }
}

// Close pool after all tests
export async function closeDatabase() {
  await pool.end();
}

// T017: Migration framework configuration
import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readdir } from 'fs/promises';

dotenv.config();

const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://caruser:carpass123@localhost:5432/car_calendar'
});

export async function getMigrations() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const migrationsDir = __dirname;
  
  const files = await readdir(migrationsDir);
  return files
    .filter(f => f.endsWith('.sql'))
    .sort()
    .map(f => join(migrationsDir, f));
}

export async function ensureMigrationsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS migrations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) UNIQUE NOT NULL,
      executed_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);
}

export async function getExecutedMigrations() {
  const result = await pool.query('SELECT name FROM migrations ORDER BY id');
  return result.rows.map(row => row.name);
}

export async function recordMigration(name) {
  await pool.query('INSERT INTO migrations (name) VALUES ($1)', [name]);
}

export async function removeMigration(name) {
  await pool.query('DELETE FROM migrations WHERE name = $1', [name]);
}

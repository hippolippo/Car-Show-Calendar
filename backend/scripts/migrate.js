// T021: Migration script to run database migrations
import { readFile } from 'fs/promises';
import { basename } from 'path';
import { 
  pool, 
  getMigrations, 
  ensureMigrationsTable, 
  getExecutedMigrations, 
  recordMigration 
} from '../migrations/config.js';

async function runMigrations() {
  try {
    console.log('Starting database migrations...');
    
    // Ensure migrations table exists
    await ensureMigrationsTable();
    console.log('✓ Migrations table ready');
    
    // Get all migration files
    const migrationFiles = await getMigrations();
    console.log(`Found ${migrationFiles.length} migration files`);
    
    // Get already executed migrations
    const executedMigrations = await getExecutedMigrations();
    console.log(`${executedMigrations.length} migrations already executed`);
    
    // Execute pending migrations
    let executed = 0;
    for (const file of migrationFiles) {
      const name = basename(file);
      
      if (executedMigrations.includes(name)) {
        console.log(`⊘ Skipping ${name} (already executed)`);
        continue;
      }
      
      console.log(`→ Executing ${name}...`);
      const sql = await readFile(file, 'utf-8');
      
      try {
        await pool.query(sql);
        await recordMigration(name);
        console.log(`✓ Completed ${name}`);
        executed++;
      } catch (error) {
        console.error(`✗ Failed ${name}:`, error.message);
        throw error;
      }
    }
    
    if (executed === 0) {
      console.log('\n✓ Database is up to date (no new migrations)');
    } else {
      console.log(`\n✓ Successfully executed ${executed} migrations`);
    }
    
  } catch (error) {
    console.error('\n✗ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigrations();

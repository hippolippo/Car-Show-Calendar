// T028: Server entry point
import app from './app.js';
import { testConnection } from './config/database.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 3000;

// Test database connection before starting server
async function startServer() {
  const dbConnected = await testConnection();
  
  if (!dbConnected) {
    console.error('Failed to connect to database. Please check your DATABASE_URL configuration.');
    console.error('See backend/SETUP_NOTES.md for database setup instructions.');
    // In development, we can continue without DB for initial setup
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
  
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚗 CarCalendar API Server`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log(`\nPress Ctrl+C to stop\n`);
  });
}

startServer();

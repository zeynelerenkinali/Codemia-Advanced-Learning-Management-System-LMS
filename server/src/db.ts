import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

/**
 * PATTERN: SINGLETON
 * Ensures only one connection pool instance is created for the application.
 */
class Database {
  private static instance: Pool;

  private constructor() {}

  public static getInstance(): Pool {
    if (!Database.instance) {
      Database.instance = new Pool({
        user: process.env.DB_USER || 'postgres',
        host: process.env.DB_HOST || 'localhost',
        database: process.env.DB_NAME || 'codemia_db',
        password: process.env.DB_PASSWORD || 'password',
        port: parseInt(process.env.DB_PORT || '5432'),
      });

      // Test connection
      Database.instance.query('SELECT NOW()', (err, res) => {
        if (err) {
            console.error('❌ Database connection error:', err);
        } else {
            console.log('🔌 Connected to PostgreSQL Database at', res.rows[0].now);
        }
      });
    }
    return Database.instance;
  }
}

export const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "your_db",
  password: "your_password",
  port: 5432,
});

export const db = Database.getInstance();
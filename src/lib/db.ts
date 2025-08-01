
// src/lib/db.ts
import mysql from 'mysql2/promise';

// This is a placeholder for your database configuration.
// In a real application, you should use environment variables
// to store sensitive information like database credentials.
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'luxeliquor',
};

// Create a connection pool. This is more efficient than creating a new
// connection for every query.
// It's wrapped in a try-catch to handle cases where the db isn't available.
let pool: mysql.Pool | null = null;
try {
  pool = mysql.createPool(dbConfig);
} catch (error) {
    console.warn("Could not connect to database. Continuing in mock mode.", error);
}


// The query function executes a SQL query and returns the result.
// It's a generic function that can be used for any query.
export async function query(sql: string, params: any[] = []) {
  if (!pool) {
      console.warn(`Database not available. Returning empty mock data for query: ${sql}`);
      return [];
  }

  let connection;
  try {
    connection = await pool.getConnection();
    const [results] = await connection.execute(sql, params);
    return results;
  } catch (error) {
    console.error('Database query failed:', error);
    // In a real application, you might want to handle different
    // types of errors in different ways.
    throw new Error('Failed to execute database query.');
  } finally {
    // Ensure the connection is always released back to the pool.
    if (connection) {
      connection.release();
    }
  }
}

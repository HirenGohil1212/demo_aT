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
const pool = mysql.createPool(dbConfig);

// The query function executes a SQL query and returns the result.
// It's a generic function that can be used for any query.
export async function query(sql: string, params: any[] = []) {
  const connection = await pool.getConnection();
  try {
    const [results] = await connection.execute(sql, params);
    return results;
  } catch (error) {
    console.error('Database query failed:', error);
    // In a real application, you might want to handle different
    // types of errors in different ways.
    throw new Error('Failed to execute database query.');
  } finally {
    // Ensure the connection is always released back to the pool.
    connection.release();
  }
}

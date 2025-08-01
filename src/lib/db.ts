
// src/lib/db.ts
import mysql from 'mysql2/promise';

// Database configuration.
// It is strongly recommended to use environment variables for these values.
const dbConfig = {
  host: process.env.DB_HOST || 'sql.freedb.tech',
  user: process.env.DB_USER || 'freedb_Hiren_123',
  password: process.env.DB_PASSWORD || 'fC3!7bEa8s@wN*d',
  database: process.env.DB_NAME || 'freedb_SGP-1',
};

// Create a connection pool. This is more efficient than creating a new
// connection for every query.
let pool: mysql.Pool | null = null;

try {
  pool = mysql.createPool(dbConfig);
  console.log("Database connection pool created successfully.");
} catch (error) {
    console.error("CRITICAL: Could not create database pool.", error);
}


// The query function executes a SQL query and returns the result.
// It's a generic function that can be used for any query.
export async function query(sql: string, params: any[] = []) {
  if (!pool) {
      console.error("Database pool is not available. Cannot execute query.");
      throw new Error("Database connection is not configured.");
  }

  let connection;
  try {
    connection = await pool.getConnection();
    const [results] = await connection.execute(sql, params);
    return results;
  } catch (error: any) {
    // This is the new, more detailed logging.
    console.error('DATABASE_QUERY_FAILED:', error);
    console.error('Error Code:', error.code);
    console.error('Error No:', error.errno);
    console.error('SQL State:', error.sqlState);
    console.error('Failing Query:', sql);
    console.error('Query Params:', params);

    // Re-throw the error to be caught by the API route.
    throw new Error('Failed to execute database query.');
  } finally {
    // Ensure the connection is always released back to the pool.
    if (connection) {
      connection.release();
    }
  }
}

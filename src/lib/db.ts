
// src/lib/db.ts
import mysql from 'mysql2/promise';

// Database configuration.
// It is strongly recommended to use environment variables for these values.
const dbConfig = {
  host: process.env.DB_HOST || 'srv1835.hstgr.io',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
  user: process.env.DB_USER || 'u782359236_Hiren',
  password: process.env.DB_PASSWORD || 'Hiren@amtics@017',
  database: process.env.DB_NAME || 'u782359236_demo',
};

// Create a connection pool. This is more efficient than creating a new
// connection for every query.
let pool: mysql.Pool | null = null;

function getPool() {
    if (!pool) {
        try {
            pool = mysql.createPool(dbConfig);
            console.log("Database connection pool created successfully.");
        } catch (error) {
            console.error("CRITICAL: Could not create database pool.", error);
            // In case of a catastrophic error, we ensure the pool remains null.
            pool = null; 
        }
    }
    return pool;
}


// The query function executes a SQL query and returns the result.
// It's a generic function that can be used for any query.
export async function query(sql: string, params: any[] = []) {
  const currentPool = getPool();
  if (!currentPool) {
      console.error("Database pool is not available. Cannot execute query.");
      throw new Error("Database connection is not configured.");
  }

  let connection;
  try {
    connection = await currentPool.getConnection();
    const [results] = await connection.execute(sql, params);
    return results;
  } catch (error: any) {
    // This is the new, more detailed logging.
    console.error('DATABASE_QUERY_FAILED:', {
        message: error.message,
        code: error.code,
        errno: error.errno,
        sqlState: error.sqlState,
        failingQuery: sql,
        queryParams: params,
    });

    // Re-throw the error to be caught by the API route.
    throw error;
  } finally {
    // Ensure the connection is always released back to the pool.
    if (connection) {
      connection.release();
    }
  }
}

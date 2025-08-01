
// src/lib/db.ts
import mysql from 'mysql2/promise';

// Database configuration.
// It is strongly recommended to use environment variables for these values.
const dbConfig = {
  host: process.env.DB_HOST || '193.203.184.229',
  user: process.env.DB_USER || 'u782359236_Hiren',
  password: process.env.DB_PASSWORD || 'Hiren@amtics@017',
  database: process.env.DB_NAME || 'u782359236_demo',
  // port: 3306 // The default MySQL port
};

// Create a connection pool. This is more efficient than creating a new
// connection for every query.
let pool: mysql.Pool | null = null;

function getPool() {
    if (!pool) {
        try {
            pool = mysql.createPool(dbConfig);
            // console.log("Database connection pool created successfully.");
        } catch (error) {
            console.error("CRITICAL: Could not create database pool.", error);
            // In case of a catastrophic error, we ensure the pool remains null.
            pool = null; 
        }
    }
    return pool;
}

// THIS IS A TEMPORARY CONNECTION TEST.
// IT WILL BE REPLACED ONCE THE CONNECTION IS VERIFIED.
export async function testConnection() {
    const currentPool = getPool();
    if (!currentPool) {
        const errorMessage = "Database pool is not available. Cannot execute query.";
        console.error(errorMessage);
        throw new Error(errorMessage);
    }
    
    let connection;
    try {
        // console.log("Attempting to connect to the database...");
        connection = await currentPool.getConnection();
        // If we get here, the connection was successful.
        // console.log("Database connection successful!");
        return { success: true, message: "Database connection successful!" };
    } catch (error: any) {
        // This will log the specific MySQL error to the console.
        console.error('DATABASE_CONNECTION_FAILED:', error);
        throw error; // Re-throw to be caught by the API route.
    } finally {
        if (connection) {
            // console.log("Closing database connection.");
            connection.release();
        }
    }
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
    console.error('DATABASE_QUERY_FAILED:', error);

    // Re-throw the error to be caught by the server action.
    throw error;
  } finally {
    // Ensure the connection is always released back to the pool.
    if (connection) {
      connection.release();
    }
  }
}



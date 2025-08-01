
// src/lib/db.ts
import mysql from 'mysql2/promise';

// Database configuration for the remote Hostinger server.
const dbConfig = {
  host: process.env.DB_HOST || 'srv1835.hstgr.io',
  user: process.env.DB_USER || 'u782359236_jay',
  password: process.env.DB_PASSWORD || 'Jay@998877',
  database: process.env.DB_NAME || 'u782359236_jay',
  port: 3306,
  ssl: {
    // Hostinger may require SSL, but we will not enforce rejection of unauthorized connections.
    // This is often necessary for shared hosting environments.
    rejectUnauthorized: false 
  }
};

// Create a connection pool. This is more efficient than creating a new
// connection for every query.
let pool: mysql.Pool | null = null;

function getPool() {
    if (!pool) {
        try {
            pool = mysql.createPool(dbConfig);
        } catch (error) {
            console.error("CRITICAL: Could not create database pool.", error);
            pool = null; 
        }
    }
    return pool;
}

// A dedicated function to test the database connection.
export async function testConnection() {
    const currentPool = getPool();
    if (!currentPool) {
        const errorMessage = "Database pool is not available. Check configuration.";
        console.error(errorMessage);
        throw new Error(errorMessage);
    }
    
    let connection;
    try {
        connection = await currentPool.getConnection();
        await connection.ping();
        return { success: true, message: "Database connection successful!" };
    } catch (error: any) {
        console.error('DATABASE_CONNECTION_FAILED:', error);
        throw error;
    } finally {
        if (connection) {
            connection.release();
        }
    }
}


// The query function executes a SQL query and returns the result.
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
    console.error('DATABASE_QUERY_FAILED:', error);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

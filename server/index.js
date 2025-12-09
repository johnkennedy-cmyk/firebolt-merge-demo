/**
 * Firebolt Cloud API Server
 * 
 * Backend server using the official Firebolt Node.js SDK
 * for secure authentication and query execution.
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Firebolt } from 'firebolt-sdk';

dotenv.config();

const app = express();
const PORT = process.env.API_PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Firebolt Cloud configuration
const FIREBOLT_CONFIG = {
  account: process.env.FIREBOLT_ACCOUNT || 'se-demo-account',
  clientId: process.env.FIREBOLT_CLIENT_ID,
  clientSecret: process.env.FIREBOLT_CLIENT_SECRET,
  database: process.env.FIREBOLT_DATABASE || 'experimental_john',
  engineName: process.env.FIREBOLT_ENGINE || 'ecommerceengine',
};

// Firebolt connection
let firebolt = null;
let connection = null;

/**
 * Initialize Firebolt connection
 */
async function getConnection() {
  if (connection) {
    return connection;
  }

  console.log('🔐 Connecting to Firebolt Cloud...');

  firebolt = Firebolt({
    apiEndpoint: 'api.app.firebolt.io',
  });

  connection = await firebolt.connect({
    auth: {
      client_id: FIREBOLT_CONFIG.clientId,
      client_secret: FIREBOLT_CONFIG.clientSecret,
    },
    account: FIREBOLT_CONFIG.account,
    database: FIREBOLT_CONFIG.database,
    engineName: FIREBOLT_CONFIG.engineName,
  });

  console.log('✅ Connected to Firebolt Cloud');
  return connection;
}

/**
 * Execute a SQL query
 */
async function executeQuery(sql) {
  const conn = await getConnection();
  const statement = await conn.execute(sql);
  const { data, meta, statistics } = await statement.fetchResult();
  return { data, meta, statistics };
}

// ============================================================================
// API Routes
// ============================================================================

/**
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    config: {
      account: FIREBOLT_CONFIG.account,
      database: FIREBOLT_CONFIG.database,
      engine: FIREBOLT_CONFIG.engineName,
      hasCredentials: !!(FIREBOLT_CONFIG.clientId && FIREBOLT_CONFIG.clientSecret)
    }
  });
});

/**
 * Test connection endpoint
 */
app.post('/api/connect', async (req, res) => {
  try {
    await getConnection();
    
    res.json({
      success: true,
      message: 'Connected to Firebolt Cloud',
      account: FIREBOLT_CONFIG.account,
      database: FIREBOLT_CONFIG.database,
      engine: FIREBOLT_CONFIG.engineName,
    });
  } catch (error) {
    console.error('Connection error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Execute query endpoint
 */
app.post('/api/query', async (req, res) => {
  const { sql } = req.body;
  
  if (!sql) {
    return res.status(400).json({ error: 'SQL query is required' });
  }

  const startTime = Date.now();

  try {
    const result = await executeQuery(sql);
    const executionTime = Date.now() - startTime;

    // Convert data to array of objects
    const columns = result.meta?.map(m => m.name) || [];
    const rows = result.data || [];
    
    // Format as array of objects for easier consumption
    const formattedData = rows.map(row => {
      const obj = {};
      columns.forEach((col, i) => {
        obj[col] = row[i];
      });
      return obj;
    });

    res.json({
      success: true,
      data: formattedData,
      meta: result.meta,
      statistics: {
        execution_time_ms: executionTime,
        rows_read: result.statistics?.rowsRead || rows.length,
        bytes_read: result.statistics?.bytesRead || 0,
      }
    });
  } catch (error) {
    console.error('Query error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get database status (table counts)
 */
app.get('/api/status', async (req, res) => {
  try {
    const tables = ['ad_performance', 'attribution_updates', 'detected_fraud'];
    const counts = {};

    for (const table of tables) {
      try {
        const result = await executeQuery(`SELECT COUNT(*) as count FROM ${table}`);
        counts[table] = result.data?.[0]?.[0] || 0;
      } catch {
        counts[table] = 0; // Table doesn't exist
      }
    }

    res.json({
      success: true,
      database: FIREBOLT_CONFIG.database,
      tables: counts
    });
  } catch (error) {
    console.error('Status error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`
🔥 Firebolt Cloud API Server
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📡 Server running on http://localhost:${PORT}
🏢 Account: ${FIREBOLT_CONFIG.account}
💾 Database: ${FIREBOLT_CONFIG.database}
🚀 Engine: ${FIREBOLT_CONFIG.engineName}
🔐 Credentials: ${FIREBOLT_CONFIG.clientId ? 'Configured' : '⚠️ Missing - set FIREBOLT_CLIENT_ID and FIREBOLT_CLIENT_SECRET'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
});

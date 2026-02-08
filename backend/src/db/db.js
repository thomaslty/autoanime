const { Pool } = require('pg');
const { drizzle } = require('drizzle-orm/node-postgres');
const schema = require('./schema');
const { logger } = require('../utils/logger');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const db = drizzle(pool, { schema });

const testConnection = async () => {
  try {
    const client = await pool.connect();
    client.release();
    return true;
  } catch (error) {
    logger.error({ error: error.message }, 'Database connection error');
    return false;
  }
};

module.exports = {
  pool,
  db,
  testConnection
};

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function check() {
  try {
    const client = await pool.connect();
    
    // Check tables
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    
    console.log('Tables in database:');
    tables.rows.forEach(r => console.log('  -', r.table_name));
    
    // Check applied migrations
    const migrations = await client.query(`
      SELECT hash, created_at 
      FROM drizzle_migrations 
      ORDER BY created_at
    `);
    
    console.log('\nApplied migrations:');
    migrations.rows.forEach(r => console.log('  -', r.hash, r.created_at));
    
    client.release();
    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
    await pool.end();
  }
}

check();

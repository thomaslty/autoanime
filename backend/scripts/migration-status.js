#!/usr/bin/env node

/**
 * Database Migration Status Checker
 * Shows current migration status without applying migrations
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
};

async function getConnectionInfo() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    log.error('DATABASE_URL environment variable is not set!');
    return null;
  }

  // Parse connection info for logging (hide password)
  const urlMatch = dbUrl.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
  if (urlMatch) {
    const [, user, pass, host, port, database] = urlMatch;
    return { user, host, port, database, url: dbUrl };
  }
  return { url: dbUrl };
}

async function checkConnection() {
  const info = await getConnectionInfo();
  if (!info) return false;

  log.info(`Checking connection to: ${info.database} on ${info.host}:${info.port}`);

  const pool = new Pool({
    connectionString: info.url,
    ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false
  });

  try {
    const client = await pool.connect();
    const result = await client.query('SELECT version(), current_database() as db_name');
    log.success(`Connected! PostgreSQL version: ${result.rows[0].version.split(' ')[0]}`);
    client.release();
    await pool.end();
    return true;
  } catch (error) {
    log.error(`Connection failed: ${error.message}`);
    return false;
  }
}

function loadMigrationJournal() {
  const journalPath = path.join(__dirname, '..', 'drizzle', 'meta', '_journal.json');
  try {
    const journal = JSON.parse(fs.readFileSync(journalPath, 'utf8'));
    return journal.entries || [];
  } catch (error) {
    log.error(`Failed to load migration journal: ${error.message}`);
    return [];
  }
}

function listMigrationFiles() {
  const drizzleDir = path.join(__dirname, '..', 'drizzle');
  try {
    return fs.readdirSync(drizzleDir).filter(f => f.endsWith('.sql')).sort();
  } catch (error) {
    return [];
  }
}

async function getAppliedMigrations() {
  const info = await getConnectionInfo();
  if (!info) return [];

  const pool = new Pool({
    connectionString: info.url,
    ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false
  });

  try {
    // Drizzle ORM stores migrations in drizzle.__drizzle_migrations, not public.drizzle_migrations
    const checkTable = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'drizzle' 
        AND table_name = '__drizzle_migrations'
      )
    `);

    if (!checkTable.rows[0].exists) {
      await pool.end();
      return [];
    }

    const result = await pool.query('SELECT hash, created_at FROM drizzle.__drizzle_migrations ORDER BY created_at');
    await pool.end();
    return result.rows;
  } catch (error) {
    await pool.end();
    return [];
  }
}

async function listTables() {
  const info = await getConnectionInfo();
  if (!info) return [];

  const pool = new Pool({
    connectionString: info.url,
    ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false
  });

  try {
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    await pool.end();
    return result.rows.map(r => r.table_name);
  } catch (error) {
    await pool.end();
    return [];
  }
}

async function main() {
  console.log(`\n${colors.bright}${colors.cyan}Database Migration Status${colors.reset}\n`);

  // Check connection
  const connected = await checkConnection();
  if (!connected) {
    console.log('\n' + colors.yellow + 'Cannot check migration status without database connection' + colors.reset);
    process.exit(1);
  }

  console.log();

  // Load migration info
  const journal = loadMigrationJournal();
  const sqlFiles = listMigrationFiles();
  const applied = await getAppliedMigrations();
  const tables = await listTables();

  console.log(`${colors.bright}Migration Files:${colors.reset}`);
  sqlFiles.forEach(file => {
    console.log(`  ${colors.dim}${file}${colors.reset}`);
  });

  console.log(`\n${colors.bright}Migration Status:${colors.reset}`);
  if (journal.length === 0) {
    log.warn('No migrations found in journal');
  } else {
    // Drizzle stores SHA-256 hashes of SQL content, not tag names
    // Migrations are applied in order, so we match by index
    journal.forEach((entry, index) => {
      const isApplied = index < applied.length;
      const status = isApplied
        ? `${colors.green}[APPLIED]${colors.reset}`
        : `${colors.yellow}[PENDING]${colors.reset}`;
      const date = new Date(entry.when).toLocaleString();
      console.log(`  ${status} ${entry.tag}`);
      console.log(`      ${colors.dim}Created: ${date}${colors.reset}`);
    });
  }

  console.log(`\n${colors.bright}Applied Migrations in DB:${colors.reset} ${applied.length}/${journal.length}`);

  const pending = journal.length - applied.length;
  const isFullyUpToDate = pending === 0 && journal.length > 0;

  console.log(`\n${colors.bright}Database Tables:${colors.reset}`);
  if (tables.length === 0) {
    log.warn('No tables found - migrations may not have been run');
  } else {
    tables.forEach(table => {
      // Show tables in green when schema is fully up to date, otherwise dim
      const color = isFullyUpToDate ? colors.green : colors.dim;
      console.log(`  ${color}• ${table}${colors.reset}`);
    });
  }

  console.log(`\n${colors.bright}Summary:${colors.reset}`);
  if (pending > 0) {
    log.warn(`${pending} migration(s) pending - run 'npm run db:migrate' to apply`);
  } else if (journal.length > 0) {
    log.success('All migrations are up to date!');
  }

  console.log();
}

main();

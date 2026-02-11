#!/usr/bin/env node

/**
 * Enhanced Database Migration Script with Logging
 * This script runs drizzle-kit migrations with detailed progress logging
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

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
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  step: (num, msg) => console.log(`${colors.cyan}${colors.bright}Step ${num}:${colors.reset} ${msg}`),
  divider: () => console.log(`${colors.dim}${'─'.repeat(60)}${colors.reset}`),
};

async function checkDatabaseConnection() {
  log.step(1, 'Checking database connection...');
  
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    log.error('DATABASE_URL environment variable is not set!');
    process.exit(1);
  }

  // Parse connection info for logging (hide password)
  const urlMatch = dbUrl.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
  if (urlMatch) {
    const [, user, pass, host, port, database] = urlMatch;
    log.info(`Database: ${database} on ${host}:${port} (user: ${user})`);
  }

  const pool = new Pool({
    connectionString: dbUrl,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    const client = await pool.connect();
    const result = await client.query('SELECT version(), current_database() as db_name, current_user as username');
    const { version, db_name, username } = result.rows[0];
    
    log.success('Database connection successful!');
    log.info(`PostgreSQL version: ${version.split(' ')[0]}`);
    log.info(`Connected to database: ${db_name} as user: ${username}`);
    
    client.release();
    await pool.end();
    return true;
  } catch (error) {
    log.error(`Database connection failed: ${error.message}`);
    if (error.message.includes('ECONNREFUSED')) {
      log.error('Make sure PostgreSQL is running and accessible');
    } else if (error.message.includes('authentication failed')) {
      log.error('Check your database credentials in DATABASE_URL');
    } else if (error.message.includes('does not exist')) {
      log.error('Database does not exist. Please create it first.');
    }
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
    const files = fs.readdirSync(drizzleDir)
      .filter(f => f.endsWith('.sql'))
      .sort();
    return files;
  } catch (error) {
    return [];
  }
}

async function getAppliedMigrations() {
  const dbUrl = process.env.DATABASE_URL;
  const pool = new Pool({
    connectionString: dbUrl,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
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

async function checkMigrationsStatus() {
  log.step(2, 'Checking migrations status...');
  
  const journal = loadMigrationJournal();
  const sqlFiles = listMigrationFiles();
  const applied = await getAppliedMigrations();
  
  log.info(`Found ${sqlFiles.length} migration files in drizzle/`);
  log.info(`${applied.length} migrations already applied`);
  
  if (journal.length > 0) {
    log.info('Migration journal entries:');
    // Drizzle stores SHA-256 hashes of SQL content, not tag names
    // Migrations are applied in order, so we match by index
    journal.forEach((entry, index) => {
      const isApplied = index < applied.length;
      const status = isApplied 
        ? `${colors.green}[APPLIED]${colors.reset}` 
        : `${colors.yellow}[PENDING]${colors.reset}`;
      log.info(`  ${status} ${entry.tag} (${new Date(entry.when).toISOString()})`);
    });
  }
  
  const pendingCount = journal.length - applied.length;
  if (pendingCount > 0) {
    log.warn(`${pendingCount} pending migration(s) to apply`);
  } else {
    log.success('All migrations are up to date!');
  }
  
  return pendingCount;
}

async function runMigrations() {
  log.step(3, 'Running migrations...');
  log.info('Executing drizzle-kit migrate...');
  log.divider();
  
  return new Promise((resolve, reject) => {
    const migrate = spawn('npx', ['drizzle-kit', 'migrate'], {
      cwd: path.join(__dirname, '..'),
      stdio: 'pipe'
    });

    let output = '';
    let errorOutput = '';

    migrate.stdout.on('data', (data) => {
      const lines = data.toString().split('\n');
      lines.forEach(line => {
        if (line.trim()) {
          output += line + '\n';
          if (line.includes('Applying')) {
            log.info(`Applying: ${line.split('Applying')[1].trim()}`);
          } else if (line.includes('Done')) {
            log.success(line);
          } else {
            console.log(`  ${colors.dim}${line}${colors.reset}`);
          }
        }
      });
    });

    migrate.stderr.on('data', (data) => {
      const lines = data.toString().split('\n');
      lines.forEach(line => {
        if (line.trim()) {
          errorOutput += line + '\n';
          console.log(`  ${colors.yellow}${line}${colors.reset}`);
        }
      });
    });

    migrate.on('close', (code) => {
      log.divider();
      if (code === 0) {
        log.success('Migrations completed successfully!');
        resolve();
      } else {
        log.error(`Migration process exited with code ${code}`);
        if (errorOutput.includes('ECONNREFUSED')) {
          log.error('Database connection refused. Is PostgreSQL running?');
        } else if (errorOutput.includes('authentication failed')) {
          log.error('Database authentication failed. Check your credentials.');
        } else if (errorOutput.includes('already exists')) {
          log.warn('Some objects already exist. This might be normal if re-running migrations.');
        }
        reject(new Error(`Migration failed with exit code ${code}`));
      }
    });

    migrate.on('error', (error) => {
      log.error(`Failed to start migration process: ${error.message}`);
      reject(error);
    });
  });
}

async function verifyTables() {
  log.step(4, 'Verifying database tables...');
  
  const dbUrl = process.env.DATABASE_URL;
  const pool = new Pool({
    connectionString: dbUrl,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    
    log.info('Tables in database:');
    result.rows.forEach(row => {
      log.success(`  ✓ ${row.table_name}`);
    });
    
    // Check if settings table exists specifically
    const settingsExists = result.rows.some(r => r.table_name === 'settings');
    if (settingsExists) {
      log.success('Settings table is ready!');
    } else {
      log.error('Settings table not found - migration may have failed');
    }
    
    await pool.end();
  } catch (error) {
    log.error(`Failed to verify tables: ${error.message}`);
    await pool.end();
  }
}

async function main() {
  console.log(`\n${colors.bright}${colors.cyan}╔══════════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}║     AutoAnime Database Migration Tool                    ║${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}╚══════════════════════════════════════════════════════════╝${colors.reset}\n`);

  const startTime = Date.now();

  try {
    // Step 1: Check database connection
    const connected = await checkDatabaseConnection();
    if (!connected) {
      log.error('Cannot proceed without database connection');
      process.exit(1);
    }
    
    log.divider();
    
    // Step 2: Check migrations status
    const pendingCount = await checkMigrationsStatus();
    
    log.divider();
    
    // Step 3: Run migrations if needed
    if (pendingCount > 0) {
      await runMigrations();
    } else {
      log.info('No pending migrations to run');
    }
    
    log.divider();
    
    // Step 4: Verify tables
    await verifyTables();
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    log.divider();
    console.log(`\n${colors.green}${colors.bright}✓ Migration process completed in ${duration}s${colors.reset}\n`);
    
  } catch (error) {
    log.error(`Migration process failed: ${error.message}`);
    process.exit(1);
  }
}

// Run main function
main();

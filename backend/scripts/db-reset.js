#!/usr/bin/env node

/**
 * Database Reset Script
 * Drops all tables and drizzle migration history for a fresh start
 * WARNING: This will destroy all data in the database!
 */

const { Pool } = require('pg');
const readline = require('readline');

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

async function confirm(message) {
    // Skip confirmation if --force flag is passed
    if (process.argv.includes('--force') || process.argv.includes('-f')) {
        return true;
    }

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        rl.question(`${colors.yellow}${message} (yes/no): ${colors.reset}`, (answer) => {
            rl.close();
            resolve(answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y');
        });
    });
}

async function getConnectionInfo() {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
        log.error('DATABASE_URL environment variable is not set!');
        return null;
    }

    const urlMatch = dbUrl.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
    if (urlMatch) {
        const [, user, pass, host, port, database] = urlMatch;
        return { user, host, port, database, url: dbUrl };
    }
    return { url: dbUrl };
}

async function resetDatabase() {
    const info = await getConnectionInfo();
    if (!info) {
        process.exit(1);
    }

    console.log(`\n${colors.bright}${colors.red}╔══════════════════════════════════════════════════════════╗${colors.reset}`);
    console.log(`${colors.bright}${colors.red}║     AutoAnime Database Reset Tool                        ║${colors.reset}`);
    console.log(`${colors.bright}${colors.red}╚══════════════════════════════════════════════════════════╝${colors.reset}\n`);

    log.warn(`This will reset database: ${info.database} on ${info.host}:${info.port}`);
    log.warn('ALL DATA WILL BE PERMANENTLY DELETED!\n');

    const confirmed = await confirm('Are you sure you want to reset the database?');
    if (!confirmed) {
        log.info('Database reset cancelled.');
        process.exit(0);
    }

    console.log();

    const pool = new Pool({
        connectionString: info.url,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    try {
        const client = await pool.connect();
        log.success('Connected to database');

        // Get list of all tables in public schema
        log.info('Finding tables to drop...');
        const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);

        const tables = tablesResult.rows.map(r => r.table_name);

        if (tables.length > 0) {
            log.info(`Found ${tables.length} table(s) to drop:`);
            tables.forEach(t => console.log(`  ${colors.dim}• ${t}${colors.reset}`));
            console.log();

            // Drop all tables in public schema with CASCADE
            log.info('Dropping all tables in public schema...');
            for (const table of tables) {
                await client.query(`DROP TABLE IF EXISTS "public"."${table}" CASCADE`);
                log.success(`Dropped table: ${table}`);
            }
        } else {
            log.info('No tables found in public schema');
        }

        // Drop drizzle schema (contains __drizzle_migrations)
        log.info('Dropping drizzle migration history...');
        await client.query('DROP SCHEMA IF EXISTS drizzle CASCADE');
        log.success('Dropped drizzle schema and migration history');

        // Also drop any sequences that might remain
        log.info('Cleaning up sequences...');
        const seqResult = await client.query(`
      SELECT sequence_name 
      FROM information_schema.sequences 
      WHERE sequence_schema = 'public'
    `);

        for (const seq of seqResult.rows) {
            await client.query(`DROP SEQUENCE IF EXISTS "public"."${seq.sequence_name}" CASCADE`);
        }

        if (seqResult.rows.length > 0) {
            log.success(`Dropped ${seqResult.rows.length} sequence(s)`);
        }

        client.release();
        await pool.end();

        console.log(`\n${colors.green}${colors.bright}✓ Database reset complete!${colors.reset}`);
        log.info('Run "npm run db:migrate" to apply migrations\n');

    } catch (error) {
        log.error(`Database reset failed: ${error.message}`);
        await pool.end();
        process.exit(1);
    }
}

// Run the reset
resetDatabase();

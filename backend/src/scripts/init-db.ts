import fs from 'fs';
import path from 'path';
import { pool, query } from '../config/database';
import { logger } from '../utils/logger';

async function initDB(): Promise<void> {
  logger.info('Starting database initialization...');

  try {
    const schemaPath = path.resolve(__dirname, '../../../database/schema.sql');
    const seedPath = path.resolve(__dirname, '../../../database/seed.sql');

    // logger.info(`Reading schema from ${schemaPath}`);
    // const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    // logger.info('Executing schema.sql...');
    // await query(schemaSql);
    // logger.info('Schema applied successfully.');

    logger.info(`Reading seed from ${seedPath}`);
    const seedSql = fs.readFileSync(seedPath, 'utf8');

    logger.info('Executing seed.sql...');
    await query(seedSql);
    logger.info('Seed applied successfully.');

  } catch (error) {
    logger.error('Init failed', { error: error instanceof Error ? error.message : String(error) });
    process.exit(1);
  } finally {
    await pool.end();
  }
}

initDB();

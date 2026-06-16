import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { pool, query } from '../config/database';
import { logger } from '../utils/logger';

async function initDB(): Promise<void> {
  logger.info('Starting database initialization...');

  try {
    const schemaPath = path.resolve(__dirname, '../../../database/schema.sql');
    const seedPath = path.resolve(__dirname, '../../../database/seed.sql');

    logger.info(`Reading schema from ${schemaPath}`);
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    logger.info('Executing schema.sql...');
    await query(schemaSql);
    logger.info('Schema applied successfully.');

    // Check if seed data has been inserted (by checking if users exist)
    const usersCount = await query('SELECT count(*) FROM users');
    if (parseInt(usersCount.rows[0].count) === 0) {
      logger.info(`Reading seed from ${seedPath}`);
      const seedSql = fs.readFileSync(seedPath, 'utf8');

      logger.info('Executing seed.sql...');
      await query(seedSql);
      logger.info('Seed applied successfully.');
    } else {
      logger.info('Database already seeded, skipping seed.sql execution.');
      
      // Ensure admin user exists with password admin123
      const adminCheck = await query("SELECT id FROM users WHERE email = 'admin@harshithram.com'");
      if (adminCheck.rows.length === 0) {
        logger.info('Admin user missing, creating admin@harshithram.com');
        const hash = await bcrypt.hash('admin123', 12);
        await query(
          `INSERT INTO users (email, password_hash, first_name, last_name, phone, role, is_active, is_verified) 
           VALUES ($1, $2, $3, $4, $5, $6, true, true)`,
          ['admin@harshithram.com', hash, 'Admin', 'User', '+91-9000000000', 'admin']
        );
      } else {
        logger.info('Updating admin@harshithram.com password to admin123 just in case');
        const hash = await bcrypt.hash('admin123', 12);
        await query("UPDATE users SET password_hash = $1 WHERE email = 'admin@harshithram.com'", [hash]);
      }
    }

  } catch (error) {
    logger.error('Init failed', { error: error instanceof Error ? error.message : String(error) });
    process.exit(1);
  } finally {
    await pool.end();
  }
}

initDB();

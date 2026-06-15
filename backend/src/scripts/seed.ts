import bcrypt from 'bcryptjs';
import { pool, query } from '../config/database';
import { logger } from '../utils/logger';

const DEFAULT_PASSWORD = 'BuildMaster@123';
const SALT_ROUNDS = 12;

const SEED_USERS = [
  { email: 'admin@buildmaster.com', first_name: 'Super', last_name: 'Admin', phone: '+91-9000000001', role: 'super_admin', branch_id: 'a1000000-0000-0000-0000-000000000001' },
  { email: 'pm@buildmaster.com', first_name: 'Rajesh', last_name: 'Kumar', phone: '+91-9000000002', role: 'project_manager', branch_id: 'a1000000-0000-0000-0000-000000000001' },
  { email: 'material@buildmaster.com', first_name: 'Priya', last_name: 'Sharma', phone: '+91-9000000003', role: 'material_manager', branch_id: 'a1000000-0000-0000-0000-000000000001' },
  { email: 'supplier@buildmaster.com', first_name: 'Amit', last_name: 'Patel', phone: '+91-9000000004', role: 'supplier', branch_id: null },
  { email: 'customer@buildmaster.com', first_name: 'Vikram', last_name: 'Singh', phone: '+91-9000000005', role: 'customer', branch_id: null },
];

async function seedUsers(): Promise<void> {
  logger.info('Starting user password seed...');

  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, SALT_ROUNDS);

  for (const user of SEED_USERS) {
    const existing = await query('SELECT id FROM users WHERE email = $1', [user.email]);

    if (existing.rows.length > 0) {
      await query(
        'UPDATE users SET password_hash = $1, is_verified = true, is_active = true WHERE email = $2',
        [passwordHash, user.email]
      );
      logger.info(`Updated password for ${user.email}`);
    } else {
      await query(
        `INSERT INTO users (email, password_hash, first_name, last_name, phone, role, branch_id, is_verified, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, true, true)`,
        [user.email, passwordHash, user.first_name, user.last_name, user.phone, user.role, user.branch_id]
      );
      logger.info(`Created user ${user.email}`);
    }
  }

  logger.info('Seed completed successfully');
  logger.info(`Default password for all seed users: ${DEFAULT_PASSWORD}`);
}

seedUsers()
  .catch((error) => {
    logger.error('Seed failed', { error: error instanceof Error ? error.message : String(error) });
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
  });

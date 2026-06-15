"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const database_1 = require("../config/database");
const logger_1 = require("../utils/logger");
const DEFAULT_PASSWORD = 'BuildMaster@123';
const SALT_ROUNDS = 12;
const SEED_USERS = [
    { email: 'admin@buildmaster.com', first_name: 'Super', last_name: 'Admin', phone: '+91-9000000001', role: 'super_admin', branch_id: 'a1000000-0000-0000-0000-000000000001' },
    { email: 'pm@buildmaster.com', first_name: 'Rajesh', last_name: 'Kumar', phone: '+91-9000000002', role: 'project_manager', branch_id: 'a1000000-0000-0000-0000-000000000001' },
    { email: 'material@buildmaster.com', first_name: 'Priya', last_name: 'Sharma', phone: '+91-9000000003', role: 'material_manager', branch_id: 'a1000000-0000-0000-0000-000000000001' },
    { email: 'supplier@buildmaster.com', first_name: 'Amit', last_name: 'Patel', phone: '+91-9000000004', role: 'supplier', branch_id: null },
    { email: 'customer@buildmaster.com', first_name: 'Vikram', last_name: 'Singh', phone: '+91-9000000005', role: 'customer', branch_id: null },
];
async function seedUsers() {
    logger_1.logger.info('Starting user password seed...');
    const passwordHash = await bcryptjs_1.default.hash(DEFAULT_PASSWORD, SALT_ROUNDS);
    for (const user of SEED_USERS) {
        const existing = await (0, database_1.query)('SELECT id FROM users WHERE email = $1', [user.email]);
        if (existing.rows.length > 0) {
            await (0, database_1.query)('UPDATE users SET password_hash = $1, is_verified = true, is_active = true WHERE email = $2', [passwordHash, user.email]);
            logger_1.logger.info(`Updated password for ${user.email}`);
        }
        else {
            await (0, database_1.query)(`INSERT INTO users (email, password_hash, first_name, last_name, phone, role, branch_id, is_verified, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, true, true)`, [user.email, passwordHash, user.first_name, user.last_name, user.phone, user.role, user.branch_id]);
            logger_1.logger.info(`Created user ${user.email}`);
        }
    }
    logger_1.logger.info('Seed completed successfully');
    logger_1.logger.info(`Default password for all seed users: ${DEFAULT_PASSWORD}`);
}
seedUsers()
    .catch((error) => {
    logger_1.logger.error('Seed failed', { error: error instanceof Error ? error.message : String(error) });
    process.exit(1);
})
    .finally(async () => {
    await database_1.pool.end();
});
//# sourceMappingURL=seed.js.map
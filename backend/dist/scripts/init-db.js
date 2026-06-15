"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const database_1 = require("../config/database");
const logger_1 = require("../utils/logger");
async function initDB() {
    logger_1.logger.info('Starting database initialization...');
    try {
        const schemaPath = path_1.default.resolve(__dirname, '../../../database/schema.sql');
        const seedPath = path_1.default.resolve(__dirname, '../../../database/seed.sql');
        // logger.info(`Reading schema from ${schemaPath}`);
        // const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        // logger.info('Executing schema.sql...');
        // await query(schemaSql);
        // logger.info('Schema applied successfully.');
        logger_1.logger.info(`Reading seed from ${seedPath}`);
        const seedSql = fs_1.default.readFileSync(seedPath, 'utf8');
        logger_1.logger.info('Executing seed.sql...');
        await (0, database_1.query)(seedSql);
        logger_1.logger.info('Seed applied successfully.');
    }
    catch (error) {
        logger_1.logger.error('Init failed', { error: error instanceof Error ? error.message : String(error) });
        process.exit(1);
    }
    finally {
        await database_1.pool.end();
    }
}
initDB();
//# sourceMappingURL=init-db.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
exports.query = query;
exports.getClient = getClient;
exports.withTransaction = withTransaction;
exports.testConnection = testConnection;
const pg_1 = require("pg");
const env_1 = require("./env");
const logger_1 = require("../utils/logger");
const poolConfig = env_1.env.database.url
    ? { connectionString: env_1.env.database.url }
    : {
        host: env_1.env.database.host,
        port: env_1.env.database.port,
        database: env_1.env.database.name,
        user: env_1.env.database.user,
        password: env_1.env.database.password,
    };
exports.pool = new pg_1.Pool({
    ...poolConfig,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
});
exports.pool.on('connect', () => {
    logger_1.logger.debug('New database client connected');
});
exports.pool.on('error', (err) => {
    logger_1.logger.error('Unexpected database pool error', { error: err.message });
});
async function query(text, params) {
    const start = Date.now();
    try {
        const result = await exports.pool.query(text, params);
        const duration = Date.now() - start;
        if (duration > 1000) {
            logger_1.logger.warn('Slow query detected', { duration, query: text.substring(0, 100) });
        }
        return result;
    }
    catch (error) {
        logger_1.logger.error('Database query error', {
            query: text.substring(0, 200),
            error: error instanceof Error ? error.message : String(error),
        });
        throw error;
    }
}
async function getClient() {
    return exports.pool.connect();
}
async function withTransaction(callback) {
    const client = await getClient();
    try {
        await client.query('BEGIN');
        const result = await callback(client);
        await client.query('COMMIT');
        return result;
    }
    catch (error) {
        await client.query('ROLLBACK');
        throw error;
    }
    finally {
        client.release();
    }
}
async function testConnection() {
    try {
        await query('SELECT NOW()');
        logger_1.logger.info('Database connection established');
        return true;
    }
    catch (error) {
        logger_1.logger.error('Database connection failed', {
            error: error instanceof Error ? error.message : String(error),
        });
        return false;
    }
}
//# sourceMappingURL=database.js.map
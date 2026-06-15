"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const env_1 = require("./config/env");
const database_1 = require("./config/database");
const logger_1 = require("./utils/logger");
async function startServer() {
    const dbConnected = await (0, database_1.testConnection)();
    if (!dbConnected) {
        logger_1.logger.warn('Starting server without database connection');
    }
    const server = app_1.default.listen(env_1.env.port, () => {
        logger_1.logger.info(`BuildMaster ERP API running on port ${env_1.env.port}`, {
            environment: env_1.env.nodeEnv,
            port: env_1.env.port,
        });
    });
    const shutdown = async (signal) => {
        logger_1.logger.info(`${signal} received. Shutting down gracefully...`);
        server.close(async () => {
            await database_1.pool.end();
            logger_1.logger.info('Server closed');
            process.exit(0);
        });
    };
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
}
startServer().catch((error) => {
    logger_1.logger.error('Failed to start server', {
        error: error instanceof Error ? error.message : String(error),
    });
    process.exit(1);
});
//# sourceMappingURL=index.js.map
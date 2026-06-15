import app from './app';
import { env } from './config/env';
import { testConnection, pool } from './config/database';
import { logger } from './utils/logger';

async function startServer(): Promise<void> {
  const dbConnected = await testConnection();
  if (!dbConnected) {
    logger.warn('Starting server without database connection');
  }

  const server = app.listen(env.port, () => {
    logger.info(`BuildMaster ERP API running on port ${env.port}`, {
      environment: env.nodeEnv,
      port: env.port,
    });
  });

  const shutdown = async (signal: string) => {
    logger.info(`${signal} received. Shutting down gracefully...`);
    server.close(async () => {
      await pool.end();
      logger.info('Server closed');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

startServer().catch((error) => {
  logger.error('Failed to start server', {
    error: error instanceof Error ? error.message : String(error),
  });
  process.exit(1);
});

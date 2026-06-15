import { Request, Response, NextFunction } from 'express';
import { query } from '../config/database';
import { logger } from '../utils/logger';

export function auditLog(action: string, entityType?: string) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const originalJson = res.json.bind(res);

    res.json = function (body: unknown) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const entityId =
          (body as { data?: { id?: string } })?.data?.id ??
          req.params.id ??
          undefined;

        query(
          `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, new_values, ip_address, user_agent)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            req.user?.id ?? null,
            action,
            entityType ?? null,
            entityId ?? null,
            body ? JSON.stringify(body) : null,
            req.ip,
            req.get('user-agent') ?? null,
          ]
        ).catch((err) => {
          logger.error('Failed to write audit log', { error: err.message, action });
        });
      }

      return originalJson(body);
    };

    next();
  };
}

export async function logAuditEntry(
  req: Request,
  action: string,
  entityType: string,
  entityId: string,
  oldValues?: Record<string, unknown>,
  newValues?: Record<string, unknown>
): Promise<void> {
  try {
    await query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_values, new_values, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        req.user?.id ?? null,
        action,
        entityType,
        entityId,
        oldValues ? JSON.stringify(oldValues) : null,
        newValues ? JSON.stringify(newValues) : null,
        req.ip,
        req.get('user-agent') ?? null,
      ]
    );
  } catch (error) {
    logger.error('Failed to write audit log', {
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

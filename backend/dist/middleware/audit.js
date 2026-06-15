"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditLog = auditLog;
exports.logAuditEntry = logAuditEntry;
const database_1 = require("../config/database");
const logger_1 = require("../utils/logger");
function auditLog(action, entityType) {
    return async (req, res, next) => {
        const originalJson = res.json.bind(res);
        res.json = function (body) {
            if (res.statusCode >= 200 && res.statusCode < 300) {
                const entityId = body?.data?.id ??
                    req.params.id ??
                    undefined;
                (0, database_1.query)(`INSERT INTO audit_logs (user_id, action, entity_type, entity_id, new_values, ip_address, user_agent)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`, [
                    req.user?.id ?? null,
                    action,
                    entityType ?? null,
                    entityId ?? null,
                    body ? JSON.stringify(body) : null,
                    req.ip,
                    req.get('user-agent') ?? null,
                ]).catch((err) => {
                    logger_1.logger.error('Failed to write audit log', { error: err.message, action });
                });
            }
            return originalJson(body);
        };
        next();
    };
}
async function logAuditEntry(req, action, entityType, entityId, oldValues, newValues) {
    try {
        await (0, database_1.query)(`INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_values, new_values, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`, [
            req.user?.id ?? null,
            action,
            entityType,
            entityId,
            oldValues ? JSON.stringify(oldValues) : null,
            newValues ? JSON.stringify(newValues) : null,
            req.ip,
            req.get('user-agent') ?? null,
        ]);
    }
    catch (error) {
        logger_1.logger.error('Failed to write audit log', {
            error: error instanceof Error ? error.message : String(error),
        });
    }
}
//# sourceMappingURL=audit.js.map
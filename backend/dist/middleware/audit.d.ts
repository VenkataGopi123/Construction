import { Request, Response, NextFunction } from 'express';
export declare function auditLog(action: string, entityType?: string): (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare function logAuditEntry(req: Request, action: string, entityType: string, entityId: string, oldValues?: Record<string, unknown>, newValues?: Record<string, unknown>): Promise<void>;
//# sourceMappingURL=audit.d.ts.map
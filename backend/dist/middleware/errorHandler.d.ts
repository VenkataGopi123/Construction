import { Request, Response, NextFunction } from 'express';
import { AppError } from '../types';
export declare function notFoundHandler(req: Request, _res: Response, next: NextFunction): void;
export declare function errorHandler(err: Error | AppError, _req: Request, res: Response, _next: NextFunction): void;
export declare function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<void>): (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=errorHandler.d.ts.map
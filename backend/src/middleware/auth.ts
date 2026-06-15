import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { AuthUser, UserRole, AppError } from '../types';

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  passport.authenticate('jwt', { session: false }, (err: Error | null, user: AuthUser | false) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return next(new AppError('Authentication required', 401));
    }
    req.user = user;
    next();
  })(req, res, next);
}

export function authorize(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    if (roles.length > 0 && !roles.includes(req.user.role)) {
      return next(new AppError('Insufficient permissions', 403));
    }

    next();
  };
}

export function optionalAuth(req: Request, res: Response, next: NextFunction): void {
  passport.authenticate('jwt', { session: false }, (_err: Error | null, user: AuthUser | false) => {
    if (user) {
      req.user = user;
    }
    next();
  })(req, res, next);
}

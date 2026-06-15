import { Request, Response } from 'express';
export declare const listNotifications: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const getUnreadCount: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const createNotification: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const markAsRead: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const markAllAsRead: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const deleteNotification: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const sendBulkNotification: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const sendTestNotification: (req: Request, res: Response, next: import("express").NextFunction) => void;
//# sourceMappingURL=notifications.controller.d.ts.map
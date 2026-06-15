import { NotificationChannel } from '../types';
interface NotificationPayload {
    to: string;
    subject: string;
    message: string;
    channel?: NotificationChannel;
}
declare class NotificationService {
    private transporter;
    private getTransporter;
    sendEmail(to: string, subject: string, html: string): Promise<boolean>;
    sendSms(to: string, message: string): Promise<boolean>;
    sendWhatsApp(to: string, message: string): Promise<boolean>;
    notify(payload: NotificationPayload): Promise<boolean>;
}
export declare const notificationService: NotificationService;
export {};
//# sourceMappingURL=notification.service.d.ts.map
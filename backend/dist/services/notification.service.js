"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const env_1 = require("../config/env");
const logger_1 = require("../utils/logger");
class NotificationService {
    transporter = null;
    getTransporter() {
        if (!env_1.env.smtp.user || !env_1.env.smtp.pass) {
            return null;
        }
        if (!this.transporter) {
            this.transporter = nodemailer_1.default.createTransport({
                host: env_1.env.smtp.host,
                port: env_1.env.smtp.port,
                secure: env_1.env.smtp.port === 465,
                auth: { user: env_1.env.smtp.user, pass: env_1.env.smtp.pass },
            });
        }
        return this.transporter;
    }
    async sendEmail(to, subject, html) {
        const transporter = this.getTransporter();
        if (!transporter) {
            logger_1.logger.info('[Email Stub] Would send email', { to, subject });
            return true;
        }
        try {
            await transporter.sendMail({
                from: env_1.env.smtp.from,
                to,
                subject,
                html,
            });
            logger_1.logger.info('Email sent', { to, subject });
            return true;
        }
        catch (error) {
            logger_1.logger.error('Email send failed', {
                error: error instanceof Error ? error.message : String(error),
                to,
            });
            return false;
        }
    }
    async sendSms(to, message) {
        if (!env_1.env.twilio.accountSid || !env_1.env.twilio.authToken) {
            logger_1.logger.info('[SMS Stub] Would send SMS', { to, message: message.substring(0, 50) });
            return true;
        }
        try {
            const url = `https://api.twilio.com/2010-04-01/Accounts/${env_1.env.twilio.accountSid}/Messages.json`;
            const auth = Buffer.from(`${env_1.env.twilio.accountSid}:${env_1.env.twilio.authToken}`).toString('base64');
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    Authorization: `Basic ${auth}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    To: to,
                    From: env_1.env.twilio.phoneNumber,
                    Body: message,
                }),
            });
            if (!response.ok) {
                throw new Error(`Twilio SMS failed: ${response.statusText}`);
            }
            logger_1.logger.info('SMS sent', { to });
            return true;
        }
        catch (error) {
            logger_1.logger.error('SMS send failed', {
                error: error instanceof Error ? error.message : String(error),
                to,
            });
            return false;
        }
    }
    async sendWhatsApp(to, message) {
        if (!env_1.env.twilio.accountSid || !env_1.env.twilio.authToken) {
            logger_1.logger.info('[WhatsApp Stub] Would send WhatsApp', { to, message: message.substring(0, 50) });
            return true;
        }
        try {
            const url = `https://api.twilio.com/2010-04-01/Accounts/${env_1.env.twilio.accountSid}/Messages.json`;
            const auth = Buffer.from(`${env_1.env.twilio.accountSid}:${env_1.env.twilio.authToken}`).toString('base64');
            const whatsappTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    Authorization: `Basic ${auth}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    To: whatsappTo,
                    From: env_1.env.twilio.whatsappFrom,
                    Body: message,
                }),
            });
            if (!response.ok) {
                throw new Error(`Twilio WhatsApp failed: ${response.statusText}`);
            }
            logger_1.logger.info('WhatsApp sent', { to });
            return true;
        }
        catch (error) {
            logger_1.logger.error('WhatsApp send failed', {
                error: error instanceof Error ? error.message : String(error),
                to,
            });
            return false;
        }
    }
    async notify(payload) {
        const channel = payload.channel ?? 'email';
        switch (channel) {
            case 'email':
                return this.sendEmail(payload.to, payload.subject, payload.message);
            case 'sms':
                return this.sendSms(payload.to, payload.message);
            case 'whatsapp':
                return this.sendWhatsApp(payload.to, payload.message);
            case 'in_app':
                logger_1.logger.info('[In-App Notification]', payload);
                return true;
            default:
                return false;
        }
    }
}
exports.notificationService = new NotificationService();
//# sourceMappingURL=notification.service.js.map
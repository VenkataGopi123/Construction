import nodemailer from 'nodemailer';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import { NotificationChannel } from '../types';

interface NotificationPayload {
  to: string;
  subject: string;
  message: string;
  channel?: NotificationChannel;
}

class NotificationService {
  private transporter: nodemailer.Transporter | null = null;

  private getTransporter(): nodemailer.Transporter | null {
    if (!env.smtp.user || !env.smtp.pass) {
      return null;
    }
    if (!this.transporter) {
      this.transporter = nodemailer.createTransport({
        host: env.smtp.host,
        port: env.smtp.port,
        secure: env.smtp.port === 465,
        auth: { user: env.smtp.user, pass: env.smtp.pass },
      });
    }
    return this.transporter;
  }

  async sendEmail(to: string, subject: string, html: string): Promise<boolean> {
    const transporter = this.getTransporter();
    if (!transporter) {
      logger.info('[Email Stub] Would send email', { to, subject });
      return true;
    }

    try {
      await transporter.sendMail({
        from: env.smtp.from,
        to,
        subject,
        html,
      });
      logger.info('Email sent', { to, subject });
      return true;
    } catch (error) {
      logger.error('Email send failed', {
        error: error instanceof Error ? error.message : String(error),
        to,
      });
      return false;
    }
  }

  async sendSms(to: string, message: string): Promise<boolean> {
    if (!env.twilio.accountSid || !env.twilio.authToken) {
      logger.info('[SMS Stub] Would send SMS', { to, message: message.substring(0, 50) });
      return true;
    }

    try {
      const url = `https://api.twilio.com/2010-04-01/Accounts/${env.twilio.accountSid}/Messages.json`;
      const auth = Buffer.from(`${env.twilio.accountSid}:${env.twilio.authToken}`).toString('base64');

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          To: to,
          From: env.twilio.phoneNumber,
          Body: message,
        }),
      });

      if (!response.ok) {
        throw new Error(`Twilio SMS failed: ${response.statusText}`);
      }

      logger.info('SMS sent', { to });
      return true;
    } catch (error) {
      logger.error('SMS send failed', {
        error: error instanceof Error ? error.message : String(error),
        to,
      });
      return false;
    }
  }

  async sendWhatsApp(to: string, message: string): Promise<boolean> {
    if (!env.twilio.accountSid || !env.twilio.authToken) {
      logger.info('[WhatsApp Stub] Would send WhatsApp', { to, message: message.substring(0, 50) });
      return true;
    }

    try {
      const url = `https://api.twilio.com/2010-04-01/Accounts/${env.twilio.accountSid}/Messages.json`;
      const auth = Buffer.from(`${env.twilio.accountSid}:${env.twilio.authToken}`).toString('base64');
      const whatsappTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          To: whatsappTo,
          From: env.twilio.whatsappFrom,
          Body: message,
        }),
      });

      if (!response.ok) {
        throw new Error(`Twilio WhatsApp failed: ${response.statusText}`);
      }

      logger.info('WhatsApp sent', { to });
      return true;
    } catch (error) {
      logger.error('WhatsApp send failed', {
        error: error instanceof Error ? error.message : String(error),
        to,
      });
      return false;
    }
  }

  async notify(payload: NotificationPayload): Promise<boolean> {
    const channel = payload.channel ?? 'email';

    switch (channel) {
      case 'email':
        return this.sendEmail(payload.to, payload.subject, payload.message);
      case 'sms':
        return this.sendSms(payload.to, payload.message);
      case 'whatsapp':
        return this.sendWhatsApp(payload.to, payload.message);
      case 'in_app':
        logger.info('[In-App Notification]', payload);
        return true;
      default:
        return false;
    }
  }
}

export const notificationService = new NotificationService();

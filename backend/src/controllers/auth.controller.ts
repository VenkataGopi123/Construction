import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { Request, Response } from 'express';
import passport from 'passport';
import { query } from '../config/database';
import { env } from '../config/env';
import { AppError, JwtPayload, User } from '../types';
import { hashToken, sanitizeUser } from '../utils/helpers';
import { asyncHandler } from '../middleware/errorHandler';
import nodemailer from 'nodemailer';

// Configure Nodemailer
// In production, replace with real SMTP credentials in your .env file
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || 'demetris.wiegand12@ethereal.email',
    pass: process.env.SMTP_PASS || 'NfJj3u9K2B6XwVvHkZ'
  }
});

function generateTokens(user: User) {
  const accessPayload: JwtPayload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    type: 'access',
  };

  const refreshPayload: JwtPayload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    type: 'refresh',
  };

  const accessToken = jwt.sign(accessPayload, env.jwt.secret, {
    expiresIn: env.jwt.expiresIn as jwt.SignOptions['expiresIn'],
  });

  const refreshToken = jwt.sign(refreshPayload, env.jwt.secret, {
    expiresIn: env.jwt.refreshExpiresIn as jwt.SignOptions['expiresIn'],
  });

  return { accessToken, refreshToken };
}

async function storeRefreshToken(userId: string, refreshToken: string): Promise<void> {
  const tokenHash = hashToken(refreshToken);
  const decoded = jwt.decode(refreshToken) as { exp?: number };
  const expiresAt = decoded.exp
    ? new Date(decoded.exp * 1000)
    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  await query(
    'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
    [userId, tokenHash, expiresAt]
  );
}

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, first_name, last_name, phone, role } = req.body;

  if (!email || !password || !first_name) {
    throw new AppError('Email, password, and first name are required', 400);
  }

  const existing = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
  if (existing.rows.length > 0) {
    throw new AppError('Email already registered', 409);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const allowedRoles = ['customer', 'supplier'];
  const userRole = allowedRoles.includes(role) ? role : 'customer';

  const result = await query<User>(
    `INSERT INTO users (email, password_hash, first_name, last_name, phone, role, is_verified)
     VALUES ($1, $2, $3, $4, $5, $6, false)
     RETURNING *`,
    [email.toLowerCase(), passwordHash, first_name, last_name ?? null, phone ?? null, userRole]
  );

  const user = result.rows[0];
  const tokens = generateTokens(user);
  await storeRefreshToken(user.id, tokens.refreshToken);

  // Send Welcome Email
  try {
    const info = await transporter.sendMail({
      from: '"Harshith Ram Construction" <noreply@harshithram.com>',
      to: email,
      subject: "Welcome to Harshith Ram Construction",
      text: `Hello ${first_name},\n\nYou have registered successfully with Harshith Ram Construction.\n\nThank you!`,
      html: `<p>Hello <b>${first_name}</b>,</p><p>You have registered successfully with Harshith Ram Construction.</p><p>Thank you!</p>`
    });
    console.log("Welcome email sent! Preview URL: %s", nodemailer.getTestMessageUrl(info));
  } catch (emailError) {
    console.error("Error sending welcome email:", emailError);
  }

  res.status(201).json({
    success: true,
    message: 'Registration successful',
    data: {
      user: sanitizeUser(user as unknown as Record<string, unknown>),
      ...tokens,
    },
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError('Email and password are required', 400);
  }

  const result = await query<User>('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
  const user = result.rows[0];

  if (!user || !user.password_hash) {
    throw new AppError('Invalid email or password', 401);
  }

  if (!user.is_active) {
    throw new AppError('Account is deactivated', 403);
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    throw new AppError('Invalid email or password', 401);
  }

  await query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);

  const tokens = generateTokens(user);
  await storeRefreshToken(user.id, tokens.refreshToken);

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: sanitizeUser(user as unknown as Record<string, unknown>),
      ...tokens,
    },
  });
});

export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken: token } = req.body;

  if (!token) {
    throw new AppError('Refresh token is required', 400);
  }

  let payload: JwtPayload;
  try {
    payload = jwt.verify(token, env.jwt.secret) as JwtPayload;
  } catch {
    throw new AppError('Invalid or expired refresh token', 401);
  }

  if (payload.type !== 'refresh') {
    throw new AppError('Invalid token type', 401);
  }

  const tokenHash = hashToken(token);
  const stored = await query(
    'SELECT * FROM refresh_tokens WHERE user_id = $1 AND token_hash = $2 AND expires_at > NOW()',
    [payload.sub, tokenHash]
  );

  if (stored.rows.length === 0) {
    throw new AppError('Refresh token revoked or expired', 401);
  }

  const userResult = await query<User>('SELECT * FROM users WHERE id = $1 AND is_active = true', [
    payload.sub,
  ]);
  const user = userResult.rows[0];

  if (!user) {
    throw new AppError('User not found', 404);
  }

  await query('DELETE FROM refresh_tokens WHERE token_hash = $1', [tokenHash]);

  const tokens = generateTokens(user);
  await storeRefreshToken(user.id, tokens.refreshToken);

  res.json({
    success: true,
    data: tokens,
  });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken: token } = req.body;

  if (token) {
    const tokenHash = hashToken(token);
    await query('DELETE FROM refresh_tokens WHERE token_hash = $1', [tokenHash]);
  }

  res.json({ success: true, message: 'Logged out successfully' });
});

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const result = await query(
    'SELECT id, email, first_name, last_name, phone, avatar_url, role, is_verified, created_at FROM users WHERE id = $1',
    [req.user!.id]
  );

  const user = result.rows[0];
  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.json({ success: true, data: user });
});

export const googleAuth = passport.authenticate('google', {
  scope: ['profile', 'email'],
  session: false,
});

export const googleCallback = (
  req: Request,
  res: Response,
  next: (err?: unknown) => void
): void => {
  passport.authenticate('google', { session: false }, async (err: Error | null, user: User | false) => {
    try {
      if (err || !user) {
        return res.redirect(`${env.frontendUrl}/login?error=google_auth_failed`);
      }

      const tokens = generateTokens(user);
      await storeRefreshToken(user.id, tokens.refreshToken);

      const params = new URLSearchParams({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      });

      res.redirect(`${env.frontendUrl}/auth/callback?${params.toString()}`);
    } catch (error) {
      next(error);
    }
  })(req, res, next);
};

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;

  res.json({
    success: true,
    message: 'If the email exists, a reset link has been sent',
  });

  if (!email) return;

  const result = await query<User>('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
  if (result.rows.length === 0) return;

  const resetToken = crypto.randomBytes(32).toString('hex');
  // In production, store reset token with expiry and send email
  void resetToken;
});

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const { current_password, new_password } = req.body;

  if (!current_password || !new_password) {
    throw new AppError('Current and new password are required', 400);
  }

  if (new_password.length < 8) {
    throw new AppError('New password must be at least 8 characters', 400);
  }

  const result = await query<User>('SELECT password_hash FROM users WHERE id = $1', [req.user!.id]);
  const user = result.rows[0];

  if (!user?.password_hash) {
    throw new AppError('Cannot change password for OAuth-only account', 400);
  }

  const valid = await bcrypt.compare(current_password, user.password_hash);
  if (!valid) {
    throw new AppError('Current password is incorrect', 401);
  }

  const passwordHash = await bcrypt.hash(new_password, 12);
  await query('UPDATE users SET password_hash = $1 WHERE id = $2', [passwordHash, req.user!.id]);

  await query('DELETE FROM refresh_tokens WHERE user_id = $1', [req.user!.id]);

  res.json({ success: true, message: 'Password changed successfully' });
});

import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../config/database';
import { AppError, User } from '../types';
import { parsePagination, buildPaginatedResponse, sanitizeUser } from '../utils/helpers';
import { asyncHandler } from '../middleware/errorHandler';
import { logAuditEntry } from '../middleware/audit';

export const listUsers = asyncHandler(async (req: Request, res: Response) => {
  const pagination = parsePagination(req.query as { page?: string; limit?: string });
  const { role, search } = req.query;

  const conditions: string[] = ['1=1'];
  const params: unknown[] = [];
  let paramIndex = 1;

  if (role) {
    conditions.push(`role = $${paramIndex++}`);
    params.push(role);
  }

  if (search) {
    conditions.push(
      `(email ILIKE $${paramIndex} OR first_name ILIKE $${paramIndex} OR last_name ILIKE $${paramIndex})`
    );
    params.push(`%${search}%`);
    paramIndex++;
  }

  const whereClause = conditions.join(' AND ');

  const countResult = await query(
    `SELECT COUNT(*) FROM users WHERE ${whereClause}`,
    params
  );
  const total = parseInt(countResult.rows[0].count, 10);

  const result = await query(
    `SELECT id, email, first_name, last_name, phone, avatar_url, role, is_active, is_verified, last_login, created_at
     FROM users WHERE ${whereClause}
     ORDER BY created_at DESC
     LIMIT $${paramIndex++} OFFSET $${paramIndex}`,
    [...params, pagination.limit, pagination.offset]
  );

  res.json({
    success: true,
    ...buildPaginatedResponse(result.rows, total, pagination),
  });
});

export const getUser = asyncHandler(async (req: Request, res: Response) => {
  const result = await query<User>(
    `SELECT id, email, first_name, last_name, phone, avatar_url, role, is_active, is_verified, last_login, created_at
     FROM users WHERE id = $1`,
    [req.params.id]
  );

  if (!result.rows[0]) {
    throw new AppError('User not found', 404);
  }

  res.json({ success: true, data: result.rows[0] });
});

export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, first_name, last_name, phone, role } = req.body;

  if (!email || !password || !first_name || !role) {
    throw new AppError('Email, password, first name, and role are required', 400);
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const result = await query<User>(
    `INSERT INTO users (email, password_hash, first_name, last_name, phone, role, is_verified)
     VALUES ($1, $2, $3, $4, $5, $6, true)
     RETURNING id, email, first_name, last_name, phone, role, is_active, is_verified, created_at`,
    [email.toLowerCase(), passwordHash, first_name, last_name ?? null, phone ?? null, role]
  );

  res.status(201).json({ success: true, data: result.rows[0] });
});

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const { first_name, last_name, phone, role, is_active } = req.body;

  const existing = await query<User>('SELECT * FROM users WHERE id = $1', [req.params.id]);
  if (!existing.rows[0]) {
    throw new AppError('User not found', 404);
  }

  const result = await query<User>(
    `UPDATE users SET
       first_name = COALESCE($1, first_name),
       last_name = COALESCE($2, last_name),
       phone = COALESCE($3, phone),
       role = COALESCE($4, role),
       is_active = COALESCE($5, is_active),
       updated_at = NOW()
     WHERE id = $6
     RETURNING id, email, first_name, last_name, phone, role, is_active, is_verified, updated_at`,
    [first_name, last_name, phone, role, is_active, req.params.id]
  );

  await logAuditEntry(req, 'UPDATE', 'user', req.params.id, existing.rows[0] as unknown as Record<string, unknown>, result.rows[0] as unknown as Record<string, unknown>);

  res.json({ success: true, data: result.rows[0] });
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  if (req.params.id === req.user?.id) {
    throw new AppError('Cannot delete your own account', 400);
  }

  const existing = await query('SELECT id FROM users WHERE id = $1', [req.params.id]);
  if (!existing.rows[0]) {
    throw new AppError('User not found', 404);
  }

  await query('UPDATE users SET is_active = false WHERE id = $1', [req.params.id]);
  await logAuditEntry(req, 'DELETE', 'user', req.params.id);

  res.json({ success: true, message: 'User deactivated successfully' });
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const { first_name, last_name, phone, avatar_url } = req.body;

  const result = await query<User>(
    `UPDATE users SET
       first_name = COALESCE($1, first_name),
       last_name = COALESCE($2, last_name),
       phone = COALESCE($3, phone),
       avatar_url = COALESCE($4, avatar_url)
     WHERE id = $5
     RETURNING id, email, first_name, last_name, phone, avatar_url, role`,
    [first_name, last_name, phone, avatar_url, req.user!.id]
  );

  res.json({ success: true, data: sanitizeUser(result.rows[0] as unknown as Record<string, unknown>) });
});

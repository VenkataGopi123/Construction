import { Request, Response } from 'express';
import { query } from '../config/database';
import { AppError } from '../types';
import { parsePagination, buildPaginatedResponse } from '../utils/helpers';
import { asyncHandler } from '../middleware/errorHandler';

export const getPublicProjects = asyncHandler(async (req: Request, res: Response) => {
  const pagination = parsePagination(req.query as { page?: string; limit?: string });

  const countResult = await query(
    `SELECT COUNT(*) FROM projects WHERE status = 'completed'`
  );
  const total = parseInt(countResult.rows[0].count, 10);

  const result = await query(
    `SELECT id, project_code, name, project_type, location, progress_percent, status, created_at
     FROM projects
     WHERE status = 'completed'
     ORDER BY created_at DESC
     LIMIT $1 OFFSET $2`,
    [pagination.limit, pagination.offset]
  );

  res.json({ success: true, ...buildPaginatedResponse(result.rows, total, pagination) });
});

export const getTestimonials = asyncHandler(async (_req: Request, res: Response) => {
  const result = await query(
    `SELECT * FROM testimonials WHERE is_featured = true ORDER BY rating DESC, created_at DESC LIMIT 10`
  );

  res.json({ success: true, data: result.rows });
});

export const getAllTestimonials = asyncHandler(async (req: Request, res: Response) => {
  const pagination = parsePagination(req.query as { page?: string; limit?: string });

  const countResult = await query('SELECT COUNT(*) FROM testimonials');
  const total = parseInt(countResult.rows[0].count, 10);

  const result = await query(
    'SELECT * FROM testimonials ORDER BY created_at DESC LIMIT $1 OFFSET $2',
    [pagination.limit, pagination.offset]
  );

  res.json({ success: true, ...buildPaginatedResponse(result.rows, total, pagination) });
});

export const createTestimonial = asyncHandler(async (req: Request, res: Response) => {
  const { client_name, company, content, rating, project_type, is_featured } = req.body;

  if (!client_name || !content) {
    throw new AppError('Client name and content are required', 400);
  }

  const result = await query(
    `INSERT INTO testimonials (client_name, company, content, rating, project_type, is_featured)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [client_name, company ?? null, content, rating ?? 5, project_type ?? null, is_featured ?? false]
  );

  res.status(201).json({ success: true, data: result.rows[0] });
});

export const submitContact = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, phone, subject, message } = req.body;

  if (!name || !email || !message) {
    throw new AppError('Name, email, and message are required', 400);
  }

  const result = await query(
    `INSERT INTO contact_submissions (name, email, phone, subject, message)
     VALUES ($1, $2, $3, $4, $5) RETURNING id, created_at`,
    [name, email, phone ?? null, subject ?? null, message]
  );

  res.status(201).json({
    success: true,
    message: 'Thank you for contacting us. We will get back to you soon.',
    data: result.rows[0],
  });
});

export const listContactSubmissions = asyncHandler(async (req: Request, res: Response) => {
  const pagination = parsePagination(req.query as { page?: string; limit?: string });
  const { is_read } = req.query;

  const conditions: string[] = ['1=1'];
  const params: unknown[] = [];
  let i = 1;

  if (is_read !== undefined) {
    conditions.push(`is_read = $${i++}`);
    params.push(is_read === 'true');
  }

  const where = conditions.join(' AND ');
  const countResult = await query(`SELECT COUNT(*) FROM contact_submissions WHERE ${where}`, params);
  const total = parseInt(countResult.rows[0].count, 10);

  const result = await query(
    `SELECT * FROM contact_submissions WHERE ${where} ORDER BY created_at DESC LIMIT $${i++} OFFSET $${i}`,
    [...params, pagination.limit, pagination.offset]
  );

  res.json({ success: true, ...buildPaginatedResponse(result.rows, total, pagination) });
});

export const markContactRead = asyncHandler(async (req: Request, res: Response) => {
  const result = await query(
    'UPDATE contact_submissions SET is_read = true WHERE id = $1 RETURNING *',
    [req.params.id]
  );

  if (!result.rows[0]) throw new AppError('Contact submission not found', 404);
  res.json({ success: true, data: result.rows[0] });
});

export const getChatMessages = asyncHandler(async (req: Request, res: Response) => {
  const { session_id } = req.params;

  const result = await query(
    'SELECT * FROM chat_messages WHERE session_id = $1 ORDER BY created_at ASC',
    [session_id]
  );

  res.json({ success: true, data: result.rows });
});

export const sendChatMessage = asyncHandler(async (req: Request, res: Response) => {
  const { session_id } = req.params;
  const { message, is_from_support } = req.body;

  if (!message) throw new AppError('Message is required', 400);

  const result = await query(
    `INSERT INTO chat_messages (session_id, user_id, message, is_from_support)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [session_id, req.user?.id ?? null, message, is_from_support ?? false]
  );

  res.status(201).json({ success: true, data: result.rows[0] });
});

export const getWebsiteStats = asyncHandler(async (_req: Request, res: Response) => {
  const [projects, testimonials, contacts] = await Promise.all([
    query(`SELECT COUNT(*) AS count FROM projects WHERE status = 'completed'`),
    query(`SELECT COUNT(*) AS count FROM testimonials WHERE is_featured = true`),
    query(`SELECT COUNT(*) AS count FROM contact_submissions WHERE is_read = false`),
  ]);

  res.json({
    success: true,
    data: {
      completed_projects: parseInt(projects.rows[0].count, 10),
      featured_testimonials: parseInt(testimonials.rows[0].count, 10),
      unread_contacts: parseInt(contacts.rows[0].count, 10),
    },
  });
});

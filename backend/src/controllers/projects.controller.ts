import { Request, Response } from 'express';
import { query } from '../config/database';
import { AppError } from '../types';
import { parsePagination, buildPaginatedResponse, generateCode } from '../utils/helpers';
import { asyncHandler } from '../middleware/errorHandler';

export const listProjects = asyncHandler(async (req: Request, res: Response) => {
  const pagination = parsePagination(req.query as { page?: string; limit?: string });
  const { status, project_type, search } = req.query;

  const conditions: string[] = ['1=1'];
  const params: unknown[] = [];
  let i = 1;

  if (status) { conditions.push(`p.status = $${i++}`); params.push(status); }
  if (project_type) { conditions.push(`p.project_type = $${i++}`); params.push(project_type); }
  if (search) {
    conditions.push(`(p.name ILIKE $${i} OR p.project_code ILIKE $${i} OR p.client_name ILIKE $${i})`);
    params.push(`%${search}%`);
    i++;
  }

  const where = conditions.join(' AND ');
  const countResult = await query(`SELECT COUNT(*) FROM projects p WHERE ${where}`, params);
  const total = parseInt(countResult.rows[0].count, 10);

  const result = await query(
    `SELECT p.*
     FROM projects p
     WHERE ${where}
     ORDER BY p.created_at DESC
     LIMIT $${i++} OFFSET $${i}`,
    [...params, pagination.limit, pagination.offset]
  );

  res.json({ success: true, ...buildPaginatedResponse(result.rows, total, pagination) });
});

export const getProject = asyncHandler(async (req: Request, res: Response) => {
  const result = await query(
    `SELECT p.*
     FROM projects p
     WHERE p.id = $1`,
    [req.params.id]
  );

  if (!result.rows[0]) throw new AppError('Project not found', 404);

  res.json({
    success: true,
    data: result.rows[0],
  });
});

export const createProject = asyncHandler(async (req: Request, res: Response) => {
  const {
    name, project_type, client_name, budget, start_date, end_date,
    location, description, status,
  } = req.body;

  if (!name || !project_type || !client_name) {
    throw new AppError('Name, project type, and client name are required', 400);
  }

  const projectCode = generateCode('project');

  const result = await query(
    `INSERT INTO projects (project_code, name, project_type, client_name, budget, start_date, end_date, location, description, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING *`,
    [
      projectCode, name, project_type, client_name,
      budget ?? 0, start_date ?? null, end_date ?? null, location ?? null,
      description ?? null, status ?? 'planning',
    ]
  );

  res.status(201).json({ success: true, data: result.rows[0] });
});

export const updateProject = asyncHandler(async (req: Request, res: Response) => {
  const existing = await query('SELECT * FROM projects WHERE id = $1', [req.params.id]);
  if (!existing.rows[0]) throw new AppError('Project not found', 404);

  const fields = [
    'name', 'project_type', 'client_name', 'budget',
    'start_date', 'end_date', 'location',
    'status', 'progress_percent', 'description',
  ];

  const updates: string[] = [];
  const values: unknown[] = [];
  let i = 1;

  fields.forEach((field) => {
    if (req.body[field] !== undefined) {
      updates.push(`${field} = $${i++}`);
      values.push(req.body[field]);
    }
  });

  if (updates.length === 0) throw new AppError('No fields to update', 400);

  values.push(req.params.id);
  const result = await query(
    `UPDATE projects SET ${updates.join(', ')} WHERE id = $${i} RETURNING *`,
    values
  );

  res.json({ success: true, data: result.rows[0] });
});

export const deleteProject = asyncHandler(async (req: Request, res: Response) => {
  const existing = await query('SELECT id FROM projects WHERE id = $1', [req.params.id]);
  if (!existing.rows[0]) throw new AppError('Project not found', 404);

  await query('DELETE FROM projects WHERE id = $1', [req.params.id]);

  res.json({ success: true, message: 'Project deleted successfully' });
});

import { Request, Response } from 'express';
import { query } from '../config/database';
import { AppError } from '../types';
import { parsePagination, buildPaginatedResponse, generateCode } from '../utils/helpers';
import { asyncHandler } from '../middleware/errorHandler';
import { logAuditEntry } from '../middleware/audit';

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

  if (req.user?.role === 'project_manager') {
    conditions.push(`p.manager_id = $${i++}`);
    params.push(req.user.id);
  }

  const where = conditions.join(' AND ');
  const countResult = await query(`SELECT COUNT(*) FROM projects p WHERE ${where}`, params);
  const total = parseInt(countResult.rows[0].count, 10);

  const result = await query(
    `SELECT p.*, c.name AS customer_name, u.first_name || ' ' || COALESCE(u.last_name, '') AS manager_name
     FROM projects p
     LEFT JOIN customers c ON p.customer_id = c.id
     LEFT JOIN users u ON p.manager_id = u.id
     WHERE ${where}
     ORDER BY p.created_at DESC
     LIMIT $${i++} OFFSET $${i}`,
    [...params, pagination.limit, pagination.offset]
  );

  res.json({ success: true, ...buildPaginatedResponse(result.rows, total, pagination) });
});

export const getProject = asyncHandler(async (req: Request, res: Response) => {
  const result = await query(
    `SELECT p.*, c.name AS customer_name, u.first_name || ' ' || COALESCE(u.last_name, '') AS manager_name
     FROM projects p
     LEFT JOIN customers c ON p.customer_id = c.id
     LEFT JOIN users u ON p.manager_id = u.id
     WHERE p.id = $1`,
    [req.params.id]
  );

  if (!result.rows[0]) throw new AppError('Project not found', 404);

  const milestones = await query(
    'SELECT * FROM project_milestones WHERE project_id = $1 ORDER BY sort_order',
    [req.params.id]
  );

  const updates = await query(
    'SELECT pu.*, u.first_name || \' \' || COALESCE(u.last_name, \'\') AS author_name FROM project_updates pu LEFT JOIN users u ON pu.user_id = u.id WHERE pu.project_id = $1 ORDER BY pu.created_at DESC LIMIT 20',
    [req.params.id]
  );

  res.json({
    success: true,
    data: { ...result.rows[0], milestones: milestones.rows, updates: updates.rows },
  });
});

export const createProject = asyncHandler(async (req: Request, res: Response) => {
  const {
    name, project_type, customer_id, client_name, budget, start_date, end_date,
    location, latitude, longitude, manager_id, description, status,
  } = req.body;

  if (!name || !project_type || !client_name) {
    throw new AppError('Name, project type, and client name are required', 400);
  }

  const projectCode = generateCode('project');

  const result = await query(
    `INSERT INTO projects (project_code, name, project_type, customer_id, client_name, budget, start_date, end_date, location, latitude, longitude, manager_id, description, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
     RETURNING *`,
    [
      projectCode, name, project_type, customer_id ?? null, client_name,
      budget ?? 0, start_date ?? null, end_date ?? null, location ?? null,
      latitude ?? null, longitude ?? null,
      manager_id ?? req.user?.id, description ?? null, status ?? 'planning',
    ]
  );

  res.status(201).json({ success: true, data: result.rows[0] });
});

export const updateProject = asyncHandler(async (req: Request, res: Response) => {
  const existing = await query('SELECT * FROM projects WHERE id = $1', [req.params.id]);
  if (!existing.rows[0]) throw new AppError('Project not found', 404);

  const fields = [
    'name', 'project_type', 'customer_id', 'client_name', 'budget', 'spent_amount',
    'start_date', 'end_date', 'actual_end_date', 'location', 'latitude', 'longitude',
    'status', 'progress_percent', 'manager_id', 'description',
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

  await logAuditEntry(req, 'UPDATE', 'project', req.params.id, existing.rows[0], result.rows[0]);

  res.json({ success: true, data: result.rows[0] });
});

export const deleteProject = asyncHandler(async (req: Request, res: Response) => {
  const existing = await query('SELECT id FROM projects WHERE id = $1', [req.params.id]);
  if (!existing.rows[0]) throw new AppError('Project not found', 404);

  await query('DELETE FROM projects WHERE id = $1', [req.params.id]);
  await logAuditEntry(req, 'DELETE', 'project', req.params.id);

  res.json({ success: true, message: 'Project deleted successfully' });
});

export const addMilestone = asyncHandler(async (req: Request, res: Response) => {
  const { title, description, start_date, end_date, sort_order } = req.body;
  if (!title) throw new AppError('Title is required', 400);

  const result = await query(
    `INSERT INTO project_milestones (project_id, title, description, start_date, end_date, sort_order)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [req.params.id, title, description ?? null, start_date ?? null, end_date ?? null, sort_order ?? 0]
  );

  res.status(201).json({ success: true, data: result.rows[0] });
});

export const addUpdate = asyncHandler(async (req: Request, res: Response) => {
  const { title, description, update_date } = req.body;
  if (!description) throw new AppError('Description is required', 400);

  const result = await query(
    `INSERT INTO project_updates (project_id, user_id, title, description, update_date)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [req.params.id, req.user!.id, title ?? null, description, update_date ?? null]
  );

  res.status(201).json({ success: true, data: result.rows[0] });
});

export const assignWorker = asyncHandler(async (req: Request, res: Response) => {
  const { worker_id, role } = req.body;
  if (!worker_id) throw new AppError('Worker ID is required', 400);

  const result = await query(
    `INSERT INTO project_assignments (project_id, worker_id, role)
     VALUES ($1, $2, $3) ON CONFLICT (project_id, worker_id) DO UPDATE SET role = $3 RETURNING *`,
    [req.params.id, worker_id, role ?? null]
  );

  res.status(201).json({ success: true, data: result.rows[0] });
});

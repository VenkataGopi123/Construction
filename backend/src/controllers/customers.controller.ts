import { Request, Response } from 'express';
import { query } from '../config/database';
import { AppError } from '../types';
import { parsePagination, buildPaginatedResponse, generateCode } from '../utils/helpers';
import { asyncHandler } from '../middleware/errorHandler';
import { logAuditEntry } from '../middleware/audit';

export const listCustomers = asyncHandler(async (req: Request, res: Response) => {
  const pagination = parsePagination(req.query as { page?: string; limit?: string });
  const { search } = req.query;

  const conditions: string[] = ['1=1'];
  const params: unknown[] = [];
  let i = 1;

  if (search) {
    conditions.push(`(name ILIKE $${i} OR email ILIKE $${i} OR phone ILIKE $${i} OR customer_code ILIKE $${i})`);
    params.push(`%${search}%`);
    i++;
  }

  const where = conditions.join(' AND ');
  const countResult = await query(`SELECT COUNT(*) FROM customers WHERE ${where}`, params);
  const total = parseInt(countResult.rows[0].count, 10);

  const result = await query(
    `SELECT * FROM customers WHERE ${where} ORDER BY created_at DESC LIMIT $${i++} OFFSET $${i}`,
    [...params, pagination.limit, pagination.offset]
  );

  res.json({ success: true, ...buildPaginatedResponse(result.rows, total, pagination) });
});

export const getCustomer = asyncHandler(async (req: Request, res: Response) => {
  const result = await query('SELECT * FROM customers WHERE id = $1', [req.params.id]);
  if (!result.rows[0]) throw new AppError('Customer not found', 404);

  const projects = await query(
    'SELECT id, project_code, name, status, budget, progress_percent FROM projects WHERE customer_id = $1 ORDER BY created_at DESC',
    [req.params.id]
  );

  res.json({ success: true, data: { ...result.rows[0], projects: projects.rows } });
});

export const createCustomer = asyncHandler(async (req: Request, res: Response) => {
  const {
    name, email, phone, address, city, state, pincode,
    aadhaar, pan, gst_number, company_name, notes, user_id,
  } = req.body;

  if (!name || !phone) throw new AppError('Name and phone are required', 400);

  const customerCode = generateCode('customer');

  const result = await query(
    `INSERT INTO customers (customer_code, user_id, name, email, phone, address, city, state, pincode, aadhaar, pan, gst_number, company_name, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *`,
    [
      customerCode, user_id ?? null, name, email ?? null, phone,
      address ?? null, city ?? null, state ?? null, pincode ?? null,
      aadhaar ?? null, pan ?? null, gst_number ?? null, company_name ?? null, notes ?? null,
    ]
  );

  res.status(201).json({ success: true, data: result.rows[0] });
});

export const updateCustomer = asyncHandler(async (req: Request, res: Response) => {
  const existing = await query('SELECT * FROM customers WHERE id = $1', [req.params.id]);
  if (!existing.rows[0]) throw new AppError('Customer not found', 404);

  const fields = ['name', 'email', 'phone', 'address', 'city', 'state', 'pincode', 'aadhaar', 'pan', 'gst_number', 'company_name', 'notes', 'user_id'];
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
  const result = await query(`UPDATE customers SET ${updates.join(', ')} WHERE id = $${i} RETURNING *`, values);

  await logAuditEntry(req, 'UPDATE', 'customer', req.params.id, existing.rows[0], result.rows[0]);

  res.json({ success: true, data: result.rows[0] });
});

export const deleteCustomer = asyncHandler(async (req: Request, res: Response) => {
  const existing = await query('SELECT id FROM customers WHERE id = $1', [req.params.id]);
  if (!existing.rows[0]) throw new AppError('Customer not found', 404);

  await query('DELETE FROM customers WHERE id = $1', [req.params.id]);
  await logAuditEntry(req, 'DELETE', 'customer', req.params.id);

  res.json({ success: true, message: 'Customer deleted successfully' });
});

export const listLeads = asyncHandler(async (req: Request, res: Response) => {
  const pagination = parsePagination(req.query as { page?: string; limit?: string });

  const countResult = await query('SELECT COUNT(*) FROM crm_leads');
  const total = parseInt(countResult.rows[0].count, 10);

  const result = await query(
    `SELECT cl.*, c.name AS customer_name, u.first_name || ' ' || COALESCE(u.last_name, '') AS assigned_to_name
     FROM crm_leads cl
     LEFT JOIN customers c ON cl.customer_id = c.id
     LEFT JOIN users u ON cl.assigned_to = u.id
     ORDER BY cl.created_at DESC
     LIMIT $1 OFFSET $2`,
    [pagination.limit, pagination.offset]
  );

  res.json({ success: true, ...buildPaginatedResponse(result.rows, total, pagination) });
});

export const createLead = asyncHandler(async (req: Request, res: Response) => {
  const { customer_id, source, status, assigned_to, notes, follow_up_date } = req.body;

  const result = await query(
    `INSERT INTO crm_leads (customer_id, source, status, assigned_to, notes, follow_up_date)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [customer_id ?? null, source ?? null, status ?? 'new', assigned_to ?? null, notes ?? null, follow_up_date ?? null]
  );

  res.status(201).json({ success: true, data: result.rows[0] });
});

import { Request, Response } from 'express';
import { query } from '../config/database';
import { AppError } from '../types';
import { parsePagination, buildPaginatedResponse, generateSku } from '../utils/helpers';
import { asyncHandler } from '../middleware/errorHandler';
import { logAuditEntry } from '../middleware/audit';

export const listMaterials = asyncHandler(async (req: Request, res: Response) => {
  const pagination = parsePagination(req.query as { page?: string; limit?: string });
  const { category_id, search, low_stock } = req.query;

  const conditions: string[] = ['m.is_active = true'];
  const params: unknown[] = [];
  let i = 1;

  if (category_id) { conditions.push(`m.category_id = $${i++}`); params.push(category_id); }
  if (search) {
    conditions.push(`(m.name ILIKE $${i} OR m.sku ILIKE $${i})`);
    params.push(`%${search}%`);
    i++;
  }
  if (low_stock === 'true') {
    conditions.push('m.quantity <= m.min_stock_level');
  }

  const where = conditions.join(' AND ');
  const countResult = await query(`SELECT COUNT(*) FROM materials m WHERE ${where}`, params);
  const total = parseInt(countResult.rows[0].count, 10);

  const result = await query(
    `SELECT m.*, mc.name AS category_name
     FROM materials m
     LEFT JOIN material_categories mc ON m.category_id = mc.id
     WHERE ${where}
     ORDER BY m.name
     LIMIT $${i++} OFFSET $${i}`,
    [...params, pagination.limit, pagination.offset]
  );

  res.json({ success: true, ...buildPaginatedResponse(result.rows, total, pagination) });
});

export const getMaterial = asyncHandler(async (req: Request, res: Response) => {
  const result = await query(
    `SELECT m.*, mc.name AS category_name
     FROM materials m
     LEFT JOIN material_categories mc ON m.category_id = mc.id
     WHERE m.id = $1`,
    [req.params.id]
  );

  if (!result.rows[0]) throw new AppError('Material not found', 404);

  res.json({ success: true, data: { ...result.rows[0], stock_logs: [] } });
});

export const createMaterial = asyncHandler(async (req: Request, res: Response) => {
  const {
    name, category_id, unit, quantity, min_stock_level, cost_price, selling_price,
    barcode, description, sku,
  } = req.body;

  if (!name || cost_price === undefined || selling_price === undefined) {
    throw new AppError('Name, cost price, and selling price are required', 400);
  }

  const materialSku = sku ?? generateSku(name);

  const result = await query(
    `INSERT INTO materials (sku, name, category_id, unit, quantity, min_stock_level, cost_price, selling_price, barcode, description)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
    [
      materialSku, name, category_id ?? null, unit ?? 'unit', quantity ?? 0,
      min_stock_level ?? 10, cost_price, selling_price,
      barcode ?? null, description ?? null,
    ]
  );

  res.status(201).json({ success: true, data: result.rows[0] });
});

export const updateMaterial = asyncHandler(async (req: Request, res: Response) => {
  const existing = await query('SELECT * FROM materials WHERE id = $1', [req.params.id]);
  if (!existing.rows[0]) throw new AppError('Material not found', 404);

  const fields = ['name', 'category_id', 'unit', 'quantity', 'min_stock_level', 'cost_price', 'selling_price', 'barcode', 'description', 'is_active'];
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
  const result = await query(`UPDATE materials SET ${updates.join(', ')} WHERE id = $${i} RETURNING *`, values);

  await logAuditEntry(req, 'UPDATE', 'material', req.params.id, existing.rows[0], result.rows[0]);

  res.json({ success: true, data: result.rows[0] });
});

export const deleteMaterial = asyncHandler(async (req: Request, res: Response) => {
  const existing = await query('SELECT id FROM materials WHERE id = $1', [req.params.id]);
  if (!existing.rows[0]) throw new AppError('Material not found', 404);

  await query('DELETE FROM materials WHERE id = $1', [req.params.id]);
  await logAuditEntry(req, 'DELETE', 'material', req.params.id);

  res.json({ success: true, message: 'Material deleted successfully' });
});

export const adjustStock = asyncHandler(async (req: Request, res: Response) => {
  const { change_type, quantity_change, notes, warehouse_id } = req.body;

  if (!change_type || quantity_change === undefined) {
    throw new AppError('Change type and quantity change are required', 400);
  }

  const material = await query('SELECT * FROM materials WHERE id = $1', [req.params.id]);
  if (!material.rows[0]) throw new AppError('Material not found', 404);

  const currentQty = parseFloat(material.rows[0].quantity);
  const newQty = currentQty + parseFloat(quantity_change);

  if (newQty < 0) throw new AppError('Insufficient stock', 400);

  await query('UPDATE materials SET quantity = $1 WHERE id = $2', [newQty, req.params.id]);

  const log = { id: 'dummy', material_id: req.params.id, change_type, quantity_change, quantity_after: newQty, notes };

  res.json({ success: true, data: log });
});

export const listCategories = asyncHandler(async (_req: Request, res: Response) => {
  const result = await query('SELECT * FROM material_categories ORDER BY name');
  res.json({ success: true, data: result.rows });
});

export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const { name, description } = req.body;
  if (!name) throw new AppError('Name is required', 400);

  const result = await query(
    'INSERT INTO material_categories (name, description) VALUES ($1, $2) RETURNING *',
    [name, description ?? null]
  );

  res.status(201).json({ success: true, data: result.rows[0] });
});

export const getLowStock = asyncHandler(async (_req: Request, res: Response) => {
  const result = await query('SELECT * FROM v_low_stock_materials ORDER BY quantity ASC');
  res.json({ success: true, data: result.rows });
});

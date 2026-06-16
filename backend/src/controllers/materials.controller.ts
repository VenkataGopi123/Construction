import { Request, Response } from 'express';
import { query } from '../config/database';
import { AppError } from '../types';
import { parsePagination, buildPaginatedResponse, generateSku } from '../utils/helpers';
import { asyncHandler } from '../middleware/errorHandler';

export const listMaterials = asyncHandler(async (req: Request, res: Response) => {
  const pagination = parsePagination(req.query as { page?: string; limit?: string });
  const { category, search, low_stock } = req.query;

  const conditions: string[] = ['m.is_active = true'];
  const params: unknown[] = [];
  let i = 1;

  if (category) { conditions.push(`m.category = $${i++}`); params.push(category); }
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
    `SELECT m.*
     FROM materials m
     WHERE ${where}
     ORDER BY m.name
     LIMIT $${i++} OFFSET $${i}`,
    [...params, pagination.limit, pagination.offset]
  );

  res.json({ success: true, ...buildPaginatedResponse(result.rows, total, pagination) });
});

export const getMaterial = asyncHandler(async (req: Request, res: Response) => {
  const result = await query(
    `SELECT m.*
     FROM materials m
     WHERE m.id = $1`,
    [req.params.id]
  );

  if (!result.rows[0]) throw new AppError('Material not found', 404);

  res.json({ success: true, data: result.rows[0] });
});

export const createMaterial = asyncHandler(async (req: Request, res: Response) => {
  const {
    name, category, unit, quantity, min_stock_level, cost_price, selling_price,
    description, sku,
  } = req.body;

  if (!name || cost_price === undefined || selling_price === undefined) {
    throw new AppError('Name, cost price, and selling price are required', 400);
  }

  const materialSku = sku ?? generateSku(name);

  const result = await query(
    `INSERT INTO materials (sku, name, category, unit, quantity, min_stock_level, cost_price, selling_price, description)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
    [
      materialSku, name, category ?? null, unit ?? 'unit', quantity ?? 0,
      min_stock_level ?? 10, cost_price, selling_price, description ?? null,
    ]
  );

  res.status(201).json({ success: true, data: result.rows[0] });
});

export const updateMaterial = asyncHandler(async (req: Request, res: Response) => {
  const existing = await query('SELECT * FROM materials WHERE id = $1', [req.params.id]);
  if (!existing.rows[0]) throw new AppError('Material not found', 404);

  const fields = ['name', 'category', 'unit', 'quantity', 'min_stock_level', 'cost_price', 'selling_price', 'description', 'is_active'];
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

  res.json({ success: true, data: result.rows[0] });
});

export const deleteMaterial = asyncHandler(async (req: Request, res: Response) => {
  const existing = await query('SELECT id FROM materials WHERE id = $1', [req.params.id]);
  if (!existing.rows[0]) throw new AppError('Material not found', 404);

  await query('DELETE FROM materials WHERE id = $1', [req.params.id]);

  res.json({ success: true, message: 'Material deleted successfully' });
});

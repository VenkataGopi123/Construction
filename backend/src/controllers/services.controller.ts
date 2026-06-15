import { Request, Response } from 'express';
import { query } from '../config/database';
import { AppError } from '../types';
import { asyncHandler } from '../middleware/errorHandler';

export const listServices = asyncHandler(async (req: Request, res: Response) => {
  const result = await query('SELECT * FROM services WHERE is_active = true ORDER BY name');
  res.json({ success: true, data: result.rows });
});

export const getService = asyncHandler(async (req: Request, res: Response) => {
  const result = await query('SELECT * FROM services WHERE id = $1', [req.params.id]);
  if (!result.rows[0]) throw new AppError('Service not found', 404);
  res.json({ success: true, data: result.rows[0] });
});

export const createService = asyncHandler(async (req: Request, res: Response) => {
  const { name, description, image_url, category, base_price } = req.body;

  if (!name || !description) {
    throw new AppError('Name and description are required', 400);
  }

  const result = await query(
    `INSERT INTO services (name, description, image_url, category, base_price)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [name, description, image_url || null, category || null, base_price || null]
  );

  res.status(201).json({ success: true, data: result.rows[0] });
});

export const updateService = asyncHandler(async (req: Request, res: Response) => {
  const existing = await query('SELECT * FROM services WHERE id = $1', [req.params.id]);
  if (!existing.rows[0]) throw new AppError('Service not found', 404);

  const { name, description, image_url, category, base_price, is_active } = req.body;

  const result = await query(
    `UPDATE services SET 
      name = COALESCE($1, name),
      description = COALESCE($2, description),
      image_url = COALESCE($3, image_url),
      category = COALESCE($4, category),
      base_price = COALESCE($5, base_price),
      is_active = COALESCE($6, is_active)
     WHERE id = $7 RETURNING *`,
    [name, description, image_url, category, base_price, is_active, req.params.id]
  );

  res.json({ success: true, data: result.rows[0] });
});

export const deleteService = asyncHandler(async (req: Request, res: Response) => {
  const existing = await query('SELECT id FROM services WHERE id = $1', [req.params.id]);
  if (!existing.rows[0]) throw new AppError('Service not found', 404);

  await query('UPDATE services SET is_active = false WHERE id = $1', [req.params.id]);
  res.json({ success: true, message: 'Service deactivated successfully' });
});

import { Request, Response } from 'express';
import { query } from '../config/database';
import { AppError } from '../types';
import { asyncHandler } from '../middleware/errorHandler';

export const getAllTeamMembers = asyncHandler(async (_req: Request, res: Response) => {
  const result = await query('SELECT * FROM company_team ORDER BY created_at ASC');
  res.json({
    success: true,
    data: result.rows,
  });
});

export const getTeamMemberById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await query('SELECT * FROM company_team WHERE id = $1', [id]);

  if (result.rows.length === 0) {
    throw new AppError('Team member not found', 404);
  }

  res.json({
    success: true,
    data: result.rows[0],
  });
});

export const createTeamMember = asyncHandler(async (req: Request, res: Response) => {
  const { name, role, email, phone, image_url, description } = req.body;

  if (!name || !role) {
    throw new AppError('Name and role are required', 400);
  }

  const result = await query(
    `INSERT INTO company_team (name, role, email, phone, image_url, description)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [name, role, email, phone, image_url, description]
  );

  res.status(201).json({
    success: true,
    message: 'Team member added successfully',
    data: result.rows[0],
  });
});

export const updateTeamMember = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, role, email, phone, image_url, description } = req.body;

  const result = await query(
    `UPDATE company_team 
     SET name = COALESCE($1, name),
         role = COALESCE($2, role),
         email = COALESCE($3, email),
         phone = COALESCE($4, phone),
         image_url = COALESCE($5, image_url),
         description = COALESCE($6, description),
         updated_at = NOW()
     WHERE id = $7
     RETURNING *`,
    [name, role, email, phone, image_url, description, id]
  );

  if (result.rows.length === 0) {
    throw new AppError('Team member not found', 404);
  }

  res.json({
    success: true,
    message: 'Team member updated successfully',
    data: result.rows[0],
  });
});

export const deleteTeamMember = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await query('DELETE FROM company_team WHERE id = $1 RETURNING id', [id]);

  if (result.rows.length === 0) {
    throw new AppError('Team member not found', 404);
  }

  res.json({
    success: true,
    message: 'Team member deleted successfully',
  });
});

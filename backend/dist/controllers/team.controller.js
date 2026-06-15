"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTeamMember = exports.updateTeamMember = exports.createTeamMember = exports.getTeamMemberById = exports.getAllTeamMembers = void 0;
const database_1 = require("../config/database");
const types_1 = require("../types");
const errorHandler_1 = require("../middleware/errorHandler");
exports.getAllTeamMembers = (0, errorHandler_1.asyncHandler)(async (_req, res) => {
    const result = await (0, database_1.query)('SELECT * FROM company_team ORDER BY created_at ASC');
    res.json({
        success: true,
        data: result.rows,
    });
});
exports.getTeamMemberById = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const result = await (0, database_1.query)('SELECT * FROM company_team WHERE id = $1', [id]);
    if (result.rows.length === 0) {
        throw new types_1.AppError('Team member not found', 404);
    }
    res.json({
        success: true,
        data: result.rows[0],
    });
});
exports.createTeamMember = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { name, role, email, phone, image_url, description } = req.body;
    if (!name || !role) {
        throw new types_1.AppError('Name and role are required', 400);
    }
    const result = await (0, database_1.query)(`INSERT INTO company_team (name, role, email, phone, image_url, description)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`, [name, role, email, phone, image_url, description]);
    res.status(201).json({
        success: true,
        message: 'Team member added successfully',
        data: result.rows[0],
    });
});
exports.updateTeamMember = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const { name, role, email, phone, image_url, description } = req.body;
    const result = await (0, database_1.query)(`UPDATE company_team 
     SET name = COALESCE($1, name),
         role = COALESCE($2, role),
         email = COALESCE($3, email),
         phone = COALESCE($4, phone),
         image_url = COALESCE($5, image_url),
         description = COALESCE($6, description),
         updated_at = NOW()
     WHERE id = $7
     RETURNING *`, [name, role, email, phone, image_url, description, id]);
    if (result.rows.length === 0) {
        throw new types_1.AppError('Team member not found', 404);
    }
    res.json({
        success: true,
        message: 'Team member updated successfully',
        data: result.rows[0],
    });
});
exports.deleteTeamMember = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const result = await (0, database_1.query)('DELETE FROM company_team WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
        throw new types_1.AppError('Team member not found', 404);
    }
    res.json({
        success: true,
        message: 'Team member deleted successfully',
    });
});
//# sourceMappingURL=team.controller.js.map
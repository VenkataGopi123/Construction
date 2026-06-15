"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfile = exports.deleteUser = exports.updateUser = exports.createUser = exports.getUser = exports.listUsers = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const database_1 = require("../config/database");
const types_1 = require("../types");
const helpers_1 = require("../utils/helpers");
const errorHandler_1 = require("../middleware/errorHandler");
const audit_1 = require("../middleware/audit");
exports.listUsers = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const pagination = (0, helpers_1.parsePagination)(req.query);
    const { role, search } = req.query;
    const conditions = ['1=1'];
    const params = [];
    let paramIndex = 1;
    if (role) {
        conditions.push(`role = $${paramIndex++}`);
        params.push(role);
    }
    if (search) {
        conditions.push(`(email ILIKE $${paramIndex} OR first_name ILIKE $${paramIndex} OR last_name ILIKE $${paramIndex})`);
        params.push(`%${search}%`);
        paramIndex++;
    }
    const whereClause = conditions.join(' AND ');
    const countResult = await (0, database_1.query)(`SELECT COUNT(*) FROM users WHERE ${whereClause}`, params);
    const total = parseInt(countResult.rows[0].count, 10);
    const result = await (0, database_1.query)(`SELECT id, email, first_name, last_name, phone, avatar_url, role, branch_id, is_active, is_verified, last_login, created_at
     FROM users WHERE ${whereClause}
     ORDER BY created_at DESC
     LIMIT $${paramIndex++} OFFSET $${paramIndex}`, [...params, pagination.limit, pagination.offset]);
    res.json({
        success: true,
        ...(0, helpers_1.buildPaginatedResponse)(result.rows, total, pagination),
    });
});
exports.getUser = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const result = await (0, database_1.query)(`SELECT id, email, first_name, last_name, phone, avatar_url, role, branch_id, is_active, is_verified, last_login, created_at
     FROM users WHERE id = $1`, [req.params.id]);
    if (!result.rows[0]) {
        throw new types_1.AppError('User not found', 404);
    }
    res.json({ success: true, data: result.rows[0] });
});
exports.createUser = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { email, password, first_name, last_name, phone, role, branch_id } = req.body;
    if (!email || !password || !first_name || !role) {
        throw new types_1.AppError('Email, password, first name, and role are required', 400);
    }
    const passwordHash = await bcryptjs_1.default.hash(password, 12);
    const result = await (0, database_1.query)(`INSERT INTO users (email, password_hash, first_name, last_name, phone, role, branch_id, is_verified)
     VALUES ($1, $2, $3, $4, $5, $6, $7, true)
     RETURNING id, email, first_name, last_name, phone, role, branch_id, is_active, is_verified, created_at`, [email.toLowerCase(), passwordHash, first_name, last_name ?? null, phone ?? null, role, branch_id ?? null]);
    res.status(201).json({ success: true, data: result.rows[0] });
});
exports.updateUser = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { first_name, last_name, phone, role, branch_id, is_active } = req.body;
    const existing = await (0, database_1.query)('SELECT * FROM users WHERE id = $1', [req.params.id]);
    if (!existing.rows[0]) {
        throw new types_1.AppError('User not found', 404);
    }
    const result = await (0, database_1.query)(`UPDATE users SET
       first_name = COALESCE($1, first_name),
       last_name = COALESCE($2, last_name),
       phone = COALESCE($3, phone),
       role = COALESCE($4, role),
       branch_id = COALESCE($5, branch_id),
       is_active = COALESCE($6, is_active)
     WHERE id = $7
     RETURNING id, email, first_name, last_name, phone, role, branch_id, is_active, is_verified, updated_at`, [first_name, last_name, phone, role, branch_id, is_active, req.params.id]);
    await (0, audit_1.logAuditEntry)(req, 'UPDATE', 'user', req.params.id, existing.rows[0], result.rows[0]);
    res.json({ success: true, data: result.rows[0] });
});
exports.deleteUser = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (req.params.id === req.user?.id) {
        throw new types_1.AppError('Cannot delete your own account', 400);
    }
    const existing = await (0, database_1.query)('SELECT id FROM users WHERE id = $1', [req.params.id]);
    if (!existing.rows[0]) {
        throw new types_1.AppError('User not found', 404);
    }
    await (0, database_1.query)('UPDATE users SET is_active = false WHERE id = $1', [req.params.id]);
    await (0, audit_1.logAuditEntry)(req, 'DELETE', 'user', req.params.id);
    res.json({ success: true, message: 'User deactivated successfully' });
});
exports.updateProfile = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { first_name, last_name, phone, avatar_url } = req.body;
    const result = await (0, database_1.query)(`UPDATE users SET
       first_name = COALESCE($1, first_name),
       last_name = COALESCE($2, last_name),
       phone = COALESCE($3, phone),
       avatar_url = COALESCE($4, avatar_url)
     WHERE id = $5
     RETURNING id, email, first_name, last_name, phone, avatar_url, role, branch_id`, [first_name, last_name, phone, avatar_url, req.user.id]);
    res.json({ success: true, data: (0, helpers_1.sanitizeUser)(result.rows[0]) });
});
//# sourceMappingURL=users.controller.js.map
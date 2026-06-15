"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignWorker = exports.addUpdate = exports.addMilestone = exports.deleteProject = exports.updateProject = exports.createProject = exports.getProject = exports.listProjects = void 0;
const database_1 = require("../config/database");
const types_1 = require("../types");
const helpers_1 = require("../utils/helpers");
const errorHandler_1 = require("../middleware/errorHandler");
const audit_1 = require("../middleware/audit");
exports.listProjects = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const pagination = (0, helpers_1.parsePagination)(req.query);
    const { status, project_type, search } = req.query;
    const conditions = ['1=1'];
    const params = [];
    let i = 1;
    if (status) {
        conditions.push(`p.status = $${i++}`);
        params.push(status);
    }
    if (project_type) {
        conditions.push(`p.project_type = $${i++}`);
        params.push(project_type);
    }
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
    const countResult = await (0, database_1.query)(`SELECT COUNT(*) FROM projects p WHERE ${where}`, params);
    const total = parseInt(countResult.rows[0].count, 10);
    const result = await (0, database_1.query)(`SELECT p.*, c.name AS customer_name, u.first_name || ' ' || COALESCE(u.last_name, '') AS manager_name
     FROM projects p
     LEFT JOIN customers c ON p.customer_id = c.id
     LEFT JOIN users u ON p.manager_id = u.id
     WHERE ${where}
     ORDER BY p.created_at DESC
     LIMIT $${i++} OFFSET $${i}`, [...params, pagination.limit, pagination.offset]);
    res.json({ success: true, ...(0, helpers_1.buildPaginatedResponse)(result.rows, total, pagination) });
});
exports.getProject = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const result = await (0, database_1.query)(`SELECT p.*, c.name AS customer_name, u.first_name || ' ' || COALESCE(u.last_name, '') AS manager_name
     FROM projects p
     LEFT JOIN customers c ON p.customer_id = c.id
     LEFT JOIN users u ON p.manager_id = u.id
     WHERE p.id = $1`, [req.params.id]);
    if (!result.rows[0])
        throw new types_1.AppError('Project not found', 404);
    const milestones = await (0, database_1.query)('SELECT * FROM project_milestones WHERE project_id = $1 ORDER BY sort_order', [req.params.id]);
    const updates = await (0, database_1.query)('SELECT pu.*, u.first_name || \' \' || COALESCE(u.last_name, \'\') AS author_name FROM project_updates pu LEFT JOIN users u ON pu.user_id = u.id WHERE pu.project_id = $1 ORDER BY pu.created_at DESC LIMIT 20', [req.params.id]);
    res.json({
        success: true,
        data: { ...result.rows[0], milestones: milestones.rows, updates: updates.rows },
    });
});
exports.createProject = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { name, project_type, customer_id, client_name, budget, start_date, end_date, location, latitude, longitude, branch_id, manager_id, description, status, } = req.body;
    if (!name || !project_type || !client_name) {
        throw new types_1.AppError('Name, project type, and client name are required', 400);
    }
    const projectCode = (0, helpers_1.generateCode)('project');
    const result = await (0, database_1.query)(`INSERT INTO projects (project_code, name, project_type, customer_id, client_name, budget, start_date, end_date, location, latitude, longitude, branch_id, manager_id, description, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
     RETURNING *`, [
        projectCode, name, project_type, customer_id ?? null, client_name,
        budget ?? 0, start_date ?? null, end_date ?? null, location ?? null,
        latitude ?? null, longitude ?? null, branch_id ?? null,
        manager_id ?? req.user?.id, description ?? null, status ?? 'planning',
    ]);
    res.status(201).json({ success: true, data: result.rows[0] });
});
exports.updateProject = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const existing = await (0, database_1.query)('SELECT * FROM projects WHERE id = $1', [req.params.id]);
    if (!existing.rows[0])
        throw new types_1.AppError('Project not found', 404);
    const fields = [
        'name', 'project_type', 'customer_id', 'client_name', 'budget', 'spent_amount',
        'start_date', 'end_date', 'actual_end_date', 'location', 'latitude', 'longitude',
        'status', 'progress_percent', 'branch_id', 'manager_id', 'description',
    ];
    const updates = [];
    const values = [];
    let i = 1;
    fields.forEach((field) => {
        if (req.body[field] !== undefined) {
            updates.push(`${field} = $${i++}`);
            values.push(req.body[field]);
        }
    });
    if (updates.length === 0)
        throw new types_1.AppError('No fields to update', 400);
    values.push(req.params.id);
    const result = await (0, database_1.query)(`UPDATE projects SET ${updates.join(', ')} WHERE id = $${i} RETURNING *`, values);
    await (0, audit_1.logAuditEntry)(req, 'UPDATE', 'project', req.params.id, existing.rows[0], result.rows[0]);
    res.json({ success: true, data: result.rows[0] });
});
exports.deleteProject = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const existing = await (0, database_1.query)('SELECT id FROM projects WHERE id = $1', [req.params.id]);
    if (!existing.rows[0])
        throw new types_1.AppError('Project not found', 404);
    await (0, database_1.query)('DELETE FROM projects WHERE id = $1', [req.params.id]);
    await (0, audit_1.logAuditEntry)(req, 'DELETE', 'project', req.params.id);
    res.json({ success: true, message: 'Project deleted successfully' });
});
exports.addMilestone = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { title, description, start_date, end_date, sort_order } = req.body;
    if (!title)
        throw new types_1.AppError('Title is required', 400);
    const result = await (0, database_1.query)(`INSERT INTO project_milestones (project_id, title, description, start_date, end_date, sort_order)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`, [req.params.id, title, description ?? null, start_date ?? null, end_date ?? null, sort_order ?? 0]);
    res.status(201).json({ success: true, data: result.rows[0] });
});
exports.addUpdate = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { title, description, update_date } = req.body;
    if (!description)
        throw new types_1.AppError('Description is required', 400);
    const result = await (0, database_1.query)(`INSERT INTO project_updates (project_id, user_id, title, description, update_date)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`, [req.params.id, req.user.id, title ?? null, description, update_date ?? null]);
    res.status(201).json({ success: true, data: result.rows[0] });
});
exports.assignWorker = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { worker_id, role } = req.body;
    if (!worker_id)
        throw new types_1.AppError('Worker ID is required', 400);
    const result = await (0, database_1.query)(`INSERT INTO project_assignments (project_id, worker_id, role)
     VALUES ($1, $2, $3) ON CONFLICT (project_id, worker_id) DO UPDATE SET role = $3 RETURNING *`, [req.params.id, worker_id, role ?? null]);
    res.status(201).json({ success: true, data: result.rows[0] });
});
//# sourceMappingURL=projects.controller.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePayroll = exports.getAttendance = exports.recordAttendance = exports.deleteWorker = exports.updateWorker = exports.createWorker = exports.getWorker = exports.listWorkers = void 0;
const database_1 = require("../config/database");
const types_1 = require("../types");
const helpers_1 = require("../utils/helpers");
const errorHandler_1 = require("../middleware/errorHandler");
const audit_1 = require("../middleware/audit");
exports.listWorkers = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const pagination = (0, helpers_1.parsePagination)(req.query);
    const { skill, search, is_active } = req.query;
    const conditions = ['1=1'];
    const params = [];
    let i = 1;
    if (skill) {
        conditions.push(`skill = $${i++}`);
        params.push(skill);
    }
    if (search) {
        conditions.push(`(first_name ILIKE $${i} OR last_name ILIKE $${i} OR employee_id ILIKE $${i})`);
        params.push(`%${search}%`);
        i++;
    }
    if (is_active !== undefined) {
        conditions.push(`is_active = $${i++}`);
        params.push(is_active === 'true');
    }
    const where = conditions.join(' AND ');
    const countResult = await (0, database_1.query)(`SELECT COUNT(*) FROM workers WHERE ${where}`, params);
    const total = parseInt(countResult.rows[0].count, 10);
    const result = await (0, database_1.query)(`SELECT * FROM workers WHERE ${where} ORDER BY first_name LIMIT $${i++} OFFSET $${i}`, [...params, pagination.limit, pagination.offset]);
    res.json({ success: true, ...(0, helpers_1.buildPaginatedResponse)(result.rows, total, pagination) });
});
exports.getWorker = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const result = await (0, database_1.query)('SELECT * FROM workers WHERE id = $1', [req.params.id]);
    if (!result.rows[0])
        throw new types_1.AppError('Worker not found', 404);
    const assignments = await (0, database_1.query)(`SELECT pa.*, p.name AS project_name, p.project_code
     FROM project_assignments pa
     JOIN projects p ON pa.project_id = p.id
     WHERE pa.worker_id = $1`, [req.params.id]);
    res.json({ success: true, data: { ...result.rows[0], assignments: assignments.rows } });
});
exports.createWorker = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { first_name, last_name, aadhaar, phone, email, skill, daily_wage, monthly_salary, branch_id, user_id, } = req.body;
    if (!first_name || !phone || !skill) {
        throw new types_1.AppError('First name, phone, and skill are required', 400);
    }
    const employeeId = (0, helpers_1.generateCode)('worker');
    const result = await (0, database_1.query)(`INSERT INTO workers (employee_id, user_id, first_name, last_name, aadhaar, phone, email, skill, daily_wage, monthly_salary, branch_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`, [
        employeeId, user_id ?? null, first_name, last_name ?? null, aadhaar ?? null,
        phone, email ?? null, skill, daily_wage ?? 0, monthly_salary ?? 0, branch_id ?? null,
    ]);
    res.status(201).json({ success: true, data: result.rows[0] });
});
exports.updateWorker = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const existing = await (0, database_1.query)('SELECT * FROM workers WHERE id = $1', [req.params.id]);
    if (!existing.rows[0])
        throw new types_1.AppError('Worker not found', 404);
    const fields = ['first_name', 'last_name', 'aadhaar', 'phone', 'email', 'skill', 'daily_wage', 'monthly_salary', 'branch_id', 'is_active', 'user_id'];
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
    const result = await (0, database_1.query)(`UPDATE workers SET ${updates.join(', ')} WHERE id = $${i} RETURNING *`, values);
    await (0, audit_1.logAuditEntry)(req, 'UPDATE', 'worker', req.params.id, existing.rows[0], result.rows[0]);
    res.json({ success: true, data: result.rows[0] });
});
exports.deleteWorker = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const existing = await (0, database_1.query)('SELECT id FROM workers WHERE id = $1', [req.params.id]);
    if (!existing.rows[0])
        throw new types_1.AppError('Worker not found', 404);
    await (0, database_1.query)('UPDATE workers SET is_active = false WHERE id = $1', [req.params.id]);
    await (0, audit_1.logAuditEntry)(req, 'DELETE', 'worker', req.params.id);
    res.json({ success: true, message: 'Worker deactivated successfully' });
});
exports.recordAttendance = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { worker_id, project_id, date, status, check_in, check_out, hours_worked, notes } = req.body;
    if (!worker_id || !date)
        throw new types_1.AppError('Worker ID and date are required', 400);
    const result = await (0, database_1.query)(`INSERT INTO attendance (worker_id, project_id, date, status, check_in, check_out, hours_worked, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     ON CONFLICT (worker_id, date) DO UPDATE SET
       status = $4, check_in = $5, check_out = $6, hours_worked = $7, notes = $8, project_id = $2
     RETURNING *`, [worker_id, project_id ?? null, date, status ?? 'present', check_in ?? null, check_out ?? null, hours_worked ?? null, notes ?? null]);
    res.status(201).json({ success: true, data: result.rows[0] });
});
exports.getAttendance = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { worker_id, project_id, from_date, to_date } = req.query;
    const conditions = ['1=1'];
    const params = [];
    let i = 1;
    if (worker_id) {
        conditions.push(`a.worker_id = $${i++}`);
        params.push(worker_id);
    }
    if (project_id) {
        conditions.push(`a.project_id = $${i++}`);
        params.push(project_id);
    }
    if (from_date) {
        conditions.push(`a.date >= $${i++}`);
        params.push(from_date);
    }
    if (to_date) {
        conditions.push(`a.date <= $${i++}`);
        params.push(to_date);
    }
    const result = await (0, database_1.query)(`SELECT a.*, w.first_name || ' ' || COALESCE(w.last_name, '') AS worker_name
     FROM attendance a
     JOIN workers w ON a.worker_id = w.id
     WHERE ${conditions.join(' AND ')}
     ORDER BY a.date DESC`, params);
    res.json({ success: true, data: result.rows });
});
exports.generatePayroll = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { worker_id, month, year, overtime, deductions } = req.body;
    if (!worker_id || !month || !year) {
        throw new types_1.AppError('Worker ID, month, and year are required', 400);
    }
    const worker = await (0, database_1.query)('SELECT monthly_salary FROM workers WHERE id = $1', [worker_id]);
    if (!worker.rows[0])
        throw new types_1.AppError('Worker not found', 404);
    const baseSalary = parseFloat(worker.rows[0].monthly_salary);
    const ot = overtime ?? 0;
    const ded = deductions ?? 0;
    const netSalary = baseSalary + ot - ded;
    const result = await (0, database_1.query)(`INSERT INTO payroll (worker_id, month, year, base_salary, overtime, deductions, net_salary)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     ON CONFLICT (worker_id, month, year) DO UPDATE SET
       base_salary = $4, overtime = $5, deductions = $6, net_salary = $7
     RETURNING *`, [worker_id, month, year, baseSalary, ot, ded, netSalary]);
    res.status(201).json({ success: true, data: result.rows[0] });
});
//# sourceMappingURL=workers.controller.js.map
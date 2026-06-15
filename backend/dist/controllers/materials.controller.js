"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLowStock = exports.createCategory = exports.listCategories = exports.adjustStock = exports.deleteMaterial = exports.updateMaterial = exports.createMaterial = exports.getMaterial = exports.listMaterials = void 0;
const database_1 = require("../config/database");
const types_1 = require("../types");
const helpers_1 = require("../utils/helpers");
const errorHandler_1 = require("../middleware/errorHandler");
const audit_1 = require("../middleware/audit");
exports.listMaterials = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const pagination = (0, helpers_1.parsePagination)(req.query);
    const { category_id, search, low_stock } = req.query;
    const conditions = ['m.is_active = true'];
    const params = [];
    let i = 1;
    if (category_id) {
        conditions.push(`m.category_id = $${i++}`);
        params.push(category_id);
    }
    if (search) {
        conditions.push(`(m.name ILIKE $${i} OR m.sku ILIKE $${i})`);
        params.push(`%${search}%`);
        i++;
    }
    if (low_stock === 'true') {
        conditions.push('m.quantity <= m.min_stock_level');
    }
    const where = conditions.join(' AND ');
    const countResult = await (0, database_1.query)(`SELECT COUNT(*) FROM materials m WHERE ${where}`, params);
    const total = parseInt(countResult.rows[0].count, 10);
    const result = await (0, database_1.query)(`SELECT m.*, mc.name AS category_name, s.company_name AS supplier_name
     FROM materials m
     LEFT JOIN material_categories mc ON m.category_id = mc.id
     LEFT JOIN suppliers s ON m.supplier_id = s.id
     WHERE ${where}
     ORDER BY m.name
     LIMIT $${i++} OFFSET $${i}`, [...params, pagination.limit, pagination.offset]);
    res.json({ success: true, ...(0, helpers_1.buildPaginatedResponse)(result.rows, total, pagination) });
});
exports.getMaterial = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const result = await (0, database_1.query)(`SELECT m.*, mc.name AS category_name, s.company_name AS supplier_name
     FROM materials m
     LEFT JOIN material_categories mc ON m.category_id = mc.id
     LEFT JOIN suppliers s ON m.supplier_id = s.id
     WHERE m.id = $1`, [req.params.id]);
    if (!result.rows[0])
        throw new types_1.AppError('Material not found', 404);
    const stockLogs = await (0, database_1.query)('SELECT * FROM material_stock_logs WHERE material_id = $1 ORDER BY created_at DESC LIMIT 20', [req.params.id]);
    res.json({ success: true, data: { ...result.rows[0], stock_logs: stockLogs.rows } });
});
exports.createMaterial = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { name, category_id, unit, quantity, min_stock_level, cost_price, selling_price, supplier_id, warehouse_id, barcode, description, sku, } = req.body;
    if (!name || cost_price === undefined || selling_price === undefined) {
        throw new types_1.AppError('Name, cost price, and selling price are required', 400);
    }
    const materialSku = sku ?? (0, helpers_1.generateSku)(name);
    const result = await (0, database_1.query)(`INSERT INTO materials (sku, name, category_id, unit, quantity, min_stock_level, cost_price, selling_price, supplier_id, warehouse_id, barcode, description)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`, [
        materialSku, name, category_id ?? null, unit ?? 'unit', quantity ?? 0,
        min_stock_level ?? 10, cost_price, selling_price, supplier_id ?? null,
        warehouse_id ?? null, barcode ?? null, description ?? null,
    ]);
    res.status(201).json({ success: true, data: result.rows[0] });
});
exports.updateMaterial = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const existing = await (0, database_1.query)('SELECT * FROM materials WHERE id = $1', [req.params.id]);
    if (!existing.rows[0])
        throw new types_1.AppError('Material not found', 404);
    const fields = ['name', 'category_id', 'unit', 'quantity', 'min_stock_level', 'cost_price', 'selling_price', 'supplier_id', 'warehouse_id', 'barcode', 'description', 'is_active'];
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
    const result = await (0, database_1.query)(`UPDATE materials SET ${updates.join(', ')} WHERE id = $${i} RETURNING *`, values);
    await (0, audit_1.logAuditEntry)(req, 'UPDATE', 'material', req.params.id, existing.rows[0], result.rows[0]);
    res.json({ success: true, data: result.rows[0] });
});
exports.deleteMaterial = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const existing = await (0, database_1.query)('SELECT id FROM materials WHERE id = $1', [req.params.id]);
    if (!existing.rows[0])
        throw new types_1.AppError('Material not found', 404);
    await (0, database_1.query)('UPDATE materials SET is_active = false WHERE id = $1', [req.params.id]);
    await (0, audit_1.logAuditEntry)(req, 'DELETE', 'material', req.params.id);
    res.json({ success: true, message: 'Material deactivated successfully' });
});
exports.adjustStock = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { change_type, quantity_change, notes, warehouse_id } = req.body;
    if (!change_type || quantity_change === undefined) {
        throw new types_1.AppError('Change type and quantity change are required', 400);
    }
    const material = await (0, database_1.query)('SELECT * FROM materials WHERE id = $1', [req.params.id]);
    if (!material.rows[0])
        throw new types_1.AppError('Material not found', 404);
    const currentQty = parseFloat(material.rows[0].quantity);
    const newQty = currentQty + parseFloat(quantity_change);
    if (newQty < 0)
        throw new types_1.AppError('Insufficient stock', 400);
    await (0, database_1.query)('UPDATE materials SET quantity = $1 WHERE id = $2', [newQty, req.params.id]);
    const log = await (0, database_1.query)(`INSERT INTO material_stock_logs (material_id, warehouse_id, change_type, quantity_change, quantity_after, notes, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`, [req.params.id, warehouse_id ?? null, change_type, quantity_change, newQty, notes ?? null, req.user.id]);
    res.json({ success: true, data: log.rows[0] });
});
exports.listCategories = (0, errorHandler_1.asyncHandler)(async (_req, res) => {
    const result = await (0, database_1.query)('SELECT * FROM material_categories ORDER BY name');
    res.json({ success: true, data: result.rows });
});
exports.createCategory = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { name, description } = req.body;
    if (!name)
        throw new types_1.AppError('Name is required', 400);
    const result = await (0, database_1.query)('INSERT INTO material_categories (name, description) VALUES ($1, $2) RETURNING *', [name, description ?? null]);
    res.status(201).json({ success: true, data: result.rows[0] });
});
exports.getLowStock = (0, errorHandler_1.asyncHandler)(async (_req, res) => {
    const result = await (0, database_1.query)('SELECT * FROM v_low_stock_materials ORDER BY quantity ASC');
    res.json({ success: true, data: result.rows });
});
//# sourceMappingURL=materials.controller.js.map
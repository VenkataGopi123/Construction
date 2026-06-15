"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPurchaseOrder = exports.listPurchaseOrders = exports.deleteSupplier = exports.updateSupplier = exports.createSupplier = exports.getSupplier = exports.listSuppliers = void 0;
const database_1 = require("../config/database");
const types_1 = require("../types");
const helpers_1 = require("../utils/helpers");
const errorHandler_1 = require("../middleware/errorHandler");
const audit_1 = require("../middleware/audit");
exports.listSuppliers = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const pagination = (0, helpers_1.parsePagination)(req.query);
    const { search, is_active } = req.query;
    const conditions = ['1=1'];
    const params = [];
    let i = 1;
    if (search) {
        conditions.push(`(company_name ILIKE $${i} OR contact_person ILIKE $${i} OR supplier_code ILIKE $${i})`);
        params.push(`%${search}%`);
        i++;
    }
    if (is_active !== undefined) {
        conditions.push(`is_active = $${i++}`);
        params.push(is_active === 'true');
    }
    const where = conditions.join(' AND ');
    const countResult = await (0, database_1.query)(`SELECT COUNT(*) FROM suppliers WHERE ${where}`, params);
    const total = parseInt(countResult.rows[0].count, 10);
    const result = await (0, database_1.query)(`SELECT * FROM suppliers WHERE ${where} ORDER BY company_name LIMIT $${i++} OFFSET $${i}`, [...params, pagination.limit, pagination.offset]);
    res.json({ success: true, ...(0, helpers_1.buildPaginatedResponse)(result.rows, total, pagination) });
});
exports.getSupplier = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const result = await (0, database_1.query)('SELECT * FROM suppliers WHERE id = $1', [req.params.id]);
    if (!result.rows[0])
        throw new types_1.AppError('Supplier not found', 404);
    const materials = await (0, database_1.query)('SELECT id, sku, name, quantity, cost_price FROM materials WHERE supplier_id = $1 AND is_active = true', [req.params.id]);
    res.json({ success: true, data: { ...result.rows[0], materials: materials.rows } });
});
exports.createSupplier = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { company_name, contact_person, email, phone, address, city, gst_number, pan, material_categories, user_id, } = req.body;
    if (!company_name || !phone)
        throw new types_1.AppError('Company name and phone are required', 400);
    const supplierCode = (0, helpers_1.generateCode)('supplier');
    const result = await (0, database_1.query)(`INSERT INTO suppliers (supplier_code, user_id, company_name, contact_person, email, phone, address, city, gst_number, pan, material_categories)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`, [
        supplierCode, user_id ?? null, company_name, contact_person ?? null,
        email ?? null, phone, address ?? null, city ?? null,
        gst_number ?? null, pan ?? null, material_categories ?? null,
    ]);
    res.status(201).json({ success: true, data: result.rows[0] });
});
exports.updateSupplier = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const existing = await (0, database_1.query)('SELECT * FROM suppliers WHERE id = $1', [req.params.id]);
    if (!existing.rows[0])
        throw new types_1.AppError('Supplier not found', 404);
    const fields = ['company_name', 'contact_person', 'email', 'phone', 'address', 'city', 'gst_number', 'pan', 'material_categories', 'rating', 'is_active', 'user_id'];
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
    const result = await (0, database_1.query)(`UPDATE suppliers SET ${updates.join(', ')} WHERE id = $${i} RETURNING *`, values);
    await (0, audit_1.logAuditEntry)(req, 'UPDATE', 'supplier', req.params.id, existing.rows[0], result.rows[0]);
    res.json({ success: true, data: result.rows[0] });
});
exports.deleteSupplier = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const existing = await (0, database_1.query)('SELECT id FROM suppliers WHERE id = $1', [req.params.id]);
    if (!existing.rows[0])
        throw new types_1.AppError('Supplier not found', 404);
    await (0, database_1.query)('UPDATE suppliers SET is_active = false WHERE id = $1', [req.params.id]);
    await (0, audit_1.logAuditEntry)(req, 'DELETE', 'supplier', req.params.id);
    res.json({ success: true, message: 'Supplier deactivated successfully' });
});
exports.listPurchaseOrders = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const pagination = (0, helpers_1.parsePagination)(req.query);
    const { status, supplier_id } = req.query;
    const conditions = ['1=1'];
    const params = [];
    let i = 1;
    if (status) {
        conditions.push(`po.status = $${i++}`);
        params.push(status);
    }
    if (supplier_id) {
        conditions.push(`po.supplier_id = $${i++}`);
        params.push(supplier_id);
    }
    const where = conditions.join(' AND ');
    const countResult = await (0, database_1.query)(`SELECT COUNT(*) FROM purchase_orders po WHERE ${where}`, params);
    const total = parseInt(countResult.rows[0].count, 10);
    const result = await (0, database_1.query)(`SELECT po.*, s.company_name AS supplier_name
     FROM purchase_orders po
     LEFT JOIN suppliers s ON po.supplier_id = s.id
     WHERE ${where}
     ORDER BY po.created_at DESC
     LIMIT $${i++} OFFSET $${i}`, [...params, pagination.limit, pagination.offset]);
    res.json({ success: true, ...(0, helpers_1.buildPaginatedResponse)(result.rows, total, pagination) });
});
exports.createPurchaseOrder = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { supplier_id, warehouse_id, project_id, items, expected_delivery, notes } = req.body;
    if (!supplier_id || !items?.length) {
        throw new types_1.AppError('Supplier and items are required', 400);
    }
    const poNumber = `PO-${Date.now()}`;
    let totalAmount = 0;
    let taxAmount = 0;
    items.forEach((item) => {
        const lineTotal = item.quantity * item.unit_price;
        totalAmount += lineTotal;
        taxAmount += lineTotal * 0.18;
    });
    const po = await (0, database_1.query)(`INSERT INTO purchase_orders (po_number, supplier_id, warehouse_id, project_id, total_amount, tax_amount, expected_delivery, notes, created_by, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'draft') RETURNING *`, [poNumber, supplier_id, warehouse_id ?? null, project_id ?? null, totalAmount, taxAmount, expected_delivery ?? null, notes ?? null, req.user.id]);
    for (const item of items) {
        await (0, database_1.query)(`INSERT INTO purchase_order_items (purchase_order_id, material_id, quantity, unit_price, total_price)
       VALUES ($1, $2, $3, $4, $5)`, [po.rows[0].id, item.material_id, item.quantity, item.unit_price, item.quantity * item.unit_price]);
    }
    res.status(201).json({ success: true, data: po.rows[0] });
});
//# sourceMappingURL=suppliers.controller.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInvoice = exports.createInvoice = exports.listInvoices = exports.deletePayment = exports.updatePayment = exports.createPayment = exports.getPayment = exports.listPayments = void 0;
const database_1 = require("../config/database");
const types_1 = require("../types");
const helpers_1 = require("../utils/helpers");
const errorHandler_1 = require("../middleware/errorHandler");
const audit_1 = require("../middleware/audit");
exports.listPayments = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const pagination = (0, helpers_1.parsePagination)(req.query);
    const { customer_id, project_id, payment_status } = req.query;
    const conditions = ['1=1'];
    const params = [];
    let i = 1;
    if (customer_id) {
        conditions.push(`p.customer_id = $${i++}`);
        params.push(customer_id);
    }
    if (project_id) {
        conditions.push(`p.project_id = $${i++}`);
        params.push(project_id);
    }
    if (payment_status) {
        conditions.push(`p.payment_status = $${i++}`);
        params.push(payment_status);
    }
    const where = conditions.join(' AND ');
    const countResult = await (0, database_1.query)(`SELECT COUNT(*) FROM payments p WHERE ${where}`, params);
    const total = parseInt(countResult.rows[0].count, 10);
    const result = await (0, database_1.query)(`SELECT p.*, c.name AS customer_name, i.invoice_number
     FROM payments p
     LEFT JOIN customers c ON p.customer_id = c.id
     LEFT JOIN invoices i ON p.invoice_id = i.id
     WHERE ${where}
     ORDER BY p.paid_at DESC
     LIMIT $${i++} OFFSET $${i}`, [...params, pagination.limit, pagination.offset]);
    res.json({ success: true, ...(0, helpers_1.buildPaginatedResponse)(result.rows, total, pagination) });
});
exports.getPayment = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const result = await (0, database_1.query)(`SELECT p.*, c.name AS customer_name, i.invoice_number
     FROM payments p
     LEFT JOIN customers c ON p.customer_id = c.id
     LEFT JOIN invoices i ON p.invoice_id = i.id
     WHERE p.id = $1`, [req.params.id]);
    if (!result.rows[0])
        throw new types_1.AppError('Payment not found', 404);
    res.json({ success: true, data: result.rows[0] });
});
exports.createPayment = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { invoice_id, customer_id, project_id, amount, payment_method, payment_status, transaction_id, is_advance, notes, } = req.body;
    if (!amount || !payment_method) {
        throw new types_1.AppError('Amount and payment method are required', 400);
    }
    const paymentNumber = (0, helpers_1.generateCode)('payment');
    const result = await (0, database_1.query)(`INSERT INTO payments (payment_number, invoice_id, customer_id, project_id, amount, payment_method, payment_status, transaction_id, is_advance, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`, [
        paymentNumber, invoice_id ?? null, customer_id ?? null, project_id ?? null,
        amount, payment_method, payment_status ?? 'paid', transaction_id ?? null,
        is_advance ?? false, notes ?? null,
    ]);
    if (invoice_id) {
        await (0, database_1.query)(`UPDATE invoices SET
         paid_amount = paid_amount + $1,
         due_amount = GREATEST(0, due_amount - $1),
         status = CASE WHEN due_amount - $1 <= 0 THEN 'paid'::payment_status WHEN paid_amount + $1 > 0 THEN 'partial'::payment_status ELSE status END
       WHERE id = $2`, [amount, invoice_id]);
    }
    res.status(201).json({ success: true, data: result.rows[0] });
});
exports.updatePayment = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const existing = await (0, database_1.query)('SELECT * FROM payments WHERE id = $1', [req.params.id]);
    if (!existing.rows[0])
        throw new types_1.AppError('Payment not found', 404);
    const fields = ['payment_status', 'transaction_id', 'notes'];
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
    const result = await (0, database_1.query)(`UPDATE payments SET ${updates.join(', ')} WHERE id = $${i} RETURNING *`, values);
    await (0, audit_1.logAuditEntry)(req, 'UPDATE', 'payment', req.params.id, existing.rows[0], result.rows[0]);
    res.json({ success: true, data: result.rows[0] });
});
exports.deletePayment = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const existing = await (0, database_1.query)('SELECT * FROM payments WHERE id = $1', [req.params.id]);
    if (!existing.rows[0])
        throw new types_1.AppError('Payment not found', 404);
    await (0, database_1.query)('DELETE FROM payments WHERE id = $1', [req.params.id]);
    await (0, audit_1.logAuditEntry)(req, 'DELETE', 'payment', req.params.id);
    res.json({ success: true, message: 'Payment deleted successfully' });
});
exports.listInvoices = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const pagination = (0, helpers_1.parsePagination)(req.query);
    const { customer_id, status } = req.query;
    const conditions = ['1=1'];
    const params = [];
    let i = 1;
    if (customer_id) {
        conditions.push(`i.customer_id = $${i++}`);
        params.push(customer_id);
    }
    if (status) {
        conditions.push(`i.status = $${i++}`);
        params.push(status);
    }
    const where = conditions.join(' AND ');
    const countResult = await (0, database_1.query)(`SELECT COUNT(*) FROM invoices i WHERE ${where}`, params);
    const total = parseInt(countResult.rows[0].count, 10);
    const result = await (0, database_1.query)(`SELECT i.*, c.name AS customer_name, p.name AS project_name
     FROM invoices i
     LEFT JOIN customers c ON i.customer_id = c.id
     LEFT JOIN projects p ON i.project_id = p.id
     WHERE ${where}
     ORDER BY i.created_at DESC
     LIMIT $${i++} OFFSET $${i}`, [...params, pagination.limit, pagination.offset]);
    res.json({ success: true, ...(0, helpers_1.buildPaginatedResponse)(result.rows, total, pagination) });
});
exports.createInvoice = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { customer_id, project_id, quotation_id, items, gst_rate, due_date, notes } = req.body;
    if (!customer_id || !items?.length) {
        throw new types_1.AppError('Customer and items are required', 400);
    }
    const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
    const rate = gst_rate ?? 18;
    const { gstAmount, total } = (0, helpers_1.calculateGST)(subtotal, rate);
    const invoiceNumber = (0, helpers_1.generateCode)('invoice');
    const invoice = await (0, database_1.query)(`INSERT INTO invoices (invoice_number, customer_id, project_id, quotation_id, subtotal, gst_rate, gst_amount, total_amount, due_amount, due_date, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`, [invoiceNumber, customer_id, project_id ?? null, quotation_id ?? null, subtotal, rate, gstAmount, total, total, due_date ?? null, notes ?? null]);
    for (const item of items) {
        await (0, database_1.query)(`INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, total_price)
       VALUES ($1, $2, $3, $4, $5)`, [invoice.rows[0].id, item.description, item.quantity ?? 1, item.unit_price, (item.quantity ?? 1) * item.unit_price]);
    }
    res.status(201).json({ success: true, data: invoice.rows[0] });
});
exports.getInvoice = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const invoice = await (0, database_1.query)(`SELECT i.*, c.name AS customer_name, c.address AS customer_address, c.gst_number AS customer_gst, p.name AS project_name
     FROM invoices i
     LEFT JOIN customers c ON i.customer_id = c.id
     LEFT JOIN projects p ON i.project_id = p.id
     WHERE i.id = $1`, [req.params.id]);
    if (!invoice.rows[0])
        throw new types_1.AppError('Invoice not found', 404);
    const items = await (0, database_1.query)('SELECT * FROM invoice_items WHERE invoice_id = $1', [req.params.id]);
    res.json({ success: true, data: { ...invoice.rows[0], items: items.rows } });
});
//# sourceMappingURL=payments.controller.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateQuotationStatus = exports.generateQuotationPdf = exports.deleteQuotation = exports.updateQuotation = exports.createQuotation = exports.calculateQuotationPreview = exports.getQuotation = exports.listQuotations = void 0;
const database_1 = require("../config/database");
const types_1 = require("../types");
const helpers_1 = require("../utils/helpers");
const errorHandler_1 = require("../middleware/errorHandler");
const audit_1 = require("../middleware/audit");
const pdf_service_1 = require("../services/pdf.service");
exports.listQuotations = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const pagination = (0, helpers_1.parsePagination)(req.query);
    const { status, customer_id } = req.query;
    const conditions = ['1=1'];
    const params = [];
    let i = 1;
    if (status) {
        conditions.push(`q.status = $${i++}`);
        params.push(status);
    }
    if (customer_id) {
        conditions.push(`q.customer_id = $${i++}`);
        params.push(customer_id);
    }
    const where = conditions.join(' AND ');
    const countResult = await (0, database_1.query)(`SELECT COUNT(*) FROM quotations q WHERE ${where}`, params);
    const total = parseInt(countResult.rows[0].count, 10);
    const result = await (0, database_1.query)(`SELECT q.*, c.name AS customer_name
     FROM quotations q
     LEFT JOIN customers c ON q.customer_id = c.id
     WHERE ${where}
     ORDER BY q.created_at DESC
     LIMIT $${i++} OFFSET $${i}`, [...params, pagination.limit, pagination.offset]);
    res.json({ success: true, ...(0, helpers_1.buildPaginatedResponse)(result.rows, total, pagination) });
});
exports.getQuotation = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const result = await (0, database_1.query)(`SELECT q.*, c.name AS customer_name, c.email AS customer_email, c.phone AS customer_phone
     FROM quotations q
     LEFT JOIN customers c ON q.customer_id = c.id
     WHERE q.id = $1`, [req.params.id]);
    if (!result.rows[0])
        throw new types_1.AppError('Quotation not found', 404);
    res.json({ success: true, data: result.rows[0] });
});
exports.calculateQuotationPreview = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { project_type, area_sqft, material_cost, labor_cost, transport_cost, discount, gst_rate } = req.body;
    if (!project_type || !area_sqft) {
        throw new types_1.AppError('Project type and area are required', 400);
    }
    const calculation = (0, helpers_1.calculateQuotation)({
        project_type: project_type,
        area_sqft: parseFloat(area_sqft),
        material_cost: material_cost ? parseFloat(material_cost) : undefined,
        labor_cost: labor_cost ? parseFloat(labor_cost) : undefined,
        transport_cost: transport_cost ? parseFloat(transport_cost) : undefined,
        discount: discount ? parseFloat(discount) : undefined,
        gst_rate: gst_rate ? parseFloat(gst_rate) : undefined,
    });
    res.json({ success: true, data: calculation });
});
exports.createQuotation = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { customer_id, project_type, area_sqft, material_cost, labor_cost, transport_cost, discount, gst_rate, valid_until, notes, status, } = req.body;
    if (!project_type || !area_sqft) {
        throw new types_1.AppError('Project type and area are required', 400);
    }
    const calculation = (0, helpers_1.calculateQuotation)({
        project_type: project_type,
        area_sqft: parseFloat(area_sqft),
        material_cost: material_cost ? parseFloat(material_cost) : undefined,
        labor_cost: labor_cost ? parseFloat(labor_cost) : undefined,
        transport_cost: transport_cost ? parseFloat(transport_cost) : undefined,
        discount: discount ? parseFloat(discount) : undefined,
        gst_rate: gst_rate ? parseFloat(gst_rate) : undefined,
    });
    const quotationNumber = (0, helpers_1.generateCode)('quotation');
    const result = await (0, database_1.query)(`INSERT INTO quotations (quotation_number, customer_id, project_type, area_sqft, material_cost, labor_cost, transport_cost, tax_amount, discount, total_amount, status, valid_until, notes, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *`, [
        quotationNumber, customer_id ?? null, project_type, area_sqft,
        calculation.material_cost, calculation.labor_cost, calculation.transport_cost,
        calculation.tax_amount, calculation.discount, calculation.total_amount,
        status ?? 'draft', valid_until ?? null, notes ?? null, req.user.id,
    ]);
    res.status(201).json({ success: true, data: { ...result.rows[0], calculation } });
});
exports.updateQuotation = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const existing = await (0, database_1.query)('SELECT * FROM quotations WHERE id = $1', [req.params.id]);
    if (!existing.rows[0])
        throw new types_1.AppError('Quotation not found', 404);
    const { customer_id, project_type, area_sqft, material_cost, labor_cost, transport_cost, discount, gst_rate, valid_until, notes, status, } = req.body;
    let calculation = null;
    const pt = project_type ?? existing.rows[0].project_type;
    const area = area_sqft ?? existing.rows[0].area_sqft;
    if (area) {
        calculation = (0, helpers_1.calculateQuotation)({
            project_type: pt,
            area_sqft: parseFloat(area),
            material_cost: material_cost !== undefined ? parseFloat(material_cost) : undefined,
            labor_cost: labor_cost !== undefined ? parseFloat(labor_cost) : undefined,
            transport_cost: transport_cost !== undefined ? parseFloat(transport_cost) : undefined,
            discount: discount !== undefined ? parseFloat(discount) : undefined,
            gst_rate: gst_rate ? parseFloat(gst_rate) : undefined,
        });
    }
    const result = await (0, database_1.query)(`UPDATE quotations SET
       customer_id = COALESCE($1, customer_id),
       project_type = COALESCE($2, project_type),
       area_sqft = COALESCE($3, area_sqft),
       material_cost = COALESCE($4, material_cost),
       labor_cost = COALESCE($5, labor_cost),
       transport_cost = COALESCE($6, transport_cost),
       tax_amount = COALESCE($7, tax_amount),
       discount = COALESCE($8, discount),
       total_amount = COALESCE($9, total_amount),
       status = COALESCE($10, status),
       valid_until = COALESCE($11, valid_until),
       notes = COALESCE($12, notes)
     WHERE id = $13 RETURNING *`, [
        customer_id, project_type, area_sqft,
        calculation?.material_cost, calculation?.labor_cost, calculation?.transport_cost,
        calculation?.tax_amount, calculation?.discount, calculation?.total_amount,
        status, valid_until, notes, req.params.id,
    ]);
    await (0, audit_1.logAuditEntry)(req, 'UPDATE', 'quotation', req.params.id, existing.rows[0], result.rows[0]);
    res.json({ success: true, data: result.rows[0] });
});
exports.deleteQuotation = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const existing = await (0, database_1.query)('SELECT id FROM quotations WHERE id = $1', [req.params.id]);
    if (!existing.rows[0])
        throw new types_1.AppError('Quotation not found', 404);
    await (0, database_1.query)('DELETE FROM quotations WHERE id = $1', [req.params.id]);
    await (0, audit_1.logAuditEntry)(req, 'DELETE', 'quotation', req.params.id);
    res.json({ success: true, message: 'Quotation deleted successfully' });
});
exports.generateQuotationPdf = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const result = await (0, database_1.query)(`SELECT q.*, c.name AS customer_name FROM quotations q
     LEFT JOIN customers c ON q.customer_id = c.id WHERE q.id = $1`, [req.params.id]);
    if (!result.rows[0])
        throw new types_1.AppError('Quotation not found', 404);
    const q = result.rows[0];
    const pdf = await pdf_service_1.pdfService.generateQuotation({
        quotation_number: q.quotation_number,
        customer_name: q.customer_name ?? 'Walk-in Customer',
        project_type: q.project_type,
        area_sqft: parseFloat(q.area_sqft),
        material_cost: parseFloat(q.material_cost),
        labor_cost: parseFloat(q.labor_cost),
        transport_cost: parseFloat(q.transport_cost),
        tax_amount: parseFloat(q.tax_amount),
        discount: parseFloat(q.discount),
        total_amount: parseFloat(q.total_amount),
        valid_until: q.valid_until,
    });
    res.json({ success: true, data: { filename: pdf.filename, path: pdf.filePath } });
});
exports.updateQuotationStatus = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { status } = req.body;
    if (!status)
        throw new types_1.AppError('Status is required', 400);
    const result = await (0, database_1.query)('UPDATE quotations SET status = $1 WHERE id = $2 RETURNING *', [status, req.params.id]);
    if (!result.rows[0])
        throw new types_1.AppError('Quotation not found', 404);
    res.json({ success: true, data: result.rows[0] });
});
//# sourceMappingURL=quotations.controller.js.map
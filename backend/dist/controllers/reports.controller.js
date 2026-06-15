"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteReport = exports.downloadReport = exports.generateInvoicePdf = exports.generateFinancialReport = exports.generateInventoryReport = exports.generateProjectReport = exports.listReports = void 0;
const fs_1 = __importDefault(require("fs"));
const database_1 = require("../config/database");
const types_1 = require("../types");
const helpers_1 = require("../utils/helpers");
const errorHandler_1 = require("../middleware/errorHandler");
const report_service_1 = require("../services/report.service");
const pdf_service_1 = require("../services/pdf.service");
exports.listReports = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const pagination = (0, helpers_1.parsePagination)(req.query);
    const { report_type } = req.query;
    const conditions = ['1=1'];
    const params = [];
    let i = 1;
    if (report_type) {
        conditions.push(`report_type = $${i++}`);
        params.push(report_type);
    }
    const where = conditions.join(' AND ');
    const countResult = await (0, database_1.query)(`SELECT COUNT(*) FROM reports WHERE ${where}`, params);
    const total = parseInt(countResult.rows[0].count, 10);
    const result = await (0, database_1.query)(`SELECT r.*, u.first_name || ' ' || COALESCE(u.last_name, '') AS generated_by_name
     FROM reports r
     LEFT JOIN users u ON r.generated_by = u.id
     WHERE ${where}
     ORDER BY r.created_at DESC
     LIMIT $${i++} OFFSET $${i}`, [...params, pagination.limit, pagination.offset]);
    res.json({ success: true, ...(0, helpers_1.buildPaginatedResponse)(result.rows, total, pagination) });
});
exports.generateProjectReport = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const format = req.query.format ?? 'pdf';
    const report = await report_service_1.reportService.generateProjectReport(format);
    const saved = await (0, database_1.query)(`INSERT INTO reports (name, report_type, parameters, file_path, generated_by)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`, [`Projects Report`, 'projects', JSON.stringify({ format }), report.filePath, req.user.id]);
    res.status(201).json({
        success: true,
        data: { ...saved.rows[0], filename: report.filename },
    });
});
exports.generateInventoryReport = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const format = req.query.format ?? 'pdf';
    const report = await report_service_1.reportService.generateInventoryReport(format);
    const saved = await (0, database_1.query)(`INSERT INTO reports (name, report_type, parameters, file_path, generated_by)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`, [`Inventory Report`, 'inventory', JSON.stringify({ format }), report.filePath, req.user.id]);
    res.status(201).json({
        success: true,
        data: { ...saved.rows[0], filename: report.filename },
    });
});
exports.generateFinancialReport = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const format = req.query.format ?? 'pdf';
    const report = await report_service_1.reportService.generateFinancialReport(format);
    const saved = await (0, database_1.query)(`INSERT INTO reports (name, report_type, parameters, file_path, generated_by)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`, [`Financial Report`, 'financial', JSON.stringify({ format }), report.filePath, req.user.id]);
    res.status(201).json({
        success: true,
        data: { ...saved.rows[0], filename: report.filename },
    });
});
exports.generateInvoicePdf = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const invoice = await (0, database_1.query)(`SELECT i.*, c.name AS customer_name, c.address AS customer_address, c.gst_number AS customer_gst, p.name AS project_name
     FROM invoices i
     LEFT JOIN customers c ON i.customer_id = c.id
     LEFT JOIN projects p ON i.project_id = p.id
     WHERE i.id = $1`, [req.params.id]);
    if (!invoice.rows[0])
        throw new types_1.AppError('Invoice not found', 404);
    const items = await (0, database_1.query)('SELECT * FROM invoice_items WHERE invoice_id = $1', [req.params.id]);
    const inv = invoice.rows[0];
    const pdf = await pdf_service_1.pdfService.generateInvoice({
        invoice_number: inv.invoice_number,
        customer_name: inv.customer_name,
        customer_address: inv.customer_address,
        customer_gst: inv.customer_gst,
        project_name: inv.project_name,
        items: items.rows.map((item) => ({
            description: item.description,
            quantity: parseFloat(item.quantity),
            unit_price: parseFloat(item.unit_price),
            total_price: parseFloat(item.total_price),
        })),
        subtotal: parseFloat(inv.subtotal),
        gst_rate: parseFloat(inv.gst_rate),
        gst_amount: parseFloat(inv.gst_amount),
        total_amount: parseFloat(inv.total_amount),
        due_date: inv.due_date,
        notes: inv.notes,
    });
    res.json({ success: true, data: { filename: pdf.filename, path: pdf.filePath } });
});
exports.downloadReport = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const result = await (0, database_1.query)('SELECT * FROM reports WHERE id = $1', [req.params.id]);
    if (!result.rows[0])
        throw new types_1.AppError('Report not found', 404);
    const report = result.rows[0];
    if (!report.file_path || !fs_1.default.existsSync(report.file_path)) {
        throw new types_1.AppError('Report file not found', 404);
    }
    res.download(report.file_path, `${report.name}.${report.file_path.endsWith('.xlsx') ? 'xlsx' : 'pdf'}`);
});
exports.deleteReport = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const result = await (0, database_1.query)('SELECT * FROM reports WHERE id = $1', [req.params.id]);
    if (!result.rows[0])
        throw new types_1.AppError('Report not found', 404);
    const filePath = result.rows[0].file_path;
    if (filePath && fs_1.default.existsSync(filePath)) {
        fs_1.default.unlinkSync(filePath);
    }
    await (0, database_1.query)('DELETE FROM reports WHERE id = $1', [req.params.id]);
    res.json({ success: true, message: 'Report deleted successfully' });
});
//# sourceMappingURL=reports.controller.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportService = void 0;
const exceljs_1 = __importDefault(require("exceljs"));
const pdfkit_1 = __importDefault(require("pdfkit"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const env_1 = require("../config/env");
const database_1 = require("../config/database");
const helpers_1 = require("../utils/helpers");
class ReportService {
    outputDir;
    constructor() {
        this.outputDir = path_1.default.resolve(env_1.env.upload.uploadDir, 'reports');
        if (!fs_1.default.existsSync(this.outputDir)) {
            fs_1.default.mkdirSync(this.outputDir, { recursive: true });
        }
    }
    async generateProjectReport(format = 'pdf') {
        const projects = await (0, database_1.query)(`SELECT p.*, c.name AS customer_name, u.first_name || ' ' || COALESCE(u.last_name, '') AS manager_name
       FROM projects p
       LEFT JOIN customers c ON p.customer_id = c.id
       LEFT JOIN users u ON p.manager_id = u.id
       ORDER BY p.created_at DESC`);
        const timestamp = Date.now();
        if (format === 'excel') {
            return this.generateProjectsExcel(projects.rows, timestamp);
        }
        return this.generateProjectsPDF(projects.rows, timestamp);
    }
    async generateInventoryReport(format = 'pdf') {
        const materials = await (0, database_1.query)(`SELECT m.*, mc.name AS category_name, s.company_name AS supplier_name
       FROM materials m
       LEFT JOIN material_categories mc ON m.category_id = mc.id
       LEFT JOIN suppliers s ON m.supplier_id = s.id
       WHERE m.is_active = true
       ORDER BY m.name`);
        const timestamp = Date.now();
        if (format === 'excel') {
            return this.generateInventoryExcel(materials.rows, timestamp);
        }
        return this.generateInventoryPDF(materials.rows, timestamp);
    }
    async generateFinancialReport(format = 'pdf') {
        const payments = await (0, database_1.query)(`SELECT p.*, c.name AS customer_name, i.invoice_number
       FROM payments p
       LEFT JOIN customers c ON p.customer_id = c.id
       LEFT JOIN invoices i ON p.invoice_id = i.id
       ORDER BY p.paid_at DESC`);
        const timestamp = Date.now();
        if (format === 'excel') {
            return this.generateFinancialExcel(payments.rows, timestamp);
        }
        return this.generateFinancialPDF(payments.rows, timestamp);
    }
    async generateProjectsPDF(rows, timestamp) {
        const filename = `projects-report-${timestamp}.pdf`;
        const filePath = path_1.default.join(this.outputDir, filename);
        return new Promise((resolve, reject) => {
            const doc = new pdfkit_1.default({ margin: 50, size: 'A4', layout: 'landscape' });
            const stream = fs_1.default.createWriteStream(filePath);
            doc.pipe(stream);
            doc.fontSize(18).font('Helvetica-Bold').text('Projects Report', { align: 'center' });
            doc.moveDown();
            doc.fontSize(9).font('Helvetica');
            rows.forEach((row) => {
                doc.text(`${row.project_code} | ${row.name} | ${row.status} | Budget: ${(0, helpers_1.formatCurrency)(Number(row.budget))} | Progress: ${row.progress_percent}%`);
            });
            doc.end();
            stream.on('finish', () => resolve({ filePath, filename }));
            stream.on('error', reject);
        });
    }
    async generateProjectsExcel(rows, timestamp) {
        const filename = `projects-report-${timestamp}.xlsx`;
        const filePath = path_1.default.join(this.outputDir, filename);
        const workbook = new exceljs_1.default.Workbook();
        const sheet = workbook.addWorksheet('Projects');
        sheet.columns = [
            { header: 'Code', key: 'project_code', width: 15 },
            { header: 'Name', key: 'name', width: 30 },
            { header: 'Type', key: 'project_type', width: 15 },
            { header: 'Status', key: 'status', width: 12 },
            { header: 'Budget', key: 'budget', width: 15 },
            { header: 'Spent', key: 'spent_amount', width: 15 },
            { header: 'Progress %', key: 'progress_percent', width: 12 },
            { header: 'Customer', key: 'customer_name', width: 20 },
            { header: 'Manager', key: 'manager_name', width: 20 },
        ];
        rows.forEach((row) => sheet.addRow(row));
        sheet.getRow(1).font = { bold: true };
        await workbook.xlsx.writeFile(filePath);
        return { filePath, filename };
    }
    async generateInventoryPDF(rows, timestamp) {
        const filename = `inventory-report-${timestamp}.pdf`;
        const filePath = path_1.default.join(this.outputDir, filename);
        return new Promise((resolve, reject) => {
            const doc = new pdfkit_1.default({ margin: 50, size: 'A4' });
            const stream = fs_1.default.createWriteStream(filePath);
            doc.pipe(stream);
            doc.fontSize(18).font('Helvetica-Bold').text('Inventory Report', { align: 'center' });
            doc.moveDown();
            doc.fontSize(9).font('Helvetica');
            rows.forEach((row) => {
                doc.text(`${row.sku} | ${row.name} | Qty: ${row.quantity} ${row.unit} | Cost: ${(0, helpers_1.formatCurrency)(Number(row.cost_price))}`);
            });
            doc.end();
            stream.on('finish', () => resolve({ filePath, filename }));
            stream.on('error', reject);
        });
    }
    async generateInventoryExcel(rows, timestamp) {
        const filename = `inventory-report-${timestamp}.xlsx`;
        const filePath = path_1.default.join(this.outputDir, filename);
        const workbook = new exceljs_1.default.Workbook();
        const sheet = workbook.addWorksheet('Inventory');
        sheet.columns = [
            { header: 'SKU', key: 'sku', width: 15 },
            { header: 'Name', key: 'name', width: 25 },
            { header: 'Category', key: 'category_name', width: 15 },
            { header: 'Quantity', key: 'quantity', width: 12 },
            { header: 'Unit', key: 'unit', width: 10 },
            { header: 'Cost Price', key: 'cost_price', width: 12 },
            { header: 'Selling Price', key: 'selling_price', width: 12 },
            { header: 'Supplier', key: 'supplier_name', width: 20 },
        ];
        rows.forEach((row) => sheet.addRow(row));
        sheet.getRow(1).font = { bold: true };
        await workbook.xlsx.writeFile(filePath);
        return { filePath, filename };
    }
    async generateFinancialPDF(rows, timestamp) {
        const filename = `financial-report-${timestamp}.pdf`;
        const filePath = path_1.default.join(this.outputDir, filename);
        return new Promise((resolve, reject) => {
            const doc = new pdfkit_1.default({ margin: 50, size: 'A4' });
            const stream = fs_1.default.createWriteStream(filePath);
            doc.pipe(stream);
            doc.fontSize(18).font('Helvetica-Bold').text('Financial Report', { align: 'center' });
            doc.moveDown();
            let total = 0;
            rows.forEach((row) => {
                const amount = Number(row.amount);
                total += amount;
                doc.fontSize(9).font('Helvetica').text(`${row.payment_number} | ${row.customer_name ?? 'N/A'} | ${(0, helpers_1.formatCurrency)(amount)} | ${row.payment_method}`);
            });
            doc.moveDown();
            doc.font('Helvetica-Bold').text(`Total: ${(0, helpers_1.formatCurrency)(total)}`);
            doc.end();
            stream.on('finish', () => resolve({ filePath, filename }));
            stream.on('error', reject);
        });
    }
    async generateFinancialExcel(rows, timestamp) {
        const filename = `financial-report-${timestamp}.xlsx`;
        const filePath = path_1.default.join(this.outputDir, filename);
        const workbook = new exceljs_1.default.Workbook();
        const sheet = workbook.addWorksheet('Payments');
        sheet.columns = [
            { header: 'Payment #', key: 'payment_number', width: 15 },
            { header: 'Customer', key: 'customer_name', width: 20 },
            { header: 'Invoice', key: 'invoice_number', width: 15 },
            { header: 'Amount', key: 'amount', width: 12 },
            { header: 'Method', key: 'payment_method', width: 12 },
            { header: 'Status', key: 'payment_status', width: 12 },
            { header: 'Date', key: 'paid_at', width: 18 },
        ];
        rows.forEach((row) => sheet.addRow(row));
        sheet.getRow(1).font = { bold: true };
        await workbook.xlsx.writeFile(filePath);
        return { filePath, filename };
    }
}
exports.reportService = new ReportService();
//# sourceMappingURL=report.service.js.map
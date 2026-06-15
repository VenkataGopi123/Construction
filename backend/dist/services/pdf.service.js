"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pdfService = void 0;
const pdfkit_1 = __importDefault(require("pdfkit"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const env_1 = require("../config/env");
const helpers_1 = require("../utils/helpers");
class PDFService {
    outputDir;
    constructor() {
        this.outputDir = path_1.default.resolve(env_1.env.upload.uploadDir, 'invoices');
        if (!fs_1.default.existsSync(this.outputDir)) {
            fs_1.default.mkdirSync(this.outputDir, { recursive: true });
        }
    }
    async generateInvoice(data) {
        const filename = `invoice-${data.invoice_number.replace(/\//g, '-')}.pdf`;
        const filePath = path_1.default.join(this.outputDir, filename);
        return new Promise((resolve, reject) => {
            const doc = new pdfkit_1.default({ margin: 50, size: 'A4' });
            const stream = fs_1.default.createWriteStream(filePath);
            doc.pipe(stream);
            doc.fontSize(22).font('Helvetica-Bold').text('BuildMaster ERP', { align: 'left' });
            doc.fontSize(10).font('Helvetica').text('Construction & Infrastructure Solutions');
            doc.moveDown();
            doc.fontSize(18).font('Helvetica-Bold').text('TAX INVOICE', { align: 'right' });
            doc.fontSize(10).font('Helvetica');
            doc.text(`Invoice No: ${data.invoice_number}`, { align: 'right' });
            if (data.due_date) {
                doc.text(`Due Date: ${data.due_date}`, { align: 'right' });
            }
            doc.moveDown();
            doc.font('Helvetica-Bold').text('Bill To:');
            doc.font('Helvetica');
            doc.text(data.customer_name);
            if (data.customer_address)
                doc.text(data.customer_address);
            if (data.customer_gst)
                doc.text(`GSTIN: ${data.customer_gst}`);
            if (data.project_name)
                doc.text(`Project: ${data.project_name}`);
            doc.moveDown();
            const tableTop = doc.y + 10;
            const colWidths = [250, 60, 80, 80];
            const headers = ['Description', 'Qty', 'Rate', 'Amount'];
            doc.font('Helvetica-Bold');
            let x = 50;
            headers.forEach((header, i) => {
                doc.text(header, x, tableTop, { width: colWidths[i] });
                x += colWidths[i];
            });
            doc.moveTo(50, tableTop + 15).lineTo(545, tableTop + 15).stroke();
            doc.font('Helvetica');
            let y = tableTop + 25;
            data.items.forEach((item) => {
                x = 50;
                doc.text(item.description, x, y, { width: colWidths[0] });
                x += colWidths[0];
                doc.text(String(item.quantity), x, y, { width: colWidths[1] });
                x += colWidths[1];
                doc.text((0, helpers_1.formatCurrency)(item.unit_price), x, y, { width: colWidths[2] });
                x += colWidths[2];
                doc.text((0, helpers_1.formatCurrency)(item.total_price), x, y, { width: colWidths[3] });
                y += 20;
            });
            doc.moveDown(2);
            y = doc.y;
            doc.text(`Subtotal: ${(0, helpers_1.formatCurrency)(data.subtotal)}`, 350, y, { align: 'right', width: 195 });
            doc.text(`GST (${data.gst_rate}%): ${(0, helpers_1.formatCurrency)(data.gst_amount)}`, 350, y + 15, {
                align: 'right',
                width: 195,
            });
            doc.font('Helvetica-Bold');
            doc.text(`Total: ${(0, helpers_1.formatCurrency)(data.total_amount)}`, 350, y + 30, {
                align: 'right',
                width: 195,
            });
            if (data.notes) {
                doc.moveDown(2).font('Helvetica').fontSize(9).text(`Notes: ${data.notes}`);
            }
            doc.fontSize(8).text('This is a computer-generated invoice. BuildMaster ERP - All rights reserved.', 50, 750, { align: 'center', width: 495 });
            doc.end();
            stream.on('finish', () => resolve({ filePath, filename }));
            stream.on('error', reject);
        });
    }
    async generateQuotation(data) {
        const filename = `quotation-${data.quotation_number.replace(/\//g, '-')}.pdf`;
        const filePath = path_1.default.join(this.outputDir, filename);
        return new Promise((resolve, reject) => {
            const doc = new pdfkit_1.default({ margin: 50, size: 'A4' });
            const stream = fs_1.default.createWriteStream(filePath);
            doc.pipe(stream);
            doc.fontSize(22).font('Helvetica-Bold').text('QUOTATION', { align: 'center' });
            doc.moveDown();
            doc.fontSize(10).font('Helvetica');
            doc.text(`Quotation No: ${data.quotation_number}`);
            doc.text(`Customer: ${data.customer_name}`);
            doc.text(`Project Type: ${data.project_type}`);
            doc.text(`Area: ${data.area_sqft} sqft`);
            if (data.valid_until)
                doc.text(`Valid Until: ${data.valid_until}`);
            doc.moveDown();
            const lines = [
                ['Material Cost', data.material_cost],
                ['Labor Cost', data.labor_cost],
                ['Transport Cost', data.transport_cost],
                ['Discount', -data.discount],
                ['Tax (GST)', data.tax_amount],
            ];
            lines.forEach(([label, amount]) => {
                doc.text(`${label}: ${(0, helpers_1.formatCurrency)(amount)}`);
            });
            doc.moveDown();
            doc.font('Helvetica-Bold').text(`Total: ${(0, helpers_1.formatCurrency)(data.total_amount)}`);
            doc.end();
            stream.on('finish', () => resolve({ filePath, filename }));
            stream.on('error', reject);
        });
    }
}
exports.pdfService = new PDFService();
//# sourceMappingURL=pdf.service.js.map
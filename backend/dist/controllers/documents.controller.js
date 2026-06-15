"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDocumentVersion = exports.downloadDocument = exports.deleteDocument = exports.updateDocument = exports.uploadDocument = exports.getDocument = exports.listDocuments = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const database_1 = require("../config/database");
const types_1 = require("../types");
const helpers_1 = require("../utils/helpers");
const errorHandler_1 = require("../middleware/errorHandler");
const audit_1 = require("../middleware/audit");
const env_1 = require("../config/env");
exports.listDocuments = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const pagination = (0, helpers_1.parsePagination)(req.query);
    const { project_id, customer_id, document_type } = req.query;
    const conditions = ['1=1'];
    const params = [];
    let i = 1;
    if (project_id) {
        conditions.push(`d.project_id = $${i++}`);
        params.push(project_id);
    }
    if (customer_id) {
        conditions.push(`d.customer_id = $${i++}`);
        params.push(customer_id);
    }
    if (document_type) {
        conditions.push(`d.document_type = $${i++}`);
        params.push(document_type);
    }
    const where = conditions.join(' AND ');
    const countResult = await (0, database_1.query)(`SELECT COUNT(*) FROM documents d WHERE ${where}`, params);
    const total = parseInt(countResult.rows[0].count, 10);
    const result = await (0, database_1.query)(`SELECT d.*, u.first_name || ' ' || COALESCE(u.last_name, '') AS uploaded_by_name
     FROM documents d
     LEFT JOIN users u ON d.uploaded_by = u.id
     WHERE ${where}
     ORDER BY d.created_at DESC
     LIMIT $${i++} OFFSET $${i}`, [...params, pagination.limit, pagination.offset]);
    res.json({ success: true, ...(0, helpers_1.buildPaginatedResponse)(result.rows, total, pagination) });
});
exports.getDocument = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const result = await (0, database_1.query)('SELECT * FROM documents WHERE id = $1', [req.params.id]);
    if (!result.rows[0])
        throw new types_1.AppError('Document not found', 404);
    res.json({ success: true, data: result.rows[0] });
});
exports.uploadDocument = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (!req.file)
        throw new types_1.AppError('No file uploaded', 400);
    const { name, document_type, project_id, customer_id, tags } = req.body;
    if (!document_type)
        throw new types_1.AppError('Document type is required', 400);
    const filePath = path_1.default.join(env_1.env.upload.uploadDir, req.file.filename);
    const result = await (0, database_1.query)(`INSERT INTO documents (name, document_type, file_path, file_size, mime_type, project_id, customer_id, uploaded_by, tags)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`, [
        name ?? req.file.originalname,
        document_type,
        filePath,
        req.file.size,
        req.file.mimetype,
        project_id ?? null,
        customer_id ?? null,
        req.user.id,
        tags ? (Array.isArray(tags) ? tags : tags.split(',')) : null,
    ]);
    res.status(201).json({ success: true, data: result.rows[0] });
});
exports.updateDocument = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const existing = await (0, database_1.query)('SELECT * FROM documents WHERE id = $1', [req.params.id]);
    if (!existing.rows[0])
        throw new types_1.AppError('Document not found', 404);
    const { name, document_type, tags, is_signed, signature_data } = req.body;
    const result = await (0, database_1.query)(`UPDATE documents SET
       name = COALESCE($1, name),
       document_type = COALESCE($2, document_type),
       tags = COALESCE($3, tags),
       is_signed = COALESCE($4, is_signed),
       signature_data = COALESCE($5, signature_data)
     WHERE id = $6 RETURNING *`, [name, document_type, tags, is_signed, signature_data ? JSON.stringify(signature_data) : null, req.params.id]);
    await (0, audit_1.logAuditEntry)(req, 'UPDATE', 'document', req.params.id, existing.rows[0], result.rows[0]);
    res.json({ success: true, data: result.rows[0] });
});
exports.deleteDocument = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const existing = await (0, database_1.query)('SELECT * FROM documents WHERE id = $1', [req.params.id]);
    if (!existing.rows[0])
        throw new types_1.AppError('Document not found', 404);
    const filePath = existing.rows[0].file_path;
    if (filePath && fs_1.default.existsSync(filePath)) {
        fs_1.default.unlinkSync(filePath);
    }
    await (0, database_1.query)('DELETE FROM documents WHERE id = $1', [req.params.id]);
    await (0, audit_1.logAuditEntry)(req, 'DELETE', 'document', req.params.id);
    res.json({ success: true, message: 'Document deleted successfully' });
});
exports.downloadDocument = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const result = await (0, database_1.query)('SELECT * FROM documents WHERE id = $1', [req.params.id]);
    if (!result.rows[0])
        throw new types_1.AppError('Document not found', 404);
    const doc = result.rows[0];
    if (!fs_1.default.existsSync(doc.file_path)) {
        throw new types_1.AppError('File not found on disk', 404);
    }
    res.download(doc.file_path, doc.name);
});
exports.createDocumentVersion = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (!req.file)
        throw new types_1.AppError('No file uploaded', 400);
    const parent = await (0, database_1.query)('SELECT * FROM documents WHERE id = $1', [req.params.id]);
    if (!parent.rows[0])
        throw new types_1.AppError('Parent document not found', 404);
    const parentDoc = parent.rows[0];
    const filePath = path_1.default.join(env_1.env.upload.uploadDir, req.file.filename);
    const newVersion = (parentDoc.version ?? 1) + 1;
    const result = await (0, database_1.query)(`INSERT INTO documents (name, document_type, file_path, file_size, mime_type, version, parent_document_id, project_id, customer_id, uploaded_by, tags)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`, [
        parentDoc.name,
        parentDoc.document_type,
        filePath,
        req.file.size,
        req.file.mimetype,
        newVersion,
        req.params.id,
        parentDoc.project_id,
        parentDoc.customer_id,
        req.user.id,
        parentDoc.tags,
    ]);
    res.status(201).json({ success: true, data: result.rows[0] });
});
//# sourceMappingURL=documents.controller.js.map
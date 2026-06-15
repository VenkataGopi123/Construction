"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWebsiteStats = exports.sendChatMessage = exports.getChatMessages = exports.markContactRead = exports.listContactSubmissions = exports.submitContact = exports.createTestimonial = exports.getAllTestimonials = exports.getTestimonials = exports.getPublicProjects = void 0;
const database_1 = require("../config/database");
const types_1 = require("../types");
const helpers_1 = require("../utils/helpers");
const errorHandler_1 = require("../middleware/errorHandler");
exports.getPublicProjects = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const pagination = (0, helpers_1.parsePagination)(req.query);
    const countResult = await (0, database_1.query)(`SELECT COUNT(*) FROM projects WHERE status = 'completed'`);
    const total = parseInt(countResult.rows[0].count, 10);
    const result = await (0, database_1.query)(`SELECT id, project_code, name, project_type, location, progress_percent, status, created_at
     FROM projects
     WHERE status = 'completed'
     ORDER BY created_at DESC
     LIMIT $1 OFFSET $2`, [pagination.limit, pagination.offset]);
    res.json({ success: true, ...(0, helpers_1.buildPaginatedResponse)(result.rows, total, pagination) });
});
exports.getTestimonials = (0, errorHandler_1.asyncHandler)(async (_req, res) => {
    const result = await (0, database_1.query)(`SELECT * FROM testimonials WHERE is_featured = true ORDER BY rating DESC, created_at DESC LIMIT 10`);
    res.json({ success: true, data: result.rows });
});
exports.getAllTestimonials = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const pagination = (0, helpers_1.parsePagination)(req.query);
    const countResult = await (0, database_1.query)('SELECT COUNT(*) FROM testimonials');
    const total = parseInt(countResult.rows[0].count, 10);
    const result = await (0, database_1.query)('SELECT * FROM testimonials ORDER BY created_at DESC LIMIT $1 OFFSET $2', [pagination.limit, pagination.offset]);
    res.json({ success: true, ...(0, helpers_1.buildPaginatedResponse)(result.rows, total, pagination) });
});
exports.createTestimonial = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { client_name, company, content, rating, project_type, is_featured } = req.body;
    if (!client_name || !content) {
        throw new types_1.AppError('Client name and content are required', 400);
    }
    const result = await (0, database_1.query)(`INSERT INTO testimonials (client_name, company, content, rating, project_type, is_featured)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`, [client_name, company ?? null, content, rating ?? 5, project_type ?? null, is_featured ?? false]);
    res.status(201).json({ success: true, data: result.rows[0] });
});
exports.submitContact = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { name, email, phone, subject, message } = req.body;
    if (!name || !email || !message) {
        throw new types_1.AppError('Name, email, and message are required', 400);
    }
    const result = await (0, database_1.query)(`INSERT INTO contact_submissions (name, email, phone, subject, message)
     VALUES ($1, $2, $3, $4, $5) RETURNING id, created_at`, [name, email, phone ?? null, subject ?? null, message]);
    res.status(201).json({
        success: true,
        message: 'Thank you for contacting us. We will get back to you soon.',
        data: result.rows[0],
    });
});
exports.listContactSubmissions = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const pagination = (0, helpers_1.parsePagination)(req.query);
    const { is_read } = req.query;
    const conditions = ['1=1'];
    const params = [];
    let i = 1;
    if (is_read !== undefined) {
        conditions.push(`is_read = $${i++}`);
        params.push(is_read === 'true');
    }
    const where = conditions.join(' AND ');
    const countResult = await (0, database_1.query)(`SELECT COUNT(*) FROM contact_submissions WHERE ${where}`, params);
    const total = parseInt(countResult.rows[0].count, 10);
    const result = await (0, database_1.query)(`SELECT * FROM contact_submissions WHERE ${where} ORDER BY created_at DESC LIMIT $${i++} OFFSET $${i}`, [...params, pagination.limit, pagination.offset]);
    res.json({ success: true, ...(0, helpers_1.buildPaginatedResponse)(result.rows, total, pagination) });
});
exports.markContactRead = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const result = await (0, database_1.query)('UPDATE contact_submissions SET is_read = true WHERE id = $1 RETURNING *', [req.params.id]);
    if (!result.rows[0])
        throw new types_1.AppError('Contact submission not found', 404);
    res.json({ success: true, data: result.rows[0] });
});
exports.getChatMessages = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { session_id } = req.params;
    const result = await (0, database_1.query)('SELECT * FROM chat_messages WHERE session_id = $1 ORDER BY created_at ASC', [session_id]);
    res.json({ success: true, data: result.rows });
});
exports.sendChatMessage = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { session_id } = req.params;
    const { message, is_from_support } = req.body;
    if (!message)
        throw new types_1.AppError('Message is required', 400);
    const result = await (0, database_1.query)(`INSERT INTO chat_messages (session_id, user_id, message, is_from_support)
     VALUES ($1, $2, $3, $4) RETURNING *`, [session_id, req.user?.id ?? null, message, is_from_support ?? false]);
    res.status(201).json({ success: true, data: result.rows[0] });
});
exports.getWebsiteStats = (0, errorHandler_1.asyncHandler)(async (_req, res) => {
    const [projects, testimonials, contacts] = await Promise.all([
        (0, database_1.query)(`SELECT COUNT(*) AS count FROM projects WHERE status = 'completed'`),
        (0, database_1.query)(`SELECT COUNT(*) AS count FROM testimonials WHERE is_featured = true`),
        (0, database_1.query)(`SELECT COUNT(*) AS count FROM contact_submissions WHERE is_read = false`),
    ]);
    res.json({
        success: true,
        data: {
            completed_projects: parseInt(projects.rows[0].count, 10),
            featured_testimonials: parseInt(testimonials.rows[0].count, 10),
            unread_contacts: parseInt(contacts.rows[0].count, 10),
        },
    });
});
//# sourceMappingURL=website.controller.js.map
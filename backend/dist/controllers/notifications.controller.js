"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendTestNotification = exports.sendBulkNotification = exports.deleteNotification = exports.markAllAsRead = exports.markAsRead = exports.createNotification = exports.getUnreadCount = exports.listNotifications = void 0;
const database_1 = require("../config/database");
const types_1 = require("../types");
const helpers_1 = require("../utils/helpers");
const errorHandler_1 = require("../middleware/errorHandler");
const notification_service_1 = require("../services/notification.service");
exports.listNotifications = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const pagination = (0, helpers_1.parsePagination)(req.query);
    const { is_read } = req.query;
    const conditions = ['user_id = $1'];
    const params = [req.user.id];
    let i = 2;
    if (is_read !== undefined) {
        conditions.push(`is_read = $${i++}`);
        params.push(is_read === 'true');
    }
    const where = conditions.join(' AND ');
    const countResult = await (0, database_1.query)(`SELECT COUNT(*) FROM notifications WHERE ${where}`, params);
    const total = parseInt(countResult.rows[0].count, 10);
    const result = await (0, database_1.query)(`SELECT * FROM notifications WHERE ${where} ORDER BY created_at DESC LIMIT $${i++} OFFSET $${i}`, [...params, pagination.limit, pagination.offset]);
    res.json({ success: true, ...(0, helpers_1.buildPaginatedResponse)(result.rows, total, pagination) });
});
exports.getUnreadCount = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const result = await (0, database_1.query)('SELECT COUNT(*) AS count FROM notifications WHERE user_id = $1 AND is_read = false', [req.user.id]);
    res.json({ success: true, data: { count: parseInt(result.rows[0].count, 10) } });
});
exports.createNotification = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { user_id, title, message, channel, entity_type, entity_id } = req.body;
    if (!user_id || !title || !message) {
        throw new types_1.AppError('User ID, title, and message are required', 400);
    }
    const result = await (0, database_1.query)(`INSERT INTO notifications (user_id, title, message, channel, entity_type, entity_id, sent_at)
     VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING *`, [user_id, title, message, channel ?? 'in_app', entity_type ?? null, entity_id ?? null]);
    const user = await (0, database_1.query)('SELECT email, phone FROM users WHERE id = $1', [user_id]);
    if (user.rows[0] && channel && channel !== 'in_app') {
        const recipient = channel === 'email' ? user.rows[0].email : user.rows[0].phone;
        if (recipient) {
            await notification_service_1.notificationService.notify({
                to: recipient,
                subject: title,
                message,
                channel,
            });
        }
    }
    res.status(201).json({ success: true, data: result.rows[0] });
});
exports.markAsRead = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const result = await (0, database_1.query)('UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2 RETURNING *', [req.params.id, req.user.id]);
    if (!result.rows[0])
        throw new types_1.AppError('Notification not found', 404);
    res.json({ success: true, data: result.rows[0] });
});
exports.markAllAsRead = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    await (0, database_1.query)('UPDATE notifications SET is_read = true WHERE user_id = $1 AND is_read = false', [
        req.user.id,
    ]);
    res.json({ success: true, message: 'All notifications marked as read' });
});
exports.deleteNotification = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const result = await (0, database_1.query)('DELETE FROM notifications WHERE id = $1 AND user_id = $2 RETURNING id', [req.params.id, req.user.id]);
    if (!result.rows[0])
        throw new types_1.AppError('Notification not found', 404);
    res.json({ success: true, message: 'Notification deleted' });
});
exports.sendBulkNotification = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { user_ids, title, message, channel } = req.body;
    if (!user_ids?.length || !title || !message) {
        throw new types_1.AppError('User IDs, title, and message are required', 400);
    }
    const results = [];
    for (const userId of user_ids) {
        const result = await (0, database_1.query)(`INSERT INTO notifications (user_id, title, message, channel, sent_at)
       VALUES ($1, $2, $3, $4, NOW()) RETURNING *`, [userId, title, message, channel ?? 'in_app']);
        results.push(result.rows[0]);
    }
    res.status(201).json({ success: true, data: results });
});
exports.sendTestNotification = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { channel, to, message } = req.body;
    if (!channel || !to) {
        throw new types_1.AppError('Channel and recipient are required', 400);
    }
    const sent = await notification_service_1.notificationService.notify({
        to,
        subject: 'BuildMaster ERP Test Notification',
        message: message ?? 'This is a test notification from BuildMaster ERP.',
        channel,
    });
    res.json({ success: true, data: { sent } });
});
//# sourceMappingURL=notifications.controller.js.map
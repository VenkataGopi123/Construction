"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteService = exports.updateService = exports.createService = exports.getService = exports.listServices = void 0;
const database_1 = require("../config/database");
const types_1 = require("../types");
const errorHandler_1 = require("../middleware/errorHandler");
exports.listServices = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const result = await (0, database_1.query)('SELECT * FROM services WHERE is_active = true ORDER BY name');
    res.json({ success: true, data: result.rows });
});
exports.getService = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const result = await (0, database_1.query)('SELECT * FROM services WHERE id = $1', [req.params.id]);
    if (!result.rows[0])
        throw new types_1.AppError('Service not found', 404);
    res.json({ success: true, data: result.rows[0] });
});
exports.createService = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { name, description, image_url, category, base_price } = req.body;
    if (!name || !description) {
        throw new types_1.AppError('Name and description are required', 400);
    }
    const result = await (0, database_1.query)(`INSERT INTO services (name, description, image_url, category, base_price)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`, [name, description, image_url || null, category || null, base_price || null]);
    res.status(201).json({ success: true, data: result.rows[0] });
});
exports.updateService = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const existing = await (0, database_1.query)('SELECT * FROM services WHERE id = $1', [req.params.id]);
    if (!existing.rows[0])
        throw new types_1.AppError('Service not found', 404);
    const { name, description, image_url, category, base_price, is_active } = req.body;
    const result = await (0, database_1.query)(`UPDATE services SET 
      name = COALESCE($1, name),
      description = COALESCE($2, description),
      image_url = COALESCE($3, image_url),
      category = COALESCE($4, category),
      base_price = COALESCE($5, base_price),
      is_active = COALESCE($6, is_active)
     WHERE id = $7 RETURNING *`, [name, description, image_url, category, base_price, is_active, req.params.id]);
    res.json({ success: true, data: result.rows[0] });
});
exports.deleteService = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const existing = await (0, database_1.query)('SELECT id FROM services WHERE id = $1', [req.params.id]);
    if (!existing.rows[0])
        throw new types_1.AppError('Service not found', 404);
    await (0, database_1.query)('UPDATE services SET is_active = false WHERE id = $1', [req.params.id]);
    res.json({ success: true, message: 'Service deactivated successfully' });
});
//# sourceMappingURL=services.controller.js.map
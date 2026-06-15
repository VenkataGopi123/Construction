"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_routes_1 = __importDefault(require("./auth.routes"));
const users_routes_1 = __importDefault(require("./users.routes"));
const projects_routes_1 = __importDefault(require("./projects.routes"));
const customers_routes_1 = __importDefault(require("./customers.routes"));
const materials_routes_1 = __importDefault(require("./materials.routes"));
const website_routes_1 = __importDefault(require("./website.routes"));
const services_routes_1 = __importDefault(require("./services.routes"));
const team_routes_1 = __importDefault(require("./team.routes"));
const router = (0, express_1.Router)();
router.get('/health', (_req, res) => {
    res.json({
        success: true,
        message: 'BuildMaster ERP API is running',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
    });
});
router.use('/auth', auth_routes_1.default);
router.use('/users', users_routes_1.default);
router.use('/projects', projects_routes_1.default);
router.use('/customers', customers_routes_1.default);
router.use('/materials', materials_routes_1.default);
router.use('/website', website_routes_1.default);
router.use('/services', services_routes_1.default);
router.use('/team', team_routes_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map
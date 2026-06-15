"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const websiteController = __importStar(require("../controllers/website.controller"));
const auth_1 = require("../middleware/auth");
const audit_1 = require("../middleware/audit");
const router = (0, express_1.Router)();
router.get('/projects', websiteController.getPublicProjects);
router.get('/testimonials', websiteController.getTestimonials);
router.get('/stats', websiteController.getWebsiteStats);
router.post('/contact', websiteController.submitContact);
router.get('/chat/:session_id', auth_1.optionalAuth, websiteController.getChatMessages);
router.post('/chat/:session_id', auth_1.optionalAuth, websiteController.sendChatMessage);
router.use(auth_1.authenticate);
router.get('/admin/testimonials', (0, auth_1.authorize)('super_admin', 'project_manager'), websiteController.getAllTestimonials);
router.post('/admin/testimonials', (0, auth_1.authorize)('super_admin'), (0, audit_1.auditLog)('CREATE', 'testimonial'), websiteController.createTestimonial);
router.get('/admin/contacts', (0, auth_1.authorize)('super_admin', 'project_manager'), websiteController.listContactSubmissions);
router.patch('/admin/contacts/:id/read', (0, auth_1.authorize)('super_admin', 'project_manager'), websiteController.markContactRead);
exports.default = router;
//# sourceMappingURL=website.routes.js.map
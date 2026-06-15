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
const documentsController = __importStar(require("../controllers/documents.controller"));
const auth_1 = require("../middleware/auth");
const audit_1 = require("../middleware/audit");
const upload_1 = require("../middleware/upload");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.get('/', (0, auth_1.authorize)('super_admin', 'project_manager', 'material_manager', 'customer'), documentsController.listDocuments);
router.get('/:id', (0, auth_1.authorize)('super_admin', 'project_manager', 'material_manager', 'customer'), documentsController.getDocument);
router.get('/:id/download', (0, auth_1.authorize)('super_admin', 'project_manager', 'material_manager', 'customer'), documentsController.downloadDocument);
router.post('/', (0, auth_1.authorize)('super_admin', 'project_manager', 'material_manager'), upload_1.uploadSingle, (0, audit_1.auditLog)('CREATE', 'document'), documentsController.uploadDocument);
router.post('/:id/version', (0, auth_1.authorize)('super_admin', 'project_manager'), upload_1.uploadSingle, (0, audit_1.auditLog)('CREATE_VERSION', 'document'), documentsController.createDocumentVersion);
router.put('/:id', (0, auth_1.authorize)('super_admin', 'project_manager'), (0, audit_1.auditLog)('UPDATE', 'document'), documentsController.updateDocument);
router.delete('/:id', (0, auth_1.authorize)('super_admin', 'project_manager'), (0, audit_1.auditLog)('DELETE', 'document'), documentsController.deleteDocument);
exports.default = router;
//# sourceMappingURL=documents.routes.js.map
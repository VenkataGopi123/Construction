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
const paymentsController = __importStar(require("../controllers/payments.controller"));
const auth_1 = require("../middleware/auth");
const audit_1 = require("../middleware/audit");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.get('/', (0, auth_1.authorize)('super_admin', 'project_manager', 'customer'), paymentsController.listPayments);
router.get('/invoices', (0, auth_1.authorize)('super_admin', 'project_manager', 'customer'), paymentsController.listInvoices);
router.post('/invoices', (0, auth_1.authorize)('super_admin', 'project_manager'), (0, audit_1.auditLog)('CREATE', 'invoice'), paymentsController.createInvoice);
router.get('/invoices/:id', (0, auth_1.authorize)('super_admin', 'project_manager', 'customer'), paymentsController.getInvoice);
router.get('/:id', (0, auth_1.authorize)('super_admin', 'project_manager', 'customer'), paymentsController.getPayment);
router.post('/', (0, auth_1.authorize)('super_admin', 'project_manager'), (0, audit_1.auditLog)('CREATE', 'payment'), paymentsController.createPayment);
router.put('/:id', (0, auth_1.authorize)('super_admin', 'project_manager'), (0, audit_1.auditLog)('UPDATE', 'payment'), paymentsController.updatePayment);
router.delete('/:id', (0, auth_1.authorize)('super_admin'), (0, audit_1.auditLog)('DELETE', 'payment'), paymentsController.deletePayment);
exports.default = router;
//# sourceMappingURL=payments.routes.js.map
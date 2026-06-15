"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const team_controller_1 = require("../controllers/team.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Public routes
router.get('/', team_controller_1.getAllTeamMembers);
router.get('/:id', team_controller_1.getTeamMemberById);
// Protected routes
router.use(auth_1.authenticate);
router.use((0, auth_1.authorize)('super_admin', 'project_manager'));
router.post('/', team_controller_1.createTeamMember);
router.put('/:id', team_controller_1.updateTeamMember);
router.delete('/:id', team_controller_1.deleteTeamMember);
exports.default = router;
//# sourceMappingURL=team.routes.js.map
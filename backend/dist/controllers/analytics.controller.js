"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMonthlyGrowth = exports.aiRiskAnalysis = exports.aiTimelinePrediction = exports.aiCostEstimation = exports.getQuotationStatusChart = exports.getWorkerSkillChart = exports.getMaterialStockChart = exports.getBudgetVsSpentChart = exports.getProjectTypeChart = exports.getProjectStatusChart = exports.getRevenueChart = exports.getDashboard = void 0;
const database_1 = require("../config/database");
const errorHandler_1 = require("../middleware/errorHandler");
const ai_service_1 = require("../services/ai.service");
exports.getDashboard = (0, errorHandler_1.asyncHandler)(async (_req, res) => {
    const [projects, revenue, customers, materials, workers, payments] = await Promise.all([
        (0, database_1.query)(`SELECT status, COUNT(*) AS count FROM projects GROUP BY status`),
        (0, database_1.query)(`SELECT COALESCE(SUM(amount), 0) AS total FROM payments WHERE payment_status = 'paid'`),
        (0, database_1.query)(`SELECT COUNT(*) AS count FROM customers`),
        (0, database_1.query)(`SELECT COUNT(*) AS count FROM materials WHERE is_active = true`),
        (0, database_1.query)(`SELECT COUNT(*) AS count FROM workers WHERE is_active = true`),
        (0, database_1.query)(`SELECT COUNT(*) AS count FROM payments WHERE payment_status = 'pending'`),
    ]);
    const activeProjects = await (0, database_1.query)(`SELECT COUNT(*) AS count FROM projects WHERE status IN ('in_progress', 'approved')`);
    res.json({
        success: true,
        data: {
            projects_by_status: projects.rows,
            total_revenue: parseFloat(revenue.rows[0].total),
            total_customers: parseInt(customers.rows[0].count, 10),
            total_materials: parseInt(materials.rows[0].count, 10),
            total_workers: parseInt(workers.rows[0].count, 10),
            pending_payments: parseInt(payments.rows[0].count, 10),
            active_projects: parseInt(activeProjects.rows[0].count, 10),
        },
    });
});
exports.getRevenueChart = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const months = parseInt(req.query.months ?? '12', 10);
    const result = await (0, database_1.query)(`SELECT
       TO_CHAR(DATE_TRUNC('month', paid_at), 'Mon YYYY') AS label,
       DATE_TRUNC('month', paid_at) AS month,
       COALESCE(SUM(amount), 0) AS value
     FROM payments
     WHERE payment_status = 'paid' AND paid_at >= NOW() - INTERVAL '1 month' * $1
     GROUP BY DATE_TRUNC('month', paid_at)
     ORDER BY month ASC`, [months]);
    res.json({ success: true, data: result.rows });
});
exports.getProjectStatusChart = (0, errorHandler_1.asyncHandler)(async (_req, res) => {
    const result = await (0, database_1.query)(`SELECT status AS label, COUNT(*) AS value FROM projects GROUP BY status ORDER BY value DESC`);
    res.json({ success: true, data: result.rows });
});
exports.getProjectTypeChart = (0, errorHandler_1.asyncHandler)(async (_req, res) => {
    const result = await (0, database_1.query)(`SELECT project_type AS label, COUNT(*) AS value FROM projects GROUP BY project_type ORDER BY value DESC`);
    res.json({ success: true, data: result.rows });
});
exports.getBudgetVsSpentChart = (0, errorHandler_1.asyncHandler)(async (_req, res) => {
    const result = await (0, database_1.query)(`SELECT name AS label, budget AS budget, spent_amount AS spent
     FROM projects
     WHERE status IN ('in_progress', 'approved', 'delayed')
     ORDER BY budget DESC
     LIMIT 10`);
    res.json({ success: true, data: result.rows });
});
exports.getMaterialStockChart = (0, errorHandler_1.asyncHandler)(async (_req, res) => {
    const result = await (0, database_1.query)(`SELECT m.name AS label, m.quantity AS value, m.min_stock_level AS min_level
     FROM materials m
     WHERE m.is_active = true
     ORDER BY m.quantity ASC
     LIMIT 15`);
    res.json({ success: true, data: result.rows });
});
exports.getWorkerSkillChart = (0, errorHandler_1.asyncHandler)(async (_req, res) => {
    const result = await (0, database_1.query)(`SELECT skill AS label, COUNT(*) AS value FROM workers WHERE is_active = true GROUP BY skill ORDER BY value DESC`);
    res.json({ success: true, data: result.rows });
});
exports.getQuotationStatusChart = (0, errorHandler_1.asyncHandler)(async (_req, res) => {
    const result = await (0, database_1.query)(`SELECT status AS label, COUNT(*) AS value FROM quotations GROUP BY status ORDER BY value DESC`);
    res.json({ success: true, data: result.rows });
});
exports.aiCostEstimation = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { project_type, area_sqft, location, complexity } = req.body;
    const result = await ai_service_1.aiService.estimateCost({
        project_type: project_type,
        area_sqft: parseFloat(area_sqft),
        location,
        complexity,
    });
    res.json({ success: true, data: result });
});
exports.aiTimelinePrediction = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { project_type, area_sqft, start_date, team_size } = req.body;
    const result = await ai_service_1.aiService.predictTimeline({
        project_type: project_type,
        area_sqft: parseFloat(area_sqft),
        start_date,
        team_size: team_size ? parseInt(team_size, 10) : undefined,
    });
    res.json({ success: true, data: result });
});
exports.aiRiskAnalysis = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { project_id } = req.body;
    if (project_id) {
        const project = await (0, database_1.query)('SELECT * FROM projects WHERE id = $1', [project_id]);
        if (!project.rows[0]) {
            res.status(404).json({ success: false, error: 'Project not found' });
            return;
        }
        const p = project.rows[0];
        const result = await ai_service_1.aiService.analyzeRisk({
            project_type: p.project_type,
            budget: parseFloat(p.budget),
            spent_amount: parseFloat(p.spent_amount),
            progress_percent: p.progress_percent,
            end_date: p.end_date,
            status: p.status,
        });
        res.json({ success: true, data: result });
        return;
    }
    const { project_type, budget, spent_amount, progress_percent, end_date, status } = req.body;
    const result = await ai_service_1.aiService.analyzeRisk({
        project_type: project_type,
        budget: parseFloat(budget),
        spent_amount: parseFloat(spent_amount ?? 0),
        progress_percent: parseInt(progress_percent ?? 0, 10),
        end_date,
        status,
    });
    res.json({ success: true, data: result });
});
exports.getMonthlyGrowth = (0, errorHandler_1.asyncHandler)(async (_req, res) => {
    const result = await (0, database_1.query)(`SELECT
       TO_CHAR(DATE_TRUNC('month', created_at), 'Mon YYYY') AS label,
       COUNT(*) AS value
     FROM projects
     WHERE created_at >= NOW() - INTERVAL '12 months'
     GROUP BY DATE_TRUNC('month', created_at)
     ORDER BY DATE_TRUNC('month', created_at) ASC`);
    res.json({ success: true, data: result.rows });
});
//# sourceMappingURL=analytics.controller.js.map
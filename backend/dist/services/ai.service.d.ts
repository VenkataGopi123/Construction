import { ProjectType } from '../types';
interface CostEstimationInput {
    project_type: ProjectType;
    area_sqft: number;
    location?: string;
    complexity?: 'low' | 'medium' | 'high';
}
interface TimelineInput {
    project_type: ProjectType;
    area_sqft: number;
    start_date?: string;
    team_size?: number;
}
interface RiskAnalysisInput {
    project_type: ProjectType;
    budget: number;
    spent_amount: number;
    progress_percent: number;
    end_date?: string;
    status?: string;
}
declare class AIService {
    private openai;
    private getOpenAI;
    private callGemini;
    private callLLM;
    estimateCost(input: CostEstimationInput): Promise<{
        estimated_cost: number;
        cost_per_sqft: number;
        currency: string;
        breakdown: {
            materials: number;
            labor: number;
            transport: number;
            overhead: number;
            contingency: number;
        };
        ai_analysis: string;
        confidence: string;
    }>;
    predictTimeline(input: TimelineInput): Promise<{
        estimated_days: number;
        estimated_months: number;
        predicted_start: string;
        predicted_end: string;
        milestones: {
            phase: string;
            duration_days: number;
        }[];
        ai_analysis: string;
    }>;
    analyzeRisk(input: RiskAnalysisInput): Promise<{
        risk_level: "high" | "low" | "medium";
        budget_utilization_percent: number;
        progress_gap: number;
        identified_risks: string[];
        recommendations: string[];
        ai_analysis: string;
    }>;
}
export declare const aiService: AIService;
export {};
//# sourceMappingURL=ai.service.d.ts.map
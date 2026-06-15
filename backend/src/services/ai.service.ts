import OpenAI from 'openai';
import { env } from '../config/env';
import { logger } from '../utils/logger';
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

class AIService {
  private openai: OpenAI | null = null;

  private getOpenAI(): OpenAI | null {
    if (!env.openai.apiKey) return null;
    if (!this.openai) {
      this.openai = new OpenAI({ apiKey: env.openai.apiKey });
    }
    return this.openai;
  }

  private async callGemini(prompt: string): Promise<string | null> {
    if (!env.gemini.apiKey) return null;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${env.gemini.apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.statusText}`);
      }

      const data = (await response.json()) as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      };

      return data.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
    } catch (error) {
      logger.error('Gemini API call failed', {
        error: error instanceof Error ? error.message : String(error),
      });
      return null;
    }
  }

  private async callLLM(prompt: string): Promise<string> {
    const openai = this.getOpenAI();

    if (openai) {
      try {
        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content:
                'You are a construction industry expert for BuildMaster ERP. Provide concise, actionable JSON-friendly analysis for Indian construction projects.',
            },
            { role: 'user', content: prompt },
          ],
          temperature: 0.3,
          max_tokens: 1500,
        });

        return completion.choices[0]?.message?.content ?? '';
      } catch (error) {
        logger.error('OpenAI API call failed', {
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    const geminiResult = await this.callGemini(prompt);
    if (geminiResult) return geminiResult;

    return '';
  }

  async estimateCost(input: CostEstimationInput) {
    const complexityMultiplier = { low: 0.85, medium: 1.0, high: 1.25 };
    const multiplier = complexityMultiplier[input.complexity ?? 'medium'];

    const baseRates: Record<ProjectType, number> = {
      residential: 1200,
      commercial: 1800,
      road: 900,
      bridge: 2500,
      industrial: 1600,
      interior_design: 950,
    };

    const rate = baseRates[input.project_type] * multiplier;
    const estimatedCost = Math.round(input.area_sqft * rate);

    const prompt = `Estimate construction cost for a ${input.project_type} project of ${input.area_sqft} sqft${input.location ? ` in ${input.location}` : ''}. Base estimate: INR ${estimatedCost}. Provide breakdown of materials, labor, overhead as percentages and key cost drivers. Return as structured analysis.`;

    const aiAnalysis = await this.callLLM(prompt);

    return {
      estimated_cost: estimatedCost,
      cost_per_sqft: Math.round(rate),
      currency: 'INR',
      breakdown: {
        materials: Math.round(estimatedCost * 0.45),
        labor: Math.round(estimatedCost * 0.30),
        transport: Math.round(estimatedCost * 0.08),
        overhead: Math.round(estimatedCost * 0.12),
        contingency: Math.round(estimatedCost * 0.05),
      },
      ai_analysis: aiAnalysis || 'AI analysis unavailable. Using rule-based estimation.',
      confidence: aiAnalysis ? 'high' : 'medium',
    };
  }

  async predictTimeline(input: TimelineInput) {
    const daysPerSqft: Record<ProjectType, number> = {
      residential: 0.08,
      commercial: 0.12,
      road: 0.05,
      bridge: 0.2,
      industrial: 0.1,
      interior_design: 0.06,
    };

    const teamSize = input.team_size ?? 10;
    const baseDays = Math.ceil(input.area_sqft * (daysPerSqft[input.project_type] ?? 0.1));
    const estimatedDays = Math.ceil(baseDays / Math.sqrt(teamSize / 10));

    const startDate = input.start_date ? new Date(input.start_date) : new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + estimatedDays);

    const prompt = `Predict timeline for ${input.project_type} construction of ${input.area_sqft} sqft with team of ${teamSize}. Estimated ${estimatedDays} days. Identify critical path milestones and potential delays.`;

    const aiAnalysis = await this.callLLM(prompt);

    return {
      estimated_days: estimatedDays,
      estimated_months: Math.ceil(estimatedDays / 30),
      predicted_start: startDate.toISOString().split('T')[0],
      predicted_end: endDate.toISOString().split('T')[0],
      milestones: [
        { phase: 'Foundation', duration_days: Math.ceil(estimatedDays * 0.2) },
        { phase: 'Structure', duration_days: Math.ceil(estimatedDays * 0.35) },
        { phase: 'Finishing', duration_days: Math.ceil(estimatedDays * 0.30) },
        { phase: 'Handover', duration_days: Math.ceil(estimatedDays * 0.15) },
      ],
      ai_analysis: aiAnalysis || 'AI analysis unavailable. Using rule-based timeline prediction.',
    };
  }

  async analyzeRisk(input: RiskAnalysisInput) {
    const budgetUtilization = input.budget > 0 ? (input.spent_amount / input.budget) * 100 : 0;
    const progressGap = input.progress_percent - budgetUtilization;

    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    const risks: string[] = [];

    if (budgetUtilization > input.progress_percent + 15) {
      riskLevel = 'high';
      risks.push('Budget overrun: spending exceeds progress');
    }
    if (input.status === 'delayed') {
      riskLevel = 'high';
      risks.push('Project is marked as delayed');
    }
    if (progressGap < -20) {
      riskLevel = riskLevel === 'high' ? 'high' : 'medium';
      risks.push('Progress lagging behind budget consumption');
    }
    if (input.end_date && new Date(input.end_date) < new Date() && input.progress_percent < 100) {
      riskLevel = 'high';
      risks.push('Past deadline with incomplete progress');
    }

    const prompt = `Analyze construction project risks: type=${input.project_type}, budget=INR ${input.budget}, spent=INR ${input.spent_amount}, progress=${input.progress_percent}%, status=${input.status}. Provide mitigation strategies.`;

    const aiAnalysis = await this.callLLM(prompt);

    return {
      risk_level: riskLevel,
      budget_utilization_percent: Math.round(budgetUtilization * 100) / 100,
      progress_gap: Math.round(progressGap * 100) / 100,
      identified_risks: risks.length > 0 ? risks : ['No critical risks identified'],
      recommendations: [
        'Review material procurement schedules',
        'Conduct weekly progress audits',
        'Update stakeholder communication plan',
      ],
      ai_analysis: aiAnalysis || 'AI analysis unavailable. Using rule-based risk assessment.',
    };
  }
}

export const aiService = new AIService();

import crypto from 'crypto';
import { QuotationCalculationInput, QuotationCalculationResult, PaginationParams } from '../types';

const CODE_PREFIXES: Record<string, string> = {
  project: 'PRJ',
  customer: 'CUS',
  supplier: 'SUP',
  quotation: 'QUO',
  payment: 'PAY',
  invoice: 'INV',
  worker: 'EMP',
  material: 'MAT',
};

export function generateCode(prefix: keyof typeof CODE_PREFIXES): string {
  const year = new Date().getFullYear();
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `${CODE_PREFIXES[prefix]}-${year}-${random}`;
}

export function generateSku(categoryCode: string): string {
  const random = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `${categoryCode.toUpperCase().substring(0, 3)}-${random}`;
}

export function parsePagination(query: {
  page?: string;
  limit?: string;
}): PaginationParams {
  const page = Math.max(1, parseInt(query.page ?? '1', 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit ?? '20', 10) || 20));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

export function buildPaginatedResponse<T>(
  data: T[],
  total: number,
  params: PaginationParams
) {
  return {
    data,
    pagination: {
      page: params.page,
      limit: params.limit,
      total,
      totalPages: Math.ceil(total / params.limit) || 1,
    },
  };
}

export function calculateGST(amount: number, rate = 18): { gstAmount: number; total: number } {
  const gstAmount = Math.round((amount * rate) / 100 * 100) / 100;
  const total = Math.round((amount + gstAmount) * 100) / 100;
  return { gstAmount, total };
}

export function calculateQuotation(input: QuotationCalculationInput): QuotationCalculationResult {
  const area = input.area_sqft || 0;
  const gstRate = input.gst_rate ?? 18;

  const materialRates: Record<string, number> = {
    residential: 850,
    commercial: 1200,
    road: 650,
    bridge: 1500,
    industrial: 1100,
    interior_design: 750,
  };

  const laborRates: Record<string, number> = {
    residential: 350,
    commercial: 450,
    road: 280,
    bridge: 520,
    industrial: 400,
    interior_design: 300,
  };

  const materialCost = input.material_cost ?? area * (materialRates[input.project_type] ?? 800);
  const laborCost = input.labor_cost ?? area * (laborRates[input.project_type] ?? 350);
  const transportCost = input.transport_cost ?? Math.round(area * 15);
  const discount = input.discount ?? 0;

  const subtotal = materialCost + laborCost + transportCost;
  const taxableAmount = Math.max(0, subtotal - discount);
  const { gstAmount: tax_amount } = calculateGST(taxableAmount, gstRate);
  const total_amount = Math.round((taxableAmount + tax_amount) * 100) / 100;

  return {
    material_cost: Math.round(materialCost * 100) / 100,
    labor_cost: Math.round(laborCost * 100) / 100,
    transport_cost: Math.round(transportCost * 100) / 100,
    subtotal: Math.round(subtotal * 100) / 100,
    tax_amount,
    discount,
    total_amount,
  };
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function sanitizeUser<T extends Record<string, unknown>>(user: T): Omit<T, 'password_hash'> {
  const { password_hash: _, ...safe } = user;
  return safe;
}

export function pickDefined<T extends Record<string, unknown>>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined)
  ) as Partial<T>;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount);
}

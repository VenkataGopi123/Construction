import { QuotationCalculationInput, QuotationCalculationResult, PaginationParams } from '../types';
declare const CODE_PREFIXES: Record<string, string>;
export declare function generateCode(prefix: keyof typeof CODE_PREFIXES): string;
export declare function generateSku(categoryCode: string): string;
export declare function parsePagination(query: {
    page?: string;
    limit?: string;
}): PaginationParams;
export declare function buildPaginatedResponse<T>(data: T[], total: number, params: PaginationParams): {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
};
export declare function calculateGST(amount: number, rate?: number): {
    gstAmount: number;
    total: number;
};
export declare function calculateQuotation(input: QuotationCalculationInput): QuotationCalculationResult;
export declare function hashToken(token: string): string;
export declare function sanitizeUser<T extends Record<string, unknown>>(user: T): Omit<T, 'password_hash'>;
export declare function pickDefined<T extends Record<string, unknown>>(obj: T): Partial<T>;
export declare function formatCurrency(amount: number): string;
export {};
//# sourceMappingURL=helpers.d.ts.map
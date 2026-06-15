export type UserRole = 'super_admin' | 'project_manager' | 'material_manager' | 'supplier' | 'customer';
export type ProjectType = 'residential' | 'commercial' | 'road' | 'bridge' | 'industrial' | 'interior_design';
export type ProjectStatus = 'planning' | 'approved' | 'in_progress' | 'delayed' | 'completed';
export type WorkerSkill = 'mason' | 'electrician' | 'painter' | 'carpenter' | 'welder' | 'engineer';
export type PaymentMethod = 'upi' | 'credit_card' | 'debit_card' | 'net_banking' | 'cash' | 'cheque';
export type PaymentStatus = 'pending' | 'partial' | 'paid' | 'overdue' | 'cancelled';
export type QuotationStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
export type DocumentType = 'agreement' | 'site_photo' | 'bill' | 'project_doc' | 'blueprint' | 'contract' | 'invoice';
export type NotificationChannel = 'email' | 'sms' | 'whatsapp' | 'in_app';
export interface User {
    id: string;
    email: string;
    password_hash?: string | null;
    google_id?: string | null;
    first_name: string;
    last_name?: string | null;
    phone?: string | null;
    avatar_url?: string | null;
    role: UserRole;
    branch_id?: string | null;
    is_active: boolean;
    is_verified: boolean;
    last_login?: Date | null;
    created_at: Date;
    updated_at: Date;
}
export interface AuthUser {
    id: string;
    email: string;
    first_name: string;
    last_name?: string | null;
    role: UserRole;
    branch_id?: string | null;
}
export interface PaginationParams {
    page: number;
    limit: number;
    offset: number;
}
export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
export interface ApiResponse<T = unknown> {
    success: boolean;
    message?: string;
    data?: T;
    error?: string;
}
export interface JwtPayload {
    sub: string;
    email: string;
    role: UserRole;
    type: 'access' | 'refresh';
}
export interface QuotationCalculationInput {
    project_type: ProjectType;
    area_sqft: number;
    material_cost?: number;
    labor_cost?: number;
    transport_cost?: number;
    discount?: number;
    gst_rate?: number;
}
export interface QuotationCalculationResult {
    material_cost: number;
    labor_cost: number;
    transport_cost: number;
    subtotal: number;
    tax_amount: number;
    discount: number;
    total_amount: number;
}
export interface ChartDataPoint {
    label: string;
    value: number;
}
export interface AuditContext {
    userId?: string;
    action: string;
    entityType?: string;
    entityId?: string;
    oldValues?: Record<string, unknown>;
    newValues?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
}
export declare class AppError extends Error {
    statusCode: number;
    isOperational: boolean;
    constructor(message: string, statusCode?: number, isOperational?: boolean);
}
//# sourceMappingURL=index.d.ts.map
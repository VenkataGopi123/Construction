interface InvoiceItem {
    description: string;
    quantity: number;
    unit_price: number;
    total_price: number;
}
interface InvoiceData {
    invoice_number: string;
    customer_name: string;
    customer_address?: string;
    customer_gst?: string;
    project_name?: string;
    items: InvoiceItem[];
    subtotal: number;
    gst_rate: number;
    gst_amount: number;
    total_amount: number;
    due_date?: string;
    notes?: string;
}
declare class PDFService {
    private outputDir;
    constructor();
    generateInvoice(data: InvoiceData): Promise<{
        filePath: string;
        filename: string;
    }>;
    generateQuotation(data: {
        quotation_number: string;
        customer_name: string;
        project_type: string;
        area_sqft: number;
        material_cost: number;
        labor_cost: number;
        transport_cost: number;
        tax_amount: number;
        discount: number;
        total_amount: number;
        valid_until?: string;
    }): Promise<{
        filePath: string;
        filename: string;
    }>;
}
export declare const pdfService: PDFService;
export {};
//# sourceMappingURL=pdf.service.d.ts.map
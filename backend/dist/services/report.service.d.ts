declare class ReportService {
    private outputDir;
    constructor();
    generateProjectReport(format?: 'pdf' | 'excel'): Promise<{
        filePath: string;
        filename: string;
    }>;
    generateInventoryReport(format?: 'pdf' | 'excel'): Promise<{
        filePath: string;
        filename: string;
    }>;
    generateFinancialReport(format?: 'pdf' | 'excel'): Promise<{
        filePath: string;
        filename: string;
    }>;
    private generateProjectsPDF;
    private generateProjectsExcel;
    private generateInventoryPDF;
    private generateInventoryExcel;
    private generateFinancialPDF;
    private generateFinancialExcel;
}
export declare const reportService: ReportService;
export {};
//# sourceMappingURL=report.service.d.ts.map
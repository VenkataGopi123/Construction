"use client";

import { Download, FileBarChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { DataPage } from "@/components/dashboard/data-page";
import { mockRevenueData } from "@/lib/mock-data";

const reportTypes = [
  { title: "Financial Summary", desc: "Revenue, expenses, and profit analysis", period: "Monthly" },
  { title: "Project Status Report", desc: "Progress, milestones, and delays", period: "Weekly" },
  { title: "Material Inventory", desc: "Stock levels, usage, and reorder needs", period: "Daily" },
  { title: "Workforce Report", desc: "Attendance, assignments, and productivity", period: "Weekly" },
];

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Reports</h2>
      <div className="grid md:grid-cols-2 gap-4">
        {reportTypes.map((report) => (
          <Card key={report.title}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileBarChart className="h-5 w-5 text-primary" /> {report.title}
              </CardTitle>
              <CardDescription>{report.desc}</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">{report.period} report</span>
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" /> Generate
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      <DataPage endpoint="/reports/revenue" fallback={mockRevenueData}>
        {(data) => <RevenueChart data={data} />}
      </DataPage>
    </div>
  );
}

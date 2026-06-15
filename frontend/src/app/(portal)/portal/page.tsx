"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { DataPage } from "@/components/dashboard/data-page";
import { mockProjects, mockQuotations, mockPayments } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";

const portalData = {
  projects: mockProjects.slice(0, 3),
  quotations: mockQuotations,
  payments: mockPayments,
};

export default function PortalPage() {
  return (
    <DataPage endpoint="/portal/overview" fallback={portalData}>
      {(data) => (
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Welcome to Your Portal</h1>
            <p className="text-muted-foreground">Track your projects, quotations, and invoices.</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Active Projects</CardTitle></CardHeader>
              <CardContent><p className="text-3xl font-bold">{data.projects?.length || 0}</p></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Pending Quotations</CardTitle></CardHeader>
              <CardContent><p className="text-3xl font-bold">{data.quotations?.filter((q: { status: string }) => q.status === "pending").length || 0}</p></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Outstanding Payments</CardTitle></CardHeader>
              <CardContent><p className="text-3xl font-bold">{formatCurrency(data.payments?.filter((p: { status: string }) => p.status !== "paid").reduce((sum: number, p: { amount: number }) => sum + p.amount, 0) || 0)}</p></CardContent>
            </Card>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-4">Project Progress</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {(data.projects || []).map((p: { id: string; name: string; progress?: number }) => (
                <Card key={p.id}>
                  <CardContent className="pt-6 space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">{p.name}</span>
                      <span className="text-sm">{p.progress || 0}%</span>
                    </div>
                    <Progress value={p.progress || 0} />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}
    </DataPage>
  );
}

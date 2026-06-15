"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { DataPage } from "@/components/dashboard/data-page";
import { mockProjects } from "@/lib/mock-data";
import { formatCurrency, formatDate } from "@/lib/utils";
import { PROJECT_STATUSES } from "@/lib/constants";

export default function PortalProjectsPage() {
  return (
    <DataPage endpoint="/portal/projects" fallback={mockProjects}>
      {(projects) => (
        <div className="space-y-6">
          <h1 className="text-2xl font-bold">Your Projects</h1>
          <div className="grid md:grid-cols-2 gap-4">
            {projects.map((p) => {
              const status = PROJECT_STATUSES.find((s) => s.value === p.status);
              return (
                <Card key={p.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle>{p.name}</CardTitle>
                      <Badge variant="secondary">{status?.label}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span><span>{p.progress}%</span>
                    </div>
                    <Progress value={p.progress} />
                    <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                      <span>Budget: {formatCurrency(p.budget)}</span>
                      <span>Due: {formatDate(p.endDate)}</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </DataPage>
  );
}

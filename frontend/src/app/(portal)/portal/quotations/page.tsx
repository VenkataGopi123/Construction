"use client";

import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DataPage } from "@/components/dashboard/data-page";
import { mockQuotations } from "@/lib/mock-data";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function PortalQuotationsPage() {
  return (
    <DataPage endpoint="/portal/quotations" fallback={mockQuotations}>
      {(quotations) => (
        <div className="space-y-6">
          <h1 className="text-2xl font-bold">Your Quotations</h1>
          <div className="rounded-md border bg-background">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quotations.map((q) => (
                  <TableRow key={q.id}>
                    <TableCell className="font-medium">{q.project}</TableCell>
                    <TableCell>{formatCurrency(q.amount)}</TableCell>
                    <TableCell>
                      <Badge variant={q.status === "approved" ? "success" : q.status === "rejected" ? "destructive" : "warning"}>
                        {q.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(q.date)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </DataPage>
  );
}

"use client";

import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DataPage } from "@/components/dashboard/data-page";
import { mockQuotations } from "@/lib/mock-data";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function QuotationsPage() {
  return (
    <DataPage endpoint="/quotations" fallback={mockQuotations}>
      {(quotations) => (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Quotations</h2>
            <Button className="gap-2"><Plus className="h-4 w-4" /> New Quotation</Button>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quotations.map((q) => (
                  <TableRow key={q.id}>
                    <TableCell className="font-medium">{q.project}</TableCell>
                    <TableCell>{q.client}</TableCell>
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

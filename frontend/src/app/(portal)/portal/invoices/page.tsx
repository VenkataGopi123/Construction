"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DataPage } from "@/components/dashboard/data-page";
import { mockPayments } from "@/lib/mock-data";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Download } from "lucide-react";

export default function PortalInvoicesPage() {
  return (
    <DataPage endpoint="/portal/invoices" fallback={mockPayments}>
      {(invoices) => (
        <div className="space-y-6">
          <h1 className="text-2xl font-bold">Your Invoices</h1>
          <div className="rounded-md border bg-background">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell className="font-medium">{inv.project}</TableCell>
                    <TableCell>{formatCurrency(inv.amount)}</TableCell>
                    <TableCell>
                      <Badge variant={inv.status === "paid" ? "success" : "warning"}>{inv.status}</Badge>
                    </TableCell>
                    <TableCell>{formatDate(inv.dueDate)}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon"><Download className="h-4 w-4" /></Button>
                    </TableCell>
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

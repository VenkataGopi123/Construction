"use client";

import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DataPage } from "@/components/dashboard/data-page";
import { mockPayments } from "@/lib/mock-data";
import { formatCurrency, formatDate } from "@/lib/utils";

const statusVariant: Record<string, "success" | "warning" | "secondary" | "destructive"> = {
  paid: "success", pending: "warning", partial: "secondary", overdue: "destructive",
};

export default function PaymentsPage() {
  return (
    <DataPage endpoint="/payments" fallback={mockPayments}>
      {(payments) => (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Payments</h2>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Paid Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.project}</TableCell>
                    <TableCell>{p.client}</TableCell>
                    <TableCell>{formatCurrency(p.amount)}</TableCell>
                    <TableCell><Badge variant={statusVariant[p.status]}>{p.status}</Badge></TableCell>
                    <TableCell>{formatDate(p.dueDate)}</TableCell>
                    <TableCell>{p.paidDate ? formatDate(p.paidDate) : "—"}</TableCell>
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

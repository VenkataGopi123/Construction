"use client";

import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DataPage } from "@/components/dashboard/data-page";
import { mockWorkers } from "@/lib/mock-data";

export default function WorkersPage() {
  return (
    <DataPage endpoint="/workers" fallback={mockWorkers}>
      {(workers) => (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Workers</h2>
            <Button className="gap-2"><Plus className="h-4 w-4" /> Add Worker</Button>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workers.map((w) => (
                  <TableRow key={w.id}>
                    <TableCell className="font-medium">{w.name}</TableCell>
                    <TableCell>{w.role}</TableCell>
                    <TableCell>{w.project}</TableCell>
                    <TableCell>{w.phone}</TableCell>
                    <TableCell>
                      <Badge variant={w.status === "active" ? "success" : "warning"}>
                        {w.status === "active" ? "Active" : "On Leave"}
                      </Badge>
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

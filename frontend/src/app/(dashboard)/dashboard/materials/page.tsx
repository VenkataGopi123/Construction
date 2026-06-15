"use client";

import { useDataStore } from "@/lib/data-store";
import { StockAlertBanner } from "@/components/materials/stock-alert-banner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle, Edit, Trash } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function MaterialsPage() {
  const materials = useDataStore((state) => state.materials);
  const deleteMaterial = useDataStore((state) => state.deleteMaterial);
  const router = useRouter();

  // Adapt the store materials to match what StockAlertBanner expects
  // The banner expects: { id, name, quantity, minStock }
  const alerts = materials
    .filter((m) => m.status === "low")
    .map(m => ({ id: m.id, name: m.name, quantity: m.stock, minStock: m.stock + 10 }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Materials</h2>
        <Button asChild>
          <Link href="/materials/new">Add Material</Link>
        </Button>
      </div>
      {alerts.length > 0 && <StockAlertBanner alerts={alerts as any} />}
      
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-24 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {materials.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No materials found. Add some from the dashboard or homepage!
                </TableCell>
              </TableRow>
            ) : (
              materials.map((m) => {
                const isLow = m.status === "low";
                return (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium">
                      <Link href={`/materials/${m.id}`} className="hover:underline">
                        {m.name}
                      </Link>
                    </TableCell>
                    <TableCell>{m.stock}</TableCell>
                    <TableCell>{m.unit}</TableCell>
                    <TableCell>
                      <Badge variant={isLow ? "destructive" : "default"} className={!isLow ? "bg-green-500/10 text-green-700 hover:bg-green-500/20" : ""}>
                        {isLow && <AlertTriangle className="h-3 w-3 mr-1" />}
                        {isLow ? "Low Stock" : "In Stock"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right flex justify-end gap-2">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/materials/${m.id}/edit`}>
                          <Edit className="h-4 w-4 text-muted-foreground" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => {
                        if (confirm("Are you sure you want to delete this?")) {
                          deleteMaterial(m.id);
                        }
                      }}>
                        <Trash className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { AlertTriangle, Edit, Plus } from "lucide-react";

interface Material {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  minStock: number;
  price: number;
  supplier: string;
}

interface MaterialTableProps {
  materials: Material[];
  onAdd?: () => void;
}

export function MaterialTable({ materials, onAdd }: MaterialTableProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Material Inventory</h3>
        <Button size="sm" className="gap-2" onClick={onAdd}>
          <Plus className="h-4 w-4" /> Add Material
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Min Stock</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {materials.map((m) => {
              const isLow = m.quantity < m.minStock;
              return (
                <TableRow key={m.id}>
                  <TableCell className="font-medium">{m.name}</TableCell>
                  <TableCell>{m.category}</TableCell>
                  <TableCell>{m.quantity} {m.unit}</TableCell>
                  <TableCell>{m.minStock} {m.unit}</TableCell>
                  <TableCell>${m.price.toFixed(2)}</TableCell>
                  <TableCell>{m.supplier}</TableCell>
                  <TableCell>
                    <Badge variant={isLow ? "warning" : "success"}>
                      {isLow && <AlertTriangle className="h-3 w-3 mr-1" />}
                      {isLow ? "Low Stock" : "In Stock"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

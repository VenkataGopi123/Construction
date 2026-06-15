"use client";

import { Plus, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataPage } from "@/components/dashboard/data-page";
import { mockSuppliers } from "@/lib/mock-data";

export default function SuppliersPage() {
  return (
    <DataPage endpoint="/suppliers" fallback={mockSuppliers}>
      {(suppliers) => (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Suppliers</h2>
            <Button className="gap-2"><Plus className="h-4 w-4" /> Add Supplier</Button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {suppliers.map((s) => (
              <Card key={s.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{s.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{s.contact}</p>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p>{s.email}</p>
                  <p>{s.phone}</p>
                  <p>{s.materials} materials supplied</p>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-primary text-primary" />
                    <span className="font-medium">{s.rating}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </DataPage>
  );
}

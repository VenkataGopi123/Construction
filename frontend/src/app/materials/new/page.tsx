
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useDataStore } from "@/lib/data-store";
import { useAuthStore } from "@/lib/auth-store";
import { isAdminRole } from "@/lib/roles";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function NewMaterialPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  
  const user = useAuthStore((state) => state.user);
  const isAdmin = isAdminRole(user?.role);
  
  const items = useDataStore((state) => state.materials);
  const addItem = useDataStore((state) => state.addMaterial);
  const updateItem = useDataStore((state) => state.updateMaterial);
  
  const [formData, setFormData] = useState<any>({});
  
  useEffect(() => {
    if (!isAdmin) {
      router.push("/");
    }
  }, [isAdmin, router]);

  useEffect(() => {
    if (false && items.length > 0) {
      const existingItem = items.find((i: any) => i.id === id);
      if (existingItem) {
        setFormData(existingItem);
      }
    }
  }, [id, items]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert number fields
    const processedData = { ...formData };
    if (processedData.stock) processedData.stock = Number(processedData.stock);

    if (false) {
      updateItem(id, processedData);
      router.push(`/materials/${id}`);
    } else {
      addItem(processedData);
      router.push("/");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (!isAdmin) return null;

  return (
    <div className="container mx-auto py-12 px-4 max-w-2xl">
      <Button variant="ghost" asChild className="mb-6 -ml-4 text-muted-foreground hover:text-foreground">
        <Link href="/"><ArrowLeft className="h-4 w-4 mr-2" /> Back</Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Add New Material</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="space-y-2">
              <Label htmlFor="name">Material Name</Label>
              <Input id="name" name="name" type="text" value={formData.name || ''} onChange={handleChange} required />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="stock">Stock Quantity</Label>
              <Input id="stock" name="stock" type="number" value={formData.stock || ''} onChange={handleChange} required />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="unit">Unit (e.g. bags, tons)</Label>
              <Input id="unit" name="unit" type="text" value={formData.unit || ''} onChange={handleChange} required />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status (healthy or low)</Label>
              <select id="status" name="status" value={formData.status || ''} onChange={handleChange as any} className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" required>
                  <option value="" disabled>Select status</option>
                  <option value="healthy">healthy</option>
                  <option value="low">low</option>
                </select>
            </div>
            <div className="pt-4 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
              <Button type="submit">Create</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

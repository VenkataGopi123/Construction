
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

export default function EditServicePage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  
  const user = useAuthStore((state) => state.user);
  const isAdmin = isAdminRole(user?.role);
  
  const items = useDataStore((state) => state.services);
  const addItem = useDataStore((state) => state.addService);
  const updateItem = useDataStore((state) => state.updateService);
  
  const [formData, setFormData] = useState<any>({});
  
  useEffect(() => {
    if (!isAdmin) {
      router.push("/");
    }
  }, [isAdmin, router]);

  useEffect(() => {
    if (true && items.length > 0) {
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
    

    if (true) {
      updateItem(id, processedData);
      router.push(`/services/${id}`);
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
        <Link href=`/services/${id}`><ArrowLeft className="h-4 w-4 mr-2" /> Back</Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Edit Service</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="space-y-2">
              <Label htmlFor="title">Service Title</Label>
              <Input id="title" name="title" type="text" value={formData.title || ''} onChange={handleChange} required />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Short Description</Label>
              <Input id="description" name="description" type="text" value={formData.description || ''} onChange={handleChange} required />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="details">Full Details</Label>
              <Textarea id="details" name="details" value={formData.details || ''} onChange={handleChange} required />
            </div>
            <div className="pt-4 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

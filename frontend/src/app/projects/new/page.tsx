
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

export default function NewProjectPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  
  const user = useAuthStore((state) => state.user);
  const isAdmin = isAdminRole(user?.role);
  
  const items = useDataStore((state) => state.projects);
  const addItem = useDataStore((state) => state.addProject);
  const updateItem = useDataStore((state) => state.updateProject);
  
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
    if (processedData.progress) processedData.progress = Number(processedData.progress);

    if (false) {
      updateItem(id, processedData);
      router.push(`/projects/${id}`);
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
          <CardTitle>Add New Project</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="space-y-2">
              <Label htmlFor="name">Project Name</Label>
              <Input id="name" name="name" type="text" value={formData.name || ''} onChange={handleChange} required />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">Type (e.g. Commercial, Residential)</Label>
              <Input id="type" name="type" type="text" value={formData.type || ''} onChange={handleChange} required />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="progress">Progress (%)</Label>
              <Input id="progress" name="progress" type="number" value={formData.progress || ''} onChange={handleChange} required />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="budget">Budget (e.g. $2.5M)</Label>
              <Input id="budget" name="budget" type="text" value={formData.budget || ''} onChange={handleChange} required />
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

const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src', 'app');

const templates = {
  services: {
    name: 'Service',
    fields: [
      { name: 'title', label: 'Service Title', type: 'text' },
      { name: 'description', label: 'Short Description', type: 'text' },
      { name: 'details', label: 'Full Details', type: 'textarea' },
    ],
    stateName: 'services',
  },
  projects: {
    name: 'Project',
    fields: [
      { name: 'name', label: 'Project Name', type: 'text' },
      { name: 'type', label: 'Type (e.g. Commercial, Residential)', type: 'text' },
      { name: 'progress', label: 'Progress (%)', type: 'number' },
      { name: 'budget', label: 'Budget (e.g. $2.5M)', type: 'text' },
    ],
    stateName: 'projects',
  },
  materials: {
    name: 'Material',
    fields: [
      { name: 'name', label: 'Material Name', type: 'text' },
      { name: 'stock', label: 'Stock Quantity', type: 'number' },
      { name: 'unit', label: 'Unit (e.g. bags, tons)', type: 'text' },
      { name: 'status', label: 'Status (healthy or low)', type: 'select', options: ['healthy', 'low'] },
    ],
    stateName: 'materials',
  }
};

const getFormPage = (feature, isEdit) => `
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

export default function ${isEdit ? 'Edit' : 'New'}${templates[feature].name}Page() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  
  const user = useAuthStore((state) => state.user);
  const isAdmin = isAdminRole(user?.role);
  
  const items = useDataStore((state) => state.${templates[feature].stateName});
  const addItem = useDataStore((state) => state.add${templates[feature].name});
  const updateItem = useDataStore((state) => state.update${templates[feature].name});
  
  const [formData, setFormData] = useState<any>({});
  
  useEffect(() => {
    if (!isAdmin) {
      router.push("/");
    }
  }, [isAdmin, router]);

  useEffect(() => {
    if (${isEdit} && items.length > 0) {
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
    ${templates[feature].fields.filter(f => f.type === 'number').map(f => `if (processedData.${f.name}) processedData.${f.name} = Number(processedData.${f.name});`).join('\n    ')}

    if (${isEdit}) {
      updateItem(id, processedData);
      router.push(\`/${feature}/\${id}\`);
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
        <Link href=${isEdit ? `\`/${feature}/\${id}\`` : '"/"'}><ArrowLeft className="h-4 w-4 mr-2" /> Back</Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>${isEdit ? 'Edit' : 'Add New'} ${templates[feature].name}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            ${templates[feature].fields.map(f => `
            <div className="space-y-2">
              <Label htmlFor="${f.name}">${f.label}</Label>
              ${f.type === 'textarea' ? 
                `<Textarea id="${f.name}" name="${f.name}" value={formData.${f.name} || ''} onChange={handleChange} required />` : 
                f.type === 'select' ?
                `<select id="${f.name}" name="${f.name}" value={formData.${f.name} || ''} onChange={handleChange as any} className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" required>
                  <option value="" disabled>Select status</option>
                  ${f.options.map(opt => `<option value="${opt}">${opt}</option>`).join('\n                  ')}
                </select>` :
                `<Input id="${f.name}" name="${f.name}" type="${f.type}" value={formData.${f.name} || ''} onChange={handleChange} required />`
              }
            </div>`).join('\n            ')}
            <div className="pt-4 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
              <Button type="submit">${isEdit ? 'Save Changes' : 'Create'}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
`;

const getDetailsPage = (feature) => `
"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit, Trash } from "lucide-react";
import { useDataStore } from "@/lib/data-store";
import { useAuthStore } from "@/lib/auth-store";
import { isAdminRole } from "@/lib/roles";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ${templates[feature].name}DetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  
  const user = useAuthStore((state) => state.user);
  const isAdmin = isAdminRole(user?.role);
  
  const items = useDataStore((state) => state.${templates[feature].stateName});
  const deleteItem = useDataStore((state) => state.delete${templates[feature].name});
  const item = items.find((i: any) => i.id === id);

  if (!item) {
    return (
      <div className="container mx-auto py-20 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">${templates[feature].name} not found</h1>
        <Button asChild><Link href="/">Go Home</Link></Button>
      </div>
    );
  }

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this ${templates[feature].name.toLowerCase()}?")) {
      deleteItem(id);
      router.push("/");
    }
  };

  return (
    <div className="container mx-auto py-12 px-4 max-w-4xl">
      <Button variant="ghost" asChild className="mb-6 -ml-4 text-muted-foreground hover:text-foreground">
        <Link href="/"><ArrowLeft className="h-4 w-4 mr-2" /> Back</Link>
      </Button>

      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">{item.title || item.name}</h1>
          <p className="text-xl text-muted-foreground">
            {item.description || (item.type && \`Type: \${item.type}\`) || (item.stock !== undefined && \`Stock: \${item.stock} \${item.unit}\`)}
          </p>
        </div>
        
        {isAdmin && (
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href={\`/${feature}/\${id}/edit\`}><Edit className="h-4 w-4 mr-2" /> Edit</Link>
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash className="h-4 w-4 mr-2" /> Delete
            </Button>
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(item).filter(([k]) => k !== 'id' && k !== 'title' && k !== 'name' && k !== 'description' && k !== 'details').map(([key, val]) => (
              <div key={key} className="p-4 border rounded-lg bg-muted/30">
                <p className="text-sm text-muted-foreground capitalize">{key}</p>
                <p className="font-semibold text-lg">{String(val)}</p>
              </div>
            ))}
          </div>
          {item.details && (
            <div className="mt-8 prose dark:prose-invert max-w-none">
              <h3 className="text-lg font-semibold mb-2">Description / Notes</h3>
              <div className="whitespace-pre-wrap">{item.details}</div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
`;

Object.keys(templates).forEach(feature => {
  const featDir = path.join(srcDir, feature);
  const newDir = path.join(featDir, 'new');
  const idDir = path.join(featDir, '[id]');
  const editDir = path.join(idDir, 'edit');

  fs.mkdirSync(newDir, { recursive: true });
  fs.mkdirSync(editDir, { recursive: true });

  fs.writeFileSync(path.join(newDir, 'page.tsx'), getFormPage(feature, false));
  fs.writeFileSync(path.join(idDir, 'page.tsx'), getDetailsPage(feature));
  fs.writeFileSync(path.join(editDir, 'page.tsx'), getFormPage(feature, true));
});

console.log("Pages generated successfully!");

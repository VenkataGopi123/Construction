
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

export default function ProjectDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  
  const user = useAuthStore((state) => state.user);
  const isAdmin = isAdminRole(user?.role);
  
  const items = useDataStore((state) => state.projects);
  const deleteItem = useDataStore((state) => state.deleteProject);
  const item = items.find((i: any) => i.id === id);

  if (!item) {
    return (
      <div className="container mx-auto py-20 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Project not found</h1>
        <Button asChild><Link href="/">Go Home</Link></Button>
      </div>
    );
  }

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this project?")) {
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
          <h1 className="text-4xl font-bold mb-2">{item.name}</h1>
          <p className="text-xl text-muted-foreground">
            {item.description || (item.type && `Type: ${item.type}`)}
          </p>
        </div>
        
        {isAdmin && (
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href={`/projects/${id}/edit`}><Edit className="h-4 w-4 mr-2" /> Edit</Link>
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
            {Object.entries(item).filter(([k]) => k !== 'id' && k !== 'name' && k !== 'description').map(([key, val]) => (
              <div key={key} className="p-4 border rounded-lg bg-muted/30">
                <p className="text-sm text-muted-foreground capitalize">{key}</p>
                <p className="font-semibold text-lg">{String(val)}</p>
              </div>
            ))}
          </div>
          {item.description && (
            <div className="mt-8 prose dark:prose-invert max-w-none">
              <h3 className="text-lg font-semibold mb-2">Description / Notes</h3>
              <div className="whitespace-pre-wrap">{item.description}</div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

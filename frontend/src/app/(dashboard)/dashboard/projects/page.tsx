"use client";

import { useDataStore } from "@/lib/data-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Edit, Trash } from "lucide-react";
import Link from "next/link";

export default function ProjectsPage() {
  const projects = useDataStore((state) => state.projects);
  const deleteProject = useDataStore((state) => state.deleteProject);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Projects</h2>
        <Button asChild>
          <Link href="/projects/new">Add Project</Link>
        </Button>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Budget</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead className="w-24 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No projects found. Add some from the dashboard or homepage!
                </TableCell>
              </TableRow>
            ) : (
              projects.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">
                    <Link href={`/projects/${p.id}`} className="hover:underline">
                      {p.name}
                    </Link>
                  </TableCell>
                  <TableCell><Badge variant="secondary">{p.type}</Badge></TableCell>
                  <TableCell>{p.budget}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={p.progress} className="w-[60px]" />
                      <span className="text-sm">{p.progress}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right flex justify-end gap-2">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/projects/${p.id}/edit`}>
                        <Edit className="h-4 w-4 text-muted-foreground" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => {
                      if (confirm("Are you sure you want to delete this?")) {
                        deleteProject(p.id);
                      }
                    }}>
                      <Trash className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

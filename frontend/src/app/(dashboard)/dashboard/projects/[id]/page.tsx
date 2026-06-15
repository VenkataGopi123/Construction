"use client";

import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { DataPage } from "@/components/dashboard/data-page";
import { ProjectGantt } from "@/components/projects/project-gantt";
import { ProjectTimeline } from "@/components/projects/project-timeline";
import { ProjectForm } from "@/components/projects/project-form";
import { mockProjects } from "@/lib/mock-data";
import { formatCurrency, formatDate } from "@/lib/utils";
import { PROJECT_STATUSES } from "@/lib/constants";

export default function ProjectDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const fallback = mockProjects.find((p) => p.id === id) || mockProjects[0];

  return (
    <DataPage endpoint={`/projects/${id}`} fallback={fallback}>
      {(project) => {
        const status = PROJECT_STATUSES.find((s) => s.value === project.status);
        return (
          <div className="space-y-6">
            <div className="flex flex-wrap justify-between items-start gap-4">
              <div>
                <h2 className="text-2xl font-bold">{project.name}</h2>
                <p className="text-muted-foreground">{project.client}</p>
              </div>
              <Badge>{status?.label || project.status}</Badge>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Progress", value: `${project.progress}%` },
                { label: "Budget", value: formatCurrency(project.budget) },
                { label: "Start Date", value: formatDate(project.startDate) },
                { label: "End Date", value: formatDate(project.endDate) },
              ].map((item) => (
                <Card key={item.label}>
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground">{item.label}</p>
                    <p className="text-xl font-bold">{item.value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between text-sm mb-2">
                  <span>Overall Progress</span><span>{project.progress}%</span>
                </div>
                <Progress value={project.progress} className="h-3" />
              </CardContent>
            </Card>

            <Tabs defaultValue="gantt">
              <TabsList>
                <TabsTrigger value="gantt">Gantt Chart</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="edit">Edit</TabsTrigger>
              </TabsList>
              <TabsContent value="gantt"><ProjectGantt /></TabsContent>
              <TabsContent value="timeline">
                <Card><CardHeader><CardTitle>Milestones</CardTitle></CardHeader>
                  <CardContent><ProjectTimeline /></CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="edit">
                <Card><CardHeader><CardTitle>Edit Project</CardTitle></CardHeader>
                  <CardContent>
                    <ProjectForm defaultValues={{
                      name: project.name, type: project.type, status: project.status,
                      budget: project.budget, client: project.client,
                      startDate: project.startDate, endDate: project.endDate,
                    }} />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        );
      }}
    </DataPage>
  );
}

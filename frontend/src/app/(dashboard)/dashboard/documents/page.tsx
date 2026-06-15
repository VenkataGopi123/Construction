"use client";

import { FileText, FolderOpen, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DataPage } from "@/components/dashboard/data-page";

const mockDocuments = [
  { id: "1", name: "Skyline Tower Blueprint.pdf", type: "Blueprint", project: "Skyline Tower", size: "4.2 MB", date: "2024-05-10" },
  { id: "2", name: "Safety Compliance Report.docx", type: "Report", project: "Harbor Bridge", size: "1.8 MB", date: "2024-05-08" },
  { id: "3", name: "Material Purchase Order #1247.pdf", type: "Purchase Order", project: "Tech Campus", size: "0.5 MB", date: "2024-05-05" },
  { id: "4", name: "Site Inspection Photos.zip", type: "Photos", project: "Green Valley", size: "28.4 MB", date: "2024-04-30" },
];

export default function DocumentsPage() {
  return (
    <DataPage endpoint="/documents" fallback={mockDocuments}>
      {(documents) => (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Documents</h2>
            <Button className="gap-2"><Upload className="h-4 w-4" /> Upload Document</Button>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {documents.map((doc) => (
              <Card key={doc.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="flex items-center gap-4 pt-6">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    {doc.type === "Blueprint" ? <FileText className="h-6 w-6 text-primary" /> : <FolderOpen className="h-6 w-6 text-primary" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{doc.name}</p>
                    <p className="text-sm text-muted-foreground">{doc.project} · {doc.size}</p>
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

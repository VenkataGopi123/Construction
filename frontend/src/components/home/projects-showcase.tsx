"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Plus, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuthStore } from "@/lib/auth-store";
import { isAdminRole } from "@/lib/roles";
import { useDataStore } from "@/lib/data-store";

export function ProjectsShowcase() {
  const user = useAuthStore((state) => state.user);
  const isAdmin = isAdminRole(user?.role);
  const projects = useDataStore((state) => state.projects);

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Featured Projects</h2>
            <p className="text-muted-foreground">See how we deliver excellence at scale.</p>
          </div>
          <div className="flex gap-4">
            {isAdmin && (
              <Button asChild className="gap-2">
                <Link href="/projects/new">
                  <Plus className="h-4 w-4" /> Add New
                </Link>
              </Button>
            )}
            <Link href="/dashboard/projects">
              <Button variant="outline" className="gap-2 hidden sm:flex">
                View All <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        {projects.length === 0 ? (
          <div className="rounded-lg border border-dashed bg-background p-8 text-center">
            <h3 className="text-lg font-semibold">No projects available</h3>
            <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
              Projects will appear here after an admin adds them.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {projects.slice(0, 3).map((project, i) => (
              <motion.div
                key={project.id}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
              >
                <Card className="overflow-hidden group hover:shadow-lg transition-all h-full flex flex-col">
                  <div className="h-40 bg-gradient-to-br from-primary/20 to-amber-500/10 flex items-center justify-center relative cursor-pointer">
                    <Link href={`/projects/${project.id}`} className="absolute inset-0 z-10" />
                    <span className="text-4xl font-bold text-primary/30 group-hover:scale-110 transition-transform">
                      {project.progress}%
                    </span>
                  </div>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle>
                        <Link href={`/projects/${project.id}`} className="hover:text-primary transition-colors">
                          {project.name}
                        </Link>
                      </CardTitle>
                      <Badge variant="secondary">{project.type}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    <div className="space-y-4 flex-1">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">{project.progress}%</span>
                        </div>
                        <Progress value={project.progress} />
                      </div>
                      <p className="text-sm text-muted-foreground">Budget: {project.budget}</p>
                    </div>
                    <Button variant="outline" asChild className="w-full mt-4">
                      <Link href={`/projects/${project.id}`}>
                        View Details <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

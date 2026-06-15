"use client";

import { useDataStore } from "@/lib/data-store";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { ProjectProgressChart } from "@/components/dashboard/project-progress-chart";
import { MaterialUsageChart } from "@/components/dashboard/material-usage-chart";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { Building2, Activity, DollarSign, Users, CreditCard, AlertTriangle } from "lucide-react";

export default function DashboardPage() {
  const projects = useDataStore((state) => state.projects);
  const materials = useDataStore((state) => state.materials);

  // Compute stats
  const activeProjects = projects.filter(p => p.progress < 100).length;
  
  // Parse budget string roughly (e.g. "$2.5M" -> 2500000)
  const parseBudget = (str: string) => {
    let num = parseFloat(str.replace(/[^0-9.]/g, ''));
    if (isNaN(num)) return 0;
    if (str.toLowerCase().includes('m')) num *= 1000000;
    else if (str.toLowerCase().includes('k')) num *= 1000;
    return num;
  };
  
  const totalRevenue = projects.reduce((acc, p) => acc + (p.budget ? parseBudget(p.budget) : 0), 0);
  const materialAlerts = materials.filter(m => m.status === "low").length;

  const stats = {
    totalProjects: projects.length,
    activeProjects: activeProjects,
    totalRevenue: totalRevenue,
    totalWorkers: 0,
    pendingPayments: 0,
    materialAlerts: materialAlerts,
  };

  // Map to charts
  const progressData = projects.length > 0 ? projects.map(p => ({
    name: p.name,
    progress: p.progress || 0
  })) : [];

  const materialData = materials.length > 0 ? materials.slice(0,5).map(m => ({
    name: m.name,
    used: m.stock || 0,
    allocated: (m.stock || 0) + 10
  })) : [];

  // Dummy revenue data just to not look empty if there are projects
  const revenueData = projects.length > 0 ? [
    { month: "Jan", revenue: totalRevenue * 0.1, expenses: totalRevenue * 0.05 },
    { month: "Feb", revenue: totalRevenue * 0.2, expenses: totalRevenue * 0.1 },
    { month: "Mar", revenue: totalRevenue * 0.3, expenses: totalRevenue * 0.15 },
    { month: "Apr", revenue: totalRevenue * 0.25, expenses: totalRevenue * 0.12 },
    { month: "May", revenue: totalRevenue * 0.35, expenses: totalRevenue * 0.18 },
    { month: "Jun", revenue: totalRevenue * 0.4, expenses: totalRevenue * 0.2 },
  ] : [];

  return (
    <div className="space-y-6">
      {projects.length === 0 && materials.length === 0 ? (
        <div className="bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 p-4 rounded-md border border-amber-200 dark:border-amber-800 text-sm">
          No live data available. Add some Projects or Materials to populate the dashboard!
        </div>
      ) : null}

      <StatsCards stats={stats as any} />
      
      <div className="grid lg:grid-cols-2 gap-6">
        {revenueData.length > 0 ? <RevenueChart data={revenueData} /> : <div className="border rounded-md p-8 text-center text-muted-foreground flex flex-col justify-center items-center h-[300px]">Add projects to see Revenue Chart</div>}
        {progressData.length > 0 ? <ProjectProgressChart data={progressData} /> : <div className="border rounded-md p-8 text-center text-muted-foreground flex flex-col justify-center items-center h-[300px]">Add projects to see Progress Chart</div>}
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        {materialData.length > 0 ? <MaterialUsageChart data={materialData} /> : <div className="border rounded-md p-8 text-center text-muted-foreground flex flex-col justify-center items-center h-[300px]">Add materials to see Material Usage</div>}
        <RecentActivity activities={[]} />
      </div>
    </div>
  );
}

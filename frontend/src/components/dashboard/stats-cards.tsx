"use client";

import { motion } from "framer-motion";
import { AlertTriangle, Building2, CreditCard, HardHat } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

interface StatsCardsProps {
  stats: {
    totalProjects: number;
    activeProjects: number;
    totalRevenue: number;
    pendingPayments: number;
    totalWorkers: number;
    materialAlerts: number;
  };
}

const cards = [
  { key: "totalProjects" as const, label: "Total Projects", icon: Building2, format: (v: number) => v.toString() },
  { key: "activeProjects" as const, label: "Active Projects", icon: Building2, format: (v: number) => v.toString() },
  { key: "totalRevenue" as const, label: "Total Revenue", icon: CreditCard, format: formatCurrency },
  { key: "totalWorkers" as const, label: "Workers", icon: HardHat, format: (v: number) => v.toString() },
  { key: "pendingPayments" as const, label: "Pending Payments", icon: CreditCard, format: formatCurrency },
  { key: "materialAlerts" as const, label: "Material Alerts", icon: AlertTriangle, format: (v: number) => v.toString() },
];

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {cards.map((card, i) => (
        <motion.div
          key={card.key}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{card.label}</CardTitle>
              <card.icon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.format(stats[card.key])}</div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

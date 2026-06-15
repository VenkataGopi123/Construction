"use client";

import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Activity {
  id: string;
  action: string;
  project: string;
  time: string;
  type: string;
}

const typeIcons = {
  success: CheckCircle,
  warning: AlertTriangle,
  info: Info,
};

const typeColors = {
  success: "text-green-500",
  warning: "text-amber-500",
  info: "text-blue-500",
};

export function RecentActivity({ activities }: { activities: Activity[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, i) => {
            const Icon = typeIcons[activity.type as keyof typeof typeIcons] || Info;
            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-start gap-3"
              >
                <Icon className={cn("h-5 w-5 mt-0.5 shrink-0", typeColors[activity.type as keyof typeof typeColors])} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{activity.action}</p>
                  <p className="text-xs text-muted-foreground">{activity.project}</p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">{activity.time}</span>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

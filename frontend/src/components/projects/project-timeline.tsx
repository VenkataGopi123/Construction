"use client";

import { motion } from "framer-motion";
import { CheckCircle, Circle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface Milestone {
  id: string;
  title: string;
  date: string;
  status: "completed" | "in_progress" | "pending";
}

const defaultMilestones: Milestone[] = [
  { id: "1", title: "Project Kickoff", date: "Jan 15, 2024", status: "completed" },
  { id: "2", title: "Foundation Complete", date: "Mar 30, 2024", status: "completed" },
  { id: "3", title: "Structural Frame", date: "Jun 15, 2024", status: "in_progress" },
  { id: "4", title: "MEP Installation", date: "Sep 1, 2024", status: "pending" },
  { id: "5", title: "Final Inspection", date: "Dec 15, 2024", status: "pending" },
];

const statusIcons = {
  completed: CheckCircle,
  in_progress: Clock,
  pending: Circle,
};

const statusColors = {
  completed: "text-green-500 border-green-500",
  in_progress: "text-primary border-primary",
  pending: "text-muted-foreground border-muted-foreground",
};

export function ProjectTimeline({ milestones = defaultMilestones }: { milestones?: Milestone[] }) {
  return (
    <div className="relative">
      <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
      <div className="space-y-6">
        {milestones.map((milestone, i) => {
          const Icon = statusIcons[milestone.status];
          return (
            <motion.div
              key={milestone.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-start gap-4 relative"
            >
              <div className={cn(
                "relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 bg-background",
                statusColors[milestone.status]
              )}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 pt-1">
                <p className="font-medium">{milestone.title}</p>
                <p className="text-sm text-muted-foreground">{milestone.date}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

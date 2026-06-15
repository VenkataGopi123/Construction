"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface GanttTask {
  id: string;
  name: string;
  start: number;
  duration: number;
  progress: number;
  color?: string;
}

const defaultTasks: GanttTask[] = [
  { id: "1", name: "Foundation", start: 0, duration: 20, progress: 100 },
  { id: "2", name: "Structural Frame", start: 15, duration: 30, progress: 80 },
  { id: "3", name: "Electrical", start: 35, duration: 15, progress: 45 },
  { id: "4", name: "Plumbing", start: 40, duration: 15, progress: 30 },
  { id: "5", name: "Finishing", start: 50, duration: 25, progress: 10 },
];

export function ProjectGantt({ tasks = defaultTasks }: { tasks?: GanttTask[] }) {
  const totalDays = 75;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Gantt Chart</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {tasks.map((task, i) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-3"
            >
              <span className="w-32 text-sm font-medium truncate shrink-0">{task.name}</span>
              <div className="flex-1 relative h-8 bg-muted rounded">
                <div
                  className="absolute top-1 h-6 rounded bg-primary/20 border border-primary/30"
                  style={{
                    left: `${(task.start / totalDays) * 100}%`,
                    width: `${(task.duration / totalDays) * 100}%`,
                  }}
                >
                  <div
                    className={cn("h-full rounded bg-primary transition-all")}
                    style={{ width: `${task.progress}%` }}
                  />
                </div>
              </div>
              <span className="text-xs text-muted-foreground w-10 text-right">{task.progress}%</span>
            </motion.div>
          ))}
        </div>
        <div className="flex justify-between mt-4 text-xs text-muted-foreground px-32">
          <span>Week 1</span>
          <span>Week 5</span>
          <span>Week 10</span>
        </div>
      </CardContent>
    </Card>
  );
}

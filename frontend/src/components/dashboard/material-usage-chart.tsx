"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface MaterialUsageChartProps {
  data: { name: string; used: number; total: number }[];
}

const COLORS = ["hsl(25, 95%, 53%)", "hsl(35, 90%, 55%)", "hsl(45, 85%, 55%)", "hsl(15, 80%, 50%)", "hsl(5, 75%, 50%)"];

export function MaterialUsageChart({ data }: MaterialUsageChartProps) {
  const chartData = data.map((d) => ({
    name: d.name,
    value: Math.round((d.used / d.total) * 100),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Material Usage</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
              label={({ name, value }) => `${name}: ${value}%`}
            >
              {chartData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => [`${value}%`, "Used"]} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

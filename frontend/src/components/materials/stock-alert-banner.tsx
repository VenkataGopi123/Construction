"use client";

import { motion } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface StockAlert {
  id: string;
  name: string;
  quantity: number;
  minStock: number;
  unit: string;
}

interface StockAlertBannerProps {
  alerts: StockAlert[];
}

export function StockAlertBanner({ alerts }: StockAlertBannerProps) {
  const [dismissed, setDismissed] = useState<string[]>([]);
  const visible = alerts.filter((a) => !dismissed.includes(a.id));

  if (visible.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="font-semibold text-amber-700 dark:text-amber-400">
            {visible.length} Material{visible.length > 1 ? "s" : ""} Below Minimum Stock
          </p>
          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
            {visible.map((alert) => (
              <li key={alert.id} className="flex items-center justify-between">
                <span>{alert.name}: {alert.quantity}/{alert.minStock} {alert.unit}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setDismissed((prev) => [...prev, alert.id])}
                >
                  <X className="h-3 w-3" />
                </Button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
}

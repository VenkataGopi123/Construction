"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  BarChart3, Bot, Building2, CreditCard, FileText, FolderOpen,
  HardHat, Home, LayoutDashboard, Package, Receipt, Settings,
  Truck, UserCog, Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_ITEMS, type Role } from "@/lib/constants";
import { useAuthStore } from "@/lib/auth-store";

const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard, Building2, Users, Package, Truck, HardHat,
  CreditCard, FileText, FolderOpen, BarChart3, UserCog, Bot, Settings, Home, Receipt,
};

interface DashboardSidebarProps {
  collapsed?: boolean;
}

export function DashboardSidebar({ collapsed = false }: DashboardSidebarProps) {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const role = (user?.role || "user") as Role;
  const items = (NAV_ITEMS as Record<string, any>)[role] || NAV_ITEMS.user;

  return (
    <aside className={cn(
      "flex flex-col border-r bg-card h-full transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      <div className="flex h-16 items-center border-b px-4">
        <Building2 className="h-6 w-6 text-primary shrink-0" />
        {!collapsed && (
          <span className="ml-2 font-bold text-sm truncate">
            Harshith Ram <span className="text-primary">Construction</span>
          </span>
        )}
      </div>
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {items.map((item: any) => {
          const Icon = iconMap[item.icon] || LayoutDashboard;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: 2 }}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </motion.div>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

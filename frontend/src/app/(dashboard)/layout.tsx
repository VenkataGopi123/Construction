"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { PageLoader } from "@/components/ui/page-loader";
import { useAuthStore } from "@/lib/auth-store";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, hasHydrated } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && hasHydrated && !isAuthenticated) {
      router.replace("/login");
    }
  }, [mounted, hasHydrated, isAuthenticated, router]);

  if (!mounted || !hasHydrated) {
    return <PageLoader label="Loading dashboard..." />;
  }

  if (!isAuthenticated) {
    return <PageLoader label="Redirecting to login..." />;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="hidden lg:block">
        <DashboardSidebar />
      </div>
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <DashboardSidebar />
        </SheetContent>
      </Sheet>
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader title="Dashboard" onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}

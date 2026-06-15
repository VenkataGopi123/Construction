"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/auth-store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PageLoader } from "@/components/ui/page-loader";

const portalLinks = [
  { href: "/portal", label: "Overview" },
  { href: "/portal/projects", label: "My Projects" },
  { href: "/portal/quotations", label: "Quotations" },
  { href: "/portal/invoices", label: "Invoices" },
];

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, hasHydrated, logout } = useAuthStore();
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
    return <PageLoader label="Loading portal..." />;
  }

  if (!isAuthenticated) {
    return <PageLoader label="Redirecting to login..." />;
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/portal" className="flex items-center gap-2 font-bold">
            <Building2 className="h-6 w-6 text-primary" />
            Customer Portal
          </Link>
          <nav className="hidden md:flex items-center gap-4">
            {portalLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  pathname === link.href ? "text-primary" : "text-muted-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <Button variant="outline" size="sm" onClick={() => { logout(); router.push("/login"); }}>
            Logout
          </Button>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { SafeMotionHeader } from "@/components/motion/safe-motion";
import { Building2, Menu, Moon, Sun, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/auth-store";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/projects", label: "Projects" },
  { href: "/materials", label: "Materials" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuthStore();

  return (
    <SafeMotionHeader
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md"
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <Building2 className="h-7 w-7 text-primary" />
          <span>Harshith Ram <span className="text-primary">Construction</span></span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
          {!user ? (
            <>
              <Link href="/login" className="hidden sm:block">
                <Button variant="ghost" size="sm">Login</Button>
              </Link>
              <Link href="/register" className="hidden sm:block">
                <Button size="sm">Get Started</Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/dashboard" className="hidden sm:block">
                <Button variant="ghost" size="sm">Dashboard</Button>
              </Link>
              <Button size="sm" variant="outline" className="hidden sm:block" onClick={() => logout()}>Logout</Button>
            </>
          )}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      <div className={cn("md:hidden border-t", mobileOpen ? "block" : "hidden")}>
        <nav className="container mx-auto flex flex-col gap-2 p-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="py-2 text-sm font-medium hover:text-primary"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="flex gap-2 pt-2">
            {!user ? (
              <>
                <Link href="/login" className="flex-1"><Button variant="outline" className="w-full">Login</Button></Link>
                <Link href="/register" className="flex-1"><Button className="w-full">Get Started</Button></Link>
              </>
            ) : (
              <>
                <Link href="/dashboard" className="flex-1"><Button variant="outline" className="w-full">Dashboard</Button></Link>
                <Button className="flex-1" onClick={() => logout()}>Logout</Button>
              </>
            )}
          </div>
        </nav>
      </div>
    </SafeMotionHeader>
  );
}

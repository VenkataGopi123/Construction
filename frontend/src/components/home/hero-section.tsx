"use client";

import Link from "next/link";
import { SafeMotionDiv } from "@/components/motion/safe-motion";
import { ArrowRight, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden py-20 lg:py-32">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-amber-500/5" />
      <div className="container mx-auto px-4 relative">
        <div className="max-w-3xl">
          <SafeMotionDiv
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6">
              <Building2 className="h-4 w-4" /> Enterprise Construction ERP
            </span>
            <h1 className="text-4xl lg:text-6xl font-bold tracking-tight mb-6">
              Build Smarter with{" "}
              <span className="text-primary">Harshith Ram Construction</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-lg">
              Streamline projects, manage materials, track workers, and deliver on time.
              The all-in-one platform for modern construction companies.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/register">
                <Button size="lg" className="gap-2">
                  Get Started <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/projects">
                <Button size="lg" variant="outline">View Projects</Button>
              </Link>
            </div>
          </SafeMotionDiv>
        </div>
      </div>
    </section>
  );
}

"use client";

import { motion } from "framer-motion";
import { AlertTriangle, Package, TrendingUp, Truck, Plus, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/lib/auth-store";
import { isAdminRole } from "@/lib/roles";
import { useDataStore } from "@/lib/data-store";

export function MaterialSupplySection() {
  const user = useAuthStore((state) => state.user);
  const isAdmin = isAdminRole(user?.role);
  const materials = useDataStore((state) => state.materials);

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-end mb-12">
          <motion.div
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-left"
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Smart Material Supply</h2>
            <p className="text-muted-foreground max-w-2xl">
              Real-time inventory tracking with automated alerts and supplier integration.
            </p>
          </motion.div>
          {isAdmin && (
            <Button asChild className="gap-2">
              <Link href="/materials/new">
                <Plus className="h-4 w-4" /> Add New
              </Link>
            </Button>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <motion.div
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-2"
          >
            <Card className="h-full">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" /> Live Inventory
                </CardTitle>
                <Link href="/dashboard/materials">
                  <Button variant="ghost" size="sm" className="gap-1">
                    View All <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {materials.length === 0 ? (
                  <div className="py-8 text-center border-t border-dashed mt-2">
                    <p className="text-muted-foreground">No materials in inventory yet.</p>
                  </div>
                ) : (
                  <div className="space-y-3 mt-4">
                    {materials.map((m) => (
                      <Link key={m.id} href={`/materials/${m.id}`} className="block">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                          <div>
                            <p className="font-medium text-foreground">{m.name}</p>
                            <p className="text-sm text-muted-foreground">{m.stock} {m.unit}</p>
                          </div>
                          <Badge variant={m.status === "low" ? "destructive" : "default"} className={m.status === "healthy" ? "bg-green-500/10 text-green-700 hover:bg-green-500/20" : ""}>
                            {m.status === "low" ? (
                              <><AlertTriangle className="h-3 w-3 mr-1" /> Low Stock</>
                            ) : "In Stock"}
                          </Badge>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            {[
              { icon: Truck, title: "Supplier Network", desc: "50+ verified suppliers" },
              { icon: TrendingUp, title: "Cost Savings", desc: "15% avg. reduction" },
              { icon: AlertTriangle, title: "Auto Alerts", desc: "Never run out of stock" },
            ].map((item) => (
              <Card key={item.title}>
                <CardContent className="flex items-center gap-4 pt-6">
                  <item.icon className="h-8 w-8 text-primary shrink-0" />
                  <div>
                    <p className="font-semibold">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

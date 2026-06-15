"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Plus, ArrowRight, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/auth-store";
import { isAdminRole } from "@/lib/roles";
import { useDataStore } from "@/lib/data-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ServicesSection() {
  const user = useAuthStore((state) => state.user);
  const isAdmin = isAdminRole(user?.role);
  const services = useDataStore((state) => state.services);

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-end mb-12">
          <motion.div
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Comprehensive Solutions</h2>
            <p className="text-muted-foreground max-w-2xl">
              Everything you need to manage construction projects from planning to completion.
            </p>
          </motion.div>
          {isAdmin && (
            <Button asChild className="gap-2">
              <Link href="/services/new">
                <Plus className="h-4 w-4" /> Add New
              </Link>
            </Button>
          )}
        </div>

        {services.length === 0 ? (
          <div className="rounded-lg border border-dashed bg-background p-8 text-center">
            <h3 className="text-lg font-semibold">No services available</h3>
            <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
              Services will appear here after an admin adds them.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {services.map((service, i) => (
              <motion.div
                key={service.id}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full flex flex-col hover:shadow-lg transition-all">
                  <CardHeader>
                    <CardTitle>{service.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    <p className="text-muted-foreground mb-4 flex-1 line-clamp-3">
                      {service.description}
                    </p>
                    <div className="flex gap-2 w-full mt-auto">
                      <Button variant="outline" asChild className="flex-1">
                        <Link href={`/services/${service.id}`}>
                          View Details <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                      {isAdmin && (
                        <Button variant="outline" size="icon" onClick={() => {
                          if (confirm("Are you sure you want to delete this service?")) {
                            useDataStore.getState().deleteService(service.id);
                          }
                        }}>
                          <Trash className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

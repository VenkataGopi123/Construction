"use client";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, Target, Users, Award, Trash } from "lucide-react";
import { useDataStore } from "@/lib/data-store";
import { useAuthStore } from "@/lib/auth-store";
import { isAdminRole } from "@/lib/roles";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export default function AboutPage() {
  const team = useDataStore((state) => state.team);
  const deleteTeamMember = useDataStore((state) => state.deleteTeamMember);
  const fetchAll = useDataStore((state) => state.fetchAll);
  
  const user = useAuthStore((state) => state.user);
  const isAdmin = isAdminRole(user?.role);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">About BuildMaster ERP</h1>
          <p className="text-lg text-muted-foreground">
            We empower construction companies with intelligent tools to build faster, safer, and more profitably.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {[
            { icon: Building2, title: "Founded 2018", desc: "Built by construction veterans" },
            { icon: Users, title: "500+ Clients", desc: "Trusted worldwide" },
            { icon: Target, title: "Our Mission", desc: "Digitize construction ops" },
            { icon: Award, title: "Industry Leader", desc: "Top-rated ERP platform" },
          ].map((item) => (
            <Card key={item.title}>
              <CardContent className="pt-6 text-center">
                <item.icon className="h-10 w-10 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Leadership Team</h2>
            <p className="text-muted-foreground">The people behind BuildMaster ERP</p>
          </div>
          
          {(!team || team.length === 0) ? (
            <p className="text-center text-muted-foreground">No team members added yet.</p>
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
              {team.map((member) => (
                <Card key={member.id} className="relative overflow-hidden">
                  <CardContent className="pt-6 text-center flex flex-col items-center">
                    {isAdmin && (
                      <Button 
                        variant="destructive" 
                        size="icon" 
                        className="absolute top-2 right-2 h-8 w-8"
                        onClick={() => {
                          if (confirm("Are you sure you want to remove this team member?")) {
                            deleteTeamMember(member.id);
                          }
                        }}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    )}
                    <div className="w-24 h-24 rounded-full bg-muted mb-4 mx-auto overflow-hidden">
                      {member.image_url ? (
                        <img src={member.image_url} alt={member.name} className="w-full h-full object-cover" />
                      ) : (
                        <Users className="w-12 h-12 m-6 text-muted-foreground" />
                      )}
                    </div>
                    <h3 className="font-bold text-xl">{member.name}</h3>
                    <p className="text-primary font-medium mb-2">{member.role}</p>
                    {member.description && <p className="text-sm text-muted-foreground mb-4">{member.description}</p>}
                    <div className="text-sm text-muted-foreground space-y-1">
                      {member.email && <p>{member.email}</p>}
                      {member.phone && <p>{member.phone}</p>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="max-w-3xl mx-auto prose dark:prose-invert">
          <p className="text-muted-foreground leading-relaxed text-center">
            BuildMaster ERP was born from the frustration of managing complex construction projects with spreadsheets
            and disconnected tools. Our platform unifies project management, material tracking, workforce scheduling,
            financial operations, and AI-powered insights into a single enterprise-grade solution.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}

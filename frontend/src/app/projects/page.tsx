import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ProjectsShowcase } from "@/components/home/projects-showcase";

export default function ProjectsPage() {
  return (
    <>
      <Navbar />
      <main>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl font-bold mb-4">Our Projects</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore our portfolio of successful construction projects across residential, commercial, and infrastructure sectors.
          </p>
        </div>
        <ProjectsShowcase />
      </main>
      <Footer />
    </>
  );
}

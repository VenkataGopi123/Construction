import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/home/hero-section";
import { ServicesSection } from "@/components/home/services-section";
import { ProjectsShowcase } from "@/components/home/projects-showcase";
import { MaterialSupplySection } from "@/components/home/material-supply-section";
import { ContactSection } from "@/components/home/contact-section";
export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <ServicesSection />
        <ProjectsShowcase />
        <MaterialSupplySection />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}

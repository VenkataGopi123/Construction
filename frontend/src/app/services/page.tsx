import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ServicesSection } from "@/components/home/services-section";
import { MaterialSupplySection } from "@/components/home/material-supply-section";

export default function ServicesPage() {
  return (
    <>
      <Navbar />
      <main>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl font-bold mb-4">Our Services</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            End-to-end construction management solutions tailored for your business.
          </p>
        </div>
        <ServicesSection />
        <MaterialSupplySection />
      </main>
      <Footer />
    </>
  );
}

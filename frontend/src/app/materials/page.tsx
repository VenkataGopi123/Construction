import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { MaterialSupplySection } from "@/components/home/material-supply-section";

export default function MaterialsPage() {
  return (
    <>
      <Navbar />
      <main>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl font-bold mb-4">Material Inventory</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Browse our full inventory of high-quality construction materials.
          </p>
        </div>
        <MaterialSupplySection />
      </main>
      <Footer />
    </>
  );
}

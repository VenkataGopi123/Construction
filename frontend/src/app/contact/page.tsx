import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ContactSection } from "@/components/home/contact-section";

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main>
        <div className="container mx-auto px-4 pt-16 text-center">
          <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Have questions? We&apos;d love to hear from you.
          </p>
        </div>
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}

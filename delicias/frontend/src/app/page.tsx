import Hero from "@/components/Home/Hero";
import Features from "@/components/Home/Features";
import Nosotros from "@/components/Home/Nosotros";
import VisitUs from "@/components/Home/VisitUs";
import ProductGallery from "@/components/Home/ProductGallery";
import Testimonials from "@/components/Home/Testimonials";
import ContactForm from "@/components/ContactForm";

export default function Home() {
  return (
    <div>
      <Hero />
      <Features />
      <Nosotros />
      <VisitUs />
      <ProductGallery />
      <Testimonials />
      <ContactForm />
    </div>
  );
}

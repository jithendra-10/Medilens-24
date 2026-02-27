import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import HeroSection from "./landing/HeroSection";
import Features from "./landing/Features";
import Testimonials from "./landing/Testimonials";
import FAQ from "./landing/FAQ";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-indigo-500/30">
      <Navbar />
      <main>
        <HeroSection />
        <Features />
        <Testimonials />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}

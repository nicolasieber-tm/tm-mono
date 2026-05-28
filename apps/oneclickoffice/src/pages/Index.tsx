import Hero from "@/components/Hero";
import CtaStep2 from "@/components/CtaStep2";
import CaseStudy from "@/components/CaseStudy";
import FinalCta from "@/components/FinalCta";
import Footer from "@/components/Footer";

const Index = () => (
  <main className="min-h-screen text-foreground" style={{ background: "linear-gradient(180deg, hsl(214 95% 93% / 0.5) 0%, hsl(0 0% 100%) 60%)" }}>
    <Hero />
    <CtaStep2 />
    <CaseStudy />
    <FinalCta />
    <Footer />
  </main>
);

export default Index;

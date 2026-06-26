import Hero from "@/components/landing/Hero";
import DemoShowcase from "@/components/landing/DemoShowcase";
import AhaTransition from "@/components/landing/AhaTransition";
import OptinForm from "@/components/landing/OptinForm";
import Testimonial from "@/components/landing/Testimonial";
import Footer from "@/components/landing/Footer";

// Marketing-Landingpage unter "/". Die laufende Demo (Dashboard / Mobile) wird
// in den folgenden Schritten als geräteabhängiger Frame eingebettet.
const Landing = () => (
  <main
    className="min-h-screen text-foreground"
    style={{
      background:
        "linear-gradient(180deg, hsl(214 95% 93% / 0.5) 0%, hsl(0 0% 100%) 55%)",
    }}
  >
    <Hero />
    <DemoShowcase />
    <AhaTransition />
    <Testimonial />
    <OptinForm />
    <Footer />
  </main>
);

export default Landing;

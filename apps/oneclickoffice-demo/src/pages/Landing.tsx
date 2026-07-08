import Hero from "@/components/landing/Hero";
import DemoShowcase from "@/components/landing/DemoShowcase";
import AhaTransition from "@/components/landing/AhaTransition";
import Testimonial from "@/components/landing/Testimonial";
import OptinForm from "@/components/landing/OptinForm";
import Footer from "@/components/landing/Footer";
import MobileScreenshots from "@/components/landing/MobileScreenshots";
import MobileSteps from "@/components/landing/MobileSteps";
import MobileCaseStudy from "@/components/landing/MobileCaseStudy";
import MobileUsps from "@/components/landing/MobileUsps";
import MobileFaq from "@/components/landing/MobileFaq";
import { useIsMobileViewport } from "@/hooks/useIsMobileViewport";

// Marketing-Landingpage unter "/". Desktop zeigt die interaktive Live-Demo +
// Referenz; Mobile (≤767px) bekommt eine eigene Abfolge: Screenshots des Ablaufs,
// drei Schritte, Praxis-Beispiel und ein Mini-FAQ rund ums Demo-Optin.
const Landing = () => {
  const isMobile = useIsMobileViewport();

  return (
    <main
      className="min-h-screen text-foreground"
      style={{
        background:
          "linear-gradient(180deg, hsl(214 95% 93% / 0.5) 0%, hsl(0 0% 100%) 55%)",
      }}
    >
      <Hero />

      {isMobile ? (
        <>
          <MobileScreenshots />
          <MobileSteps />
          <MobileCaseStudy />
        </>
      ) : (
        <>
          <DemoShowcase />
          <AhaTransition />
          <Testimonial />
        </>
      )}

      {/* Auf Mobile trägt der Formular-Frame die CTA-Botschaft direkt in sich. */}
      <OptinForm mobileLeadCta={isMobile} />

      {isMobile && (
        <>
          <MobileUsps />
          <MobileFaq />
        </>
      )}

      <Footer />
    </main>
  );
};

export default Landing;

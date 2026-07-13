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
//
// Der Hero wird NICHT hier gerendert: Er liegt vorgerendert und statisch in
// #hero-static (ausserhalb von #root, siehe main.tsx/index.html), damit React
// ihn nicht neu malt (LCP). Der obere Blau→Weiss-Verlauf sitzt darum auf
// #hero-static; dieser <main> beginnt direkt mit den Inhalten unter dem Hero.
const Landing = () => {
  const isMobile = useIsMobileViewport();

  return (
    <main className="text-foreground">
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

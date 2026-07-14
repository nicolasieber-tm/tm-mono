import DemoShowcase from "@/components/landing/DemoShowcase";
import AhaTransition from "@/components/landing/AhaTransition";
import Testimonial from "@/components/landing/Testimonial";
import OptinForm from "@/components/landing/OptinForm";
import BookingCta from "@/components/landing/BookingCta";
import Footer from "@/components/landing/Footer";
import MobileDemoPreview from "@/components/landing/MobileDemoPreview";
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
          <MobileDemoPreview />
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

      {/* Mobile: Termin-Buchung (Erstgespräch) statt Opt-in — die Demo lässt sich
          oben direkt testen, der Termin ist die Conversion. Desktop: Opt-in bleibt. */}
      {isMobile ? <BookingCta /> : <OptinForm />}

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

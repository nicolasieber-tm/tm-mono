import { Link } from "react-router-dom";
import { Play } from "lucide-react";
import ScrollReveal from "./ScrollReveal";
import { track } from "@/lib/analytics";

// Interaktiv wirkender Demo-Einstieg direkt unter dem Hero (Mobile): Phone-Mockup
// mit statischem Dashboard-Screenshot + Play-Overlay — dasselbe Muster wie das
// Desktop-DemoShowcase, aber als leichtgewichtiges WebP (~49 KB) statt Live-iframe.
// Bewusst KEIN eingebettetes iframe: das würde das Demo-Bundle in die Landing
// ziehen und die mühsam optimierten Mobile Core Web Vitals (LCP/TTI) gefährden.
// Klick → geführte Tour ab Dashboard (/mobile/dashboard?tour=mobile).
const MobileDemoPreview = () => (
  <section className="section-padding pt-8 pb-4">
    <div className="section-container max-w-[560px] text-center">
      <ScrollReveal>
        <h2 className="headline-h2 mb-3 text-text-primary">Sieh dir die App direkt an.</h2>
        <p className="body-large mx-auto mb-8 max-w-[440px]">
          Eine kurze geführte Tour zeigt dir in unter einer Minute, wie du unterwegs
          Zeiten erfasst, Belege fotografierst und den Überblick behältst.
        </p>
      </ScrollReveal>

      <ScrollReveal delay={0.1}>
        <Link
          to="/mobile/dashboard?tour=mobile"
          onClick={() => track("demo_start", { demo_variant: "mobile", source: "mobile_landing" })}
          aria-label="Geführte Demo starten"
          className="group relative mx-auto block w-full max-w-[300px] rounded-[2.6rem] bg-slate-900 p-2.5 shadow-2xl shadow-slate-400/50"
        >
          <div className="mx-auto mb-2 mt-1 h-1.5 w-16 rounded-full bg-slate-700" />
          <div className="relative overflow-hidden rounded-[1.9rem]">
            <img
              src="/mobile-demo-dashboard.webp"
              alt="OneClick Office Mobile-Dashboard mit Wochenübersicht und heutigen Einträgen"
              width={780}
              height={1688}
              className="block w-full"
            />
            {/* Play-Overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-slate-900/35 backdrop-blur-[1px] transition-colors group-hover:bg-slate-900/45 group-active:bg-slate-900/50">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-2xl transition-transform group-hover:scale-110">
                <Play className="ml-1 h-7 w-7 fill-accent text-accent" />
              </span>
              <span className="rounded-full bg-white/95 px-4 py-1.5 text-sm font-semibold text-text-primary shadow-lg">
                Geführte Demo starten
              </span>
            </div>
          </div>
        </Link>
      </ScrollReveal>

      <ScrollReveal delay={0.15}>
        <p className="mt-5 text-sm text-text-muted">
          Kostenlos · ohne Anmeldung · direkt im Browser
        </p>
      </ScrollReveal>
    </div>
  </section>
);

export default MobileDemoPreview;
